#!/bin/bash

CONFIG_FILE="local_config.yml"

if [ ! -f "$CONFIG_FILE" ]; then
  echo "❌ $CONFIG_FILE not found"
  exit 1
fi

# Load config using yq
REGION=$(yq -r '.region' "$CONFIG_FILE")
USER_POOL_ID=$(yq -r '.user_pool_id' "$CONFIG_FILE")
CLIENT_ID=$(yq -r '.client_id' "$CONFIG_FILE")
IDENTITY_POOL_ID=$(yq -r '.identity_pool_id' "$CONFIG_FILE")
USERNAME=$(yq -r '.username' "$CONFIG_FILE")
PASSWORD=$(yq -r '.password' "$CONFIG_FILE")

# 1. Authenticate user
echo "🔐 Authenticating user..."
auth_result=$(aws cognito-idp initiate-auth \
  --region "$REGION" \
  --auth-flow USER_PASSWORD_AUTH \
  --client-id "$CLIENT_ID" \
  --auth-parameters USERNAME="$USERNAME",PASSWORD="$PASSWORD")

echo "Auth Result: $auth_result"

id_token=$(echo "$auth_result" | jq -r '.AuthenticationResult.IdToken')
if [ -z "$id_token" ]; then
  echo "❌ Failed to get ID token"
  exit 1
fi
echo "✅ Got ID Token"
echo "ID_TOKEN=$id_token"
export ID_TOKEN=$id_token

# 2. Get Identity ID
echo "🔄 Getting identity ID..."
identity_id=$(aws cognito-identity get-id \
  --region "$REGION" \
  --identity-pool-id "$IDENTITY_POOL_ID" \
  --logins "cognito-idp.$REGION.amazonaws.com/$USER_POOL_ID=$id_token" \
  --query 'IdentityId' --output text)

# 3. Get temporary credentials
echo "🔑 Getting temporary AWS credentials..."
creds=$(aws cognito-identity get-credentials-for-identity \
  --region "$REGION" \
  --identity-id "$identity_id" \
  --logins "cognito-idp.$REGION.amazonaws.com/$USER_POOL_ID=$id_token")

export AWS_ACCESS_KEY_ID=$(echo "$creds" | jq -r '.Credentials.AccessKeyId')
export AWS_SECRET_ACCESS_KEY=$(echo "$creds" | jq -r '.Credentials.SecretKey')
export AWS_SESSION_TOKEN=$(echo "$creds" | jq -r '.Credentials.SessionToken')

echo "✅ Credentials set in your shell:"
echo "AWS_ACCESS_KEY_ID=$AWS_ACCESS_KEY_ID"
echo "AWS_SECRET_ACCESS_KEY=$AWS_SECRET_ACCESS_KEY"
echo "AWS_SESSION_TOKEN=$AWS_SESSION_TOKEN"

# Example test
# echo "🔍 Running 'aws sts get-caller-identity'"
# aws sts get-caller-identity