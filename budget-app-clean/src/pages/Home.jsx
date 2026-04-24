import { useEffect, useState, useMemo } from 'react';
import {
  TrendingUp, TrendingDown, Receipt, Calendar, Sparkles,
  Target, PieChart, ArrowRight, Wallet, BarChart2, CalendarDays, Percent,
} from 'lucide-react';
import useAppStore from '../store/useAppStore';
import useGamifyStore from '../store/useGamifyStore';
import StatCard from '../components/StatCard';
import ExpenseModal from '../components/ExpenseModal';
import GamificationPanel from '../components/GamificationPanel';
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

  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const navigate = useNavigate();
  const userId = localStorage.getItem('utilisateur');
  const { checkStreak, onSaverAchieved } = useGamifyStore();

  useEffect(() => {
    if (userId) {
      fetchExpenses(userId);
      fetchRevenues();
      fetchCategories(userId);
      checkStreak();
    }
  }, [userId]);

  const currentMonth = new Date().getMonth();
  const currentYear  = new Date().getFullYear();
  const monthNames   = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];
  const currentMonthName = monthNames[currentMonth];

  const totalExpenses = useMemo(() => getTotalExpenses(), [expenses]);
  const totalRevenues = useMemo(() => getTotalRevenues(), [revenues]);

  const monthTotal = useMemo(() =>
    expenses.reduce((sum, exp) => {
      const d = new Date(exp.dateTransaction?.toString().replace(/\//g, '-'));
      if (d.getMonth() !== currentMonth || d.getFullYear() !== currentYear) return sum;
      return sum + parseFloat(exp.montant || 0);
    }, 0),
    [expenses, currentMonth, currentYear],
  );

  const topCategories = useMemo(() => {
    const byCategory = getExpensesByCategory();
    return Object.entries(byCategory).sort((a, b) => b[1].total - a[1].total).slice(0, 3);
  }, [expenses]);

  const recentExpenses = useMemo(() =>
    [...expenses]
      .sort((a, b) => {
        const dA = new Date(a.dateTransaction?.toString().replace(/\//g, '-'));
        const dB = new Date(b.dateTransaction?.toString().replace(/\//g, '-'));
        return dB - dA;
      })
      .slice(0, 5),
    [expenses],
  );

  const balance       = totalRevenues - totalExpenses;
  const expenseCount  = expenses.length;
  const savingsRate   = totalRevenues > 0 ? ((balance / totalRevenues) * 100).toFixed(1) : 0;
  const monthProgress = totalRevenues > 0 ? Math.min((monthTotal / totalRevenues) * 100, 100) : 0;
  const progressColor = monthProgress > 80 ? 'danger' : monthProgress > 60 ? 'warning' : 'safe';

  useEffect(() => {
    if (parseFloat(savingsRate) >= 20) onSaverAchieved();
  }, [savingsRate]);

  return (
    <div className="home-page">
      <ExpenseModal isOpen={quickAddOpen} onClose={() => setQuickAddOpen(false)} />

      {/* ── Gamification ── */}
      <GamificationPanel />

      {/* ── Hero ── */}
      <div className="hero-section">
        <div className="hero-content">
          <div className="hero-text">
            <h1 className="hero-title">
              <Sparkles className="hero-icon" size={32} />
              Bienvenue dans votre espace financier
            </h1>
            <p className="hero-subtitle">Gérez votre budget intelligemment et atteignez vos objectifs</p>

            <div className="hero-progress">
              <div className="hero-progress-header">
                <span>Budget {currentMonthName} {currentYear}</span>
                <span>{formatCurrency(monthTotal)} / {formatCurrency(totalRevenues)}</span>
              </div>
              <div className="hero-progress-bar">
                <div
                  className={`hero-progress-fill ${progressColor}`}
                  style={{ width: `${monthProgress}%` }}
                />
              </div>
              <p className="hero-progress-label">{monthProgress.toFixed(0)}% des revenus dépensés ce mois</p>
            </div>
          </div>

          <div className="hero-balance">
            <p className="balance-label">Solde actuel</p>
            <h2 className={`balance-amount ${balance >= 0 ? 'positive' : 'negative'}`}>
              {formatCurrency(balance)}
            </h2>
            <p className="balance-info">
              {balance >= 0
                ? <><span style={{ color: '#6ee7b7' }}>✓</span> Budget équilibré</>
                : <><span style={{ color: '#fb7185' }}>↓</span> Dépenses supérieures aux revenus</>
              }
            </p>
            <div className="balance-savings">
              <Percent size={13} />
              <span>Épargne : <strong>{savingsRate}%</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <div className="stats-grid">
        <StatCard title="Dépenses totales" value={formatCurrency(totalExpenses)} icon={TrendingDown} color="danger" />
        <StatCard title="Revenus totaux"   value={formatCurrency(totalRevenues)}  icon={TrendingUp}   color="success" />
        <StatCard title={`${currentMonthName} ${currentYear}`} value={formatCurrency(monthTotal)} icon={Calendar} color="primary" />
        <StatCard title="Transactions" value={expenseCount} icon={Receipt} color="warning" />
      </div>

      {/* ── Grille principale ── */}
      <div className="content-grid">

        {/* Top 3 catégories */}
        <div className="card highlight-card">
          <div className="card-header">
            <h3 className="card-title"><PieChart size={20} />Top 3 Catégories</h3>
            <button className="view-all-btn" onClick={() => navigate('/expenses')}>
              Voir tout <ArrowRight size={14} />
            </button>
          </div>
          <div className="card-body">
            {topCategories.length > 0 ? (
              <div className="categories-list">
                {topCategories.map(([category, data], index) => {
                  const pct = totalExpenses > 0 ? (data.total / totalExpenses) * 100 : 0;
                  return (
                    <div key={category} className="category-item">
                      <div className="category-rank">{index + 1}</div>
                      <div className="category-details">
                        <div className="category-name-row">
                          <span className="category-name">{category}</span>
                          <span className="category-amount">{formatCurrency(data.total)}</span>
                        </div>
                        <div className="category-bar-wrap">
                          <div className="category-bar">
                            <div className="category-bar-fill" style={{ width: `${pct}%` }} />
                          </div>
                          <span className="category-pct">{pct.toFixed(0)}%</span>
                        </div>
                        <span className="category-count">{data.count} transaction{data.count > 1 ? 's' : ''}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="empty-state-box">
                <PieChart size={32} className="empty-icon" />
                <p>Aucune catégorie pour le moment</p>
              </div>
            )}
          </div>
        </div>

        {/* Actions rapides */}
        <div className="card highlight-card">
          <div className="card-header">
            <h3 className="card-title"><Target size={20} />Actions rapides</h3>
          </div>
          <div className="card-body">
            <div className="quick-actions">
              <button className="action-btn primary" onClick={() => setQuickAddOpen(true)}>
                <Receipt size={20} />
                <span>Ajouter une dépense</span>
                <ArrowRight size={16} className="action-arrow" />
              </button>
              <button className="action-btn success" onClick={() => navigate('/revenues')}>
                <TrendingUp size={20} />
                <span>Ajouter un revenu</span>
                <ArrowRight size={16} className="action-arrow" />
              </button>
              <button className="action-btn info" onClick={() => navigate('/monthly-expenses')}>
                <Calendar size={20} />
                <span>Voir le mois</span>
                <ArrowRight size={16} className="action-arrow" />
              </button>
            </div>
          </div>
        </div>

        {/* Aperçu financier */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Aperçu financier</h3>
            <button className="view-all-btn" onClick={() => navigate('/analytics')}>
              Analytics <ArrowRight size={14} />
            </button>
          </div>
          <div className="card-body">
            <div className="insights-grid">
              <div className="insight-item">
                <div className="insight-icon-wrap positive"><Wallet size={22} /></div>
                <div>
                  <p className="insight-label">Taux d'épargne</p>
                  <p className="insight-value">{totalRevenues > 0 ? `${savingsRate}%` : '0%'}</p>
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-icon-wrap info"><BarChart2 size={22} /></div>
                <div>
                  <p className="insight-label">Dépense moyenne</p>
                  <p className="insight-value">
                    {formatCurrency(expenseCount > 0 ? totalExpenses / expenseCount : 0)}
                  </p>
                </div>
              </div>
              <div className="insight-item">
                <div className="insight-icon-wrap warning"><CalendarDays size={22} /></div>
                <div>
                  <p className="insight-label">Budget du mois</p>
                  <p className="insight-value">{formatCurrency(monthTotal)}</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ── Dernières dépenses ── */}
      <div className="card mt-6">
        <div className="card-header">
          <h3 className="card-title"><Receipt size={18} />Dernières dépenses</h3>
          <button className="view-all-btn" onClick={() => navigate('/expenses')}>
            Voir tout <ArrowRight size={14} />
          </button>
        </div>
        <div className="card-body">
          {expenses.length === 0 ? (
            <div className="empty-state-box">
              <Receipt size={36} className="empty-icon" />
              <p>Aucune dépense enregistrée</p>
              <button
                className="action-btn primary"
                style={{ width: 'auto', padding: '0.75rem 1.5rem', marginTop: '0.75rem' }}
                onClick={() => setQuickAddOpen(true)}
              >
                <Receipt size={18} /><span>Ajouter une dépense</span>
              </button>
            </div>
          ) : (
            <div className="recent-expenses">
              {recentExpenses.map((expense) => {
                  const expDate = new Date(expense.dateTransaction?.toString().replace(/\//g, '-'));
                  const formattedDate = expDate.toLocaleDateString('fr-FR', {
                    day: '2-digit', month: 'short', year: 'numeric',
                  });
                  return (
                    <div key={expense.id} className="expense-item">
                      <div className="expense-info">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                          <span className="expense-date">{formattedDate}</span>
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
