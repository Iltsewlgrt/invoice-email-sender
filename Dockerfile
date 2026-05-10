FROM node:20-bookworm-slim AS build

WORKDIR /app

COPY package.json package-lock.json ./
RUN npm ci

COPY tsconfig.json ./
COPY src ./src

RUN npm run build


FROM node:20-bookworm-slim AS runtime

WORKDIR /app

# System deps typically required for headless Chromium used by html-pdf-node (puppeteer)
RUN apt-get update \
  && apt-get install -y --no-install-recommends \
    ca-certificates \
    fonts-liberation \
    libasound2 \
    libatk-bridge2.0-0 \
    libatk1.0-0 \
    libcairo2 \
    libcups2 \
    libdrm2 \
    libgbm1 \
    libgtk-3-0 \
    libnss3 \
    libx11-xcb1 \
    libxcomposite1 \
    libxdamage1 \
    libxfixes3 \
    libxrandr2 \
    libxshmfence1 \
    libxss1 \
    libxtst6 \
    xdg-utils \
  && rm -rf /var/lib/apt/lists/*

ENV NODE_ENV=production

COPY --from=build /app/package.json /app/package-lock.json ./
COPY --from=build /app/node_modules ./node_modules
RUN npm prune --omit=dev

COPY --from=build /app/dist ./dist

# Runtime asset used by pdfService (reads from src/templates)
COPY --from=build /app/src/templates ./src/templates

RUN mkdir -p /app/storage/invoices

EXPOSE 3000

CMD ["node", "dist/server.js"]
