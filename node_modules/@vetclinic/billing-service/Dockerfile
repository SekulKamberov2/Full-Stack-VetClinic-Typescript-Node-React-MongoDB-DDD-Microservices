FROM node:18-alpine

RUN apk add --no-cache curl
WORKDIR /app

COPY package*.json ./
RUN npm ci

COPY . .
RUN npm run build

RUN addgroup -g 1001 -S nodejs
RUN adduser -S billing-service -u 1001
RUN chown -R billing-service:nodejs /app
USER billing-service

EXPOSE 3005

HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
  CMD curl -f http://localhost:3005/health || exit 1

CMD ["node", "dist/index.js"]