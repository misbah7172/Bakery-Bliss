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
