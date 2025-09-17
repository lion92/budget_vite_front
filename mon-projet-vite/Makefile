# Makefile pour l'application Budget
# Facilite les commandes Docker et la gestion de l'environnement

# Variables
COMPOSE_FILE_DEV = docker-compose.full.yml
COMPOSE_FILE_PROD = docker-compose.full.yml
PROJECT_NAME = budget-app

# Couleurs pour l'affichage
BLUE = \033[0;34m
GREEN = \033[0;32m
YELLOW = \033[1;33m
RED = \033[0;31m
NC = \033[0m # No Color

.PHONY: help

# =====================================================================
# AIDE
# =====================================================================
help: ## Affiche cette aide
	@echo "${BLUE}🏠 Budget Management Application${NC}"
	@echo "${BLUE}=================================${NC}"
	@echo ""
	@echo "Commandes disponibles:"
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "${GREEN}%-20s${NC} %s\n", $$1, $$2}'

# =====================================================================
# ENVIRONNEMENT
# =====================================================================
setup: ## Configuration initiale du projet
	@echo "${BLUE}📦 Configuration initiale...${NC}"
	@cp .env.example .env
	@echo "${GREEN}✅ Fichier .env créé${NC}"
	@echo "${YELLOW}⚠️  Veuillez modifier le fichier .env avec vos paramètres${NC}"

env-check: ## Vérifier la configuration des variables d'environnement
	@echo "${BLUE}🔍 Vérification de l'environnement...${NC}"
	@if [ ! -f .env ]; then echo "${RED}❌ Fichier .env manquant. Lancez 'make setup'${NC}"; exit 1; fi
	@echo "${GREEN}✅ Fichier .env trouvé${NC}"

# =====================================================================
# DÉVELOPPEMENT
# =====================================================================
dev: env-check ## Démarrer l'environnement de développement
	@echo "${BLUE}🚀 Démarrage de l'environnement de développement...${NC}"
	docker-compose -f $(COMPOSE_FILE_DEV) --profile development up -d
	@echo "${GREEN}✅ Environnement de développement démarré${NC}"
	@echo "${YELLOW}Frontend: http://localhost:3000${NC}"
	@echo "${YELLOW}Backend API: http://localhost:3010${NC}"
	@echo "${YELLOW}Base de données: localhost:5432${NC}"

dev-build: ## Construire les images pour le développement
	@echo "${BLUE}🔨 Construction des images de développement...${NC}"
	docker-compose -f $(COMPOSE_FILE_DEV) --profile development build --no-cache

dev-logs: ## Afficher les logs de développement
	docker-compose -f $(COMPOSE_FILE_DEV) --profile development logs -f

dev-down: ## Arrêter l'environnement de développement
	@echo "${BLUE}⏹️  Arrêt de l'environnement de développement...${NC}"
	docker-compose -f $(COMPOSE_FILE_DEV) --profile development down

# =====================================================================
# PRODUCTION
# =====================================================================
prod: env-check ## Démarrer l'environnement de production
	@echo "${BLUE}🚀 Démarrage de l'environnement de production...${NC}"
	docker-compose -f $(COMPOSE_FILE_PROD) --profile production up -d
	@echo "${GREEN}✅ Environnement de production démarré${NC}"
	@echo "${YELLOW}Application: http://localhost${NC}"

prod-build: ## Construire les images pour la production
	@echo "${BLUE}🔨 Construction des images de production...${NC}"
	docker-compose -f $(COMPOSE_FILE_PROD) --profile production build --no-cache

prod-logs: ## Afficher les logs de production
	docker-compose -f $(COMPOSE_FILE_PROD) --profile production logs -f

prod-down: ## Arrêter l'environnement de production
	@echo "${BLUE}⏹️  Arrêt de l'environnement de production...${NC}"
	docker-compose -f $(COMPOSE_FILE_PROD) --profile production down

# =====================================================================
# BASE DE DONNÉES
# =====================================================================
db-start: ## Démarrer uniquement la base de données
	@echo "${BLUE}🗄️  Démarrage de la base de données...${NC}"
	docker-compose -f $(COMPOSE_FILE_DEV) up -d database redis

db-stop: ## Arrêter la base de données
	@echo "${BLUE}⏹️  Arrêt de la base de données...${NC}"
	docker-compose -f $(COMPOSE_FILE_DEV) stop database redis

db-backup: ## Créer une sauvegarde de la base de données
	@echo "${BLUE}💾 Création d'une sauvegarde...${NC}"
	@mkdir -p ./database/backups
	docker-compose -f $(COMPOSE_FILE_DEV) exec database pg_dump -U budget_app_user budget_app > ./database/backups/backup_$(shell date +%Y%m%d_%H%M%S).sql
	@echo "${GREEN}✅ Sauvegarde créée dans ./database/backups/${NC}"

db-restore: ## Restaurer la base de données (usage: make db-restore FILE=backup.sql)
	@if [ -z "$(FILE)" ]; then echo "${RED}❌ Spécifiez le fichier: make db-restore FILE=backup.sql${NC}"; exit 1; fi
	@echo "${BLUE}📥 Restauration de la base de données...${NC}"
	docker-compose -f $(COMPOSE_FILE_DEV) exec -T database psql -U budget_app_user budget_app < ./database/backups/$(FILE)
	@echo "${GREEN}✅ Base de données restaurée${NC}"

db-reset: ## Réinitialiser complètement la base de données
	@echo "${RED}⚠️  ATTENTION: Cette action va supprimer toutes les données!${NC}"
	@echo -n "Continuer? [y/N] " && read ans && [ $${ans:-N} = y ]
	docker-compose -f $(COMPOSE_FILE_DEV) down -v
	docker volume rm budget-app_postgres_data || true
	@echo "${GREEN}✅ Base de données réinitialisée${NC}"

# =====================================================================
# OUTILS
# =====================================================================
tools: ## Démarrer les outils de développement (Adminer, etc.)
	@echo "${BLUE}🛠️  Démarrage des outils...${NC}"
	docker-compose -f $(COMPOSE_FILE_DEV) --profile tools up -d
	@echo "${GREEN}✅ Outils démarrés${NC}"
	@echo "${YELLOW}Adminer (DB): http://localhost:8080${NC}"

monitoring: ## Démarrer les outils de monitoring
	@echo "${BLUE}📊 Démarrage du monitoring...${NC}"
	docker-compose -f $(COMPOSE_FILE_DEV) --profile monitoring up -d
	@echo "${GREEN}✅ Monitoring démarré${NC}"
	@echo "${YELLOW}Grafana: http://localhost:3001${NC}"
	@echo "${YELLOW}Prometheus: http://localhost:9090${NC}"

# =====================================================================
# MAINTENANCE
# =====================================================================
clean: ## Nettoyer les containers et images inutilisés
	@echo "${BLUE}🧹 Nettoyage...${NC}"
	docker-compose -f $(COMPOSE_FILE_DEV) down --remove-orphans
	docker system prune -f
	docker volume prune -f
	@echo "${GREEN}✅ Nettoyage terminé${NC}"

clean-all: ## Nettoyage complet (ATTENTION: supprime tout)
	@echo "${RED}⚠️  ATTENTION: Cette action va supprimer tous les containers, images et volumes!${NC}"
	@echo -n "Continuer? [y/N] " && read ans && [ $${ans:-N} = y ]
	docker-compose -f $(COMPOSE_FILE_DEV) down -v --remove-orphans
	docker system prune -a -f --volumes
	@echo "${GREEN}✅ Nettoyage complet terminé${NC}"

restart: ## Redémarrer tous les services
	@echo "${BLUE}🔄 Redémarrage des services...${NC}"
	docker-compose -f $(COMPOSE_FILE_DEV) restart
	@echo "${GREEN}✅ Services redémarrés${NC}"

# =====================================================================
# LOGS ET DEBUG
# =====================================================================
logs: ## Afficher tous les logs
	docker-compose -f $(COMPOSE_FILE_DEV) logs -f

logs-backend: ## Afficher les logs du backend
	docker-compose -f $(COMPOSE_FILE_DEV) logs -f backend

logs-frontend: ## Afficher les logs du frontend
	docker-compose -f $(COMPOSE_FILE_DEV) logs -f frontend-dev

logs-db: ## Afficher les logs de la base de données
	docker-compose -f $(COMPOSE_FILE_DEV) logs -f database

status: ## Afficher le statut des services
	@echo "${BLUE}📊 Statut des services:${NC}"
	docker-compose -f $(COMPOSE_FILE_DEV) ps

health: ## Vérifier la santé des services
	@echo "${BLUE}🏥 Vérification de la santé des services:${NC}"
	@docker-compose -f $(COMPOSE_FILE_DEV) ps --filter "health=healthy" --format "table {{.Name}}\t{{.Status}}\t{{.Ports}}"

# =====================================================================
# DÉVELOPPEMENT FRONTEND
# =====================================================================
frontend-install: ## Installer les dépendances frontend
	@echo "${BLUE}📦 Installation des dépendances frontend...${NC}"
	npm install --legacy-peer-deps

frontend-build: ## Construire le frontend pour la production
	@echo "${BLUE}🔨 Construction du frontend...${NC}"
	npm run build

frontend-test: ## Lancer les tests frontend
	@echo "${BLUE}🧪 Tests frontend...${NC}"
	npm run test

# =====================================================================
# DÉPLOIEMENT
# =====================================================================
deploy-staging: ## Déployer en staging
	@echo "${BLUE}🚀 Déploiement en staging...${NC}"
	# Commandes de déploiement à personnaliser

deploy-prod: ## Déployer en production
	@echo "${BLUE}🚀 Déploiement en production...${NC}"
	# Commandes de déploiement à personnaliser

# =====================================================================
# SÉCURITÉ
# =====================================================================
security-scan: ## Scanner les vulnérabilités
	@echo "${BLUE}🔒 Scan de sécurité...${NC}"
	docker run --rm -v $(PWD):/app clair-scanner:latest
	npm audit

update-deps: ## Mettre à jour les dépendances
	@echo "${BLUE}📦 Mise à jour des dépendances...${NC}"
	npm update
	docker-compose -f $(COMPOSE_FILE_DEV) pull

# Commande par défaut
.DEFAULT_GOAL := help