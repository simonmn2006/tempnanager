# Gourmetta HACCP System - Ubuntu Deployment Guide

This guide provides steps to install and run the Gourmetta HACCP platform on a local Ubuntu server.

## 1. Prerequisites

Ensure your server is up to date and has the required tools:

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install nodejs npm postgresql postgresql-contrib git -y
```

## 2. Database Setup

1. Login to PostgreSQL:
   ```bash
   sudo -u postgres psql
   ```

2. Create the database and user:
   ```sql
   CREATE DATABASE gourmetta_haccp;
   CREATE USER gourmetta_user WITH ENCRYPTED PASSWORD 'your_secure_password';
   GRANT ALL PRIVILEGES ON DATABASE gourmetta_haccp TO gourmetta_user;
   \q
   ```

3. Initialize the schema using the provided `init.sql`:
   ```bash
   psql -h localhost -U gourmetta_user -d gourmetta_haccp -f init.sql
   ```

## 3. Application Installation

1. Clone the repository:
   ```bash
   git clone <your-repo-url>
   cd gourmetta-haccp-system
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure Environment Variables:
   ```bash
   cp .env.example .env
   nano .env
   ```
   *Update the DB_PASSWORD and JWT_SECRET.*

## 4. Run the Application

For production, it is recommended to use PM2 to keep the process alive:

```bash
sudo npm install -g pm2
pm2 start server.js --name gourmetta-backend
npm run build
pm2 serve dist 8080 --name gourmetta-frontend --spa
```

The application will now be available at `http://your-server-ip:8080`.

## 5. How to Update

Whenever you make changes here and push them to GitHub, run this on your server:

```bash
# Make the script executable (only needs to be done once)
chmod +x update.sh

# Run the update
./update.sh
```
