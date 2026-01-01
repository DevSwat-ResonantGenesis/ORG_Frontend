#!/bin/bash

# SSL Setup Script for Frontend Container
# Run this inside or alongside your Docker container

CONTAINER_NAME="frontend"
DOMAIN="dev-swat.com"
EMAIL="your-email@example.com"  # Change this to your email

echo "🔒 Setting up SSL certificate for $DOMAIN"

# Make sure the container is running
if ! docker ps | grep -q "$CONTAINER_NAME"; then
    echo "❌ Container $CONTAINER_NAME is not running!"
    echo "Start it first with: docker run -d -p 80:80 -p 443:443 --name $CONTAINER_NAME frontend"
    exit 1
fi

# Obtain SSL certificate using certbot
echo "📜 Requesting SSL certificate from Let's Encrypt..."
docker exec $CONTAINER_NAME certbot certonly \
    --nginx \
    --non-interactive \
    --agree-tos \
    --email $EMAIL \
    -d $DOMAIN \
    -d www.$DOMAIN

# Reload nginx to apply SSL configuration
echo "🔄 Reloading nginx..."
docker exec $CONTAINER_NAME nginx -s reload

echo "✅ SSL certificate setup complete!"
echo "🌐 Your site should now be accessible at https://$DOMAIN"

