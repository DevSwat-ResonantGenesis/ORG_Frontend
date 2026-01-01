# ✅ Deployment Ready - Your Folder Paths

## 📁 Your Droplet Folder Structure

**Backend Folder:** `/root/ResonantGraphAIV0.1`  
**Frontend Folder:** `/root/frontend`

---

## 🚀 Quick Deployment Commands

### On Your Droplet:

#### Deploy Frontend
```bash
cd /root/frontend
git pull origin main
npm install
npm run build
docker compose restart frontend
```

#### Deploy Backend
```bash
cd /root/ResonantGraphAIV0.1
git pull origin main
docker compose restart api
```

#### Deploy Both (Using Script)
```bash
# Upload script to droplet first, then:
chmod +x /root/deploy-on-droplet.sh
/root/deploy-on-droplet.sh
```

---

## 📋 Complete Deployment Process

### Step 1: Local Machine (Commit & Push)

**Frontend:**
```bash
cd /Applications/ResonantGraphAI_FrontendV0.1
git add .
git commit -m "feat: Deployment readiness - Complete analysis and preparation"
git push origin main
```

**Backend:**
```bash
cd /Applications/ResonantGraphAIV0.1
git add .
git commit -m "feat: Backend updates for deployment readiness"
git push origin main
```

### Step 2: Droplet (Pull & Deploy)

**SSH to Droplet:**
```bash
ssh root@137.184.234.252
```

**Deploy Frontend:**
```bash
cd /root/frontend
git pull origin main
npm install
npm run build
docker compose restart frontend
```

**Deploy Backend:**
```bash
cd /root/ResonantGraphAIV0.1
git pull origin main
docker compose restart api
```

**Or use the script:**
```bash
/root/deploy-on-droplet.sh
```

---

## ✅ Verification

```bash
# Check services
docker ps

# Test frontend
curl http://localhost/

# Test backend
curl http://localhost/api/health

# Check logs
docker compose logs -f
```

---

## 📝 Notes

- **Frontend:** `/root/frontend`
- **Backend:** `/root/ResonantGraphAIV0.1`
- **Deployment script:** Already configured with these paths
- **Ready to deploy!** ✅

