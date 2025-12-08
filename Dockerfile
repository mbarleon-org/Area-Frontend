FROM node:25-alpine AS builder
ARG BUILD_DATE=unknown
ARG VCS_REF=unknown

ARG NODE_ENV=production
ENV NODE_ENV=$NODE_ENV

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
RUN EXPO_NO_TELEMETRY=1 npx expo export --platform web --output-dir dist && \
    node -e 'const fs=require("fs");const file="/app/dist/index.html";const tag="<script src=\"/runtime-env.js\"></script>";const html=fs.readFileSync(file,"utf8");if(html.includes(tag)){process.exit(0);}if(!html.includes("</head>")){throw new Error("Unable to find </head> marker in index.html when injecting runtime env script.");}const updated=html.replace("</head>",tag + "\n</head>");fs.writeFileSync(file,updated);'

RUN chmod +x scripts/docker-entrypoint.sh

ENTRYPOINT ["/app/scripts/docker-entrypoint.sh"]
