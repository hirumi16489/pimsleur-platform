#!/bin/bash

# Parse named arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --stack)
      STACK="$2"
      shift 2
      ;;
    --assets-bucket)
      ASSETS_BUCKET="$2"
      shift 2
      ;;
    --artifacts-bucket)
      ARTIFACTS_BUCKET="$2"
      shift 2
      ;;
    --api-base)
      API_BASE="$2"
      shift 2
      ;;
    --cognito-client-id)
      COGNITO_CLIENT_ID="$2"
      shift 2
      ;;
    --cognito-domain)
      COGNITO_DOMAIN="$2"
      shift 2
      ;;
    --alt-domain)
      ALT_DOMAIN="$2"
      shift 2
      ;;
    --acm-arn)
      ACM_ARN="$2"
      shift 2
      ;;
    --hosted-zone-id)
      HOSTED_ZONE_ID="$2"
      shift 2
      ;;
    --app-env)
      APP_ENV_ARG="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  --stack STACK                    Stack name (default: pimsleur-next-ssr)"
      echo "  --assets-bucket BUCKET           Assets bucket name (default: pimsleur-next-ssr-static)"
      echo "  --artifacts-bucket BUCKET        Artifacts bucket name (default: pimsleur-next-ssr-artifacts)"
      echo "  --api-base URL                   API base URL (default: https://api.pimsleur.dragoneertechnology.com)"
      echo "  --cognito-client-id ID           Cognito client ID"
      echo "  --cognito-domain DOMAIN          Cognito domain"
      echo "  --alt-domain DOMAIN              Alternative domain (default: pimsleur.dragoneertechnology.com)"
      echo "  --acm-arn ARN                    ACM certificate ARN"
      echo "  --hosted-zone-id ID              Route53 hosted zone ID"
      echo "  --app-env ENV                    App environment (default: dev)"
      echo "  --help                           Show this help message"
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
STACK="${STACK:-pimsleur-next-ssr}"
ASSETS_BUCKET="${ASSETS_BUCKET:-pimsleur-next-ssr-static}"
ARTIFACTS_BUCKET="${ARTIFACTS_BUCKET:-pimsleur-next-ssr-artifacts}"
API_BASE="${API_BASE:-https://api.pimsleur.dragoneertechnology.com}"
COGNITO_CLIENT_ID="${COGNITO_CLIENT_ID:-}"
COGNITO_DOMAIN="${COGNITO_DOMAIN:-}"
ALT_DOMAIN="${ALT_DOMAIN:-pimsleur.dragoneertechnology.com}"
ACM_ARN="${ACM_ARN:-}"
HOSTED_ZONE_ID="${HOSTED_ZONE_ID:-}"

# Resolve paths + load frontend/.env.local if present
SCRIPT_DIR="$(cd -- "$(dirname "${BASH_SOURCE[0]}")" >/dev/null 2>&1 && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." >/dev/null 2>&1 && pwd)"
FRONTEND_DIR="$REPO_ROOT/frontend"
ENV_LOCAL_FILE="$FRONTEND_DIR/.env.local"

if [[ -f "$ENV_LOCAL_FILE" ]]; then
  echo "📄 Loading $ENV_LOCAL_FILE"
  set -a
  # shellcheck disable=SC1090
  source "$ENV_LOCAL_FILE"
  set +a
fi


# Required app config (must be in .env.local or environment)
APP_ENV="${APP_ENV_ARG:-dev}"
API_BASE="${API_BASE:-}"
COGNITO_CLIENT_ID="${COGNITO_CLIENT_ID:-}"
COGNITO_DOMAIN="${COGNITO_DOMAIN:-}"
ALT_DOMAIN="${ALT_DOMAIN:-}"
ACM_ARN="${ACM_ARN:-}"
HOSTED_ZONE_ID="${HOSTED_ZONE_ID:-}"

AWS_REGION="${AWS_REGION:-ap-northeast-1}"
TEMPLATE="${TEMPLATE:-$FRONTEND_DIR/infra/template.yaml}"

ZIP_PATH="$FRONTEND_DIR/.open-next/server-function.zip"
IMAGE_OPTIMIZATION_ZIP_PATH="$FRONTEND_DIR/.open-next/image-optimization-function.zip"
ASSETS_DIR="$FRONTEND_DIR/.open-next/assets"

