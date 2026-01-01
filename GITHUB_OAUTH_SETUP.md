# 🔐 GitHub OAuth App Registration Guide

## 📋 Fill Out the GitHub OAuth App Form

Based on your backend configuration, use these values:

### For Development (Local)

**Application name:**
```
ResonantGraph IDE
```

**Homepage URL:**
```
http://localhost:5175
```

**Application description (optional):**
```
AI-powered IDE with GitHub integration for ResonantGraph platform
```

**Authorization callback URL:**
```
http://localhost:8001/github/oauth/callback
```

**Enable Device Flow:**
- ☐ Leave unchecked (not needed for web app)

---

### For Production (Droplet)

**Application name:**
```
ResonantGraph IDE
```

**Homepage URL:**
```
https://dev-swat.com
```

**Application description (optional):**
```
AI-powered IDE with GitHub integration for ResonantGraph platform
```

**Authorization callback URL:**
```
https://dev-swat.com/api/github/oauth/callback
```

**Enable Device Flow:**
- ☐ Leave unchecked (not needed for web app)

---

## 🔑 After Registration

Once you click "Register application", GitHub will show you:

1. **Client ID** - Copy this immediately
2. **Client Secret** - Click "Generate a new client secret" and copy it

⚠️ **Important:** The Client Secret is only shown once! Save it immediately.

---

## 📝 Add to Backend .env

Add these values to `/Applications/ResonantGraphAIV0.1/.env`:

```bash
# GitHub OAuth (Development)
GITHUB_CLIENT_ID=paste_your_client_id_here
GITHUB_CLIENT_SECRET=paste_your_client_secret_here

# Token Encryption Key (generate with command below)
GITHUB_TOKEN_ENCRYPTION_KEY=paste_generated_key_here

# API Base URL
API_BASE_URL=http://localhost:8001

# Frontend URL
FRONTEND_URL=http://localhost:5175
```

---

## 🔐 Generate Encryption Key

Run this command to generate a secure encryption key:

```bash
python3 -c "from cryptography.fernet import Fernet; print(Fernet.generate_key().decode())"
```

Copy the output and paste it as `GITHUB_TOKEN_ENCRYPTION_KEY` in your `.env` file.

---

## ✅ Verification

After adding the credentials:

1. **Restart backend:**
   ```bash
   cd /Applications/ResonantGraphAIV0.1
   docker compose restart api
   ```

2. **Test OAuth flow:**
   - Go to IDE
   - Click GitHub sync button
   - Should redirect to GitHub for authorization

---

## 🔄 For Production

When deploying to production, create a **separate OAuth app** with:
- Homepage URL: `https://dev-swat.com`
- Callback URL: `https://dev-swat.com/api/github/oauth/callback`

Update production `.env` with production credentials.

---

**Note:** You can create multiple OAuth apps (one for dev, one for prod) or use the same app with different callback URLs if GitHub allows it.

