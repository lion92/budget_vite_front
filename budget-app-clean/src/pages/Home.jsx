import { useEffect } from 'react';
import { TrendingUp, TrendingDown, Receipt, DollarSign, Calendar, Sparkles, Target, PieChart } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../utils/formatters';
import { useNavigate } from 'react-router-dom';
import './Home.css';

const Home = () => {
  const {
    expenses,
    revenues,
    categories,
    fetchExpenses,
    fetchRevenues,
    fetchCategories,
    getTotalExpenses,
    getTotalRevenues,
    getExpensesByCategory,
  } = useAppStore();

  const navigate = useNavigate();
  const userId = localStorage.getItem('utilisateur');

  useEffect(() => {
    if (userId) {
      fetchExpenses(userId);
      fetchRevenues();
      fetchCategories(userId);
    }
  }, [userId]);

  const totalExpenses = getTotalExpenses();
  const totalRevenues = getTotalRevenues();
  const balance = totalRevenues - totalExpenses;
  const expenseCount = expenses.length;

  // Get current month expenses
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  const monthExpenses = expenses.filter((exp) => {
    const expDate = new Date(exp.dateTransaction.toString().replace(/\//g, '-'));
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });
  const monthTotal = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.montant || 0), 0);

  // Expenses by category
  const expensesByCategory = getExpensesByCategory();
  const topCategories = Object.entries(expensesByCategory)
    .sort((a, b) => b[1].total - a[1].total)
    .slice(0, 3);

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const currentMonthName = monthNames[currentMonth];

  return (
    <div className="home-page">
      {/* Hero Section */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <Sparkles className="hero-icon" size={32} />
              Bienvenue dans votre espace financier
            </h1>
            <p className="hero-subtitle">Gérez votre budget intelligemment et atteignez vos objectifs</p>
          </div>
          <div className="hero-balance">
            <p className="balance-label">Solde actuel</p>
            <h2 className={`balance-amount ${balance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(balance)}
            </h2>
            <p className="balance-info">
              {balance >= 0 ? '✓ Votre budget est sain' : '⚠ Attention à vos dépenses'}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <StatCard
          title="Dépenses totales"
          value={formatCurrency(totalExpenses)}
          icon={TrendingDown}
          color="danger"
        />
        <StatCard
          title="Revenus totaux"
          value={formatCurrency(totalRevenues)}
          icon={TrendingUp}
          color="success"
        />
        <StatCard
          title={`${currentMonthName} ${currentYear}`}
          value={formatCurrency(monthTotal)}
          icon={Calendar}
          color="primary"
        />
        <StatCard
          title="Transactions"
          value={expenseCount}
          icon={Receipt}
          color="warning"
        />
      </div>

      {/* Main Content Grid */}
      <div className="content-grid">
        {/* Top Categories */}
        <div className="card highlight-card">
          <div className="card-header">
            <h3 className="card-title">
              <PieChart size={20} />
              Top 3 Catégories
            </h3>
          </div>
          <div className="card-body">
            {topCategories.length > 0 ? (
              <div className="categories-list">
                {topCategories.map(([category, data], index) => (
                  <div key={category} className="category-item">
                    <div className="category-rank">{index + 1}</div>
                    <div className="category-details">
                      <span className="category-name">{category}</span>
                      <span className="category-count">{data.count} transaction{data.count > 1 ? 's' : ''}</span>
                    </div>
                    <div className="category-amount">{formatCurrency(data.total)}</div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="empty-state">Aucune catégorie pour le moment</p>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="card highlight-card">
          <div className="card-header">
            <h3 className="card-title">
              <Target size={20} />
              Actions rapides
            </h3>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <button className="action-btn primary" onClick={() => navigate('/expenses')}>
                <Receipt size={20} />
                <span>Ajouter une dépense</span>
              </button>
              <button className="action-btn success" onClick={() => navigate('/revenues')}>
                <TrendingUp size={20} />
                <span>Ajouter un revenu</span>
              </button>
              <button className="action-btn info" onClick={() => navigate('/monthly-expenses')}>
                <Calendar size={20} />
                <span>Voir le mois</span>
              </button>
            </div>
          </div>
        </div>

        {/* Financial Insights */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Aperçu financier</h3>
          </div>
          <div className="card-body">
            <div className="insights-grid">
              <div className="insight-item">
                <span className="insight-icon positive">💰</span>
                <div>
                  <p className="insight-label">Taux d'épargne</p>
                  <p className="insight-value">
                    {totalRevenues > 0
                      ? `${((balance / totalRevenues) * 100).toFixed(1)}%`
                      : '0%'}
                  </p>
                </div>
              </div>
              <div className="insight-item">
                <span className="insight-icon info">📊</span>
                <div>
                  <p className="insight-label">Dépense moyenne</p>
                  <p className="insight-value">
                    {formatCurrency(expenseCount > 0 ? totalExpenses / expenseCount : 0)}
                  </p>
                </div>
              </div>
              <div className="insight-item">
                <span className="insight-icon warning">📈</span>
                <div>
                  <p className="insight-label">Budget du mois</p>
                  <p className="insight-value">{formatCurrency(monthTotal)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="card mt-6">
        <div className="card-header">
          <h3 className="card-title">Dernières dépenses</h3>
        </div>
        <div className="card-body">
          {expenses.length === 0 ? (
            <p className="text-secondary">Aucune dépense enregistrée</p>
          ) : (
            <div className="recent-expenses">
              {expenses
                .sort((a, b) => {
                  const dateA = new Date(a.dateTransaction?.toString().replace(/\//g, '-'));
                  const dateB = new Date(b.dateTransaction?.toString().replace(/\//g, '-'));
                  return dateB - dateA; // Plus récent en premier
                })
                .slice(0, 5)
                .map((expense) => {
                  const expDate = new Date(expense.dateTransaction?.toString().replace(/\//g, '-'));
                  const formattedDate = expDate.toLocaleDateString('fr-FR', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  });

                  return (
                    <div key={expense.id} className="expense-item">
                      <div className="expense-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className="expense-date" style={{
                            fontSize: '0.75rem',
                            color: '#6b7280',
                            backgroundColor: '#f3f4f6',
                            padding: '0.25rem 0.5rem',
                            borderRadius: '0.375rem',
                            fontWeight: '500'
                          }}>
                            {formattedDate}
                          </span>
                          <span className="expense-category">{expense.categorie}</span>
                        </div>
                        <span className="expense-description">{expense.description}</span>
                      </div>
                      <span className="expense-amount">{formatCurrency(expense.montant)}</span>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
