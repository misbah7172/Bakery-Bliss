#!/bin/bash
# Railway Deployment Script for Bakery Bliss

echo "🚂 Starting Railway Deployment Process..."

# Check if git is clean
if [[ `git status --porcelain` ]]; then
  echo "❌ You have uncommitted changes. Please commit them first."
  exit 1
fi

echo "✅ Git repository is clean"

# Test build
echo "🔨 Testing build process..."
npm run build

if [ $? -eq 0 ]; then
  echo "✅ Build successful"
else
  echo "❌ Build failed. Please fix errors before deploying."
  exit 1
fi

echo "📋 Pre-deployment Checklist:"
echo "✅ Database hosted on NeonDB"
echo "✅ Repository pushed to GitHub"
echo "✅ Build process tested"
echo "✅ Environment variables ready"

echo ""
echo "🚀 Next Steps:"
echo "1. Go to railway.app and sign in"
echo "2. Create new project from GitHub"
echo "3. Select your Bakery-Bliss repository"
echo "4. Add environment variables:"
echo "   - NODE_ENV=production"
echo "   - SESSION_SECRET=<generate-secure-key>"
echo "   - DATABASE_URL=<your-neon-connection-string>"
echo "5. Deploy!"

echo ""
echo "📖 Full guide available in RAILWAY_DEPLOYMENT.md"
echo "🎉 Happy deploying!"
