# 🌐 Frontend GitHub Actions CI/CD

## 📋 Overview

This repository contains comprehensive GitHub Actions workflows for the Genesis2026 frontend production deployment on DigitalOcean droplet `134.199.221.149`.

## 🔄 Available Workflows

### 1. 🌐 Frontend Production Deployment
**File**: `.github/workflows/deploy.yml`

**Triggers**:
- Push to `main` branch (frontend changes)
- Pull requests to `main`
- Manual dispatch

**Safety gate**:
- Production deploy only runs when repo variable `DEPLOY_ENABLED` is set to `true`.

**Features**:
- Node.js build and test
- Frontend deployment to droplet
- Performance checks
- Automatic rollback
- Backup and restore

## 🔧 Required Secrets

### 1. **DROPLET_HOST**
Droplet IP or hostname (e.g. `134.199.221.149`)

### 2. **DROPLET_USER**
SSH username (recommended: `deploy`)

### 3. **DROPLET_SSH_KEY**
SSH private key for droplet access

### 4. **SLACK_WEBHOOK** (optional)
Slack webhook for notifications

### 3. **Optional Frontend Secrets**
- **VITE_APP_API_KEY**: API key for external services
- **VITE_APP_GOOGLE_CLIENT_ID**: Google OAuth client ID
- **VITE_APP_GITHUB_CLIENT_ID**: GitHub OAuth client ID

---

## 🚀 Quick Start

### 1. Setup Repository
```bash
# Clone repository
git clone https://github.com/louienemesh/genesis2026_frontend_production_2.git
cd genesis2026_frontend_production_2

# Configure git remote
git remote set-url origin git@github.com:louienemesh/genesis2026_frontend_production_2.git
```

### 2. Configure Secrets
```bash
# Go to GitHub repository
# Settings → Secrets and variables → Actions
# Add required secrets:
# - DROPLET_SSH_KEY
# - SLACK_WEBHOOK
```

### 3. Deploy to Production
```bash
# Push to main branch
git push origin main

# Or trigger manually
# GitHub Actions → Select workflow → Run workflow
```

---

## 📊 Deployment Architecture

### **Frontend Deployment Flow**
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Local Repo     │    │   GitHub Actions│    │   Droplet        │
│   (Vue.js)       │    │   (Build/Deploy) │    │   (/var/www/)    │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         │                       │                       │
         └───────────┬───────────┴───────────┬───────────┘
                     │                       │
            ┌────────▼────────┐    ┌────────▼────────┐
            │   Build & Test   │    │   Nginx Proxy   │
            │   (npm ci/build) │    │   (Port 80/443) │
            └─────────────────┘    └─────────────────┘
```

---

## 🔍 Build Process

### **📋 Build Steps**
1. **Install Dependencies**: `npm ci --prefer-offline`
2. **Run Linting**: `npm run lint`
3. **Run Tests**: `npm run test:unit` and `npm run test:integration`
4. **Build Production**: `npm run build:prod`
5. **Security Audit**: `npm audit --audit-level moderate`
6. **Build Analysis**: File count, bundle sizes, optimization

### **📊 Build Metrics**
- **Build Hash**: SHA256 of all build files
- **Build Size**: Total size of dist directory
- **Build Time**: Time taken to build
- **File Count**: Number of files in build
- **Bundle Analysis**: Main bundle and CSS sizes

---

## 🚀 Deployment Process

### **📋 Deployment Steps**
1. **Create Backup**: Backup current frontend
2. **Transfer Files**: Copy new build to droplet
3. **Set Permissions**: www-data ownership, 755 permissions
4. **Verify Deployment**: Check accessibility and performance
5. **Performance Tests**: Response time, page size, SSL check

### **📂 Deployment Structure**
```
/var/www/frontend/
├── index.html
├── assets/
│   ├── main.js
│   ├── main.css
│   └── [other assets]
├── images/
├── favicon.ico
└── [other static files]
```

---

## 🔍 Health Monitoring

### **📋 Health Checks**
- **Main Page**: https://dev-swat.com/
- **Static Assets**: https://dev-swat.com/assets/
- **JavaScript**: https://dev-swat.com/assets/main.js
- **CSS**: https://dev-swat.com/assets/main.css

### **📊 Performance Metrics**
- **Response Time**: <3 seconds target
- **Page Size**: Optimized for fast loading
- **HTTP Status**: 200 OK expected
- **SSL Certificate**: Valid and not expiring soon

---

## 🔄 Rollback Procedures

### **🔄 Automatic Rollback**
- **Trigger**: Deployment failure
- **Action**: Restore from backup
- **Verification**: Check frontend accessibility
- **Notification**: Slack alert on rollback

### **🔄 Manual Rollback**
```bash
# GitHub Actions → Rollback Deployment
# Choose rollback type: "backup"
# Type "ROLLBACK" to confirm
# Click "Run workflow"
```

---

## 🔒 Security Features

### **🔍 Security Scanning**
- **Dependency Audit**: npm audit for vulnerabilities
- **Build Security**: No hardcoded secrets
- **SSL Verification**: Certificate validation
- **Permission Security**: Proper file permissions

### **🔒 Security Best Practices**
- **No secrets in code**: Use environment variables
- **Secure dependencies**: Regular security audits
- **SSL/TLS**: HTTPS only
- **File permissions**: 755 for directories, 644 for files

---

## 📊 Performance Optimization

### **🚀 Build Optimization**
- **Code Splitting**: Separate vendor and app bundles
- **Tree Shaking**: Remove unused code
- **Minification**: Minimize JS and CSS
- **Image Optimization**: Compressed images
- **Caching**: Proper cache headers

### **📊 Performance Monitoring**
- **Bundle Size**: Track bundle size changes
- **Build Time**: Monitor build performance
- **Load Time**: Track page load speed
- **Resource Optimization**: Optimize assets

---

## 🚨 Troubleshooting

### **Common Issues**

#### **Build Failed**
```bash
# Check build logs
npm run build:prod

