# ---------- Stage 1: build ----------
FROM node:22-slim AS build
WORKDIR /opt/app

# เครื่องมือสำหรับ compile better-sqlite3 (กรณีไม่มี prebuilt binary)
RUN apt-get update \
 && apt-get install -y --no-install-recommends python3 make g++ \
 && rm -rf /var/lib/apt/lists/*

COPY package.json package-lock.json ./
RUN npm ci

COPY . .
ENV NODE_ENV=production
# build admin panel + compile TypeScript -> dist/ แล้วตัด devDependencies ออก
RUN npm run build && npm prune --omit=dev

# ---------- Stage 2: runtime ----------
FROM node:22-slim
WORKDIR /opt/app
ENV NODE_ENV=production

COPY --from=build /opt/app ./

# โฟลเดอร์ฐานข้อมูล SQLite และไฟล์อัปโหลด (ควร mount เป็น volume)
RUN mkdir -p .tmp public/uploads && chown -R node:node /opt/app
USER node

EXPOSE 1337
CMD ["npm", "run", "start"]
