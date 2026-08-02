#!/usr/bin/env bash
set -euo pipefail

if [[ $# -ne 1 ]]; then
  echo "Usage: $0 /absolute/path/to/hutchrok_solutions-site" >&2
  exit 2
fi

SOURCE_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
TARGET_ROOT="$1"

if [[ ! -f "$TARGET_ROOT/package.json" ]]; then
  echo "Target does not look like the Hutchrok repository: $TARGET_ROOT" >&2
  exit 2
fi

if ! grep -q '"name": "hutchrok_solutions-site"' "$TARGET_ROOT/package.json"; then
  echo "Target package.json is not hutchrok_solutions-site." >&2
  exit 2
fi

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BACKUP_ROOT="$TARGET_ROOT/.hutchrok-agent-backup/$STAMP"
mkdir -p "$BACKUP_ROOT/lib/agents" "$BACKUP_ROOT/lib/notifications"

for existing in \
  "lib/agents/intake-triage.ts" \
  "lib/notifications/dispatcher.ts"; do
  if [[ -f "$TARGET_ROOT/$existing" ]]; then
    mkdir -p "$BACKUP_ROOT/$(dirname "$existing")"
    cp "$TARGET_ROOT/$existing" "$BACKUP_ROOT/$existing"
  fi
done

copy_tree() {
  local source="$1"
  local target="$2"
  mkdir -p "$target"
  cp -R "$source"/. "$target"/
}

copy_tree "$SOURCE_ROOT/app" "$TARGET_ROOT/app"
copy_tree "$SOURCE_ROOT/lib" "$TARGET_ROOT/lib"
copy_tree "$SOURCE_ROOT/docs" "$TARGET_ROOT/docs"

for script in \
  generate_diagrams.py \
  smoke-agent-routes.sh \
  verify-agent-bundle.mjs; do
  cp "$SOURCE_ROOT/scripts/$script" "$TARGET_ROOT/scripts/$script"
done

cp "$SOURCE_ROOT/APPLY_WITH_CODEX.md" \
  "$TARGET_ROOT/docs/APPLY_AGENT_COMMAND_CENTER_WITH_CODEX.md"

cat <<OUT
Overlay copied to: $TARGET_ROOT
Backups of replaced files: $BACKUP_ROOT

Next commands:
  cd "$TARGET_ROOT"
  NODE_PATH="\$(npm root -g)" node scripts/verify-agent-bundle.mjs
  npx tsc --noEmit
  npm run build

Do not apply production migrations again without checking Supabase migration history.
OUT
