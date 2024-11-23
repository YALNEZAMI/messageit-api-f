# Utiliser une image Node.js comme base
FROM node:16

# Définir le répertoire de travail
WORKDIR /usr/src/app

# Copier les fichiers de l'application
COPY package*.json ./
COPY . .

# Installer les dépendances
RUN npm install

# Exposer le port utilisé par l'application
EXPOSE 3030

# Commande pour démarrer l'application
CMD ["npm", "start"]
