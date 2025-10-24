#!/bin/bash

# test-setup.sh - Script de test pour valider l'architecture Docker
set -e

# Couleurs pour l'affichage
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Variables
COMPOSE_FILE="docker-compose.full.yml"
BACKEND_URL="http://localhost:3010"
FRONTEND_URL="http://localhost:3000"
DB_CONTAINER="budget-database"

echo -e "${BLUE}🐳 Test de l'architecture Docker Budget App${NC}"
echo -e "${BLUE}===============================================${NC}"
echo

# =====================================================================
# FONCTIONS UTILITAIRES
# =====================================================================

log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

check_command() {
    if command -v $1 &> /dev/null; then
        log_success "$1 est installé"
        return 0
    else
        log_error "$1 n'est pas installé"
        return 1
    fi
}

wait_for_service() {
    local url=$1
    local service_name=$2
    local max_attempts=30
    local attempt=1

    log_info "Attente du service $service_name ($url)..."

    while [ $attempt -le $max_attempts ]; do
        if curl -f -s $url >/dev/null 2>&1; then
            log_success "$service_name est prêt"
            return 0
        fi

        echo -n "."
        sleep 2
        attempt=$((attempt + 1))
    done

    log_error "$service_name n'est pas accessible après $((max_attempts * 2)) secondes"
    return 1
}

test_api_endpoint() {
    local endpoint=$1
    local expected_status=$2
    local description=$3

    log_info "Test: $description"

    local response=$(curl -s -w "%{http_code}" -o /tmp/response.json "$BACKEND_URL$endpoint")

    if [ "$response" = "$expected_status" ]; then
        log_success "API $endpoint répond avec le statut $expected_status"
        return 0
    else
        log_error "API $endpoint a répondu avec le statut $response (attendu: $expected_status)"
        return 1
    fi
}

# =====================================================================
# VÉRIFICATIONS PRÉALABLES
# =====================================================================

log_info "Vérification des prérequis..."

# Vérifier Docker
if ! check_command docker; then
    log_error "Docker n'est pas installé. Veuillez l'installer : https://docs.docker.com/get-docker/"
    exit 1
fi

# Vérifier Docker Compose
if ! check_command docker-compose; then
    log_error "Docker Compose n'est pas installé. Veuillez l'installer."
    exit 1
fi

# Vérifier curl
if ! check_command curl; then
    log_error "curl n'est pas installé. Nécessaire pour les tests d'API."
    exit 1
fi

# Vérifier que Docker fonctionne
if ! docker info >/dev/null 2>&1; then
    log_error "Docker ne fonctionne pas. Veuillez démarrer Docker."
    exit 1
fi

log_success "Tous les prérequis sont satisfaits"
echo

# =====================================================================
# VÉRIFICATION DU FICHIER .ENV
# =====================================================================

log_info "Vérification de la configuration..."

if [ ! -f .env ]; then
    log_warning "Fichier .env non trouvé. Création depuis .env.example"
    if [ -f .env.example ]; then
        cp .env.example .env
        log_success "Fichier .env créé"
    else
        log_error "Fichier .env.example non trouvé"
        exit 1
    fi
fi

# Vérifier les variables critiques
if ! grep -q "DB_PASSWORD=" .env || ! grep -q "JWT_SECRET=" .env; then
    log_warning "Variables d'environnement importantes manquantes dans .env"
    log_info "Assurez-vous de configurer DB_PASSWORD et JWT_SECRET"
fi

log_success "Configuration vérifiée"
echo

# =====================================================================
# NETTOYAGE PRÉALABLE
# =====================================================================

log_info "Nettoyage de l'environnement précédent..."

# Arrêter les services s'ils tournent
docker-compose -f $COMPOSE_FILE down --remove-orphans >/dev/null 2>&1 || true

log_success "Environnement nettoyé"
echo

# =====================================================================
# DÉMARRAGE DES SERVICES
# =====================================================================

log_info "Démarrage des services de base (database, redis)..."

# Démarrer la base de données et Redis
if ! docker-compose -f $COMPOSE_FILE up -d database redis; then
    log_error "Échec du démarrage de la base de données et Redis"
    exit 1
fi

# Attendre que la base de données soit prête
log_info "Attente de la base de données..."
sleep 10

# Vérifier la santé de la base de données
if ! docker-compose -f $COMPOSE_FILE exec database pg_isready -U budget_app_user >/dev/null 2>&1; then
    log_error "La base de données n'est pas prête"
    docker-compose -f $COMPOSE_FILE logs database
    exit 1
fi

log_success "Base de données prête"

# Démarrer le backend
log_info "Démarrage du backend..."

if ! docker-compose -f $COMPOSE_FILE up -d backend; then
    log_error "Échec du démarrage du backend"
    exit 1
fi

# Attendre que le backend soit prêt
if ! wait_for_service "$BACKEND_URL/health" "Backend"; then
    log_error "Le backend n'est pas accessible"
    docker-compose -f $COMPOSE_FILE logs backend
    exit 1
fi

# Démarrer le frontend (développement)
log_info "Démarrage du frontend..."

if ! docker-compose -f $COMPOSE_FILE --profile development up -d frontend-dev; then
    log_error "Échec du démarrage du frontend"
    exit 1
