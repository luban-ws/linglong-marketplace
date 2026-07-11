#!/usr/bin/env sh
# Install linglong-marketplace into Claude Code (macOS / Linux).
#
#   curl -fsSL https://raw.githubusercontent.com/systembugtj/linglong-marketplace/main/install.sh | sh
#   ./install.sh
#
# Override: LINGLONG_MARKETPLACE_REPO, LINGLONG_MARKETPLACE_NAME, LINGLONG_PLUGINS
set -eu

MARKETPLACE_NAME="${LINGLONG_MARKETPLACE_NAME:-linglong-marketplace}"
REPO_URL="${LINGLONG_MARKETPLACE_REPO:-https://github.com/systembugtj/linglong-marketplace.git}"
PLUGINS="${LINGLONG_PLUGINS:-tauri-plugin rfc-plugin macos-swiftpm-plugin}"

if ! command -v claude >/dev/null 2>&1; then
  echo "error: 'claude' CLI not found. Install Claude Code first:" >&2
  echo "  https://code.claude.com/docs/en/cli" >&2
  exit 1
fi

echo "==> marketplace add ${MARKETPLACE_NAME}"
echo "    source: ${REPO_URL}"
claude plugin marketplace add "$REPO_URL"

for plugin in $PLUGINS; do
  echo "==> plugin install ${plugin}@${MARKETPLACE_NAME}"
  claude plugin install "${plugin}@${MARKETPLACE_NAME}"
done

echo "==> installed. Restart Claude Code or run /plugin to verify."
