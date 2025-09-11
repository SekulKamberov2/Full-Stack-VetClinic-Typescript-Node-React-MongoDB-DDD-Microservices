FROM node:18-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY services/shared-kernel/ ./shared-kernel/
RUN cd shared-kernel && npm install && npm run build

COPY services/patient-service/package*.json ./
COPY services/patient-service/tsconfig.json ./

RUN npm install
RUN npm install ./shared-kernel

COPY services/patient-service/src ./src

RUN npm run build
RUN npm ci --only=production

RUN addgroup -g 1001 -S nodejs && \
    adduser -S patient-service -u 1001 && \
    chown -R patient-service:nodejs /app

USER patient-service

EXPOSE 3003

CMD ["node", "dist/index.js"]