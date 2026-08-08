# Multi-Stage Dockerfile for Discovery Engine Web Application & AI Service
# Stage 1: Build static React / Vite bundle
FROM node:20-alpine AS builder

WORKDIR /app

COPY package*.json ./
RUN npm ci --silent

COPY . .
RUN npm run build

# Stage 2: Production Nginx Server
FROM nginx:alpine AS runner

COPY --from=builder /app/dist /usr/share/nginx/html
EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
