FROM node:18-alpine

WORKDIR /usr/src/app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

CMD ["sh", "-c", "npm run migrations:run && npm run start:prod"]