# ---- Validations ----
: "${API_BASE:?API_BASE is required (set in frontend/.env.local or pass as arg 4)}"
: "${COGNITO_CLIENT_ID:?COGNITO_CLIENT_ID is required (set in frontend/.env.local or pass as arg 5)}"
: "${COGNITO_DOMAIN:?COGNITO_DOMAIN is required (set in frontend/.env.local or pass as arg 6)}"
: "${ALT_DOMAIN:?ALT_DOMAIN is required (set in frontend/.env.local or pass as arg 8)}"
: "${ACM_ARN:?ACM_ARN is required (set in frontend/.env.local or pass as arg 9)}"
: "${HOSTED_ZONE_ID:?HOSTED_ZONE_ID is required (set in frontend/.env.local or pass as arg 10)}"

# Ensure zip exists for Lambda
if [ ! -f "$FRONTEND_DIR/.open-next/server-function.zip" ]; then
  (cd "$FRONTEND_DIR/.open-next/server-functions/default" && zip -qr "$PWD/../../server-function.zip" .)
fi

# if [ ! -f "$FRONTEND_DIR/.open-next/image-optimization-function.zip" ]; then
#   (cd "$FRONTEND_DIR/.open-next" && zip -qr image-optimization-function.zip image-optimization-function)
# fi

# Ensure server zip exists
[[ -f "$ZIP_PATH" && -d "$ASSETS_DIR" ]] || {
  echo "❌ Build artifacts missing in $FRONTEND_DIR/.open-next . Run: npx open-next build"; exit 1; }

# Ensure image optimization zip exists
# if [ ! -f "$IMAGE_OPTIMIZATION_ZIP_PATH" ]; then
#   (cd "$FRONTEND_DIR/.open-next" && zip -qr image-optimization-function.zip image-optimization-function)
# fi

# Require artifacts bucket to exist (do NOT create it here)
if ! aws s3api head-bucket --bucket "$ARTIFACTS_BUCKET" >/dev/null 2>&1; then
  echo "❌ Artifacts bucket '$ARTIFACTS_BUCKET' does not exist."
  exit 1
fi

echo "🔧 Deploying to stack '$STACK' (region: $AWS_REGION)"
echo "   Assets bucket:    $ASSETS_BUCKET (created by stack)"
echo "   Artifacts bucket: $ARTIFACTS_BUCKET (must pre-exist)"

# Upload Lambda artifact
aws s3 cp "$ZIP_PATH" "s3://$ARTIFACTS_BUCKET/pimsleur/server-function.zip"
#aws s3 cp "$IMAGE_OPTIMIZATION_ZIP_PATH" "s3://$ARTIFACTS_BUCKET/pimsleur/image-optimization-function.zip"
rm "$ZIP_PATH"

VERSION_ID=$(aws s3api head-object \
  --bucket "$ARTIFACTS_BUCKET" \
  --key "pimsleur/server-function.zip" \
  --query VersionId --output text)

# Build parameter list (pass everything explicitly)
PARAMS=(
  "ProjectName=pimsleur-ssr"
  "StaticBucketName=$ASSETS_BUCKET"
  "ServerCodeBucket=$ARTIFACTS_BUCKET"
  "ServerCodeKey=pimsleur/server-function.zip"
  "ApiBase=$API_BASE"
  "CognitoClientId=$COGNITO_CLIENT_ID"
  "CognitoDomain=$COGNITO_DOMAIN"
  "AlternateDomainName=$ALT_DOMAIN"
  "AcmCertificateArn=$ACM_ARN"
  "HostedZoneId=$HOSTED_ZONE_ID"
  "ServerCodeVersion=$VERSION_ID"
  "AppEnvironment=$APP_ENV"
)

echo "Deploying with parameters: ${PARAMS[@]}"

# Deploy stack
aws cloudformation deploy \
  --region "$AWS_REGION" \
  --stack-name "$STACK" \
  --template-file "$TEMPLATE" \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides "${PARAMS[@]}"

# Sync static assets
aws s3 sync "$ASSETS_DIR" "s3://$ASSETS_BUCKET/" --delete

# Useful outputs
aws cloudformation describe-stacks --stack-name "$STACK" \
  --query "Stacks[0].Outputs[?OutputKey=='CloudFrontDomain'||OutputKey=='ApiEndpoint'||OutputKey=='StaticBucketName'].{Key:OutputKey,Value:OutputValue}" \
  --output table