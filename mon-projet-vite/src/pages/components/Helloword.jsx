import React, { useState, useEffect } from 'react';
import './css/accueil.css'
import { toast } from './ui';
import { RefreshCw } from 'lucide-react';
import QuickAddFAB from './QuickAddFAB';
import QuickAddModal from './QuickAddModal';


const Helloword = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isVideoLoaded, setIsVideoLoaded] = useState(false);
    const [videoError, setVideoError] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalType, setModalType] = useState('expense');


    useEffect(() => {
        setIsVisible(true);
    }, []);

    const handleVideoLoad = () => {
        setIsVideoLoaded(true);
        setVideoError(false);
    };

    const handleVideoError = (e) => {
        console.error('Erreur de chargement vidéo:', e);
        setVideoError(true);
        setIsVideoLoaded(false);
        toast.error('Impossible de charger la vidéo. Veuillez réessayer plus tard.');
    };

    const handleAddExpense = () => {
        setModalType('expense');
        setIsModalOpen(true);
    };

    const handleAddRevenue = () => {
        setModalType('revenue');
        setIsModalOpen(true);
    };

    return (
        <>
            {/* Bouton flottant d'accès rapide */}
            <QuickAddFAB
                onAddExpense={handleAddExpense}
                onAddRevenue={handleAddRevenue}
            />

            {/* Modal d'ajout rapide */}
            <QuickAddModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                type={modalType}
            />

            <div className={`welcome-container ${isVisible ? 'animate-in' : ''}`}>

                <div className="content-box">

                    <h1 className="main-title">
                        Bienvenue dans <span className="gradient-text">Budget Manager</span>
                        <div className="title-underline"></div>
                    </h1>
                    
                    <p className="subtitle">
                        Transformez votre relation avec l'argent grâce à notre solution moderne 
                        de gestion financière personnelle.
                    </p>




                    {/* Wrapper vidéo amélioré */}
                    <div className="video-section">
                        <h2 className="video-title">Découvrez Budget Manager en action</h2>
                        <div className={`video-wrapper ${isVideoLoaded ? 'loaded' : videoError ? 'error' : 'loading'}`}>
                            {!isVideoLoaded && !videoError && (
                                <div className="video-skeleton">
                                    <div className="skeleton-play-btn">▶️</div>
                                    <div className="skeleton-text">Chargement de la vidéo...</div>
                                </div>
                            )}
                            {videoError && (
                                <div className="video-error">
                                    <div className="error-icon">⚠️</div>
                                    <div className="error-text">Impossible de charger la vidéo</div>
                                    <button
                                        className="retry-btn"
                                        onClick={() => {
                                            setVideoError(false);
                                            setIsVideoLoaded(false);
                                            // Force iframe reload by changing src
                                            const iframe = document.querySelector('.video-wrapper iframe');
                                            if (iframe) {
                                                const currentSrc = iframe.src;
                                                iframe.src = '';
                                                setTimeout(() => iframe.src = currentSrc, 100);
                                            }
                                        }}
                                        title="Réessayer"
                                    >
                                        <RefreshCw size={18} />
                                    </button>
                                </div>
                            )}
                            <iframe width="560" height="315"
                                    src="https://www.youtube.com/embed/tNAEz03vYmM?si=apnS6inLb8-a88-Z"
                                    title="YouTube video player" frameBorder="0"
                                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                                    referrerPolicy="strict-origin-when-cross-origin" allowFullScreen
                                    onLoad={() => {
                                        setIsVideoLoaded(true);
                                        setVideoError(false);
                                    }}
                                    onError={() => {
                                        setVideoError(true);
                                        setIsVideoLoaded(false);
                                    }}></iframe>
                        </div>
                    </div>

                </div>
            </div>
        </>
    );
};

export default Helloword;