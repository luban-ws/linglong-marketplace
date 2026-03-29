#!/usr/bin/env sh
# Build the static site and force-push to branch "gh-pages" for GitHub Pages (root).
# Prerequisites: git, python3, PyYAML (pip install -r requirements-dev.txt); remote origin → GitHub.
#
# Optional env:
#   GITHUB_REPOSITORY=owner/repo  if origin URL is non-GitHub
#   BUILD_DIR=/path              output directory (default: temp dir, removed unless KEEP_BUILD=1)
#   KEEP_BUILD=1                 keep BUILD_DIR after run
set -eu

ROOT="$(git rev-parse --show-toplevel)"
cd "$ROOT"

ORIGIN_URL="$(git remote get-url origin 2>/dev/null || true)"
if [ -z "$ORIGIN_URL" ]; then
  echo "error: add remote origin pointing at GitHub before deploying" >&2
  exit 1
fi

REPO_SLUG="${GITHUB_REPOSITORY:-}"
if [ -z "$REPO_SLUG" ]; then
  case "$ORIGIN_URL" in
    git@github.com:*/*.git)
      REPO_SLUG="$(echo "$ORIGIN_URL" | sed -e 's#git@github.com:##' -e 's#\.git$##')"
      ;;
    https://github.com/*/*.git)
      REPO_SLUG="$(echo "$ORIGIN_URL" | sed -e 's#https://github.com/##' -e 's#\.git$##')"
      ;;
    *)
      echo "error: set GITHUB_REPOSITORY=owner/repo for this remote format: $ORIGIN_URL" >&2
      exit 1
      ;;
  esac
fi

SOURCE_BRANCH="$(git rev-parse --abbrev-ref HEAD)"
if [ -z "${BUILD_DIR:-}" ]; then
  BUILD_DIR="$(mktemp -d "${TMPDIR:-/tmp}/linglong-ghpages.XXXXXX")"
fi

cleanup() {
  if [ -n "${BUILD_DIR:-}" ] && [ "${KEEP_BUILD:-0}" != "1" ]; then
    rm -rf "$BUILD_DIR"
  fi
}
trap cleanup EXIT

echo "==> build_site (repo=$REPO_SLUG ref=$SOURCE_BRANCH) → $BUILD_DIR"
python3 scripts/build_site.py --out "$BUILD_DIR" --repo "$REPO_SLUG" --branch "$SOURCE_BRANCH"

echo "==> commit orphan gh-pages"
cd "$BUILD_DIR"
git init --initial-branch=gh-pages
git config user.name "${GIT_USER_NAME:-$(git -C "$ROOT" config user.name || echo 'github-pages')}"
git config user.email "${GIT_USER_EMAIL:-$(git -C "$ROOT" config user.email || echo 'github-pages@local')}"
git add -A
git commit -m "docs: deploy Pages from ${SOURCE_BRANCH} ($(date -u +%Y-%m-%dT%H:%MZ))"

git remote add origin "$ORIGIN_URL"

echo "==> git push --force origin gh-pages"
git push --force origin HEAD:gh-pages

echo "==> done — set GitHub Pages source: branch gh-pages, folder / (root)."
