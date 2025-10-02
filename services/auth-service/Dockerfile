FROM node:18-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY services/shared-kernel/ ./shared-kernel/
RUN cd shared-kernel && npm install && npm run build

COPY services/auth-service/package*.json ./
COPY services/auth-service/tsconfig.json ./

RUN npm install
RUN npm install ./shared-kernel

COPY services/auth-service/src ./src

RUN npm run build

RUN ls -la dist/events/ || echo "Events directory not found in dist"
RUN find dist/ -name "*ClientCreatedEvent*" || echo "ClientCreatedEvent not found"

RUN npm ci --only=production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S auth-service -u 1001 && \
    chown -R auth-service:nodejs /app

USER auth-service

EXPOSE 3001

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3001/health || exit 1

CMD ["node", "dist/index.js"]
