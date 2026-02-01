# ==========================================
# Phase 1: Build Stage (Node.js) - SPA Mode
# ==========================================
FROM node:20-slim AS build-stage

# Install pnpm only (no Puppeteer dependencies needed for SPA)
RUN npm install -g pnpm

WORKDIR /app

# Copy lockfile and package.json
COPY pnpm-lock.yaml package.json ./

# Install ALL dependencies (including devDependencies for build)
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --no-frozen-lockfile --ignore-scripts

# Copy the rest of the application
COPY . .

# Set environment variables for Docker build
ENV NODE_OPTIONS="--max_old_space_size=4096" \
    DOCKER_BUILD="true" \
    VITE_BUILD_MODE="spa"

# Run build process (SPA mode - no prerendering)
RUN pnpm run build:spa

# ==========================================
# Phase 2: Final Production Stage (Minimal)
# ==========================================
FROM node:20-slim AS production-stage

WORKDIR /app

# Copy assets and node_modules from build stage
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/server.js ./server.js
COPY --from=build-stage /app/package.json ./package.json
COPY --from=build-stage /app/pnpm-lock.yaml ./pnpm-lock.yaml
COPY --from=build-stage /app/node_modules ./node_modules

# Install pnpm and prune to production dependencies only
RUN npm install -g pnpm && pnpm prune --prod

# Expose the port
EXPOSE 8080

# Use non-root user
USER node

# Start the Node server
CMD ["node", "server.js"]
