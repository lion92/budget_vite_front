import { useEffect, useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import lien from '../utils/lien';
import { useTicketActions } from '../store/useTicketStore';

const TicketModal = ({ ticket, isOpen, onClose }) => {
    const { updateTicketAmount } = useTicketActions();
    const [imageUrl, setImageUrl] = useState(null);
    const [imageError, setImageError] = useState(false);
    const [imageLoading, setImageLoading] = useState(false);
    const [isEditingAmount, setIsEditingAmount] = useState(false);
    const [newAmount, setNewAmount] = useState('');
    const [updating, setUpdating] = useState(false);
    const [localTicket, setLocalTicket] = useState(ticket);

    useEffect(() => {
        if (isOpen && ticket) {
            // Ne mettre à jour que si c'est un nouveau ticket (ID différent)
            if (!localTicket || localTicket.id !== ticket.id) {
                setLocalTicket(ticket);
                if (ticket.totalExtrait !== undefined) {
                    setNewAmount(ticket.totalExtrait.toString());
                } else {
                    setNewAmount('');
                }
            }

            if (ticket.id && ticket.imagePath) {
                loadTicketImage();
            }
        }
        return () => {
            if (imageUrl) {
                URL.revokeObjectURL(imageUrl);
            }
        };
    }, [isOpen, ticket]);

    const loadTicketImage = async () => {
        setImageLoading(true);
        setImageError(false);

        try {
            const response = await fetch(`${lien.url}ticket/image/${ticket.id}`, {
                method: 'GET',
                headers: {
                    'Accept': 'image/*',
                },
            });

            if (response.ok) {
                const blob = await response.blob();
                const url = URL.createObjectURL(blob);
                setImageUrl(url);
            } else {
                setImageError(true);
            }
        } catch (error) {
            console.error('Erreur lors du chargement de l\'image:', error);
            setImageError(true);
        } finally {
            setImageLoading(false);
        }
    };

    const formatCurrency = (amount) => {
        if (!amount) return '0,00€';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Date inconnue';
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    };

    const handleBackdropClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Escape') {
            if (isEditingAmount) {
                setIsEditingAmount(false);
                setNewAmount(ticket?.totalExtrait?.toString() || '');
            } else {
                onClose();
            }
        }
    };

    const handleEditAmount = () => {
        setIsEditingAmount(true);
        setNewAmount(ticket?.totalExtrait?.toString() || '');
    };

    const handleCancelEdit = () => {
        setIsEditingAmount(false);
        setNewAmount(ticket?.totalExtrait?.toString() || '');
    };

    const handleSaveAmount = async () => {
        const amount = parseFloat(newAmount);

        if (isNaN(amount) || amount < 0) {
            alert('Veuillez entrer un montant valide (positif)');
            return;
        }

        setUpdating(true);
        try {
            const result = await updateTicketAmount(ticket.id, amount);

            // Mettre à jour immédiatement le ticket local
            setLocalTicket(prev => ({
                ...prev,
                totalExtrait: amount
            }));

            // Mettre à jour newAmount pour qu'il affiche le bon montant quand on réédite
            setNewAmount(amount.toString());

            setIsEditingAmount(false);

            // Feedback visuel de succès
            console.log('✅ Montant mis à jour avec succès:', result);

        } catch (error) {
            console.error('❌ Erreur lors de la mise à jour:', error);
            alert('Erreur lors de la mise à jour: ' + error.message);

            // Remettre l'ancien montant en cas d'erreur
            setNewAmount(ticket?.totalExtrait?.toString() || '');
        } finally {
            setUpdating(false);
        }
    };

    const handleAmountInputChange = (e) => {
        let value = e.target.value;
        // Permettre les nombres décimaux
        if (/^\d*\.?\d*$/.test(value)) {
            setNewAmount(value);
        }
    };

    useEffect(() => {
        if (isOpen) {
            document.addEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'hidden';
        } else {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        }

        return () => {
            document.removeEventListener('keydown', handleKeyDown);
            document.body.style.overflow = 'unset';
        };
    }, [isOpen]);

    // Utiliser le ticket local pour l'affichage avec mémoisation
    const displayTicket = useMemo(() => localTicket, [localTicket]);

    if (!isOpen || !localTicket) return null;

    const modalContent = (
        <div style={styles.overlay} onClick={handleBackdropClick} className="ticket-modal-overlay">
            <div style={styles.modal} className="ticket-modal-content">
                {/* Header */}
                <div style={styles.header}>
                    <div style={styles.headerContent}>
                        <h2 style={styles.title}>
                            🧾 Ticket #{displayTicket.id}
                        </h2>
                        <div style={styles.ticketDate}>
                            {formatDate(displayTicket.dateAjout)}
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        style={styles.closeButton}
                        aria-label="Fermer"
                    >
                        ✕
                    </button>
                </div>

                {/* Content */}
                <div style={styles.content}>
                    {/* Informations principales */}
                    <div style={styles.mainInfo}>
                        <div style={styles.infoGrid}>
                            {/* Montant */}
                            <div style={styles.infoCard}>
                                <div style={styles.infoIcon}>💰</div>
                                <div style={styles.infoContent}>
                                    <div style={styles.infoLabel}>Montant OCR</div>
                                    {isEditingAmount ? (
                                        <div style={styles.editAmountContainer}>
                                            <input
                                                type="text"
                                                value={newAmount}
                                                onChange={handleAmountInputChange}
                                                style={styles.amountInput}
                                                placeholder="0.00"
                                                disabled={updating}
                                                autoFocus
                                            />
                                            <div style={styles.editAmountActions}>
                                                <button
                                                    onClick={handleSaveAmount}
                                                    disabled={updating}
                                                    style={{
                                                        ...styles.saveAmountButton,
                                                        ...(updating ? styles.saveAmountButtonDisabled : {})
                                                    }}
                                                >
                                                    {updating ? '⏳' : '✅'}
                                                </button>
                                                <button
                                                    onClick={handleCancelEdit}
                                                    disabled={updating}
                                                    style={styles.cancelAmountButton}
                                                >
                                                    ❌
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <div style={styles.amountDisplayContainer}>
                                            <div style={styles.infoValue}>
                                                {displayTicket.totalExtrait ?
                                                    formatCurrency(displayTicket.totalExtrait) :
                                                    'Non détecté'
                                                }
                                            </div>
                                            <button
                                                onClick={handleEditAmount}
                                                style={styles.editAmountButton}
                                                title="Modifier le montant"
                                            >
                                                ✏️
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Magasin */}
                            {displayTicket.commercant && (
                                <div style={styles.infoCard}>
                                    <div style={styles.infoIcon}>🏪</div>
                                    <div style={styles.infoContent}>
                                        <div style={styles.infoLabel}>Magasin</div>
                                        <div style={styles.infoValue}>
                                            {displayTicket.commercant}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Date du ticket */}
                            {displayTicket.dateTicket && (
                                <div style={styles.infoCard}>
                                    <div style={styles.infoIcon}>📅</div>
                                    <div style={styles.infoContent}>
                                        <div style={styles.infoLabel}>Date du ticket</div>
                                        <div style={styles.infoValue}>
                                            {displayTicket.dateTicket}
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Date d'ajout */}
                            <div style={styles.infoCard}>
                                <div style={styles.infoIcon}>🕒</div>
                                <div style={styles.infoContent}>
                                    <div style={styles.infoLabel}>Date d'analyse</div>
                                    <div style={styles.infoValue}>
                                        {formatDate(displayTicket.dateAjout)}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Deux colonnes pour l'image et le texte */}
                    <div style={styles.twoColumns}>
                        {/* Image du ticket */}
                        <div style={styles.imageSection}>
                            <h3 style={styles.sectionTitle}>📸 Image du ticket</h3>
                            <div style={styles.imageContainer}>
                                {imageLoading && (
                                    <div style={styles.imageLoading}>
                                        <div style={styles.spinner}></div>
                                        <p>Chargement de l'image...</p>
                                    </div>
                                )}

                                {imageError && (
                                    <div style={styles.imageError}>
                                        <div style={styles.errorIcon}>📷</div>
                                        <p>Image non disponible</p>
                                        <button
                                            onClick={loadTicketImage}
                                            style={styles.retryButton}
                                        >
                                            🔄 Réessayer
                                        </button>
                                    </div>
                                )}

                                {imageUrl && !imageError && (
                                    <div style={styles.imageWrapper}>
                                        <img
                                            src={imageUrl}
                                            alt={`Ticket ${displayTicket.id}`}
                                            style={styles.ticketImage}
                                        />
                                        <div style={styles.imageActions}>
                                            <a
                                                href={imageUrl}
                                                download={`ticket-${displayTicket.id}.jpg`}
                                                style={styles.downloadButton}
                                            >
                                                💾 Télécharger
                                            </a>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Texte OCR */}
                        <div style={styles.textSection}>
                            <h3 style={styles.sectionTitle}>📝 Texte extrait (OCR)</h3>
                            <div style={styles.textContainer}>
                                {displayTicket.texte ? (
                                    <pre style={styles.ocrText}>
                                        {displayTicket.texte}
                                    </pre>
                                ) : (
                                    <div style={styles.noText}>
                                        <div style={styles.noTextIcon}>📄</div>
                                        <p>Aucun texte extrait disponible</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div style={styles.footer}>
                    <button
                        onClick={onClose}
                        style={styles.closeFooterButton}
                    >
                        Fermer
                    </button>
                </div>
            </div>
        </div>
    );

    // Utiliser un portail React pour monter la modale directement dans le body
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
        maxWidth: '1000px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        margin: 'auto',
        position: 'relative',
        maxHeight: '90vh',
        animation: 'modalSlideIn 0.3s ease-out',
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: '1.5rem 2rem',
        borderBottom: '1px solid #e9ecef',
        backgroundColor: '#f8f9fa',
    },
    headerContent: {
        flex: 1,
    },
    title: {
        margin: '0 0 0.5rem 0',
        fontSize: '1.5rem',
        fontWeight: '600',
        color: '#2c3e50',
    },
    ticketDate: {
        fontSize: '0.9rem',
        color: '#6c757d',
    },
    closeButton: {
        background: 'none',
        border: 'none',
        fontSize: '1.5rem',
        cursor: 'pointer',
        color: '#6c757d',
        padding: '0.5rem',
        borderRadius: '50%',
        transition: 'all 0.2s ease',
        width: '40px',
        height: '40px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        flex: 1,
        padding: '2rem',
        overflowY: 'auto',
        overflowX: 'hidden',
    },
    mainInfo: {
        marginBottom: '2rem',
    },
    infoGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
    },
    infoCard: {
        display: 'flex',
        alignItems: 'center',
        padding: '1rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        border: '1px solid #e9ecef',
    },
    infoIcon: {
        fontSize: '1.5rem',
        marginRight: '0.75rem',
    },
    infoContent: {
        flex: 1,
    },
    infoLabel: {
        fontSize: '0.8rem',
        color: '#6c757d',
        marginBottom: '0.2rem',
        fontWeight: '500',
    },
    infoValue: {
        fontSize: '1rem',
        fontWeight: '600',
        color: '#2c3e50',
    },
    twoColumns: {
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
        gap: '2rem',
    },
    imageSection: {
        display: 'flex',
        flexDirection: 'column',
    },
    textSection: {
        display: 'flex',
        flexDirection: 'column',
    },
    sectionTitle: {
        fontSize: '1.1rem',
        fontWeight: '600',
        color: '#2c3e50',
        marginBottom: '1rem',
        padding: '0.5rem 0',
        borderBottom: '2px solid #e9ecef',
    },
    imageContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        border: '1px solid #e9ecef',
        padding: '1rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
    },
    imageLoading: {
        textAlign: 'center',
        color: '#6c757d',
    },
    spinner: {
        display: 'inline-block',
        width: '32px',
        height: '32px',
        border: '3px solid #f3f3f3',
        borderTop: '3px solid #3498db',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
        marginBottom: '1rem',
    },
    imageError: {
        textAlign: 'center',
        color: '#6c757d',
    },
    errorIcon: {
        fontSize: '3rem',
        marginBottom: '1rem',
        opacity: 0.5,
    },
    retryButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#3498db',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        marginTop: '1rem',
    },
    imageWrapper: {
        width: '100%',
        textAlign: 'center',
    },
    ticketImage: {
        maxWidth: '100%',
        maxHeight: '400px',
        objectFit: 'contain',
        borderRadius: '8px',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
    },
    imageActions: {
        marginTop: '1rem',
    },
    downloadButton: {
        display: 'inline-block',
        padding: '0.5rem 1rem',
        backgroundColor: '#27ae60',
        color: 'white',
        textDecoration: 'none',
        borderRadius: '6px',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'background-color 0.2s ease',
    },
    textContainer: {
        flex: 1,
        backgroundColor: '#f8f9fa',
        borderRadius: '10px',
        border: '1px solid #e9ecef',
        padding: '1rem',
        minHeight: '300px',
        maxHeight: '400px',
        overflowY: 'auto',
        overflowX: 'hidden',
    },
    ocrText: {
        fontSize: '0.85rem',
        lineHeight: '1.5',
        color: '#2c3e50',
        whiteSpace: 'pre-wrap',
        wordWrap: 'break-word',
        margin: 0,
        fontFamily: 'Monaco, "Cascadia Code", "Roboto Mono", Consolas, "Courier New", monospace',
    },
    noText: {
        textAlign: 'center',
        color: '#6c757d',
        padding: '2rem 1rem',
    },
    noTextIcon: {
        fontSize: '3rem',
        marginBottom: '1rem',
        opacity: 0.5,
    },
    footer: {
        padding: '1.5rem 2rem',
        borderTop: '1px solid #e9ecef',
        backgroundColor: '#f8f9fa',
        textAlign: 'right',
    },
    closeFooterButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#6c757d',
        color: 'white',
        border: 'none',
        borderRadius: '8px',
        cursor: 'pointer',
        fontSize: '1rem',
        fontWeight: '500',
        transition: 'background-color 0.2s ease',
    },
    amountDisplayContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    editAmountButton: {
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        fontSize: '1rem',
        padding: '0.2rem',
        borderRadius: '4px',
        opacity: 0.7,
        transition: 'opacity 0.2s ease',
    },
    editAmountContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        width: '100%',
    },
    amountInput: {
        flex: 1,
        padding: '0.5rem',
        border: '2px solid #3498db',
        borderRadius: '4px',
        fontSize: '1rem',
        fontWeight: '600',
        color: '#2c3e50',
        backgroundColor: 'white',
        outline: 'none',
    },
    editAmountActions: {
        display: 'flex',
        gap: '0.2rem',
    },
    saveAmountButton: {
        background: '#27ae60',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        padding: '0.3rem 0.5rem',
        color: 'white',
        transition: 'background-color 0.2s ease',
    },
    saveAmountButtonDisabled: {
        backgroundColor: '#95a5a6',
        cursor: 'not-allowed',
    },
    cancelAmountButton: {
        background: '#e74c3c',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '1rem',
        padding: '0.3rem 0.5rem',
        color: 'white',
        transition: 'background-color 0.2s ease',
    },
};

