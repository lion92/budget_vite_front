import React, { useState, useEffect } from 'react';
import MenuComponent from './MenuComponent.jsx';
import userDashboardService from '../../services/userDashboardService.js';
import './css/dashboard.scss';
import './css/dash.scss';

const UserDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await userDashboardService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError('Erreur lors du chargement du dashboard utilisateur');
        console.error('Erreur dashboard utilisateur:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const renderDashboardContent = () => {
    if (loading) {
      return (
        <div className="loading-container">
          <div className="spinner"></div>
          <p>Chargement de votre dashboard...</p>
        </div>
      );
    }

    if (error) {
      return (
        <div className="error-container">
          <h3>Erreur</h3>
          <p>{error}</p>
          <button onClick={() => window.location.reload()}>
            Réessayer
          </button>
        </div>
      );
    }

    if (!dashboardData) {
      return (
        <div className="no-data-container">
          <p>Aucune donnée disponible</p>
        </div>
      );
    }

    return (
      <div className="user-dashboard-content">
        <div className="dashboard-header">
          <h2>Bienvenue, {dashboardData.user?.prenom || 'Utilisateur'} !</h2>
          <p>Voici un aperçu de vos finances</p>
        </div>

        <div className="dashboard-grid">
          {dashboardData.budgetSummary && (
            <div className="dashboard-card">
              <h3>Résumé Budget</h3>
              <div className="budget-summary">
                <div className="budget-item">
                  <span className="budget-label">Budget Total:</span>
                  <span className="budget-value">{dashboardData.budgetSummary.total || 0}€</span>
                </div>
                <div className="budget-item">
                  <span className="budget-label">Dépensé:</span>
                  <span className="budget-value spent">{dashboardData.budgetSummary.spent || 0}€</span>
                </div>
                <div className="budget-item">
                  <span className="budget-label">Restant:</span>
                  <span className="budget-value remaining">{dashboardData.budgetSummary.remaining || 0}€</span>
                </div>
              </div>
            </div>
          )}

          {dashboardData.recentExpenses && (
            <div className="dashboard-card">
              <h3>Dépenses Récentes</h3>
              <div className="expenses-list">
                {dashboardData.recentExpenses.length > 0 ? (
                  dashboardData.recentExpenses.map((expense, index) => (
                    <div key={index} className="expense-item">
                      <span className="expense-description">{expense.description}</span>
                      <span className="expense-amount">{expense.amount}€</span>
                      <span className="expense-date">
                        {new Date(expense.date).toLocaleDateString()}
                      </span>
                    </div>
                  ))
                ) : (
                  <p>Aucune dépense récente</p>
                )}
              </div>
            </div>
          )}

          {dashboardData.categories && (
            <div className="dashboard-card">
              <h3>Catégories</h3>
              <div className="categories-grid">
                {dashboardData.categories.map((category, index) => (
                  <div key={index} className="category-item">
                    <div className="category-name">{category.name}</div>
                    <div className="category-amount">{category.amount || 0}€</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dashboardData.monthlyStats && (
            <div className="dashboard-card">
              <h3>Statistiques du Mois</h3>
              <div className="stats-grid">
                {Object.entries(dashboardData.monthlyStats).map(([key, value]) => (
                  <div key={key} className="stat-item">
                    <div className="stat-value">{value}</div>
                    <div className="stat-label">{key}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-actions">
          <button
            className="btn-primary"
            onClick={() => window.location.href = '/budget'}
          >
            Voir Budget Complet
          </button>
          <button
            className="btn-secondary"
            onClick={() => window.location.reload()}
          >
            Actualiser
          </button>
        </div>
      </div>
    );
  };

  const titre = "Dashboard Utilisateur";
  const contenue = renderDashboardContent();

  return (
    <MenuComponent contenue={contenue} title={titre} />
  );
};

export default UserDashboard;