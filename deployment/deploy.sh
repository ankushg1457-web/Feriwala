#!/bin/bash
# Feriwala Deployment Script for AWS Bitnami (13.233.227.15)
# Run from local machine: bash deploy.sh

set -e

SERVER="bitnami@13.233.227.15"
KEY_PATH="./feriwala-key.pem"
REMOTE_DIR="/home/bitnami/feriwala"

echo "=== Feriwala Deployment ==="

# 1. Sync backend code
echo ">> Syncing backend..."
rsync -avz --delete \
  --exclude 'node_modules' \
  --exclude '.env' \
  --exclude 'uploads' \
  -e "ssh -i $KEY_PATH" \
  ../backend/ $SERVER:$REMOTE_DIR/backend/

# 2. Sync admin portal build
echo ">> Building admin portal..."
cd ../admin-portal
npm run build
cd ../deployment

echo ">> Syncing admin portal build..."
rsync -avz --delete \
  -e "ssh -i $KEY_PATH" \
  ../admin-portal/build/ $SERVER:$REMOTE_DIR/admin-portal/build/

# 3. Sync deployment configs
echo ">> Syncing deployment configs..."
scp -i $KEY_PATH ecosystem.config.js $SERVER:$REMOTE_DIR/
scp -i $KEY_PATH nginx.conf $SERVER:/tmp/feriwala-nginx.conf

# 4. Remote setup and restart
echo ">> Running remote setup..."
ssh -i $KEY_PATH $SERVER << 'ENDSSH'
  cd /home/bitnami/feriwala

  # Create directories
  mkdir -p logs backend/uploads

  # Install backend dependencies
  cd backend
  npm ci --production

  # PM2 restart
  cd ..
  pm2 delete feriwala-api 2>/dev/null || true
  pm2 start ecosystem.config.js
  pm2 save

  # Nginx config
  sudo cp /tmp/feriwala-nginx.conf /opt/bitnami/nginx/conf/server_blocks/feriwala.conf
  sudo /opt/bitnami/ctlscript.sh restart nginx

  echo "=== Deployment complete ==="
  pm2 status
ENDSSH
