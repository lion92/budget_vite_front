import React, { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Calendar, Activity, DollarSign } from 'lucide-react';

const DailySpendingChart = ({ depenses, selectedYear, selectedMonth, selectedPeriod }) => {

    const dailyData = useMemo(() => {
        if (!depenses || depenses.length === 0) return [];

        if (selectedPeriod === 'monthly') {
            // Analyse journalière pour le mois sélectionné
            const daysInMonth = new Date(selectedYear, selectedMonth + 1, 0).getDate();
            const dailySpending = {};

            // Initialiser tous les jours du mois
            for (let day = 1; day <= daysInMonth; day++) {
                const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
                dailySpending[dateStr] = {
                    day: day,
                    date: dateStr,
                    amount: 0,
                    count: 0,
                    dayName: new Date(selectedYear, selectedMonth, day).toLocaleDateString('fr-FR', { weekday: 'short' })
                };
            }

            // Ajouter les dépenses réelles
            depenses.forEach(depense => {
                const date = new Date(depense.dateTransaction);
                if (date.getFullYear() === selectedYear && date.getMonth() === selectedMonth) {
                    const dateStr = date.toISOString().split('T')[0];
                    if (dailySpending[dateStr]) {
                        dailySpending[dateStr].amount += parseFloat(depense.montant || 0);
                        dailySpending[dateStr].count += 1;
                    }
                }
            });

            return Object.values(dailySpending).sort((a, b) => a.day - b.day);
        } else {
            // Analyse journalière moyenne par jour de la semaine pour l'année
            const weeklyData = {
                'Lun': { dayNum: 1, amount: 0, count: 0, dayName: 'Lundi' },
                'Mar': { dayNum: 2, amount: 0, count: 0, dayName: 'Mardi' },
                'Mer': { dayNum: 3, amount: 0, count: 0, dayName: 'Mercredi' },
                'Jeu': { dayNum: 4, amount: 0, count: 0, dayName: 'Jeudi' },
                'Ven': { dayNum: 5, amount: 0, count: 0, dayName: 'Vendredi' },
                'Sam': { dayNum: 6, amount: 0, count: 0, dayName: 'Samedi' },
                'Dim': { dayNum: 0, amount: 0, count: 0, dayName: 'Dimanche' }
            };

            depenses.forEach(depense => {
                const date = new Date(depense.dateTransaction);
                if (date.getFullYear() === selectedYear) {
                    const dayName = date.toLocaleDateString('fr-FR', { weekday: 'short' });
                    if (weeklyData[dayName]) {
                        weeklyData[dayName].amount += parseFloat(depense.montant || 0);
                        weeklyData[dayName].count += 1;
                    }
                }
            });

            // Calculer les moyennes
            Object.keys(weeklyData).forEach(day => {
                if (weeklyData[day].count > 0) {
                    weeklyData[day].average = weeklyData[day].amount / weeklyData[day].count;
                } else {
                    weeklyData[day].average = 0;
                }
            });

            return Object.entries(weeklyData).map(([key, data]) => ({
                day: key,
                amount: data.average,
                total: data.amount,
                count: data.count,
                dayName: data.dayName
            })).sort((a, b) => {
                const order = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim'];
                return order.indexOf(a.day) - order.indexOf(b.day);
            });
        }
    }, [depenses, selectedYear, selectedMonth, selectedPeriod]);

    const statistics = useMemo(() => {
        if (!dailyData.length) return { max: 0, min: 0, average: 0, totalDays: 0 };

        const amounts = dailyData.map(d => d.amount).filter(a => a > 0);
        if (!amounts.length) return { max: 0, min: 0, average: 0, totalDays: 0 };

        return {
            max: Math.max(...amounts),
            min: Math.min(...amounts),
            average: amounts.reduce((a, b) => a + b, 0) / amounts.length,
            totalDays: amounts.length
        };
    }, [dailyData]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0].payload;
        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">
                    {selectedPeriod === 'monthly'
                        ? `${data.dayName} ${label}/${selectedMonth + 1}`
                        : data.dayName}
                </p>
                <p style={{ color: payload[0].color }}>
                    {selectedPeriod === 'monthly'
                        ? `Dépenses: ${data.amount.toFixed(2)} €`
                        : `Moyenne: ${data.amount.toFixed(2)} €`}
                </p>
                {data.count > 0 && (
                    <p style={{ color: '#6b7280' }}>
                        {data.count} transaction{data.count > 1 ? 's' : ''}
                    </p>
                )}
                {selectedPeriod === 'yearly' && data.total > 0 && (
                    <p style={{ color: '#6b7280' }}>
                        Total: {data.total.toFixed(2)} €
                    </p>
                )}
            </div>
        );
    };

    return (
        <div className="chart-card large">
            <div className="chart-header">
                <h3>
                    <Calendar size={20} />
                    {selectedPeriod === 'monthly'
                        ? `Dépenses quotidiennes - ${new Date(selectedYear, selectedMonth).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}`
                        : `Dépenses moyennes par jour de la semaine - ${selectedYear}`}
                </h3>
                <div className="chart-stats">
                    <div className="stat-item">
                        <Activity size={16} />
                        <span>Moyenne: {statistics.average.toFixed(2)} €</span>
                    </div>
                    {statistics.max > 0 && (
                        <div className="stat-item">
                            <DollarSign size={16} />
                            <span>Max: {statistics.max.toFixed(2)} €</span>
                        </div>
                    )}
                </div>
            </div>

            <ResponsiveContainer width="100%" height={350}>
                {selectedPeriod === 'monthly' ? (
                    <AreaChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis
                            dataKey="day"
                            tick={{ fontSize: 11 }}
                            interval={Math.ceil(dailyData.length / 15)} // Afficher environ 15 ticks max
                        />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="amount"
                            stroke="#667eea"
                            fill="#667eea"
                            fillOpacity={0.6}
                            strokeWidth={2}
                        />
                    </AreaChart>
                ) : (
                    <BarChart data={dailyData}>
                        <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                        <XAxis dataKey="day" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="amount"
                            fill="#667eea"
                            radius={[4, 4, 0, 0]}
                        />
                    </BarChart>
                )}
            </ResponsiveContainer>

            <div className="daily-insights">
                <div className="insight-grid">
                    <div className="insight-item">
                        <span className="insight-label">
                            {selectedPeriod === 'monthly' ? 'Jours avec dépenses:' : 'Jours les plus dépensiers:'}
                        </span>
                        <span className="insight-value">
                            {selectedPeriod === 'monthly'
                                ? `${statistics.totalDays}/${dailyData.length}`
                                : dailyData.filter(d => d.amount > statistics.average)
                                    .map(d => d.day).join(', ') || 'Aucun'}
                        </span>
                    </div>
                    {statistics.max > 0 && (
                        <div className="insight-item">
                            <span className="insight-label">Écart max/min:</span>
                            <span className="insight-value">
                                {(statistics.max - statistics.min).toFixed(2)} €
                            </span>
                        </div>
                    )}
                    {selectedPeriod === 'monthly' && (
                        <div className="insight-item">
                            <span className="insight-label">Projection fin de mois:</span>
                            <span className="insight-value">
                                {(statistics.average * dailyData.length).toFixed(2)} €
                            </span>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default DailySpendingChart;