# Stage 1: Build
FROM node:20-slim AS build-stage
RUN npm install -g pnpm && npm config set registry https://registry.npmmirror.com

WORKDIR /app
COPY pnpm-lock.yaml package.json ./
RUN pnpm install --no-frozen-lockfile --ignore-scripts

COPY . .
ENV DOCKER_BUILD="true" VITE_BUILD_MODE="spa"
RUN pnpm run build:spa

# Stage 2: Production
FROM node:20-slim
RUN npm install -g pnpm && npm config set registry https://registry.npmmirror.com
WORKDIR /app
COPY --from=build-stage /app/dist ./dist
COPY --from=build-stage /app/server.js ./server.js
COPY --from=build-stage /app/package.json ./package.json
COPY --from=build-stage /app/pnpm-lock.yaml ./pnpm-lock.yaml
# Only install production deps for minimal image
RUN pnpm install --prod --ignore-scripts

EXPOSE 8080
USER node
CMD ["node", "server.js"]
