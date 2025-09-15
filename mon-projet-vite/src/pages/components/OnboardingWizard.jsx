import React, { useState, useEffect } from 'react';
import { Button, Card, Input } from './ui';
import './css/onboarding.css';

const OnboardingWizard = ({ onComplete, onSkip }) => {
    const [currentStep, setCurrentStep] = useState(0);
    const [userData, setUserData] = useState({
        name: '',
        age: '',
        situation: '',
        monthlyIncome: '',
        budgetGoals: [],
        experience: ''
    });
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
    }, []);

    const steps = [
        {
            title: "Bienvenue ! 👋",
            subtitle: "Créons ensemble votre premier budget",
            component: WelcomeStep
        },
        {
            title: "Parlons de vous",
            subtitle: "Pour personnaliser votre expérience",
            component: ProfileStep
        },
        {
            title: "Vos revenus",
            subtitle: "Définissons votre budget mensuel",
            component: IncomeStep
        },
        {
            title: "Vos objectifs",
            subtitle: "Que souhaitez-vous accomplir ?",
            component: GoalsStep
        },
        {
            title: "Votre expérience",
            subtitle: "Quel est votre niveau ?",
            component: ExperienceStep
        },
        {
            title: "C'est parti ! 🚀",
            subtitle: "Votre budget est configuré",
            component: CompletionStep
        }
    ];

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            onComplete(userData);
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const updateUserData = (field, value) => {
        setUserData(prev => ({ ...prev, [field]: value }));
    };

    const CurrentStepComponent = steps[currentStep].component;

    return (
        <div className={`onboarding-overlay ${isVisible ? 'visible' : ''}`}>
            <div className="onboarding-container">
                <div className="onboarding-header">
                    <div className="progress-bar">
                        <div
                            className="progress-fill"
                            style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
                        />
                    </div>
                    <div className="step-indicator">
                        Étape {currentStep + 1} sur {steps.length}
                    </div>
                    <button className="skip-button" onClick={onSkip}>
                        Passer ⏭️
                    </button>
                </div>

                <div className="onboarding-content">
                    <h1>{steps[currentStep].title}</h1>
                    <p className="step-subtitle">{steps[currentStep].subtitle}</p>

                    <CurrentStepComponent
                        userData={userData}
                        updateUserData={updateUserData}
                        onNext={nextStep}
                        onPrev={prevStep}
                        canGoNext={currentStep === 0 || validateCurrentStep(currentStep, userData)}
                        isFirstStep={currentStep === 0}
                        isLastStep={currentStep === steps.length - 1}
                    />
                </div>
            </div>
        </div>
    );
};

// Étape de bienvenue
const WelcomeStep = ({ onNext, isFirstStep }) => (
    <div className="step-content welcome-step">
        <div className="welcome-icon">💰</div>
        <h2>Budget Manager pour débutants</h2>
        <p>
            Nous allons vous guider pas à pas pour créer votre premier budget personnalisé.
            Cela ne prendra que 3 minutes !
        </p>
        <ul className="benefits-list">
            <li>✅ Configuration guidée</li>
            <li>✅ Templates adaptés à votre situation</li>
            <li>✅ Conseils personnalisés</li>
            <li>✅ Objectifs réalisables</li>
        </ul>
        <div className="step-actions">
            <Button variant="primary" size="large" onClick={onNext}>
                Commencer 🚀
            </Button>
        </div>
    </div>
);

