// AllSpend.jsx amélioré avec classes CSS cohérentes et mode sombre
import React, {useEffect, useRef, useState} from "react";
import {Bar} from "react-chartjs-2";
import "jspdf-autotable";
import MonthlyExpensesByCategory from './MonthlyExpensesByCategoryIntegration.jsx';
import useBudgetStore from "../../useBudgetStore";
import './css/allSpend.css'; // Import du CSS

const AllSpend = () => {
    const pdfRef = useRef();
    const chartRef = useRef();
    const [budget, setBudget] = useState(0);
    const [budgetUsed, setBudgetUsed] = useState(0);
    const [budgetRemaining, setBudgetRemaining] = useState(0);
    const [isDarkMode, setIsDarkMode] = useState(false);

    const {
        depenses,
        monthlySummary,
        categoryColors,
        fetchDepenses,
        generateMonthlySummary,
        assignCategoryColors
    } = useBudgetStore();

    useEffect(() => {
        const init = async () => {
            await fetchDepenses();
            generateMonthlySummary();
            assignCategoryColors();
        };
        init();

        // Détection du mode sombre
        const checkDarkMode = () => {
            const theme = document.documentElement.getAttribute('data-theme');
            const bodyClass = document.body.className;
            setIsDarkMode(theme === 'dark' || bodyClass.includes('dark-mode'));
        };

        checkDarkMode();

        // Observer les changements de thème
        const observer = new MutationObserver(checkDarkMode);
        observer.observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });
        observer.observe(document.body, { attributes: true, attributeFilter: ['class'] });

        return () => {
            observer.disconnect();
            // Détruire le graphique si il existe
            if (chartRef.current) {
                chartRef.current.destroy();
            }
        };
    }, [fetchDepenses, generateMonthlySummary, assignCategoryColors]);

    useEffect(() => {
        const total = depenses.reduce((acc, d) => acc + parseFloat(d.montant || 0), 0);
        setBudgetUsed(total);
        setBudgetRemaining(budget - total);
    }, [depenses, budget]);

    const chartData = {
        labels: Object.keys(monthlySummary),
        datasets: [
            {
                label: "Dépenses par Mois",
                data: Object.values(monthlySummary).map((m) => m.total),
                backgroundColor: [
                    '#667eea', '#764ba2', '#16a34a', '#d97706',
                    '#dc2626', '#0284c7', '#7c3aed', '#059669'
                ],
                borderColor: '#334155',
                borderWidth: 1,
                borderRadius: 8,
                borderSkipped: false,
            },
        ],
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: true,
        plugins: {
            legend: {
                display: true,
                position: 'top',
                labels: {
                    color: isDarkMode ? '#f0f6fc' : '#0f172a',
                    font: {
                        size: 14,
                        weight: '500'
                    }
                }
            },
            tooltip: {
                backgroundColor: isDarkMode ? '#161b22' : '#ffffff',
                titleColor: isDarkMode ? '#f0f6fc' : '#0f172a',
                bodyColor: isDarkMode ? '#c9d1d9' : '#334155',
                borderColor: isDarkMode ? '#30363d' : '#cbd5e1',
                borderWidth: 1
            }
        },
        scales: {
            y: {
                beginAtZero: true,
                grid: {
                    color: isDarkMode ? '#30363d' : '#e2e8f0'
                },
                ticks: {
                    color: isDarkMode ? '#c9d1d9' : '#334155'
                }
            },
            x: {
                grid: {
                    color: isDarkMode ? '#30363d' : '#e2e8f0'
                },
                ticks: {
                    color: isDarkMode ? '#c9d1d9' : '#334155'
                }
            }
        }
    };

    // Fonction pour obtenir l'état du budget
    const getBudgetStatus = () => {
        if (budgetRemaining > budget * 0.5) return 'good';
        if (budgetRemaining > budget * 0.2) return 'warning';
        return 'danger';
    };

    if (!monthlySummary || Object.keys(monthlySummary).length === 0) {
        return (
            <div className="allspend-container">
                <div className="empty-state">
                    <div className="empty-state-icon">📊</div>
                    <h2 className="empty-state-title">Aucune dépense trouvée</h2>
                    <p className="empty-state-description">
                        Commencez par ajouter quelques dépenses pour voir vos statistiques
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="allspend-container">
            {/* Titre principal */}
            <h1 className="allspend-title">
                Analyse de vos dépenses
            </h1>

            {/* Résumé budget */}
            {budget > 0 && (
                <div className="budget-summary">
                    <div className="budget-stat total">
                        <div className="budget-label">Budget Total</div>
                        <div className="budget-value">{budget.toFixed(2)} €</div>
                    </div>
                    <div className="budget-stat used">
                        <div className="budget-label">Budget Utilisé</div>
                        <div className="budget-value">{budgetUsed.toFixed(2)} €</div>
                    </div>
                    <div className={`budget-stat remaining ${getBudgetStatus()}`}>
                        <div className="budget-label">Budget Restant</div>
                        <div className="budget-value">{budgetRemaining.toFixed(2)} €</div>
                    </div>
                </div>
            )}

            <div ref={pdfRef}>
                {/* Section Bilan Mensuel */}
                <section className="allspend-section">
                    <h2 className="section-title">Bilan Mensuel Détaillé</h2>

                    <div className="monthly-cards-container">
                        {Object.entries(monthlySummary || {}).map(([month, {total, categories}]) => (
                            <div key={month} className="monthly-card">
                                <div className="monthly-card-header">
                                    <h3 className="monthly-card-title">{month}</h3>
                                    <div className="monthly-total">
                                        {total.toFixed(2)} €
                                    </div>
                                </div>

                                <ul className="category-list">
                                    {Object.entries(categories || {}).map(([category, amount]) => (
                                        <li key={category} className="category-item">
                                            <span
                                                className="category-name"
                                                style={{
                                                    '--category-color': categoryColors[category] || '#667eea'
                                                }}
                                            >
                                                <span
                                                    className="category-color-dot"
                                                    style={{
                                                        backgroundColor: categoryColors[category] || '#667eea'
                                                    }}
                                                ></span>
                                                {category}
                                            </span>
                                            <span className="category-amount">
                                                {amount.toFixed(2)} €
                                            </span>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Section Graphique */}
                <section className="chart-section">
                    <h2 className="chart-title">Évolution des Dépenses</h2>
                    <div className="chart-container">
                        <Bar
                            ref={chartRef}
                            key={`allspend-chart-${Date.now()}`}
                            data={chartData}
                            options={chartOptions}
                        />
                    </div>
                </section>

                {/* Composant intégré */}
                <section className="allspend-section">
                    <MonthlyExpensesByCategory
                        monthlySummary={monthlySummary}
                        categoryColors={categoryColors}
                    />
                </section>
            </div>
        </div>
    );
};

export default AllSpend;