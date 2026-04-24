import { useState, useEffect, useMemo } from 'react';
import { Plus, Edit, Trash2, Tag, TrendingUp, ShoppingBag } from 'lucide-react';
import useAppStore from '../store/useAppStore';
import { formatCurrency } from '../utils/formatters';
import { toast } from 'react-toastify';
import CategoryModal from '../components/CategoryModal';
import './Categories.css';

const Categories = () => {
  const { categories, expenses, fetchCategories, fetchExpenses, deleteCategory, isLoading } = useAppStore();
  const [isModalOpen, setIsModalOpen]         = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);
  const userId = localStorage.getItem('utilisateur');

  useEffect(() => {
    if (userId) {
      fetchCategories(parseInt(userId));
      fetchExpenses(parseInt(userId));
    }
  }, [userId]);

  // Build {categoryId -> {total, count}} in one pass — O(n+m) instead of O(n×m)
  const categoryStatsMap = useMemo(() => {
    const nameToId = {};
    categories.forEach((c) => { nameToId[c.categorie] = c.id; });

    const map = {};
    expenses.forEach((exp) => {
      let catId;
      if (typeof exp.categorie === 'number' || !isNaN(exp.categorie)) {
        catId = parseInt(exp.categorie);
      } else {
        catId = nameToId[exp.categorie];
      }
      if (!catId) return;
      if (!map[catId]) map[catId] = { total: 0, count: 0 };
      map[catId].total += parseFloat(exp.montant || 0);
      map[catId].count += 1;
    });
    return map;
  }, [expenses, categories]);

  const totalExpenses = useMemo(
    () => expenses.reduce((sum, exp) => sum + parseFloat(exp.montant || 0), 0),
    [expenses],
  );

  const mostUsedCategory = useMemo(() => {
    if (categories.length === 0) return null;
    return categories.reduce((best, cat) => {
      const count = categoryStatsMap[cat.id]?.count ?? 0;
      return count > (categoryStatsMap[best?.id]?.count ?? 0) ? cat : best;
    }, null);
  }, [categories, categoryStatsMap]);

  const handleAddCategory = () => {
    setEditingCategory(null);
    setIsModalOpen(true);
  };

  const handleEditCategory = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDeleteCategory = async (categoryId) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) {
      const success = await deleteCategory(categoryId);
      if (success) {
        toast.success('Catégorie supprimée avec succès');
      } else {
        toast.error('Erreur lors de la suppression');
      }
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  return (
    <div className="categories-page">
      <div className="page-header">
        <div>
          <h1>Catégories</h1>
          <p>Gérez vos catégories de dépenses</p>
        </div>
        <button className="btn btn-primary" onClick={handleAddCategory}>
          <Plus size={20} />
          Ajouter une catégorie
        </button>
      </div>

      {/* Statistiques */}
      <div className="stats-grid">
        <div className="card stat-card">
          <div className="stat-icon">
            <Tag size={24} />
          </div>
          <div>
            <div className="stat-label">Total catégories</div>
            <div className="stat-value">{categories.length}</div>
          </div>
        </div>
        <div className="card stat-card">
          <div className="stat-icon success">
            <ShoppingBag size={24} />
          </div>
          <div>
            <div className="stat-label">Total dépenses</div>
            <div className="stat-value">{formatCurrency(totalExpenses)}</div>
          </div>
        </div>
        {mostUsedCategory && (
          <div className="card stat-card">
            <div className="stat-icon warning">
              <TrendingUp size={24} />
            </div>
            <div>
              <div className="stat-label">Catégorie la plus utilisée</div>
              <div className="stat-value" style={{ fontSize: '1.125rem' }}>
                {mostUsedCategory.categorie}
              </div>
              <div className="stat-subtitle">
                {categoryStatsMap[mostUsedCategory.id]?.count ?? 0} dépenses
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Liste des catégories */}
      <div className="card">
        <div className="card-header">
          <h3 className="card-title">Mes catégories ({categories.length})</h3>
        </div>
        <div className="card-body">
          {isLoading ? (
            <div className="loading-state">
              <div className="spinner" />
              <p>Chargement des catégories...</p>
            </div>
          ) : categories.length === 0 ? (
            <div className="empty-state">
              <Tag size={48} />
              <p>Aucune catégorie</p>
              <p className="text-secondary">Créez votre première catégorie pour commencer</p>
            </div>
          ) : (
            <div className="categories-grid">
              {categories.map((category) => {
                const stats = categoryStatsMap[category.id] ?? { total: 0, count: 0 };
                const percentage = totalExpenses > 0 ? ((stats.total / totalExpenses) * 100).toFixed(1) : 0;

                return (
                  <div key={category.id} className="category-card">
                    <div
                      className="category-icon-custom"
                      style={{ backgroundColor: `${category.color}20`, color: category.color }}
                    >
                      {category.iconName ? (
                        <i className={category.iconName}></i>
                      ) : (
                        <Tag size={24} />
                      )}
                    </div>
                    <div className="category-info">
                      <div className="category-header-row">
                        <h4>{category.categorie}</h4>
                        {category.budgetDebutMois > 0 && (
                          <span className="category-budget">
                            Budget: {formatCurrency(category.budgetDebutMois)}
                          </span>
                        )}
                      </div>
                      {category.description && (
                        <p className="category-description">{category.description}</p>
                      )}
                      {(category.month || category.annee) && (
                        <p className="category-period">
                          📅 {category.month && category.month.charAt(0).toUpperCase() + category.month.slice(1)} {category.annee}
                        </p>
                      )}
                      <div className="category-stats">
                        <div className="stat-item">
                          <span className="stat-label-small">Dépenses:</span>
                          <span className="stat-value-small">{stats.count}</span>
                        </div>
                        <div className="stat-item">
                          <span className="stat-label-small">Dépensé:</span>
                          <span className="stat-value-small">{formatCurrency(stats.total)}</span>
                        </div>
                        {stats.total > 0 && (
                          <div className="stat-item">
                            <span className="stat-label-small">Part:</span>
                            <span className="stat-value-small">{percentage}%</span>
                          </div>
                        )}
                        {category.budgetDebutMois > 0 && (
                          <div className={`stat-item ${stats.total > category.budgetDebutMois ? 'over-budget' : ''}`}>
                            <span className="stat-label-small">Reste:</span>
                            <span className="stat-value-small">
                              {formatCurrency(category.budgetDebutMois - stats.total)}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="category-actions">
                      <button
                        className="btn-icon"
                        onClick={() => handleEditCategory(category)}
                        title="Modifier"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        className="btn-icon btn-delete"
                        onClick={() => handleDeleteCategory(category.id)}
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Guide d'utilisation */}
      <div className="card help-card">
        <div className="card-header">
          <h3 className="card-title">💡 À propos des catégories</h3>
        </div>
        <div className="card-body">
          <p className="help-text">
            Les catégories vous permettent d'organiser vos dépenses et vos revenus de manière structurée.
            Vous pouvez créer des catégories personnalisées pour mieux suivre vos finances.
          </p>
          <ul className="help-list">
            <li><strong>Créer</strong> : Cliquez sur "Ajouter une catégorie" pour créer une nouvelle catégorie</li>
            <li><strong>Modifier</strong> : Cliquez sur l'icône ✏️ pour modifier une catégorie existante</li>
            <li><strong>Supprimer</strong> : Cliquez sur l'icône 🗑️ pour supprimer une catégorie</li>
          </ul>
        </div>
      </div>

      <CategoryModal
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        category={editingCategory}
      />
    </div>
  );
};

export default Categories;