// Étape profil
const ProfileStep = ({ userData, updateUserData, onNext, onPrev, canGoNext }) => (
    <div className="step-content profile-step">
        <div className="form-group">
            <label>Comment vous appelez-vous ?</label>
            <Input
                type="text"
                placeholder="Votre prénom"
                value={userData.name}
                onChange={(e) => updateUserData('name', e.target.value)}
            />
        </div>

        <div className="form-group">
            <label>Votre âge</label>
            <select
                value={userData.age}
                onChange={(e) => updateUserData('age', e.target.value)}
                className="form-select"
            >
                <option value="">Choisissez</option>
                <option value="18-25">18-25 ans</option>
                <option value="26-35">26-35 ans</option>
                <option value="36-45">36-45 ans</option>
                <option value="46-55">46-55 ans</option>
                <option value="56+">56 ans et plus</option>
            </select>
        </div>

        <div className="form-group">
            <label>Votre situation</label>
            <div className="situation-cards">
                {[
                    { value: 'student', label: 'Étudiant', icon: '🎓' },
                    { value: 'young-professional', label: 'Jeune actif', icon: '💼' },
                    { value: 'family', label: 'En famille', icon: '👨‍👩‍👧‍👦' },
                    { value: 'retired', label: 'Retraité', icon: '🌅' }
                ].map(situation => (
                    <Card
                        key={situation.value}
                        className={`situation-card ${userData.situation === situation.value ? 'selected' : ''}`}
                        onClick={() => updateUserData('situation', situation.value)}
                        hoverable
                    >
                        <div className="situation-icon">{situation.icon}</div>
                        <div className="situation-label">{situation.label}</div>
                    </Card>
                ))}
            </div>
        </div>

        <div className="step-actions">
            <Button variant="secondary" onClick={onPrev}>
                Précédent
            </Button>
            <Button
                variant="primary"
                onClick={onNext}
                disabled={!canGoNext}
            >
                Suivant
            </Button>
        </div>
    </div>
);

// Étape revenus
const IncomeStep = ({ userData, updateUserData, onNext, onPrev, canGoNext }) => (
    <div className="step-content income-step">
        <div className="form-group">
            <label>Vos revenus mensuels nets</label>
            <div className="income-input-group">
                <Input
                    type="number"
                    placeholder="0"
                    value={userData.monthlyIncome}
                    onChange={(e) => updateUserData('monthlyIncome', e.target.value)}
                />
                <span className="currency">€</span>
            </div>
            <small className="help-text">
                💡 Incluez tous vos revenus : salaire, allocations, revenus complémentaires...
            </small>
        </div>

        {userData.monthlyIncome && (
            <Card className="income-breakdown">
                <h3>Répartition recommandée</h3>
                <div className="breakdown-item">
                    <span>🏠 Logement & charges (30%)</span>
                    <span>{Math.round(userData.monthlyIncome * 0.3)}€</span>
                </div>
                <div className="breakdown-item">
                    <span>🍕 Alimentation (15%)</span>
                    <span>{Math.round(userData.monthlyIncome * 0.15)}€</span>
                </div>
                <div className="breakdown-item">
                    <span>🚗 Transport (10%)</span>
                    <span>{Math.round(userData.monthlyIncome * 0.1)}€</span>
                </div>
                <div className="breakdown-item">
                    <span>🎯 Épargne (20%)</span>
                    <span>{Math.round(userData.monthlyIncome * 0.2)}€</span>
                </div>
                <div className="breakdown-item">
                    <span>🎊 Loisirs (25%)</span>
                    <span>{Math.round(userData.monthlyIncome * 0.25)}€</span>
                </div>
            </Card>
        )}

        <div className="step-actions">
            <Button variant="secondary" onClick={onPrev}>
                Précédent
            </Button>
            <Button
                variant="primary"
                onClick={onNext}
                disabled={!canGoNext}
            >
                Suivant
            </Button>
        </div>
    </div>
);

// Étape objectifs
const GoalsStep = ({ userData, updateUserData, onNext, onPrev }) => {
    const goalOptions = [
        { id: 'save', label: 'Économiser pour un projet', icon: '💰' },
        { id: 'control', label: 'Contrôler mes dépenses', icon: '📊' },
        { id: 'emergency', label: 'Créer un fonds d\'urgence', icon: '🆘' },
        { id: 'debt', label: 'Rembourser des dettes', icon: '💳' },
        { id: 'invest', label: 'Commencer à investir', icon: '📈' },
        { id: 'vacation', label: 'Économiser pour les vacances', icon: '✈️' }
    ];

    const toggleGoal = (goalId) => {
        const currentGoals = userData.budgetGoals || [];
        if (currentGoals.includes(goalId)) {
            updateUserData('budgetGoals', currentGoals.filter(g => g !== goalId));
        } else {
            updateUserData('budgetGoals', [...currentGoals, goalId]);
        }
    };

    return (
        <div className="step-content goals-step">
            <p>Sélectionnez vos objectifs (plusieurs choix possibles) :</p>

            <div className="goals-grid">
                {goalOptions.map(goal => (
                    <Card
                        key={goal.id}
                        className={`goal-card ${(userData.budgetGoals || []).includes(goal.id) ? 'selected' : ''}`}
                        onClick={() => toggleGoal(goal.id)}
                        hoverable
                    >
                        <div className="goal-icon">{goal.icon}</div>
                        <div className="goal-label">{goal.label}</div>
                    </Card>
                ))}
            </div>

            <div className="step-actions">
                <Button variant="secondary" onClick={onPrev}>
                    Précédent
                </Button>
                <Button variant="primary" onClick={onNext}>
                    Suivant
                </Button>
            </div>
        </div>
    );
};

