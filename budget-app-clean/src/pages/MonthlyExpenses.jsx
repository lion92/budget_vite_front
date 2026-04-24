import { useState, useEffect, useMemo } from 'react';
import { Calendar, TrendingDown, DollarSign, ChevronLeft, ChevronRight, Plus, Tag, Copy, X, ArrowRight } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseModal from '../components/ExpenseModal';
import CategoryModal from '../components/CategoryModal';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'react-toastify';
import '../styles/pages/MonthlyExpenses.css';

const MONTH_NAMES_FR = [
  'Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin',
  'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre',
];

const MonthlyExpenses = () => {
  const { expenses, categories, fetchExpenses, fetchCategories, copyMonthExpenses } = useAppStore();
  const userId = localStorage.getItem('utilisateur');

  const [isModalOpen, setIsModalOpen]             = useState(false);
  const [editingExpense, setEditingExpense]         = useState(null);
  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [isCopyModalOpen, setIsCopyModalOpen] = useState(false);
  const [isCopying, setIsCopying]             = useState(false);
  const [targetDate, setTargetDate]           = useState(''); // ISO 'YYYY-MM-DD'

  const now = new Date();
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth());
  const [selectedYear, setSelectedYear]   = useState(now.getFullYear());

  useEffect(() => {
    if (userId) {
      fetchExpenses(userId);
      fetchCategories(userId);
    }
  }, [userId]);

  const monthNames = MONTH_NAMES_FR;

  // Date par défaut = 1er jour du mois sélectionné (ou aujourd'hui si mois courant)
  const getDefaultDateForMonth = () => {
    const isCurrentMonth = selectedMonth === now.getMonth() && selectedYear === now.getFullYear();
    if (isCurrentMonth) return now.toISOString().split('T')[0];
    // Sinon le 1er du mois sélectionné
    const d = new Date(selectedYear, selectedMonth, 1);
    return d.toISOString().split('T')[0];
  };

  const getCurrentMonthExpenses = () =>  // kept for handleAdd default date (not performance-critical)
    expenses.filter((expense) => {
      if (!expense.dateTransaction) return false;
      const expenseDate = new Date(expense.dateTransaction.toString().replace(/\//g, '-'));
      return expenseDate.getMonth() === selectedMonth && expenseDate.getFullYear() === selectedYear;
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

  const openCopyModal = () => {
    // Pre-fill with 1st day of next month
    const nextMonth = (selectedMonth + 1) % 12;
    const nextYear  = selectedMonth === 11 ? selectedYear + 1 : selectedYear;
    const d = new Date(nextYear, nextMonth, 1);
    setTargetDate(d.toISOString().split('T')[0]);
    setIsCopyModalOpen(true);
  };

  // min/max dates for the date input: constrain to the chosen month
  const targetDateObj = targetDate ? new Date(targetDate + 'T00:00:00') : null;
  const isSameMonth   = targetDateObj
    ? targetDateObj.getMonth() === selectedMonth && targetDateObj.getFullYear() === selectedYear
    : false;

  const handleCopyMonth = async () => {
    if (!targetDate) {
      toast.error('Veuillez choisir une date cible');
      return;
    }
    if (isSameMonth) {
      toast.error('Le mois cible est identique au mois source');
      return;
    }
    setIsCopying(true);
    const result = await copyMonthExpenses(selectedMonth, selectedYear, targetDate);
    setIsCopying(false);
    if (result.success) {
      const label = targetDateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'long', year: 'numeric' });
      toast.success(
        `${result.count} dépense${result.count > 1 ? 's' : ''} copiée${result.count > 1 ? 's' : ''} au ${label}`
      );
      setIsCopyModalOpen(false);
    } else {
      toast.error('Aucune dépense trouvée pour ce mois');
    }
  };

  const monthlyExpenses = useMemo(
    () => expenses.filter((expense) => {
      if (!expense.dateTransaction) return false;
      const d = new Date(expense.dateTransaction.toString().replace(/\//g, '-'));
      return d.getMonth() === selectedMonth && d.getFullYear() === selectedYear;
    }),
    [expenses, selectedMonth, selectedYear],
  );

  const totalMonthly = useMemo(
    () => monthlyExpenses.reduce((sum, exp) => sum + parseFloat(exp.montant || 0), 0),
    [monthlyExpenses],
  );

  const avgExpense = monthlyExpenses.length > 0 ? totalMonthly / monthlyExpenses.length : 0;

  const sortedCategories = useMemo(() => {
    const byCategory = monthlyExpenses.reduce((acc, expense) => {
      const cat = expense.categorie || 'Sans catégorie';
      if (!acc[cat]) acc[cat] = { total: 0, count: 0 };
      acc[cat].total += parseFloat(expense.montant || 0);
      acc[cat].count += 1;
      return acc;
    }, {});
    return Object.entries(byCategory).sort((a, b) => b[1].total - a[1].total);
  }, [monthlyExpenses]);

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
        <div className="header-actions">
          <button className="btn btn-outline" onClick={() => setIsCategoryModalOpen(true)}>
            <Tag size={18} />
            Catégorie
          </button>
          <button className="btn btn-outline" onClick={openCopyModal} title="Copier toutes les dépenses de ce mois vers un autre mois">
            <Copy size={18} />
            Copier le mois
          </button>
          <button className="btn btn-primary" onClick={handleAdd}>
            <Plus size={18} />
            Ajouter une dépense
          </button>
        </div>
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
      <CategoryModal
        isOpen={isCategoryModalOpen}
        onClose={() => setIsCategoryModalOpen(false)}
      />

      {/* Modal copie de mois */}
      {isCopyModalOpen && (
        <div className="modal-overlay" onClick={() => setIsCopyModalOpen(false)}>
          <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '460px' }}>
            <div className="modal-header">
              <h2>
                <Copy size={18} style={{ marginRight: '0.5rem', verticalAlign: 'middle' }} />
                Copier le mois vers…
              </h2>
              <button className="btn-close" onClick={() => setIsCopyModalOpen(false)} type="button">
                <X size={20} />
              </button>
            </div>

            <div className="modal-body">
              {/* Source (lecture seule) */}
              <div className="copy-month-source">
                <span className="copy-month-label">Source</span>
                <span className="copy-month-value">
                  {monthNames[selectedMonth]} {selectedYear}
                </span>
                <span className="copy-month-count">
                  {monthlyExpenses.length} dépense{monthlyExpenses.length !== 1 ? 's' : ''}
                </span>
              </div>

              <div className="copy-month-arrow">
                <ArrowRight size={22} />
              </div>

              {/* Target date */}
              <div className="copy-month-target">
                <span className="copy-month-label">Date</span>
                <div style={{ flex: 1 }}>
                  <input
                    type="date"
                    className="form-input"
                    value={targetDate}
                    onChange={(e) => setTargetDate(e.target.value)}
                  />
                  {targetDate && (
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginTop: '0.35rem' }}>
                      Toutes les dépenses seront datées du{' '}
                      <strong>
                        {new Date(targetDate + 'T00:00:00').toLocaleDateString('fr-FR', {
                          day: '2-digit', month: 'long', year: 'numeric',
                        })}
                      </strong>
                    </p>
                  )}
                </div>
              </div>

              {/* Warning si même mois */}
              {isSameMonth && (
                <p style={{ color: 'var(--color-danger, #ef4444)', fontSize: '0.875rem', marginTop: '0.75rem' }}>
                  Le mois cible est identique au mois source.
                </p>
              )}

              {monthlyExpenses.length === 0 && (
                <p style={{ color: 'var(--color-warning, #f59e0b)', fontSize: '0.875rem', marginTop: '0.75rem' }}>
                  Aucune dépense dans {monthNames[selectedMonth]} {selectedYear}.
                </p>
              )}
            </div>

            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={() => setIsCopyModalOpen(false)}>
                Annuler
              </button>
              <button
                type="button"
                className="btn btn-primary"
                disabled={isCopying || monthlyExpenses.length === 0 || !targetDate || isSameMonth}
                onClick={handleCopyMonth}
              >
                <Copy size={16} />
                {isCopying
                  ? 'Copie en cours…'
                  : `Copier ${monthlyExpenses.length} dépense${monthlyExpenses.length !== 1 ? 's' : ''}`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MonthlyExpenses;
