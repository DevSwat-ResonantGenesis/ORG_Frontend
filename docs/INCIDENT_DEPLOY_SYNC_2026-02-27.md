# Incident Note: Mobile Header Regression + Lost Changes

Date: 2026-02-27

## What happened
- Mobile header controls regressed in production (theme toggle + split view/code visualizer entry).
- Some changes were overwritten by deploying from stale/local state rather than verified remote HEAD.
- Voice conversation mode could appear enabled but fail to actually start listening when toggled during loading.

## Root causes
1. **Deploy source integrity gap**
   - Deploys were not always validated against latest remote branch HEAD.
2. **Cross-agent commit discipline gap**
   - Work remained uncommitted or not pushed before deploy windows.
3. **Voice toggle edge-case bug**
   - `forceListening=true` set while input disabled caused start to be skipped and not retried.

## Mandatory rules for all agents (effective immediately)
1. Commit and push before any production deploy.
2. Deploy only from a clean checkout that is hard-reset to `origin/<branch>`.
3. Before deploy, run:
   - `git fetch origin <branch>`
   - `git rev-parse HEAD`
   - `git rev-parse origin/<branch>`
   - abort if SHAs differ.
4. Never deploy from ad-hoc local workspace state.
5. After deploy, verify live critical controls on mobile:
   - header theme toggle visible
   - split view toggle visible/interactive
   - voice conversation toggle starts listening.

## Recovery process used
- Frontend source fixes committed and pushed to GitHub main.
- Droplet repo hard-synced to remote main and rebuilt.
- Static assets redeployed to `/var/www/frontend` with backup + nginx reload.
- VoiceInput `forceListening` retry logic fixed for disabled/loading transition.

## Action item
- Treat this as a release blocker category issue. If any step above cannot be confirmed, do not deploy.
