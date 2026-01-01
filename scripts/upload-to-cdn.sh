#!/bin/bash

# Upload Assets to CDN
# Supports DigitalOcean Spaces, AWS S3, or custom CDN

set -e

CDN_TYPE="${CDN_TYPE:-do}"  # do, aws, or custom
DIST_DIR="${DIST_DIR:-./dist}"
CDN_URL="${CDN_URL:-}"

echo "📦 Uploading Assets to CDN"
echo "=========================="
echo ""

# Check if dist directory exists
if [ ! -d "$DIST_DIR" ]; then
  echo "❌ Dist directory not found: $DIST_DIR"
  echo "   Run 'npm run build' first"
  exit 1
fi

case $CDN_TYPE in
  do)
    echo "🔵 DigitalOcean Spaces"
    echo ""
    
    if [ -z "$DO_SPACE_NAME" ] || [ -z "$DO_SPACE_REGION" ]; then
      echo "⚠️  DigitalOcean Spaces credentials not set"
      echo "   Set DO_SPACE_NAME and DO_SPACE_REGION environment variables"
      echo "   Or install doctl and configure: doctl auth init"
      exit 1
    fi
    
    # Use doctl if available
    if command -v doctl &> /dev/null; then
      echo "📤 Uploading to DigitalOcean Space: $DO_SPACE_NAME"
      doctl compute cdn upload "$DIST_DIR/assets" \
        --space "$DO_SPACE_NAME" \
        --region "$DO_SPACE_REGION" \
        --public
      echo "✅ Upload complete"
    else
      echo "⚠️  doctl not installed"
      echo "   Install: https://docs.digitalocean.com/reference/doctl/how-to/install/"
      echo "   Or use s3cmd with Spaces endpoint"
    fi
    ;;
    
  aws)
    echo "🔵 AWS S3/CloudFront"
    echo ""
    
    if [ -z "$AWS_BUCKET" ]; then
      echo "⚠️  AWS credentials not configured"
      echo "   Set AWS_BUCKET environment variable"
      echo "   Configure AWS CLI: aws configure"
      exit 1
    fi
    
    if command -v aws &> /dev/null; then
      echo "📤 Uploading to S3 bucket: $AWS_BUCKET"
      aws s3 sync "$DIST_DIR/assets" "s3://$AWS_BUCKET/assets" \
        --acl public-read \
        --cache-control "public, max-age=31536000, immutable"
      echo "✅ Upload complete"
      
      if [ -n "$CLOUDFRONT_DIST_ID" ]; then
        echo "🔄 Invalidating CloudFront cache..."
        aws cloudfront create-invalidation \
          --distribution-id "$CLOUDFRONT_DIST_ID" \
          --paths "/assets/*"
        echo "✅ Cache invalidation complete"
      fi
    else
      echo "⚠️  AWS CLI not installed"
      echo "   Install: https://aws.amazon.com/cli/"
    fi
    ;;
    
  custom)
    echo "🔵 Custom CDN"
    echo ""
    
    if [ -z "$CDN_URL" ]; then
      echo "⚠️  CDN_URL not set"
      echo "   Set CDN_URL environment variable"
      exit 1
    fi
    
    echo "📤 Upload to: $CDN_URL"
    echo "   Manual upload required"
    echo "   Upload contents of $DIST_DIR/assets/ to your CDN"
    ;;
    
  *)
    echo "❌ Unknown CDN type: $CDN_TYPE"
    echo "   Supported: do, aws, custom"
    exit 1
    ;;
esac

echo ""
echo "✅ CDN upload process complete!"
echo ""
echo "💡 Next steps:"
echo "   1. Verify assets are accessible at CDN URL"
echo "   2. Test website loads correctly"
echo "   3. Monitor CDN performance"

