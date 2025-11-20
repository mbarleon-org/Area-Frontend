FROM node:25-alpine AS builder
ARG BUILD_DATE=unknown
ARG VCS_REF=unknown
RUN apk add --no-cache nginx bash curl ca-certificates nodejs npm

LABEL org.opencontainers.image.title="area" \
   org.opencontainers.image.description="Area project" \
   org.opencontainers.image.source="https://github.com/mbarleon-org/Area-Frontend" \
   org.opencontainers.image.url="https://github.com/mbarleon-org/Area-Frontend" \
   org.opencontainers.image.created="${BUILD_DATE}" \
   org.opencontainers.image.revision="${VCS_REF}"

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --no-audit --prefer-offline || npm install

COPY . .
RUN npm run build

ENTRYPOINT npx serve -s dist/
