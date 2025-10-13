import { useEffect } from 'react';
import { createPortal } from 'react-dom';

/**
 * Composant Modal Universel avec React Portal
 * - Garantit la visibilité sur tous les écrans
 * - Z-index ultra-élevé
 * - Animations fluides
 * - Scroll management
 * - Responsive
 */
const PortalModal = ({
    isOpen,
    onClose,
    children,
    maxWidth = '1000px',
    className = '',
    showCloseButton = true,
    closeOnBackdrop = true,
    closeOnEscape = true
}) => {
    useEffect(() => {
        if (isOpen) {
            // Désactiver le scroll du body
            document.body.style.overflow = 'hidden';

            // Gestion de la touche Escape
            const handleEscape = (e) => {
                if (closeOnEscape && e.key === 'Escape') {
                    onClose();
                }
            };

            document.addEventListener('keydown', handleEscape);

            return () => {
                document.body.style.overflow = 'unset';
                document.removeEventListener('keydown', handleEscape);
            };
        }
    }, [isOpen, onClose, closeOnEscape]);

    if (!isOpen) return null;

    const handleBackdropClick = (e) => {
        if (closeOnBackdrop && e.target === e.currentTarget) {
            onClose();
        }
    };

    const modalContent = (
        <div
            style={styles.overlay}
            onClick={handleBackdropClick}
            className="portal-modal-overlay"
        >
            <div
                style={{ ...styles.modal, maxWidth }}
                className={`portal-modal-content ${className}`}
            >
                {showCloseButton && (
                    <button
                        onClick={onClose}
                        style={styles.closeButton}
                        className="portal-modal-close"
                        aria-label="Fermer"
                    >
                        ✕
                    </button>
                )}
                {children}
            </div>
        </div>
    );

    return createPortal(modalContent, document.body);
};

const styles = {
    overlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.85)',
        zIndex: 999999,
        overflowY: 'auto',
        overflowX: 'hidden',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '20px',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
    },
    modal: {
        backgroundColor: '#ffffff',
        borderRadius: '16px',
        boxShadow: '0 25px 80px rgba(0, 0, 0, 0.4)',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
        position: 'relative',
        maxHeight: '90vh',
        animation: 'portalModalSlideIn 0.3s ease-out',
    },
    closeButton: {
        position: 'absolute',
        top: '15px',
        right: '15px',
        background: 'rgba(0, 0, 0, 0.05)',
        border: 'none',
        borderRadius: '50%',
        width: '36px',
        height: '36px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        fontSize: '20px',
        color: '#6c757d',
        transition: 'all 0.2s ease',
        zIndex: 10,
    },
};

// Injection des styles CSS
if (typeof document !== 'undefined' && !document.querySelector('#portal-modal-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'portal-modal-styles';
    styleSheet.type = "text/css";
    styleSheet.innerText = `
    /* Force la modale à être au-dessus de tout */
    .portal-modal-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 999999 !important;
        isolation: isolate;
        animation: portalFadeIn 0.2s ease-out;
    }

    .portal-modal-content {
        position: relative !important;
        z-index: 1000000 !important;
    }

    .portal-modal-close:hover {
        background: rgba(0, 0, 0, 0.1) !important;
        color: #2c3e50 !important;
        transform: rotate(90deg);
    }

    @keyframes portalFadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes portalModalSlideIn {
        from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    /* Custom scrollbar pour les modales */
    .portal-modal-content *::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    .portal-modal-content *::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }

    .portal-modal-content *::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
    }

    .portal-modal-content *::-webkit-scrollbar-thumb:hover {
        background: #555;
    }

    /* Firefox scrollbar */
    .portal-modal-content * {
        scrollbar-width: thin;
        scrollbar-color: #888 #f1f1f1;
    }

    /* Responsive */
    @media (max-width: 768px) {
        .portal-modal-overlay {
            padding: 10px !important;
        }

        .portal-modal-content {
            max-height: 95vh !important;
            width: calc(100% - 20px) !important;
            margin: 10px auto !important;
        }
    }

    @media (max-width: 480px) {
        .portal-modal-overlay {
            padding: 5px !important;
            align-items: flex-start !important;
        }

        .portal-modal-content {
            max-height: calc(100vh - 10px) !important;
            width: calc(100% - 10px) !important;
            margin: 5px auto !important;
            border-radius: 12px !important;
        }
    }

    /* Désactiver le scroll du body quand la modale est ouverte */
    body:has(.portal-modal-overlay) {
        overflow: hidden !important;
    }
    `;
    document.head.appendChild(styleSheet);
}

export default PortalModal;
