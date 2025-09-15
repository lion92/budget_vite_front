import React, { useState, useEffect } from 'react';
import { Button, Card } from './ui';
import './css/tutorial.css';

const TutorialSystem = ({ isVisible, onClose, currentPage }) => {
    const [currentTutorial, setCurrentTutorial] = useState(null);
    const [currentStep, setCurrentStep] = useState(0);
    const [completedTutorials, setCompletedTutorials] = useState([]);

    const tutorials = {
        'dashboard': {
            title: 'Découvrez votre tableau de bord',
            description: 'Apprenez à naviguer dans votre espace personnel',
            steps: [
                {
                    title: 'Bienvenue sur votre tableau de bord ! 👋',
                    content: 'C\'est ici que vous pouvez voir un aperçu de vos finances. Regardez en haut à gauche, vous verrez votre solde actuel.',
                    target: '.balance-overview',
                    position: 'bottom'
                },
                {
                    title: 'Vos dépenses du mois',
                    content: 'Ce graphique vous montre vos dépenses par catégorie. Plus une tranche est grande, plus vous dépensez dans cette catégorie.',
                    target: '.expense-chart',
                    position: 'right'
                },
                {
                    title: 'Actions rapides',
                    content: 'Utilisez ces boutons pour ajouter rapidement une dépense ou un revenu.',
                    target: '.quick-actions',
                    position: 'top'
                }
            ]
        },
        'budget': {
            title: 'Créer votre premier budget',
            description: 'Définissez vos limites de dépenses par catégorie',
            steps: [
                {
                    title: 'Créons votre budget ! 💰',
                    content: 'Un budget vous aide à contrôler vos dépenses. Commençons par définir combien vous voulez dépenser par catégorie.',
                    target: '.budget-form',
                    position: 'top'
                },
                {
                    title: 'Choisissez une catégorie',
                    content: 'Sélectionnez une catégorie de dépense (ex: Alimentation, Transport, Loisirs).',
                    target: '.category-selector',
                    position: 'bottom'
                },
                {
                    title: 'Définissez un montant',
                    content: 'Entrez le montant maximum que vous voulez dépenser dans cette catégorie ce mois-ci.',
                    target: '.amount-input',
                    position: 'top'
                },
                {
                    title: 'Sauvegardez votre budget',
                    content: 'Cliquez sur "Ajouter" pour enregistrer cette limite de budget.',
                    target: '.save-button',
                    position: 'top'
                }
            ]
        },
        'expenses': {
            title: 'Enregistrer vos dépenses',
            description: 'Suivez vos dépenses au quotidien',
            steps: [
                {
                    title: 'Ajoutons une dépense ! 🧾',
                    content: 'Pour bien suivre vos finances, il faut enregistrer chaque dépense. C\'est plus facile que vous ne le pensez !',
                    target: '.expense-form',
                    position: 'top'
                },
                {
                    title: 'Le montant dépensé',
                    content: 'Entrez le montant exact que vous avez dépensé.',
                    target: '.expense-amount',
                    position: 'bottom'
                },
                {
                    title: 'Dans quelle catégorie ?',
                    content: 'Choisissez la catégorie qui correspond à votre dépense.',
                    target: '.expense-category',
                    position: 'top'
                },
                {
                    title: 'Ajoutez une description',
                    content: 'Une petite description vous aidera à vous rappeler de cette dépense plus tard.',
                    target: '.expense-description',
                    position: 'bottom'
                },
                {
                    title: 'Enregistrez !',
                    content: 'Cliquez sur "Ajouter" pour enregistrer votre dépense.',
                    target: '.add-expense-button',
                    position: 'top'
                }
            ]
        },
        'categories': {
            title: 'Organiser vos catégories',
            description: 'Créez et gérez vos catégories de dépenses',
            steps: [
                {
                    title: 'Les catégories, c\'est quoi ? 📂',
                    content: 'Les catégories vous aident à organiser vos dépenses : Alimentation, Transport, Loisirs, etc.',
                    target: '.categories-list',
                    position: 'right'
                },
                {
                    title: 'Créer une nouvelle catégorie',
                    content: 'Cliquez ici pour créer une nouvelle catégorie personnalisée.',
                    target: '.add-category-button',
                    position: 'bottom'
                },
                {
                    title: 'Choisissez un nom',
                    content: 'Donnez un nom clair à votre catégorie (ex: "Restaurants", "Essence", "Netflix").',
                    target: '.category-name-input',
                    position: 'top'
                },
                {
                    title: 'Sélectionnez une couleur',
                    content: 'Choisissez une couleur pour identifier facilement cette catégorie dans vos graphiques.',
                    target: '.color-picker',
                    position: 'left'
                }
            ]
        }
    };

    useEffect(() => {
        const completed = JSON.parse(localStorage.getItem('completedTutorials') || '[]');
        setCompletedTutorials(completed);
    }, []);

    useEffect(() => {
        if (currentPage && tutorials[currentPage] && !completedTutorials.includes(currentPage)) {
            setCurrentTutorial(currentPage);
            setCurrentStep(0);
        }
    }, [currentPage, completedTutorials]);

    const nextStep = () => {
        if (currentTutorial && currentStep < tutorials[currentTutorial].steps.length - 1) {
            setCurrentStep(currentStep + 1);
        } else {
            completeTutorial();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(currentStep - 1);
        }
    };

    const completeTutorial = () => {
        if (currentTutorial) {
            const newCompleted = [...completedTutorials, currentTutorial];
            setCompletedTutorials(newCompleted);
            localStorage.setItem('completedTutorials', JSON.stringify(newCompleted));
            setCurrentTutorial(null);
            setCurrentStep(0);
            onClose?.();
        }
    };

    const skipTutorial = () => {
        setCurrentTutorial(null);
        setCurrentStep(0);
        onClose?.();
    };

    const startTutorial = (tutorialId) => {
        setCurrentTutorial(tutorialId);
        setCurrentStep(0);
    };

    if (!isVisible) return null;

    if (!currentTutorial) {
        return <TutorialMenu tutorials={tutorials} onStartTutorial={startTutorial} completedTutorials={completedTutorials} onClose={onClose} />;
    }

    const tutorial = tutorials[currentTutorial];
    const step = tutorial.steps[currentStep];

    return (
        <>
            <TutorialOverlay />
            <TutorialPopup
                step={step}
                currentStep={currentStep + 1}
                totalSteps={tutorial.steps.length}
                onNext={nextStep}
                onPrev={prevStep}
                onSkip={skipTutorial}
                isFirstStep={currentStep === 0}
                isLastStep={currentStep === tutorial.steps.length - 1}
            />
        </>
    );
};

