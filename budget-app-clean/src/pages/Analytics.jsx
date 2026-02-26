import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, PieChart, Calendar, Filter, X } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import {
  ExpensesByCategoryChart,
  MonthlyTrendChart,
  TopExpensesChart,
  WeeklyExpensesChart
} from '../components/Charts';
import StatCard from '../components/StatCard';
import { formatCurrency } from '../utils/formatters';
import './Analytics.css';

const Analytics = () => {
  const {
    expenses,
    revenues,
    categories,
    fetchExpenses,
    fetchRevenues,
    fetchCategories
  } = useAppStore();

  const userId = localStorage.getItem('utilisateur');

  // Filter states
  const [filterMode, setFilterMode] = useState('all'); // 'all', 'month', 'year', 'range', 'category'
  const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    if (userId) {
      fetchExpenses(userId);
      fetchRevenues();
      fetchCategories(userId);
    }
  }, [userId]);

  // Filter expenses based on selected filters
  const filteredExpenses = expenses.filter(expense => {
    try {
      const expDate = new Date(expense.dateTransaction.toString().replace(/\//g, '-'));

      if (filterMode === 'month') {
        return expDate.getMonth() === selectedMonth && expDate.getFullYear() === selectedYear;
      }

      if (filterMode === 'year') {
        return expDate.getFullYear() === selectedYear;
      }

      if (filterMode === 'range' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return expDate >= start && expDate <= end;
      }

      if (filterMode === 'category' && selectedCategory !== 'all') {
        return expense.categorie === selectedCategory;
      }

      return true; // 'all' mode
    } catch (e) {
      return false;
    }
  });

  // Filter revenues based on selected filters
  const filteredRevenues = revenues.filter(revenue => {
    try {
      const revDate = new Date(revenue.date || revenue.dateRevenu);

      if (filterMode === 'month') {
        return revDate.getMonth() === selectedMonth && revDate.getFullYear() === selectedYear;
      }

      if (filterMode === 'year') {
        return revDate.getFullYear() === selectedYear;
      }

      if (filterMode === 'range' && startDate && endDate) {
        const start = new Date(startDate);
        const end = new Date(endDate);
        return revDate >= start && revDate <= end;
      }

      return true; // 'all' mode or category (doesn't apply to revenues)
    } catch (e) {
      return false;
    }
  });

  const totalExpenses = filteredExpenses.reduce((sum, exp) => sum + parseFloat(exp.montant || 0), 0);
  const totalRevenues = filteredRevenues.reduce((sum, rev) => sum + parseFloat(rev.amount || rev.montant || 0), 0);
  const balance = totalRevenues - totalExpenses;

  // Calculate monthly average from filtered data
  const monthlyExpenses = {};
  filteredExpenses.forEach((expense) => {
    try {
      const date = new Date(expense.dateTransaction.toString().replace(/\//g, '-'));
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!monthlyExpenses[monthKey]) {
        monthlyExpenses[monthKey] = 0;
      }
      monthlyExpenses[monthKey] += parseFloat(expense.montant || 0);
    } catch (e) {
      // Skip invalid dates
    }
  });

  const monthCount = Object.keys(monthlyExpenses).length || 1;
  const averageMonthlyExpense = totalExpenses / monthCount;

  // Get available years from expenses
  const availableYears = [...new Set(expenses.map(exp => {
    try {
      return new Date(exp.dateTransaction.toString().replace(/\//g, '-')).getFullYear();
    } catch (e) {
      return null;
    }
  }).filter(Boolean))].sort((a, b) => b - a);

  const monthNames = ['Janvier', 'Février', 'Mars', 'Avril', 'Mai', 'Juin', 'Juillet', 'Août', 'Septembre', 'Octobre', 'Novembre', 'Décembre'];

  // Get unique categories for filter
  const uniqueCategories = [...new Set(expenses.map(exp => exp.categorie).filter(Boolean))];

  // Reset filters
  const resetFilters = () => {
    setFilterMode('all');
    setSelectedMonth(new Date().getMonth());
    setSelectedYear(new Date().getFullYear());
    setSelectedCategory('all');
    setStartDate('');
    setEndDate('');
  };

  return (
    <div className="analytics-page">
      {/* Header */}
      <div className="analytics-header">
        <div className="header-content">
          <div className="header-icon">
            <BarChart3 size={32} />
          </div>
          <div>
            <h1 className="page-title">Tableau de Bord Analytique</h1>
            <p className="page-subtitle">Visualisez vos finances en détail</p>
          </div>
        </div>
      </div>

      {/* Filters Section */}
      <div className="filters-section">
        <div className="filters-header">
          <div className="filters-title">
            <Filter size={20} />
            <span>Filtres</span>
          </div>
          {filterMode !== 'all' && (
            <button className="reset-filters-btn" onClick={resetFilters}>
              <X size={16} />
              Réinitialiser
            </button>
          )}
        </div>

        <div className="filters-content">
          {/* Filter Mode Selector */}
          <div className="filter-group">
            <label>Mode de filtre</label>
            <div className="filter-mode-buttons">
              <button
                className={`filter-mode-btn ${filterMode === 'all' ? 'active' : ''}`}
                onClick={() => setFilterMode('all')}
              >
                Tout
              </button>
              <button
                className={`filter-mode-btn ${filterMode === 'month' ? 'active' : ''}`}
                onClick={() => setFilterMode('month')}
              >
                Mois
              </button>
              <button
                className={`filter-mode-btn ${filterMode === 'year' ? 'active' : ''}`}
                onClick={() => setFilterMode('year')}
              >
                Année
              </button>
              <button
                className={`filter-mode-btn ${filterMode === 'range' ? 'active' : ''}`}
                onClick={() => setFilterMode('range')}
              >
                Période
              </button>
              <button
                className={`filter-mode-btn ${filterMode === 'category' ? 'active' : ''}`}
                onClick={() => setFilterMode('category')}
              >
                Catégorie
              </button>
            </div>
          </div>

          {/* Month Filter */}
          {filterMode === 'month' && (
            <div className="filter-inputs">
              <div className="filter-input-group">
                <label>Mois</label>
                <select value={selectedMonth} onChange={(e) => setSelectedMonth(parseInt(e.target.value))}>
                  {monthNames.map((month, index) => (
                    <option key={index} value={index}>{month}</option>
                  ))}
                </select>
              </div>
              <div className="filter-input-group">
                <label>Année</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Year Filter */}
          {filterMode === 'year' && (
            <div className="filter-inputs">
              <div className="filter-input-group">
                <label>Année</label>
                <select value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                  {availableYears.map(year => (
                    <option key={year} value={year}>{year}</option>
                  ))}
                </select>
              </div>
            </div>
          )}

          {/* Range Filter */}
          {filterMode === 'range' && (
            <div className="filter-inputs">
              <div className="filter-input-group">
                <label>Date de début</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>
              <div className="filter-input-group">
                <label>Date de fin</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>
            </div>
          )}

          {/* Category Filter */}
          {filterMode === 'category' && (
            <div className="filter-inputs">
              <div className="filter-input-group">
                <label>Catégorie</label>
                <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                  <option value="all">Toutes les catégories</option>
                  {uniqueCategories.map(cat => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Active Filter Display */}
        {filterMode !== 'all' && (
          <div className="active-filter-badge">
            <span>
              {filterMode === 'month' && `${monthNames[selectedMonth]} ${selectedYear}`}
              {filterMode === 'year' && `Année ${selectedYear}`}
              {filterMode === 'range' && startDate && endDate && `${startDate} - ${endDate}`}
              {filterMode === 'category' && selectedCategory !== 'all' && `Catégorie: ${selectedCategory}`}
            </span>
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="stats-grid">
        <StatCard
          title="Solde"
          value={formatCurrency(balance)}
          icon={TrendingUp}
          color={balance >= 0 ? 'success' : 'danger'}
        />
        <StatCard
          title="Dépenses"
          value={formatCurrency(totalExpenses)}
          icon={PieChart}
          color="danger"
        />
        <StatCard
          title="Revenus"
          value={formatCurrency(totalRevenues)}
          icon={Calendar}
          color="success"
        />
        <StatCard
          title="Moyenne Mensuelle"
          value={formatCurrency(averageMonthlyExpense)}
          icon={BarChart3}
          color="primary"
        />
      </div>

      {/* Charts Grid */}
      <div className="charts-grid">
        {/* Row 1: Main Charts */}
        <div className="chart-full">
          <MonthlyTrendChart expenses={filteredExpenses} revenues={filteredRevenues} />
        </div>

        {/* Row 2: Category & Top Expenses */}
        <div className="chart-half">
          <ExpensesByCategoryChart expenses={filteredExpenses} />
        </div>
        <div className="chart-half">
          <TopExpensesChart expenses={filteredExpenses} />
        </div>

        {/* Row 3: Weekly Expenses */}
        <div className="chart-half">
          <WeeklyExpensesChart expenses={filteredExpenses} />
        </div>
      </div>

      {/* Insights Section */}
      <div className="insights-section">
        <h2 className="section-title">Insights Financiers</h2>
        <div className="insights-cards">
          <div className="insight-card">
            <div className="insight-icon success">
              <TrendingUp size={24} />
            </div>
            <div className="insight-content">
              <h3 className="insight-title">Taux d'Épargne</h3>
              <p className="insight-value">
                {totalRevenues > 0
                  ? `${((balance / totalRevenues) * 100).toFixed(1)}%`
                  : '0%'}
              </p>
              <p className="insight-description">
                {balance >= 0
                  ? 'Excellent ! Vous épargnez régulièrement.'
                  : 'Attention, vos dépenses dépassent vos revenus.'}
              </p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon primary">
              <PieChart size={24} />
            </div>
            <div className="insight-content">
              <h3 className="insight-title">Catégorie Principale</h3>
              <p className="insight-value">
                {(() => {
                  const categoryTotals = {};
                  filteredExpenses.forEach((exp) => {
                    const catName = exp.categorie || 'Sans catégorie';
                    categoryTotals[catName] = (categoryTotals[catName] || 0) + parseFloat(exp.montant || 0);
                  });
                  const topCategory = Object.entries(categoryTotals).sort((a, b) => b[1] - a[1])[0];
                  return topCategory ? topCategory[0] : 'Aucune';
                })()}
              </p>
              <p className="insight-description">
                Votre catégorie de dépenses la plus importante
              </p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon warning">
              <Calendar size={24} />
            </div>
            <div className="insight-content">
              <h3 className="insight-title">Nombre de Transactions</h3>
              <p className="insight-value">{filteredExpenses.length}</p>
              <p className="insight-description">
                Transactions dans la période sélectionnée
              </p>
            </div>
          </div>

          <div className="insight-card">
            <div className="insight-icon danger">
              <BarChart3 size={24} />
            </div>
            <div className="insight-content">
              <h3 className="insight-title">Dépense Moyenne</h3>
              <p className="insight-value">
                {formatCurrency(filteredExpenses.length > 0 ? totalExpenses / filteredExpenses.length : 0)}
              </p>
              <p className="insight-description">
                Montant moyen par transaction
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;
