# Runbook: Frontend Zero-Downtime Deployment

**Last Updated:** 2026-01-22  
**Owner:** DevOps Team  
**Severity:** Normal Operations

---

## Purpose

Deploy frontend changes to production using zero-downtime nginx reload.

---

## Prerequisites

- [ ] Changes merged to `main` branch
- [ ] All tests passing in CI
- [ ] Code review approved
- [ ] Build successful locally
- [ ] No console errors
- [ ] GitHub Actions workflow ready
- [ ] Team notified

---

## Deployment Steps

### 1. Trigger Deployment

```bash
# Push to main branch (triggers automatic deployment)
git push origin main
```

**What happens:**
- GitHub Actions workflow starts automatically
- Builds production bundle
- Deploys to droplet with zero downtime

---

### 2. Monitor GitHub Actions

**URL:** https://github.com/louienemesh/genesis2026_production_frontend/actions

**Expected duration:** ~3-5 minutes

**Watch for:**
- ✅ Checkout repository
- ✅ Setup Node.js
- ✅ Install dependencies (npm ci)
- ✅ Build production bundle (npm run build)
- ✅ Upload to droplet (SCP)
- ✅ Backup current frontend
- ✅ Sync new files
- ✅ Reload nginx (zero downtime!)
- ✅ Verify deployment

---

### 3. Verify Deployment

**Check frontend accessibility:**
```bash
curl -I https://dev-swat.com
# Expected: HTTP/2 200
```

**Check in browser:**
- Open: https://dev-swat.com
- Hard refresh: Cmd+Shift+R (Mac) or Ctrl+Shift+R (Windows)
- Check console for errors (F12)
- Test critical user paths

**Check deployment on server:**
```bash
ssh root@dev-swat.com

# Check nginx status
docker ps | grep nginx

# Check frontend files
ls -lh /var/www/frontend/

# Check nginx logs
docker logs genesis_nginx --tail 50
```

---

### 4. Post-Deployment Testing

**Test checklist:**
- [ ] Homepage loads correctly
- [ ] User authentication works
- [ ] Navigation functional
- [ ] Forms submit properly
- [ ] Mobile view renders correctly
- [ ] No console errors
- [ ] Assets loading (images, fonts, etc.)
- [ ] API calls working

**Browser testing:**
- Chrome (desktop)
- Firefox (desktop)
- Safari (desktop)
- Mobile Safari (iOS)
- Mobile Chrome (Android)

---

## Success Criteria

- ✅ GitHub Actions shows green checkmark
- ✅ Frontend accessible at https://dev-swat.com
- ✅ No console errors
- ✅ All critical paths working
- ✅ Mobile view functional
- ✅ Nginx reload successful
- ✅ Backup created

---

## Rollback Procedure

### Automatic Backup

**Every deployment creates backup:**
```
/var/backups/frontend/frontend_YYYYMMDD_HHMMSS.tar.gz
```

### Manual Rollback

**If issues detected:**

```bash
# SSH to droplet
ssh root@dev-swat.com

# List available backups
ls -lh /var/backups/frontend/

# Identify latest good backup
# Example: frontend_20260122_193000.tar.gz

# Stop nginx temporarily (optional, for safety)
# docker exec genesis_nginx nginx -s stop

# Restore backup
cd /var/www/frontend
rm -rf *
tar -xzf /var/backups/frontend/frontend_20260122_193000.tar.gz

# Reload nginx
docker exec genesis_nginx nginx -s reload

# Verify
curl -I https://dev-swat.com
```

**Rollback time:** ~30 seconds

---

## Troubleshooting

### Issue: Build Fails

**Symptoms:**
- GitHub Actions fails at build step
- Error: "Build failed with exit code 1"

**Diagnosis:**
```bash
# Check GitHub Actions logs
# Look for:
# - TypeScript errors
# - Missing dependencies
# - Syntax errors
```

**Solution:**
1. Check build logs in GitHub Actions
2. Fix errors locally
3. Test build: `npm run build`
4. Commit and push fix

---

### Issue: Frontend Not Updating

**Symptoms:**
- Deployment successful but changes not visible
- Old version still showing

