# ==========================================
# Phase 1: Build Stage (Node.js)
# ==========================================
FROM node:20-slim AS build-stage

# Install system dependencies for Puppeteer (necessary for prerendering)
# We combined them and added cleanup to reduce layer size
RUN apt-get update && apt-get install -y \
    wget \
    gnupg \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libc6 \
    libcairo2 \
    libcups2 \
    libdbus-1-3 \
    libexpat1 \
    libfontconfig1 \
    libgbm1 \
    libgcc1 \
    libglib2.0-0 \
    libgtk-3-0 \
    libnss3 \
    libdrm2 \
    libnspr4 \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libstdc++6 \
    libx11-6 \
    libx11-xcb1 \
    libxcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxext6 \
    libxfixes3 \
    libxi6 \
    libxrandr2 \
    libxrender1 \
    libxshmfence1 \
    libxss1 \
    libxtst6 \
    xdg-utils \
    libxkbcommon0 \
    libatspi2.0-0 \
    --no-install-recommends \
    && rm -rf /var/lib/apt/lists/*

# Install pnpm
RUN npm install -g pnpm

# Set working directory
WORKDIR /app

# Copy lockfile and package.json for better caching
COPY pnpm-lock.yaml package.json ./

# Install dependencies (including devDependencies for build)
RUN pnpm install --frozen-lockfile

# Install Puppeteer Chrome explicitly
RUN npx puppeteer browsers install chrome

# Copy the rest of the application
COPY . .

# Set environment variables for Docker build
ENV NODE_OPTIONS="--max_old_space_size=4096" \
    DOCKER_BUILD="true" \
    VITE_BUILD_MODE="ssr"

# Run build process (SSR mode with prerendering)
RUN pnpm run build:ssr

# ==========================================
# Phase 2: Production Stage (Node.js)
# ==========================================
FROM node:20-alpine AS production-stage

WORKDIR /app

# Install pnpm for production dependency installation
RUN npm install -g pnpm

# Copy only what's needed for production
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/package.json ./package.json
COPY --from=build-stage /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build-stage /app/server.js ./server.js

# Install production dependencies only
RUN pnpm install --prod --frozen-lockfile

# Expose the port used by server.js
EXPOSE 8080

# Use a non-root user for security (if possible, node image has a 'node' user)
USER node

# Start the Node server
CMD ["npm", "start"]
