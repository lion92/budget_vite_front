import React, { useState, useEffect } from 'react';
import { Button, Card } from './ui';
import './css/smart-alerts.css';

const SmartAlerts = ({ expenses = [], budgets = [], onDismiss }) => {
    const [alerts, setAlerts] = useState([]);
    const [notifications, setNotifications] = useState([]);
    const [settings, setSettings] = useState({
        budgetWarning: 80, // Alerte à 80% du budget
        budgetCritical: 95, // Alerte critique à 95%
        dailyReminder: true,
        weeklyReport: true,
        unusualSpending: true
    });

    useEffect(() => {
        generateAlerts();
        generateNotifications();
    }, [expenses, budgets]);

    const generateAlerts = () => {
        const newAlerts = [];
        const currentMonth = new Date().getMonth();
        const currentYear = new Date().getFullYear();

        // Filtrer les dépenses du mois actuel
        const monthlyExpenses = expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === currentMonth &&
                   expenseDate.getFullYear() === currentYear;
        });

        // Calculer les dépenses par catégorie
        const expensesByCategory = monthlyExpenses.reduce((acc, expense) => {
            acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
            return acc;
        }, {});

        // Vérifier les dépassements de budget
        budgets.forEach(budget => {
            const spent = expensesByCategory[budget.category] || 0;
            const percentage = (spent / budget.amount) * 100;

            if (percentage >= settings.budgetCritical) {
                newAlerts.push({
                    id: `budget-critical-${budget.category}`,
                    type: 'critical',
                    title: '🚨 Budget dépassé !',
                    message: `Vous avez dépassé votre budget "${budget.category}" de ${(spent - budget.amount).toFixed(2)}€`,
                    category: budget.category,
                    action: 'adjust-budget',
                    priority: 1
                });
            } else if (percentage >= settings.budgetWarning) {
                newAlerts.push({
                    id: `budget-warning-${budget.category}`,
                    type: 'warning',
                    title: '⚠️ Attention au budget',
                    message: `Vous avez utilisé ${percentage.toFixed(0)}% de votre budget "${budget.category}" (${spent.toFixed(2)}€/${budget.amount}€)`,
                    category: budget.category,
                    action: 'view-expenses',
                    priority: 2
                });
            }
        });

        // Détecter les dépenses inhabituelles
        if (settings.unusualSpending) {
            detectUnusualSpending(monthlyExpenses, newAlerts);
        }

        // Suggestions d'économies
        generateSavingSuggestions(expensesByCategory, newAlerts);

        // Trier par priorité
        newAlerts.sort((a, b) => a.priority - b.priority);
        setAlerts(newAlerts);
    };

    const generateNotifications = () => {
        const newNotifications = [];
        const today = new Date();

        // Rappel quotidien
        if (settings.dailyReminder && shouldShowDailyReminder()) {
            newNotifications.push({
                id: 'daily-reminder',
                type: 'info',
                title: '📝 N\'oubliez pas !',
                message: 'Avez-vous enregistré vos dépenses d\'aujourd\'hui ?',
                action: 'add-expense',
                timestamp: today
            });
        }

        // Rapport hebdomadaire
        if (settings.weeklyReport && today.getDay() === 0) { // Dimanche
            const weeklySpending = calculateWeeklySpending();
            newNotifications.push({
                id: 'weekly-report',
                type: 'info',
                title: '📊 Votre semaine en chiffres',
                message: `Cette semaine : ${weeklySpending.toFixed(2)}€ dépensés`,
                action: 'view-report',
                timestamp: today
            });
        }

        // Conseils personnalisés
        const personalizedTips = getPersonalizedTips();
        if (personalizedTips.length > 0) {
            newNotifications.push(...personalizedTips);
        }

        setNotifications(newNotifications);
    };

    const detectUnusualSpending = (monthlyExpenses, alerts) => {
        const lastMonthExpenses = getLastMonthExpenses();
        const categories = [...new Set(monthlyExpenses.map(e => e.category))];

        categories.forEach(category => {
            const thisMonthSpending = monthlyExpenses
                .filter(e => e.category === category)
                .reduce((sum, e) => sum + e.amount, 0);

            const lastMonthSpending = lastMonthExpenses
                .filter(e => e.category === category)
                .reduce((sum, e) => sum + e.amount, 0);

            if (lastMonthSpending > 0) {
                const increase = ((thisMonthSpending - lastMonthSpending) / lastMonthSpending) * 100;

                if (increase > 50) {
                    alerts.push({
                        id: `unusual-${category}`,
                        type: 'info',
                        title: '📈 Dépense inhabituelle',
                        message: `Vos dépenses en "${category}" ont augmenté de ${increase.toFixed(0)}% par rapport au mois dernier`,
                        category: category,
                        action: 'analyze-category',
                        priority: 3
                    });
                }
            }
        });
    };

    const generateSavingSuggestions = (expensesByCategory, alerts) => {
        // Analyser les habitudes de dépense
        const sortedCategories = Object.entries(expensesByCategory)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 3);

        if (sortedCategories.length > 0) {
            const [topCategory, topAmount] = sortedCategories[0];

            // Suggestions basées sur la catégorie principale
            let suggestion = getSuggestionForCategory(topCategory, topAmount);

            if (suggestion) {
                alerts.push({
                    id: `suggestion-${topCategory}`,
                    type: 'tip',
                    title: '💡 Conseil d\'économie',
                    message: suggestion,
                    category: topCategory,
                    action: 'view-tips',
                    priority: 4
                });
            }
        }
    };

    const getSuggestionForCategory = (category, amount) => {
        const suggestions = {
            'Alimentation': [
                `Vous dépensez ${amount.toFixed(2)}€ en alimentation. Cuisiner à la maison pourrait vous faire économiser 20-30%.`,
                'Essayez de planifier vos repas pour réduire le gaspillage.',
                'Les achats en gros peuvent réduire le coût unitaire de vos aliments de base.'
            ],
            'Transport': [
                `${amount.toFixed(2)}€ en transport ce mois. Avez-vous considéré le vélo ou les transports en commun ?`,
                'Le covoiturage peut diviser vos frais de transport par deux.',
                'Regrouper vos déplacements peut réduire votre consommation d\'essence.'
            ],
            'Loisirs': [
                `${amount.toFixed(2)}€ en loisirs. Cherchez des activités gratuites : parcs, musées gratuits, événements communautaires.`,
                'Les abonnements multiples coûtent cher. Faites le tri dans vos services payants.',
                'Organisez des soirées à domicile plutôt que de sortir systématiquement.'
            ],
            'Vêtements': [
                'Attendez les soldes pour vos achats non urgents.',
                'Les friperies et sites d\'occasion offrent de bonnes affaires.',
                'Investissez dans des pièces de qualité qui durent plus longtemps.'
            ]
        };

        const categoryTips = suggestions[category];
        if (categoryTips) {
            return categoryTips[Math.floor(Math.random() * categoryTips.length)];
        }
        return null;
    };

    const shouldShowDailyReminder = () => {
        const lastReminder = localStorage.getItem('lastDailyReminder');
        const today = new Date().toDateString();
        return lastReminder !== today;
    };

    const calculateWeeklySpending = () => {
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

        return expenses
            .filter(expense => new Date(expense.date) >= oneWeekAgo)
            .reduce((sum, expense) => sum + expense.amount, 0);
    };

    const getLastMonthExpenses = () => {
        const lastMonth = new Date();
        lastMonth.setMonth(lastMonth.getMonth() - 1);

        return expenses.filter(expense => {
            const expenseDate = new Date(expense.date);
            return expenseDate.getMonth() === lastMonth.getMonth() &&
                   expenseDate.getFullYear() === lastMonth.getFullYear();
        });
    };

    const getPersonalizedTips = () => {
        const tips = [];
        const today = new Date();

        // Conseil basé sur l'historique
        if (expenses.length >= 10) {
            const avgDailySpending = expenses
                .slice(-30)
                .reduce((sum, e) => sum + e.amount, 0) / 30;

            tips.push({
                id: 'spending-average',
                type: 'info',
                title: '📊 Votre moyenne',
                message: `Vous dépensez en moyenne ${avgDailySpending.toFixed(2)}€ par jour`,
                action: 'view-trends',
                timestamp: today
            });
        }

        return tips;
    };

    const dismissAlert = (alertId) => {
        setAlerts(alerts.filter(alert => alert.id !== alertId));
        onDismiss?.(alertId);
    };

    const dismissNotification = (notificationId) => {
        setNotifications(notifications.filter(notif => notif.id !== notificationId));

        if (notificationId === 'daily-reminder') {
            localStorage.setItem('lastDailyReminder', new Date().toDateString());
        }
    };

    const handleAction = (action, data) => {
        switch (action) {
            case 'add-expense':
                // Rediriger vers le formulaire d'ajout de dépense
                window.location.href = '/form';
                break;
            case 'adjust-budget':
                // Rediriger vers les budgets
                window.location.href = '/budget';
                break;
            case 'view-expenses':
                // Rediriger vers les dépenses filtrées
                window.location.href = `/allSpend?category=${data}`;
                break;
            case 'view-report':
                // Ouvrir un rapport détaillé
                console.log('Afficher le rapport');
                break;
            default:
                console.log(`Action: ${action}`, data);
        }
    };

    const updateSettings = (newSettings) => {
        setSettings({ ...settings, ...newSettings });
        localStorage.setItem('smartAlertsSettings', JSON.stringify({ ...settings, ...newSettings }));
    };

    useEffect(() => {
        const savedSettings = localStorage.getItem('smartAlertsSettings');
        if (savedSettings) {
            setSettings(JSON.parse(savedSettings));
        }
    }, []);

    return (
        <div className="smart-alerts">
            {/* Alertes critiques */}
            {alerts.length > 0 && (
                <div className="alerts-section">
                    <h3>🚨 Alertes</h3>
                    <div className="alerts-list">
                        {alerts.map(alert => (
                            <AlertCard
                                key={alert.id}
                                alert={alert}
                                onDismiss={() => dismissAlert(alert.id)}
                                onAction={(action) => handleAction(action, alert.category)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Notifications */}
            {notifications.length > 0 && (
                <div className="notifications-section">
                    <h3>🔔 Notifications</h3>
                    <div className="notifications-list">
                        {notifications.map(notification => (
                            <NotificationCard
                                key={notification.id}
                                notification={notification}
                                onDismiss={() => dismissNotification(notification.id)}
                                onAction={(action) => handleAction(action)}
                            />
                        ))}
                    </div>
                </div>
            )}

            {/* Paramètres des alertes */}
            <AlertSettings settings={settings} onUpdate={updateSettings} />
        </div>
    );
};

const AlertCard = ({ alert, onDismiss, onAction }) => (
    <Card className={`alert-card alert-${alert.type}`}>
        <div className="alert-content">
            <h4>{alert.title}</h4>
            <p>{alert.message}</p>
        </div>
        <div className="alert-actions">
            {alert.action && (
                <Button
                    size="small"
                    variant="primary"
                    onClick={() => onAction(alert.action)}
                >
                    Voir
                </Button>
            )}
            <Button
                size="small"
                variant="ghost"
                onClick={onDismiss}
            >
                ✕
            </Button>
        </div>
    </Card>
);

const NotificationCard = ({ notification, onDismiss, onAction }) => (
    <Card className={`notification-card notification-${notification.type}`}>
        <div className="notification-content">
            <h4>{notification.title}</h4>
            <p>{notification.message}</p>
            {notification.timestamp && (
                <span className="notification-time">
                    {notification.timestamp.toLocaleTimeString()}
                </span>
            )}
        </div>
        <div className="notification-actions">
            {notification.action && (
                <Button
                    size="small"
                    variant="ghost"
                    onClick={() => onAction(notification.action)}
                >
                    Action
                </Button>
            )}
            <Button
                size="small"
                variant="ghost"
                onClick={onDismiss}
            >
                ✕
            </Button>
        </div>
    </Card>
);

const AlertSettings = ({ settings, onUpdate }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <div className="alert-settings">
            <Button
                variant="ghost"
                size="small"
                onClick={() => setIsOpen(!isOpen)}
            >
                ⚙️ Paramètres des alertes
            </Button>

            {isOpen && (
                <Card className="settings-panel">
                    <h4>Configuration des alertes</h4>

                    <div className="setting-item">
                        <label>Seuil d'alerte budget (%)</label>
                        <input
                            type="range"
                            min="50"
                            max="100"
                            value={settings.budgetWarning}
                            onChange={(e) => onUpdate({ budgetWarning: parseInt(e.target.value) })}
                        />
                        <span>{settings.budgetWarning}%</span>
                    </div>

                    <div className="setting-item">
                        <label>Seuil critique (%)</label>
                        <input
                            type="range"
                            min="80"
                            max="100"
                            value={settings.budgetCritical}
                            onChange={(e) => onUpdate({ budgetCritical: parseInt(e.target.value) })}
                        />
                        <span>{settings.budgetCritical}%</span>
                    </div>

                    <div className="setting-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.dailyReminder}
                                onChange={(e) => onUpdate({ dailyReminder: e.target.checked })}
                            />
                            Rappel quotidien
                        </label>
                    </div>

                    <div className="setting-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.weeklyReport}
                                onChange={(e) => onUpdate({ weeklyReport: e.target.checked })}
                            />
                            Rapport hebdomadaire
                        </label>
                    </div>

                    <div className="setting-item">
                        <label>
                            <input
                                type="checkbox"
                                checked={settings.unusualSpending}
                                onChange={(e) => onUpdate({ unusualSpending: e.target.checked })}
                            />
                            Détecter les dépenses inhabituelles
                        </label>
                    </div>
                </Card>
            )}
        </div>
    );
};

// Hook pour utiliser les alertes intelligentes
export const useSmartAlerts = (expenses, budgets) => {
    const [alerts, setAlerts] = useState([]);
    const [hasNewAlerts, setHasNewAlerts] = useState(false);

    useEffect(() => {
        // Simuler la génération d'alertes
        if (expenses.length > 0 || budgets.length > 0) {
            setHasNewAlerts(true);
        }
    }, [expenses, budgets]);

    const dismissAlert = (alertId) => {
        setAlerts(alerts.filter(alert => alert.id !== alertId));
    };

    return {
        alerts,
        hasNewAlerts,
        dismissAlert
    };
};

export default SmartAlerts;