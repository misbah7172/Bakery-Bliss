# Railway Deployment Guide - Bakery Bliss

## Overview
This guide provides step-by-step instructions for deploying the Bakery Bliss full-stack application to Railway.

## Prerequisites
- Node.js 20+ 
- Railway account
- NeonDB PostgreSQL database (already configured)
- GitHub repository

## Deployment Configuration

### 1. Package.json Configuration
The project uses a split build process:
- `build:client`: Uses Vite with esbuild optimizations 
- `build:server`: Uses esbuild for server bundling
- Both processes avoid rollup native binary dependencies

### 2. Docker Configuration (Dockerfile)
```dockerfile
# Railway deployment configuration - using standard node image
FROM node:20

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install ALL dependencies (including dev for build)
RUN npm install

# Force install the correct rollup binary for Linux x64 GNU
RUN npm install @rollup/rollup-linux-x64-gnu@^4.24.4 --no-save || echo "Optional rollup binary installation failed, continuing..."

# Copy source code
COPY . .

# Build the application
RUN npm run build

# Remove dev dependencies after build
RUN npm prune --production

# Expose port
EXPOSE 5000

# Start the application
CMD ["npm", "start"]
```

### 3. Railway Configuration (railway.toml)
```toml
[build]
buildCommand = "npm run build"

[deploy]
startCommand = "npm start"
healthcheckPath = "/"
healthcheckTimeout = 300
restartPolicyType = "ON_FAILURE"
restartPolicyMaxRetries = 10

[[services]]
name = "bakery-bliss"

[services.env]
NODE_ENV = "production"
ROLLUP_BUNDLER = "native"
ROLLUP_OS = "linux"
ROLLUP_CPU = "x64"
ROLLUP_LIBC = "glibc"
SKIP_OPTIONALS = "false"
BUILD_ENV = "production"
```

### 4. Vite Configuration 
The vite.config.ts is optimized to:
- Use esbuild for minification and optimization
- Target ES2020 for better compatibility
- Exclude optional rollup dependencies
- Use manual chunk configuration

## Deployment Steps

### Step 1: Prepare Repository
1. Ensure all configuration files are committed:
   - `Dockerfile`
   - `railway.toml`
   - `.railwayignore`
   - Updated `package.json`
   - Updated `vite.config.ts`

### Step 2: Railway Setup
1. Visit [Railway.app](https://railway.app)
2. Create new project
3. Connect GitHub repository
4. Select the Bakery-Bliss repository

### Step 3: Environment Variables
Set the following environment variables in Railway:
```
NODE_ENV=production
DATABASE_URL=your_neondb_connection_string
PORT=5000
```

### Step 4: Deploy
1. Railway will automatically detect the Dockerfile
2. First build may take 5-10 minutes
3. Monitor build logs for any issues
4. Once deployed, test the application

## Build Process Details

### Client Build (Vite + esbuild)
- Transpiles React/TypeScript to ES2020
- Bundles all client-side assets
- Outputs to `dist/public/`
- Uses esbuild for fast compilation

### Server Build (esbuild)
- Bundles Node.js/Express server
- External packages remain unbundled
- Outputs to `dist/index.js`
- ESM format for modern Node.js

## Troubleshooting

### Common Issues

1. **Rollup Native Binary Errors**
   - Solution: Use standard Node.js image (not Alpine)
   - Force install correct binary during Docker build
   - Configure vite to prefer esbuild over rollup

2. **Build Timeouts**
   - Solution: Increase Railway build timeout
   - Split build into smaller steps
   - Use build caching where possible

3. **Memory Issues**
   - Solution: Set NODE_OPTIONS="--max_old_space_size=4096"
   - Optimize bundle size
   - Use dynamic imports for code splitting

### Health Checks
Railway automatically performs health checks on `healthcheckPath: "/"`.
Ensure your Express server responds with 200 status on the root route.

### Logs
Monitor deployment logs in Railway dashboard:
- Build logs: Show compilation process
- Deploy logs: Show runtime issues
- Application logs: Show Express server output

## Testing Deployment

1. **Frontend Test**: Visit deployed URL
2. **Backend Test**: Check API endpoints
3. **Database Test**: Verify database connectivity
4. **Authentication Test**: Test login/register flows

## Performance Optimization

### Client Optimization
- Code splitting with dynamic imports
- Image optimization
- CSS minification
- Gzip compression enabled

### Server Optimization  
- Express static file serving
- Database connection pooling
- Error handling and logging
- Process management

## Scaling Considerations

### Horizontal Scaling
- Railway supports automatic scaling
- Consider Redis for session storage
- Use CDN for static assets

### Database Scaling
- NeonDB handles connection pooling
- Consider read replicas for high traffic
- Monitor database performance

## Security
- Environment variables for secrets
- HTTPS enforced by Railway
- CORS configuration
- Input validation and sanitization

## Maintenance
- Monitor application metrics
- Regular dependency updates
- Database backup strategy
- Log monitoring and alerts

This configuration should successfully deploy the Bakery Bliss application to Railway while avoiding the rollup native binary issues encountered previously.
