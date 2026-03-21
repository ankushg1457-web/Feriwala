#!/bin/bash
# Initial server setup for Feriwala on AWS Bitnami
# SSH in first: ssh -i feriwala-key.pem bitnami@13.233.227.15

set -e

echo "=== Feriwala Server Setup ==="

# Update system
sudo apt-get update

# Install Node.js 20 LTS
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs

# Install PM2
sudo npm install -g pm2

# Install PostgreSQL
sudo apt-get install -y postgresql postgresql-contrib
sudo systemctl enable postgresql
sudo systemctl start postgresql

# Setup PostgreSQL database
sudo -u postgres psql << 'PGEOF'
CREATE USER feriwala WITH PASSWORD 'FeriwalaDB2024!';
CREATE DATABASE feriwala_db OWNER feriwala;
GRANT ALL PRIVILEGES ON DATABASE feriwala_db TO feriwala;
PGEOF

# Create app directory
mkdir -p /home/bitnami/feriwala/backend/uploads
mkdir -p /home/bitnami/feriwala/admin-portal/build
mkdir -p /home/bitnami/feriwala/logs

# Create .env file
cat > /home/bitnami/feriwala/backend/.env << 'ENVEOF'
NODE_ENV=production
PORT=3000

# MongoDB Atlas (replace with your connection string)
MONGODB_URI=mongodb+srv://feriwala:YOUR_PASSWORD@cluster0.xxxxx.mongodb.net/feriwala?retryWrites=true&w=majority

# PostgreSQL
PG_HOST=localhost
PG_PORT=5432
PG_DATABASE=feriwala_db
PG_USER=feriwala
PG_PASSWORD=FeriwalaDB2024!

# JWT
JWT_SECRET=fw-jwt-secret-change-this-in-production
JWT_REFRESH_SECRET=fw-refresh-secret-change-this-in-production
JWT_EXPIRES_IN=7d
JWT_REFRESH_EXPIRES_IN=30d

# Google Maps
GOOGLE_MAPS_API_KEY=AIzaSyDKijqkofbXiD1WOkPmW-6CQFEpRuLHCJ4

# Server
SERVER_URL=http://13.233.227.15
ENVEOF

echo "=== Setup complete! ==="
echo "Next: Run deploy.sh from your local machine"
