import { create } from 'zustand';
import { api } from '../services/api';

const useAppStore = create((set, get) => ({
  // ========================================
  // STATE
  // ========================================
  user: null,
  token: localStorage.getItem('jwt'),

  expenses: [],
  categories: [],
  revenues: [],
  tickets: [],

  isLoading: false,
  error: null,

  // Filters & Search
  searchTerm: '',
  selectedCategories: [],
  dateRange: { start: null, end: null },
  amountRange: { min: null, max: null },

  // ========================================
  // AUTH ACTIONS
  // ========================================
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('https://www.krisscode.fr/connection/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        set({ error: `Erreur serveur: ${response.status}`, isLoading: false });
        return false;
      }

      const data = await response.json();

      if (data.message && !data.success) {
        set({ error: data.message, isLoading: false });
        return false;
      }

      if (!data.jwt) {
        set({ error: 'JWT manquant dans la réponse', isLoading: false });
        return false;
      }

      if (data.id) {
        localStorage.setItem('jwt', data.jwt);
        localStorage.setItem('utilisateur', data.id);

        set({
          token: data.jwt,
          user: { id: data.id, email },
          isLoading: false
        });
        return true;
      }

      set({ error: 'Données utilisateur invalides', isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Erreur de connexion au serveur', isLoading: false });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('jwt');
    localStorage.removeItem('utilisateur');
    set({
      user: null,
      token: null,
      expenses: [],
      categories: [],
      revenues: [],
      tickets: []
    });
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch('https://www.krisscode.fr/connection/inscription', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      if (!response.ok) {
        set({ error: 'Erreur lors de l\'inscription', isLoading: false });
        return false;
      }

      const data = await response.json();

      if (data.success || data.message?.includes('succès')) {
        set({ isLoading: false });
        return true;
      }

      set({ error: data.message || 'Erreur lors de l\'inscription', isLoading: false });
      return false;
    } catch (error) {
      set({ error: 'Erreur de connexion au serveur', isLoading: false });
      return false;
    }
  },

  // ========================================
  // EXPENSES ACTIONS
  // ========================================
  fetchExpenses: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/action/byuser/${userId}`);
      set({ expenses: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Erreur lors du chargement des dépenses', isLoading: false });
    }
  },

  addExpense: async (expense) => {
    set({ isLoading: true, error: null });
    try {
      const jwt = localStorage.getItem('jwt');
      const userId = parseInt(localStorage.getItem('utilisateur'));

      // Convertir la date au format attendu par l'API : "2025/10/24 12:00:00"
      const date = new Date(expense.dateTransaction);
      const dateFormatted = date.toLocaleString("zh-CN", { timeZone: 'Europe/Paris' });

      const body = {
        montant: parseFloat(expense.montant),
        categorie: parseInt(expense.categorie), // ✅ ID de la catégorie (nombre)
        description: expense.description,
        user: userId,
        dateTransaction: dateFormatted,
        jwt
      };

      console.log('📤 Envoi dépense:', body);

      const response = await fetch('https://www.krisscode.fr/action', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('❌ Erreur API:', response.status, errorText);
        set({ error: 'Erreur lors de l\'ajout de la dépense', isLoading: false });
        return false;
      }

      const data = await response.json();
      console.log('✅ Dépense ajoutée:', data);

      // Recharger les dépenses pour avoir les données à jour
      await get().fetchExpenses(userId);

      set({ isLoading: false });
      return true;
    } catch (error) {
      console.error('❌ Exception:', error);
      set({ error: 'Erreur lors de l\'ajout de la dépense', isLoading: false });
      return false;
    }
  },

  updateExpense: async (id, expense) => {
    set({ isLoading: true, error: null });
    try {
      const jwt = localStorage.getItem('jwt');
      const userId = parseInt(localStorage.getItem('utilisateur'));

      // Convertir la date au format attendu par l'API
      const date = new Date(expense.dateTransaction);
      const dateFormatted = date.toLocaleString("zh-CN", { timeZone: 'Europe/Paris' });

      const body = {
        montant: parseFloat(expense.montant),
        categorie: parseInt(expense.categorie), // ✅ ID de la catégorie (nombre)
        description: expense.description,
        dateTransaction: dateFormatted,
        jwt
      };

      const response = await fetch(`https://www.krisscode.fr/action/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        set({ error: 'Erreur lors de la mise à jour', isLoading: false });
        return false;
      }

      const data = await response.json();

      // Recharger les dépenses pour avoir les données à jour
      await get().fetchExpenses(userId);

      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Erreur lors de la mise à jour', isLoading: false });
      return false;
    }
  },

  deleteExpense: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const jwt = localStorage.getItem('jwt');

      const response = await fetch(`https://www.krisscode.fr/action/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt })
      });

      if (!response.ok) {
        set({ error: 'Erreur lors de la suppression', isLoading: false });
        return false;
      }

      set((state) => ({
        expenses: state.expenses.filter((e) => e.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: 'Erreur lors de la suppression', isLoading: false });
      return false;
    }
  },

  // ========================================
  // CATEGORIES ACTIONS
  // ========================================
  fetchCategories: async (userId) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/categorie/byuser/${userId}`);
      set({ categories: response.data, isLoading: false });
    } catch (error) {
      set({ error: 'Erreur lors du chargement des catégories', isLoading: false });
    }
  },

  addCategory: async (category) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/categorie', category);
      set((state) => ({
        categories: [...state.categories, response.data],
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: 'Erreur lors de l\'ajout de la catégorie', isLoading: false });
      return false;
    }
  },

  updateCategory: async (id, category) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`https://www.krisscode.fr/categorie/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category)
      });

      if (!response.ok) {
        set({ error: 'Erreur lors de la mise à jour de la catégorie', isLoading: false });
        return false;
      }

      const data = await response.json();

      // Recharger les catégories
      const userId = parseInt(localStorage.getItem('utilisateur'));
      await get().fetchCategories(userId);

      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Erreur lors de la mise à jour de la catégorie', isLoading: false });
      return false;
    }
  },

  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const jwt = localStorage.getItem('jwt');

      const response = await fetch(`https://www.krisscode.fr/categorie/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt })
      });

      if (!response.ok) {
        set({ error: 'Erreur lors de la suppression de la catégorie', isLoading: false });
        return false;
      }

      set((state) => ({
        categories: state.categories.filter((c) => c.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: 'Erreur lors de la suppression de la catégorie', isLoading: false });
      return false;
    }
  },

  // ========================================
  // REVENUES ACTIONS
  // ========================================
  fetchRevenues: async () => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('jwt');

      const response = await fetch('https://www.krisscode.fr/revenues', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        set({ error: 'Erreur lors du chargement des revenus', isLoading: false });
        return;
      }

      const data = await response.json();

      // L'API peut retourner soit un tableau, soit un objet avec une propriété revenus
      const revenues = Array.isArray(data) ? data : data?.revenus || [];

      set({ revenues, isLoading: false });
    } catch (error) {
      set({ error: 'Erreur lors du chargement des revenus', isLoading: false });
    }
  },

  addRevenue: async (revenue) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('jwt');

      const body = {
        name: revenue.nom,
        amount: parseFloat(revenue.montant),
        date: revenue.dateRevenu
      };

      const response = await fetch('https://www.krisscode.fr/revenues', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        set({ error: 'Erreur lors de l\'ajout du revenu', isLoading: false });
        return false;
      }

      const data = await response.json();

      set((state) => ({
        revenues: [...state.revenues, data],
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: 'Erreur lors de l\'ajout du revenu', isLoading: false });
      return false;
    }
  },

  deleteRevenue: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const token = localStorage.getItem('jwt');

      const response = await fetch(`https://www.krisscode.fr/revenues/${id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (!response.ok) {
        set({ error: 'Erreur lors de la suppression', isLoading: false });
        return false;
      }

      set((state) => ({
        revenues: state.revenues.filter((r) => r.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: 'Erreur lors de la suppression', isLoading: false });
      return false;
    }
  },

  // ========================================
  // TICKETS (OCR) ACTIONS
  // ========================================
  uploadTicket: async (formData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.post('/ticket/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      set((state) => ({
        tickets: [...state.tickets, response.data],
        isLoading: false
      }));
      return response.data;
    } catch (error) {
      set({ error: 'Erreur lors de l\'upload du ticket', isLoading: false });
      return null;
    }
  },

  fetchTickets: async () => {
    set({ isLoading: true, error: null });
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        set({ error: 'Session expirée', isLoading: false });
        return;
      }

      const response = await fetch('https://www.krisscode.fr/ticket/all', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt })
      });

      if (!response.ok) {
        set({ error: 'Erreur lors du chargement des tickets', isLoading: false });
        return;
      }

      const data = await response.json();

      if (!data.success) {
        set({ error: data.message || 'Erreur lors du chargement des tickets', isLoading: false });
        return;
      }

      set({ tickets: data.tickets || [], isLoading: false });
    } catch (error) {
      set({ error: 'Erreur lors du chargement des tickets', isLoading: false });
    }
  },

  updateTicket: async (id, ticketData) => {
    set({ isLoading: true, error: null });
    try {
      const jwt = localStorage.getItem('jwt');

      const body = {
        commercant: ticketData.commercant,
        montant: parseFloat(ticketData.montant),
        categorie: ticketData.categorie,
        dateTransaction: ticketData.dateTransaction,
        description: ticketData.description,
        jwt
      };

      const response = await fetch(`https://www.krisscode.fr/ticket/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });

      if (!response.ok) {
        set({ error: 'Erreur lors de la mise à jour du ticket', isLoading: false });
        return false;
      }

      // Recharger les tickets
      await get().fetchTickets();

      set({ isLoading: false });
      return true;
    } catch (error) {
      set({ error: 'Erreur lors de la mise à jour du ticket', isLoading: false });
      return false;
    }
  },

  deleteTicket: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const jwt = localStorage.getItem('jwt');
      if (!jwt) {
        set({ error: 'Session expirée', isLoading: false });
        return false;
      }

      const response = await fetch('https://www.krisscode.fr/ticket/delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt, id })
      });

      if (!response.ok) {
        set({ error: 'Erreur lors de la suppression du ticket', isLoading: false });
        return false;
      }

      const data = await response.json();

      if (!data.success) {
        set({ error: data.message || 'Erreur lors de la suppression du ticket', isLoading: false });
        return false;
      }

      set((state) => ({
        tickets: state.tickets.filter((t) => t.id !== id),
        isLoading: false
      }));
      return true;
    } catch (error) {
      set({ error: 'Erreur lors de la suppression du ticket', isLoading: false });
      return false;
    }
  },

  // ========================================
  // FILTERS & SEARCH
  // ========================================
  setSearchTerm: (term) => set({ searchTerm: term }),

  setSelectedCategories: (categories) => set({ selectedCategories: categories }),

  setDateRange: (range) => set({ dateRange: range }),

  setAmountRange: (range) => set({ amountRange: range }),

  resetFilters: () => set({
    searchTerm: '',
    selectedCategories: [],
    dateRange: { start: null, end: null },
    amountRange: { min: null, max: null }
  }),

  // ========================================
  // COMPUTED / SELECTORS
  // ========================================
  getFilteredExpenses: () => {
    const state = get();
    let filtered = [...state.expenses];

    // Search term
    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter((expense) =>
        expense.description?.toLowerCase().includes(term) ||
        expense.categorie?.toLowerCase().includes(term)
      );
    }

    // Categories
    if (state.selectedCategories.length > 0) {
      filtered = filtered.filter((expense) =>
        state.selectedCategories.includes(expense.categorie)
      );
    }

    // Date range
    if (state.dateRange.start || state.dateRange.end) {
      filtered = filtered.filter((expense) => {
        const expenseDate = new Date(expense.dateTransaction);
        const start = state.dateRange.start ? new Date(state.dateRange.start) : null;
        const end = state.dateRange.end ? new Date(state.dateRange.end) : null;

        if (start && expenseDate < start) return false;
        if (end && expenseDate > end) return false;
        return true;
      });
    }

    // Amount range
    if (state.amountRange.min !== null || state.amountRange.max !== null) {
      filtered = filtered.filter((expense) => {
        const amount = parseFloat(expense.montant);
        if (state.amountRange.min !== null && amount < state.amountRange.min) return false;
        if (state.amountRange.max !== null && amount > state.amountRange.max) return false;
        return true;
      });
    }

    return filtered;
  },

  getTotalExpenses: () => {
    const state = get();
    return state.expenses.reduce((sum, expense) => sum + parseFloat(expense.montant || 0), 0);
  },

  getTotalRevenues: () => {
    const state = get();
    return state.revenues.reduce((sum, revenue) => {
      const amount = revenue.amount || revenue.montant || 0;
      return sum + parseFloat(amount);
    }, 0);
  },

  getExpensesByCategory: () => {
    const state = get();
    const byCategory = {};

    state.expenses.forEach((expense) => {
      const cat = expense.categorie || 'Sans catégorie';
      if (!byCategory[cat]) {
        byCategory[cat] = { total: 0, count: 0 };
      }
      byCategory[cat].total += parseFloat(expense.montant || 0);
      byCategory[cat].count += 1;
    });

    return byCategory;
  },

  getMonthlyExpenses: () => {
    const state = get();
    const byMonth = {};

    state.expenses.forEach((expense) => {
      const date = new Date(expense.dateTransaction);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

      if (!byMonth[monthKey]) {
        byMonth[monthKey] = 0;
      }
      byMonth[monthKey] += parseFloat(expense.montant || 0);
    });

    return byMonth;
  }
}));

export default useAppStore;
