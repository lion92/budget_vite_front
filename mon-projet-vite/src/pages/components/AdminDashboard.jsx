import React, { useState, useEffect } from 'react';
import MenuComponent from './MenuComponent.jsx';
import adminService from '../../services/adminService.js';
import './css/dashboard.scss';
import './css/dash.scss';
import './css/adminDashboard.scss';

const AdminDashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const data = await adminService.getDashboardData();
        setDashboardData(data);
      } catch (err) {
        setError('Erreur lors du chargement des données du dashboard');
        console.error('Erreur dashboard:', err);
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
          <p>Chargement des données du dashboard...</p>
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
      <div className="admin-dashboard-content">
        <div className="dashboard-header">
          <h2>Dashboard Administrateur</h2>
          <p>Vue d'ensemble des données système</p>
        </div>

        <div className="dashboard-grid">
          {dashboardData.stats && (
            <div className="dashboard-card">
              <h3>Statistiques</h3>
              <div className="stats-grid">
                {Object.entries(dashboardData.stats).map(([key, value]) => (
                  <div key={key} className="stat-item">
                    <span className="stat-label">{key}:</span>
                    <span className="stat-value">{value}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dashboardData.users && (
            <div className="dashboard-card">
              <h3>Utilisateurs ({dashboardData.users.length})</h3>
              <div className="users-preview">
                {dashboardData.users.slice(0, 5).map((user, index) => (
                  <div key={index} className="user-item">
                    <span>{user.email || user.username || `Utilisateur ${index + 1}`}</span>
                  </div>
                ))}
                {dashboardData.users.length > 5 && (
                  <p className="more-users">
                    ... et {dashboardData.users.length - 5} autres
                  </p>
                )}
              </div>
            </div>
          )}

          {dashboardData.recentActivity && (
            <div className="dashboard-card">
              <h3>Activité Récente</h3>
              <div className="activity-list">
                {dashboardData.recentActivity.map((activity, index) => (
                  <div key={index} className="activity-item">
                    <span className="activity-date">
                      {new Date(activity.date).toLocaleDateString()}
                    </span>
                    <span className="activity-description">{activity.description}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {dashboardData.metrics && (
            <div className="dashboard-card">
              <h3>Métriques</h3>
              <div className="metrics-grid">
                {Object.entries(dashboardData.metrics).map(([key, value]) => (
                  <div key={key} className="metric-item">
                    <div className="metric-value">{value}</div>
                    <div className="metric-label">{key}</div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        <div className="dashboard-actions">
          <button
            className="btn-primary"
            onClick={() => window.location.reload()}
          >
            Actualiser
          </button>
        </div>
      </div>
    );
  };

  const titre = "Dashboard Admin";
  const contenue = renderDashboardContent();

  return (
    <MenuComponent contenue={contenue} title={titre} />
  );
};

export default AdminDashboard;