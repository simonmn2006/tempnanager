#!/bin/bash

# Gourmetta HACCP - One-Click Update Script
# Usage: ./update.sh

echo "🚀 Starting Update Process..."

# 1. Pull latest code
echo "📥 Pulling latest changes from GitHub..."
git pull origin main

# 2. Install dependencies (in case package.json changed)
echo "📦 Installing dependencies..."
npm install

# 3. Build frontend
echo "🏗️ Building frontend (Vite)..."
npm run build

# 4. Restart PM2 processes
echo "🔄 Restarting processes..."
# This assumes you named them as per the README
pm2 restart gourmetta-backend
pm2 restart gourmetta-frontend

echo "✅ Update Complete! Your app is now running the latest version."
