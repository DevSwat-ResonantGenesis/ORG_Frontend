---
Commit locally
Push to GitHub main only (single source of truth)
On server:
git fetch origin main
git reset --hard origin/main
git clean -fd
build + deploy
Verify live SHA and bundle hashdescription: Safe multi-agent frontend deploy without overwriting others
---

1. Verify your local branch is clean and synced before deploy.
   - `git status --short` must be empty.
   - `git fetch origin main && git rev-parse main origin/main` must match.

2. If push is rejected, do not force push.
   - Rebase/cherry-pick onto latest `origin/main`.
   - Resolve conflicts by preserving both your changes and new upstream changes.

3. Deploy only from a clean clone on droplet (never from dirty working tree).
   - Use helper script from repo root:
   - `bash ./safe_multi_agent_deploy.sh`

4. If droplet repo has local modifications, do not pull in-place.
   - Build in `/tmp/rg_frontend_deploy_safe` clean clone.
   - Copy built files to `/var/www/frontend/` only after successful build.

5. Post-deploy validation checklist:
   - Open Resonant Chat on desktop + mobile.
   - Verify header controls, split view tabs, and input bar skills list.
   - Confirm latest commit hash is present in deployed bundle metadata/logs.

6. Agent communication rule:
   - After each deploy, send summary to agent chat including:
     - commit hash
     - what changed
     - confirmation that clean-clone deploy flow was used
