import React, { useState, useEffect } from 'react';
import { Button, Card } from './ui';
import SmartAlerts from './SmartAlerts';
import GoalsSystem from './GoalsSystem';
import './css/beginner-dashboard.css';

const BeginnerDashboard = ({ userProfile, expenses = [], budgets = [], onboardingComplete = false }) => {
    const [activeView, setActiveView] = useState('overview');
    const [showTips, setShowTips] = useState(true);
    const [currentTip, setCurrentTip] = useState(0);

    const tips = [
        {
            icon: '💡',
            title: 'Conseil du jour',
            content: 'Enregistrez vos dépenses dès que vous les faites pour ne rien oublier !',
            action: 'Ajouter une dépense',
            actionLink: '/form'
        },
        {
            icon: '🎯',
            title: 'Objectif simple',
            content: 'Commencez par économiser 50€ ce mois-ci. C\'est un excellent début !',
            action: 'Créer un objectif',
            actionLink: '/goals'
        },
        {
            icon: '📊',
            title: 'Suivez votre budget',
            content: 'Consultez vos graphiques chaque semaine pour rester sur la bonne voie.',
            action: 'Voir mes graphiques',
            actionLink: '/graph'
        }
    ];

    useEffect(() => {
        const tipInterval = setInterval(() => {
            setCurrentTip((prev) => (prev + 1) % tips.length);
        }, 10000);

        return () => clearInterval(tipInterval);
    }, []);

    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();

    // Calculer les statistiques du mois actuel
    const monthlyExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
    });

    const totalSpent = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0);
    const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
    const remainingBudget = Math.max(0, totalBudget - totalSpent);
    const budgetProgress = totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0;

    // Dépenses par catégorie
    const expensesByCategory = monthlyExpenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    const topCategories = Object.entries(expensesByCategory)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 3);

    // Dernières dépenses
    const recentExpenses = [...monthlyExpenses]
        .sort((a, b) => new Date(b.date) - new Date(a.date))
        .slice(0, 5);

    const views = {
        overview: 'Vue d\'ensemble',
        expenses: 'Mes dépenses',
        budget: 'Mon budget',
        goals: 'Mes objectifs'
    };

    return (
        <div className="beginner-dashboard">
            {!onboardingComplete && (
                <WelcomeBanner userProfile={userProfile} />
            )}

            <div className="dashboard-header">
                <div className="header-content">
                    <h1>👋 Bonjour {userProfile?.name || 'ami'} !</h1>
                    <p>Voici un aperçu simple de vos finances</p>
                </div>

                {showTips && (
                    <TipCard
                        tip={tips[currentTip]}
                        onClose={() => setShowTips(false)}
                    />
                )}
            </div>

            <div className="dashboard-nav">
                {Object.entries(views).map(([key, label]) => (
                    <button
                        key={key}
                        className={`nav-button ${activeView === key ? 'active' : ''}`}
                        onClick={() => setActiveView(key)}
                    >
                        {label}
                    </button>
                ))}
            </div>

            {activeView === 'overview' && (
                <OverviewView
                    totalSpent={totalSpent}
                    totalBudget={totalBudget}
                    remainingBudget={remainingBudget}
                    budgetProgress={budgetProgress}
                    topCategories={topCategories}
                    recentExpenses={recentExpenses}
                    userProfile={userProfile}
                />
            )}

            {activeView === 'expenses' && (
                <ExpensesView
                    expenses={monthlyExpenses}
                    expensesByCategory={expensesByCategory}
                />
            )}

            {activeView === 'budget' && (
                <BudgetView
                    budgets={budgets}
                    expenses={monthlyExpenses}
                    totalSpent={totalSpent}
                    totalBudget={totalBudget}
                />
            )}

            {activeView === 'goals' && (
                <GoalsView expenses={expenses} />
            )}

            <SmartAlerts expenses={expenses} budgets={budgets} />
        </div>
    );
};

const WelcomeBanner = ({ userProfile }) => (
    <Card className="welcome-banner">
        <div className="banner-content">
            <div className="banner-icon">🎉</div>
            <div className="banner-text">
                <h3>Bienvenue dans votre espace budget !</h3>
                <p>
                    Bravo {userProfile?.name}, vous avez terminé la configuration.
                    Voici votre tableau de bord simplifié pour bien commencer.
                </p>
            </div>
            <div className="banner-action">
                <Button size="small" variant="primary" onClick={() => window.location.href = '/form'}>
                    Ajouter ma première dépense
                </Button>
            </div>
        </div>
    </Card>
);

