import React, { useState, useEffect, useMemo } from 'react';
import { BarChart3, TrendingUp, Filter, Download, RefreshCw, Eye, EyeOff } from 'lucide-react';
import useBudgetStore from '../../useBudgetStore';
import NativeChart from './NativeChart';
import ChartErrorBoundary from './ChartErrorBoundary';
import './css/advanced-expense-chart.css';

const SimpleExpenseChart = () => {
    const { depenses, categories, fetchDepenses, fetchCategories } = useBudgetStore();

    // États locaux
    const [chartType, setChartType] = useState('bar');
    const [groupBy, setGroupBy] = useState('category');
    const [showFilters, setShowFilters] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [refreshKey, setRefreshKey] = useState(0);

    // Chargement des données
    useEffect(() => {
        const loadData = async () => {
            await fetchDepenses();
            await fetchCategories();
        };
        loadData();
    }, [fetchDepenses, fetchCategories]);

    // Debug logs
    console.log('SimpleExpenseChart - Dépenses:', depenses?.length || 0);
    console.log('SimpleExpenseChart - Catégories:', categories?.length || 0);
    console.log('SimpleExpenseChart - Premier élément dépenses:', depenses?.[0]);
    console.log('SimpleExpenseChart - Premier élément catégories:', categories?.[0]);

    // Fonction pour obtenir le nom de catégorie
    const getCategoryName = (categorieValue) => {
        if (!categorieValue || !categories?.length) {
            return 'Non catégorisé';
        }

        // Recherche par ID ou par nom
        const found = categories.find(cat =>
            cat.id === categorieValue ||
            cat.categorie === categorieValue ||
            String(cat.id) === String(categorieValue)
        );

        return found ? found.categorie : String(categorieValue);
    };

    // Traitement des données pour le graphique
    const chartData = useMemo(() => {
        if (!depenses || depenses.length === 0) {
            console.log('Aucune dépense trouvée');
            return {
                labels: ['Aucune donnée'],
                datasets: [{
                    label: 'Aucune donnée',
                    data: [0],
                    backgroundColor: 'rgba(102, 126, 234, 0.3)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            };
        }

        let processedData = {};
        let filteredDepenses = depenses;

        // Filtrer par catégories sélectionnées
        if (selectedCategories.length > 0) {
            filteredDepenses = depenses.filter(depense => {
                const categoryName = getCategoryName(depense.categorie);
                return selectedCategories.includes(categoryName);
            });
        }

        console.log('Dépenses filtrées:', filteredDepenses.length);

        // Grouper les données selon le critère
        switch (groupBy) {
            case 'category':
                filteredDepenses.forEach(depense => {
                    const categoryName = getCategoryName(depense.categorie);
                    const montant = parseFloat(depense.montant) || 0;
                    processedData[categoryName] = (processedData[categoryName] || 0) + montant;
                });
                break;

            case 'month':
                filteredDepenses.forEach(depense => {
                    const date = new Date(depense.dateTransaction);
                    const month = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                    const montant = parseFloat(depense.montant) || 0;
                    processedData[month] = (processedData[month] || 0) + montant;
                });
                break;

            case 'week':
                filteredDepenses.forEach(depense => {
                    const date = new Date(depense.dateTransaction);
                    const startOfWeek = new Date(date);
                    startOfWeek.setDate(date.getDate() - date.getDay());
                    const weekLabel = `Semaine du ${startOfWeek.toLocaleDateString('fr-FR')}`;
                    const montant = parseFloat(depense.montant) || 0;
                    processedData[weekLabel] = (processedData[weekLabel] || 0) + montant;
                });
                break;

            default:
                // Par défaut, grouper par catégorie
                filteredDepenses.forEach(depense => {
                    const categoryName = getCategoryName(depense.categorie);
                    const montant = parseFloat(depense.montant) || 0;
                    processedData[categoryName] = (processedData[categoryName] || 0) + montant;
                });
        }

        console.log('Données traitées:', processedData);

        const labels = Object.keys(processedData);
        const values = Object.values(processedData);

        if (labels.length === 0) {
            return {
                labels: ['Aucune donnée'],
                datasets: [{
                    label: 'Aucune donnée après filtrage',
                    data: [0],
                    backgroundColor: 'rgba(102, 126, 234, 0.3)',
                    borderColor: 'rgba(102, 126, 234, 1)',
                    borderWidth: 1
                }]
            };
        }

        // Couleurs pour les graphiques
        const colors = [
            '#667eea', '#16a34a', '#dc2626', '#d97706', '#0284c7',
            '#7c3aed', '#059669', '#ea580c', '#0ea5e9', '#7c2d12'
        ];

        return {
            labels,
            datasets: [{
                label: `Montant par ${groupBy === 'category' ? 'catégorie' : groupBy === 'month' ? 'mois' : 'semaine'}`,
                data: values,
                backgroundColor: chartType === 'pie' || chartType === 'doughnut'
                    ? colors.slice(0, labels.length)
                    : 'rgba(102, 126, 234, 0.8)',
                borderColor: chartType === 'pie' || chartType === 'doughnut'
                    ? colors.slice(0, labels.length)
                    : 'rgba(102, 126, 234, 1)',
                borderWidth: 1
            }]
        };
    }, [depenses, categories, selectedCategories, groupBy]);

    // Options du graphique
    const chartOptions = useMemo(() => ({
        responsive: true,
        maintainAspectRatio: false,
        animation: false,
        plugins: {
            legend: {
                display: true,
                position: 'top'
            },
            tooltip: {
                enabled: true,
                callbacks: {
                    label: function(context) {
                        const value = context.parsed.y || context.parsed;
                        return `${context.dataset.label}: ${value.toFixed(2)} €`;
                    }
                }
            }
        },
        ...(chartType !== 'pie' && chartType !== 'doughnut' ? {
            scales: {
                x: {
                    display: true
                },
                y: {
                    display: true,
                    beginAtZero: true,
                    ticks: {
                        callback: function(value) {
                            return value.toFixed(2) + ' €';
                        }
                    }
                }
            }
        } : {})
    }), [chartType]);

    // Fonction pour actualiser le graphique
    const refreshChart = () => {
        setRefreshKey(prev => prev + 1);
    };

    // Fonction pour sélectionner/désélectionner toutes les catégories
    const toggleAllCategories = () => {
        if (selectedCategories.length === categories.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(categories.map(cat => cat.categorie));
        }
    };

    // Calculs statistiques
    const statistics = useMemo(() => {
        const filteredDepenses = selectedCategories.length > 0
            ? depenses.filter(d => {
                const categoryName = getCategoryName(d.categorie);
                return selectedCategories.includes(categoryName);
            })
            : depenses;

        const total = filteredDepenses.reduce((acc, d) => acc + (parseFloat(d.montant) || 0), 0);
        const count = filteredDepenses.length;
        const average = count > 0 ? total / count : 0;

        return { total, count, average };
    }, [depenses, selectedCategories]);

    // Fonction de formatage
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    // Si pas de données
    if (!depenses || depenses.length === 0) {
        return (
            <div className="advanced-expense-chart">
                <div className="chart-header">
                    <h2 className="chart-title">
                        <BarChart3 size={24} />
                        Analyse Graphique des Dépenses
                    </h2>
                </div>
                <div className="no-data">
                    <div className="no-data-icon">📊</div>
                    <h3>Aucune dépense trouvée</h3>
                    <p>Ajoutez des dépenses pour voir les graphiques.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="advanced-expense-chart">
            {/* Header */}
            <div className="chart-header">
                <h2 className="chart-title">
                    <BarChart3 size={24} />
                    Analyse des Dépenses ({depenses.length} dépenses)
                </h2>
                <div className="header-actions">
                    <button
                        className="btn btn-outline"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        {showFilters ? <EyeOff size={18} /> : <Eye size={18} />}
                        {showFilters ? 'Masquer' : 'Filtres'}
                    </button>
                    <button className="btn btn-outline" onClick={refreshChart}>
                        <RefreshCw size={18} />
                        Actualiser
                    </button>
                </div>
            </div>

            {/* Filtres */}
            {showFilters && (
                <div className="filters-section">
                    <div className="filters-grid">
                        <div className="filter-group">
                            <label>Type de graphique</label>
                            <select
                                value={chartType}
                                onChange={(e) => setChartType(e.target.value)}
                                className="select-input"
                            >
                                <option value="bar">Barres</option>
                                <option value="line">Courbe</option>
                                <option value="pie">Camembert</option>
                                <option value="doughnut">Donut</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Grouper par</label>
                            <select
                                value={groupBy}
                                onChange={(e) => setGroupBy(e.target.value)}
                                className="select-input"
                            >
                                <option value="category">Catégorie</option>
                                <option value="month">Mois</option>
                                <option value="week">Semaine</option>
                            </select>
                        </div>
                    </div>

                    {/* Sélection des catégories */}
                    {categories && categories.length > 0 && (
                        <div className="filter-group full-width">
                            <div className="categories-header">
                                <label>Catégories à afficher</label>
                                <button
                                    type="button"
                                    className="btn btn-sm btn-outline"
                                    onClick={toggleAllCategories}
                                >
                                    {selectedCategories.length === categories.length ? 'Tout désélectionner' : 'Tout sélectionner'}
                                </button>
                            </div>
                            <div className="categories-selector">
                                {categories.map(cat => (
                                    <label key={cat.id} className="category-checkbox">
                                        <input
                                            type="checkbox"
                                            checked={selectedCategories.includes(cat.categorie)}
                                            onChange={(e) => {
                                                if (e.target.checked) {
                                                    setSelectedCategories([...selectedCategories, cat.categorie]);
                                                } else {
                                                    setSelectedCategories(selectedCategories.filter(c => c !== cat.categorie));
                                                }
                                            }}
                                        />
                                        <span style={{ color: cat.color || '#667eea' }}>
                                            {cat.iconName && <i className={cat.iconName}></i>}
                                            {cat.categorie}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Statistiques */}
            <div className="statistics-grid">
                <div className="stat-card">
                    <div className="stat-icon">💰</div>
                    <div className="stat-content">
                        <h3>Total</h3>
                        <p className="stat-value">{formatCurrency(statistics.total)}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3>Nombre</h3>
                        <p className="stat-value">{statistics.count} dépenses</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">📈</div>
                    <div className="stat-content">
                        <h3>Moyenne</h3>
                        <p className="stat-value">{formatCurrency(statistics.average)}</p>
                    </div>
                </div>

                <div className="stat-card">
                    <div className="stat-icon">🏷️</div>
                    <div className="stat-content">
                        <h3>Catégories</h3>
                        <p className="stat-value">{categories?.length || 0}</p>
                    </div>
                </div>
            </div>

            {/* Graphique */}
            <div className="chart-container" key={`container-${refreshKey}`}>
                <ChartErrorBoundary onRetry={refreshChart}>
                    <NativeChart
                        type={chartType}
                        data={chartData}
                        options={chartOptions}
                        key={`chart-${chartType}-${groupBy}-${refreshKey}-${selectedCategories.length}`}
                    />
                </ChartErrorBoundary>
            </div>
        </div>
    );
};

export default SimpleExpenseChart;