**Diagnosis:**
```bash
# Check if files actually updated
ssh root@dev-swat.com "ls -lh /var/www/frontend/"

# Check nginx cache
ssh root@dev-swat.com "docker exec genesis_nginx nginx -V"
```

**Solution:**
```bash
# Hard refresh browser (Cmd+Shift+R)

# Or clear nginx cache
ssh root@dev-swat.com
docker exec genesis_nginx nginx -s reload

# Or restart nginx
docker restart genesis_nginx
```

---

### Issue: 404 Errors on Routes

**Symptoms:**
- Homepage works
- Direct navigation to routes fails (404)

**Diagnosis:**
```bash
# Check nginx SPA configuration
ssh root@dev-swat.com "docker exec genesis_nginx cat /etc/nginx/conf.d/default.conf"
```

**Solution:**
```bash
# Ensure nginx has SPA fallback
# Should have: try_files $uri $uri/ /index.html;

# If missing, update nginx config and reload
docker exec genesis_nginx nginx -s reload
```

---

### Issue: Assets Not Loading

**Symptoms:**
- Page loads but images/fonts missing
- Console errors: "Failed to load resource"

**Diagnosis:**
```bash
# Check asset paths
curl https://dev-swat.com/assets/

# Check file permissions
ssh root@dev-swat.com "ls -lh /var/www/frontend/assets/"
```

**Solution:**
```bash
# Fix permissions if needed
ssh root@dev-swat.com
chmod -R 755 /var/www/frontend/
chown -R root:root /var/www/frontend/

# Reload nginx
docker exec genesis_nginx nginx -s reload
```

---

### Issue: Console Errors

**Symptoms:**
- Errors in browser console
- Functionality broken

**Common errors:**
```javascript
// API endpoint not found
"Failed to fetch: 404"
→ Check API endpoint URLs

// CORS error
"Access-Control-Allow-Origin"
→ Check backend CORS settings

// Module not found
"Cannot find module"
→ Check build output, missing dependency
```

**Solution:**
1. Identify error type
2. Fix in code
3. Test locally
4. Redeploy

---

## Emergency Contacts

**Primary:** Frontend Lead  
**Backup:** DevOps Team  
**Emergency:** On-call rotation (see PagerDuty)

**Communication Channels:**
- Slack: #frontend-deployments
- Incidents: #incidents
- Emergency: Page on-call

---

## Related Runbooks

- [Backend Deployment](https://github.com/louienemesh/genesis2026_production_backend/blob/main/runbooks/deployment-backend.md)
- [Incident Response](https://github.com/louienemesh/genesis2026_production_backend/blob/main/runbooks/incident-response.md)

---

## Deployment Checklist

**Pre-Deployment:**
- [ ] Code reviewed and approved
- [ ] Tests passing
- [ ] Build successful locally
- [ ] No console errors
- [ ] Team notified

**During Deployment:**
- [ ] GitHub Actions triggered
- [ ] Monitoring deployment progress
- [ ] Build completed successfully
- [ ] Files synced to server
- [ ] Nginx reloaded

**Post-Deployment:**
- [ ] Frontend accessible
- [ ] No console errors
- [ ] Critical paths tested
- [ ] Mobile view verified
- [ ] Backup confirmed
- [ ] Team notified of completion

---

## Performance Monitoring

**Metrics to watch:**
- Page load time
- Time to interactive
- First contentful paint
- Largest contentful paint
- Cumulative layout shift

**Tools:**
- Chrome DevTools (Lighthouse)
- Browser console (Network tab)
- Real user monitoring (if available)

**Thresholds:**
- Page load > 3s → Investigate
- Console errors → Fix immediately
- Layout shifts → Optimize

---

## Post-Deployment Tasks

1. **Verify in production** - Test all critical paths
2. **Monitor for 30 minutes** - Watch for user reports
3. **Check analytics** - Verify traffic patterns normal
4. **Update documentation** if process changed
5. **Log deployment** in tracking system
6. **Update runbook** with any learnings

---

## Changelog

- **2026-01-22:** Initial frontend deployment runbook created