# Check dependencies
npm ci

# Check linting
npm run lint
```

#### **Deployment Failed**
```bash
# Check deployment logs
ssh root@134.199.221.149
cat /tmp/frontend-deploy.log

# Check frontend files
ls -la /var/www/frontend
```

#### **Performance Issues**
```bash
# Check response time
curl -o /dev/null -s -w "%{time_total}" https://dev-swat.com/

# Check page size
curl -s https://dev-swat.com/ | wc -c

# Check HTTP headers
curl -I https://dev-swat.com/
```

---

## 📋 Best Practices

### **🚀 Development Best Practices**
1. **Test locally** before pushing
2. **Use semantic versioning** for releases
3. **Write tests** for new features
4. **Update dependencies** regularly
5. **Monitor performance** metrics

### **🔒 Security Best Practices**
1. **Use environment variables** for secrets
2. **Regular security audits** of dependencies
3. **HTTPS only** for production
4. **CSP headers** for security
5. **Regular updates** of dependencies

### **📊 Performance Best Practices**
1. **Optimize images** and assets
2. **Use code splitting** for large apps
3. **Implement caching** strategies
4. **Monitor bundle sizes**
5. **Use CDN** for static assets

---

## 🌐 Integration with Backend

### **🔗 API Integration**
- **Base URL**: https://dev-swat.com/api
- **Authentication**: JWT tokens
- **Error Handling**: Proper error responses
- **Rate Limiting**: Respect API limits

### **📊 Shared Infrastructure**
- **Droplet**: Same as backend (134.199.221.149)
- **Nginx**: Shared proxy configuration
- **SSL**: Shared SSL certificate
- **Monitoring**: Shared monitoring stack

---

## 📞 Support

### **Getting Help**
- **GitHub Issues**: Report bugs and feature requests
- **Slack**: #deployments and #frontend channels
- **Documentation**: Check README files
- **Logs**: Review GitHub Actions logs

### **Emergency Contacts**
- **Frontend Team**: frontend@dev-swat.com
- **DevOps**: devops@dev-swat.com
- **Support**: support@dev-swat.com

---

## 🎯 Success Metrics

### **🚀 Deployment Success**
- ✅ <5 minute deployment time
- ✅ <2 minute rollback time
- ✅ Zero downtime deployment
- ✅ 99.9% uptime
- ✅ <1% error rate

### **📊 Performance Success**
- ✅ <2 second page load time
- ✅ <1MB initial bundle size
- ✅ 95+ Lighthouse score
- ✅ Mobile optimized
- ✅ SEO friendly

### **🔒 Security Success**
- ✅ No critical vulnerabilities
- ✅ Regular security updates
- ✅ HTTPS only
- ✅ Secure headers
- ✅ No exposed secrets

---

## 🚀 Future Enhancements

### **Planned Features**
- **PWA support**: Progressive Web App
- **Service Workers**: Offline functionality
- **Advanced caching**: Better performance
- **A/B testing**: Feature testing
- **Internationalization**: Multi-language support

### **Integration Opportunities**
- **CI/CD optimization**: Faster builds
- **Advanced monitoring**: Better metrics
- **Performance budget**: Automated checks
- **Accessibility**: WCAG compliance
- **SEO optimization**: Better search ranking

---

**🎉 This frontend GitHub Actions setup provides enterprise-grade CI/CD with comprehensive testing, deployment, and monitoring!**

**🌐 Ready for production deployment with zero downtime and automatic rollback capabilities!**
