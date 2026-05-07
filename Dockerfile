FROM node:20-bullseye AS builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

ARG STRAPI_ADMIN_BACKEND_URL
ENV STRAPI_ADMIN_BACKEND_URL=$STRAPI_ADMIN_BACKEND_URL
RUN NODE_OPTIONS="--max-old-space-size=512" npm run build

FROM node:20-bullseye-slim
WORKDIR /app
COPY package*.json ./
RUN npm install --omit=dev
COPY --from=builder /app .
EXPOSE 1337
ENV NODE_ENV=production
CMD ["npm", "run", "start"]