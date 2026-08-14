#!/usr/bin/env bash
# Manual installer: copies the ui-design-rules skill into ~/.claude/skills
# (Prefer the plugin route: /plugin marketplace add <user>/<repo> in Claude Code.)
set -euo pipefail
SRC="$(cd "$(dirname "$0")" && pwd)/plugins/ui-design/skills/ui-design-rules"
DEST="${HOME}/.claude/skills/ui-design-rules"
mkdir -p "${HOME}/.claude/skills"
rm -rf "$DEST"
cp -r "$SRC" "$DEST"
echo "Installed: $DEST"
echo "Optional (visual self-verification): npm i -D playwright && npx playwright install chromium"