// Étape expérience
const ExperienceStep = ({ userData, updateUserData, onNext, onPrev, canGoNext }) => (
    <div className="step-content experience-step">
        <p>Quel est votre niveau en gestion de budget ?</p>

        <div className="experience-options">
            {[
                {
                    value: 'beginner',
                    label: 'Débutant complet',
                    icon: '🌱',
                    description: 'Je n\'ai jamais fait de budget'
                },
                {
                    value: 'some-experience',
                    label: 'Quelques notions',
                    icon: '🌿',
                    description: 'J\'ai essayé mais sans succès'
                },
                {
                    value: 'intermediate',
                    label: 'Niveau intermédiaire',
                    icon: '🌳',
                    description: 'Je gère déjà un peu mes finances'
                }
            ].map(exp => (
                <Card
                    key={exp.value}
                    className={`experience-card ${userData.experience === exp.value ? 'selected' : ''}`}
                    onClick={() => updateUserData('experience', exp.value)}
                    hoverable
                >
                    <div className="experience-icon">{exp.icon}</div>
                    <div className="experience-content">
                        <h3>{exp.label}</h3>
                        <p>{exp.description}</p>
                    </div>
                </Card>
            ))}
        </div>

        <div className="step-actions">
            <Button variant="secondary" onClick={onPrev}>
                Précédent
            </Button>
            <Button
                variant="primary"
                onClick={onNext}
                disabled={!canGoNext}
            >
                Suivant
            </Button>
        </div>
    </div>
);

// Étape finale
const CompletionStep = ({ userData, onNext }) => (
    <div className="step-content completion-step">
        <div className="completion-icon">🎉</div>
        <h2>Félicitations {userData.name} !</h2>
        <p>Votre budget personnalisé est prêt.</p>

        <Card className="summary-card">
            <h3>Récapitulatif de votre profil :</h3>
            <div className="summary-item">
                <span>📋 Situation :</span>
                <span>{getSituationLabel(userData.situation)}</span>
            </div>
            <div className="summary-item">
                <span>💰 Budget mensuel :</span>
                <span>{userData.monthlyIncome}€</span>
            </div>
            <div className="summary-item">
                <span>🎯 Objectifs :</span>
                <span>{userData.budgetGoals?.length || 0} objectif(s)</span>
            </div>
            <div className="summary-item">
                <span>📈 Niveau :</span>
                <span>{getExperienceLabel(userData.experience)}</span>
            </div>
        </Card>

        <div className="next-steps">
            <h3>Vos prochaines étapes :</h3>
            <ul>
                <li>✅ Découvrir votre tableau de bord personnalisé</li>
                <li>📚 Suivre le tutoriel interactif</li>
                <li>💰 Créer vos premières catégories de dépenses</li>
                <li>🎯 Définir vos premiers objectifs d'épargne</li>
            </ul>
        </div>

        <div className="step-actions">
            <Button variant="primary" size="large" onClick={onNext}>
                Accéder à mon tableau de bord 🚀
            </Button>
        </div>
    </div>
);

// Fonctions utilitaires
const validateCurrentStep = (step, userData) => {
    switch (step) {
        case 1: return userData.name && userData.age && userData.situation;
        case 2: return userData.monthlyIncome && userData.monthlyIncome > 0;
        case 4: return userData.experience;
        default: return true;
    }
};

const getSituationLabel = (situation) => {
    const labels = {
        'student': 'Étudiant',
        'young-professional': 'Jeune actif',
        'family': 'En famille',
        'retired': 'Retraité'
    };
    return labels[situation] || situation;
};

const getExperienceLabel = (experience) => {
    const labels = {
        'beginner': 'Débutant complet',
        'some-experience': 'Quelques notions',
        'intermediate': 'Niveau intermédiaire'
    };
    return labels[experience] || experience;
};

export default OnboardingWizard;