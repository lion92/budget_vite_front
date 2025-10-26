import { useState, useEffect } from 'react';
import { Plus, Search, Filter, Calendar } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import ExpenseTable from '../components/ExpenseTable';
import ExpenseModal from '../components/ExpenseModal';
import { formatCurrency } from '../utils/formatters';
import './Expenses.css';

const Expenses = () => {
  const {
    expenses,
    categories,
    fetchExpenses,
    fetchCategories,
    getFilteredExpenses,
    searchTerm,
    setSearchTerm,
    selectedCategories,
    setSelectedCategories,
    dateRange,
    setDateRange,
    resetFilters,
  } = useAppStore();

  const userId = localStorage.getItem('utilisateur');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showFilters, setShowFilters] = useState(false);
  const [localStartDate, setLocalStartDate] = useState('');
  const [localEndDate, setLocalEndDate] = useState('');
  const [searchField, setSearchField] = useState('all'); // 'all', 'description', 'category'

  useEffect(() => {
    if (userId) {
      fetchExpenses(userId);
      fetchCategories(userId);
    }
  }, [userId]);

  // Filtrage personnalisé avec choix du champ de recherche
  const getCustomFilteredExpenses = () => {
    let filtered = [...expenses];

    // Search term avec choix du champ
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter((expense) => {
        if (searchField === 'description') {
          return expense.description?.toLowerCase().includes(term);
        } else if (searchField === 'category') {
          return expense.categorie?.toLowerCase().includes(term);
        } else {
          // 'all' - recherche dans description et catégorie
          return expense.description?.toLowerCase().includes(term) ||
                 expense.categorie?.toLowerCase().includes(term);
        }
      });
    }

    // Categories
    if (selectedCategories.length > 0) {
      filtered = filtered.filter((expense) =>
        selectedCategories.includes(expense.categorie)
      );
    }

    // Date range
    if (dateRange.start || dateRange.end) {
      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(expense.dateTransaction);
        const start = dateRange.start ? new Date(dateRange.start) : null;
        const end = dateRange.end ? new Date(dateRange.end) : null;

        if (start && expenseDate < start) return false;
        if (end && expenseDate > end) return false;
        return true;
      });
    }

    return filtered;
  };

  const filteredExpenses = getCustomFilteredExpenses();
  const totalFiltered = filteredExpenses.reduce(
    (sum, exp) => sum + parseFloat(exp.montant || 0),
    0
  );

  const handleEdit = (expense) => {
    setEditingExpense(expense);
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingExpense(null);
  };

  const handleCategoryToggle = (category) => {
    if (selectedCategories.includes(category)) {
      setSelectedCategories(selectedCategories.filter((c) => c !== category));
    } else {
      setSelectedCategories([...selectedCategories, category]);
    }
  };

  const handleDateChange = (type, value) => {
    if (type === 'start') {
      setLocalStartDate(value);
      setDateRange({ ...dateRange, start: value ? new Date(value) : null });
    } else {
      setLocalEndDate(value);
      setDateRange({ ...dateRange, end: value ? new Date(value) : null });
    }
  };

  const hasActiveFilters = searchTerm || selectedCategories.length > 0 || dateRange.start || dateRange.end;

  return (
    <div className="expenses-page">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1>Dépenses</h1>
          <p>Gérez toutes vos dépenses</p>
        </div>
        <button className="btn btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={20} />
          Ajouter une dépense
        </button>
      </div>

      <div className="card mb-4">
        <div className="card-body">
          <div className="filters-bar">
            <div className="search-container">
              <div className="search-box">
                <Search size={20} />
                <input
                  type="text"
                  placeholder={
                    searchField === 'description' ? 'Rechercher par description...' :
                    searchField === 'category' ? 'Rechercher par catégorie...' :
                    'Rechercher une dépense...'
                  }
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="search-input"
                />
              </div>
              <select
                value={searchField}
                onChange={(e) => setSearchField(e.target.value)}
                className="search-field-select"
              >
                <option value="all">Tout</option>
                <option value="description">Description</option>
                <option value="category">Catégorie</option>
              </select>
            </div>

            <button
              className="btn btn-outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} />
              Filtres
            </button>

            {hasActiveFilters && (
              <button className="btn btn-outline" onClick={() => {
                resetFilters();
                setLocalStartDate('');
                setLocalEndDate('');
              }}>
                Réinitialiser
              </button>
            )}
          </div>

          {showFilters && (
            <div className="filters-panel">
              <div className="filter-section">
                <h4>
                  <Calendar size={16} />
                  Filtrer par date
                </h4>
                <div className="date-filters">
                  <div className="date-input-group">
                    <label>Date de début</label>
                    <input
                      type="date"
                      value={localStartDate}
                      onChange={(e) => handleDateChange('start', e.target.value)}
                      className="date-input"
                    />
                  </div>
                  <div className="date-input-group">
                    <label>Date de fin</label>
                    <input
                      type="date"
                      value={localEndDate}
                      onChange={(e) => handleDateChange('end', e.target.value)}
                      className="date-input"
                    />
                  </div>
                </div>
              </div>

              <div className="filter-section">
                <h4>
                  <Filter size={16} />
                  Catégories
                </h4>
                <div className="category-filters">
                  {categories.map((cat) => (
                    <label key={cat.id} className="category-filter-item">
                      <input
                        type="checkbox"
                        checked={selectedCategories.includes(cat.categorie)}
                        onChange={() => handleCategoryToggle(cat.categorie)}
                      />
                      <span>{cat.categorie}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">
            Liste des dépenses ({filteredExpenses.length})
          </h3>
          <div className="total-badge">
            Total: {formatCurrency(totalFiltered)}
          </div>
        </div>
        <div className="card-body">
          <ExpenseTable expenses={filteredExpenses} onEdit={handleEdit} />
        </div>
      </div>

      <ExpenseModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        expense={editingExpense}
      />
    </div>
  );
};

export default Expenses;
