# Image officielle Node.js
FROM node:20

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

# Exposer le port (Strapi = 1337)
EXPOSE 3000

# Commande pour lancer l'app
CMD ["npm", "run", "develop"]