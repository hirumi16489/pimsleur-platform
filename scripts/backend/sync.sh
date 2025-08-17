#!/usr/bin/env bash
set -euo pipefail

# Parse named arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --region)
      REGION="$2"
      shift 2
      ;;
    --stack)
      STACK="$2"
      shift 2
      ;;
    --lambda)
      LAMBDA_FUNCTION_NAME="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  --region REGION                         AWS region"
      echo "  --stack STACK                           Stack name"
      echo "  --help                                  Show this help message"
      exit 0
      ;;
    *)
      echo "Unknown option: $1"
      echo "Use --help for usage information"
      exit 1
      ;;
  esac
done

# Set defaults if not provided
REGION="${REGION:-ap-northeast-1}"
STACK="${STACK:-pimsleur-platform}"
LAMBDA_FUNCTION_NAME="${LAMBDA_FUNCTION_NAME:-}"

: "${LAMBDA_FUNCTION_NAME:?LAMBDA_FUNCTION_NAME is required}"

# Resolve paths + load env files if present (root and backend)
SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." >/dev/null 2>&1 && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"

# Load in order: repo root then backend, allowing backend values to override root
for env_file in "$REPO_ROOT/.env" "$REPO_ROOT/.env.local" "$BACKEND_DIR/.env" "$BACKEND_DIR/.env.local"; do
  if [[ -f "$env_file" ]]; then
    echo "📄 Loading $env_file"
    set -a
    # shellcheck disable=SC1090
    source "$env_file"
    set +a
  fi
done

echo "Syncing $LAMBDA_FUNCTION_NAME"

echo "sam sync --stack-name \"$STACK\" --region \"$REGION\" --code --resource-id \"$LAMBDA_FUNCTION_NAME\" --resource AWS::Serverless::Function --template-file \"$BACKEND_DIR/infra/template.yaml\""


sam sync --stack-name "$STACK" --region "$REGION" --code \
  --resource-id "$LAMBDA_FUNCTION_NAME" --resource AWS::Serverless::Function \
  --template-file "$BACKEND_DIR/infra/template.yaml"
