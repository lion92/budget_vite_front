-- init.sql - Script d'initialisation de la base de données Budget
-- =====================================================================

-- Création de la base de données (si elle n'existe pas)
-- Normalement créée par docker-compose, mais on garde cette ligne pour la documentation
-- CREATE DATABASE budget_app;

-- Utiliser la base de données
\c budget_app;

-- =====================================================================
-- EXTENSIONS
-- =====================================================================

-- Extension pour les UUID
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Extension pour les fonctions de chiffrement
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- =====================================================================
-- TABLES PRINCIPALES
-- =====================================================================

-- Table des utilisateurs
CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    avatar_url VARCHAR(500),
    is_active BOOLEAN DEFAULT true,
    is_verified BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    last_login TIMESTAMP WITH TIME ZONE,

    -- Contraintes
    CONSTRAINT users_email_valid CHECK (email ~* '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$')
);

-- Table des catégories
CREATE TABLE IF NOT EXISTS categories (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    categorie VARCHAR(100) NOT NULL, -- Garde le nom 'categorie' pour compatibilité
    description TEXT,
    color VARCHAR(7) DEFAULT '#667eea', -- Couleur hexadécimale
    icon VARCHAR(50) DEFAULT 'folder',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Contraintes
    CONSTRAINT categories_color_valid CHECK (color ~* '^#[0-9A-Fa-f]{6}$'),
    CONSTRAINT categories_unique_per_user UNIQUE(user_id, categorie)
);

-- Table des revenus
CREATE TABLE IF NOT EXISTS revenues (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL, -- Nom du revenu
    amount DECIMAL(12,2) NOT NULL,
    date DATE NOT NULL,
    description TEXT,
    is_recurring BOOLEAN DEFAULT false,
    recurring_type VARCHAR(20), -- 'monthly', 'weekly', 'yearly'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Contraintes
    CONSTRAINT revenues_amount_positive CHECK (amount > 0),
    CONSTRAINT revenues_recurring_type_valid
        CHECK (recurring_type IS NULL OR recurring_type IN ('monthly', 'weekly', 'yearly'))
);

-- Table des dépenses (actions)
CREATE TABLE IF NOT EXISTS expenses (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
    categorie VARCHAR(100), -- Garde pour compatibilité, peut être dénormalisé
    montant DECIMAL(12,2) NOT NULL, -- Garde le nom 'montant' pour compatibilité
    description TEXT,
    date_transaction DATE NOT NULL, -- Garde le nom pour compatibilité
    receipt_url VARCHAR(500), -- URL vers le reçu/ticket
    tags TEXT[], -- Array de tags pour une recherche plus fine
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Contraintes
    CONSTRAINT expenses_amount_positive CHECK (montant > 0)
);

-- Table des budgets (optionnel, pour fixer des limites par catégorie)
CREATE TABLE IF NOT EXISTS budgets (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    category_id INTEGER REFERENCES categories(id) ON DELETE CASCADE,
    amount_limit DECIMAL(12,2) NOT NULL,
    period_type VARCHAR(20) DEFAULT 'monthly', -- 'monthly', 'weekly', 'yearly'
    start_date DATE NOT NULL,
    end_date DATE,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Contraintes
    CONSTRAINT budgets_amount_positive CHECK (amount_limit > 0),
    CONSTRAINT budgets_period_valid CHECK (period_type IN ('monthly', 'weekly', 'yearly')),
    CONSTRAINT budgets_dates_valid CHECK (end_date IS NULL OR end_date > start_date)
);

-- Table des enveloppes (système d'enveloppes budgétaires)
CREATE TABLE IF NOT EXISTS envelopes (
    id SERIAL PRIMARY KEY,
    uuid UUID DEFAULT uuid_generate_v4() UNIQUE NOT NULL,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    target_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    current_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
    color VARCHAR(7) DEFAULT '#667eea',
    description TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,

    -- Contraintes
    CONSTRAINT envelopes_amounts_positive CHECK (target_amount >= 0 AND current_amount >= 0),
    CONSTRAINT envelopes_color_valid CHECK (color ~* '^#[0-9A-Fa-f]{6}$')
);

-- Table des sessions utilisateur (pour JWT refresh tokens)
CREATE TABLE IF NOT EXISTS user_sessions (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    ip_address INET,
    user_agent TEXT
);

-- =====================================================================
-- INDEX POUR OPTIMISER LES PERFORMANCES
-- =====================================================================

-- Index pour les utilisateurs
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_uuid ON users(uuid);

-- Index pour les catégories
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_active ON categories(user_id, is_active);

-- Index pour les revenus
CREATE INDEX IF NOT EXISTS idx_revenues_user_date ON revenues(user_id, date DESC);
CREATE INDEX IF NOT EXISTS idx_revenues_user_id ON revenues(user_id);

-- Index pour les dépenses
CREATE INDEX IF NOT EXISTS idx_expenses_user_date ON expenses(user_id, date_transaction DESC);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category_id);
CREATE INDEX IF NOT EXISTS idx_expenses_user_category ON expenses(user_id, category_id);

