import React, { useState, useEffect, useMemo } from 'react';
import { Line, Bar, Doughnut } from 'react-chartjs-2';
import Chart from 'chart.js/auto';
import useBudgetStore from '../../useBudgetStore';
import StaticChart from './StaticChart';
import {
    TrendingUp,
    Calendar,
    Target,
    AlertTriangle,
    DollarSign,
    BarChart3,
    PieChart,
    Download,
    Settings,
    Eye,
    EyeOff
} from 'lucide-react';
import DatePicker from 'react-datepicker';
import './css/advanced-prediction.css';

const AdvancedPrediction = () => {
    const { depenses, revenus, categories } = useBudgetStore();

    // États des paramètres
    const [predictionMonths, setPredictionMonths] = useState(3);
    const [algorithmType, setAlgorithmType] = useState('average'); // average, trend, seasonal
    const [budgetLimit, setBudgetLimit] = useState(2000);
    const [showSettings, setShowSettings] = useState(false);
    const [selectedCategories, setSelectedCategories] = useState([]);
    const [chartType, setChartType] = useState('line');

    // Données calculées
    const monthlyData = useMemo(() => {
        const data = {};

        // Traiter les dépenses
        depenses.forEach(depense => {
            const date = new Date(depense.dateTransaction);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!data[monthKey]) {
                data[monthKey] = {
                    expenses: 0,
                    revenues: 0,
                    categories: {},
                    count: 0
                };
            }

            data[monthKey].expenses += parseFloat(depense.montant || 0);
            data[monthKey].count += 1;

            const category = depense.categorie || 'Non catégorisé';
            data[monthKey].categories[category] = (data[monthKey].categories[category] || 0) + parseFloat(depense.montant || 0);
        });

        // Traiter les revenus
        revenus.forEach(revenu => {
            const date = new Date(revenu.date);
            const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

            if (!data[monthKey]) {
                data[monthKey] = {
                    expenses: 0,
                    revenues: 0,
                    categories: {},
                    count: 0
                };
            }

            data[monthKey].revenues += parseFloat(revenu.amount || 0);
        });

        return data;
    }, [depenses, revenus]);

    // Calcul des prédictions
    const predictions = useMemo(() => {
        const sortedMonths = Object.keys(monthlyData).sort();
        if (sortedMonths.length < 2) return [];

        const results = [];
        const lastMonthKey = sortedMonths[sortedMonths.length - 1];
        const lastMonth = new Date(lastMonthKey + '-01');

        for (let i = 1; i <= predictionMonths; i++) {
            const futureMonth = new Date(lastMonth);
            futureMonth.setMonth(futureMonth.getMonth() + i);
            const monthKey = `${futureMonth.getFullYear()}-${String(futureMonth.getMonth() + 1).padStart(2, '0')}`;

            let predictedExpense = 0;
            let predictedRevenue = 0;

            switch (algorithmType) {
                case 'average': {
                    const avgExpense = sortedMonths.reduce((sum, month) => sum + monthlyData[month].expenses, 0) / sortedMonths.length;
                    const avgRevenue = sortedMonths.reduce((sum, month) => sum + monthlyData[month].revenues, 0) / sortedMonths.length;
                    predictedExpense = avgExpense;
                    predictedRevenue = avgRevenue;
                    break;
                }

                case 'trend': {
                    // Régression linéaire simple
                    const expenseValues = sortedMonths.map(month => monthlyData[month].expenses);
                    const revenueValues = sortedMonths.map(month => monthlyData[month].revenues);
                    const n = expenseValues.length;

                    const xSum = n * (n - 1) / 2;
                    const yExpenseSum = expenseValues.reduce((a, b) => a + b, 0);
                    const yRevenueSum = revenueValues.reduce((a, b) => a + b, 0);

                    const xyExpenseSum = expenseValues.reduce((sum, y, x) => sum + x * y, 0);
                    const xyRevenueSum = revenueValues.reduce((sum, y, x) => sum + x * y, 0);

                    const x2Sum = n * (n - 1) * (2 * n - 1) / 6;

                    const expenseSlope = (n * xyExpenseSum - xSum * yExpenseSum) / (n * x2Sum - xSum * xSum);
                    const revenueSlope = (n * xyRevenueSum - xSum * yRevenueSum) / (n * x2Sum - xSum * xSum);

                    const expenseIntercept = (yExpenseSum - expenseSlope * xSum) / n;
                    const revenueIntercept = (yRevenueSum - revenueSlope * xSum) / n;

                    predictedExpense = expenseSlope * (n + i - 1) + expenseIntercept;
                    predictedRevenue = revenueSlope * (n + i - 1) + revenueIntercept;
                    break;
                }

                case 'seasonal': {
                    // Moyenne des mêmes mois des années précédentes
                    const monthIndex = futureMonth.getMonth();
                    const sameMonths = sortedMonths.filter(month => {
                        const date = new Date(month + '-01');
                        return date.getMonth() === monthIndex;
                    });

                    if (sameMonths.length > 0) {
                        predictedExpense = sameMonths.reduce((sum, month) => sum + monthlyData[month].expenses, 0) / sameMonths.length;
                        predictedRevenue = sameMonths.reduce((sum, month) => sum + monthlyData[month].revenues, 0) / sameMonths.length;
                    } else {
                        predictedExpense = sortedMonths.reduce((sum, month) => sum + monthlyData[month].expenses, 0) / sortedMonths.length;
                        predictedRevenue = sortedMonths.reduce((sum, month) => sum + monthlyData[month].revenues, 0) / sortedMonths.length;
                    }
                    break;
                }
            }

            results.push({
                month: monthKey,
                monthLabel: futureMonth.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }),
                predictedExpense: Math.max(0, predictedExpense),
                predictedRevenue: Math.max(0, predictedRevenue),
                predictedBalance: predictedRevenue - predictedExpense
            });
        }

        return results;
    }, [monthlyData, predictionMonths, algorithmType]);

    // Données pour les graphiques
    const chartData = useMemo(() => {
        const sortedMonths = Object.keys(monthlyData).sort();
        const historicalLabels = sortedMonths.map(month => {
            const date = new Date(month + '-01');
            return date.toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' });
        });
        const predictionLabels = predictions.map(p => p.monthLabel.split(' ').map(w => w.substring(0, 3)).join(' '));

        const historicalExpenses = sortedMonths.map(month => monthlyData[month].expenses);
        const historicalRevenues = sortedMonths.map(month => monthlyData[month].revenues);
        const predictedExpenses = predictions.map(p => p.predictedExpense);
        const predictedRevenues = predictions.map(p => p.predictedRevenue);

        return {
            labels: [...historicalLabels, ...predictionLabels],
            datasets: [
                {
                    label: 'Dépenses historiques',
                    data: [...historicalExpenses, ...Array(predictionLabels.length).fill(null)],
                    borderColor: '#dc2626',
                    backgroundColor: 'rgba(220, 38, 38, 0.1)',
                    borderWidth: 2,
                    fill: chartType === 'area'
                },
                {
                    label: 'Revenus historiques',
                    data: [...historicalRevenues, ...Array(predictionLabels.length).fill(null)],
                    borderColor: '#16a34a',
                    backgroundColor: 'rgba(22, 163, 74, 0.1)',
                    borderWidth: 2,
                    fill: chartType === 'area'
                },
                {
                    label: 'Prévision dépenses',
                    data: [...Array(historicalLabels.length).fill(null), ...predictedExpenses],
                    borderColor: '#f97316',
                    backgroundColor: 'rgba(249, 115, 22, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false
                },
                {
                    label: 'Prévision revenus',
                    data: [...Array(historicalLabels.length).fill(null), ...predictedRevenues],
                    borderColor: '#059669',
                    backgroundColor: 'rgba(5, 150, 105, 0.1)',
                    borderWidth: 2,
                    borderDash: [5, 5],
                    fill: false
                }
            ]
        };
    }, [monthlyData, predictions, chartType]);

    // Options des graphiques (Chart.js v4) - Stable positioning
    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        animation: {
            duration: 0
        },
        layout: {
            padding: 10
        },
        plugins: {
            legend: {
                position: 'top',
                labels: {
                    usePointStyle: true,
                    pointStyle: 'line'
                }
            },
            title: {
                display: true,
                text: 'Analyse et Prévisions Budgétaires'
            },
            tooltip: {
                mode: 'index',
                intersect: false,
                callbacks: {
                    label: function(context) {
                        const value = context.parsed.y;
                        if (value === null) return '';
                        return `${context.dataset.label}: ${value.toLocaleString('fr-FR', { style: 'currency', currency: 'EUR' })}`;
                    }
                }
            }
        },
        scales: {
            x: {
                display: true,
                title: {
                    display: true,
                    text: 'Période'
                }
            },
            y: {
                display: true,
                title: {
                    display: true,
                    text: 'Montant (€)'
                },
                beginAtZero: true
            }
        },
        interaction: {
            mode: 'nearest',
            axis: 'x',
            intersect: false
        }
    };

    // Statistiques calculées
    const statistics = useMemo(() => {
        const currentMonth = Object.keys(monthlyData).sort().pop();
        const currentData = currentMonth ? monthlyData[currentMonth] : { expenses: 0, revenues: 0 };

        const totalPredictedExpenses = predictions.reduce((sum, p) => sum + p.predictedExpense, 0);
        const totalPredictedRevenues = predictions.reduce((sum, p) => sum + p.predictedRevenue, 0);

        return {
            currentBalance: currentData.revenues - currentData.expenses,
            predictedBalance: totalPredictedRevenues - totalPredictedExpenses,
            budgetStatus: currentData.expenses / budgetLimit,
            avgMonthlyExpense: predictions.reduce((sum, p) => sum + p.predictedExpense, 0) / predictionMonths
        };
    }, [monthlyData, predictions, budgetLimit, predictionMonths]);

    const formatCurrency = (amount) => {
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const exportPredictions = () => {
        const data = predictions.map(pred => ({
            'Mois': pred.monthLabel,
            'Prévision Dépenses': pred.predictedExpense.toFixed(2),
            'Prévision Revenus': pred.predictedRevenue.toFixed(2),
            'Balance Prévue': pred.predictedBalance.toFixed(2)
        }));

        const csv = [
            Object.keys(data[0]).join(','),
            ...data.map(row => Object.values(row).join(','))
        ].join('\n');

        const blob = new Blob([csv], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `predictions_budgetaires_${new Date().toISOString().split('T')[0]}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    };

    const renderChart = () => {
        const commonProps = { data: chartData, options: chartOptions };

        switch (chartType) {
            case 'line':
            case 'area':
                return <Line {...commonProps} />;
            case 'bar':
                return <Bar {...commonProps} />;
            default:
                return <Line {...commonProps} />;
        }
    };

    return (
        <div className="advanced-prediction">
            <div className="prediction-header">
                <h2 className="prediction-title">
                    <TrendingUp size={24} />
                    Prévisions Budgétaires Avancées
                </h2>
                <div className="header-actions">
                    <button
                        className="btn btn-outline"
                        onClick={() => setShowSettings(!showSettings)}
                    >
                        {showSettings ? <EyeOff size={18} /> : <Settings size={18} />}
                        {showSettings ? 'Masquer' : 'Paramètres'}
                    </button>
                    <button className="btn btn-outline" onClick={exportPredictions}>
                        <Download size={18} />
                        Exporter
                    </button>
                </div>
            </div>

            {/* Paramètres */}
            {showSettings && (
                <div className="settings-section">
                    <div className="settings-grid">
                        <div className="setting-group">
                            <label>Nombre de mois à prédire</label>
                            <select
                                value={predictionMonths}
                                onChange={(e) => setPredictionMonths(parseInt(e.target.value))}
                                className="select-input"
                            >
                                <option value={1}>1 mois</option>
                                <option value={3}>3 mois</option>
                                <option value={6}>6 mois</option>
                                <option value={12}>12 mois</option>
                            </select>
                        </div>

                        <div className="setting-group">
                            <label>Algorithme de prédiction</label>
                            <select
                                value={algorithmType}
                                onChange={(e) => setAlgorithmType(e.target.value)}
                                className="select-input"
                            >
                                <option value="average">Moyenne simple</option>
                                <option value="trend">Tendance linéaire</option>
                                <option value="seasonal">Saisonnalité</option>
                            </select>
                        </div>

                        <div className="setting-group">
                            <label>Type de graphique</label>
                            <select
                                value={chartType}
                                onChange={(e) => setChartType(e.target.value)}
                                className="select-input"
                            >
                                <option value="line">Ligne</option>
                                <option value="area">Aire</option>
                                <option value="bar">Barres</option>
                            </select>
                        </div>

                        <div className="setting-group">
                            <label>Budget limite mensuel (€)</label>
                            <input
                                type="number"
                                value={budgetLimit}
                                onChange={(e) => setBudgetLimit(parseFloat(e.target.value) || 0)}
                                className="number-input"
                                min="0"
                                step="100"
                            />
                        </div>
                    </div>
                </div>
            )}

            {/* Indicateurs clés */}
            <div className="kpi-grid">
                <div className="kpi-card">
                    <div className="kpi-icon balance">
                        <DollarSign size={24} />
                    </div>
                    <div className="kpi-content">
                        <h3>Balance Actuelle</h3>
                        <p className={`kpi-value ${statistics.currentBalance >= 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(statistics.currentBalance)}
                        </p>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon prediction">
                        <TrendingUp size={24} />
                    </div>
                    <div className="kpi-content">
                        <h3>Balance Prévue</h3>
                        <p className={`kpi-value ${statistics.predictedBalance >= 0 ? 'positive' : 'negative'}`}>
                            {formatCurrency(statistics.predictedBalance)}
                        </p>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon budget">
                        <Target size={24} />
                    </div>
                    <div className="kpi-content">
                        <h3>Utilisation Budget</h3>
                        <p className="kpi-value">{(statistics.budgetStatus * 100).toFixed(1)}%</p>
                        <div className={`budget-bar ${statistics.budgetStatus > 1 ? 'over-budget' : statistics.budgetStatus > 0.8 ? 'warning' : 'safe'}`}>
                            <div
                                className="budget-fill"
                                style={{ width: `${Math.min(statistics.budgetStatus * 100, 100)}%` }}
                            />
                        </div>
                    </div>
                </div>

                <div className="kpi-card">
                    <div className="kpi-icon average">
                        <BarChart3 size={24} />
                    </div>
                    <div className="kpi-content">
                        <h3>Dépense Moyenne Prévue</h3>
                        <p className="kpi-value">{formatCurrency(statistics.avgMonthlyExpense)}</p>
                    </div>
                </div>
            </div>

            {/* Alertes */}
            {(statistics.budgetStatus > 1 || statistics.predictedBalance < 0) && (
                <div className="alerts-section">
                    {statistics.budgetStatus > 1 && (
                        <div className="alert alert-danger">
                            <AlertTriangle size={20} />
                            <div>
                                <strong>Budget dépassé!</strong>
                                <p>Vous avez dépassé votre budget mensuel de {formatCurrency((statistics.budgetStatus - 1) * budgetLimit)}</p>
                            </div>
                        </div>
                    )}
                    {statistics.predictedBalance < 0 && (
                        <div className="alert alert-warning">
                            <AlertTriangle size={20} />
                            <div>
                                <strong>Balance négative prévue</strong>
                                <p>Selon les prévisions, vous pourriez avoir un déficit de {formatCurrency(Math.abs(statistics.predictedBalance))}</p>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Graphique principal */}
            <div className="chart-container">
                <StaticChart width={800} height={400}>
                    {renderChart()}
                </StaticChart>
            </div>

            {/* Tableau des prévisions */}
            <div className="predictions-table">
                <h3>Détail des Prévisions</h3>
                <div className="table-container">
                    <table>
                        <thead>
                            <tr>
                                <th>Mois</th>
                                <th>Dépenses Prévues</th>
                                <th>Revenus Prévus</th>
                                <th>Balance</th>
                                <th>État Budget</th>
                            </tr>
                        </thead>
                        <tbody>
                            {predictions.map(prediction => (
                                <tr key={prediction.month}>
                                    <td>{prediction.monthLabel}</td>
                                    <td className="amount negative">{formatCurrency(prediction.predictedExpense)}</td>
                                    <td className="amount positive">{formatCurrency(prediction.predictedRevenue)}</td>
                                    <td className={`amount ${prediction.predictedBalance >= 0 ? 'positive' : 'negative'}`}>
                                        {formatCurrency(prediction.predictedBalance)}
                                    </td>
                                    <td>
                                        <span className={`budget-status ${prediction.predictedExpense > budgetLimit ? 'over' : prediction.predictedExpense > budgetLimit * 0.8 ? 'warning' : 'safe'}`}>
                                            {prediction.predictedExpense > budgetLimit ? 'Dépassé' :
                                             prediction.predictedExpense > budgetLimit * 0.8 ? 'Attention' : 'OK'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default AdvancedPrediction;