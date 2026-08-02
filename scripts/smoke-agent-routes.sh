#!/usr/bin/env bash
set -euo pipefail

: "${SITE_URL:?Set SITE_URL, for example https://www.hutchrok.com}"
: "${ADMIN_TOKEN:?Set ADMIN_TOKEN without printing it}"

curl -fsS \
  -H "Authorization: Bearer ${ADMIN_TOKEN}" \
  "${SITE_URL%/}/api/admin/agents/health"
printf '\n'
