#!/usr/bin/env bash
set -euo pipefail

echo "🔧 Building frontend..."
cd frontend
npm ci --silent
npx open-next build > /dev/null 2>&1
cd - > /dev/null

echo "✅ Frontend built"