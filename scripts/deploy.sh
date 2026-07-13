#!/usr/bin/env bash
# ビルド → S3転送 → CloudFrontキャッシュ削除
set -euo pipefail
cd "$(dirname "$0")/.."

BUCKET="$(terraform -chdir=terraform output -raw bucket_name)"
DISTRIBUTION_ID="$(terraform -chdir=terraform output -raw distribution_id)"

pnpm build
# CloudFrontのorigin_pathが/distのためバケット内のdist/配下に配置する
aws s3 sync dist/ "s3://${BUCKET}/dist/" --delete
aws cloudfront create-invalidation --distribution-id "$DISTRIBUTION_ID" --paths "/*"
