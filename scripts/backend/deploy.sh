#!/usr/bin/env bash
set -euo pipefail

# Parse named arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --stage)
      STAGE="$2"
      shift 2
      ;;
    --region)
      REGION="$2"
      shift 2
      ;;
    --stack)
      STACK="$2"
      shift 2
      ;;
    --google-client-id)
      GOOGLE_CLIENT_ID="$2"
      shift 2
      ;;
    --google-client-secret)
      GOOGLE_CLIENT_SECRET="$2"
      shift 2
      ;;
    --api-custom-domain)
      API_CUSTOM_DOMAIN="$2"
      shift 2
      ;;
    --api-certificate-arn)
      API_CERTIFICATE_ARN="$2"
      shift 2
      ;;
    --hosted-zone-id)
      HOSTED_ZONE_ID="$2"
      shift 2
      ;;
    --custom-cognito-domain)
      CUSTOM_COGNITO_DOMAIN="$2"
      shift 2
      ;;
    --us-east-1-cert-arn-for-cognito)
      US_EAST_1_CERT_ARN_FOR_COGNITO="$2"
      shift 2
      ;;
    --callback-urls)
      CALLBACK_URLS="$2"
      shift 2
      ;;
    --logout-urls)
      LOGOUT_URLS="$2"
      shift 2
      ;;
    --help)
      echo "Usage: $0 [OPTIONS]"
      echo "Options:"
      echo "  --stage STAGE                           Deployment stage (default: dev)"
      echo "  --stack STACK                           Stack name (default: pimsleur-platform)"
      echo "  --google-client-id ID                   Google OAuth client ID"
      echo "  --google-client-secret SECRET           Google OAuth client secret"
      echo "  --api-custom-domain DOMAIN              API custom domain"
      echo "  --api-certificate-arn ARN               API certificate ARN"
      echo "  --hosted-zone-id ID                     Route53 hosted zone ID"
      echo "  --custom-cognito-domain DOMAIN          Custom Cognito domain"
      echo "  --us-east-1-cert-arn-for-cognito ARN    US East 1 certificate ARN for Cognito"
      echo "  --callback-urls URLS                    Comma-separated callback URLs"
      echo "  --logout-urls URLS                      Comma-separated logout URLs"
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
STAGE="${STAGE:-dev}"
REGION="${REGION:-ap-northeast-1}"
STACK="${STACK:-pimsleur-platform}"
GOOGLE_CLIENT_ID="${GOOGLE_CLIENT_ID:-xxxx}"
GOOGLE_CLIENT_SECRET="${GOOGLE_CLIENT_SECRET:-xxxx}"
API_CUSTOM_DOMAIN="${API_CUSTOM_DOMAIN:-}"
API_CERTIFICATE_ARN="${API_CERTIFICATE_ARN:-}"
HOSTED_ZONE_ID="${HOSTED_ZONE_ID:-}"
CUSTOM_COGNITO_DOMAIN="${CUSTOM_COGNITO_DOMAIN:-}"
US_EAST_1_CERT_ARN_FOR_COGNITO="${US_EAST_1_CERT_ARN_FOR_COGNITO:-}"
CALLBACK_URLS="${CALLBACK_URLS:-}"
LOGOUT_URLS="${LOGOUT_URLS:-}"

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

# --- Validate required values ---
: "${API_CUSTOM_DOMAIN:?API_CUSTOM_DOMAIN is required (set in .env.local or pass as arg 5)}"
: "${API_CERTIFICATE_ARN:?API_CERTIFICATE_ARN is required (set in .env.local or pass as arg 6)}"
: "${HOSTED_ZONE_ID:?HOSTED_ZONE_ID is required (set in .env.local or pass as arg 7)}"

# --- Deploy ---
sam deploy \
  --region "$REGION" \
  --no-fail-on-empty-changeset \
  --stack-name "$STACK" \
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
  --no-confirm-changeset \
  --parameter-overrides \
    Stage="$STAGE" \
    StackName="$STACK" \
    GoogleClientId="$GOOGLE_CLIENT_ID" \
    GoogleClientSecret="$GOOGLE_CLIENT_SECRET" \
    ApiCustomDomain="$API_CUSTOM_DOMAIN" \
    ApiCertificateArn="$API_CERTIFICATE_ARN" \
    HostedZoneId="$HOSTED_ZONE_ID" \
    CustomCognitoDomain="$CUSTOM_COGNITO_DOMAIN" \
    UsEast1CertArnForCognito="$US_EAST_1_CERT_ARN_FOR_COGNITO" \
    CallbackUrls="$CALLBACK_URLS" \
    LogoutUrls="$LOGOUT_URLS"
