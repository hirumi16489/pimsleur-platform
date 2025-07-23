#!/usr/bin/env bash
set -euo pipefail

# Default to dev if no stage parameter provided
STAGE=${1:-dev}
GOOGLE_CLIENT_ID=${2:-"xxxx"}
GOOGLE_CLIENT_SECRET=${3:-"xxxx"}

sam deploy \
  --no-fail-on-empty-changeset \
  --stack-name "pimsleur-platform" \
  --capabilities CAPABILITY_IAM CAPABILITY_AUTO_EXPAND \
  --parameter-overrides "Stage=$STAGE GoogleClientId=$GOOGLE_CLIENT_ID GoogleClientSecret=$GOOGLE_CLIENT_SECRET"