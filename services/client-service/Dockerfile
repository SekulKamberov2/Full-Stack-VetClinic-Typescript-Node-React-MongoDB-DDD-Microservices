FROM node:18-alpine

RUN apk add --no-cache curl

WORKDIR /app
 
COPY services/shared-kernel ./shared-kernel/
RUN cd shared-kernel && npm install && npm run build
 
COPY services/client-service/package*.json ./
COPY services/client-service/tsconfig.json ./
COPY services/client-service/src ./src

RUN npm install
RUN npm install ./shared-kernel

RUN npm run build
RUN npm ci --only=production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S client-service -u 1001 && \
    chown -R client-service:nodejs /app

USER client-service

EXPOSE 3002

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3002/health || exit 1

CMD ["node", "dist/index.js"]
