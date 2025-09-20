import React, { useState, useEffect, useCallback, useMemo } from 'react';
import lien from './lien';
import './css/category-analytics.css';

export function CategoryAnalytics({ categories }) {
    const [selectedCategory, setSelectedCategory] = useState(null);
    const [categoryExpenses, setCategoryExpenses] = useState([]);
    const [analytics, setAnalytics] = useState({
        totalCategories: 0,
        totalBudget: 0,
        categoriesWithBudget: 0,
        categoriesWithIcons: 0,
        monthlyBreakdown: {},
        yearlyBreakdown: {},
        topCategories: []
    });
    const [expenses, setExpenses] = useState([]);
    const [loading, setLoading] = useState(false);

    // États pour le tableau
    const [sortField, setSortField] = useState('dateTransaction');
    const [sortDirection, setSortDirection] = useState('desc');
    const [currentTablePage, setCurrentTablePage] = useState(1);
    const [itemsPerPage] = useState(10);

    // Enrichissement des données comme dans EnhancedExpenseTable
    const enrichedExpenses = useMemo(() => {
        return expenses.map(expense => {
            const category = categories.find(c => c.id === expense.categorie || c.categorie === expense.categorie);
            return {
                ...expense,
                categoryName: category?.categorie || expense.categorie,
                categoryColor: category?.color || '#667eea',
                categoryObj: category
            };
        });
    }, [expenses, categories]);

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const userId = localStorage.getItem("utilisateur");

            if (!userId) return;

            // Utiliser l'endpoint 'action' au lieu de 'depense'
            const response = await fetch(`${lien.url}action/byuser/${userId}`);

            if (response.ok) {
                const expensesData = await response.json();
                console.log("Dépenses chargées:", expensesData); // Debug
                setExpenses(Array.isArray(expensesData) ? expensesData : []);
            }
        } catch (error) {
            console.error("Erreur lors du chargement des dépenses:", error);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchExpenses();
    }, [fetchExpenses]);

    useEffect(() => {
        if (!categories.length) return;

        const totalCategories = categories.length;
        const totalBudget = categories.reduce((sum, cat) =>
            sum + (parseFloat(cat.budgetDebutMois) || 0), 0
        );
        const categoriesWithBudget = categories.filter(cat =>
            cat.budgetDebutMois && parseFloat(cat.budgetDebutMois) > 0
        ).length;
        const categoriesWithIcons = categories.filter(cat => cat.iconName).length;

        // Analyse par mois
        const monthlyBreakdown = categories.reduce((acc, cat) => {
            if (cat.month) {
                acc[cat.month] = (acc[cat.month] || 0) + 1;
            }
            return acc;
        }, {});

        // Analyse par année
        const yearlyBreakdown = categories.reduce((acc, cat) => {
            if (cat.annee) {
                acc[cat.annee] = (acc[cat.annee] || 0) + 1;
            }
            return acc;
        }, {});

        // Catégories avec le plus gros budget
        const topCategories = categories
            .filter(cat => cat.budgetDebutMois && parseFloat(cat.budgetDebutMois) > 0)
            .sort((a, b) => parseFloat(b.budgetDebutMois) - parseFloat(a.budgetDebutMois))
            .slice(0, 5);

        setAnalytics({
            totalCategories,
            totalBudget,
            categoriesWithBudget,
            categoriesWithIcons,
            monthlyBreakdown,
            yearlyBreakdown,
            topCategories
        });
    }, [categories]);

    const getCategoryUsage = useCallback(() => {
        if (!enrichedExpenses.length || !categories.length) return [];

        const usage = categories.map(category => {
            // Récupérer TOUTES les dépenses de cette catégorie (toutes périodes)
            // Utiliser les données enrichies
            const categoryExpenses = enrichedExpenses.filter(expense => {
                return expense.categoryObj?.id === category.id;
            });

            const totalSpent = categoryExpenses.reduce((sum, expense) =>
                sum + (parseFloat(expense.montant) || 0), 0
            );

            const budget = parseFloat(category.budgetDebutMois) || 0;
            const usagePercent = budget > 0 ? (totalSpent / budget) * 100 : 0;

            return {
                ...category,
                totalSpent,
                expenseCount: categoryExpenses.length,
                usagePercent: Math.round(usagePercent),
                isOverBudget: totalSpent > budget && budget > 0,
                expenses: categoryExpenses // Garder les dépenses pour débug
            };
        });

        return usage.sort((a, b) => b.totalSpent - a.totalSpent);
    }, [enrichedExpenses, categories]);

    const categoryUsage = getCategoryUsage();

    // Filtrer les dépenses pour la catégorie sélectionnée (toutes périodes confondues)
    useEffect(() => {
        if (selectedCategory && enrichedExpenses.length > 0) {
            const filteredExpenses = enrichedExpenses.filter(expense => {
                return expense.categoryObj?.id === selectedCategory.id;
            });
            console.log(`Dépenses trouvées pour ${selectedCategory.categorie}:`, filteredExpenses); // Debug
            console.log('Structure de la première dépense:', filteredExpenses[0]); // Debug structure
            console.log('Toutes les dépenses enrichies:', enrichedExpenses); // Debug toutes
            setCategoryExpenses(filteredExpenses);
        } else {
            setCategoryExpenses([]);
        }
    }, [selectedCategory, enrichedExpenses]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('fr-FR', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    const getSelectedCategoryStats = () => {
        if (!selectedCategory || !categoryExpenses.length) return null;

        const totalSpent = categoryExpenses.reduce((sum, expense) =>
            sum + (parseFloat(expense.montant) || 0), 0
        );
        const budget = parseFloat(selectedCategory.budgetDebutMois) || 0;
        const usagePercent = budget > 0 ? (totalSpent / budget) * 100 : 0;
        const isOverBudget = totalSpent > budget && budget > 0;
        const averageExpense = totalSpent / categoryExpenses.length;

        // Grouper par mois
        const monthlySpending = categoryExpenses.reduce((acc, expense) => {
            // Utiliser dateTransaction au lieu de dateDepense
            const date = new Date(expense.dateTransaction);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
            const monthName = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });

            if (!acc[monthKey]) {
                acc[monthKey] = { name: monthName, total: 0, count: 0 };
            }
            acc[monthKey].total += parseFloat(expense.montant) || 0;
            acc[monthKey].count += 1;
            return acc;
        }, {});

        return {
            totalSpent,
            usagePercent: Math.round(usagePercent),
            isOverBudget,
            averageExpense,
            expenseCount: categoryExpenses.length,
            monthlySpending: Object.values(monthlySpending).sort((a, b) => b.name.localeCompare(a.name))
        };
    };

    const selectedStats = getSelectedCategoryStats();

    // Fonction de tri
    const handleSort = (field) => {
        if (sortField === field) {
            setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
        } else {
            setSortField(field);
            setSortDirection('asc');
        }
        setCurrentTablePage(1); // Reset pagination
    };

    // Dépenses triées et paginées
    const sortedExpenses = useMemo(() => {
        const sorted = [...categoryExpenses].sort((a, b) => {
            let aValue = a[sortField];
            let bValue = b[sortField];

            if (sortField === 'montant') {
                aValue = parseFloat(aValue) || 0;
                bValue = parseFloat(bValue) || 0;
            } else if (sortField === 'dateTransaction') {
                aValue = new Date(aValue);
                bValue = new Date(bValue);
            } else {
                aValue = String(aValue || '').toLowerCase();
                bValue = String(bValue || '').toLowerCase();
            }

            if (aValue < bValue) return sortDirection === 'asc' ? -1 : 1;
            if (aValue > bValue) return sortDirection === 'asc' ? 1 : -1;
            return 0;
        });

        // Pagination
        const startIndex = (currentTablePage - 1) * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        return sorted.slice(startIndex, endIndex);
    }, [categoryExpenses, sortField, sortDirection, currentTablePage, itemsPerPage]);

    // Fonction d'export CSV
    const exportExpensesToCSV = (expenses, categoryName) => {
        const headers = ['Date', 'Description', 'Montant', 'Mois'];
        const csvContent = [
            headers.join(','),
            ...expenses.map(expense => [
                formatDate(expense.dateTransaction),
                `"${(expense.description || 'Dépense sans description').replace(/"/g, '""')}"`,
                expense.montant,
                new Date(expense.dateTransaction).toLocaleDateString('fr-FR', {
                    month: 'short',
                    year: 'numeric'
                })
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        const url = URL.createObjectURL(blob);
        link.setAttribute('href', url);
        link.setAttribute('download', `depenses_${categoryName}_${new Date().toISOString().split('T')[0]}.csv`);
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    // Reset pagination quand la catégorie change
    useEffect(() => {
        setCurrentTablePage(1);
    }, [selectedCategory]);

    if (loading) {
        return (
            <div className="category-analytics-loading">
                <div className="loading-spinner">⏳</div>
                <p>Chargement des analyses...</p>
            </div>
        );
    }

    return (
        <div className="category-analytics">
            <div className="analytics-header">
                <h3>📊 Analyses des Catégories</h3>
                <p>Sélectionnez une catégorie pour voir ses dépenses détaillées</p>
            </div>

            {/* Sélecteur de catégorie */}
            <div className="category-selector-section">
                <label className="selector-label">Choisir une catégorie :</label>
                <select
                    value={selectedCategory?.id || ''}
                    onChange={(e) => {
                        const categoryId = parseInt(e.target.value);
                        const category = categories.find(cat => cat.id === categoryId);
                        setSelectedCategory(category || null);
                    }}
                    className="category-selector"
                >
                    <option value="">-- Sélectionner une catégorie --</option>
                    {categories.map(category => (
                        <option key={category.id} value={category.id}>
                            {category.categorie} {category.budgetDebutMois ? `(${formatCurrency(category.budgetDebutMois)})` : ''}
                        </option>
                    ))}
                </select>
            </div>

            {/* Affichage conditionnel selon la sélection */}
            {selectedCategory ? (
                <div className="selected-category-analysis">
                    {/* En-tête de la catégorie sélectionnée */}
                    <div className="selected-category-header">
                        <div className="category-title">
                            {selectedCategory.iconName && (
                                <i className={selectedCategory.iconName} style={{ color: selectedCategory.color }}></i>
                            )}
                            <h3>{selectedCategory.categorie}</h3>
                        </div>
                        {selectedCategory.budgetDebutMois > 0 && (
                            <div className="category-budget-info">
                                Budget mensuel: {formatCurrency(selectedCategory.budgetDebutMois)}
                                {selectedCategory.month && selectedCategory.annee && (
                                    <span className="budget-period"> (défini pour {selectedCategory.month} {selectedCategory.annee})</span>
                                )}
                                <div className="all-periods-note">
                                    📊 Affichage de toutes les dépenses, toutes périodes confondues
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Statistiques de la catégorie sélectionnée */}
                    {selectedStats && (
                        <div className="selected-stats-grid">
                            <div className="stat-card">
                                <div className="stat-icon">💸</div>
                                <div className="stat-content">
                                    <h4>Total Dépensé</h4>
                                    <p className="stat-value">{formatCurrency(selectedStats.totalSpent)}</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">📊</div>
                                <div className="stat-content">
                                    <h4>Utilisation Budget</h4>
                                    <p className={`stat-value ${selectedStats.isOverBudget ? 'over-budget' : ''}`}>
                                        {selectedStats.usagePercent}%
                                    </p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">📝</div>
                                <div className="stat-content">
                                    <h4>Nombre Dépenses</h4>
                                    <p className="stat-value">{selectedStats.expenseCount}</p>
                                </div>
                            </div>

                            <div className="stat-card">
                                <div className="stat-icon">📈</div>
                                <div className="stat-content">
                                    <h4>Moyenne par Dépense</h4>
                                    <p className="stat-value">{formatCurrency(selectedStats.averageExpense)}</p>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Répartition mensuelle */}
                    {selectedStats && selectedStats.monthlySpending.length > 0 && (
                        <div className="monthly-breakdown-section">
                            <h4>📅 Répartition Mensuelle</h4>
                            <div className="monthly-breakdown">
                                {selectedStats.monthlySpending.map((month, index) => (
                                    <div key={index} className="month-item">
                                        <span className="month-name">{month.name}</span>
                                        <span className="month-amount">{formatCurrency(month.total)}</span>
                                        <span className="month-count">({month.count} dépense{month.count > 1 ? 's' : ''})</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Tableau détaillé des dépenses */}
                    {categoryExpenses.length > 0 && (
                        <div className="expenses-table-wrapper">
                            <div className="table-header">
                                <h4>💳 Toutes les Dépenses ({categoryExpenses.length}) - Toutes périodes</h4>
                                <div className="table-controls">
                                    <button className="export-btn" onClick={() => exportExpensesToCSV(categoryExpenses, selectedCategory.categorie)}>
                                        📊 Exporter CSV
                                    </button>
                                </div>
                            </div>

                            <div className="expenses-table-container">
                                <table className="expenses-table">
                                    <thead>
                                        <tr>
                                            <th className="sortable" onClick={() => handleSort('dateTransaction')}>
                                                Date
                                                {sortField === 'dateTransaction' && (
                                                    <span className="sort-indicator">
                                                        {sortDirection === 'asc' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </th>
                                            <th className="sortable" onClick={() => handleSort('description')}>
                                                Description
                                                {sortField === 'description' && (
                                                    <span className="sort-indicator">
                                                        {sortDirection === 'asc' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </th>
                                            <th className="sortable amount-column" onClick={() => handleSort('montant')}>
                                                Montant
                                                {sortField === 'montant' && (
                                                    <span className="sort-indicator">
                                                        {sortDirection === 'asc' ? '↑' : '↓'}
                                                    </span>
                                                )}
                                            </th>
                                            <th>Mois</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {sortedExpenses.map((expense, index) => (
                                            <tr key={expense.id || index} className="expense-row">
                                                <td className="date-cell">
                                                    {formatDate(expense.dateTransaction)}
                                                </td>
                                                <td className="description-cell">
                                                    {expense.description || 'Dépense sans description'}
                                                </td>
                                                <td className="amount-cell">
                                                    {formatCurrency(expense.montant)}
                                                </td>
                                                <td className="month-cell">
                                                    {new Date(expense.dateTransaction).toLocaleDateString('fr-FR', {
                                                        month: 'short',
                                                        year: 'numeric'
                                                    })}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* Pagination */}
                            {sortedExpenses.length > 10 && (
                                <div className="table-pagination">
                                    <div className="pagination-info">
                                        Affichage de {((currentTablePage - 1) * itemsPerPage) + 1} à {Math.min(currentTablePage * itemsPerPage, sortedExpenses.length)} sur {sortedExpenses.length} dépenses
                                    </div>
                                    <div className="pagination-controls">
                                        <button
                                            className="pagination-btn"
                                            onClick={() => setCurrentTablePage(prev => Math.max(prev - 1, 1))}
                                            disabled={currentTablePage === 1}
                                        >
                                            ← Précédent
                                        </button>
                                        <span className="page-indicator">
                                            Page {currentTablePage} sur {Math.ceil(sortedExpenses.length / itemsPerPage)}
                                        </span>
                                        <button
                                            className="pagination-btn"
                                            onClick={() => setCurrentTablePage(prev => Math.min(prev + 1, Math.ceil(sortedExpenses.length / itemsPerPage)))}
                                            disabled={currentTablePage === Math.ceil(sortedExpenses.length / itemsPerPage)}
                                        >
                                            Suivant →
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}

                    {categoryExpenses.length === 0 && (
                        <div className="no-expenses">
                            <div className="no-expenses-icon">💸</div>
                            <h4>Aucune dépense trouvée</h4>
                            <p>Cette catégorie n'a pas encore de dépenses enregistrées.</p>
                        </div>
                    )}
                </div>
            ) : (
                <div className="general-analytics">
                    {/* Statistiques générales */}
                    <div className="analytics-grid">
                        <div className="analytics-card">
                            <div className="card-icon">📂</div>
                            <div className="card-content">
                                <h4>Total Catégories</h4>
                                <p className="card-value">{analytics.totalCategories}</p>
                            </div>
                        </div>

                        <div className="analytics-card">
                            <div className="card-icon">💰</div>
                            <div className="card-content">
                                <h4>Budget Total</h4>
                                <p className="card-value">{formatCurrency(analytics.totalBudget)}</p>
                            </div>
                        </div>

                        <div className="analytics-card">
                            <div className="card-icon">✅</div>
                            <div className="card-content">
                                <h4>Avec Budget</h4>
                                <p className="card-value">{analytics.categoriesWithBudget}</p>
                                <p className="card-subtitle">
                                    {analytics.totalCategories > 0
                                        ? Math.round((analytics.categoriesWithBudget / analytics.totalCategories) * 100)
                                        : 0
                                    }% des catégories
                                </p>
                            </div>
                        </div>

                        <div className="analytics-card">
                            <div className="card-icon">🎨</div>
                            <div className="card-content">
                                <h4>Avec Icône</h4>
                                <p className="card-value">{analytics.categoriesWithIcons}</p>
                                <p className="card-subtitle">
                                    {analytics.totalCategories > 0
                                        ? Math.round((analytics.categoriesWithIcons / analytics.totalCategories) * 100)
                                        : 0
                                    }% des catégories
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Top 5 des catégories par budget */}
                    {analytics.topCategories.length > 0 && (
                        <div className="analytics-section">
                            <h4>🏆 Top 5 Budgets</h4>
                            <div className="top-categories">
                                {analytics.topCategories.map((category, index) => (
                                    <div key={category.id} className="top-category-item">
                                        <div className="rank">#{index + 1}</div>
                                        <div className="category-info">
                                            {category.iconName && (
                                                <i className={category.iconName} style={{ color: category.color }}></i>
                                            )}
                                            <span>{category.categorie}</span>
                                        </div>
                                        <div className="category-budget">
                                            {formatCurrency(category.budgetDebutMois)}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Utilisation des catégories */}
                    {categoryUsage.length > 0 && (
                        <div className="analytics-section">
                            <h4>📈 Utilisation des Catégories</h4>
                            <div className="category-usage-list">
                                {categoryUsage.slice(0, 10).map((category) => (
                                    <div
                                        key={category.id}
                                        className="usage-item clickable"
                                        onClick={() => setSelectedCategory(category)}
                                        title="Cliquer pour voir les détails"
                                    >
                                        <div className="usage-header">
                                            <div className="usage-category">
                                                {category.iconName && (
                                                    <i className={category.iconName} style={{ color: category.color }}></i>
                                                )}
                                                <span>{category.categorie}</span>
                                            </div>
                                            <div className="usage-amount">
                                                {formatCurrency(category.totalSpent)}
                                            </div>
                                        </div>

                                        {category.budgetDebutMois > 0 && (
                                            <div className="usage-progress">
                                                <div className="progress-bar">
                                                    <div
                                                        className={`progress-fill ${category.isOverBudget ? 'over-budget' : ''}`}
                                                        style={{ width: `${Math.min(category.usagePercent, 100)}%` }}
                                                    ></div>
                                                </div>
                                                <span className={`usage-percent ${category.isOverBudget ? 'over-budget' : ''}`}>
                                                    {category.usagePercent}%
                                                </span>
                                            </div>
                                        )}

                                        <div className="usage-details">
                                            <span>{category.expenseCount} dépense(s)</span>
                                            {category.budgetDebutMois > 0 && (
                                                <span>Budget: {formatCurrency(category.budgetDebutMois)}</span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}

export default CategoryAnalytics;