-- Index pour les budgets
CREATE INDEX IF NOT EXISTS idx_budgets_user_active ON budgets(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_budgets_category ON budgets(category_id);

-- Index pour les enveloppes
CREATE INDEX IF NOT EXISTS idx_envelopes_user_active ON envelopes(user_id, is_active);

-- Index pour les sessions
CREATE INDEX IF NOT EXISTS idx_sessions_user_id ON user_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_sessions_token ON user_sessions(refresh_token);
CREATE INDEX IF NOT EXISTS idx_sessions_expires ON user_sessions(expires_at);

-- =====================================================================
-- FONCTIONS ET TRIGGERS
-- =====================================================================

-- Fonction pour mettre à jour automatiquement le champ updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers pour updated_at
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_categories_updated_at BEFORE UPDATE ON categories
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_revenues_updated_at BEFORE UPDATE ON revenues
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_expenses_updated_at BEFORE UPDATE ON expenses
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_budgets_updated_at BEFORE UPDATE ON budgets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_envelopes_updated_at BEFORE UPDATE ON envelopes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================================
-- DONNÉES DE TEST (OPTIONNEL)
-- =====================================================================

-- Utilisateur de test (mot de passe: "password123")
INSERT INTO users (email, password_hash, first_name, last_name, is_verified)
VALUES (
    'test@example.com',
    crypt('password123', gen_salt('bf')),
    'Test',
    'User',
    true
) ON CONFLICT (email) DO NOTHING;

-- Catégories par défaut pour l'utilisateur de test
DO $$
DECLARE
    test_user_id INTEGER;
BEGIN
    SELECT id INTO test_user_id FROM users WHERE email = 'test@example.com';

    IF test_user_id IS NOT NULL THEN
        INSERT INTO categories (user_id, categorie, description, color, icon) VALUES
            (test_user_id, 'Alimentation', 'Courses et repas', '#22c55e', 'utensils'),
            (test_user_id, 'Transport', 'Essence, transports en commun', '#3b82f6', 'car'),
            (test_user_id, 'Logement', 'Loyer, électricité, eau', '#f59e0b', 'home'),
            (test_user_id, 'Loisirs', 'Sorties, hobbies', '#ec4899', 'gamepad-2'),
            (test_user_id, 'Santé', 'Médecin, pharmacie', '#ef4444', 'heart'),
            (test_user_id, 'Éducation', 'Livres, formations', '#8b5cf6', 'book')
        ON CONFLICT (user_id, categorie) DO NOTHING;
    END IF;
END $$;

-- =====================================================================
-- VUES UTILES
-- =====================================================================

-- Vue pour les statistiques mensuelles
CREATE OR REPLACE VIEW monthly_stats AS
SELECT
    u.id as user_id,
    DATE_TRUNC('month', e.date_transaction) as month,
    SUM(e.montant) as total_expenses,
    COUNT(e.id) as expense_count,
    AVG(e.montant) as avg_expense
FROM users u
LEFT JOIN expenses e ON u.id = e.user_id
GROUP BY u.id, DATE_TRUNC('month', e.date_transaction)
ORDER BY month DESC;

-- Vue pour les dépenses par catégorie
CREATE OR REPLACE VIEW expenses_by_category AS
SELECT
    u.id as user_id,
    c.categorie,
    c.color,
    COUNT(e.id) as expense_count,
    SUM(e.montant) as total_amount,
    AVG(e.montant) as avg_amount,
    MAX(e.date_transaction) as last_expense_date
FROM users u
LEFT JOIN categories c ON u.id = c.user_id
LEFT JOIN expenses e ON c.id = e.category_id
WHERE c.is_active = true
GROUP BY u.id, c.id, c.categorie, c.color
ORDER BY total_amount DESC;

-- =====================================================================
-- PERMISSIONS ET SÉCURITÉ
-- =====================================================================

-- Créer un rôle pour l'application
CREATE ROLE budget_app_role;

-- Accorder les permissions nécessaires
GRANT CONNECT ON DATABASE budget_app TO budget_app_role;
GRANT USAGE ON SCHEMA public TO budget_app_role;
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO budget_app_role;
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO budget_app_role;

-- Créer un utilisateur pour l'application
CREATE USER budget_app_user WITH PASSWORD 'secure_password_change_me';
GRANT budget_app_role TO budget_app_user;

-- =====================================================================
-- NETTOYAGE ET MAINTENANCE
-- =====================================================================

-- Fonction pour nettoyer les sessions expirées
CREATE OR REPLACE FUNCTION cleanup_expired_sessions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM user_sessions WHERE expires_at < CURRENT_TIMESTAMP;
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Commande pour configurer un job de nettoyage automatique (à exécuter manuellement si nécessaire)
-- SELECT cron.schedule('cleanup-sessions', '0 2 * * *', 'SELECT cleanup_expired_sessions();');

COMMIT;