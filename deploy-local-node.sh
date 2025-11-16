#!/bin/bash

# Firebase Deployment Script using local Node.js v20
# This script uses a local Node.js installation to bypass system version conflicts

set -e

echo "🚀 Starting Firebase Deployment with Local Node.js v20..."

# Set up local Node.js v20 paths
NODE_DIR="./node-v20.19.5-linux-x64"
export PATH="$NODE_DIR/bin:$PATH"

# Verify Node.js version
echo "✅ Using Node.js version: $(node --version)"
echo "✅ Using NPM version: $(npm --version)"

# Install Firebase CLI locally if not present
if ! command -v firebase &> /dev/null; then
    echo "🔥 Installing Firebase CLI..."
    npm install -g firebase-tools
fi

echo "✅ Firebase CLI version: $(firebase --version)"

# Build the project
echo "🔨 Building project..."
npm run build

# Copy additional assets to dist folder
echo "📁 Copying additional assets..."
echo "  - Copying music files..."
cp game-music-loop-3-144252.mp3 short-game-music-loop-38898.mp3 dist/

echo "  - Copying images_selected folder..."
cp -r images_selected dist/

echo "✅ Additional assets copied to dist folder"

# Deploy to Firebase Hosting
echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

echo "✅ Deployment completed successfully!"
echo "🌐 Your app should be available at your Firebase Hosting URL"