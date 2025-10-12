import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import DatePicker from 'react-datepicker';
import ChartErrorBoundary from './ChartErrorBoundary';
import SafeChart from './SafeChart';
import NativeChart from './NativeChart';

// Chart.js/auto inclut automatiquement tous les composants nécessaires
import useBudgetStore from '../../useBudgetStore';
import {
    Calendar,
    Filter,
    TrendingUp,
    BarChart3,
    PieChart,
    Download,
    RefreshCw,
    Eye,
    EyeOff
} from 'lucide-react';
import './css/advanced-expense-chart.css';

const AdvancedExpenseChart = () => {
    const { depenses, revenus, categories } = useBudgetStore();
    const chartRef = useRef(null);
    const chartInstanceRef = useRef(null);

    // Debug du store (development only)
    if (process.env.NODE_ENV === 'development') {
        console.log('AdvancedExpenseChart - Store data:');
        console.log('- Dépenses:', depenses?.length || 0);
        console.log('- Catégories:', categories?.length || 0);
        console.log('- Détail dépenses:', depenses?.slice(0, 3));
    }

    // États des filtres
    const [startDate, setStartDate] = useState(new Date(new Date().getFullYear(), 0, 1));
    const [endDate, setEndDate] = useState(new Date());
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [chartType, setChartType] = useState('line');
    const [groupBy, setGroupBy] = useState('month');
    const [showFilters, setShowFilters] = useState(false);
    const [minAmount, setMinAmount] = useState('');
    const [maxAmount, setMaxAmount] = useState('');
    const [chartKey, setChartKey] = useState(0);

    // Données filtrées
    const filteredData = useMemo(() => {
        let filtered = depenses.filter(d => {
            const date = new Date(d.dateTransaction);
            const amount = parseFloat(d.montant);

            // Filtre par date
            if (date < startDate || date > endDate) return false;

            // Filtre par catégorie - corriger la logique
            if (selectedCategories.length > 0) {
                // Chercher la catégorie correspondante
                const category = categories.find(cat =>
                    cat.id === d.categorie || cat.categorie === d.categorie
                );
                const categoryName = category ? category.categorie : d.categorie;
                if (!selectedCategories.includes(categoryName)) return false;
            }

            // Filtre par montant
            if (minAmount && amount < parseFloat(minAmount)) return false;
            if (maxAmount && amount > parseFloat(maxAmount)) return false;

            return true;
        });

        // Grouper les données selon le critère sélectionné
        const grouped = {};
        filtered.forEach(d => {
            const date = new Date(d.dateTransaction);
            let key;

            switch (groupBy) {
                case 'day':
                    key = date.toLocaleDateString('fr-FR');
                    break;
                case 'week': {
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    key = `Semaine du ${weekStart.toLocaleDateString('fr-FR')}`;
                    break;
                }
                case 'month':
                    key = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
                    break;
                case 'quarter': {
                    const quarter = Math.floor(date.getMonth() / 3) + 1;
                    key = `T${quarter} ${date.getFullYear()}`;
                    break;
                }
                case 'year':
                    key = date.getFullYear().toString();
                    break;
                case 'category': {
                    // Utiliser le nom de catégorie correct
                    const category = categories.find(cat =>
                        cat.id === d.categorie || cat.categorie === d.categorie
                    );
                    key = category ? category.categorie : (d.categorie || 'Non catégorisé');
                    break;
                }
                default:
                    key = date.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
            }

            if (!grouped[key]) {
                grouped[key] = {
                    total: 0,
                    count: 0,
                    items: []
                };
            }

            grouped[key].total += parseFloat(d.montant);
            grouped[key].count += 1;
            grouped[key].items.push(d);
        });

        return grouped;
    }, [depenses, startDate, endDate, selectedCategories, groupBy, minAmount, maxAmount, categories]);

    // Données pour les graphiques
    const chartData = useMemo(() => {
        const labels = Object.keys(filteredData).sort();
        const values = labels.map(label => filteredData[label].total);
        const counts = labels.map(label => filteredData[label].count);

        // Validation des données
        if (labels.length === 0) {
            return {
                labels: ['Aucune donnée'],
                datasets: [{
                    label: 'Aucune donnée',
                    data: [0],
                    backgroundColor: 'rgba(102, 126, 234, 0.3)',
                    borderColor: 'rgba(102, 126, 234, 0.3)',
                    borderWidth: 1
                }]
            };
        }

        const colors = [
            '#667eea', '#764ba2', '#16a34a', '#d97706',
            '#dc2626', '#0284c7', '#7c3aed', '#059669',
            '#ea580c', '#0891b2', '#be185d', '#4338ca'
        ];

        return {
            labels,
            datasets: [
                {
                    label: 'Montant des dépenses (€)',
                    data: values,
                    backgroundColor: chartType === 'pie' || chartType === 'doughnut'
                        ? colors.slice(0, labels.length)
                        : 'rgba(102, 126, 234, 0.8)',
                    borderColor: chartType === 'line' ? '#667eea' : 'rgba(102, 126, 234, 1)',
                    borderWidth: chartType === 'line' ? 2 : 1,
                    fill: chartType === 'line' ? false : true,
                    tension: chartType === 'line' ? 0.4 : 0,
                },
                ...(chartType === 'bar' ? [{
                    label: 'Nombre de dépenses',
                    data: counts,
                    backgroundColor: 'rgba(220, 38, 38, 0.6)',
                    borderColor: 'rgba(220, 38, 38, 1)',
                    borderWidth: 1,
                    yAxisID: groupBy === 'category' ? 'y' : 'y1',
                }] : [])
            ]
        };
    }, [filteredData, chartType, groupBy]);

    // Options des graphiques
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    color: '#374151',
                    font: { size: 12 }
                }
            },
            title: {
                display: true,
                text: `Analyse des dépenses par ${groupBy === 'month' ? 'mois' : groupBy === 'category' ? 'catégorie' : groupBy}`,
                color: '#374151',
                font: { size: 16, weight: 'bold' }
            },
            tooltip: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                titleColor: '#fff',
                bodyColor: '#fff',
                callbacks: {
                    label: function(context) {
                        const value = context.parsed.y || context.parsed;
                        if (context.dataset.label.includes('Nombre')) {
                            return `${context.dataset.label}: ${value}`;
                        }
                        return `${context.dataset.label}: ${value.toFixed(2)} €`;
                    }
                }
            }
        },
        ...(chartType === 'bar' ? {
            scales: {
                y: {
                    type: 'linear',
                    display: true,
                    position: 'left',
                    title: {
                        display: true,
                        text: groupBy === 'category' ? 'Montant (€) / Nombre' : 'Montant (€)'
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    ticks: { color: '#374151' }
                },
                ...(groupBy !== 'category' ? {
                    y1: {
                        type: 'linear',
                        display: true,
                        position: 'right',
                        title: {
                            display: true,
                            text: 'Nombre'
                        },
                        grid: { drawOnChartArea: false },
                        ticks: { color: '#374151' }
                    }
                } : {}),
                x: {
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    ticks: { color: '#374151' }
                }
            }
        } : chartType === 'line' ? {
            scales: {
                y: {
                    beginAtZero: true,
                    ticks: { color: '#374151' },
                    title: {
                        display: true,
                        text: 'Montant (€)'
                    },
                    grid: { color: 'rgba(0, 0, 0, 0.1)' }
                },
                x: {
                    grid: { color: 'rgba(0, 0, 0, 0.1)' },
                    ticks: { color: '#374151' }
                }
            }
        } : {})
    };

    // Statistiques calculées
    const statistics = useMemo(() => {
        const total = Object.values(filteredData).reduce((acc, data) => acc + data.total, 0);
        const count = Object.values(filteredData).reduce((acc, data) => acc + data.count, 0);
        const average = count > 0 ? total / count : 0;
        const periods = Object.keys(filteredData).length;

        return { total, count, average, periods };
    }, [filteredData]);

    // Fonctions utilitaires
    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const resetFilters = () => {
        setStartDate(new Date(new Date().getFullYear(), 0, 1));
        setEndDate(new Date());
        setSelectedCategories([]);
        setMinAmount('');
        setMaxAmount('');
    };

    const exportData = () => {
        const data = Object.entries(filteredData).map(([period, data]) => ({
            Période: period,
            'Montant Total': data.total.toFixed(2),
            'Nombre de Dépenses': data.count,
            'Montant Moyen': (data.total / data.count).toFixed(2)
        }));

        const csv = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `analyse_depenses_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const toggleAllCategories = () => {
        if (selectedCategories.length === categories.length) {
            setSelectedCategories([]);
        } else {
            setSelectedCategories(categories.map(cat => cat.categorie));
        }
    };

    // Fonction de nettoyage radical pour Chart.js v4
    const destroyAllCharts = () => {
        try {
            // Méthode 1: Détruire par ID de 0 à 50 (Chart.js assigne des IDs numériques)
            for (let i = 0; i <= 50; i++) {
                const chart = Chart.getChart(i);
                if (chart) {
                    try {
                        chart.destroy();
                        console.log(`Graphique ID ${i} détruit`);
                    } catch (e) {
                        console.warn(`Erreur destruction graphique ${i}:`, e);
                    }
                }
            }

            // Méthode 2: Nettoyer tous les canvas dans le conteneur
            const container = document.querySelector('.advanced-expense-chart');
            if (container) {
                const canvases = container.querySelectorAll('canvas');
                canvases.forEach((canvas, index) => {
                    const chart = Chart.getChart(canvas);
                    if (chart) {
                        try {
                            chart.destroy();
                            console.log(`Canvas ${index} détruit`);
                        } catch (e) {
                            console.warn(`Erreur destruction canvas ${index}:`, e);
                        }
                    }
                    // Supprimer complètement le canvas du DOM
                    canvas.remove();
                });
            }

            // Méthode 3: Nettoyer le registre global
            if (Chart.instances) {
                Chart.instances = {};
            }

            // Méthode 4: Forcer le garbage collection si disponible
            if (window.gc) {
                window.gc();
            }

        } catch (e) {
            console.warn('Erreur générale lors du nettoyage:', e);
        }
    };

    // Fonction pour forcer la re-création du graphique avec délai (useCallback pour stabilité)
    const forceChartRefresh = React.useCallback(() => {
        console.log('Début du refresh du graphique...');
        destroyAllCharts();

        // Attendre un peu que le nettoyage soit effectif
        setTimeout(() => {
            setChartKey(prev => {
                const newKey = prev + 1;
                console.log('Nouveau chartKey:', newKey);
                return newKey;
            });
        }, 200); // Délai de 200ms pour s'assurer du nettoyage
    }, []); // Pas de dépendances car destroyAllCharts et setChartKey sont stables

    // Effets pour forcer le refresh quand les paramètres changent
    useEffect(() => {
        forceChartRefresh();
    }, [chartType, groupBy, forceChartRefresh]);

    useEffect(() => {
        // Petit délai pour les changements de catégories
        const timeout = setTimeout(() => {
            forceChartRefresh();
        }, 100);
        return () => clearTimeout(timeout);
    }, [selectedCategories.length, forceChartRefresh]);

    // Cleanup lors du démontage du composant
    useEffect(() => {
        return () => {
            destroyAllCharts();
        };
    }, []);

    // Gestion des erreurs de graphique
    const handleChartError = (error) => {
        console.error('Erreur SafeChart:', error);
        // Optionnellement, on pourrait déclencher un retry automatique
    };

    const renderChart = () => {
        // Validation des données avant le rendu
        if (!chartData || !chartData.labels || !chartData.datasets) {
            console.warn('Données de graphique invalides:', chartData);
            return (
                <div className="chart-error">
                    <div className="error-icon">📊</div>
                    <h3>Données invalides</h3>
                    <p>Les données du graphique ne sont pas correctement formatées.</p>
                </div>
            );
        }

        if (process.env.NODE_ENV === 'development') {
            console.log('Rendu du graphique - Type:', chartType);
            console.log('Données du graphique:', chartData);
        }

        // Essayer NativeChart en premier, avec SafeChart en fallback
        return (
            <>
                <NativeChart
                    type={chartType}
                    data={chartData}
                    options={chartOptions}
                    onError={handleChartError}
                    key={`native-${chartType}-${groupBy}-${chartKey}`}
                />
                {/* Affichage de debug */}
                <div style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    background: 'rgba(0,0,0,0.8)',
                    color: 'white',
                    padding: '5px',
                    fontSize: '10px',
                    zIndex: 1000,
                    pointerEvents: 'none'
                }}>
                    Type: {chartType} | Labels: {chartData?.labels?.length || 0} | Datasets: {chartData?.datasets?.length || 0}
                </div>
            </>
        );
    };

    // Affichage de debug en cas de problème
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
                    <p>Vous devez d'abord ajouter des dépenses pour voir les graphiques.</p>
                    <div style={{ marginTop: '1rem', fontSize: '0.8rem', opacity: 0.7 }}>
                        Debug: {depenses?.length || 0} dépenses, {categories?.length || 0} catégories
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="advanced-expense-chart">
            <div className="chart-header">
                <h2 className="chart-title">
                    <BarChart3 size={24} />
                    Analyse Graphique des Dépenses
                </h2>
                <div className="header-actions">
                    <button
                        className="btn btn-outline"
                        onClick={() => setShowFilters(!showFilters)}
                    >
                        {showFilters ? <EyeOff size={18} /> : <Eye size={18} />}
                        {showFilters ? 'Masquer' : 'Filtres'}
                    </button>
                    <button className="btn btn-outline" onClick={exportData}>
                        <Download size={18} />
                        Exporter
                    </button>
                </div>
            </div>

            {/* Filtres */}
            {showFilters && (
                <div className="filters-section">
                    <div className="filters-grid">
                        <div className="filter-group">
                            <label>Date de début</label>
                            <DatePicker
                                selected={startDate}
                                onChange={setStartDate}
                                dateFormat="dd/MM/yyyy"
                                className="date-input"
                            />
                        </div>

                        <div className="filter-group">
                            <label>Date de fin</label>
                            <DatePicker
                                selected={endDate}
                                onChange={setEndDate}
                                dateFormat="dd/MM/yyyy"
                                className="date-input"
                            />
                        </div>

                        <div className="filter-group">
                            <label>Type de graphique</label>
                            <select
                                value={chartType}
                                onChange={(e) => setChartType(e.target.value)}
                                className="select-input"
                            >
                                <option value="line">Courbe</option>
                                <option value="bar">Barres</option>
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
                                <option value="day">Jour</option>
                                <option value="week">Semaine</option>
                                <option value="month">Mois</option>
                                <option value="quarter">Trimestre</option>
                                <option value="year">Année</option>
                                <option value="category">Catégorie</option>
                            </select>
                        </div>

                        <div className="filter-group">
                            <label>Montant min (€)</label>
                            <input
                                type="number"
                                value={minAmount}
                                onChange={(e) => setMinAmount(e.target.value)}
                                placeholder="0"
                                className="number-input"
                            />
                        </div>

                        <div className="filter-group">
                            <label>Montant max (€)</label>
                            <input
                                type="number"
                                value={maxAmount}
                                onChange={(e) => setMaxAmount(e.target.value)}
                                placeholder="∞"
                                className="number-input"
                            />
                        </div>
                    </div>

                    <div className="filter-group full-width">
                        <div className="categories-header">
                            <label>Catégories</label>
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
                                    <span style={{ color: cat.color }}>
                                        {cat.iconName && <i className={cat.iconName}></i>}
                                        {cat.categorie}
                                    </span>
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="filter-actions">
                        <button className="btn btn-outline" onClick={resetFilters}>
                            <RefreshCw size={18} />
                            Réinitialiser
                        </button>
                    </div>
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
                    <div className="stat-icon">📅</div>
                    <div className="stat-content">
                        <h3>Périodes</h3>
                        <p className="stat-value">{statistics.periods}</p>
                    </div>
                </div>
            </div>

            {/* Graphique */}
            <div className="chart-container" key={`container-${chartKey}`}>
                <ChartErrorBoundary onRetry={forceChartRefresh} key={`boundary-${chartKey}`}>
                    <div
                        key={`wrapper-${chartType}-${groupBy}-${chartKey}-${selectedCategories.join('-')}`}
                        className="chart-wrapper"
                        data-chart-key={chartKey}
                    >
                        {Object.keys(filteredData).length > 0 ? (
                            <div key={`inner-${chartKey}`} className="chart-inner">
                                {renderChart()}
                            </div>
                        ) : (
                            <div className="no-data">
                                <div className="no-data-icon">📊</div>
                                <h3>Aucune donnée trouvée</h3>
                                <p>Ajustez vos filtres pour voir les résultats</p>
                            </div>
                        )}
                    </div>
                </ChartErrorBoundary>
            </div>

            {/* Tableau de détail */}
            {Object.keys(filteredData).length > 0 && (
                <div className="details-table">
                    <h3>Détail par période</h3>
                    <div className="table-container">
                        <table>
                            <thead>
                                <tr>
                                    <th>Période</th>
                                    <th>Montant Total</th>
                                    <th>Nombre</th>
                                    <th>Moyenne</th>
                                </tr>
                            </thead>
                            <tbody>
                                {Object.entries(filteredData)
                                    .sort(([a], [b]) => a.localeCompare(b))
                                    .map(([period, data]) => (
                                    <tr key={period}>
                                        <td>{period}</td>
                                        <td className="amount">{formatCurrency(data.total)}</td>
                                        <td>{data.count}</td>
                                        <td className="amount">{formatCurrency(data.total / data.count)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdvancedExpenseChart;