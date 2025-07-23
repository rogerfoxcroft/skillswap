#!/bin/bash

# SkillSwap Backend Heroku Deployment Script

set -e

echo "🚀 Deploying SkillSwap Backend to Heroku..."

# Check if heroku CLI is installed
if ! command -v heroku &> /dev/null; then
    echo "❌ Heroku CLI is not installed. Please install it first:"
    echo "   https://devcenter.heroku.com/articles/heroku-cli"
    exit 1
fi

# Check if logged into Heroku
if ! heroku auth:whoami &> /dev/null; then
    echo "❌ Not logged into Heroku. Please run: heroku login"
    exit 1
fi

# Get app name from command line or use default
APP_NAME=${1:-skillswap-backend}

echo "📝 App name: $APP_NAME"

# Check if app exists, create if not
if ! heroku apps:info $APP_NAME &> /dev/null; then
    echo "🆕 Creating new Heroku app: $APP_NAME"
    heroku create $APP_NAME
    
    # Add PostgreSQL addon
    echo "🐘 Adding PostgreSQL addon..."
    heroku addons:create heroku-postgresql:essential-0 --app $APP_NAME
else
    echo "✅ App $APP_NAME already exists"
fi

# Set environment variables
echo "🔧 Setting environment variables..."
heroku config:set AUTH0_DOMAIN=foxcroft.uk.auth0.com --app $APP_NAME
heroku config:set AUTH0_AUDIENCE=skillswapapi --app $APP_NAME
heroku config:set GO_ENV=production --app $APP_NAME

# Set buildpack to Go
echo "🔨 Setting Go buildpack..."
heroku buildpacks:set heroku/go --app $APP_NAME

# Deploy to Heroku
echo "🚢 Deploying to Heroku..."
git push heroku master

# Open the app
echo "🎉 Deployment complete!"
echo "📱 Opening app: https://$APP_NAME.herokuapp.com"
heroku open --app $APP_NAME

# Show logs
echo "📋 Showing recent logs..."
heroku logs --tail --app $APP_NAME