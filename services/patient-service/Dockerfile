FROM node:18-alpine

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production

COPY . .

RUN npm run build

RUN npm prune --production

RUN addgroup -g 1001 -S nodejs
RUN adduser -S patient-service -u 1001

RUN chown -R patient-service:nodejs /app
USER patient-service

EXPOSE 3003

CMD ["node", "dist/index.js"]