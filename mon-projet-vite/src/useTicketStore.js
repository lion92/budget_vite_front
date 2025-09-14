import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';
import lien from './pages/components/lien';

// Configuration par défaut
const initialState = {
    loading: false,
    uploading: false,
    deleting: {},
    result: null,
    error: null,
    allTickets: [],
    ticketStats: null,
};

export const useTicketStore = create(
    devtools(
        persist(
            (set, get) => ({
                ...initialState,

                // Import d'un ticket avec OCR
                importTicket: async (file) => {
                    set({ uploading: true, result: null, error: null });

                    try {
                        // Validation côté client
                        const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'application/pdf'];
                        const maxSize = 10 * 1024 * 1024; // 10MB

                        if (!allowedTypes.includes(file.type)) {
                            throw new Error('Format de fichier non supporté. Utilisez JPG, JPEG, PNG ou PDF.');
                        }

                        if (file.size > maxSize) {
                            throw new Error('Fichier trop volumineux (maximum 10MB).');
                        }

                        const jwt = localStorage.getItem('jwt');
                        if (!jwt) {
                            throw new Error('Session expirée. Veuillez vous reconnecter.');
                        }

                        const formData = new FormData();
                        formData.append('file', file);
                        formData.append('jwt', jwt);

                        const response = await fetch(`${lien.url}ticket/upload`, {
                            method: 'POST',
                            body: formData,
                            mode: 'cors',
                        });

                        const data = await response.json();

                        if (!response.ok) {
                            if (response.status === 401) {
                                throw new Error('Session expirée. Veuillez vous reconnecter.');
                            }
                            throw new Error(data.message || `Erreur ${response.status}: ${response.statusText}`);
                        }

                        if (!data.success) {
                            throw new Error(data.message || 'Échec de l\'analyse OCR');
                        }

                        set({ result: data, uploading: false });

                        // Rafraîchir automatiquement la liste des tickets
                        get().fetchTickets();

                    } catch (err) {
                        console.error('❌ Erreur importTicket:', err);
                        set({
                            error: err.message || 'Erreur inconnue lors de l\'import',
                            uploading: false
                        });
                    }
                },

                // Récupérer tous les tickets
                fetchTickets: async () => {
                    set({ loading: true, error: null });

                    try {
                        const jwt = localStorage.getItem('jwt');
                        if (!jwt) {
                            throw new Error('Session expirée. Veuillez vous reconnecter.');
                        }

                        const response = await fetch(`${lien.url}ticket/all`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ jwt }),
                        });

                        const data = await response.json();

                        if (!response.ok) {
                            if (response.status === 401) {
                                throw new Error('Session expirée. Veuillez vous reconnecter.');
                            }
                            throw new Error(data.message || `Erreur ${response.status}`);
                        }

                        if (!data.success) {
                            throw new Error(data.message || 'Erreur lors de la récupération');
                        }

                        set({
                            allTickets: data.tickets || [],
                            loading: false
                        });

                    } catch (err) {
                        console.error('❌ Erreur fetchTickets:', err);
                        set({
                            error: err.message || 'Erreur lors de la récupération des tickets',
                            loading: false
                        });
                    }
                },

                // Supprimer un ticket
                deleteTicket: async (id) => {
                    set(state => ({
                        deleting: { ...state.deleting, [id]: true },
                        error: null
                    }));

                    try {
                        const jwt = localStorage.getItem('jwt');
                        if (!jwt) {
                            throw new Error('Session expirée. Veuillez vous reconnecter.');
                        }

                        const response = await fetch(`${lien.url}ticket/delete`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ jwt, id }),
                        });

                        const data = await response.json();

                        if (!response.ok) {
                            if (response.status === 401) {
                                throw new Error('Session expirée. Veuillez vous reconnecter.');
                            }
                            throw new Error(data.message || `Erreur ${response.status}`);
                        }

                        if (!data.success) {
                            throw new Error(data.message || 'Échec de la suppression');
                        }

                        // Supprimer le ticket de la liste locale
                        set(state => ({
                            allTickets: state.allTickets.filter(ticket => ticket.id !== id),
                            deleting: { ...state.deleting, [id]: false }
                        }));

                        // Mettre à jour les stats si elles existent
                        const stats = get().ticketStats;
                        if (stats) {
                            set(state => ({
                                ticketStats: {
                                    ...stats,
                                    totalTickets: stats.totalTickets - 1,
                                    recentTickets: stats.recentTickets.filter(t => t.id !== id)
                                }
                            }));
                        }

                    } catch (err) {
                        console.error('❌ Erreur deleteTicket:', err);
                        set(state => ({
                            error: err.message || 'Erreur lors de la suppression',
                            deleting: { ...state.deleting, [id]: false }
                        }));
                    }
                },

                // Récupérer les statistiques
                getTicketStats: async () => {
                    try {
                        const jwt = localStorage.getItem('jwt');
                        if (!jwt) {
                            throw new Error('Session expirée. Veuillez vous reconnecter.');
                        }

                        const response = await fetch(`${lien.url}ticket/stats`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ jwt }),
                        });

                        const data = await response.json();

                        if (!response.ok) {
                            throw new Error(data.message || `Erreur ${response.status}`);
                        }

                        if (data.success && data.stats) {
                            set({ ticketStats: data.stats });
                        }

                    } catch (err) {
                        console.error('❌ Erreur getTicketStats:', err);
                        // Ne pas afficher d'erreur pour les stats (optionnel)
                    }
                },

                // Modifier le montant d'un ticket
                updateTicketAmount: async (id, newAmount) => {
                    // Utiliser un état de mise à jour spécifique
                    set(state => ({
                        deleting: { ...state.deleting, [id]: true },
                        error: null
                    }));

                    try {
                        const jwt = localStorage.getItem('jwt');
                        if (!jwt) {
                            throw new Error('Session expirée. Veuillez vous reconnecter.');
                        }

                        const response = await fetch(`${lien.url}ticket/update-amount`, {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ jwt, id, amount: newAmount }),
                        });

                        const data = await response.json();

                        if (!response.ok) {
                            if (response.status === 401) {
                                throw new Error('Session expirée. Veuillez vous reconnecter.');
                            }
                            throw new Error(data.message || `Erreur ${response.status}`);
                        }

                        if (!data.success) {
                            throw new Error(data.message || 'Échec de la mise à jour');
                        }

                        // Mise à jour immédiate et complète du state
                        set(state => {
                            const updatedTickets = state.allTickets.map(ticket =>
                                ticket.id === id
                                    ? { ...ticket, totalExtrait: newAmount }
                                    : ticket
                            );

                            // Calculer les nouvelles stats immédiatement
                            const newTotalAmount = updatedTickets.reduce((sum, ticket) =>
                                sum + (ticket.totalExtrait || 0), 0
                            );

                            const updatedStats = state.ticketStats ? {
                                ...state.ticketStats,
                                totalAmount: newTotalAmount,
                                recentTickets: state.ticketStats.recentTickets.map(ticket =>
                                    ticket.id === id
                                        ? { ...ticket, totalExtrait: newAmount }
                                        : ticket
                                )
                            } : null;

                            return {
                                ...state,
                                allTickets: updatedTickets,
                                ticketStats: updatedStats,
                                deleting: { ...state.deleting, [id]: false },
                                error: null
                            };
                        });

                        // Les stats sont déjà mises à jour localement, pas besoin de refetch

                        return { ...data, ticket: { id, totalExtrait: newAmount } };

                    } catch (err) {
                        console.error('❌ Erreur updateTicketAmount:', err);
                        set(state => ({
                            error: err.message || 'Erreur lors de la mise à jour du montant',
                            deleting: { ...state.deleting, [id]: false }
                        }));
                        throw err;
                    }
                },

                // Utilitaires
                clearError: () => set({ error: null }),

                clearResult: () => set({ result: null }),

                reset: () => set(initialState),
            }),
            {
                name: 'ticket-store', // Nom pour la persistance
                partialize: (state) => ({
                    // Ne persister que les données importantes
                    allTickets: state.allTickets,
                    ticketStats: state.ticketStats,
                }),
            }
        ),
        {
            name: 'ticket-store', // Nom pour les devtools
        }
    )
);

