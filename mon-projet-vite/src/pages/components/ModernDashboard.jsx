import React, { useState, useEffect } from 'react';
import { Card, StatCard, FeatureCard } from './ui/Card';
import { toast } from './ui/Toast';
import './css/modern-dashboard.css';

const ModernDashboard = () => {
  const [stats, setStats] = useState([
    {
      title: "Budget Défini",
      value: "---",
      trend: "--",
      trendDirection: "neutral",
      icon: "💰",
      description: "Aucun budget n'a encore été configuré. Commencez par définir votre budget mensuel dans la section Budget pour suivre vos finances."
    },
    {
      title: "Dépenses Saisies",
      value: "0€",
      trend: "--",
      trendDirection: "neutral",
      icon: "💳",
      description: "Aucune dépense enregistrée pour le moment. Utilisez le bouton 'Nouvelle Dépense' pour commencer à suivre vos sorties d'argent."
    },
    {
      title: "Économies Calculées",
      value: "---",
      trend: "--",
      trendDirection: "neutral",
      icon: "💎",
      description: "Les économies seront calculées automatiquement une fois que vous aurez défini un budget et saisi vos dépenses."
    },
    {
      title: "Transactions",
      value: "0",
      trend: "--",
      trendDirection: "neutral",
      icon: "📊",
      description: "Aucune transaction enregistrée. Commencez à saisir vos revenus et dépenses pour voir vos statistiques financières."
    },
  ]);

  const [quickActions] = useState([
    {
      title: "Configurer Budget",
      description: "Première étape : définir un budget",
      icon: "⚙️",
      action: () => toast.info("Configuration Budget", {
        description: "Commencez par définir votre budget mensuel par catégorie. Cette fonctionnalité est disponible dans la section 'Budget' de l'application."
      })
    },
    {
      title: "Ajouter Catégories",
      description: "Personnaliser vos catégories",
      icon: "📂",
      action: () => toast.info("Gestion des Catégories", {
        description: "Créez et organisez vos catégories de dépenses (Alimentation, Transport, Loisirs, etc.) pour un suivi personnalisé."
      })
    },
    {
      title: "Première Dépense",
      description: "Enregistrer votre première transaction",
      icon: "➕",
      action: () => toast.info("Première Transaction", {
        description: "Une fois votre budget et vos catégories configurés, vous pourrez commencer à enregistrer vos dépenses et revenus."
      })
    },
    {
      title: "Guide d'utilisation",
      description: "Découvrir les fonctionnalités",
      icon: "📖",
      action: () => toast.info("Guide d'utilisation", {
        description: "Explorez les différentes sections : Budget, Catégories, Dépenses, Rapports, et Prédictions pour maîtriser l'application."
      })
    },
  ]);

  const [recentTransactions] = useState([]);

  return (
    <div className="modern-dashboard fade-in">
      <div className="dashboard-header">
        <div className="welcome-section slide-in-left">
          <h1 className="dashboard-title">
            Bienvenue dans Budget Manager
          </h1>
          <p className="dashboard-subtitle">
            Votre application de gestion financière est prête ! Commencez par configurer votre premier budget.
          </p>
        </div>
        <div className="header-actions slide-in-right">
          <button
            className="modern-btn modern-btn--primary"
            onClick={() => toast.warning("Fonction à venir", {
              description: "Les rapports financiers seront disponibles une fois que vous aurez saisi quelques transactions. Cette fonctionnalité est en cours de développement."
            })}
          >
            <span>📊</span>
            Rapports (Bientôt)
          </button>
          <button
            className="modern-btn modern-btn--secondary"
            onClick={() => toast.info("Mode Démo", {
              description: "Vous découvrez l'interface en mode démonstration. Les paramètres seront accessibles dans la version complète de l'application."
            })}
          >
            <span>⚙️</span>
            Démo
          </button>
        </div>
      </div>

      {/* Stats Cards */}
      <section className="stats-section">
        <div className="stats-grid stagger-animation">
          {stats.map((stat, index) => (
            <StatCard
              key={index}
              title={stat.title}
              value={stat.value}
              trend={stat.trend}
              trendDirection={stat.trendDirection}
              icon={stat.icon}
              className="hover-lift"
              onClick={() => toast.info(`${stat.title} - ${stat.value}`, {
                description: stat.description
              })}
            />
          ))}
        </div>
      </section>

      {/* Quick Actions */}
      <section className="quick-actions-section space-responsive-lg">
        <h2 className="section-title">Premiers Pas</h2>
        <div className="actions-grid stagger-animation">
          {quickActions.map((action, index) => (
            <FeatureCard
              key={index}
              title={action.title}
              description={action.description}
              icon={action.icon}
              action={
                <button
                  className="modern-btn modern-btn--outline"
                  onClick={action.action}
                >
                  Accéder
                </button>
              }
              className="hover-lift"
            />
          ))}
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="transactions-section">
        <div className="section-header">
          <h2 className="section-title">Historique des Transactions</h2>
          <button
            className="modern-btn modern-btn--ghost"
            onClick={() => toast.info("Aucune transaction", {
              description: "Vous n'avez encore aucune transaction enregistrée. Commencez par ajouter vos revenus et dépenses pour voir votre historique ici."
            })}
          >
            Commencer →
          </button>
        </div>

        <Card className="transactions-card slide-in-up">
          <div className="empty-state" style={{
            textAlign: 'center',
            padding: 'var(--space-8)',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontSize: '3rem', marginBottom: 'var(--space-4)' }}>📊</div>
            <h3 style={{ marginBottom: 'var(--space-2)' }}>Aucune transaction pour le moment</h3>
            <p style={{ marginBottom: 'var(--space-6)' }}>
              Vos transactions apparaîtront ici une fois que vous commencerez à utiliser l'application.
            </p>
            <button
              className="modern-btn modern-btn--outline"
              onClick={() => toast.info("Première transaction", {
                description: "Rendez-vous dans la section 'Catégories' pour créer vos catégories, puis dans 'Budget' pour configurer vos montants, et enfin utilisez 'Tâche' pour ajouter vos premières transactions."
              })}
            >
              Comment commencer ?
            </button>
          </div>
        </Card>
      </section>

      {/* Chart Section */}
      <section className="chart-section">
        <div className="chart-grid">
          <Card
            className="chart-card slide-in-left"
            onClick={() => toast.info("Graphiques à venir", {
              description: "Les graphiques d'évolution des dépenses s'afficheront ici une fois que vous aurez enregistré plusieurs transactions sur différents mois."
            })}
            style={{ cursor: 'pointer' }}
          >
            <h3 className="chart-title">Évolution des Dépenses</h3>
            <div className="chart-placeholder" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>📈</div>
              <div style={{ fontSize: 'var(--text-sm)' }}>Données insuffisantes</div>
            </div>
          </Card>

          <Card
            className="chart-card slide-in-right"
            onClick={() => toast.info("Analyses à venir", {
              description: "La répartition par catégories sera générée automatiquement lorsque vous aurez créé vos catégories et saisi quelques dépenses."
            })}
            style={{ cursor: 'pointer' }}
          >
            <h3 className="chart-title">Répartition par Catégorie</h3>
            <div className="chart-placeholder" style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              color: 'var(--text-secondary)'
            }}>
              <div style={{ fontSize: '2rem', marginBottom: 'var(--space-2)' }}>🎯</div>
              <div style={{ fontSize: 'var(--text-sm)' }}>En attente de données</div>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
};

export default ModernDashboard;