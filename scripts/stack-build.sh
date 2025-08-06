#!/usr/bin/env bash
set -euo pipefail

# Build the shared layer
echo "🔧 Building shared layer..."
cd backend
npm run build-layer --silent
cd - > /dev/null

# Run SAM build from project root
echo "🏗️ Building SAM application..."
cfn-lint infra/template.yaml
sam validate -t infra/template.yaml

echo "✅ All checks passed"
sam build --template infra/template.yaml