fi

# Attendre que le frontend soit prêt
if ! wait_for_service "$FRONTEND_URL" "Frontend"; then
    log_warning "Le frontend pourrait prendre plus de temps à démarrer (Vite build)"
    sleep 30
    if ! wait_for_service "$FRONTEND_URL" "Frontend"; then
        log_error "Le frontend n'est pas accessible"
        docker-compose -f $COMPOSE_FILE logs frontend-dev
        exit 1
    fi
fi

echo
log_success "Tous les services sont démarrés"
echo

# =====================================================================
# TESTS DE SANTÉ
# =====================================================================

log_info "Tests de santé des services..."

# Test de la base de données
log_info "Test de la base de données..."
if docker-compose -f $COMPOSE_FILE exec database psql -U budget_app_user -d budget_app -c "SELECT 1;" >/dev/null 2>&1; then
    log_success "Base de données accessible"
else
    log_error "Base de données non accessible"
fi

# Test de Redis
log_info "Test de Redis..."
if docker-compose -f $COMPOSE_FILE exec redis redis-cli ping >/dev/null 2>&1; then
    log_success "Redis accessible"
else
    log_error "Redis non accessible"
fi

echo

# =====================================================================
# TESTS DES API
# =====================================================================

log_info "Tests des endpoints API..."

# Test du health check
test_api_endpoint "/health" "200" "Health check principal"

# Test du health check détaillé
test_api_endpoint "/health/detailed" "200" "Health check détaillé"

# Test de l'endpoint API principal
test_api_endpoint "/api" "200" "Endpoint API principal"

# Test d'un endpoint non existant
test_api_endpoint "/api/nonexistent" "404" "Gestion des erreurs 404"

echo

# =====================================================================
# TESTS DE PERFORMANCE BASIQUES
# =====================================================================

log_info "Tests de performance basiques..."

# Test de temps de réponse
response_time=$(curl -o /dev/null -s -w '%{time_total}' "$BACKEND_URL/health")
if (( $(echo "$response_time < 1" | bc -l) )); then
    log_success "Temps de réponse acceptable: ${response_time}s"
else
    log_warning "Temps de réponse lent: ${response_time}s"
fi

# Vérifier l'utilisation mémoire des containers
log_info "Vérification de l'utilisation des ressources..."
docker stats --no-stream --format "table {{.Container}}\t{{.CPUPerc}}\t{{.MemUsage}}" | head -5

echo

# =====================================================================
# VÉRIFICATION DES VOLUMES ET PERSISTANCE
# =====================================================================

log_info "Tests de persistance des données..."

# Vérifier les volumes
volumes=$(docker volume ls --filter "name=budget" --format "{{.Name}}")
if [ -n "$volumes" ]; then
    log_success "Volumes de persistance créés:"
    echo "$volumes" | while read volume; do
        echo "  - $volume"
    done
else
    log_warning "Aucun volume de persistance trouvé"
fi

echo

# =====================================================================
# TESTS DE CONNECTIVITÉ RÉSEAU
# =====================================================================

log_info "Tests de connectivité réseau..."

# Test de communication backend -> database
if docker-compose -f $COMPOSE_FILE exec backend nc -z database 5432 >/dev/null 2>&1; then
    log_success "Backend peut se connecter à la base de données"
else
    log_error "Problème de connectivité backend -> database"
fi

# Test de communication backend -> redis
if docker-compose -f $COMPOSE_FILE exec backend nc -z redis 6379 >/dev/null 2>&1; then
    log_success "Backend peut se connecter à Redis"
else
    log_error "Problème de connectivité backend -> redis"
fi

echo

# =====================================================================
# RÉSUMÉ ET RECOMMANDATIONS
# =====================================================================

log_info "Résumé des tests..."

# Obtenir le statut des services
services_status=$(docker-compose -f $COMPOSE_FILE ps --format json | jq -r '.Name + ": " + .State')

echo -e "${BLUE}Statut des services:${NC}"
echo "$services_status"
echo

# URLs d'accès
echo -e "${BLUE}🌐 URLs d'accès:${NC}"
echo "  Frontend:     $FRONTEND_URL"
echo "  Backend API:  $BACKEND_URL"
echo "  Health Check: $BACKEND_URL/health"
echo "  Database:     localhost:5432"
echo "  Redis:        localhost:6379"
echo

# Commandes utiles
echo -e "${BLUE}📝 Commandes utiles:${NC}"
echo "  Logs:         docker-compose -f $COMPOSE_FILE logs -f"
echo "  Arrêt:        docker-compose -f $COMPOSE_FILE down"
echo "  Statut:       docker-compose -f $COMPOSE_FILE ps"
echo "  Makefile:     make help"
echo

# Recommandations
echo -e "${YELLOW}💡 Recommandations:${NC}"
echo "  1. Changez les mots de passe par défaut dans .env"
echo "  2. Configurez SSL/TLS pour la production"
echo "  3. Mettez en place des sauvegardes automatiques"
echo "  4. Surveillez les logs en production"
echo

log_success "Tests terminés ! Votre architecture Docker est fonctionnelle."
echo -e "${GREEN}🎉 Vous pouvez maintenant utiliser votre application Budget !${NC}"