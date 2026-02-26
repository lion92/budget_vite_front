import { useState, useEffect } from 'react';
import { Calendar, TrendingDown, DollarSign, ChevronLeft, ChevronRight, Plus, Tag } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseModal from '../components/ExpenseModal';
import { formatCurrency } from '../utils/formatters';
import './MonthlyExpenses.css';

const MonthlyExpenses = () => {
  const { expenses, categories, fetchExpenses, fetchCategories } = useAppStore();
  const userId = localStorage.getItem('utilisateur');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());

  useEffect(() => {
    if (userId) {
      fetchExpenses(userId);
      fetchCategories(userId);
    }
  }, [userId]);

  const monthNames = [
    'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
    'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
  ];

  // Date par défaut = 1er jour du mois sélectionné (ou aujourd'hui si mois courant)
  const getDefaultDateForMonth = () => {
    const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
    if (isCurrentMonth) return now.toISOString().split('T')[0];
    // Sinon le 1er du mois sélectionné
    const d = new Date(selectedYear, selectedMonth, 1);
    return d.toISOString().split('T')[0];
  };

  const getCurrentMonthExpenses = () =>
    expenses.filter((expense) => {
      if (!expense.dateTransaction) return false;
      const dateStr = expense.dateTransaction.toString();
      const expenseDate = new Date(dateStr.replace(/\//g, '-'));
      return (
        expenseDate.getMonth() === selectedMonth &&
        expenseDate.getFullYear() === selectedYear
      );
    });

  const goToPreviousMonth = () => {
    if (selectedMonth === 0) { setSelectedMonth(11); setSelectedYear(selectedYear - 1); }
    else setSelectedMonth(selectedMonth - 1);
  };

  const goToNextMonth = () => {
    if (selectedMonth === 11) { setSelectedMonth(0); setSelectedYear(selectedYear + 1); }
    else setSelectedMonth(selectedMonth + 1);
  };

  const goToCurrentMonth = () => {
    setSelectedMonth(now.getMonth());
    setSelectedYear(now.getFullYear());
  };

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleAdd = () => {
    setEditingExpense(null);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const monthlyExpenses = getCurrentMonthExpenses();
  const totalMonthly = monthlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.montant || 0), 0);
  const avgExpense = monthlyExpenses.length > 0 ? totalMonthly / monthlyExpenses.length : 0;

  // Répartition par catégorie
  const expensesByCategory = monthlyExpenses.reduce((acc, expense) => {
    const category = expense.categorie || 'Sans catégorie';
    if (!acc[category]) acc[category] = { total: 0, count: 0 };
    acc[category].total += parseFloat(expense.montant || 0);
    acc[category].count += 1;
    return acc;
  }, {});

  const sortedCategories = Object.entries(expensesByCategory).sort((a, b) => b[1].total - a[1].total);

  const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
  const selectedMonthName = `${monthNames[selectedMonth]} ${selectedYear}`;

  return (
    <div className="monthly-page">
      {/* Header */}
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>
            <Calendar size={26} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
            Dépenses du mois
          </h1>
          <p>Détails de vos dépenses pour {selectedMonthName}</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={18} />
          Ajouter une dépense
        </button>
      </div>

      {/* Sélecteur de mois */}
      <div className="card mb-4">
        <div className="card-body">
          <div className="month-nav">
            <button className="btn btn-outline" onClick={goToPreviousMonth}>
              <ChevronLeft size={18} />
              Précédent
            </button>

            <div className="month-selectors">
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(Number(e.target.value))}
                className="form-input month-select"
              >
                {monthNames.map((month, index) => (
                  <option key={index} value={index}>{month}</option>
                ))}
              </select>
              <input
                type="number"
                value={selectedYear}
                onChange={(e) => setSelectedYear(Number(e.target.value))}
                className="form-input year-input"
                min="2020"
                max="2035"
              />
              {!isCurrentMonth && (
                <button className="btn btn-outline" onClick={goToCurrentMonth}>
                  Aujourd'hui
                </button>
              )}
            </div>

            <button className="btn btn-outline" onClick={goToNextMonth}>
              Suivant
              <ChevronRight size={18} />
            </button>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="monthly-stats">
        <div className="card stat-card">
          <div className="stat-icon-box" style={{ backgroundColor: '#fee2e2' }}>
            <DollarSign size={22} color="#dc2626" />
          </div>
          <div>
            <p className="stat-label">Total du mois</p>
            <p className="stat-amount danger">{formatCurrency(totalMonthly)}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-box" style={{ backgroundColor: '#dbeafe' }}>
            <TrendingDown size={22} color="#2563eb" />
          </div>
          <div>
            <p className="stat-label">Nombre de dépenses</p>
            <p className="stat-amount primary">{monthlyExpenses.length}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-box" style={{ backgroundColor: '#fef3c7' }}>
            <DollarSign size={22} color="#f59e0b" />
          </div>
          <div>
            <p className="stat-label">Dépense moyenne</p>
            <p className="stat-amount warning">{formatCurrency(avgExpense)}</p>
          </div>
        </div>

        <div className="card stat-card">
          <div className="stat-icon-box" style={{ backgroundColor: '#d1fae5' }}>
            <Tag size={22} color="#10b981" />
          </div>
          <div>
            <p className="stat-label">Catégories</p>
            <p className="stat-amount success">{sortedCategories.length}</p>
          </div>
        </div>
      </div>

      <div className="monthly-content">
        {/* Liste des dépenses */}
        <div className="card monthly-table-card">
          <div className="card-header">
            <h3 className="card-title">
              Dépenses ({monthlyExpenses.length})
            </h3>
            <div className="total-badge">{formatCurrency(totalMonthly)}</div>
          </div>
          <div className="card-body">
            {monthlyExpenses.length > 0 ? (
              <ExpenseTable expenses={monthlyExpenses} onEdit={handleEdit} />
            ) : (
              <div className="empty-month">
                <Calendar size={48} />
                <p>Aucune dépense pour {selectedMonthName}</p>
                <button className="btn btn-primary" onClick={handleAdd}>
                  <Plus size={16} />
                  Ajouter la première dépense
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Répartition par catégorie */}
        {sortedCategories.length > 0 && (
          <div className="card category-breakdown">
            <div className="card-header">
              <h3 className="card-title">
                <Tag size={18} />
                Par catégorie
              </h3>
            </div>
            <div className="card-body">
              <div className="category-list">
                {sortedCategories.map(([cat, data]) => {
                  const pct = totalMonthly > 0 ? (data.total / totalMonthly) * 100 : 0;
                  return (
                    <div key={cat} className="category-row">
                      <div className="category-row-header">
                        <span className="cat-name">{cat}</span>
                        <span className="cat-amount">{formatCurrency(data.total)}</span>
                      </div>
                      <div className="cat-progress-bar">
                        <div
                          className="cat-progress-fill"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                      <div className="cat-meta">
                        <span>{data.count} dépense{data.count > 1 ? 's' : ''}</span>
                        <span>{pct.toFixed(1)}%</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        expense={editingExpense}
        defaultDate={getDefaultDateForMonth()}
      />
    </div>
  );
};

export default MonthlyExpenses;
