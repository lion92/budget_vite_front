# 🐳 Guide Docker - Application Budget

Ce guide vous explique comment utiliser l'architecture Docker complète avec frontend, backend et base de données séparés.

## 📋 Architecture

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│                 │    │                 │    │                 │
│   FRONTEND      │    │    BACKEND      │    │   DATABASE      │
│   React/Vite    │◄──►│   Node.js       │◄──►│   PostgreSQL    │
│   Port: 3000    │    │   Port: 3010    │    │   Port: 5432    │
│                 │    │                 │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────────┐
                    │                 │
                    │     REDIS       │
                    │    (Cache)      │
                    │   Port: 6379    │
                    │                 │
                    └─────────────────┘
```

## 🚀 Démarrage rapide

### 1. Configuration initiale

```bash
# Copier le fichier d'environnement
make setup

# Ou manuellement :
cp .env.example .env
```

### 2. Modifier le fichier .env

Éditez le fichier `.env` et changez au minimum :

```env
# Mots de passe de sécurité
DB_PASSWORD=votre_mot_de_passe_db_securise
REDIS_PASSWORD=votre_mot_de_passe_redis_securise
JWT_SECRET=votre_cle_jwt_super_secrete_32_caracteres
JWT_REFRESH_SECRET=votre_cle_refresh_jwt_secrete
```

### 3. Lancer l'application

#### Développement
```bash
# Démarrer en mode développement (avec hot-reload)
make dev

# Ou avec Docker Compose directement :
docker-compose -f docker-compose.full.yml --profile development up -d
```

#### Production
```bash
# Démarrer en mode production
make prod

# Ou avec Docker Compose directement :
docker-compose -f docker-compose.full.yml --profile production up -d
```

## 🛠️ Commandes utiles

### Gestion générale
```bash
make help           # Afficher toutes les commandes disponibles
make status         # Voir le statut des services
make health         # Vérifier la santé des services
make logs           # Afficher tous les logs
make restart        # Redémarrer tous les services
```

### Base de données
```bash
make db-start       # Démarrer seulement la DB
make db-backup      # Créer une sauvegarde
make db-restore FILE=backup.sql  # Restaurer une sauvegarde
make db-reset       # ⚠️ Réinitialiser complètement la DB
```

### Outils de développement
```bash
make tools          # Démarrer Adminer (gestion DB)
make monitoring     # Démarrer Grafana + Prometheus
```

### Logs spécifiques
```bash
make logs-backend   # Logs du backend seulement
make logs-frontend  # Logs du frontend seulement
make logs-db        # Logs de la base de données
```

## 🌐 URLs d'accès

### Mode Développement
- **Frontend** : http://localhost:3000
- **Backend API** : http://localhost:3010
- **Base de données** : localhost:5432
- **Redis** : localhost:6379

### Mode Production
- **Application** : http://localhost (port 80)
- **Backend API** : http://localhost/api

### Outils (si activés)
- **Adminer** (gestion DB) : http://localhost:8080
- **Grafana** (monitoring) : http://localhost:3001
- **Prometheus** (métriques) : http://localhost:9090

## 📁 Structure des fichiers

```
📦 budget-app/
├── 🐳 Dockerfile.frontend          # Frontend React/Vite
├── 🐳 docker-compose.full.yml      # Architecture complète
├── 📄 nginx.conf                   # Configuration Nginx
├── 📄 Makefile                     # Commandes facilitées
├── 📄 .env.example                 # Variables d'environnement
│
├── 📁 backend/                     # Code du backend
│   ├── 🐳 Dockerfile              # Backend Node.js
│   ├── 📄 package.json            # Dépendances backend
│   ├── 📄 server.js               # Serveur Express
│   └── 📄 healthcheck.js          # Vérification de santé
│
├── 📁 database/                   # Configuration DB
│   ├── 📄 init.sql               # Script d'initialisation
│   └── 📁 backups/              # Sauvegardes
│
└── 📁 src/                       # Code frontend (existant)
    └── ...
```

## ⚙️ Profils Docker Compose

L'application utilise des profils pour différents environnements :

### `development`
- Frontend avec hot-reload
- Backend en mode développement
- Tous les volumes montés pour le développement

### `production`
- Frontend compilé servi par Nginx
- Backend optimisé pour la production
- Configuration de sécurité renforcée

### `tools`
- Adminer pour gérer la base de données
- Outils de développement

### `monitoring`
- Grafana pour les dashboards
- Prometheus pour les métriques

### `reverse-proxy`
- Nginx comme proxy inverse
- Gestion SSL/TLS

## 🔒 Sécurité

### Variables sensibles à changer
```env
DB_PASSWORD=           # Mot de passe base de données
REDIS_PASSWORD=        # Mot de passe Redis
JWT_SECRET=           # Clé de signature JWT (32+ caractères)
JWT_REFRESH_SECRET=   # Clé refresh JWT (32+ caractères)
ENCRYPTION_KEY=       # Clé de chiffrement (32 caractères)
```

### Bonnes pratiques
- Changez tous les mots de passe par défaut
- Utilisez des clés JWT fortes (32+ caractères aléatoires)
- En production, activez SSL/TLS
- Limitez l'accès aux ports de base de données

## 🐛 Dépannage

### Problèmes courants

#### 1. "Port already in use"
```bash
# Vérifier quels ports sont utilisés
lsof -i :3000  # Frontend
lsof -i :3010  # Backend
lsof -i :5432  # PostgreSQL

# Arrêter les services en cours
make dev-down
```

#### 2. "Database connection failed"
```bash
# Vérifier la santé des services
make health

# Vérifier les logs de la DB
make logs-db

# Redémarrer la base de données
make db-stop && make db-start
```

#### 3. "Frontend ne se connecte pas au backend"
Vérifiez dans `.env` :
```env
VITE_API_URL=http://localhost:3010  # Doit pointer vers le backend
FRONTEND_URL=http://localhost:3000  # Backend doit connaître le frontend
```

#### 4. "Permission denied"
```bash
# Sur Linux/Mac, problèmes de permissions
sudo chown -R $USER:$USER .
```

### Logs détaillés
```bash
# Logs avec timestamps
docker-compose -f docker-compose.full.yml logs -t -f

# Logs d'un service spécifique
docker-compose -f docker-compose.full.yml logs backend

# Suivre les logs en temps réel
docker-compose -f docker-compose.full.yml logs -f --tail=100
```

## 📊 Monitoring

### Health Checks
Tous les services ont des vérifications de santé :
- **Backend** : `GET /health`
- **Database** : `pg_isready`
- **Redis** : `redis-cli ping`
- **Frontend** : `curl localhost:80`

### Métriques
Avec le profil `monitoring` :
```bash
make monitoring
```
- **Grafana** : Dashboards visuels
- **Prometheus** : Collecte de métriques

## 🚀 Déploiement

### Développement local
```bash
make dev
```

### Test de production locale
```bash
make prod
```

### Déploiement serveur
1. Transférer les fichiers sur le serveur
2. Configurer les variables d'environnement
3. Lancer la production
```bash
make prod
```

## 🔄 Mises à jour

### Mise à jour des dépendances
```bash
make update-deps
```

### Reconstruction des images
```bash
# Développement
make dev-build

# Production
make prod-build
```

### Sauvegarde avant mise à jour
```bash
make db-backup
```

## 📞 Support

En cas de problème :
1. Vérifiez les logs : `make logs`
2. Vérifiez la santé des services : `make health`
3. Consultez la documentation Docker Compose
4. Vérifiez les variables d'environnement

---

🎉 **Votre application Budget est maintenant dockerisée avec une architecture moderne et scalable !**