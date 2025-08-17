#!/usr/bin/env bash
set -euo pipefail

REGION=${1:-"ap-northeast-1"}
ARTIFACTS_BUCKET=${2:-"pimsleur-next-ssr-artifacts"}
echo "🔧 Creating artifacts bucket $ARTIFACTS_BUCKET in $REGION..."

aws s3api create-bucket \
  --bucket "$ARTIFACTS_BUCKET" \
  --region "$REGION" \
  --create-bucket-configuration LocationConstraint="$REGION"

aws s3api put-bucket-versioning --bucket "$ARTIFACTS_BUCKET" --versioning-configuration Status=Enabled
aws s3api put-bucket-encryption --bucket "$ARTIFACTS_BUCKET" \
  --server-side-encryption-configuration '{"Rules":[{"ApplyServerSideEncryptionByDefault":{"SSEAlgorithm":"AES256"}}]}'

echo "✅ Artifacts bucket created"