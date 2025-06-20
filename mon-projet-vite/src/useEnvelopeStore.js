import { create } from 'zustand';
import lien from "./pages/components/lien";

export const useEnvelopeStore = create((set, get) => ({
    envelopes: [],
    selectedMonth: new Date().getMonth() + 1,
    selectedYear: new Date().getFullYear(),

    setMonth: (month) => set({ selectedMonth: month }),
    setYear: (year) => set({ selectedYear: year }),

    fetchEnvelopes: async () => {
        const userId = localStorage.getItem('utilisateur');
        const month = get().selectedMonth;
        const year = get().selectedYear;

        const res = await fetch(`${lien.url}envelopes/${userId}/${month}/${year}`);
        const data = await res.json();

        set({ envelopes: Array.isArray(data) ? data : [] });
    },

    // ✅ Ajout de l'icone à la création
    createEnvelope: async (name, amount, icone, notify) => {
        const jwt = localStorage.getItem('jwt');
        const userId = localStorage.getItem('utilisateur');
        const month = get().selectedMonth;
        const year = get().selectedYear;

        const res = await fetch(`${lien.url}envelopes`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, amount, icone, userId, month, year, jwt }),
        });

        if (res.ok) {
            notify('Enveloppe créée', 'success');
            await get().fetchEnvelopes();
        } else {
            notify("Erreur lors de la création de l'enveloppe", 'error');
        }
    },

    // ✅ Ajout de l'icone à la mise à jour
    updateEnvelope: async (envelopeId, newName, newAmount, icone, notify) => {
        const jwt = localStorage.getItem('jwt');

        const res = await fetch(`${lien.url}envelopes/${envelopeId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name: newName, amount: newAmount, icone: icone, jwt }),
        });

        if (res.ok) {
            notify('Enveloppe modifiée', 'success');
            await get().fetchEnvelopes();
        } else {
            notify("Erreur lors de la modification", 'error');
        }
    },

    deleteEnvelope: async (envelopeId, notify) => {
        const jwt = localStorage.getItem('jwt');

        const res = await fetch(`${lien.url}envelopes/${envelopeId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jwt }),
        });

        if (res.ok) {
            notify('Enveloppe supprimée', 'success');
            await get().fetchEnvelopes();
        } else {
            notify("Erreur lors de la suppression", 'error');
        }
    },

    addTransaction: async (envelopeId, { description, amount, date }, notify) => {
        const jwt = localStorage.getItem('jwt');

        const res = await fetch(`${lien.url}transactions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description,
                amount,
                date: date.toLocaleDateString('en-CA'),
                envelopeId,
                jwt,
            }),
        });

        if (res.ok) {
            notify('Transaction ajoutée', 'success');
            await get().fetchEnvelopes();
        } else {
            notify("Erreur lors de l'ajout de la transaction", 'error');
        }
    },

    updateTransaction: async (transactionId, { description, amount, date }, notify) => {
        const jwt = localStorage.getItem('jwt');

        const res = await fetch(`${lien.url}transactions/${transactionId}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                description,
                amount,
                date: date.toLocaleDateString('en-CA'),
                jwt,
            }),
        });

        if (res.ok) {
            notify('Transaction modifiée', 'success');
            await get().fetchEnvelopes();
        } else {
            notify("Erreur lors de la modification de la transaction", 'error');
        }
    },

    deleteTransaction: async (transactionId, notify) => {
        const jwt = localStorage.getItem('jwt');

        const res = await fetch(`${lien.url}transactions/${transactionId}`, {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jwt }),
        });

        if (res.ok) {
            notify('Transaction supprimée', 'success');
            await get().fetchEnvelopes();
        } else {
            notify("Erreur lors de la suppression", 'error');
        }
    },
}));
