FROM node:20-alpine AS builder
WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --no-audit --prefer-offline || npm install

COPY . .
RUN npm run build

ENTRYPOINT npx serve -s dist/
