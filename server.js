
require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
app.use(cors());
app.use(express.json({ limit: '10mb' }));

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: process.env.DB_NAME,
  password: process.env.DB_PASSWORD,
  port: process.env.DB_PORT,
});

// Authentication Middleware
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Routes
app.post('/api/login', async (req, res) => {
  const { username, password } = req.body;
  try {
    const result = await pool.query('SELECT * FROM users WHERE username = $1', [username.toLowerCase()]);
    const user = result.rows[0];
    
    if (!user) return res.status(401).json({ message: 'User not found' });
    
    // Simple password check for local demo, replace with bcrypt.compare in prod
    if (password !== user.password) return res.status(401).json({ message: 'Invalid password' });

    const accessToken = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    res.json({ user, token: accessToken });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/readings', authenticateToken, async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM readings ORDER BY timestamp DESC LIMIT 500');
    res.json(result.rows);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.post('/api/readings', authenticateToken, async (req, res) => {
  const { id, targetId, targetType, checkpointName, value, timestamp, userId, facilityId, reason } = req.body;
  try {
    await pool.query(
      'INSERT INTO readings (id, target_id, target_type, checkpoint_name, value, timestamp, user_id, facility_id, reason) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
      [id, targetId, targetType, checkpointName, value, timestamp, userId, facilityId, reason]
    );
    res.status(201).json({ message: 'Reading saved' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));
