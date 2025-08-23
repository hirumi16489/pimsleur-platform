#!/usr/bin/env bash
set -euo pipefail

# Build the dependencies
echo "🔧 Building dependencies..."
cd backend
npm ci
cd - > /dev/null

# Render the samver mapping
#echo "🔧 Rendering samver mapping..."
#node scripts/backend/samver/render.mjs \
#  --template backend/infra/template.yaml \
#  --out backend/infra/template.rendered.yaml \
#  --handlers-root backend/src/application/handlers

# Run SAM build
echo "🏗️ Building SAM application..."
cfn-lint backend/infra/template.yaml
sam validate -t backend/infra/template.yaml

echo "✅ All checks passed"
sam build --template backend/infra/template.yaml

echo "✅ Backend built"