const TutorialMenu = ({ tutorials, onStartTutorial, completedTutorials, onClose }) => (
    <div className="tutorial-menu-overlay">
        <div className="tutorial-menu">
            <div className="tutorial-menu-header">
                <h2>🎓 Centre d'apprentissage</h2>
                <p>Maîtrisez Budget Manager avec nos tutoriels interactifs</p>
                <button className="close-button" onClick={onClose}>✕</button>
            </div>

            <div className="tutorial-list">
                {Object.entries(tutorials).map(([id, tutorial]) => {
                    const isCompleted = completedTutorials.includes(id);
                    return (
                        <Card
                            key={id}
                            className={`tutorial-card ${isCompleted ? 'completed' : ''}`}
                            hoverable
                            onClick={() => onStartTutorial(id)}
                        >
                            <div className="tutorial-card-content">
                                <div className="tutorial-status">
                                    {isCompleted ? '✅' : '📚'}
                                </div>
                                <div className="tutorial-info">
                                    <h3>{tutorial.title}</h3>
                                    <p>{tutorial.description}</p>
                                    <div className="tutorial-meta">
                                        <span>{tutorial.steps.length} étapes</span>
                                        {isCompleted && <span className="completed-badge">Terminé</span>}
                                    </div>
                                </div>
                                <div className="tutorial-action">
                                    <Button size="small" variant={isCompleted ? 'secondary' : 'primary'}>
                                        {isCompleted ? 'Revoir' : 'Commencer'}
                                    </Button>
                                </div>
                            </div>
                        </Card>
                    );
                })}
            </div>

            <div className="tutorial-menu-footer">
                <div className="progress-overview">
                    <span>Progression : {completedTutorials.length}/{Object.keys(tutorials).length} tutoriels terminés</span>
                    <div className="global-progress-bar">
                        <div
                            className="global-progress-fill"
                            style={{ width: `${(completedTutorials.length / Object.keys(tutorials).length) * 100}%` }}
                        />
                    </div>
                </div>
            </div>
        </div>
    </div>
);