// Hooks utilitaires pour faciliter l'usage avec mémoisation
export const useTicketActions = () => {
    return useTicketStore(
        (state) => ({
            importTicket: state.importTicket,
            fetchTickets: state.fetchTickets,
            deleteTicket: state.deleteTicket,
            getTicketStats: state.getTicketStats,
            updateTicketAmount: state.updateTicketAmount,
            clearError: state.clearError,
            clearResult: state.clearResult,
            reset: state.reset,
        }),
        (prev, next) => {
            // Les fonctions ne changent jamais dans Zustand
            return true;
        }
    );
};

export const useTicketData = () => {
    return useTicketStore(
        (state) => ({
            allTickets: state.allTickets,
            result: state.result,
            error: state.error,
            ticketStats: state.ticketStats,
        }),
        (prev, next) => {
            return (
                prev.allTickets === next.allTickets &&
                prev.result === next.result &&
                prev.error === next.error &&
                prev.ticketStats === next.ticketStats
            );
        }
    );
};

export const useTicketLoadingStates = () => {
    return useTicketStore(
        (state) => ({
            loading: state.loading,
            uploading: state.uploading,
            deleting: state.deleting,
            isDeleting: (id) => state.deleting[id] || false,
        }),
        (prev, next) => {
            return (
                prev.loading === next.loading &&
                prev.uploading === next.uploading &&
                JSON.stringify(prev.deleting) === JSON.stringify(next.deleting)
            );
        }
    );
};

