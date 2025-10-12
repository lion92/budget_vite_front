import React, { useState } from 'react';
import { Card } from './components/ui/Card';
import './components/css/demo.css';
import { BarChart, Bar, LineChart, Line, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { useReactTable, getCoreRowModel, flexRender } from '@tanstack/react-table';

const Demo = () => {
    const [activeDemo, setActiveDemo] = useState('cards');
    const [darkMode, setDarkMode] = useState(false);

    const demoSections = [
        { id: 'cards', title: '🎴 Cartes', description: 'Composants Card avec différents styles' },
        { id: 'dashboard', title: '📊 Dashboard', description: 'Exemple de tableau de bord moderne' },
        { id: 'forms', title: '📝 Formulaires', description: 'Elements de formulaire stylisés' },
        { id: 'charts', title: '📈 Graphiques', description: 'Visualisations de données' },
        { id: 'tables', title: '📋 Tableaux', description: 'Tableaux de données modernes' }
    ];

    const cardExamples = [
        {
            title: "Budget Personnel",
            value: "2,450€",
            subtitle: "Ce mois",
            trend: "+12%",
            trendDirection: "up",
            icon: "💰"
        },
        {
            title: "Dépenses",
            value: "1,830€",
            subtitle: "Ce mois",
            trend: "-5%",
            trendDirection: "down",
            icon: "💸"
        },
        {
            title: "Économies",
            value: "620€",
            subtitle: "Ce mois",
            trend: "+25%",
            trendDirection: "up",
            icon: "💎"
        }
    ];

    const dashboardMetrics = [
        { label: "Revenus mensuels", value: "4,250€", change: "+8.2%", positive: true },
        { label: "Dépenses totales", value: "3,100€", change: "-2.1%", positive: true },
        { label: "Taux d'épargne", value: "27%", change: "+3.5%", positive: true },
        { label: "Investissements", value: "12,800€", change: "+15.7%", positive: true }
    ];

    const recentTransactions = [
        { id: 1, type: "Salaire", amount: "+2,500€", date: "15 Jan", category: "Revenus" },
        { id: 2, type: "Courses", amount: "-85€", date: "14 Jan", category: "Alimentation" },
        { id: 3, type: "Essence", amount: "-45€", date: "13 Jan", category: "Transport" },
        { id: 4, type: "Netflix", amount: "-13€", date: "12 Jan", category: "Loisirs" },
        { id: 5, type: "Freelance", amount: "+350€", date: "11 Jan", category: "Revenus" }
    ];

    const chartData = [
      { name: 'Jan', dépenses: 4000, revenus: 2400 },
      { name: 'Fév', dépenses: 3000, revenus: 1398 },
      { name: 'Mar', dépenses: 2000, revenus: 9800 },
      { name: 'Avr', dépenses: 2780, revenus: 3908 },
      { name: 'Mai', dépenses: 1890, revenus: 4800 },
      { name: 'Juin', dépenses: 2390, revenus: 3800 },
      { name: 'Juil', dépenses: 3490, revenus: 4300 },
    ];

    const pieChartData = [
      { name: 'Alimentation', value: 700, color: '#3B82F6' },
      { name: 'Transport', value: 450, color: '#10B981' },
      { name: 'Logement', value: 1200, color: '#F59E0B' },
      { name: 'Loisirs', value: 100, color: '#EF4444' },
      { name: 'Autres', value: 300, color: '#6B7280' },
    ];

    const tableData = [
        { id: 1, type: "Salaire", amount: 2500, date: "2023-01-15", category: "Revenus" },
        { id: 2, type: "Courses", amount: -85, date: "2023-01-14", category: "Alimentation" },
        { id: 3, type: "Essence", amount: -45, date: "2023-01-13", category: "Transport" },
        { id: 4, type: "Netflix", amount: -13, date: "2023-01-12", category: "Loisirs" },
        { id: 5, type: "Freelance", amount: 350, date: "2023-01-11", category: "Revenus" },
    ];

    const tableColumns = [
        { accessorKey: 'type', header: 'Type' },
        { accessorKey: 'category', header: 'Catégorie' },
        { accessorKey: 'amount', header: 'Montant' },
        { accessorKey: 'date', header: 'Date' },
    ];

    const renderCards = () => (
        <div className="demo-section">
            <h2 className="demo-section-title">Cartes Modernes</h2>
            <div className="demo-cards-grid">
                {cardExamples.map((card, index) => (
                    <Card
                        key={index}
                        className="demo-stat-card"
                        hoverable={true}
                        padding="large"
                    >
                        <div className="stat-card-content">
                            <div className="stat-header">
                                <span className="stat-icon">{card.icon}</span>
                                <h3 className="stat-title">{card.title}</h3>
                            </div>
                            <div className="stat-value">{card.value}</div>
                            <div className="stat-footer">
                                <span className="stat-subtitle">{card.subtitle}</span>
                                <span className={`stat-trend ${card.trendDirection === 'up' ? 'positive' : 'negative'}`}>
                                    {card.trendDirection === 'up' ? '↗' : '↙'} {card.trend}
                                </span>
                            </div>
                        </div>
                    </Card>
                ))}
            </div>

            <h3 className="demo-subsection-title">Cartes avec Contenu Personnalisé</h3>
            <div className="demo-cards-grid">
                <Card title="Graphique des Dépenses" className="demo-chart-card">
                    <div className="mock-chart">
                        <div className="chart-bars">
                            <div className="bar" style={{height: '60%'}}></div>
                            <div className="bar" style={{height: '80%'}}></div>
                            <div className="bar" style={{height: '45%'}}></div>
                            <div className="bar" style={{height: '90%'}}></div>
                            <div className="bar" style={{height: '70%'}}></div>
                        </div>
                        <p className="chart-caption">Évolution sur 5 mois</p>
                    </div>
                </Card>

                <Card
                    title="Actions Rapides"
                    className="demo-actions-card"
                    actions={
                        <div className="card-actions">
                            <button className="action-btn primary">Ajouter Dépense</button>
                            <button className="action-btn secondary">Voir Plus</button>
                        </div>
                    }
                >
                    <p>Gérez rapidement vos finances avec ces actions.</p>
                    <ul className="actions-list">
                        <li>➕ Nouvelle transaction</li>
                        <li>📊 Générer rapport</li>
                        <li>🎯 Définir objectif</li>
                    </ul>
                </Card>

                <Card
                    title="Notifications"
                    className="demo-notifications-card"
                    loading={false}
                >
                    <div className="notifications-list">
                        <div className="notification-item">
                            <span className="notification-icon">🔔</span>
                            <span>Budget dépassé de 50€</span>
                        </div>
                        <div className="notification-item">
                            <span className="notification-icon">✅</span>
                            <span>Objectif d'épargne atteint</span>
                        </div>
                        <div className="notification-item">
                            <span className="notification-icon">📅</span>
                            <span>Facture à venir dans 3 jours</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );

    const renderDashboard = () => (
        <div className="demo-section">
            <h2 className="demo-section-title">Tableau de Bord Moderne</h2>

            <div className="dashboard-metrics">
                {dashboardMetrics.map((metric, index) => (
                    <div key={index} className="metric-card">
                        <h4 className="metric-label">{metric.label}</h4>
                        <div className="metric-value">{metric.value}</div>
                        <div className={`metric-change ${metric.positive ? 'positive' : 'negative'}`}>
                            {metric.change}
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-content">
                <Card title="Aperçu du Budget" className="budget-overview-card">
                    <div className="budget-category-list">
                        <div className="budget-category-item">
                            <span className="category-name">Alimentation</span>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{width: '70%', backgroundColor: '#3B82F6'}}></div>
                            </div>
                            <span className="budget-amount">700€ / 1000€</span>
                        </div>
                        <div className="budget-category-item">
                            <span className="category-name">Transport</span>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{width: '90%', backgroundColor: '#EF4444'}}></div>
                            </div>
                            <span className="budget-amount">450€ / 500€</span>
                        </div>
                        <div className="budget-category-item">
                            <span className="category-name">Loisirs</span>
                            <div className="progress-bar-container">
                                <div className="progress-bar" style={{width: '40%', backgroundColor: '#10B981'}}></div>
                            </div>
                            <span className="budget-amount">100€ / 250€</span>
                        </div>
                    </div>
                </Card>

                <Card title="Transactions Récentes" className="transactions-card">
                    <div className="transactions-list">
                        {recentTransactions.map(transaction => (
                            <div key={transaction.id} className="transaction-item">
                                <div className="transaction-info">
                                    <span className="transaction-type">{transaction.type}</span>
                                    <span className="transaction-category">{transaction.category}</span>
                                </div>
                                <div className="transaction-details">
                                    <span className={`transaction-amount ${transaction.amount.startsWith('+') ? 'positive' : 'negative'}`}>
                                        {transaction.amount}
                                    </span>
                                    <span className="transaction-date">{transaction.date}</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </Card>

                <Card title="Répartition par Catégorie" className="categories-card">
                    <div className="categories-chart">
                        <div className="category-item">
                            <div className="category-color" style={{backgroundColor: '#3B82F6'}}></div>
                            <span className="category-name">Alimentation</span>
                            <span className="category-amount">42%</span>
                        </div>
                        <div className="category-item">
                            <div className="category-color" style={{backgroundColor: '#10B981'}}></div>
                            <span className="category-name">Transport</span>
                            <span className="category-amount">28%</span>
                        </div>
                        <div className="category-item">
                            <div className="category-color" style={{backgroundColor: '#F59E0B'}}></div>
                            <span className="category-name">Loisirs</span>
                            <span className="category-amount">20%</span>
                        </div>
                        <div className="category-item">
                            <div className="category-color" style={{backgroundColor: '#EF4444'}}></div>
                            <span className="category-name">Autres</span>
                            <span className="category-amount">10%</span>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );

    const renderForms = () => (
        <div className="demo-section">
            <h2 className="demo-section-title">Formulaires Modernes</h2>
            <Card title="Ajouter une Transaction" className="demo-form-card">
                <form className="modern-form">
                    <div className="form-group">
                        <label className="form-label">Type de transaction</label>
                        <select className="form-select">
                            <option>Sélectionner...</option>
                            <option>Dépense</option>
                            <option>Revenu</option>
                        </select>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Montant</label>
                            <input type="number" className="form-input" placeholder="0.00" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Catégorie</label>
                            <select className="form-select">
                                <option>Alimentation</option>
                                <option>Transport</option>
                                <option>Logement</option>
                                <option>Loisirs</option>
                                <option>Santé</option>
                                <option>Éducation</option>
                                <option>Autres</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label className="form-label">Date</label>
                            <input type="date" className="form-input" />
                        </div>
                        <div className="form-group">
                            <label className="form-label">Méthode de paiement</label>
                            <select className="form-select">
                                <option>Carte de crédit</option>
                                <option>Carte de débit</option>
                                <option>Espèces</option>
                                <option>Virement bancaire</option>
                                <option>Autre</option>
                            </select>
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Description</label>
                        <textarea className="form-textarea" placeholder="Description de la transaction..."></textarea>
                    </div>

                    <div className="form-actions">
                        <button type="button" className="btn-secondary">Annuler</button>
                        <button type="submit" className="btn-primary">Ajouter</button>
                    </div>
                </form>
            </Card>
        </div>
    );

    const renderCharts = () => (
        <div className="demo-section">
            <h2 className="demo-section-title">Graphiques Modernes</h2>
            <div className="demo-charts-grid">
                <Card title="Dépenses et Revenus (Bar Chart)" className="demo-chart-card">
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="dépenses" fill="#8884d8" />
                            <Bar dataKey="revenus" fill="#82ca9d" />
                        </BarChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Dépenses et Revenus (Line Chart)" className="demo-chart-card">
                    <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="name" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Line type="monotone" dataKey="dépenses" stroke="#8884d8" />
                            <Line type="monotone" dataKey="revenus" stroke="#82ca9d" />
                        </LineChart>
                    </ResponsiveContainer>
                </Card>
                <Card title="Répartition des Dépenses par Catégorie" className="demo-chart-card">
                    <ResponsiveContainer width="100%" height={300}>
                        <PieChart>
                            <Pie
                                data={pieChartData}
                                cx="50%"
                                cy="50%"
                                outerRadius={80}
                                fill="#8884d8"
                                dataKey="value"
                                label
                            >
                                {pieChartData.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={entry.color} />
                                ))}
                            </Pie>
                            <Tooltip />
                            <Legend />
                        </PieChart>
                    </ResponsiveContainer>
                </Card>
            </div>
        </div>
    );

    // Composant séparé pour les tableaux (nécessaire pour useReactTable)
    const DemoTable = ({ data, columns }) => {
        const table = useReactTable({
            data,
            columns,
            getCoreRowModel: getCoreRowModel(),
        });

        return (
            <Card title="Transactions Récentes" className="demo-table-card">
                <table className="modern-table">
                    <thead>
                        {table.getHeaderGroups().map(headerGroup => (
                            <tr key={headerGroup.id}>
                                {headerGroup.headers.map(header => (
                                    <th key={header.id}>
                                        {flexRender(header.column.columnDef.header, header.getContext())}
                                    </th>
                                ))}
                            </tr>
                        ))}
                    </thead>
                    <tbody>
                        {table.getRowModel().rows.map(row => (
                            <tr key={row.id}>
                                {row.getVisibleCells().map(cell => (
                                    <td key={cell.id}>
                                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </Card>
        );
    };

    const renderTables = () => (
        <div className="demo-section">
            <h2 className="demo-section-title">Tableaux Modernes</h2>
            <DemoTable data={tableData} columns={tableColumns} />
        </div>
    );

    const renderContent = () => {
        switch(activeDemo) {
            case 'cards': return renderCards();
            case 'dashboard': return renderDashboard();
            case 'forms': return renderForms();
            case 'charts': return renderCharts();
            case 'tables': return renderTables();
            default: return renderCards();
        }
    };

    return (
        <div className={`demo-container ${darkMode ? 'dark-mode' : ''}`}>
            <div className="demo-header">
                <div className="demo-header-content">
                    <h1 className="demo-title">🚀 Démonstration du Design Moderne</h1>
                    <p className="demo-subtitle">
                        Découvrez les nouveaux composants et le design system de Budget Manager
                    </p>
                    <button
                        className="demo-theme-toggle"
                        onClick={() => setDarkMode(!darkMode)}
                    >
                        {darkMode ? '☀️' : '🌙'} {darkMode ? 'Mode Clair' : 'Mode Sombre'}
                    </button>
                </div>
            </div>

            <div className="demo-mode-banner">
                <p><strong>Mode Démo:</strong> Vous découvrez l'interface en mode démonstration. Les paramètres seront accessibles dans la version complète de l'application.</p>
            </div>

            <div className="demo-navigation">
                {demoSections.map(section => (
                    <button
                        key={section.id}
                        className={`demo-nav-btn ${activeDemo === section.id ? 'active' : ''}`}
                        onClick={() => setActiveDemo(section.id)}
                    >
                        <span className="demo-nav-title">{section.title}</span>
                        <span className="demo-nav-desc">{section.description}</span>
                    </button>
                ))}
            </div>

            <div className="demo-content">
                {renderContent()}
            </div>

            <div className="demo-footer">
                <p>💡 Cette page démontre les capabilities du nouveau design system</p>
            </div>
        </div>
    );
};

export default Demo;
