import { useEffect } from 'react';
import { TrendingUp, TrendingDown, Receipt, DollarSign } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../utils/formatters';
import './Home.css';

const Home = () => {
  const {
    expenses,
    revenues,
    fetchExpenses,
    fetchRevenues,
    getTotalExpenses,
    getTotalRevenues,
  } = useAppStore();

  const userId = localStorage.getItem('utilisateur');

  useEffect(() => {
    if (userId) {
      fetchExpenses(userId);
      fetchRevenues();
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
    const expDate = new Date(exp.dateTransaction);
    return expDate.getMonth() === currentMonth && expDate.getFullYear() === currentYear;
  });
  const monthTotal = monthExpenses.reduce((sum, exp) => sum + parseFloat(exp.montant || 0), 0);

  return (
    <div className="home-page">
      <div className="page-header">
        <h1>Tableau de bord</h1>
        <p>Vue d'ensemble de vos finances</p>
      </div>

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
          title="Solde"
          value={formatCurrency(balance)}
          icon={DollarSign}
          color={balance >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          title="Nombre de dépenses"
          value={expenseCount}
          icon={Receipt}
          color="primary"
        />
      </div>

      <div className="grid grid-cols-2 mt-6">
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Ce mois-ci</h3>
          </div>
          <div className="card-body">
            <div className="month-stats">
              <div className="month-stat-item">
                <span className="month-stat-label">Dépenses</span>
                <span className="month-stat-value">{formatCurrency(monthTotal)}</span>
              </div>
              <div className="month-stat-item">
                <span className="month-stat-label">Transactions</span>
                <span className="month-stat-value">{monthExpenses.length}</span>
              </div>
              <div className="month-stat-item">
                <span className="month-stat-label">Moyenne</span>
                <span className="month-stat-value">
                  {formatCurrency(monthExpenses.length > 0 ? monthTotal / monthExpenses.length : 0)}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Aperçu rapide</h3>
          </div>
          <div className="card-body">
            <div className="quick-info">
              <div className="info-item">
                <span className="info-icon">📊</span>
                <div>
                  <p className="info-title">Taux d'épargne</p>
                  <p className="info-value">
                    {totalRevenues > 0
                      ? `${((balance / totalRevenues) * 100).toFixed(1)}%`
                      : '0%'}
                  </p>
                </div>
              </div>
              <div className="info-item">
                <span className="info-icon">📈</span>
                <div>
                  <p className="info-title">Dépense moyenne</p>
                  <p className="info-value">
                    {formatCurrency(expenseCount > 0 ? totalExpenses / expenseCount : 0)}
                  </p>
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
              {expenses.slice(0, 5).map((expense) => (
                <div key={expense.id} className="expense-item">
                  <div className="expense-info">
                    <span className="expense-category">{expense.categorie}</span>
                    <span className="expense-description">{expense.description}</span>
                  </div>
                  <span className="expense-amount">{formatCurrency(expense.montant)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
