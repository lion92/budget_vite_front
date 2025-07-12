import { useTicketStore, useTicketActions, useTicketLoadingStates } from '../../useTicketStore';
import { useEffect } from 'react';

const TicketList = () => {
    const { allTickets } = useTicketStore();
    const { fetchTickets, deleteTicket } = useTicketActions();
    const { loading, deleting } = useTicketLoadingStates();

    useEffect(() => {
        fetchTickets();
    }, [fetchTickets]);

    // Formater les montants
    const formatCurrency = (amount) => {
        if (!amount || amount === 0) return '0,00€';
        return new Intl.NumberFormat('fr-FR', {
            style: 'currency',
            currency: 'EUR'
        }).format(amount);
    };

    // Formater les dates
    const formatDate = (dateString) => {
        if (!dateString) return 'Date inconnue';
        return new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        }).format(new Date(dateString));
    };

    // Tronquer le texte
    const truncateText = (text, maxLength = 100) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) {
            try {
                await deleteTicket(id);
            } catch (error) {
                console.error('Erreur lors de la suppression:', error);
            }
        }
    };

    if (loading && allTickets.length === 0) {
        return (
            <div style={styles.container}>
                <div style={styles.loadingContainer}>
                    <div style={styles.spinner}></div>
                    <p>Chargement des tickets...</p>
                </div>
            </div>
        );
    }

    if (allTickets.length === 0) {
        return (
            <div style={styles.container}>
                <div style={styles.emptyState}>
                    <div style={styles.emptyIcon}>📄</div>
                    <h3 style={styles.emptyTitle}>Aucun ticket analysé</h3>
                    <p style={styles.emptyMessage}>
                        Uploadez votre premier ticket pour commencer l'analyse automatique.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={styles.container}>
            <div style={styles.header}>
                <h3 style={styles.title}>📋 Mes tickets analysés</h3>
                <span style={styles.count}>{allTickets.length} ticket{allTickets.length > 1 ? 's' : ''}</span>
            </div>

            <div style={styles.ticketGrid}>
                {allTickets.map((ticket) => (
                    <div key={ticket.id} style={styles.ticketCard}>
                        {/* En-tête du ticket */}
                        <div style={styles.ticketHeader}>
                            <div style={styles.ticketInfo}>
                                <div style={styles.ticketId}>
                                    🧾 Ticket #{ticket.id}
                                </div>
                                <div style={styles.ticketDate}>
                                    {formatDate(ticket.dateAjout)}
                                </div>
                            </div>

                            {/* Montant principal */}
                            <div style={styles.amountContainer}>
                                {ticket.totalExtrait ? (
                                    <div style={styles.amount}>
                                        {formatCurrency(ticket.totalExtrait)}
                                    </div>
                                ) : (
                                    <div style={styles.noAmount}>
                                        💸 Montant non détecté
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Informations du ticket */}
                        <div style={styles.ticketBody}>
                            {/* Magasin et date du ticket */}
                            <div style={styles.metaInfo}>
                                {ticket.commercant && (
                                    <div style={styles.merchant}>
                                        <span style={styles.metaIcon}>🏪</span>
                                        {ticket.commercant}
                                    </div>
                                )}
                                {ticket.dateTicket && (
                                    <div style={styles.ticketDateInfo}>
                                        <span style={styles.metaIcon}>📅</span>
                                        {ticket.dateTicket}
                                    </div>
                                )}
                            </div>

                            {/* Texte OCR tronqué */}
                            {ticket.texte && (
                                <div style={styles.ocrText}>
                                    <details>
                                        <summary style={styles.ocrSummary}>
                                            📝 Aperçu du texte OCR
                                        </summary>
                                        <div style={styles.ocrContent}>
                                            {truncateText(ticket.texte, 200)}
                                        </div>
                                    </details>
                                </div>
                            )}
                        </div>

                        {/* Actions */}
                        <div style={styles.ticketActions}>
                            <button
                                onClick={() => handleDelete(ticket.id)}
                                disabled={deleting[ticket.id]}
                                style={{
                                    ...styles.deleteButton,
                                    ...(deleting[ticket.id] ? styles.deleteButtonDisabled : {})
                                }}
                            >
                                {deleting[ticket.id] ? (
                                    <>
                                        <span style={styles.miniSpinner}></span>
                                        Suppression...
                                    </>
                                ) : (
                                    <>
                                        🗑️ Supprimer
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

const styles = {
    container: {
        marginTop: '2rem',
    },
    loadingContainer: {
        textAlign: 'center',
        padding: '2rem',
        color: '#7f8c8d',
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
    emptyState: {
        textAlign: 'center',
        padding: '3rem 2rem',
        color: '#7f8c8d',
    },
    emptyIcon: {
        fontSize: '4rem',
        marginBottom: '1rem',
        opacity: 0.5,
    },
    emptyTitle: {
        fontSize: '1.2rem',
        marginBottom: '0.5rem',
        color: '#5d6d7e',
    },
    emptyMessage: {
        fontSize: '0.9rem',
        lineHeight: 1.5,
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '1.5rem',
        paddingBottom: '1rem',
        borderBottom: '2px solid #ecf0f1',
    },
    title: {
        margin: 0,
        fontSize: '1.3rem',
        fontWeight: '600',
        color: '#2c3e50',
    },
    count: {
        fontSize: '0.9rem',
        color: '#7f8c8d',
        backgroundColor: '#ecf0f1',
        padding: '0.3rem 0.8rem',
        borderRadius: '15px',
        fontWeight: '500',
    },
    ticketGrid: {
        display: 'grid',
        gap: '1.5rem',
        gridTemplateColumns: '1fr',
    },
    ticketCard: {
        backgroundColor: '#ffffff',
        border: '1px solid #e9ecef',
        borderRadius: '12px',
        padding: '1.5rem',
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        transition: 'all 0.3s ease',
        position: 'relative',
    },
    ticketHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '1rem',
    },
    ticketInfo: {
        flex: 1,
    },
    ticketId: {
        fontSize: '0.9rem',
        fontWeight: '600',
        color: '#3498db',
        marginBottom: '0.3rem',
    },
    ticketDate: {
        fontSize: '0.8rem',
        color: '#7f8c8d',
    },
    amountContainer: {
        textAlign: 'right',
    },
    amount: {
        fontSize: '1.4rem',
        fontWeight: '700',
        color: '#27ae60',
        background: 'linear-gradient(135deg, #27ae60, #2ecc71)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
        backgroundClip: 'text',
    },
    noAmount: {
        fontSize: '0.9rem',
        color: '#e74c3c',
        fontStyle: 'italic',
        padding: '0.3rem 0.6rem',
        backgroundColor: '#fadbd8',
        borderRadius: '6px',
    },
    ticketBody: {
        marginBottom: '1rem',
    },
    metaInfo: {
        display: 'flex',
        flexWrap: 'wrap',
        gap: '1rem',
        marginBottom: '1rem',
    },
    merchant: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.9rem',
        color: '#2c3e50',
        fontWeight: '500',
    },
    ticketDateInfo: {
        display: 'flex',
        alignItems: 'center',
        fontSize: '0.9rem',
        color: '#2c3e50',
    },
    metaIcon: {
        marginRight: '0.4rem',
        fontSize: '1rem',
    },
    ocrText: {
        marginTop: '1rem',
    },
    ocrSummary: {
        cursor: 'pointer',
        fontSize: '0.85rem',
        color: '#7f8c8d',
        fontWeight: '500',
        padding: '0.5rem 0',
        userSelect: 'none',
    },
    ocrContent: {
        marginTop: '0.5rem',
        padding: '0.75rem',
        backgroundColor: '#f8f9fa',
        borderRadius: '6px',
        fontSize: '0.8rem',
        lineHeight: 1.4,
        color: '#5d6d7e',
        border: '1px solid #e9ecef',
        maxHeight: '120px',
        overflow: 'auto',
    },
    ticketActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        paddingTop: '1rem',
        borderTop: '1px solid #ecf0f1',
    },
    deleteButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#e74c3c',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.85rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
        display: 'flex',
        alignItems: 'center',
        gap: '0.3rem',
    },
    deleteButtonDisabled: {
        backgroundColor: '#bdc3c7',
        cursor: 'not-allowed',
        opacity: 0.7,
    },
    miniSpinner: {
        display: 'inline-block',
        width: '12px',
        height: '12px',
        border: '2px solid transparent',
        borderTop: '2px solid white',
        borderRadius: '50%',
        animation: 'spin 1s linear infinite',
    },
};

// Ajout de l'animation CSS
if (typeof document !== 'undefined' && !document.querySelector('#ticket-list-styles')) {
    const styleSheet = document.createElement("style");
    styleSheet.id = 'ticket-list-styles';
    styleSheet.type = "text/css";
    styleSheet.innerText = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    /* Hover effects */
    .ticket-card:hover {
        transform: translateY(-2px);
        box-shadow: 0 4px 15px rgba(0,0,0,0.1) !important;
    }
    
    .delete-button:hover:not(:disabled) {
        background-color: #c0392b !important;
        transform: translateY(-1px);
    }
    `;
    document.head.appendChild(styleSheet);
}

export default TicketList;