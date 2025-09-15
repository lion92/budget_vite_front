import React, { useMemo, useState } from 'react';
import { useTicketStore, useTicketActions, useTicketLoadingStates } from '../../useTicketStore';
import useBudgetStore from '../../useBudgetStore';
import { useNotify } from './Notification';
import DataTable from './DataTable';
import TicketModal from './TicketModal';
import { Eye, CreditCard, Trash2, Plus } from 'lucide-react';
import './css/ticket-table.css';

const TicketTable = () => {
    const { allTickets } = useTicketStore();
    const { deleteTicket } = useTicketActions();
    const { deleting } = useTicketLoadingStates();
    const { categories, addDepense, fetchCategories } = useBudgetStore();
    const notify = useNotify();

    const [selectedTicket, setSelectedTicket] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [showExpenseModal, setShowExpenseModal] = useState(false);
    const [selectedTicketForExpense, setSelectedTicketForExpense] = useState(null);
    const [expenseForm, setExpenseForm] = useState({
        categorie: '',
        description: '',
        date: new Date()
    });

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
    const truncateText = (text, maxLength = 50) => {
        if (!text) return '';
        return text.length > maxLength ? text.substring(0, maxLength) + '...' : text;
    };

    const handleDelete = async (id) => {
        if (window.confirm('Êtes-vous sûr de vouloir supprimer ce ticket ?')) {
            try {
                await deleteTicket(id);
                notify("Ticket supprimé avec succès", "success");
            } catch (error) {
                notify("Erreur lors de la suppression du ticket", "error");
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
            notify("Veuillez sélectionner une catégorie", "error");
            return;
        }

        const expenseData = {
            montant: selectedTicketForExpense.totalExtrait,
            categorie: expenseForm.categorie,
            description: expenseForm.description || selectedTicketForExpense.commercant || 'Dépense depuis ticket',
            date: expenseForm.date
        };

        await addDepense(expenseData, notify);
        closeExpenseModal();
    };

    // Colonnes pour le tableau
    const columns = useMemo(
        () => [
            {
                id: 'id',
                header: 'ID',
                accessorKey: 'id',
                size: 80,
                cell: ({ getValue }) => (
                    <div className="ticket-id">
                        🧾 #{getValue()}
                    </div>
                ),
                enableSorting: true,
                enableColumnFilter: true,
            },
            {
                id: 'dateAjout',
                header: 'Date d\'ajout',
                accessorKey: 'dateAjout',
                size: 150,
                cell: ({ getValue }) => (
                    <div className="date-cell">
                        {formatDate(getValue())}
                    </div>
                ),
                enableSorting: true,
                enableColumnFilter: false,
            },
            {
                id: 'commercant',
                header: 'Commerçant',
                accessorKey: 'commercant',
                size: 200,
                cell: ({ getValue }) => (
                    <div className="merchant-cell">
                        <span className="merchant-icon">🏪</span>
                        {getValue() || 'Non détecté'}
                    </div>
                ),
                enableSorting: true,
                enableColumnFilter: true,
            },
            {
                id: 'totalExtrait',
                header: 'Montant',
                accessorKey: 'totalExtrait',
                size: 120,
                cell: ({ getValue }) => {
                    const value = getValue();
                    return (
                        <div className="amount-cell">
                            {value ? (
                                <span className="amount-value">
                                    {formatCurrency(value)}
                                </span>
                            ) : (
                                <span className="amount-none">
                                    💸 Non détecté
                                </span>
                            )}
                        </div>
                    );
                },
                enableSorting: true,
                enableColumnFilter: false,
            },
            {
                id: 'dateTicket',
                header: 'Date du ticket',
                accessorKey: 'dateTicket',
                size: 130,
                cell: ({ getValue }) => (
                    <div className="date-ticket-cell">
                        📅 {getValue() || 'Non détectée'}
                    </div>
                ),
                enableSorting: true,
                enableColumnFilter: true,
            },
            {
                id: 'texte',
                header: 'Texte OCR',
                accessorKey: 'texte',
                size: 250,
                cell: ({ getValue }) => {
                    const text = getValue();
                    return (
                        <div className="ocr-text-cell">
                            {text ? (
                                <span className="ocr-preview" title={text}>
                                    📝 {truncateText(text, 60)}
                                </span>
                            ) : (
                                <span className="ocr-none">Aucun texte</span>
                            )}
                        </div>
                    );
                },
                enableSorting: false,
                enableColumnFilter: true,
            },
            {
                id: 'actions',
                header: 'Actions',
                size: 200,
                cell: ({ row }) => {
                    const ticket = row.original;
                    return (
                        <div className="actions-cell">
                            <button
                                onClick={() => handleViewTicket(ticket)}
                                className="action-btn view-btn"
                                title="Voir les détails"
                            >
                                <Eye size={16} />
                            </button>

                            {ticket.totalExtrait && (
                                <button
                                    onClick={() => handleAddToExpense(ticket)}
                                    className="action-btn expense-btn"
                                    title="Ajouter en dépense"
                                >
                                    <CreditCard size={16} />
                                </button>
                            )}

                            <button
                                onClick={() => handleDelete(ticket.id)}
                                disabled={deleting[ticket.id]}
                                className={`action-btn delete-btn ${deleting[ticket.id] ? 'deleting' : ''}`}
                                title="Supprimer le ticket"
                            >
                                {deleting[ticket.id] ? (
                                    <div className="mini-spinner"></div>
                                ) : (
                                    <Trash2 size={16} />
                                )}
                            </button>
                        </div>
                    );
                },
                enableSorting: false,
                enableColumnFilter: false,
            },
        ],
        [deleting]
    );

    // Préparer les données pour le tableau
    const tableData = useMemo(() => {
        return allTickets.map(ticket => ({
            ...ticket,
            // Ajouter des champs calculés si nécessaire
        }));
    }, [allTickets]);

    if (allTickets.length === 0) {
        return (
            <div className="tickets-table-empty">
                <div className="empty-state">
                    <div className="empty-icon">📄</div>
                    <h3>Aucun ticket analysé</h3>
                    <p>Uploadez votre premier ticket pour commencer l'analyse automatique.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="tickets-table-container">
            <div className="table-header-info">
                <h3 className="table-title">
                    📋 Tickets analysés ({allTickets.length})
                </h3>
                <p className="table-description">
                    Gérez vos tickets de caisse avec filtrage et tri avancés
                </p>
            </div>

            <DataTable
                data={tableData}
                columns={columns}
                title={`Tickets de caisse (${allTickets.length})`}
            />

            {/* Modal pour les détails du ticket */}
            <TicketModal
                ticket={selectedTicket}
                isOpen={isModalOpen}
                onClose={closeModal}
            />

            {/* Modal pour ajouter en dépense */}
            {showExpenseModal && (
                <div className="modal-overlay">
                    <div className="expense-modal-content">
                        <h3 className="expense-modal-title">
                            💳 Ajouter en dépense
                        </h3>

                        {selectedTicketForExpense && (
                            <div className="ticket-summary">
                                <div className="summary-item">
                                    <strong>Montant:</strong> {formatCurrency(selectedTicketForExpense.totalExtrait)}
                                </div>
                                <div className="summary-item">
                                    <strong>Commerçant:</strong> {selectedTicketForExpense.commercant || 'Non spécifié'}
                                </div>
                            </div>
                        )}

                        <form onSubmit={handleSubmitExpense} className="expense-form">
                            <div className="form-group">
                                <label className="form-label">Catégorie *</label>
                                <select
                                    value={expenseForm.categorie}
                                    onChange={(e) => setExpenseForm(prev => ({...prev, categorie: e.target.value}))}
                                    className="form-select"
                                    required
                                >
                                    <option value="">-- Choisir une catégorie --</option>
                                    {categories?.map(c => (
                                        <option key={c.id} value={c.id}>{c.categorie}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label className="form-label">Description</label>
                                <input
                                    type="text"
                                    value={expenseForm.description}
                                    onChange={(e) => setExpenseForm(prev => ({...prev, description: e.target.value}))}
                                    className="form-input"
                                    placeholder="Description de la dépense"
                                />
                            </div>

                            <div className="form-group">
                                <label className="form-label">Date</label>
                                <input
                                    type="date"
                                    value={expenseForm.date.toISOString().split('T')[0]}
                                    onChange={(e) => setExpenseForm(prev => ({...prev, date: new Date(e.target.value)}))}
                                    className="form-input"
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="submit" className="save-button">
                                    <Plus size={16} />
                                    Enregistrer la dépense
                                </button>
                                <button type="button" onClick={closeExpenseModal} className="cancel-button">
                                    Annuler
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default TicketTable;