// Ajout de l'animation CSS
if (typeof document !== 'undefined' && !document.querySelector('#ticket-modal-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'ticket-modal-styles';
    styleSheet.type = "text/css";
    styleSheet.innerText = `
    /* Force la modale à être au-dessus de tout */
    .ticket-modal-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        right: 0 !important;
        bottom: 0 !important;
        z-index: 999999 !important;
        isolation: isolate;
        animation: fadeIn 0.2s ease-out;
    }

    .ticket-modal-content {
        position: relative !important;
        z-index: 1000000 !important;
    }

    @keyframes fadeIn {
        from {
            opacity: 0;
        }
        to {
            opacity: 1;
        }
    }

    @keyframes modalSlideIn {
        from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
        }
        to {
            opacity: 1;
            transform: translateY(0) scale(1);
        }
    }

    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }

    .close-button:hover {
        background-color: #e9ecef;
        color: #2c3e50;
    }

    .retry-button:hover {
        background-color: #2980b9;
    }

    .download-button:hover {
        background-color: #229954;
    }

    .close-footer-button:hover {
        background-color: #5a6268;
    }

    .edit-amount-button:hover {
        opacity: 1;
        background-color: #f8f9fa;
    }

    .save-amount-button:hover:not(:disabled) {
        background-color: #229954;
    }

    .cancel-amount-button:hover:not(:disabled) {
        background-color: #c0392b;
    }

    /* Custom scrollbar styles */
    *::-webkit-scrollbar {
        width: 8px;
        height: 8px;
    }

    *::-webkit-scrollbar-track {
        background: #f1f1f1;
        border-radius: 4px;
    }

    *::-webkit-scrollbar-thumb {
        background: #888;
        border-radius: 4px;
    }

    *::-webkit-scrollbar-thumb:hover {
        background: #555;
    }

    /* Firefox scrollbar */
    * {
        scrollbar-width: thin;
        scrollbar-color: #888 #f1f1f1;
    }

    @media (max-width: 768px) {
        .ticket-modal-overlay {
            padding: 10px !important;
        }

        .ticket-modal-content {
            max-height: 95vh !important;
            width: calc(100% - 20px) !important;
            margin: 10px auto !important;
        }

        .two-columns {
            grid-template-columns: 1fr !important;
        }

        .info-grid {
            grid-template-columns: 1fr !important;
        }

        .header {
            padding: 1rem !important;
        }

        .content {
            padding: 1rem !important;
        }
    }

    @media (max-width: 480px) {
        .ticket-modal-overlay {
            padding: 5px !important;
            align-items: flex-start !important;
        }

        .ticket-modal-content {
            max-height: calc(100vh - 10px) !important;
            width: calc(100% - 10px) !important;
            margin: 5px auto !important;
            border-radius: 12px !important;
        }
    }

    /* Désactiver le scroll du body quand la modale est ouverte */
    body:has(.ticket-modal-overlay) {
        overflow: hidden !important;
    }
    `;
    document.head.appendChild(styleSheet);
}

export default TicketModal;