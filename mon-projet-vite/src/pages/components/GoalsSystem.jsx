import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from './ui';
import './css/goals-system.css';

const GoalsSystem = ({ onGoalComplete, expenses = [] }) => {
    const [goals, setGoals] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [newGoal, setNewGoal] = useState({
        title: '',
        description: '',
        targetAmount: '',
        currentAmount: 0,
        targetDate: '',
        category: 'savings',
        priority: 'medium',
        icon: '🎯'
    });

    const goalCategories = {
        savings: { label: 'Épargne', icon: '💰', color: '#48bb78' },
        travel: { label: 'Voyage', icon: '✈️', color: '#4299e1' },
        purchase: { label: 'Achat', icon: '🛍️', color: '#ed8936' },
        emergency: { label: 'Urgence', icon: '🆘', color: '#e53e3e' },
        investment: { label: 'Investissement', icon: '📈', color: '#805ad5' },
        education: { label: 'Formation', icon: '📚', color: '#38b2ac' },
        health: { label: 'Santé', icon: '🏥', color: '#f56565' },
        home: { label: 'Maison', icon: '🏠', color: '#4fd1c7' }
    };

    const priorityLevels = {
        low: { label: 'Faible', color: '#a0aec0' },
        medium: { label: 'Moyenne', color: '#4299e1' },
        high: { label: 'Haute', color: '#ed8936' },
        urgent: { label: 'Urgente', color: '#e53e3e' }
    };

    useEffect(() => {
        loadGoals();
    }, []);

    useEffect(() => {
        saveGoals();
    }, [goals]);

    const loadGoals = () => {
        const savedGoals = localStorage.getItem('userGoals');
        if (savedGoals) {
            const parsedGoals = JSON.parse(savedGoals);
            setGoals(parsedGoals.map(goal => ({
                ...goal,
                targetDate: new Date(goal.targetDate),
                createdAt: new Date(goal.createdAt)
            })));
        } else {
            // Créer des objectifs d'exemple pour les débutants
            createDefaultGoals();
        }
    };

    const saveGoals = () => {
        if (goals.length > 0) {
            localStorage.setItem('userGoals', JSON.stringify(goals));
        }
    };

    const createDefaultGoals = () => {
        const defaultGoals = [
            {
                id: 'emergency-fund',
                title: 'Fonds d\'urgence',
                description: 'Économiser l\'équivalent de 3 mois de charges',
                targetAmount: 3000,
                currentAmount: 0,
                targetDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // Dans 1 an
                category: 'emergency',
                priority: 'high',
                icon: '🆘',
                createdAt: new Date(),
                milestones: [
                    { amount: 500, title: 'Premier palier', completed: false },
                    { amount: 1000, title: 'Un mois de charges', completed: false },
                    { amount: 2000, title: 'Deux mois de charges', completed: false },
                    { amount: 3000, title: 'Objectif atteint !', completed: false }
                ]
            },
            {
                id: 'vacation-savings',
                title: 'Vacances d\'été',
                description: 'Budget pour les vacances de l\'année prochaine',
                targetAmount: 1500,
                currentAmount: 0,
                targetDate: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000), // Dans 6 mois
                category: 'travel',
                priority: 'medium',
                icon: '✈️',
                createdAt: new Date(),
                milestones: [
                    { amount: 375, title: 'Premier quart', completed: false },
                    { amount: 750, title: 'À mi-chemin', completed: false },
                    { amount: 1125, title: 'Trois quarts', completed: false },
                    { amount: 1500, title: 'Objectif atteint !', completed: false }
                ]
            }
        ];

        setGoals(defaultGoals);
    };

    const addGoal = () => {
        if (!newGoal.title || !newGoal.targetAmount || !newGoal.targetDate) return;

        const goal = {
            id: Date.now().toString(),
            ...newGoal,
            targetAmount: parseFloat(newGoal.targetAmount),
            currentAmount: 0,
            targetDate: new Date(newGoal.targetDate),
            createdAt: new Date(),
            milestones: generateMilestones(parseFloat(newGoal.targetAmount))
        };

        setGoals([...goals, goal]);
        setNewGoal({
            title: '',
            description: '',
            targetAmount: '',
            currentAmount: 0,
            targetDate: '',
            category: 'savings',
            priority: 'medium',
            icon: '🎯'
        });
        setShowAddForm(false);
    };

    const generateMilestones = (targetAmount) => {
        const milestones = [];
        const steps = [0.25, 0.5, 0.75, 1];

        steps.forEach((step, index) => {
            milestones.push({
                amount: Math.round(targetAmount * step),
                title: step === 1 ? 'Objectif atteint !' :
                       step === 0.75 ? 'Trois quarts' :
                       step === 0.5 ? 'À mi-chemin' : 'Premier quart',
                completed: false
            });
        });

        return milestones;
    };

    const updateGoalProgress = (goalId, newAmount) => {
        setGoals(goals.map(goal => {
            if (goal.id === goalId) {
                const updatedGoal = {
                    ...goal,
                    currentAmount: Math.max(0, Math.min(newAmount, goal.targetAmount))
                };

                // Mettre à jour les milestones
                updatedGoal.milestones = goal.milestones.map(milestone => ({
                    ...milestone,
                    completed: updatedGoal.currentAmount >= milestone.amount
                }));

                // Vérifier si l'objectif est complété
                if (updatedGoal.currentAmount >= updatedGoal.targetAmount && goal.currentAmount < goal.targetAmount) {
                    onGoalComplete?.(updatedGoal);
                    showCelebration(updatedGoal);
                }

                return updatedGoal;
            }
            return goal;
        }));
    };

    const deleteGoal = (goalId) => {
        setGoals(goals.filter(goal => goal.id !== goalId));
    };

    const showCelebration = (goal) => {
        // Animation de célébration
        const celebration = document.createElement('div');
        celebration.className = 'goal-celebration';
        celebration.innerHTML = `
            <div class="celebration-content">
                <div class="celebration-icon">🎉</div>
                <h3>Félicitations !</h3>
                <p>Vous avez atteint votre objectif "${goal.title}" !</p>
                <div class="celebration-amount">${goal.targetAmount}€</div>
            </div>
        `;
        document.body.appendChild(celebration);

        setTimeout(() => {
            celebration.remove();
        }, 5000);
    };

    const getGoalProgress = (goal) => {
        return Math.min((goal.currentAmount / goal.targetAmount) * 100, 100);
    };

    const getDaysRemaining = (targetDate) => {
        const today = new Date();
        const diffTime = targetDate - today;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return Math.max(0, diffDays);
    };

    const getGoalStatus = (goal) => {
        const progress = getGoalProgress(goal);
        const daysRemaining = getDaysRemaining(goal.targetDate);

        if (progress >= 100) return 'completed';
        if (daysRemaining === 0) return 'overdue';
        if (daysRemaining <= 30) return 'urgent';
        if (progress >= 75) return 'on-track';
        if (progress >= 25) return 'in-progress';
        return 'started';
    };

    const sortedGoals = [...goals].sort((a, b) => {
        const priorityOrder = { urgent: 4, high: 3, medium: 2, low: 1 };
        const statusOrder = { overdue: 5, urgent: 4, 'in-progress': 3, 'on-track': 2, started: 1, completed: 0 };

        const priorityDiff = priorityOrder[b.priority] - priorityOrder[a.priority];
        if (priorityDiff !== 0) return priorityDiff;

        return statusOrder[getGoalStatus(b)] - statusOrder[getGoalStatus(a)];
    });

    return (
        <div className="goals-system">
            <div className="goals-header">
                <div className="goals-title">
                    <h2>🎯 Mes Objectifs</h2>
                    <p>Suivez vos progrès et atteignez vos objectifs financiers</p>
                </div>
                <Button
                    variant="primary"
                    onClick={() => setShowAddForm(true)}
                    icon={<span>➕</span>}
                >
                    Nouvel objectif
                </Button>
            </div>

            {goals.length === 0 ? (
                <div className="empty-goals">
                    <div className="empty-icon">🎯</div>
                    <h3>Aucun objectif défini</h3>
                    <p>Créez votre premier objectif financier pour commencer à épargner efficacement</p>
                    <Button variant="primary" onClick={() => setShowAddForm(true)}>
                        Créer mon premier objectif
                    </Button>
                </div>
            ) : (
                <>
                    <GoalsOverview goals={goals} />
                    <div className="goals-list">
                        {sortedGoals.map(goal => (
                            <GoalCard
                                key={goal.id}
                                goal={goal}
                                progress={getGoalProgress(goal)}
                                status={getGoalStatus(goal)}
                                daysRemaining={getDaysRemaining(goal.targetDate)}
                                categories={goalCategories}
                                priorities={priorityLevels}
                                onUpdateProgress={updateGoalProgress}
                                onDelete={deleteGoal}
                            />
                        ))}
                    </div>
                </>
            )}

            {showAddForm && (
                <GoalForm
                    goal={newGoal}
                    onChange={setNewGoal}
                    categories={goalCategories}
                    priorities={priorityLevels}
                    onSave={addGoal}
                    onCancel={() => setShowAddForm(false)}
                />
            )}
        </div>
    );
};

