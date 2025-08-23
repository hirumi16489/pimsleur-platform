#!/usr/bin/env bash
set -euo pipefail

# ------- defaults (env/args can override) -------
REGION="${REGION:-ap-northeast-1}"
STACK="${STACK:-pimsleur-platform}"
LOGICAL_PATH="${LOGICAL_PATH:-}"
TEMPLATE="${TEMPLATE:-backend/infra/template.yaml}"
export AWS_PAGER=""

# ------- args -------
while [[ $# -gt 0 ]]; do
  case "$1" in
    --region) REGION="$2"; shift 2;;
    --stack) STACK="$2"; shift 2;;
    --lambda|--logical|--logical-id) LOGICAL_PATH="$2"; shift 2;;
    --template|--template-file) TEMPLATE="$2"; shift 2;;
    -h|--help)
      cat <<EOF
Usage: $0 --lambda <LogicalPath> [--stack <name>] [--region <r>] [--template <path>]
Defaults: --region $REGION  --stack $STACK  --template $TEMPLATE
EOF
      exit 0;;
    *) echo "Unknown option: $1"; exit 1;;
  esac
done

: "${LOGICAL_PATH:?--lambda <LogicalPath> is required (e.g. ApiStack/S3UploadPresignUrlFunction)}"

echo "sam build (template=$TEMPLATE)"
sam build --template-file "$TEMPLATE"

BUILD_DIR=".aws-sam/build/${LOGICAL_PATH}"
[[ -d "$BUILD_DIR" ]] || { echo "❌ Build dir not found: $BUILD_DIR"; ls -1 .aws-sam/build || true; exit 1; }

# Zip contents of build dir (no extra top folder)
ZIP="/tmp/${LOGICAL_PATH//\//_}.zip"
rm -f "$ZIP"
if command -v zip >/dev/null 2>&1; then
  echo "Zipping with zip: $BUILD_DIR -> $ZIP"
  ( cd "$BUILD_DIR" && zip -qr "$ZIP" . )
else
  echo "Zipping with python: $BUILD_DIR -> $ZIP"
  python3 - "$BUILD_DIR" "$ZIP" <<'PY'
import os, sys, zipfile
build_dir, zip_path = sys.argv[1], sys.argv[2]
with zipfile.ZipFile(zip_path, "w", zipfile.ZIP_DEFLATED) as z:
    for root, _, files in os.walk(build_dir):
        for f in files:
            full = os.path.join(root, f)
            rel = os.path.relpath(full, build_dir)
            z.write(full, rel)
print(zip_path)
PY
fi
[[ -f "$ZIP" ]] || { echo "❌ Zip not created: $ZIP"; exit 1; }

# Resolve a Lambda's physical name, supports any nesting depth
resolve_fn() {
  local parent_stack="$1" path="$2" current="$1"
  IFS='/' read -r -a parts <<< "$path"
  local last=$(( ${#parts[@]} - 1 ))
  local func="${parts[$last]}"

  # walk nested stacks by logical ID
  for (( i=0; i<last; i++ )); do
    local nest="${parts[$i]}"
    # get the nested stack's PHYSICAL id by its logical id in the current stack
    current=$(aws cloudformation describe-stack-resource \
      --region "$REGION" \
      --stack-name "$current" \
      --logical-resource-id "$nest" \
      --query 'StackResourceDetail.PhysicalResourceId' \
      --output text 2>/dev/null)
    [[ -n "$current" && "$current" != "None" ]] || {
      echo "❌ Nested stack '$nest' not found under '$parent_stack' (at '$current')" >&2
      return 1
    }
  done

  # now resolve the Lambda by its logical id inside the (possibly nested) stack
  aws cloudformation describe-stack-resource \
    --region "$REGION" \
    --stack-name "$current" \
    --logical-resource-id "$func" \
    --query 'StackResourceDetail.PhysicalResourceId' \
    --output text 2>/dev/null
}
echo "Resolving function name for $LOGICAL_PATH"
FN="$(resolve_fn "$STACK" "$LOGICAL_PATH")"
[[ -n "$FN" && "$FN" != "None" ]] || { echo "❌ Lambda '$LOGICAL_PATH' not found in stack '$STACK'"; exit 1; }

echo "🚀 Updating $FN with $ZIP"
aws lambda update-function-code --region "$REGION" --function-name "$FN" --zip-file "fileb://$ZIP"
echo "✅ $FN updated ($REGION)"q