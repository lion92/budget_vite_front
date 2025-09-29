import React, { useEffect, useCallback, useState } from 'react';
import { X, Plus, Settings, Search, Filter } from 'lucide-react';
import { Categorie } from "./Categorie.jsx";

const ModalCategorie = ({ onClose }) => {
    const [activeTab, setActiveTab] = useState('create');
    const [isAnimating, setIsAnimating] = useState(false);
    const [closeHover, setCloseHover] = useState(false);
    const [hoveredTab, setHoveredTab] = useState(null);

    const handleKeyDown = useCallback((event) => {
        if (event.key === 'Escape') {
            onClose();
        }
    }, [onClose]);

    const handleOverlayClick = (event) => {
        if (event.target === event.currentTarget) {
            handleClose();
        }
    };

    const handleClose = () => {
        setIsAnimating(true);
        setTimeout(() => {
            onClose();
        }, 200);
    };

    const handleTabChange = (tab) => {
        if (tab !== activeTab) {
            setActiveTab(tab);
        }
    };

    useEffect(() => {
        document.addEventListener('keydown', handleKeyDown);
        document.body.style.overflow = 'hidden';

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [handleKeyDown]);

    return (
        <div
            style={{
                ...styles.overlay,
                opacity: isAnimating ? 0 : 1
            }}
            onClick={handleOverlayClick}
        >
            <div
                style={{
                    ...styles.modal,
                    transform: isAnimating ? 'translateY(20px) scale(0.95)' : 'translateY(0) scale(1)'
                }}
            >
                <div style={styles.header}>
                    <div style={styles.headerContent}>
                        <div style={styles.titleSection}>
                            <div style={styles.iconContainer}>
                                <Settings size={24} style={styles.headerIcon} />
                            </div>
                            <div>
                                <h2 style={styles.title}>Gestion des Catégories</h2>
                                <p style={styles.subtitle}>Créez et gérez vos catégories de budget</p>
                            </div>
                        </div>
                        <button
                            style={{
                                ...styles.closeButton,
                                ...(closeHover ? hoverStyles.closeButton : {})
                            }}
                            onMouseEnter={() => setCloseHover(true)}
                            onMouseLeave={() => setCloseHover(false)}
                            onClick={handleClose}
                            aria-label="Fermer la modale"
                            title="Fermer (Échap)"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    <div style={styles.tabsContainer}>
                        <button
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'create' ? styles.activeTab : {}),
                                ...(hoveredTab === 'create' && activeTab !== 'create' ? hoverStyles.tab : {})
                            }}
                            onMouseEnter={() => setHoveredTab('create')}
                            onMouseLeave={() => setHoveredTab(null)}
                            onClick={() => handleTabChange('create')}
                        >
                            <Plus size={16} style={styles.tabIcon} />
                            Créer / Modifier
                        </button>
                        <button
                            style={{
                                ...styles.tab,
                                ...(activeTab === 'manage' ? styles.activeTab : {}),
                                ...(hoveredTab === 'manage' && activeTab !== 'manage' ? hoverStyles.tab : {})
                            }}
                            onMouseEnter={() => setHoveredTab('manage')}
                            onMouseLeave={() => setHoveredTab(null)}
                            onClick={() => handleTabChange('manage')}
                        >
                            <Filter size={16} style={styles.tabIcon} />
                            Gérer
                        </button>
                    </div>
                </div>

                <div style={styles.content}>
                    <div style={styles.tabContent}>
                        <Categorie activeView={activeTab} />
                    </div>
                </div>
            </div>
        </div>
    );
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.7)',
        backdropFilter: 'blur(16px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '1rem',
        zIndex: 1000,
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    modal: {
        background: 'var(--background, white)',
        borderRadius: '20px',
        width: '100%',
        maxWidth: 'min(95vw, 1200px)',
        maxHeight: '95vh',
        display: 'flex',
        flexDirection: 'column',
        boxSizing: 'border-box',
        boxShadow: '0 25px 100px rgba(0, 0, 0, 0.15), 0 0 0 1px rgba(255, 255, 255, 0.05)',
        border: '1px solid var(--border, #e5e7eb)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
    },
    header: {
        background: 'linear-gradient(135deg, var(--surface, #fafafa) 0%, var(--background, white) 100%)',
        borderBottom: '1px solid var(--border, #e5e7eb)',
        padding: 0,
        flexShrink: 0,
    },
    headerContent: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '2rem 2rem 1rem 2rem',
    },
    titleSection: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
    },
    iconContainer: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        background: 'linear-gradient(135deg, var(--primary-500, #8b5cf6) 0%, var(--primary-600, #7c3aed) 100%)',
        boxShadow: '0 4px 20px rgba(139, 92, 246, 0.3)',
    },
    headerIcon: {
        color: 'white',
    },
    title: {
        margin: 0,
        fontSize: '1.5rem',
        fontWeight: '700',
        color: 'var(--text-primary, #111827)',
        lineHeight: '1.2',
    },
    subtitle: {
        margin: '0.25rem 0 0 0',
        fontSize: '0.875rem',
        color: 'var(--text-secondary, #6b7280)',
        fontWeight: '400',
    },
    closeButton: {
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: '44px',
        height: '44px',
        border: 'none',
        borderRadius: '12px',
        backgroundColor: 'transparent',
        color: 'var(--text-tertiary, #9ca3af)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '0',
    },
    tabsContainer: {
        display: 'flex',
        padding: '0 2rem 1rem 2rem',
        gap: '0.5rem',
        borderBottom: '1px solid var(--border, #e5e7eb)',
        marginTop: '1rem',
    },
    tab: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        padding: '0.75rem 1.25rem',
        borderRadius: '10px',
        border: 'none',
        background: 'transparent',
        color: 'var(--text-secondary, #6b7280)',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        fontSize: '0.875rem',
        fontWeight: '500',
        position: 'relative',
    },
    activeTab: {
        background: 'var(--primary-50, #f3f4f6)',
        color: 'var(--primary-700, #7c3aed)',
        fontWeight: '600',
    },
    tabIcon: {
        transition: 'all 0.2s ease',
    },
    content: {
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
    },
    tabContent: {
        flex: 1,
        overflow: 'auto',
        padding: '0',
    },
};

// Styles pour le hover des boutons (simulé avec onMouseEnter/onMouseLeave)
const hoverStyles = {
    closeButton: {
        backgroundColor: 'var(--error-50, #fef2f2)',
        color: 'var(--error-600, #dc2626)',
        transform: 'scale(1.05)',
    },
    tab: {
        backgroundColor: 'var(--surface, #f9fafb)',
        color: 'var(--text-primary, #111827)',
    },
};

export default ModalCategorie;
