FROM node:18-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY services/shared-kernel/ ./shared-kernel/
RUN cd shared-kernel && npm install && npm run build

COPY services/medical-record-service/package*.json ./
COPY services/medical-record-service/tsconfig.json ./

RUN npm install

RUN npm install ./shared-kernel

COPY services/medical-record-service/src ./src

RUN npm run build

RUN npm ci --only=production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S medical-record-service -u 1001 && \
    chown -R medical-record-service:nodejs /app

USER medical-record-service

EXPOSE 3006

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3006/health || exit 1

CMD ["node", "dist/index.js"]