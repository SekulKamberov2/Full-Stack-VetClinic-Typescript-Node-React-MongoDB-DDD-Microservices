FROM node:18-alpine

RUN apk add --no-cache curl

WORKDIR /app

COPY services/shared-kernel/ ./shared-kernel/
RUN cd shared-kernel && npm install && npm run build

COPY services/billing-service/package*.json ./
COPY services/billing-service/tsconfig.json ./

RUN npm install

RUN npm install ./shared-kernel

COPY services/billing-service/src ./src

RUN npm run build

RUN npm ci --only=production

EXPOSE 3005

CMD ["node", "dist/index.js"]