const TutorialOverlay = () => (
    <div className="tutorial-overlay" />
);

const TutorialPopup = ({
    step,
    currentStep,
    totalSteps,
    onNext,
    onPrev,
    onSkip,
    isFirstStep,
    isLastStep
}) => {
    const [position, setPosition] = useState({ top: '50%', left: '50%' });

    useEffect(() => {
        if (step.target) {
            const targetElement = document.querySelector(step.target);
            if (targetElement) {
                const rect = targetElement.getBoundingClientRect();
                const popupWidth = 350;
                const popupHeight = 200;

                let newPosition = { top: '50%', left: '50%' };

                switch (step.position) {
                    case 'top':
                        newPosition = {
                            top: rect.top - popupHeight - 20,
                            left: rect.left + (rect.width / 2) - (popupWidth / 2)
                        };
                        break;
                    case 'bottom':
                        newPosition = {
                            top: rect.bottom + 20,
                            left: rect.left + (rect.width / 2) - (popupWidth / 2)
                        };
                        break;
                    case 'left':
                        newPosition = {
                            top: rect.top + (rect.height / 2) - (popupHeight / 2),
                            left: rect.left - popupWidth - 20
                        };
                        break;
                    case 'right':
                        newPosition = {
                            top: rect.top + (rect.height / 2) - (popupHeight / 2),
                            left: rect.right + 20
                        };
                        break;
                }

                // Ajuster si la popup sort de l'écran
                if (newPosition.left < 20) newPosition.left = 20;
                if (newPosition.left + popupWidth > window.innerWidth - 20) {
                    newPosition.left = window.innerWidth - popupWidth - 20;
                }
                if (newPosition.top < 20) newPosition.top = 20;
                if (newPosition.top + popupHeight > window.innerHeight - 20) {
                    newPosition.top = window.innerHeight - popupHeight - 20;
                }

                setPosition(newPosition);

                // Highlight de l'élément cible
                targetElement.classList.add('tutorial-highlight');
                return () => targetElement.classList.remove('tutorial-highlight');
            }
        }
    }, [step]);

    return (
        <div
            className="tutorial-popup"
            style={{
                position: 'fixed',
                top: typeof position.top === 'number' ? `${position.top}px` : position.top,
                left: typeof position.left === 'number' ? `${position.left}px` : position.left,
                transform: typeof position.top === 'string' ? 'translate(-50%, -50%)' : 'none'
            }}
        >
            <div className="tutorial-popup-header">
                <div className="step-counter">
                    Étape {currentStep} sur {totalSteps}
                </div>
                <button className="skip-button" onClick={onSkip}>
                    Passer
                </button>
            </div>

            <div className="tutorial-popup-content">
                <h3>{step.title}</h3>
                <p>{step.content}</p>
            </div>

            <div className="tutorial-popup-footer">
                <div className="step-indicators">
                    {Array.from({ length: totalSteps }, (_, i) => (
                        <div
                            key={i}
                            className={`step-dot ${i + 1 <= currentStep ? 'active' : ''}`}
                        />
                    ))}
                </div>

                <div className="tutorial-actions">
                    {!isFirstStep && (
                        <Button variant="secondary" size="small" onClick={onPrev}>
                            Précédent
                        </Button>
                    )}
                    <Button variant="primary" size="small" onClick={onNext}>
                        {isLastStep ? 'Terminer' : 'Suivant'}
                    </Button>
                </div>
            </div>
        </div>
    );
};

// Hook pour utiliser le système de tutoriels
export const useTutorial = () => {
    const [isTutorialVisible, setIsTutorialVisible] = useState(false);
    const [currentPage, setCurrentPage] = useState(null);

    const startTutorial = (page) => {
        setCurrentPage(page);
        setIsTutorialVisible(true);
    };

    const closeTutorial = () => {
        setIsTutorialVisible(false);
        setCurrentPage(null);
    };

    const TutorialComponent = () => (
        <TutorialSystem
            isVisible={isTutorialVisible}
            onClose={closeTutorial}
            currentPage={currentPage}
        />
    );

    return {
        startTutorial,
        closeTutorial,
        TutorialComponent,
        isTutorialVisible
    };
};

export default TutorialSystem;