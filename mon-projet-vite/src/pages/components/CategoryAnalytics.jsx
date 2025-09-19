import React, { useState, useEffect, useCallback } from 'react';
import lien from './lien';

export function CategoryAnalytics({ categories }) {
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

    const fetchExpenses = useCallback(async () => {
        setLoading(true);
        try {
            const jwt = localStorage.getItem("jwt") || "";
            const userId = parseInt(localStorage.getItem("utilisateur") || "0", 10);

            if (!userId) return;

            const response = await fetch(`${lien.url}depense/byuser/${userId}`, {
                headers: { Authorization: `Bearer ${jwt}` }
            });

            if (response.ok) {
                const expensesData = await response.json();
                setExpenses(expensesData);
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
        if (!expenses.length || !categories.length) return [];

        const usage = categories.map(category => {
            const categoryExpenses = expenses.filter(expense =>
                expense.categorie?.id === category.id
            );

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
                isOverBudget: totalSpent > budget && budget > 0
            };
        });

        return usage.sort((a, b) => b.totalSpent - a.totalSpent);
    }, [expenses, categories]);

    const categoryUsage = getCategoryUsage();

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

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
                <p>Aperçu de vos catégories et de leur utilisation</p>
            </div>

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
                            <div key={category.id} className="usage-item">
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

            {/* Répartition par mois/année */}
            <div className="analytics-breakdown">
                {Object.keys(analytics.monthlyBreakdown).length > 0 && (
                    <div className="breakdown-section">
                        <h4>📅 Par Mois</h4>
                        <div className="breakdown-items">
                            {Object.entries(analytics.monthlyBreakdown)
                                .sort(([a], [b]) => a.localeCompare(b))
                                .map(([month, count]) => (
                                <div key={month} className="breakdown-item">
                                    <span>{month}</span>
                                    <span className="breakdown-count">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {Object.keys(analytics.yearlyBreakdown).length > 0 && (
                    <div className="breakdown-section">
                        <h4>📆 Par Année</h4>
                        <div className="breakdown-items">
                            {Object.entries(analytics.yearlyBreakdown)
                                .sort(([a], [b]) => b.localeCompare(a))
                                .map(([year, count]) => (
                                <div key={year} className="breakdown-item">
                                    <span>{year}</span>
                                    <span className="breakdown-count">{count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default CategoryAnalytics;