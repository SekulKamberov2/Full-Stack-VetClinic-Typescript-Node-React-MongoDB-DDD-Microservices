FROM node:18-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY services/shared-kernel/ ./shared-kernel/
RUN cd shared-kernel && npm install && npm run build

COPY services/api-gateway/package*.json ./
COPY services/api-gateway/tsconfig.json ./
COPY services/api-gateway/src ./src

RUN npm install
RUN npm install ./shared-kernel

RUN npm run build

RUN npm ci --only=production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S api-gateway -u 1001 && \
    chown -R api-gateway:nodejs /app

USER api-gateway

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3000/health || exit 1

CMD ["node", "dist/index.js"]