# Dockerfile.backend - Backend Node.js/Express

FROM node:18-alpine

# Installer dumb-init pour une gestion correcte des signaux
RUN apk add --no-cache dumb-init

# Créer un utilisateur non-root pour la sécurité
RUN addgroup -g 1001 -S nodejs
RUN adduser -S nodejs -u 1001

# Définir le répertoire de travail
WORKDIR /app

# Copier les fichiers de package
COPY package*.json ./

# Installer les dépendances
RUN npm ci --only=production && npm cache clean --force

# Copier le code source
COPY . .

# Changer le propriétaire des fichiers
RUN chown -R nodejs:nodejs /app
USER nodejs

# Exposer le port
EXPOSE 3010

# Variables d'environnement
ENV NODE_ENV=production
ENV PORT=3010

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \
    CMD node healthcheck.js

# Utiliser dumb-init pour gérer les signaux
ENTRYPOINT ["dumb-init", "--"]

# Démarrer l'application
CMD ["node", "server.js"]