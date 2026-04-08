# =========================
# STAGE 1 : BUILD
# =========================
# Image officielle Node.js
FROM node:18 AS builder

# Dossier de travail dans le container
WORKDIR /app

# Copier package.json et package-lock.json
COPY package*.json ./

# Installer les dépendances
RUN npm install

# Copier le reste du projet
COPY . .

# Build Strapi (si nécessaire)
RUN npm run build
# =========================
# STAGE 2 : PRODUCTION
# =========================
FROM node:18-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install --omit=dev

COPY --from=builder /app .

# Exposer le port (Strapi = )
EXPOSE 3000

# Commande pour lancer l'app
CMD ["npm", "run", "develop"]