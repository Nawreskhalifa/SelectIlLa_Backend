FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --legacy-peer-deps
COPY . .
ARG STRAPI_ADMIN_BACKEND_URL
ENV STRAPI_ADMIN_BACKEND_URL=$STRAPI_ADMIN_BACKEND_URL
RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev --legacy-peer-deps && npm cache clean --force
COPY --from=builder /app/build ./build
COPY --from=builder /app/config ./config
COPY --from=builder /app/src ./src
COPY --from=builder /app/public ./public
EXPOSE 1337
ENV NODE_ENV=production
CMD ["npm", "run", "start"]