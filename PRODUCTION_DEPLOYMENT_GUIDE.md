# Genesis Frontend - Production Deployment Guide

## Prerequisites

- Backend API deployed and accessible
- Domain name configured
- SSL certificate ready

## Step 1: Configure Production Environment

Create `.env.production` file:

```bash
# API Configuration
VITE_API_URL=https://api.yourdomain.com
VITE_WS_URL=wss://api.yourdomain.com

# Frontend URL
VITE_APP_URL=https://app.yourdomain.com

# Feature Flags
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_SENTRY=true

# Sentry (Error Tracking)
VITE_SENTRY_DSN=https://xxx@xxx.ingest.sentry.io/xxx
VITE_SENTRY_ENVIRONMENT=production

# Stripe (if using client-side)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Analytics
VITE_GA_TRACKING_ID=G-XXXXXXXXXX
```

## Step 2: Build for Production

```bash
# Install dependencies
npm install

# Build production bundle
npm run build

# Output will be in ./dist directory
```

## Step 3: Deploy to Droplet

### Option A: Using Docker (Recommended)

```bash
# On your droplet
cd /opt/genesis
git clone https://github.com/louienemesh/genesis2026_frontend.git frontend
cd frontend

# Copy production env
cp .env.production.template .env.production
nano .env.production

# Build and start
docker-compose -f docker-compose.frontend.yml up -d
```

### Option B: Direct Nginx Deployment

```bash
# Build locally
npm run build

# Copy to droplet
scp -r dist/* root@YOUR_DROPLET_IP:/var/www/genesis-frontend/

# On droplet, configure nginx
nano /etc/nginx/sites-available/genesis-frontend
```

Nginx configuration:

```nginx
server {
    listen 80;
    listen [::]:80;
    server_name app.yourdomain.com;
    
    # Redirect to HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name app.yourdomain.com;

    # SSL Configuration
    ssl_certificate /etc/letsencrypt/live/app.yourdomain.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.yourdomain.com/privkey.pem;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    # Root directory
    root /var/www/genesis-frontend;
    index index.html;

    # Gzip compression
    gzip on;
    gzip_vary on;
    gzip_min_length 1024;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/xml+rss application/json;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # SPA routing - serve index.html for all routes
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }

    # API proxy (optional, if not using separate API domain)
    location /api {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /ws {
        proxy_pass http://localhost:8000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Enable the site:

```bash
ln -s /etc/nginx/sites-available/genesis-frontend /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

## Step 4: SSL Certificate

```bash
# Install certbot
apt install certbot python3-certbot-nginx -y

# Get certificate
certbot --nginx -d app.yourdomain.com

# Auto-renewal is configured automatically
```

## Step 5: Verify Deployment

```bash
# Check if site is accessible
curl -I https://app.yourdomain.com

# Should return 200 OK
```

## Step 6: CDN Setup (Optional but Recommended)

For better performance, use a CDN like Cloudflare:

1. Sign up for Cloudflare
2. Add your domain
3. Update nameservers
4. Enable CDN and caching
5. Configure SSL/TLS to "Full (strict)"

## Production Checklist

- [ ] Environment variables configured
- [ ] Production build completed successfully
- [ ] SSL certificate installed
- [ ] Nginx configuration tested
- [ ] API endpoints accessible from frontend
- [ ] WebSocket connections working
- [ ] Static assets loading correctly
- [ ] SPA routing working (refresh on any route)
- [ ] Security headers configured
- [ ] Gzip compression enabled
- [ ] CDN configured (optional)
- [ ] Analytics tracking working
- [ ] Error tracking (Sentry) configured

## Updating Production

```bash
# Pull latest code
cd /opt/genesis/frontend
git pull origin master

# Rebuild
npm run build

# If using Docker
docker-compose -f docker-compose.frontend.yml up -d --build

# If using direct nginx
rm -rf /var/www/genesis-frontend/*
cp -r dist/* /var/www/genesis-frontend/
```

## Performance Optimization

### 1. Enable HTTP/2
Already configured in nginx above

### 2. Optimize Images
```bash
# Use WebP format
# Lazy load images
# Use responsive images
```

### 3. Code Splitting
Already handled by Vite build process

### 4. Service Worker (PWA)
```bash
# Add to vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

plugins: [
  VitePWA({
    registerType: 'autoUpdate',
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg}']
    }
  })
]
```

## Monitoring

### 1. Uptime Monitoring
Use services like:
- UptimeRobot
- Pingdom
- StatusCake

### 2. Performance Monitoring
- Google Lighthouse
- WebPageTest
- Chrome DevTools

### 3. Error Tracking
Sentry is configured in `.env.production`

## Troubleshooting

**Blank page after deployment:**
- Check browser console for errors
- Verify API URL in `.env.production`
- Check nginx error logs: `tail -f /var/log/nginx/error.log`

**API calls failing:**
- Verify CORS settings on backend
- Check API URL configuration
- Test API directly: `curl https://api.yourdomain.com/health`

**WebSocket not connecting:**
- Verify nginx WebSocket proxy configuration
- Check firewall rules
- Test WebSocket endpoint

**Assets not loading:**
- Check nginx access logs
- Verify file permissions: `chmod -R 755 /var/www/genesis-frontend`
- Clear browser cache

## Security Best Practices

1. Never commit `.env.production` to git
2. Use HTTPS everywhere
3. Configure CSP headers
4. Enable HSTS
5. Regular security updates
6. Monitor for vulnerabilities

## Support

For issues, check:
- GitHub Issues: https://github.com/louienemesh/genesis2026_frontend/issues
- Browser console for client-side errors
- Nginx logs: `/var/log/nginx/`
