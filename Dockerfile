FROM node:25-alpine AS builder
ARG BUILD_DATE=unknown
ARG VCS_REF=unknown

LABEL org.opencontainers.image.title="area-frontend" \
   org.opencontainers.image.description="Area project frontend" \
   org.opencontainers.image.source="https://github.com/mbarleon-org/Area-Frontend" \
   org.opencontainers.image.url="https://github.com/mbarleon-org/Area-Frontend" \
   org.opencontainers.image.created="${BUILD_DATE}" \
   org.opencontainers.image.revision="${VCS_REF}"

WORKDIR /app

COPY package.json package-lock.json* ./

RUN npm install --no-audit --prefer-offline || npm install

COPY . .
RUN npm run build

ENTRYPOINT ["sh", "-c", "npx serve -s /app/dist/"]
