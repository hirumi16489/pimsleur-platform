#!/usr/bin/env bash
set -euo pipefail

# Build the shared layer
echo "🔧 Building shared layer..."
cd backend
npm run build-layer --silent
cd - > /dev/null

# Run SAM build from project root
echo "🏗️ Building SAM application..."
sam build --template backend/infra/template.yaml