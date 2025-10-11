import React, { useState, useEffect } from 'react';
import { Card, StatCard, FeatureCard } from './ui/Card';
import { toast } from './ui/Toast';
import './css/modern-dashboard.css';

const ModernDashboard = () => {

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
      </div>


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
              className="hover-lift"
            />
          ))}
        </div>
      </section>

      {/* Recent Transactions */}
      <section className="transactions-section">
        <div className="section-header">
          <h2 className="section-title">Historique des Transactions</h2>
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