const TipCard = ({ tip, onClose }) => (
    <Card className="tip-card">
        <button className="tip-close" onClick={onClose}>✕</button>
        <div className="tip-icon">{tip.icon}</div>
        <div className="tip-content">
            <h4>{tip.title}</h4>
            <p>{tip.content}</p>
            {tip.action && (
                <Button
                    size="small"
                    variant="secondary"
                    onClick={() => window.location.href = tip.actionLink}
                >
                    {tip.action}
                </Button>
            )}
        </div>
    </Card>
);

const OverviewView = ({
    totalSpent,
    totalBudget,
    remainingBudget,
    budgetProgress,
    topCategories,
    recentExpenses,
    userProfile
}) => (
    <div className="overview-view">
        <div className="overview-stats">
            <StatCard
                title="Dépensé ce mois"
                value={`${totalSpent.toLocaleString()}€`}
                icon="💸"
                color="#e53e3e"
                subtitle={totalBudget > 0 ? `sur ${totalBudget.toLocaleString()}€ budgétés` : ''}
            />
            <StatCard
                title="Budget restant"
                value={`${remainingBudget.toLocaleString()}€`}
                icon="💰"
                color={remainingBudget > 0 ? "#48bb78" : "#e53e3e"}
                subtitle={`${(100 - budgetProgress).toFixed(0)}% du budget`}
            />
            <StatCard
                title="Progression"
                value={`${budgetProgress.toFixed(0)}%`}
                icon="📊"
                color={budgetProgress > 80 ? "#e53e3e" : budgetProgress > 60 ? "#ed8936" : "#48bb78"}
                subtitle="de votre budget utilisé"
            />
        </div>

        <div className="overview-content">
            <Card className="budget-progress-card">
                <h3>🎯 Votre budget du mois</h3>
                <div className="budget-visual">
                    <div className="budget-bar">
                        <div
                            className={`budget-fill ${budgetProgress > 100 ? 'over-budget' : ''}`}
                            style={{ width: `${Math.min(budgetProgress, 100)}%` }}
                        />
                    </div>
                    <div className="budget-labels">
                        <span>0€</span>
                        <span>{totalBudget.toLocaleString()}€</span>
                    </div>
                    <div className="budget-status">
                        {budgetProgress > 100 ? (
                            <span className="over-budget-text">
                                ⚠️ Vous avez dépassé votre budget de {(totalSpent - totalBudget).toLocaleString()}€
                            </span>
                        ) : (
                            <span className="on-budget-text">
                                ✅ Il vous reste {remainingBudget.toLocaleString()}€ pour ce mois
                            </span>
                        )}
                    </div>
                </div>
                <div className="quick-actions">
                    <Button size="small" variant="primary" onClick={() => window.location.href = '/form'}>
                        ➕ Ajouter une dépense
                    </Button>
                    <Button size="small" variant="secondary" onClick={() => window.location.href = '/budget'}>
                        🔧 Ajuster le budget
                    </Button>
                </div>
            </Card>

            <div className="overview-grid">
                <Card className="top-categories">
                    <h3>📊 Vos principales dépenses</h3>
                    {topCategories.length > 0 ? (
                        <div className="categories-list">
                            {topCategories.map(([category, amount], index) => (
                                <div key={category} className="category-item">
                                    <div className="category-info">
                                        <span className="category-rank">#{index + 1}</span>
                                        <span className="category-name">{category}</span>
                                    </div>
                                    <span className="category-amount">{amount.toLocaleString()}€</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>Aucune dépense enregistrée ce mois</p>
                            <Button size="small" onClick={() => window.location.href = '/form'}>
                                Ajouter ma première dépense
                            </Button>
                        </div>
                    )}
                </Card>

                <Card className="recent-expenses">
                    <h3>📝 Dernières dépenses</h3>
                    {recentExpenses.length > 0 ? (
                        <div className="expenses-list">
                            {recentExpenses.map((expense, index) => (
                                <div key={index} className="expense-item">
                                    <div className="expense-info">
                                        <span className="expense-description">
                                            {expense.description || expense.category}
                                        </span>
                                        <span className="expense-date">
                                            {new Date(expense.date).toLocaleDateString()}
                                        </span>
                                    </div>
                                    <span className="expense-amount">-{expense.amount}€</span>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <div className="empty-state">
                            <p>Aucune dépense récente</p>
                        </div>
                    )}
                    <Button
                        size="small"
                        variant="ghost"
                        onClick={() => window.location.href = '/allSpend'}
                    >
                        Voir toutes les dépenses →
                    </Button>
                </Card>
            </div>
        </div>
    </div>
);

const StatCard = ({ title, value, icon, color, subtitle }) => (
    <Card className="stat-card">
        <div className="stat-icon" style={{ color }}>{icon}</div>
        <div className="stat-content">
            <h4>{title}</h4>
            <div className="stat-value" style={{ color }}>{value}</div>
            {subtitle && <div className="stat-subtitle">{subtitle}</div>}
        </div>
    </Card>
);

const ExpensesView = ({ expenses, expensesByCategory }) => (
    <div className="expenses-view">
        <Card>
            <h3>💸 Mes dépenses ce mois</h3>
            <SimpleExpenseChart data={expensesByCategory} />
            <div className="expenses-summary">
                <p>Total dépensé : <strong>{expenses.reduce((sum, e) => sum + e.amount, 0).toLocaleString()}€</strong></p>
                <p>Nombre de dépenses : <strong>{expenses.length}</strong></p>
                <p>Moyenne par dépense : <strong>
                    {expenses.length > 0 ? (expenses.reduce((sum, e) => sum + e.amount, 0) / expenses.length).toFixed(2) : 0}€
                </strong></p>
            </div>
        </Card>
    </div>
);

const BudgetView = ({ budgets, expenses, totalSpent, totalBudget }) => (
    <div className="budget-view">
        <Card>
            <h3>💰 Mon budget</h3>
            <div className="budget-overview">
                <div className="budget-total">
                    <span>Budget total : {totalBudget.toLocaleString()}€</span>
                    <span>Dépensé : {totalSpent.toLocaleString()}€</span>
                    <span>Restant : {(totalBudget - totalSpent).toLocaleString()}€</span>
                </div>
            </div>
            <BudgetBreakdown budgets={budgets} expenses={expenses} />
        </Card>
    </div>
);

const GoalsView = ({ expenses }) => (
    <div className="goals-view">
        <GoalsSystem expenses={expenses} />
    </div>
);

const SimpleExpenseChart = ({ data }) => {
    const total = Object.values(data).reduce((sum, amount) => sum + amount, 0);

    return (
        <div className="simple-chart">
            {Object.entries(data).map(([category, amount]) => {
                const percentage = total > 0 ? (amount / total) * 100 : 0;
                return (
                    <div key={category} className="chart-item">
                        <div className="chart-bar">
                            <div
                                className="chart-fill"
                                style={{ width: `${percentage}%` }}
                            />
                        </div>
                        <div className="chart-labels">
                            <span>{category}</span>
                            <span>{amount.toLocaleString()}€ ({percentage.toFixed(0)}%)</span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

const BudgetBreakdown = ({ budgets, expenses }) => {
    const expensesByCategory = expenses.reduce((acc, expense) => {
        acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
        return acc;
    }, {});

    return (
        <div className="budget-breakdown">
            {budgets.map(budget => {
                const spent = expensesByCategory[budget.category] || 0;
                const percentage = budget.amount > 0 ? (spent / budget.amount) * 100 : 0;
                const remaining = Math.max(0, budget.amount - spent);

                return (
                    <div key={budget.category} className="budget-item">
                        <div className="budget-header">
                            <span className="budget-category">{budget.category}</span>
                            <span className="budget-amounts">{spent.toLocaleString()}€ / {budget.amount.toLocaleString()}€</span>
                        </div>
                        <div className="budget-progress">
                            <div className="progress-bar">
                                <div
                                    className={`progress-fill ${percentage > 100 ? 'over-budget' : percentage > 80 ? 'warning' : 'good'}`}
                                    style={{ width: `${Math.min(percentage, 100)}%` }}
                                />
                            </div>
                            <span className="progress-percentage">{percentage.toFixed(0)}%</span>
                        </div>
                        <div className="budget-status">
                            {percentage > 100 ? (
                                <span className="status over">Dépassé de {(spent - budget.amount).toLocaleString()}€</span>
                            ) : (
                                <span className="status good">Reste {remaining.toLocaleString()}€</span>
                            )}
                        </div>
                    </div>
                );
            })}
        </div>
    );
};

export default BeginnerDashboard;