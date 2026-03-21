#!/bin/bash
set -e
export PATH=~/.npm-global/bin:$PATH

echo "=== Cloning/updating Feriwala from GitHub ==="
if [ -d "/home/bitnami/feriwala/.git" ]; then
  cd /home/bitnami/feriwala
  git pull origin main
else
  git clone https://github.com/drrkastitva-wq/feriwala.git /home/bitnami/feriwala
fi

echo "=== Installing backend dependencies ==="
cd /home/bitnami/feriwala/backend
npm ci --production

echo "=== Copying ecosystem config ==="
cp /home/bitnami/feriwala/deployment/ecosystem.config.js /home/bitnami/feriwala/

echo "=== Creating uploads dir if missing ==="
mkdir -p /home/bitnami/feriwala/backend/uploads
mkdir -p /home/bitnami/feriwala/logs

echo "=== Starting PM2 ==="
cd /home/bitnami/feriwala
pm2 delete feriwala-api 2>/dev/null || true
pm2 start ecosystem.config.js
pm2 save
pm2 startup | tail -1 || true

echo "=== Checking status ==="
pm2 status

echo "=== Testing API ==="
sleep 3
curl -s http://localhost:3000/api/health || echo "Health check done (endpoint may not exist yet)"

echo "=== Deployment complete! ==="
