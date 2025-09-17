import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    LineChart, Line, AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ComposedChart, ReferenceLine, RadialBarChart, RadialBar
} from 'recharts';
import {
    TrendingUp, TrendingDown, DollarSign, CreditCard,
    PiggyBank, Target, Calendar, ArrowUpRight, ArrowDownRight,
    BarChart3, Activity
} from 'lucide-react';
import useBudgetStore from "../../useBudgetStore";
import ExpensePredictionChart from './ExpensePredictionChart';
import DailySpendingChart from './DailySpendingChart';
import YearlyComparisonChart from './YearlyComparisonChart';
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
    const [isLoading, setIsLoading] = useState(true);

    // Initialisation des données
    useEffect(() => {
        const initializeData = async () => {
            setIsLoading(true);
            try {
                await Promise.all([
                    fetchDepenses(),
                    fetchCategories(),
                    fetchRevenus()
                ]);
            } catch (error) {
                console.error('Erreur lors du chargement des données:', error);
            } finally {
                setIsLoading(false);
            }
        };

        initializeData();
    }, []);

    // Couleurs pour les graphiques - optimisées pour l'accessibilité
    const colors = useMemo(() => [
        '#667eea', '#16a34a', '#dc2626', '#d97706', '#0284c7',
        '#7c3aed', '#059669', '#ea580c', '#0ea5e9', '#7c2d12'
    ], []);

    // Fonction utilitaire pour valider et convertir les montants
    const safeAmount = useCallback((value) => {
        const num = parseFloat(value);
        return isNaN(num) || !isFinite(num) ? 0 : num;
    }, []);

    // Fonction pour trouver le nom de catégorie
    const getCategoryName = useCallback((categorieId) => {
        if (!categorieId || !categories || categories.length === 0) {
            return 'Non catégorisé';
        }

        const categorieString = String(categorieId).trim();

        // Recherche par ID ou par nom
        const categorieFound = categories.find(c =>
            String(c.id) === categorieString ||
            c.categorie === categorieId ||
            c.name === categorieId ||
            c.nom === categorieId
        );

        if (categorieFound) {
            return categorieFound.categorie ||
                categorieFound.name ||
                categorieFound.nom ||
                `Catégorie ${categorieFound.id}`;
        }

        // Si c'est déjà un nom de catégorie valide
        if (typeof categorieId === 'string' && categorieString.length > 0) {
            return categorieString;
        }

        return 'Non catégorisé';
    }, [categories]);

    // Calculs des données - optimisé avec useMemo
    const calculatedData = useMemo(() => {
        if (isLoading || !depenses || !revenus) {
            return {
                totalDepenses: 0,
                totalRevenus: 0,
                solde: 0,
                tauxEpargne: 0,
                pieData: [],
                evolutionMensuelle: [],
                topCategories: [],
                radialData: [],
                progressionEpargne: 0,
                objectifEpargne: 0,
                analyseTemporelle: []
            };
        }

        const currentYear = selectedYear;
        const currentMonth = selectedMonth;

        // Filtrer les données selon la période
        const filterByPeriod = (items, dateField) => {
            return items.filter(item => {
                const date = new Date(item[dateField]);
                if (!isFinite(date.getTime())) return false; // Date invalide

                if (selectedPeriod === 'monthly') {
                    return date.getFullYear() === currentYear && date.getMonth() === currentMonth;
                } else if (selectedPeriod === 'yearly') {
                    return date.getFullYear() === currentYear;
                }
                return true;
            });
        };

        const filteredDepenses = filterByPeriod(depenses, 'dateTransaction');
        const filteredRevenus = filterByPeriod(revenus, 'date');

        // Totaux avec validation
        const totalDepenses = filteredDepenses.reduce((acc, dep) =>
            acc + safeAmount(dep.montant), 0);

        const totalRevenus = filteredRevenus.reduce((acc, rev) =>
            acc + safeAmount(rev.amount), 0);

        const solde = totalRevenus - totalDepenses;
        const tauxEpargne = totalRevenus > 0 ? (solde / totalRevenus) * 100 : 0;

        // Données par catégorie
        const depensesParCategorie = filteredDepenses.reduce((acc, dep) => {
            const categorieNom = getCategoryName(dep.categorie);
            const montant = safeAmount(dep.montant);
            acc[categorieNom] = (acc[categorieNom] || 0) + montant;
            return acc;
        }, {});

        const pieData = Object.entries(depensesParCategorie)
            .filter(([, value]) => value > 0)
            .sort(([,a], [,b]) => b - a) // Tri par montant décroissant
            .map(([name, value], index) => ({
                name: name.length > 20 ? name.substring(0, 20) + '...' : name,
                fullName: name,
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
                return isFinite(dDate.getTime()) &&
                    dDate.getFullYear() === annee &&
                    dDate.getMonth() === moisNum;
            }).reduce((acc, d) => acc + safeAmount(d.montant), 0);

            const revenusMois = (revenus || []).filter(r => {
                const rDate = new Date(r.date);
                return isFinite(rDate.getTime()) &&
                    rDate.getFullYear() === annee &&
                    rDate.getMonth() === moisNum;
            }).reduce((acc, r) => acc + safeAmount(r.amount), 0);

            evolutionMensuelle.push({
                mois: `${mois} ${annee.toString().slice(-2)}`,
                depenses: depensesMois,
                revenus: revenusMois,
                solde: revenusMois - depensesMois
            });
        }

        // Top 5 des catégories
        const topCategories = Object.entries(depensesParCategorie)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([name, value], index) => ({
                name: name.length > 15 ? name.substring(0, 15) + '...' : name,
                fullName: name,
                value,
                pourcentage: totalDepenses > 0 ? ((value / totalDepenses) * 100).toFixed(1) : '0.0',
                fill: colors[index]
            }));

        // Données pour le graphique radial
        const objectifEpargne = totalRevenus * 0.2; // 20% objectif
        const soldePositif = Math.max(solde, 0);
        const progressionEpargne = objectifEpargne > 0 ?
            Math.min((soldePositif / objectifEpargne) * 100, 100) : 0;

        const radialData = [
            {
                name: 'Épargne',
                value: progressionEpargne,
                fill: solde >= 0 ? '#16a34a' : '#dc2626'
            }
        ];

        // Analyse temporelle améliorée
        const analyseTemporelle = (() => {
            if (selectedPeriod === 'monthly') {
                // Pour le mois : analyse par semaine
                const semaines = [];
                const startOfMonth = new Date(selectedYear, selectedMonth, 1);
                const endOfMonth = new Date(selectedYear, selectedMonth + 1, 0);
                const totalDays = endOfMonth.getDate();
                const weeksInMonth = Math.ceil(totalDays / 7);

                for (let semaine = 0; semaine < weeksInMonth; semaine++) {
                    const startWeek = new Date(selectedYear, selectedMonth, semaine * 7 + 1);
                    const endWeek = new Date(selectedYear, selectedMonth, Math.min((semaine + 1) * 7, totalDays));

                    const depensesSemaine = filteredDepenses.filter(d => {
                        const dDate = new Date(d.dateTransaction);
                        return isFinite(dDate.getTime()) && dDate >= startWeek && dDate <= endWeek;
                    }).reduce((acc, d) => acc + safeAmount(d.montant), 0);

                    semaines.push({
                        periode: `Sem. ${semaine + 1}`,
                        depenses: depensesSemaine
                    });
                }

                return semaines;
            } else {
                // Pour l'année : analyse par mois
                const moisAnalyse = [];
                for (let mois = 0; mois < 12; mois++) {
                    const depensesMois = (depenses || []).filter(d => {
                        const dDate = new Date(d.dateTransaction);
                        return isFinite(dDate.getTime()) &&
                            dDate.getFullYear() === selectedYear &&
                            dDate.getMonth() === mois;
                    }).reduce((acc, d) => acc + safeAmount(d.montant), 0);

                    moisAnalyse.push({
                        periode: new Date(0, mois).toLocaleString('fr-FR', { month: 'short' }),
                        depenses: depensesMois
                    });
                }

                return moisAnalyse;
            }
        })();

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
            analyseTemporelle
        };
    }, [depenses, revenus, categories, selectedPeriod, selectedYear, selectedMonth, isLoading, safeAmount, getCategoryName, colors]);

    // Tooltip personnalisé amélioré
    const CustomTooltip = ({ active, payload, label }) => {
        if (!active || !payload || !payload.length) return null;

        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">{label}</p>
                {payload.map((entry, index) => {
                    const value = safeAmount(entry.value);
                    return (
                        <p key={index} style={{ color: entry.color }}>
                            {entry.name}: {value.toFixed(2)} €
                        </p>
                    );
                })}
            </div>
        );
    };

    // Composant KPI amélioré
    const KPICard = ({ title, value, icon: Icon, trend, color = '#667eea' }) => {
        const safeValue = typeof value === 'string' ? value : safeAmount(value);
        const safeTrend = safeAmount(trend);

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

    // Tooltip personnalisé pour le pie chart
    const PieTooltip = ({ active, payload }) => {
        if (!active || !payload || !payload.length) return null;

        const data = payload[0];
        return (
            <div className="custom-tooltip">
                <p className="tooltip-label">{data.payload.fullName || data.name}</p>
                <p style={{ color: data.fill }}>
                    Montant: {safeAmount(data.value).toFixed(2)} €
                </p>
            </div>
        );
    };

    if (isLoading) {
        return (
            <div className="dashboard-container">
                <div className="no-data-message">
                    <div className="loading-spinner"></div>
                    <p>Chargement du dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="dashboard-container">
            {/* Header */}
            <div className="dashboard-header">
                <h1>
                    <BarChart3 size={32} style={{ marginRight: '12px' }} />
                    Dashboard Financier
                </h1>
                <div className="period-selector">
                    <select
                        value={selectedPeriod}
                        onChange={(e) => setSelectedPeriod(e.target.value)}
                        className="period-select"
                        aria-label="Sélectionner la période"
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
                                aria-label="Sélectionner le mois"
                            >
                                {Array.from({length: 12}).map((_, i) => (
                                    <option key={i} value={i}>
                                        {new Date(0, i).toLocaleString('fr-FR', {month: 'long'})}
                                    </option>
                                ))}
                            </select>
                        </>
                    )}

                    <input
                        type="number"
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="year-input"
                        min="2020"
                        max="2030"
                        aria-label="Sélectionner l'année"
                    />
                </div>
            </div>

            {/* KPIs */}
            <div className="kpis-grid">
                <KPICard
                    title="Revenus"
                    value={calculatedData.totalRevenus}
                    icon={TrendingUp}
                    color="#16a34a"
                />
                <KPICard
                    title="Dépenses"
                    value={calculatedData.totalDepenses}
                    icon={TrendingDown}
                    color="#dc2626"
                />
                <KPICard
                    title="Solde"
                    value={calculatedData.solde}
                    icon={DollarSign}
                    color={calculatedData.solde >= 0 ? '#16a34a' : '#dc2626'}
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
                    <h3>
                        <Activity size={20} />
                        Évolution sur 12 mois
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <ComposedChart data={calculatedData.evolutionMensuelle}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis
                                dataKey="mois"
                                tick={{ fontSize: 12 }}
                                angle={-45}
                                textAnchor="end"
                                height={60}
                            />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Legend />
                            <Area
                                type="monotone"
                                dataKey="revenus"
                                fill="#16a34a"
                                fillOpacity={0.3}
                                stroke="#16a34a"
                                name="Revenus"
                                strokeWidth={2}
                            />
                            <Area
                                type="monotone"
                                dataKey="depenses"
                                fill="#dc2626"
                                fillOpacity={0.3}
                                stroke="#dc2626"
                                name="Dépenses"
                                strokeWidth={2}
                            />
                            <Line
                                type="monotone"
                                dataKey="solde"
                                stroke="#667eea"
                                strokeWidth={3}
                                name="Solde"
                                dot={{ r: 4 }}
                            />
                            <ReferenceLine y={0} stroke="#666" strokeDasharray="2 2" />
                        </ComposedChart>
                    </ResponsiveContainer>
                </div>

                {/* Répartition par catégorie */}
                <div className="chart-card medium">
                    <h3>
                        <Target size={20} />
                        Dépenses par catégorie
                    </h3>
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
                                <Tooltip content={<PieTooltip />} />
                                <Legend
                                    verticalAlign="bottom"
                                    height={36}
                                    iconType="circle"
                                />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data-message">
                            <p>📊 Aucune donnée de catégorie disponible</p>
                            <p>Vérifiez que vos dépenses ont des catégories assignées</p>
                        </div>
                    )}
                </div>

                {/* Objectif d'épargne */}
                <div className="chart-card medium">
                    <h3>
                        <PiggyBank size={20} />
                        Objectif d'épargne (20%)
                    </h3>
                    <ResponsiveContainer width="100%" height={350}>
                        <RadialBarChart
                            cx="50%"
                            cy="50%"
                            innerRadius="40%"
                            outerRadius="80%"
                            data={calculatedData.radialData}
                            startAngle={90}
                            endAngle={-270}
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
                                {calculatedData.progressionEpargne.toFixed(0)}%
                            </text>
                        </RadialBarChart>
                    </ResponsiveContainer>
                    <div className="objectif-details">
                        <p>Objectif: {calculatedData.objectifEpargne.toFixed(2)} €</p>
                        <p>Réalisé: {Math.max(calculatedData.solde, 0).toFixed(2)} €</p>
                    </div>
                </div>

                {/* Top 5 catégories */}
                <div className="chart-card medium">
                    <h3>
                        <BarChart3 size={20} />
                        Top 5 des catégories
                    </h3>
                    {calculatedData.topCategories.length > 0 ? (
                        <ResponsiveContainer width="100%" height={350}>
                            <BarChart
                                data={calculatedData.topCategories}
                                layout="horizontal"
                                margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                            >
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis type="number" tick={{ fontSize: 12 }} />
                                <YAxis
                                    dataKey="name"
                                    type="category"
                                    width={100}
                                    tick={{ fontSize: 12 }}
                                />
                                <Tooltip
                                    formatter={(value, name, props) => [
                                        `${safeAmount(value).toFixed(2)} €`,
                                        'Montant'
                                    ]}
                                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullName || label}
                                />
                                <Bar
                                    dataKey="value"
                                    fill="#667eea"
                                    radius={[0, 4, 4, 0]}
                                >
                                    {calculatedData.topCategories.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="no-data-message">
                            <p>📊 Aucune catégorie à afficher</p>
                            <p>Ajoutez des dépenses avec des catégories pour voir ce graphique</p>
                        </div>
                    )}
                </div>

                {/* Analyse temporelle */}
                <div className="chart-card large">
                    <h3>
                        <Calendar size={20} />
                        {selectedPeriod === 'monthly'
                            ? `Répartition par semaine - ${new Date(selectedYear, selectedMonth).toLocaleString('fr-FR', { month: 'long', year: 'numeric' })}`
                            : `Dépenses mensuelles - ${selectedYear}`
                        }
                    </h3>
                    <ResponsiveContainer width="100%" height={300}>
                        <AreaChart data={calculatedData.analyseTemporelle}>
                            <CartesianGrid strokeDasharray="3 3" opacity={0.3} />
                            <XAxis dataKey="periode" tick={{ fontSize: 12 }} />
                            <YAxis tick={{ fontSize: 12 }} />
                            <Tooltip content={<CustomTooltip />} />
                            <Area
                                type="monotone"
                                dataKey="depenses"
                                stroke="#667eea"
                                fill="#667eea"
                                fillOpacity={0.6}
                                name="Dépenses"
                                strokeWidth={2}
                            />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Nouveaux graphiques */}
                <ExpensePredictionChart
                    depenses={depenses}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    selectedPeriod={selectedPeriod}
                />

                <DailySpendingChart
                    depenses={depenses}
                    selectedYear={selectedYear}
                    selectedMonth={selectedMonth}
                    selectedPeriod={selectedPeriod}
                />

                <YearlyComparisonChart
                    depenses={depenses}
                    revenus={revenus}
                />

                {/* Analyse détaillée */}
                <div className="chart-card medium">
                    <h3>
                        <Activity size={20} />
                        Analyse détaillée
                    </h3>
                    <div className="analysis-content">
                        <div className="analysis-item">
                            <span className="analysis-label">Moyenne quotidienne:</span>
                            <span className="analysis-value">
                                {(calculatedData.totalDepenses / (selectedPeriod === 'monthly' ? 30 : 365)).toFixed(2)} €
                            </span>
                        </div>
                        <div className="analysis-item">
                            <span className="analysis-label">Plus grosse catégorie:</span>
                            <span className="analysis-value">
                                {calculatedData.topCategories[0]?.fullName || 'N/A'}
                            </span>
                        </div>
                        <div className="analysis-item">
                            <span className="analysis-label">Économies potentielles (10%):</span>
                            <span className="analysis-value">
                                {(calculatedData.totalDepenses * 0.1).toFixed(2)} €
                            </span>
                        </div>
                        <div className="analysis-item">
                            <span className="analysis-label">
                                {selectedPeriod === 'monthly' ? 'Projection annuelle:' : 'Projection mois suivant:'}
                            </span>
                            <span className="analysis-value">
                                {selectedPeriod === 'monthly'
                                    ? (calculatedData.solde * 12).toFixed(2)
                                    : (calculatedData.totalDepenses / 12).toFixed(2)
                                } €
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Footer avec conseils */}
            <div className="dashboard-footer">
                <div className="tips-section">
                    <h4>💡 Conseils personnalisés</h4>
                    <ul>
                        {calculatedData.tauxEpargne < 5 && calculatedData.totalRevenus > 0 && (
                            <li>Votre taux d'épargne est très faible ({calculatedData.tauxEpargne.toFixed(1)}%). Visez au moins 10% de vos revenus.</li>
                        )}
                        {calculatedData.tauxEpargne >= 5 && calculatedData.tauxEpargne < 15 && (
                            <li>Bon début ! Essayez d'atteindre un taux d'épargne de 20% pour optimiser votre avenir financier.</li>
                        )}
                        {calculatedData.topCategories[0]?.value > calculatedData.totalDepenses * 0.5 && (
                            <li>La catégorie "{calculatedData.topCategories[0]?.fullName}" représente {((calculatedData.topCategories[0]?.value / calculatedData.totalDepenses) * 100).toFixed(0)}% de vos dépenses. Analysez si c'est optimal.</li>
                        )}
                        {calculatedData.solde < -calculatedData.totalRevenus * 0.1 && (
                            <li>Attention ! Vos dépenses dépassent significativement vos revenus. Révisez votre budget d'urgence.</li>
                        )}
                        {calculatedData.progressionEpargne >= 100 && (
                            <li>Félicitations ! Vous avez dépassé votre objectif d'épargne de 20%. Envisagez d'investir le surplus.</li>
                        )}
                        {calculatedData.totalDepenses === 0 && calculatedData.totalRevenus === 0 && (
                            <li>Aucune donnée financière trouvée pour cette période. Commencez par ajouter vos revenus et dépenses.</li>
                        )}
                    </ul>
                </div>
            </div>
        </div>
    );
};

export default GraphBudget;