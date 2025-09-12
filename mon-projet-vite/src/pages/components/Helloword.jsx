import React, { useState, useEffect } from 'react';
import './css/accueil.css'
import BaniereLetchi from "./BaniereLetchi";


const Helloword = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [currentFeature, setCurrentFeature] = useState(0);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);

    const features = [
        { 
            icon: "💰", 
            title: "Suivi des Dépenses", 
            description: "Contrôlez facilement vos dépenses quotidiennes" 
        },
        { 
            icon: "📊", 
            title: "Analyses Visuelles", 
            description: "Graphiques intuitifs pour comprendre vos habitudes" 
        },
        { 
            icon: "🎯", 
            title: "Objectifs Financiers", 
            description: "Définissez et atteignez vos objectifs d'épargne" 
        },
        { 
            icon: "📱", 
            title: "Interface Moderne", 
            description: "Design responsive et expérience utilisateur optimale" 
        }
    ];

    useEffect(() => {
        setIsVisible(true);
        const interval = setInterval(() => {
            setCurrentFeature(prev => (prev + 1) % features.length);
        }, 3000);
        
        return () => clearInterval(interval);
    }, [features.length]);

    const handleVideoLoad = () => {
        setIsVideoLoaded(true);
    };

    return (
        <>
            <div className={`welcome-container ${isVisible ? 'animate-in' : ''}`}>
                {/* Particules flottantes animées */}
                <div className="floating-particles">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className={`particle particle-${i + 1}`} />
                    ))}
                </div>

                <div className="content-box">
                    {/* Badge "Nouveau" animé */}
                    <div className="new-badge">
                        <span className="new-badge-text">✨ Nouvelle Version</span>
                    </div>

                    <h1 className="main-title">
                        Bienvenue dans <span className="gradient-text">Budget Manager</span>
                        <div className="title-underline"></div>
                    </h1>
                    
                    <p className="subtitle">
                        Transformez votre relation avec l'argent grâce à notre solution moderne 
                        de gestion financière personnelle.
                    </p>

                    {/* Carousel des fonctionnalités */}
                    <div className="features-carousel">
                        <div className="feature-card active">
                            <div className="feature-icon">{features[currentFeature].icon}</div>
                            <h3 className="feature-title">{features[currentFeature].title}</h3>
                            <p className="feature-description">{features[currentFeature].description}</p>
                        </div>
                        
                        {/* Indicateurs du carousel */}
                        <div className="carousel-indicators">
                            {features.map((_, index) => (
                                <button
                                    key={index}
                                    className={`indicator ${index === currentFeature ? 'active' : ''}`}
                                    onClick={() => setCurrentFeature(index)}
                                />
                            ))}
                        </div>
                    </div>

                    {/* Boutons d'action améliorés */}
                    <div className="action-buttons">
                        <a 
                            className="about-link primary-btn" 
                            href="https://projet.krissclotilde.com/" 
                            target="_blank"
                            rel="noopener noreferrer"
                        >
                            <span className="btn-icon">👤</span>
                            <span>Découvrir le créateur</span>
                            <span className="btn-shine"></span>
                        </a>
                        
                        <button 
                            className="demo-btn secondary-btn"
                            onClick={() => document.querySelector('.video-wrapper').scrollIntoView({ behavior: 'smooth' })}
                        >
                            <span className="btn-icon">🎥</span>
                            <span>Voir la démonstration</span>
                        </button>
                    </div>

                    {/* Statistiques impressionnantes */}
                    <div className="stats-section">
                        <div className="stat-item">
                            <div className="stat-number" data-count="10000">0</div>
                            <div className="stat-label">Utilisateurs actifs</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number" data-count="50">0</div>
                            <div className="stat-label">Fonctionnalités</div>
                        </div>
                        <div className="stat-item">
                            <div className="stat-number" data-count="99">0</div>
                            <div className="stat-label">% Satisfaction</div>
                        </div>
                    </div>

                    {/* Wrapper vidéo amélioré */}
                    <div className="video-section">
                        <h2 className="video-title">Découvrez Budget Manager en action</h2>
                        <div className={`video-wrapper ${isVideoLoaded ? 'loaded' : 'loading'}`}>
                            {!isVideoLoaded && (
                                <div className="video-skeleton">
                                    <div className="skeleton-play-btn">▶️</div>
                                    <div className="skeleton-text">Chargement de la vidéo...</div>
                                </div>
                            )}
                            <iframe
                                src="https://www.youtube.com/embed/dOynsFlKtw8?si=CtHfjM02BaKq4uue"
                                title="YouTube video player" 
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                referrerPolicy="strict-origin-when-cross-origin" 
                                allowFullScreen
                                onLoad={handleVideoLoad}
                            />
                        </div>
                    </div>

                    {/* Témoignages rapides */}
                    <div className="testimonials-preview">
                        <div className="testimonial-item">
                            <div className="testimonial-stars">⭐⭐⭐⭐⭐</div>
                            <p>"Interface intuitive et design moderne !"</p>
                            <cite>- Marie D.</cite>
                        </div>
                    </div>
                </div>

                {/* Scroll indicator */}
                <div className="scroll-indicator">
                    <div className="scroll-arrow">↓</div>
                    <span>Scroll pour explorer</span>
                </div>
            </div>
        </>
    );
};

export default Helloword;