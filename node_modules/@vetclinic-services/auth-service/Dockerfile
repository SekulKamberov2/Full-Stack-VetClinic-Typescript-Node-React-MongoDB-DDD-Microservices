FROM node:18-alpine

RUN apk add --no-cache yarn

WORKDIR /app

COPY package*.json tsconfig.json ./

RUN yarn install --frozen-lockfile --network-timeout 300000

COPY . .

RUN yarn build

EXPOSE 3001

CMD ["node", "dist/index.js"]
