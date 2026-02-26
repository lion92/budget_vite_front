import { useTicketStore, useTicketActions, useTicketLoadingStates } from '../store/useTicketStore';
import useAppStore from '../store/useAppStore';
import { useEffect, useState } from 'react';
import TicketModal from './TicketModal';
import { toast } from 'react-toastify';

const TicketList = () => {
    const { allTickets } = useTicketStore();
    const { fetchTickets, deleteTicket } = useTicketActions();
    const { loading, deleting } = useTicketLoadingStates();
    const { categories, addExpense, fetchCategories } = useAppStore();
    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [selectedTicketForExpense, setSelectedTicketForExpense] = useState(null);
    const [expenseForm, setExpenseForm] = useState({
        categorie: '',
        description: '',
        date: new Date()
    });

    useEffect(() => {
        fetchTickets();
        const userId = parseInt(localStorage.getItem('utilisateur'));
        if (userId) {
            fetchCategories(userId);
        }
    }, []);

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

    const handleViewTicket = (ticket) => {
        setSelectedTicket(ticket);
        setIsModalOpen(true);
    };

    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedTicket(null);
    };

    const handleAddToExpense = (ticket) => {
        setSelectedTicketForExpense(ticket);
        setExpenseForm({
            categorie: '',
            description: ticket.commercant || '',
            date: new Date()
        });
        setShowExpenseModal(true);
    };

    const closeExpenseModal = () => {
        setShowExpenseModal(false);
        setSelectedTicketForExpense(null);
        setExpenseForm({
            categorie: '',
            description: '',
            date: new Date()
        });
    };

    const handleSubmitExpense = async (e) => {
        e.preventDefault();
        if (!selectedTicketForExpense || !expenseForm.categorie) {
            toast.error("Veuillez sélectionner une catégorie");
            return;
        }

        const expenseData = {
            montant: selectedTicketForExpense.totalExtrait,
            categorie: expenseForm.categorie,
            description: expenseForm.description || selectedTicketForExpense.commercant || 'Dépense depuis ticket',
            dateTransaction: expenseForm.date
        };

        // Trouver le nom de la catégorie sélectionnée
        const selectedCategory = categories.find(c => c.id === parseInt(expenseForm.categorie));
        const categoryName = selectedCategory ? selectedCategory.categorie : expenseForm.categorie;

        const success = await addExpense(expenseData);
        if (success) {
            // Message détaillé en vert avec les informations de la catégorie
            const message = `✅ Dépense ajoutée avec succès!\n📁 Catégorie: ${categoryName}\n💰 Montant: ${formatCurrency(selectedTicketForExpense.totalExtrait)}\n📝 Description: ${expenseData.description}`;
            toast.success(message, {
                style: {
                    background: '#d4edda',
                    color: '#155724',
                    border: '1px solid #c3e6cb',
                    whiteSpace: 'pre-line'
                }
            });
        } else {
            toast.error("Erreur lors de l'ajout de la dépense");
        }
        closeExpenseModal();
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
                                onClick={() => handleViewTicket(ticket)}
                                style={styles.viewButton}
                            >
                                👁️ Voir détails
                            </button>
                            {ticket.totalExtrait && (
                                <button
                                    onClick={() => handleAddToExpense(ticket)}
                                    style={styles.expenseButton}
                                >
                                    💳 Ajouter en dépense
                                </button>
                            )}
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

            {/* Modal pour les détails du ticket */}
            <TicketModal
                ticket={selectedTicket}
                isOpen={isModalOpen}
                onClose={closeModal}
            />

            {/* Modal pour ajouter en dépense */}
            {showExpenseModal && (
                <div style={styles.modalOverlay}>
                    <div style={styles.expenseModalContent}>
                        <h3 style={styles.expenseModalTitle}>
                            💳 Ajouter en dépense
                        </h3>

                        {selectedTicketForExpense && (
                            <div style={styles.ticketSummary}>
                                <div style={styles.summaryItem}>
                                    <strong>Montant:</strong> {formatCurrency(selectedTicketForExpense.totalExtrait)}
                                </div>
                                <div style={styles.summaryItem}>
                                    <strong>Commerçant:</strong> {selectedTicketForExpense.commercant || 'Non spécifié'}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmitExpense} style={styles.expenseForm}>
                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Catégorie *</label>
                                <select
                                    value={expenseForm.categorie}
                                    onChange={(e) => setExpenseForm(prev => ({...prev, categorie: e.target.value}))}
                                    style={styles.formSelect}
                                    required
                                >
                                    <option value="">-- Choisir une catégorie --</option>
                                    {categories?.map(c => (
                                        <option key={c.id} value={c.id}>{c.categorie}</option>
                                    ))}
                                </select>
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Description</label>
                                <input
                                    type="text"
                                    value={expenseForm.description}
                                    onChange={(e) => setExpenseForm(prev => ({...prev, description: e.target.value}))}
                                    style={styles.formInput}
                                    placeholder="Description de la dépense"
                                />
                            </div>

                            <div style={styles.formGroup}>
                                <label style={styles.formLabel}>Date</label>
                                <input
                                    type="date"
                                    value={expenseForm.date.toISOString().split('T')[0]}
                                    onChange={(e) => setExpenseForm(prev => ({...prev, date: new Date(e.target.value)}))}
                                    style={styles.formInput}
                                />
                            </div>

                            <div style={styles.modalActions}>
                                <button type="submit" style={styles.saveButton}>
                                    💾 Enregistrer la dépense
                                </button>
                                <button type="button" onClick={closeExpenseModal} style={styles.cancelButton}>
                                    ❌ Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
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
        gap: '0.5rem',
        paddingTop: '1rem',
        borderTop: '1px solid #ecf0f1',
        flexWrap: 'wrap',
    },
    viewButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#3498db',
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
    expenseButton: {
        padding: '0.5rem 1rem',
        backgroundColor: '#27ae60',
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
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 1000,
    },
    expenseModalContent: {
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '2rem',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto',
        boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
    },
    expenseModalTitle: {
        margin: '0 0 1.5rem 0',
        fontSize: '1.4rem',
        fontWeight: '600',
        color: '#2c3e50',
        textAlign: 'center',
    },
    ticketSummary: {
        backgroundColor: '#f8f9fa',
        padding: '1rem',
        borderRadius: '8px',
        marginBottom: '1.5rem',
        border: '1px solid #e9ecef',
    },
    summaryItem: {
        margin: '0.5rem 0',
        fontSize: '0.9rem',
        color: '#2c3e50',
    },
    expenseForm: {
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
    },
    formGroup: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.5rem',
    },
    formLabel: {
        fontSize: '0.9rem',
        fontWeight: '500',
        color: '#2c3e50',
    },
    formSelect: {
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '0.9rem',
        backgroundColor: 'white',
        cursor: 'pointer',
    },
    formInput: {
        padding: '0.75rem',
        border: '1px solid #ddd',
        borderRadius: '6px',
        fontSize: '0.9rem',
    },
    modalActions: {
        display: 'flex',
        justifyContent: 'flex-end',
        gap: '1rem',
        marginTop: '1.5rem',
    },
    saveButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#27ae60',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
    },
    cancelButton: {
        padding: '0.75rem 1.5rem',
        backgroundColor: '#95a5a6',
        color: 'white',
        border: 'none',
        borderRadius: '6px',
        cursor: 'pointer',
        fontSize: '0.9rem',
        fontWeight: '500',
        transition: 'all 0.2s ease',
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
    
    .view-button:hover {
        background-color: #2980b9 !important;
        transform: translateY(-1px);
    }

    .delete-button:hover:not(:disabled) {
        background-color: #c0392b !important;
        transform: translateY(-1px);
    }

    .expense-button:hover {
        background-color: #219a52 !important;
        transform: translateY(-1px);
    }

    .save-button:hover {
        background-color: #219a52 !important;
    }

    .cancel-button:hover {
        background-color: #798d8f !important;
    }
    `;
    document.head.appendChild(styleSheet);
}

export default TicketList;