import React, { useState, useEffect } from 'react';
import './css/accueil.css'
import BaniereLetchi from "./BaniereLetchi";
import { Button, Card, FeatureCard, toast } from './ui';


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
                        <Button
                            variant="primary"
                            size="large"
                            icon={<span>👤</span>}
                            onClick={() => {
                                toast.info('Redirection vers le site du créateur...', {
                                    description: 'Vous allez être redirigé vers le portfolio de Kriss CLOTILDE'
                                });
                                setTimeout(() => {
                                    window.open('https://projet.krissclotilde.com/', '_blank', 'noopener,noreferrer');
                                }, 1000);
                            }}
                        >
                            Découvrir le créateur
                        </Button>

                        <Button
                            variant="secondary"
                            size="large"
                            icon={<span>🎥</span>}
                            onClick={() => {
                                toast.success('Défilement vers la vidéo de démonstration');
                                document.querySelector('.video-wrapper')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                        >
                            Voir la démonstration
                        </Button>
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
                                    src="https://www.youtube.com/embed/9tD9YjPbvWI?si=QD8w4Ch03S2PwE1Q"
                                    title="YouTube video player" frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin" allowFullScreen></iframe>
                        </div>
                    </div>

                    {/* Fonctionnalités avec nouvelles cartes */}
                    <div className="features-section" style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
                        gap: 'var(--spacing-lg)',
                        marginTop: 'var(--spacing-2xl)',
                        marginBottom: 'var(--spacing-2xl)'
                    }}>
                        {features.map((feature, index) => (
                            <FeatureCard
                                key={index}
                                icon={<span style={{ fontSize: '2rem' }}>{feature.icon}</span>}
                                title={feature.title}
                                description={feature.description}
                                action={
                                    <Button
                                        variant="ghost"
                                        size="small"
                                        onClick={() => {
                                            toast.success(`Fonctionnalité: ${feature.title}`, {
                                                description: feature.description
                                            });
                                        }}
                                    >
                                        En savoir plus
                                    </Button>
                                }
                                hoverable
                                onClick={() => {
                                    toast.info(`Découvrir: ${feature.title}`);
                                }}
                            />
                        ))}
                    </div>

                    {/* Témoignages rapides */}
                    <Card
                        variant="primary"
                        className="testimonials-preview"
                        style={{
                            textAlign: 'center',
                            marginTop: 'var(--spacing-xl)'
                        }}
                    >
                        <div className="testimonial-item">
                            <div className="testimonial-stars" style={{
                                fontSize: '1.5rem',
                                marginBottom: 'var(--spacing-md)'
                            }}>⭐⭐⭐⭐⭐</div>
                            <p style={{
                                fontSize: 'var(--font-size-lg)',
                                fontStyle: 'italic',
                                marginBottom: 'var(--spacing-sm)'
                            }}>"Interface intuitive et design moderne !"</p>
                            <cite style={{
                                fontSize: 'var(--font-size-sm)',
                                color: 'var(--text-muted)'
                            }}>- Marie D.</cite>
                        </div>
                    </Card>
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