const GoalsOverview = ({ goals }) => {
    const completedGoals = goals.filter(goal => goal.currentAmount >= goal.targetAmount).length;
    const totalSaved = goals.reduce((sum, goal) => sum + goal.currentAmount, 0);
    const totalTarget = goals.reduce((sum, goal) => sum + goal.targetAmount, 0);
    const overallProgress = totalTarget > 0 ? (totalSaved / totalTarget) * 100 : 0;

    return (
        <div className="goals-overview">
            <div className="overview-stats">
                <div className="stat-card">
                    <div className="stat-value">{completedGoals}</div>
                    <div className="stat-label">Objectifs atteints</div>
                    <div className="stat-icon">🏆</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{totalSaved.toLocaleString()}€</div>
                    <div className="stat-label">Total épargné</div>
                    <div className="stat-icon">💰</div>
                </div>
                <div className="stat-card">
                    <div className="stat-value">{overallProgress.toFixed(0)}%</div>
                    <div className="stat-label">Progression globale</div>
                    <div className="stat-icon">📊</div>
                </div>
            </div>
            <div className="overall-progress">
                <div className="progress-bar-container">
                    <div className="progress-bar-label">
                        <span>Progression globale</span>
                        <span>{totalSaved.toLocaleString()}€ / {totalTarget.toLocaleString()}€</span>
                    </div>
                    <div className="progress-bar">
                        <div
                            className="progress-fill overall"
                            style={{ width: `${overallProgress}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    );
};

const GoalCard = ({
    goal,
    progress,
    status,
    daysRemaining,
    categories,
    priorities,
    onUpdateProgress,
    onDelete
}) => {
    const [showDetails, setShowDetails] = useState(false);
    const [editAmount, setEditAmount] = useState('');

    const category = categories[goal.category];
    const priority = priorities[goal.priority];

    const handleAmountUpdate = () => {
        if (editAmount !== '') {
            onUpdateProgress(goal.id, parseFloat(editAmount));
            setEditAmount('');
        }
    };

    return (
        <Card className={`goal-card status-${status}`}>
            <div className="goal-header">
                <div className="goal-info">
                    <div className="goal-category">
                        <span className="category-icon">{category.icon}</span>
                        <span className="category-label">{category.label}</span>
                        <span className={`priority-badge priority-${goal.priority}`}>
                            {priority.label}
                        </span>
                    </div>
                    <h3>{goal.title}</h3>
                    <p>{goal.description}</p>
                </div>
                <div className="goal-amount">
                    <div className="current-amount">{goal.currentAmount.toLocaleString()}€</div>
                    <div className="target-amount">/ {goal.targetAmount.toLocaleString()}€</div>
                </div>
            </div>

            <div className="goal-progress">
                <div className="progress-bar-container">
                    <div className="progress-bar">
                        <div
                            className={`progress-fill ${status}`}
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                    <div className="progress-percentage">{progress.toFixed(1)}%</div>
                </div>

                <div className="goal-meta">
                    <div className="days-remaining">
                        {daysRemaining > 0 ? (
                            <span>📅 {daysRemaining} jour(s) restant(s)</span>
                        ) : status === 'completed' ? (
                            <span className="completed-badge">✅ Objectif atteint !</span>
                        ) : (
                            <span className="overdue-badge">⏰ Échéance dépassée</span>
                        )}
                    </div>
                    <div className="remaining-amount">
                        Il reste {(goal.targetAmount - goal.currentAmount).toLocaleString()}€
                    </div>
                </div>
            </div>

            {goal.milestones && (
                <div className="milestones">
                    <h4>🏁 Étapes clés</h4>
                    <div className="milestones-list">
                        {goal.milestones.map((milestone, index) => (
                            <div
                                key={index}
                                className={`milestone ${milestone.completed ? 'completed' : ''}`}
                            >
                                <div className="milestone-icon">
                                    {milestone.completed ? '✅' : '⭕'}
                                </div>
                                <div className="milestone-info">
                                    <span className="milestone-title">{milestone.title}</span>
                                    <span className="milestone-amount">{milestone.amount}€</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            <div className="goal-actions">
                <div className="amount-update">
                    <Input
                        type="number"
                        placeholder="Montant"
                        value={editAmount}
                        onChange={(e) => setEditAmount(e.target.value)}
                        size="small"
                    />
                    <Button
                        size="small"
                        variant="primary"
                        onClick={handleAmountUpdate}
                        disabled={!editAmount}
                    >
                        Ajouter
                    </Button>
                </div>
                <div className="goal-controls">
                    <Button
                        size="small"
                        variant="ghost"
                        onClick={() => setShowDetails(!showDetails)}
                    >
                        {showDetails ? 'Moins' : 'Plus'}
                    </Button>
                    <Button
                        size="small"
                        variant="ghost"
                        onClick={() => onDelete(goal.id)}
                        className="delete-button"
                    >
                        🗑️
                    </Button>
                </div>
            </div>

            {showDetails && (
                <div className="goal-details">
                    <div className="detail-item">
                        <span>📅 Date de création :</span>
                        <span>{goal.createdAt.toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                        <span>🎯 Date cible :</span>
                        <span>{goal.targetDate.toLocaleDateString()}</span>
                    </div>
                    <div className="detail-item">
                        <span>💰 Montant par jour :</span>
                        <span>
                            {daysRemaining > 0 ?
                                ((goal.targetAmount - goal.currentAmount) / daysRemaining).toFixed(2)
                                : 0
                            }€
                        </span>
                    </div>
                </div>
            )}
        </Card>
    );
};

const GoalForm = ({ goal, onChange, categories, priorities, onSave, onCancel }) => (
    <div className="goal-form-overlay">
        <Card className="goal-form">
            <div className="form-header">
                <h3>🎯 Nouvel objectif</h3>
                <button className="close-button" onClick={onCancel}>✕</button>
            </div>

            <div className="form-content">
                <div className="form-group">
                    <label>Titre de l'objectif</label>
                    <Input
                        value={goal.title}
                        onChange={(e) => onChange({ ...goal, title: e.target.value })}
                        placeholder="Ex: Vacances d'été, Nouvelle voiture..."
                    />
                </div>

                <div className="form-group">
                    <label>Description</label>
                    <Input
                        value={goal.description}
                        onChange={(e) => onChange({ ...goal, description: e.target.value })}
                        placeholder="Décrivez votre objectif..."
                    />
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Montant cible (€)</label>
                        <Input
                            type="number"
                            value={goal.targetAmount}
                            onChange={(e) => onChange({ ...goal, targetAmount: e.target.value })}
                            placeholder="0"
                        />
                    </div>
                    <div className="form-group">
                        <label>Date limite</label>
                        <Input
                            type="date"
                            value={goal.targetDate}
                            onChange={(e) => onChange({ ...goal, targetDate: e.target.value })}
                        />
                    </div>
                </div>

                <div className="form-row">
                    <div className="form-group">
                        <label>Catégorie</label>
                        <select
                            value={goal.category}
                            onChange={(e) => onChange({ ...goal, category: e.target.value })}
                            className="form-select"
                        >
                            {Object.entries(categories).map(([key, cat]) => (
                                <option key={key} value={key}>
                                    {cat.icon} {cat.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="form-group">
                        <label>Priorité</label>
                        <select
                            value={goal.priority}
                            onChange={(e) => onChange({ ...goal, priority: e.target.value })}
                            className="form-select"
                        >
                            {Object.entries(priorities).map(([key, priority]) => (
                                <option key={key} value={key}>
                                    {priority.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
            </div>

            <div className="form-actions">
                <Button variant="secondary" onClick={onCancel}>
                    Annuler
                </Button>
                <Button variant="primary" onClick={onSave}>
                    Créer l'objectif
                </Button>
            </div>
        </Card>
    </div>
);

export default GoalsSystem;