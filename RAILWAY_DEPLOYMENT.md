# 🚂 Railway Deployment Guide for Bakery Bliss

## Prerequisites
- GitHub account with your Bakery Bliss repository
- Railway account (free tier available)
- NeonDB database already set up ✅

## Step-by-Step Deployment

### 1. Prepare Your Repository
```bash
# Commit all changes
git add .
git commit -m "Prepare for Railway deployment"
git push origin main
```

### 2. Create New Railway Project
1. Go to [railway.app](https://railway.app)
2. Sign in with GitHub
3. Click "New Project"
4. Select "Deploy from GitHub repo"
5. Choose your `Bakery-Bliss` repository

### 3. Configure Environment Variables
In Railway dashboard → Your Project → Variables, add:

```env
NODE_ENV=production
SESSION_SECRET=your-super-secure-session-secret-here
DATABASE_URL=postgresql://neondb_owner:npg_FEcUKuz6A7SO@ep-plain-river-a5bahlde-pooler.us-east-2.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**⚠️ Important:** Generate a strong SESSION_SECRET:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 4. Configure Build Settings
Railway will automatically detect your Node.js app, but verify:
- **Build Command**: `npm run build`
- **Start Command**: `npm start`
- **Port**: Railway automatically assigns (we handle this in code)

### 5. Deploy
1. Railway will automatically deploy when you push to main
2. Monitor deployment in Railway dashboard
3. Check logs for any issues

### 6. Update Database Schema (if needed)
```bash
# Run this locally to push schema to NeonDB
npm run db:push
```

## Post-Deployment

### Custom Domain (Optional)
1. Railway dashboard → Settings → Custom Domain
2. Add your domain and configure DNS

### Monitor Your App
- **Logs**: Railway dashboard → Deployments → View Logs
- **Metrics**: Railway dashboard → Metrics
- **Database**: Check NeonDB dashboard

## Environment Variables Checklist
✅ `NODE_ENV=production`
✅ `SESSION_SECRET=<secure-random-string>`  
✅ `DATABASE_URL=<your-neon-connection-string>`

## Troubleshooting

### Common Issues
1. **Build fails**: Check build logs, ensure all dependencies in package.json
2. **Database connection**: Verify DATABASE_URL is correct
3. **Session issues**: Ensure SESSION_SECRET is set
4. **Port binding**: Railway handles PORT automatically

### Debug Commands
```bash
# Check build locally
npm run build

# Test production build locally
npm start

# Check database connection
npm run db:push
```

## Your Deployment URLs
- **App URL**: Will be `https://<project-name>.up.railway.app`
- **Database**: Already hosted on NeonDB ✅

## File Structure for Railway
```
Bakery-Bliss/
├── Dockerfile          # Container configuration
├── Procfile             # Railway process definition  
├── .railwayignore       # Files to exclude from deployment
├── .env.railway         # Environment variables template
├── package.json         # Updated with railway scripts
└── server/index.ts      # Updated for production hosting
```

## Next Steps After Deployment
1. Test all functionality on your Railway URL
2. Update any frontend API calls if needed
3. Configure custom domain (optional)
4. Set up monitoring and alerts
5. Share your live app! 🎉

---

**Need Help?**
- Railway Docs: https://docs.railway.app
- Railway Discord: https://discord.gg/railway
- NeonDB Support: https://neon.tech/docs
