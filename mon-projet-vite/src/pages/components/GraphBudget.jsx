import React, { useState, useEffect, useMemo } from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart, ReferenceLine, RadialBarChart, RadialBar
} from 'recharts';
import {
    TrendingUp, TrendingDown, DollarSign, CreditCard,
    PiggyBank, Target, Calendar, ArrowUpRight, ArrowDownRight
} from 'lucide-react';
import useBudgetStore from "../../useBudgetStore";
import './css/graphBudget.css';

const GraphBudget = () => {
    const {
        depenses,
        revenus,
        categories,
        fetchDepenses,
        fetchCategories,
        fetchRevenus
    } = useBudgetStore();

    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
    const [selectedMonth, setSelectedMonth] = useState(new Date().getMonth());

    useEffect(() => {
        fetchDepenses();
        fetchCategories();
        fetchRevenus();
    }, []);

    // Couleurs pour les graphiques
    const colors = [
        '#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe',
        '#00f2fe', '#43e97b', '#38f9d7', '#fa709a', '#fee140'
    ];

    // Calculs des données
    const calculatedData = useMemo(() => {
        const currentYear = selectedYear;
        const currentMonth = selectedMonth;

        // Filtrer les données selon la période
        const filterByPeriod = (items, dateField) => {
            return items.filter(item => {
                const date = new Date(item[dateField]);
                if (selectedPeriod === 'monthly') {
                    return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
                } else if (selectedPeriod === 'yearly') {
                    return date.getFullYear() === currentYear;
                }
                return true;
            });
        };

        const filteredDepenses = filterByPeriod(depenses || [], 'dateTransaction');
        const filteredRevenus = filterByPeriod(revenus || [], 'date');

        // Totaux avec protection NaN
        const totalDepenses = filteredDepenses.reduce((acc, dep) => {
            const montant = parseFloat(dep.montant);
            return acc + (isNaN(montant) ? 0 : montant);
        }, 0);

        const totalRevenus = filteredRevenus.reduce((acc, rev) => {
            const amount = parseFloat(rev.amount);
            return acc + (isNaN(amount) ? 0 : amount);
        }, 0);

        const solde = totalRevenus - totalDepenses;
        const tauxEpargne = totalRevenus > 0 ? ((solde / totalRevenus) * 100) : 0;

        // Données par catégorie avec mapping intelligent
        const depensesParCategorie = filteredDepenses.reduce((acc, dep) => {
            let categorieNom = 'Non catégorisé';

            if (dep.categorie && categories && categories.length > 0) {
                // Conversion sécurisée des IDs
                const depCategorieId = String(dep.categorie);

                // Recherche de la catégorie correspondante
                const categorieFound = categories.find(c =>
                    String(c.id) === depCategorieId ||
                    c.categorie === dep.categorie ||
                    c.name === dep.categorie ||
                    c.nom === dep.categorie
                );

                if (categorieFound) {
                    categorieNom = categorieFound.categorie ||
                        categorieFound.name ||
                        categorieFound.nom ||
                        `Catégorie ${categorieFound.id}`;
                } else if (typeof dep.categorie === 'string' && dep.categorie.trim().length > 0) {
                    // Si c'est déjà un nom de catégorie
                    categorieNom = dep.categorie.trim();
                }
            }

            const montant = parseFloat(dep.montant);
            const montantValide = isNaN(montant) ? 0 : montant;
            acc[categorieNom] = (acc[categorieNom] || 0) + montantValide;
            return acc;
        }, {});

        const pieData = Object.entries(depensesParCategorie)
            .filter(([name, value]) => value > 0) // Filtrer les catégories vides
            .map(([name, value], index) => ({
                name,
                value,
                fill: colors[index % colors.length]
            }));

        // Évolution mensuelle (12 derniers mois)
        const evolutionMensuelle = [];
        for (let i = 11; i >= 0; i--) {
            const date = new Date();
            date.setMonth(date.getMonth() - i);
            const mois = date.toLocaleString('fr-FR', { month: 'short' });
            const annee = date.getFullYear();
            const moisNum = date.getMonth();

            const depensesMois = (depenses || []).filter(d => {
                const dDate = new Date(d.dateTransaction);
                return dDate.getFullYear() === annee && dDate.getMonth() === moisNum;
            }).reduce((acc, d) => {
                const montant = parseFloat(d.montant);
                return acc + (isNaN(montant) ? 0 : montant);
            }, 0);

            const revenusMois = (revenus || []).filter(r => {
                const rDate = new Date(r.date);
                return rDate.getFullYear() === annee && rDate.getMonth() === moisNum;
            }).reduce((acc, r) => {
                const amount = parseFloat(r.amount);
                return acc + (isNaN(amount) ? 0 : amount);
            }, 0);

            evolutionMensuelle.push({
                mois: `${mois} ${annee.toString().slice(-2)}`,
                depenses: depensesMois,
                revenus: revenusMois,
                solde: revenusMois - depensesMois
            });
        }

        // Top 5 des catégories avec protection NaN
        const topCategories = Object.entries(depensesParCategorie)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, value], index) => ({
                name,
                value: isNaN(value) ? 0 : value,
                pourcentage: totalDepenses > 0 ? ((value / totalDepenses) * 100).toFixed(1) : '0.0',
                fill: colors[index]
            }));

        // Données pour le graphique radial (objectifs) avec protection NaN
        const objectifEpargne = totalRevenus * 0.2; // 20% objectif
        const soldePositif = Math.max(solde, 0);
        const progressionEpargne = objectifEpargne > 0 ? Math.min((soldePositif / objectifEpargne) * 100, 100) : 0;

        const radialData = [
            {
                name: 'Épargne',
                value: isNaN(progressionEpargne) ? 0 : progressionEpargne,
                fill: solde >= 0 ? '#10b981' : '#ef4444'
            }
        ];

        // Analyse des tendances (7 derniers jours)
        const tendanceJournaliere = [];
        for (let i = 6; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            const jour = date.toLocaleDateString('fr-FR', { weekday: 'short' });

            const depensesJour = (depenses || []).filter(d => {
                const dDate = new Date(d.dateTransaction);
                return dDate.toDateString() === date.toDateString();
            }).reduce((acc, d) => {
                const montant = parseFloat(d.montant);
                return acc + (isNaN(montant) ? 0 : montant);
            }, 0);

            tendanceJournaliere.push({
                jour,
                depenses: depensesJour
            });
        }

        return {
            totalDepenses,
            totalRevenus,
            solde,
            tauxEpargne,
            pieData,
            evolutionMensuelle,
            topCategories,
            radialData,
            progressionEpargne,
            objectifEpargne,
            tendanceJournaliere
        };
    }, [depenses, revenus, categories, selectedPeriod, selectedYear, selectedMonth]);

    const CustomTooltip = ({ active, payload, label }) => {
        if (active && payload && payload.length) {
            return (
                <div className="custom-tooltip">
                    <p className="tooltip-label">{label}</p>
                    {payload.map((entry, index) => {
                        const value = isNaN(entry.value) ? 0 : entry.value;
                        return (
                            <p key={index} style={{ color: entry.color }}>
                                {entry.name}: {value.toFixed(2)} €
                            </p>
                        );
                    })}
                </div>
            );
        }
        return null;
    };

    const KPICard = ({ title, value, icon: Icon, trend, color = '#667eea' }) => {
        // Protection contre les valeurs NaN
        const safeValue = isNaN(value) ? 0 : value;
        const safeTrend = isNaN(trend) ? 0 : trend;

        return (
            <div className="kpi-card">
                <div className="kpi-header">
                    <Icon size={24} style={{ color }} />
                    <span className="kpi-title">{title}</span>
                </div>
                <div className="kpi-value" style={{ color }}>
                    {typeof safeValue === 'number' ? `${safeValue.toFixed(2)} €` : safeValue}
                </div>
                {trend !== undefined && (
                    <div className={`kpi-trend ${safeTrend > 0 ? 'positive' : 'negative'}`}>
                        {safeTrend > 0 ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                        {Math.abs(safeTrend).toFixed(1)}%
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="dashboard-container">
            <div className="dashboard-header">
                <h1>Dashboard Financier</h1>
                <div className="period-selector">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="period-select"
                    >
                        <option value="monthly">Mensuel</option>
                        <option value="yearly">Annuel</option>
                    </select>

                    {selectedPeriod === 'monthly' && (
                        <>
                            <select
                                value={selectedMonth}
                                onChange={(e) => setSelectedMonth(parseInt(e.target.value))}
                                className="month-select"
                            >
                                {Array.from({length: 12}).map((_, i) => (
                                    <option key={i} value={i}>
                                        {new Date(0, i).toLocaleString('fr-FR', {month: 'long'})}
                                    </option>
                                ))}
                            </select>
                            <input
                                type="number"
                                value={selectedYear}
                                onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                                className="year-input"
                            />
                        </>
                    )}

                    {selectedPeriod === 'yearly' && (
                        <input
                            type="number"
                            value={selectedYear}
                            onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                            className="year-input"
                        />
                    )}
                </div>
            </div>

            {/* KPIs */}
            <div className="kpis-grid">
                <KPICard
                    title="Revenus"
                    value={calculatedData.totalRevenus}
                    icon={TrendingUp}
                    color="#10b981"
                />
                <KPICard
                    title="Dépenses"
                    value={calculatedData.totalDepenses}
                    icon={TrendingDown}
                    color="#ef4444"
                />
                <KPICard
                    title="Solde"
                    value={calculatedData.solde}
                    icon={DollarSign}
                    color={calculatedData.solde >= 0 ? '#10b981' : '#ef4444'}
                />
                <KPICard
                    title="Taux d'épargne"
                    value={`${calculatedData.tauxEpargne.toFixed(1)}%`}
                    icon={PiggyBank}
                    color="#667eea"
                />
            </div>

            {/* Graphiques principaux */}
            <div className="charts-grid">
                {/* Évolution mensuelle */}
                <div className="chart-card large">
                    <h3>Évolution sur 12 mois</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={calculatedData.evolutionMensuelle}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="mois" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="revenus"
                                fill="#10b981"
                                fillOpacity={0.3}
                                stroke="#10b981"
                                name="Revenus"
                            />
                            <Area
                                type="monotone"
                                dataKey="depenses"
                                fill="#ef4444"
                                fillOpacity={0.3}
                                stroke="#ef4444"
                                name="Dépenses"
                            />
                            <Line
                                type="monotone"
                                dataKey="solde"
                                stroke="#667eea"
                                strokeWidth={3}
                                name="Solde"
                            />
                            <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Répartition par catégorie */}
                <div className="chart-card medium">
                    <h3>Dépenses par catégorie</h3>
                    {calculatedData.pieData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <PieChart>
                                <Pie
                                    data={calculatedData.pieData}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={120}
                                    paddingAngle={2}
                                    dataKey="value"
                                >
                                    {calculatedData.pieData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.fill} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value) => `${value.toFixed(2)} €`} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data-message">
                            <p>📊 Aucune donnée de catégorie disponible</p>
                            <p style={{fontSize: '14px', color: '#6b7280', marginTop: '10px'}}>
                                Vérifiez que vos dépenses ont des catégories assignées
                            </p>
                        </div>
                    )}
                </div>

                {/* Objectif d'épargne */}
                <div className="chart-card medium">
                    <h3>Objectif d'épargne (20%)</h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius="40%"
                            outerRadius="80%"
                            data={calculatedData.radialData}
                        >
                            <RadialBar
                                dataKey="value"
                                cornerRadius={10}
                                fill={calculatedData.radialData[0]?.fill}
                            />
                            <text
                                x="50%"
                                y="50%"
                                textAnchor="middle"
                                dominantBaseline="middle"
                                className="radial-label"
                            >
                                {isNaN(calculatedData.progressionEpargne) ? '0' : calculatedData.progressionEpargne.toFixed(0)}%
                            </text>
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="objectif-details">
                        <p>Objectif: {isNaN(calculatedData.objectifEpargne) ? '0.00' : calculatedData.objectifEpargne.toFixed(2)} €</p>
                        <p>Réalisé: {Math.max(calculatedData.solde, 0).toFixed(2)} €</p>
                    </div>
                </div>

                {/* Top 5 catégories */}
                <div className="chart-card medium">
                    <h3>Top 5 des catégories</h3>
                    {calculatedData.topCategories.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                data={calculatedData.topCategories}
                                layout="horizontal"
                                margin={{ left: 20 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" />
                                <YAxis type="category" dataKey="name" width={100} />
                                <Tooltip
                                    formatter={(value, name) => [`${value.toFixed(2)} €`, 'Montant']}
                                    labelFormatter={(label) => `Catégorie: ${label}`}
                                />
                                <Bar dataKey="value" fill="#667eea" radius={[0, 4, 4, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data-message">
                            <p>📊 Aucune catégorie à afficher</p>
                            <p style={{fontSize: '14px', color: '#6b7280', marginTop: '10px'}}>
                                Ajoutez des dépenses avec des catégories pour voir ce graphique
                            </p>
                        </div>
                    )}
                </div>

                {/* Tendance 7 derniers jours */}
                <div className="chart-card large">
                    <h3>Dépenses des 7 derniers jours</h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={calculatedData.tendanceJournaliere}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="jour" />
                            <YAxis />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="depenses"
                                stroke="#667eea"
                                fill="#667eea"
                                fillOpacity={0.6}
                                name="Dépenses"
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Analyse détaillée */}
                <div className="chart-card medium">
                    <h3>Analyse du mois</h3>
                    <div className="analysis-content">
                        <div className="analysis-item">
                            <span className="analysis-label">Budget moyen/jour:</span>
                            <span className="analysis-value">
                                {(calculatedData.totalDepenses / 30).toFixed(2)} €
                            </span>
                        </div>
                        <div className="analysis-item">
                            <span className="analysis-label">Plus grosse catégorie:</span>
                            <span className="analysis-value">
                                {calculatedData.topCategories[0]?.name || 'N/A'}
                            </span>
                        </div>
                        <div className="analysis-item">
                            <span className="analysis-label">Économies potentielles:</span>
                            <span className="analysis-value">
                                {(calculatedData.totalDepenses * 0.1).toFixed(2)} €
                            </span>
                        </div>
                        <div className="analysis-item">
                            <span className="analysis-label">Projection annuelle:</span>
                            <span className="analysis-value">
                                {(calculatedData.solde * 12).toFixed(2)} €
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer avec conseils */}
            <div className="dashboard-footer">
                <div className="tips-section">
                    <h4>💡 Conseils du mois</h4>
                    <ul>
                        {calculatedData.tauxEpargne < 10 && (
                            <li>Votre taux d'épargne est faible. Essayez de réduire vos dépenses non essentielles.</li>
                        )}
                        {calculatedData.topCategories[0]?.value > calculatedData.totalDepenses * 0.4 && (
                            <li>La catégorie "{calculatedData.topCategories[0]?.name}" représente une grande part de vos dépenses.</li>
                        )}
                        {calculatedData.solde < 0 && (
                            <li>Attention ! Vos dépenses dépassent vos revenus ce mois-ci.</li>
                        )}
                        {calculatedData.progressionEpargne >= 100 && (
                            <li>Félicitations ! Vous avez atteint votre objectif d'épargne !</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GraphBudget;