import React from 'react'
import './css/enveloppe.css'
import HelloBis from "./HelloBis";
import EnveloppeChallenge from "./EnveloppeChallenge";

function Enveloppe() {
    return (
        <div className="enveloppe-container">
            <HelloBis />
            <EnveloppeChallenge />

            <div className="envelope-showcase">
                <div className="showcase-header">
                    <h1 className="showcase-title">
                        💌 Gestion par Enveloppes
                        <span className="title-subtitle">Méthode budgétaire innovante</span>
                    </h1>
                    <p className="showcase-description">
                        Découvrez la puissance de la méthode des enveloppes pour organiser vos finances personnelles
                    </p>
                </div>

                <div className="envelope-animation-wrapper">
                    <div className="envelope-3d" id="enveloppe">
                        <div className="envelope-back" id="back"></div>
                        <div className="envelope-lid-top" id="lid-top"></div>

                        <div className="envelope-letter" id="letter">
                            <div className="letter-header">
                                <div className="letter-logo">💰</div>
                                <div className="letter-title">Budget Manager</div>
                            </div>
                            <div className="letter-content">
                                <div className="letter-line head-line"></div>
                                <div className="letter-line"></div>
                                <div className="letter-line"></div>
                                <div className="letter-line"></div>
                                <div className="letter-line short"></div>
                            </div>
                        </div>

                        <div className="envelope-shadow lid-right-shadow" id="lid-right-shadow"></div>
                        <div className="envelope-lid-right" id="lid-right"></div>
                        <div className="envelope-shadow lid-left-shadow" id="lid-left-shadow"></div>
                        <div className="envelope-lid-left" id="lid-left"></div>

                        <div className="envelope-glow"></div>
                    </div>

                    <div className="floating-elements">
                        <div className="floating-icon icon-1">💳</div>
                        <div className="floating-icon icon-2">📊</div>
                        <div className="floating-icon icon-3">🎯</div>
                        <div className="floating-icon icon-4">📈</div>
                    </div>
                </div>

                <div className="features-preview">
                    <div className="feature-card">
                        <div className="feature-icon">🎯</div>
                        <h3>Allocation Précise</h3>
                        <p>Répartissez votre budget dans des enveloppes thématiques</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">📊</div>
                        <h3>Suivi en Temps Réel</h3>
                        <p>Visualisez vos dépenses et votre progression instantanément</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon">💡</div>
                        <h3>Conseils Intelligents</h3>
                        <p>Recevez des recommandations personnalisées</p>
                    </div>
                </div>

                <div className="coming-soon">
                    <div className="coming-soon-badge">
                        <span className="badge-text">🚀 Bientôt Disponible</span>
                    </div>
                    <h2>Fonctionnalités Avancées en Développement</h2>
                    <div className="progress-indicator">
                        <div className="progress-bar">
                            <div className="progress-fill" style={{width: '75%'}}></div>
                        </div>
                        <span className="progress-text">Développement à 75%</span>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Enveloppe