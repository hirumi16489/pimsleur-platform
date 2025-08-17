#!/usr/bin/env bash
set -euo pipefail

# Build the dependencies
echo "🔧 Building dependencies..."
cd backend
npm ci
cd - > /dev/null

# Run SAM build
echo "🏗️ Building SAM application..."
cfn-lint backend/infra/template.yaml
sam validate -t backend/infra/template.yaml

echo "✅ All checks passed"
sam build --template backend/infra/template.yaml

echo "✅ Backend built"