import { create } from 'zustand';
import lien from './pages/components/lien';

export const useTicketStore = create((set) => ({
    loading: false,
    result: null,
    error: null,
    allTickets: [],

    importTicket: async (file) => {
        set({ loading: true, result: null, error: null });

        try {
            const jwt = localStorage.getItem('jwt');
            if (!jwt) throw new Error('Token manquant');

            const formData = new FormData();
            formData.append('file', file);
            formData.append('jwt', jwt); // ✅ IMPORTANT : ajouter ici le jwt comme champ

            const response = await fetch(lien.url+'ticket/upload', {
                method: 'POST',
                body: formData,
                mode: 'cors',
            });

            const data = await response.json();
            if (!response.ok || data.error) {
                throw new Error(data.message || 'Erreur serveur');
            }

            set({ result: data, loading: false });
        } catch (err) {
            console.error('❌ Erreur importTicket:', err);
            set({ error: err.message, loading: false });
        }
    },

    fetchTickets: async () => {
        try {
            const jwt = localStorage.getItem('jwt');
            if (!jwt) throw new Error('Token manquant');

            const response = await fetch(lien.url+'ticket/all', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jwt }),
            });

            const data = await response.json();
            if (!response.ok || data.error) throw new Error(data.message || 'Erreur');

            set({ allTickets: data });
        } catch (err) {
            console.error('❌ Erreur fetchTickets:', err);
        }
    },
    deleteTicket: async (id) => {
        try {
            const jwt = localStorage.getItem('jwt');
            if (!jwt) throw new Error('Token manquant');

            const response = await fetch(lien.url+'ticket/delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ jwt, id }),
            });

            const data = await response.json();
            if (!response.ok || data.error) {
                throw new Error(data.message || 'Échec suppression');
            }

            set((state) => ({
                allTickets: state.allTickets.filter((ticket) => ticket.id !== id),
            }));
        } catch (err) {
            alert('Erreur lors de la suppression du ticket.');
            console.error(err);
        }
    },
}));