// Sélecteurs utiles
export const selectTicketById = (id) => (state) =>
    state.allTickets.find(ticket => ticket.id === id);

export const selectRecentTickets = (limit = 5) => (state) =>
    state.allTickets.slice(0, limit);

export const selectTicketsByMerchant = (merchant) => (state) =>
    state.allTickets.filter(ticket =>
        ticket.commercant?.toLowerCase().includes(merchant.toLowerCase())
    );

export const selectTotalAmount = (state) =>
    state.allTickets.reduce((sum, ticket) => sum + (ticket.totalExtrait || 0), 0);

// Fonction utilitaire pour formater les montants
export const formatCurrency = (amount) => {
    if (!amount) return '0,00€';
    return new Intl.NumberFormat('fr-FR', {
        style: 'currency',
        currency: 'EUR'
    }).format(amount);
};

// Fonction utilitaire pour formater les dates
export const formatDate = (dateString) => {
    if (!dateString) return 'Date inconnue';
    return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
    }).format(new Date(dateString));
};

// Hook personnalisé pour la recherche de tickets
export const useTicketSearch = (searchTerm) => {
    const allTickets = useTicketStore(state => state.allTickets);

    if (!searchTerm) return allTickets;

    return allTickets.filter(ticket =>
        ticket.commercant?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.texte?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        ticket.dateTicket?.includes(searchTerm)
    );
};

// Hook pour les statistiques calculées
export const useTicketCalculatedStats = () => {
    const allTickets = useTicketStore(state => state.allTickets);

    return {
        totalTickets: allTickets.length,
        totalAmount: allTickets.reduce((sum, ticket) => sum + (ticket.totalExtrait || 0), 0),
        averageAmount: allTickets.length > 0
            ? allTickets.reduce((sum, ticket) => sum + (ticket.totalExtrait || 0), 0) / allTickets.length
            : 0,
        ticketsThisMonth: allTickets.filter(ticket => {
            const ticketDate = new Date(ticket.dateAjout);
            const now = new Date();
            return ticketDate.getMonth() === now.getMonth() &&
                ticketDate.getFullYear() === now.getFullYear();
        }).length,
        topMerchants: allTickets
            .reduce((acc, ticket) => {
                if (ticket.commercant) {
                    acc[ticket.commercant] = (acc[ticket.commercant] || 0) + (ticket.totalExtrait || 0);
                }
                return acc;
            }, {})
    };
};