import React, { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { TrendingUp, AlertTriangle } from 'lucide-react';

const ExpensePredictionChart = ({ depenses, selectedYear, selectedMonth, selectedPeriod }) => {

    const predictionData = useMemo(() => {
        if (!depenses || depenses.length === 0) return [];

        // Calculer la tendance des 6 derniers mois
        const last6Months = [];
        const today = new Date();

        for (let i = 5; i >= 0; i--) {
            const date = new Date(today.getFullYear(), today.getMonth() - i, 1);
            const monthExpenses = depenses.filter(d => {
                const expenseDate = new Date(d.dateTransaction);
                return expenseDate.getFullYear() === date.getFullYear() &&
                       expenseDate.getMonth() === date.getMonth();
            }).reduce((acc, d) => acc + parseFloat(d.montant || 0), 0);

            last6Months.push({
                month: date.toLocaleString('fr-FR', { month: 'short', year: '2-digit' }),
                monthNum: date.getMonth(),
                year: date.getFullYear(),
                actual: monthExpenses,
                type: 'historical'
            });
        }

        // Calculer la tendance linéaire
        const n = last6Months.length;
        const sumX = last6Months.reduce((acc, _, i) => acc + i, 0);
        const sumY = last6Months.reduce((acc, d) => acc + d.actual, 0);
        const sumXY = last6Months.reduce((acc, d, i) => acc + i * d.actual, 0);
        const sumX2 = last6Months.reduce((acc, _, i) => acc + i * i, 0);

        const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
        const intercept = (sumY - slope * sumX) / n;

        // Prédire les 3 prochains mois
        const predictions = [];
        for (let i = 0; i < 3; i++) {
            const futureDate = new Date(today.getFullYear(), today.getMonth() + i + 1, 1);
            const predictedValue = Math.max(0, slope * (n + i) + intercept);

            predictions.push({
                month: futureDate.toLocaleString('fr-FR', { month: 'short', year: '2-digit' }),
                monthNum: futureDate.getMonth(),
                year: futureDate.getFullYear(),
                predicted: predictedValue,
                type: 'prediction'
            });
        }

        return [...last6Months, ...predictions];
    }, [depenses]);

    const currentMonthAverage = useMemo(() => {
        if (!predictionData.length) return 0;
        const historicalData = predictionData.filter(d => d.type === 'historical' && d.actual > 0);
        return historicalData.reduce((acc, d) => acc + d.actual, 0) / historicalData.length;
    }, [predictionData]);

    const trend = useMemo(() => {
        const historicalData = predictionData.filter(d => d.type === 'historical');
        if (historicalData.length < 2) return 0;

        const firstThree = historicalData.slice(0, 3).reduce((acc, d) => acc + d.actual, 0) / 3;
        const lastThree = historicalData.slice(-3).reduce((acc, d) => acc + d.actual, 0) / 3;

        return ((lastThree - firstThree) / firstThree) * 100;
    }, [predictionData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0].payload;
        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">{label}</p>
                {data.actual !== undefined && (
                    <p style={{ color: '#667eea' }}>
                        Réel: {data.actual.toFixed(2)} €
                    </p>
                )}
                {data.predicted !== undefined && (
                    <p style={{ color: '#f59e0b' }}>
                        Prédiction: {data.predicted.toFixed(2)} €
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="chart-card large">
            <div className="chart-header">
                <h3>
                    <TrendingUp size={20} />
                    Prédiction des dépenses
                </h3>
                <div className="trend-indicator">
                    {Math.abs(trend) > 10 && (
                        <div className={`trend-badge ${trend > 0 ? 'increasing' : 'decreasing'}`}>
                            <AlertTriangle size={16} />
                            Tendance {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                        </div>
                    )}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
                <LineChart data={predictionData}>
                    <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                    <XAxis dataKey="month" tick={{ fontSize: 12 }} />
                    <YAxis tick={{ fontSize: 12 }} />
                    <Tooltip content={<CustomTooltip />} />

                    {/* Ligne de référence pour la moyenne */}
                    <ReferenceLine
                        y={currentMonthAverage}
                        stroke="#94a3b8"
                        strokeDasharray="2 4"
                        label={{ value: "Moyenne", position: "topRight" }}
                    />

                    {/* Dépenses réelles */}
                    <Line
                        type="monotone"
                        dataKey="actual"
                        stroke="#667eea"
                        strokeWidth={3}
                        dot={{ r: 5, fill: '#667eea' }}
                        connectNulls={false}
                        name="Dépenses réelles"
                    />

                    {/* Prédictions */}
                    <Line
                        type="monotone"
                        dataKey="predicted"
                        stroke="#f59e0b"
                        strokeWidth={2}
                        strokeDasharray="5 5"
                        dot={{ r: 4, fill: '#f59e0b' }}
                        connectNulls={false}
                        name="Prédictions"
                    />
                </LineChart>
            </ResponsiveContainer>

            <div className="prediction-insights">
                <div className="insight-item">
                    <span className="insight-label">Tendance sur 6 mois:</span>
                    <span className={`insight-value ${trend > 0 ? 'negative' : 'positive'}`}>
                        {trend > 0 ? '+' : ''}{trend.toFixed(1)}%
                    </span>
                </div>
                <div className="insight-item">
                    <span className="insight-label">Moyenne mensuelle:</span>
                    <span className="insight-value">{currentMonthAverage.toFixed(2)} €</span>
                </div>
            </div>
        </div>
    );
};

export default ExpensePredictionChart;