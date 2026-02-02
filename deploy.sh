#!/bin/bash
# ===========================================
# Quick Deploy Script - Local Build + Upload
# Reduces deployment from 46min to ~2min
# ===========================================

set -e

# Configuration
SERVER_USER="root"
SERVER_HOST="your-server-ip"  # Change this
SERVER_PATH="~/rdesign"

echo "=== Step 1: Building locally ==="
pnpm run build:spa

echo "=== Step 2: Syncing files to server ==="
# Only sync necessary files (not node_modules)
rsync -avz --progress \
    --exclude 'node_modules' \
    --exclude '.git' \
    --exclude 'src' \
    --exclude '.vscode' \
    --include 'dist/***' \
    --include 'server.js' \
    --include 'package.json' \
    --include 'pnpm-lock.yaml' \
    --include 'Dockerfile.prebuilt' \
    --include 'docker-compose.prebuilt.yml' \
    --exclude '*' \
    ./ ${SERVER_USER}@${SERVER_HOST}:${SERVER_PATH}/

echo "=== Step 3: Rebuilding container on server ==="
ssh ${SERVER_USER}@${SERVER_HOST} "cd ${SERVER_PATH} && docker-compose -f docker-compose.prebuilt.yml down && docker-compose -f docker-compose.prebuilt.yml up --build -d"

echo "=== Done! Deployment complete ==="
