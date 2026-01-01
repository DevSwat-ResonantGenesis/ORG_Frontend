#!/bin/bash

# CDN Setup Script
# Helps configure CDN for static assets

set -e

echo "🌐 CDN Setup for Static Assets"
echo "=============================="
echo ""

# Check which CDN option
echo "📋 CDN Options:"
echo "  1. Cloudflare (Recommended - Free, easiest)"
echo "  2. DigitalOcean Spaces + CDN"
echo "  3. AWS CloudFront"
echo "  4. Custom CDN URL"
echo ""

read -p "Select option (1-4): " cdn_option

case $cdn_option in
  1)
    echo ""
    echo "🔵 Cloudflare Setup"
    echo "==================="
    echo ""
    echo "Steps:"
    echo "1. Go to https://cloudflare.com and sign up/login"
    echo "2. Add site: dev-swat.com"
    echo "3. Update nameservers at your domain registrar"
    echo "4. Wait for DNS propagation (5-60 minutes)"
    echo "5. Enable CDN in Cloudflare dashboard"
    echo ""
    echo "CDN will be automatically enabled once DNS is updated."
    echo "No code changes needed - Cloudflare proxies your site."
    ;;
    
  2)
    echo ""
    echo "🔵 DigitalOcean Spaces + CDN Setup"
    echo "=================================="
    echo ""
    echo "Steps:"
    echo "1. Create Space in DigitalOcean dashboard"
    echo "2. Enable CDN on the Space"
    echo "3. Get CDN endpoint URL"
    echo "4. Set VITE_CDN_URL environment variable"
    echo "5. Build with: VITE_CDN_URL=<cdn-url> npm run build"
    echo "6. Upload dist/ to Space"
    echo ""
    read -p "Enter CDN endpoint URL (or press Enter to skip): " cdn_url
    if [ -n "$cdn_url" ]; then
      echo "export VITE_CDN_URL=$cdn_url" >> .env.local
      echo "✅ CDN URL saved to .env.local"
    fi
    ;;
    
  3)
    echo ""
    echo "🔵 AWS CloudFront Setup"
    echo "======================"
    echo ""
    echo "Steps:"
    echo "1. Create S3 bucket for assets"
    echo "2. Upload assets to S3"
    echo "3. Create CloudFront distribution"
    echo "4. Get CloudFront domain URL"
    echo "5. Set VITE_CDN_URL environment variable"
    echo ""
    read -p "Enter CloudFront URL (or press Enter to skip): " cdn_url
    if [ -n "$cdn_url" ]; then
      echo "export VITE_CDN_URL=$cdn_url" >> .env.local
      echo "✅ CDN URL saved to .env.local"
    fi
    ;;
    
  4)
    echo ""
    echo "🔵 Custom CDN Setup"
    echo "==================="
    echo ""
    read -p "Enter CDN base URL: " cdn_url
    if [ -n "$cdn_url" ]; then
      echo "export VITE_CDN_URL=$cdn_url" >> .env.local
      echo "✅ CDN URL saved to .env.local"
      echo ""
      echo "Next steps:"
      echo "1. Build with CDN: VITE_CDN_URL=$cdn_url npm run build"
      echo "2. Upload dist/assets/ to your CDN"
      echo "3. Update nginx to reference CDN URLs"
    fi
    ;;
    
  *)
    echo "Invalid option"
    exit 1
    ;;
esac

echo ""
echo "📝 Build with CDN:"
echo "  VITE_CDN_URL=<your-cdn-url> npm run build"
echo ""
echo "📖 See docs/CDN_SETUP_GUIDE.md for detailed instructions"

