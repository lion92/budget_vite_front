import { useState, useEffect } from 'react';
import { Plus, Search, Filter } from 'lucide-react';
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
    resetFilters,
  } = useAppStore();

  const userId = localStorage.getItem('utilisateur');

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState(null);
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    if (userId) {
      fetchExpenses(userId);
      fetchCategories(userId);
    }
  }, [userId]);

  const filteredExpenses = getFilteredExpenses();
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
            <div className="search-box">
              <Search size={20} />
              <input
                type="text"
                placeholder="Rechercher une dépense..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="search-input"
              />
            </div>

            <button
              className="btn btn-outline"
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter size={20} />
              Filtres
            </button>

            {(searchTerm || selectedCategories.length > 0) && (
              <button className="btn btn-outline" onClick={resetFilters}>
                Réinitialiser
              </button>
            )}
          </div>

          {showFilters && (
            <div className="filters-panel">
              <h4>Catégories</h4>
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
