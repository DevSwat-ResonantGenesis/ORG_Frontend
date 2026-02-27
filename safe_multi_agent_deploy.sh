#!/usr/bin/env bash
set -euo pipefail

# Safe deployment helper for multi-agent workflow.
# Prevents deploying stale or dirty local state and always deploys from a clean clone.

REPO_DIR="${1:-$HOME/CascadeProjects/genesis2026_frontend}"
REMOTE_NAME="${REMOTE_NAME:-origin}"
BRANCH_NAME="${BRANCH_NAME:-main}"
DROPLET_HOST="${DROPLET_HOST:-deploy@134.199.221.149}"
DROPLET_REPO="${DROPLET_REPO:-/home/deploy/genesis2026_frontend_production_2}"
DEPLOY_TMP="${DEPLOY_TMP:-/tmp/rg_frontend_deploy_safe}"
DEPLOY_TARGET="${DEPLOY_TARGET:-/var/www/frontend}"

printf "[safe-deploy] repo=%s remote=%s branch=%s\n" "$REPO_DIR" "$REMOTE_NAME" "$BRANCH_NAME"

if [[ ! -d "$REPO_DIR/.git" ]]; then
  echo "[safe-deploy] ERROR: $REPO_DIR is not a git repository"
  exit 1
fi

if [[ -n "$(git -C "$REPO_DIR" status --porcelain)" ]]; then
  echo "[safe-deploy] ERROR: local repo has uncommitted changes. Commit or stash first."
  exit 1
fi

git -C "$REPO_DIR" fetch "$REMOTE_NAME" "$BRANCH_NAME"
LOCAL_SHA="$(git -C "$REPO_DIR" rev-parse "$BRANCH_NAME")"
REMOTE_SHA="$(git -C "$REPO_DIR" rev-parse "$REMOTE_NAME/$BRANCH_NAME")"

if [[ "$LOCAL_SHA" != "$REMOTE_SHA" ]]; then
  echo "[safe-deploy] ERROR: local $BRANCH_NAME is not in sync with $REMOTE_NAME/$BRANCH_NAME"
  echo "[safe-deploy] Run: git pull --rebase $REMOTE_NAME $BRANCH_NAME"
  exit 1
fi

echo "[safe-deploy] Local branch is synced with remote. Deploying cleanly on droplet..."

ssh "$DROPLET_HOST" "rm -rf '$DEPLOY_TMP' && git clone --depth 1 '$DROPLET_REPO' '$DEPLOY_TMP' && cd '$DEPLOY_TMP' && npm ci && npm run build && sudo cp -r dist/* '$DEPLOY_TARGET/' && echo SAFE_DEPLOY_OK"

echo "[safe-deploy] Completed successfully"
