# Stage build
FROM node:22-slim AS builder
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY package*.json ./
RUN npm install

COPY . .
RUN rm -rf node_modules
RUN rm -rf dist

RUN npm install
# Generujemy Prisma Client z hardcodowanym DB URL
RUN DATABASE_URL="postgresql://postgres:asd123!@136.116.76.219:5432/habittracker" npx prisma generate

RUN npx tsc --skipLibCheck || true

# Stage final
FROM node:22-slim
WORKDIR /app

RUN apt-get update -y && apt-get install -y openssl

COPY --from=builder /app/package*.json ./
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma

EXPOSE 8080
CMD ["node", "dist/server.js"]
