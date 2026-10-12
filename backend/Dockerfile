FROM node:20-slim

# Chromium for whatsapp-web.js (puppeteer)
RUN apt-get update \
  && apt-get install -y --no-install-recommends chromium fonts-noto \
  && rm -rf /var/lib/apt/lists/*

ENV PUPPETEER_SKIP_DOWNLOAD=true \
    PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium \
    WWEBJS_AUTH_PATH=/app/.wwebjs_auth

WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY index.js ./

EXPOSE 3001
CMD ["node", "index.js"]
