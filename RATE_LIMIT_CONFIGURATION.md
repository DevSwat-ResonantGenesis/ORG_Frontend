# ✅ Rate Limiting - Environment-Based Configuration

**Date:** 2025-01-30  
**Status:** Configured for automatic development/production switching

---

## 🎯 **Solution: Environment-Based Configuration**

The rate limiting middleware now **automatically** switches between development and production settings based on the `ENVIRONMENT` variable.

**No manual changes needed when deploying to production!**

---

## 🔧 **How It Works**

### **Development Mode (Current):**
- **Environment:** `ENVIRONMENT=development` (or not set)
- **Rate Limits:** 10000/min (effectively disabled)
- **Login Endpoint:** Excluded from rate limiting
- **Purpose:** Allow unlimited requests during development

### **Production Mode:**
- **Environment:** `ENVIRONMENT=production`
- **Rate Limits:**
  - Anonymous: 60 requests/minute
  - Authenticated: 500 requests/minute
  - API Key: 1000 requests/minute
  - Admin: 2000 requests/minute
- **Login Endpoint:** Rate limited (10 attempts/minute per IP)
- **Purpose:** Protect against abuse and brute force attacks

---

## 📝 **Configuration**

### **Backend Environment Variables:**

**Development (.env):**
```bash
ENVIRONMENT=development
# Rate limits are automatically set to 10000/min
```

**Production (.env):**
```bash
ENVIRONMENT=production
# Optional: Override default limits
RATE_LIMIT_ANONYMOUS=60
RATE_LIMIT_AUTHENTICATED=500
RATE_LIMIT_API_KEY=1000
RATE_LIMIT_ADMIN=2000
RATE_LIMIT_LOGIN=10  # Login attempts per minute per IP
```

---

## ✅ **What's Configured**

### **1. Rate Limits:**
- ✅ Automatically switches based on `ENVIRONMENT`
- ✅ Configurable via environment variables
- ✅ Development: Effectively disabled (10000/min)
- ✅ Production: Proper security limits

### **2. Login Endpoint:**
- ✅ Development: Excluded from rate limiting
- ✅ Production: Rate limited (10 attempts/min per IP)
- ✅ Prevents brute force attacks in production

### **3. SSO Providers:**
- ✅ Always excluded (public endpoint)
- ✅ No changes needed

### **4. Health Checks:**
- ✅ Always excluded
- ✅ No changes needed

---

## 🚀 **Deployment**

### **For Production Deployment:**

1. **Set environment variable:**
   ```bash
   ENVIRONMENT=production
   ```

2. **Optional: Override limits:**
   ```bash
   RATE_LIMIT_ANONYMOUS=60
   RATE_LIMIT_AUTHENTICATED=500
   RATE_LIMIT_API_KEY=1000
   RATE_LIMIT_ADMIN=2000
   RATE_LIMIT_LOGIN=10
   ```

3. **Rebuild Docker image:**
   ```bash
   docker compose build api
   docker compose up -d api
   ```

4. **Verify:**
   ```bash
   docker compose exec api python -c "import os; print('Environment:', os.getenv('ENVIRONMENT', 'development'))"
   ```

---

## 📊 **Current Status**

**Development (Active Now):**
- ✅ Rate limits: 10000/min (effectively disabled)
- ✅ Login endpoint: Excluded
- ✅ SSO providers: Excluded
- ✅ Health checks: Excluded

**Production (When Deployed):**
- ✅ Rate limits: 60/500/1000/2000 per minute
- ✅ Login endpoint: 10 attempts/min per IP
- ✅ SSO providers: Excluded
- ✅ Health checks: Excluded

---

## 🔒 **Security Notes**

1. **Login Endpoint:** In production, login is rate limited to 10 attempts/minute per IP to prevent brute force attacks.

2. **Environment Variable:** Make sure `ENVIRONMENT=production` is set in production, otherwise development limits will be used (security risk).

3. **Monitoring:** In production, monitor 429 responses to adjust limits if needed.

---

## ✅ **No Manual Changes Needed!**

The system automatically switches between development and production settings based on the `ENVIRONMENT` variable. Just set `ENVIRONMENT=production` when deploying, and the proper rate limits will be applied automatically.

