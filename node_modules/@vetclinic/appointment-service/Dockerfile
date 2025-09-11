FROM node:18-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY services/shared-kernel/ ./shared-kernel/
RUN cd shared-kernel && npm install && npm run build

COPY services/appointment-service/package*.json ./
COPY services/appointment-service/tsconfig.json ./

RUN npm install
RUN npm install ./shared-kernel

COPY services/appointment-service/src ./src

RUN npm run build
RUN npm ci --only=production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S appointment-service -u 1001 && \
    chown -R appointment-service:nodejs /app

USER appointment-service

EXPOSE 3004

CMD ["node", "dist/index.js"]