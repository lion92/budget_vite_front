import React, { useMemo } from 'react';
import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { TrendingUp, BarChart3, Percent } from 'lucide-react';

const YearlyComparisonChart = ({ depenses, revenus }) => {

    const yearlyData = useMemo(() => {
        if (!depenses || !revenus) return [];

        // Obtenir les 3 dernières années avec des données
        const currentYear = new Date().getFullYear();
        const years = [currentYear - 2, currentYear - 1, currentYear];

        const monthNames = [
            'Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun',
            'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'
        ];

        const result = [];

        for (let month = 0; month < 12; month++) {
            const monthData = {
                month: monthNames[month],
                monthNum: month
            };

            years.forEach(year => {
                // Dépenses pour ce mois et cette année
                const monthExpenses = depenses.filter(d => {
                    const date = new Date(d.dateTransaction);
                    return date.getFullYear() === year && date.getMonth() === month;
                }).reduce((acc, d) => acc + parseFloat(d.montant || 0), 0);

                // Revenus pour ce mois et cette année
                const monthRevenues = revenus.filter(r => {
                    const date = new Date(r.date);
                    return date.getFullYear() === year && date.getMonth() === month;
                }).reduce((acc, r) => acc + parseFloat(r.amount || 0), 0);

                monthData[`depenses_${year}`] = monthExpenses;
                monthData[`revenus_${year}`] = monthRevenues;
                monthData[`solde_${year}`] = monthRevenues - monthExpenses;
            });

            result.push(monthData);
        }

        return result;
    }, [depenses, revenus]);

    const yearlyStats = useMemo(() => {
        if (!yearlyData.length) return {};

        const currentYear = new Date().getFullYear();
        const years = [currentYear - 2, currentYear - 1, currentYear];

        return years.reduce((acc, year) => {
            const totalExpenses = yearlyData.reduce((sum, month) => sum + (month[`depenses_${year}`] || 0), 0);
            const totalRevenues = yearlyData.reduce((sum, month) => sum + (month[`revenus_${year}`] || 0), 0);
            const avgMonthlyExpenses = totalExpenses / 12;
            const avgMonthlySavings = (totalRevenues - totalExpenses) / 12;

            acc[year] = {
                totalExpenses,
                totalRevenues,
                totalSavings: totalRevenues - totalExpenses,
                avgMonthlyExpenses,
                avgMonthlySavings,
                savingsRate: totalRevenues > 0 ? ((totalRevenues - totalExpenses) / totalRevenues) * 100 : 0
            };

            return acc;
        }, {});
    }, [yearlyData]);

    const growthRates = useMemo(() => {
        const currentYear = new Date().getFullYear();
        const lastYear = currentYear - 1;
        const twoYearsAgo = currentYear - 2;

        if (!yearlyStats[lastYear] || !yearlyStats[twoYearsAgo] || !yearlyStats[currentYear]) {
            return {};
        }

        const expenseGrowthLastYear = yearlyStats[lastYear].totalExpenses > 0
            ? ((yearlyStats[currentYear].totalExpenses - yearlyStats[lastYear].totalExpenses) / yearlyStats[lastYear].totalExpenses) * 100
            : 0;

        const revenueGrowthLastYear = yearlyStats[lastYear].totalRevenues > 0
            ? ((yearlyStats[currentYear].totalRevenues - yearlyStats[lastYear].totalRevenues) / yearlyStats[lastYear].totalRevenues) * 100
            : 0;

        return {
            expenseGrowth: expenseGrowthLastYear,
            revenueGrowth: revenueGrowthLastYear
        };
    }, [yearlyStats]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;

        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">{label}</p>
                {payload.map((entry, index) => {
                    const [type, year] = entry.dataKey.split('_');
                    const typeLabel = {
                        'depenses': 'Dépenses',
                        'revenus': 'Revenus',
                        'solde': 'Solde'
                    }[type] || type;

                    return (
                        <p key={index} style={{ color: entry.color }}>
                            {typeLabel} {year}: {entry.value.toFixed(2)} €
                        </p>
                    );
                })}
            </div>
        );
    };

    const currentYear = new Date().getFullYear();
    const colors = {
        [`depenses_${currentYear - 2}`]: '#dc2626',
        [`depenses_${currentYear - 1}`]: '#ea580c',
        [`depenses_${currentYear}`]: '#f59e0b',
        [`revenus_${currentYear - 2}`]: '#059669',
        [`revenus_${currentYear - 1}`]: '#16a34a',
        [`revenus_${currentYear}`]: '#22c55e',
        [`solde_${currentYear - 2}`]: '#0284c7',
        [`solde_${currentYear - 1}`]: '#0ea5e9',
        [`solde_${currentYear}`]: '#38bdf8'
    };

    return (
        <div className="chart-card large">
            <div className="chart-header">
                <h3>
                    <BarChart3 size={20} />
                    Comparaison sur 3 ans ({currentYear - 2} - {currentYear})
                </h3>
                <div className="chart-controls">
                    <div className="growth-indicators">
                        {growthRates.expenseGrowth !== undefined && (
                            <div className={`growth-badge ${growthRates.expenseGrowth > 0 ? 'negative' : 'positive'}`}>
                                <TrendingUp size={14} />
                                Dépenses: {growthRates.expenseGrowth > 0 ? '+' : ''}{growthRates.expenseGrowth.toFixed(1)}%
                            </div>
                        )}
                        {growthRates.revenueGrowth !== undefined && (
                            <div className={`growth-badge ${growthRates.revenueGrowth > 0 ? 'positive' : 'negative'}`}>
                                <TrendingUp size={14} />
                                Revenus: {growthRates.revenueGrowth > 0 ? '+' : ''}{growthRates.revenueGrowth.toFixed(1)}%
                            </div>
                        )}
                    </div>
                </div>
            </div>

            <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={yearlyData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />
                    <Legend />

                    {/* Barres pour les dépenses */}
                    <Bar
                        dataKey={`depenses_${currentYear - 2}`}
                        fill={colors[`depenses_${currentYear - 2}`]}
                        name={`Dépenses ${currentYear - 2}`}
                        opacity={0.8}
                    />
                    <Bar
                        dataKey={`depenses_${currentYear - 1}`}
                        fill={colors[`depenses_${currentYear - 1}`]}
                        name={`Dépenses ${currentYear - 1}`}
                        opacity={0.8}
                    />
                    <Bar
                        dataKey={`depenses_${currentYear}`}
                        fill={colors[`depenses_${currentYear}`]}
                        name={`Dépenses ${currentYear}`}
                        opacity={0.8}
                    />

                    {/* Lignes pour les soldes */}
                    <Line
                        type="monotone"
                        dataKey={`solde_${currentYear - 2}`}
                        stroke={colors[`solde_${currentYear - 2}`]}
                        strokeWidth={2}
                        name={`Solde ${currentYear - 2}`}
                        dot={{ r: 3 }}
                    />
                    <Line
                        type="monotone"
                        dataKey={`solde_${currentYear - 1}`}
                        stroke={colors[`solde_${currentYear - 1}`]}
                        strokeWidth={2}
                        name={`Solde ${currentYear - 1}`}
                        dot={{ r: 3 }}
                    />
                    <Line
                        type="monotone"
                        dataKey={`solde_${currentYear}`}
                        stroke={colors[`solde_${currentYear}`]}
                        strokeWidth={3}
                        name={`Solde ${currentYear}`}
                        dot={{ r: 4 }}
                    />
                </ComposedChart>
            </ResponsiveContainer>

            {/* Statistiques annuelles */}
            <div className="yearly-stats">
                <h4>Résumé annuel</h4>
                <div className="stats-grid">
                    {Object.entries(yearlyStats).map(([year, stats]) => (
                        <div key={year} className="year-stats-card">
                            <h5>{year}</h5>
                            <div className="stats-list">
                                <div className="stat-item">
                                    <span className="stat-label">Total dépenses:</span>
                                    <span className="stat-value">{stats.totalExpenses.toFixed(0)} €</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Total revenus:</span>
                                    <span className="stat-value">{stats.totalRevenues.toFixed(0)} €</span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Épargne totale:</span>
                                    <span className={`stat-value ${stats.totalSavings >= 0 ? 'positive' : 'negative'}`}>
                                        {stats.totalSavings.toFixed(0)} €
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">Taux d'épargne:</span>
                                    <span className={`stat-value ${stats.savingsRate >= 0 ? 'positive' : 'negative'}`}>
                                        <Percent size={14} />
                                        {stats.savingsRate.toFixed(1)}%
                                    </span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default YearlyComparisonChart;