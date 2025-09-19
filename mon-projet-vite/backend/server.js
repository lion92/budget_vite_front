// server.js - Serveur Express principal
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const rateLimit = require('express-rate-limit');
const morgan = require('morgan');
const path = require('path');
require('dotenv').config();

// Import des routes
const authRoutes = require('./routes/auth');
const budgetRoutes = require('./routes/budget');
const categoryRoutes = require('./routes/category');
const expenseRoutes = require('./routes/expense');
const revenueRoutes = require('./routes/revenue');
const userRoutes = require('./routes/user');

// Import des middlewares
const errorHandler = require('./middleware/errorHandler');
const { logger } = require('./utils/logger');

// Initialiser l'application Express
const app = express();

// Configuration du port
const PORT = process.env.PORT || 3010;

// ================================
// MIDDLEWARES DE SÉCURITÉ
// ================================

// Helmet pour sécuriser les headers HTTP
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            scriptSrc: ["'self'"],
            imgSrc: ["'self'", "data:", "https:"],
        },
    },
    crossOriginEmbedderPolicy: false
}));

// CORS - Configuration pour le frontend
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// Rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // limite chaque IP à 100 requêtes par windowMs
    message: 'Trop de requêtes depuis cette IP, réessayez plus tard.',
    standardHeaders: true,
    legacyHeaders: false,
});
app.use('/api/', limiter);

// ================================
// MIDDLEWARES GÉNÉRAUX
// ================================

// Compression des réponses
app.use(compression());

// Parsing du body
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging des requêtes
if (process.env.NODE_ENV === 'production') {
    app.use(morgan('combined'));
} else {
    app.use(morgan('dev'));
}

// ================================
// ROUTES DE SANTÉ
// ================================

// Health check simple
app.get('/health', (req, res) => {
    res.status(200).json({
        status: 'OK',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        environment: process.env.NODE_ENV
    });
});

// Health check détaillé
app.get('/health/detailed', async (req, res) => {
    const healthcheck = {
        uptime: process.uptime(),
        message: 'OK',
        timestamp: new Date().toISOString(),
        environment: process.env.NODE_ENV,
        version: process.env.npm_package_version || '1.0.0',
        memory: process.memoryUsage(),
        cpu: process.cpuUsage()
    };

    try {
        // Vérifier la connexion à la base de données
        const db = require('./config/database');
        await db.query('SELECT 1');
        healthcheck.database = 'Connected';
    } catch (error) {
        healthcheck.database = 'Disconnected';
        healthcheck.message = 'Degraded';
    }

    const httpStatus = healthcheck.message === 'OK' ? 200 : 503;
    res.status(httpStatus).json(healthcheck);
});

// ================================
// ROUTES API
// ================================

// Routes principales
app.use('/api/auth', authRoutes);
app.use('/api/budget', budgetRoutes);
app.use('/api/categorie', categoryRoutes);
app.use('/api/action', expenseRoutes);
app.use('/api/revenues', revenueRoutes);
app.use('/api/users', userRoutes);

// Route par défaut pour l'API
app.get('/api', (req, res) => {
    res.json({
        message: 'Budget Management API',
        version: '1.0.0',
        documentation: '/api/docs',
        health: '/health'
    });
});

// ================================
// GESTION DES ERREURS
// ================================

// Route non trouvée
app.use('*', (req, res) => {
    res.status(404).json({
        success: false,
        message: `Route ${req.originalUrl} non trouvée`
    });
});

// Middleware de gestion d'erreurs
app.use(errorHandler);

// ================================
// GESTION DES SIGNAUX
// ================================

// Gestion propre de l'arrêt du serveur
const gracefulShutdown = (signal) => {
    logger.info(`Réception du signal ${signal}. Arrêt en cours...`);

    server.close(() => {
        logger.info('Serveur HTTP fermé.');

        // Fermer la connexion à la base de données
        const db = require('./config/database');
        if (db && db.end) {
            db.end(() => {
                logger.info('Connexion à la base de données fermée.');
                process.exit(0);
            });
        } else {
            process.exit(0);
        }
    });

    // Forcer l'arrêt après 10 secondes
    setTimeout(() => {
        logger.error('Arrêt forcé du serveur.');
        process.exit(1);
    }, 10000);
};

// Écouter les signaux d'arrêt
process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

// Gestion des erreurs non capturées
process.on('uncaughtException', (error) => {
    logger.error('Erreur non capturée:', error);
    process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Promesse rejetée non gérée:', { reason, promise });
    process.exit(1);
});

// ================================
// DÉMARRAGE DU SERVEUR
// ================================

const server = app.listen(PORT, '0.0.0.0', () => {
    logger.info(`🚀 Serveur démarré sur le port ${PORT}`);
    logger.info(`📝 Environment: ${process.env.NODE_ENV}`);
    logger.info(`🔗 Health check: http://localhost:${PORT}/health`);
});

// Configurer le timeout du serveur
server.timeout = 30000; // 30 secondes

module.exports = app;