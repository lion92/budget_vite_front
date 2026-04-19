import { create } from 'zustand';
import { api } from '../services/api';
import useGamifyStore from './useGamifyStore';

const BASE = 'https://www.krisscode.fr';

// Helper : headers JSON + JWT
const jsonHeaders = () => ({
  'Content-Type': 'application/json',
  Authorization: `Bearer ${localStorage.getItem('jwt')}`,
});

const useAppStore = create((set, get) => ({
  // ========================================
  // STATE
  // ========================================
  user: null,
  token: localStorage.getItem('jwt'),

  expenses:   [],
  categories: [],
  revenues:   [],

  isLoading: false,
  error: null,

  // Cache timestamps (ms) — évite les refetch inutiles à la navigation
  _lastFetched: { expenses: 0, categories: 0, revenues: 0 },
  CACHE_TTL: 120_000, // 2 minutes

  // Filters & Search
  searchTerm: '',
  selectedCategories: [],
  dateRange: { start: null, end: null },
  amountRange: { min: null, max: null },

  // ========================================
  // AUTH
  // ========================================
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${BASE}/connection/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
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
        set({ token: data.jwt, user: { id: data.id, email }, isLoading: false });
        return true;
      }

      set({ error: 'Données utilisateur invalides', isLoading: false });
      return false;
    } catch {
      set({ error: 'Erreur de connexion au serveur', isLoading: false });
      return false;
    }
  },

  // Appelé après le redirect Google : lit jwt/id/email/nom/prenom depuis les query params
  loginFromGoogleCallback: ({ jwt, id, email, nom, prenom }) => {
    localStorage.setItem('jwt', jwt);
    localStorage.setItem('utilisateur', id);
    set({ token: jwt, user: { id, email, nom, prenom } });
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
      _lastFetched: { expenses: 0, categories: 0, revenues: 0 },
    });
  },

  register: async (userData) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${BASE}/connection/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData),
      });

      const contentType = response.headers.get('content-type');
      let data;

      if (contentType?.includes('application/json')) {
        data = await response.json().catch(() => ({}));
      } else {
        const text = await response.text();
        if (text === 'ok' && (response.status === 200 || response.status === 201)) {
          set({ isLoading: false });
          return true;
        }
        data = { message: text };
      }

      if (!response.ok) {
        set({ error: data.message || "Erreur lors de l'inscription", isLoading: false });
        return false;
      }

      if (data.success || data.jwt || data.message?.includes('succès')) {
        set({ isLoading: false });
        return true;
      }

      set({ error: data.message || "Erreur lors de l'inscription", isLoading: false });
      return false;
    } catch {
      set({ error: 'Erreur de connexion au serveur', isLoading: false });
      return false;
    }
  },

  // ========================================
  // EXPENSES — fetch
  // ========================================
  fetchExpenses: async (userId, { force = false } = {}) => {
    const uid = userId ?? localStorage.getItem('utilisateur');
    if (!uid) return;

    const { _lastFetched, CACHE_TTL } = get();
    if (!force && Date.now() - _lastFetched.expenses < CACHE_TTL) return;

    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/action/byuser/${uid}`);
      set((s) => ({
        expenses: response.data ?? [],
        isLoading: false,
        _lastFetched: { ...s._lastFetched, expenses: Date.now() },
      }));
    } catch {
      set({ error: 'Erreur lors du chargement des dépenses', isLoading: false });
    }
  },

  // EXPENSES — add (ticketFile optionnel : multipart si fourni, JSON sinon)
  // Retourne l'objet dépense créé (avec id) ou null en cas d'erreur
  addExpense: async (expense, ticketFile = null) => {
    set({ isLoading: true, error: null });
    try {
      const jwt    = localStorage.getItem('jwt');
      const userId = parseInt(localStorage.getItem('utilisateur'));

      const date          = new Date(expense.dateTransaction);
      const dateFormatted = date.toLocaleString('zh-CN', { timeZone: 'Europe/Paris' });

      let response;
      if (ticketFile) {
        const fd = new FormData();
        fd.append('montant',         parseFloat(expense.montant));
        fd.append('categorie',       parseInt(expense.categorie));
        fd.append('description',     expense.description);
        fd.append('user',            userId);
        fd.append('dateTransaction', dateFormatted);
        fd.append('jwt',             jwt);
        fd.append('ticket',          ticketFile);
        response = await fetch(`${BASE}/action`, { method: 'POST', body: fd });
      } else {
        response = await fetch(`${BASE}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            montant: parseFloat(expense.montant),
            categorie: parseInt(expense.categorie),
            description: expense.description,
            user: userId,
            dateTransaction: dateFormatted,
            jwt,
          }),
        });
      }

      if (!response.ok) {
        const txt = await response.text();
        console.error('❌ addExpense:', response.status, txt);
        set({ error: "Erreur lors de l'ajout de la dépense", isLoading: false });
        return null;
      }

      // Parse la réponse pour récupérer l'ID de la dépense créée
      let created = null;
      try {
        const contentType = response.headers.get('content-type') || '';
        if (contentType.includes('application/json')) {
          created = await response.json();
        }
      } catch { /* le back ne retourne pas toujours du JSON */ }

      set((s) => ({ _lastFetched: { ...s._lastFetched, expenses: 0 } }));
      await get().fetchExpenses(userId, { force: true });
      useGamifyStore.getState().onExpenseAdded(get().expenses.length);

      // Si le back ne retourne pas l'id, on le cherche dans la liste fraîchement chargée
      if (!created?.id) {
        const latest = get().expenses.find(
          (e) => e.description === expense.description &&
                 parseFloat(e.montant) === parseFloat(expense.montant)
        );
        created = latest ?? created;
      }

      return created;
    } catch (err) {
      console.error('❌ addExpense exception:', err);
      set({ error: "Erreur lors de l'ajout de la dépense", isLoading: false });
      return null;
    }
  },

  // TICKET — lier un ticket OCR déjà uploadé à une dépense (sauvegarde backend)
  linkTicketToExpense: async ({ ticketId, expenseId, extractedData }) => {
    try {
      const jwt = localStorage.getItem('jwt');
      await fetch(`${BASE}/ticket/link`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ticketId, expenseId, extractedData, jwt }),
      });
    } catch (err) {
      console.warn('⚠️ linkTicketToExpense failed (non-bloquant):', err);
    }
  },

  // TICKET — attacher / remplacer
  attachTicket: async (id, file) => {
    try {
      const jwt = localStorage.getItem('jwt');
      const fd  = new FormData();
      fd.append('ticket', file);
      fd.append('jwt', jwt);
      const res = await fetch(`${BASE}/action/${id}/ticket`, { method: 'PATCH', body: fd });
      if (!res.ok) return false;
      const userId = parseInt(localStorage.getItem('utilisateur'));
      set((s) => ({ _lastFetched: { ...s._lastFetched, expenses: 0 } }));
      await get().fetchExpenses(userId, { force: true });
      return true;
    } catch {
      return false;
    }
  },

  // TICKET — supprimer
  removeTicket: async (id) => {
    try {
      const jwt = localStorage.getItem('jwt');
      const res = await fetch(`${BASE}/action/${id}/ticket`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt }),
      });
      if (!res.ok) return false;
      const userId = parseInt(localStorage.getItem('utilisateur'));
      set((s) => ({ _lastFetched: { ...s._lastFetched, expenses: 0 } }));
      await get().fetchExpenses(userId, { force: true });
      return true;
    } catch {
      return false;
    }
  },

  // EXPENSES — update
  updateExpense: async (id, expense) => {
    set({ isLoading: true, error: null });
    try {
      const jwt    = localStorage.getItem('jwt');
      const userId = parseInt(localStorage.getItem('utilisateur'));

      const date          = new Date(expense.dateTransaction);
      const dateFormatted = date.toLocaleString('zh-CN', { timeZone: 'Europe/Paris' });

      const body = {
        montant:         parseFloat(expense.montant),
        categorie:       parseInt(expense.categorie),
        description:     expense.description,
        dateTransaction: dateFormatted,
        jwt,
      };

      const response = await fetch(`${BASE}/action/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        set({ error: 'Erreur lors de la mise à jour', isLoading: false });
        return false;
      }

      set((s) => ({ _lastFetched: { ...s._lastFetched, expenses: 0 } }));
      await get().fetchExpenses(userId, { force: true });
      return true;
    } catch {
      set({ error: 'Erreur lors de la mise à jour', isLoading: false });
      return false;
    }
  },

  // EXPENSES — delete
  deleteExpense: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const jwt    = localStorage.getItem('jwt');
      const userId = parseInt(localStorage.getItem('utilisateur'));

      const response = await fetch(`${BASE}/action/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt }),
      });

      if (!response.ok) {
        set({ error: 'Erreur lors de la suppression', isLoading: false });
        return false;
      }

      // Clean up any linked ticket
      const { removeTicketLink } = await import('../utils/ticketLinks.js');
      removeTicketLink(id);

      set((s) => ({ _lastFetched: { ...s._lastFetched, expenses: 0 } }));
      await get().fetchExpenses(userId, { force: true });
      return true;
    } catch {
      set({ error: 'Erreur lors de la suppression', isLoading: false });
      return false;
    }
  },

  // ========================================
  // CATEGORIES — fetch
  // ========================================
  fetchCategories: async (userId, { force = false } = {}) => {
    const uid = userId ?? localStorage.getItem('utilisateur');
    if (!uid) return;

    const { _lastFetched, CACHE_TTL } = get();
    if (!force && Date.now() - _lastFetched.categories < CACHE_TTL) return;

    set({ isLoading: true, error: null });
    try {
      const response = await api.get(`/categorie/byuser/${uid}`);
      set((s) => ({
        categories: response.data ?? [],
        isLoading: false,
        _lastFetched: { ...s._lastFetched, categories: Date.now() },
      }));
    } catch {
      set({ error: 'Erreur lors du chargement des catégories', isLoading: false });
    }
  },

  // CATEGORIES — add
  addCategory: async (category) => {
    set({ isLoading: true, error: null });
    try {
      await api.post('/categorie', category);
      const userId = localStorage.getItem('utilisateur');
      set((s) => ({ _lastFetched: { ...s._lastFetched, categories: 0 } }));
      await get().fetchCategories(userId, { force: true });
      useGamifyStore.getState().onCategoryAdded();
      return true;
    } catch {
      set({ error: "Erreur lors de l'ajout de la catégorie", isLoading: false });
      return false;
    }
  },

  // CATEGORIES — update
  updateCategory: async (id, category) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${BASE}/categorie/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(category),
      });

      if (!response.ok) {
        set({ error: 'Erreur lors de la mise à jour de la catégorie', isLoading: false });
        return false;
      }

      const userId = localStorage.getItem('utilisateur');
      set((s) => ({ _lastFetched: { ...s._lastFetched, categories: 0 } }));
      await get().fetchCategories(userId, { force: true });
      return true;
    } catch {
      set({ error: 'Erreur lors de la mise à jour de la catégorie', isLoading: false });
      return false;
    }
  },

  // CATEGORIES — delete
  deleteCategory: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const jwt = localStorage.getItem('jwt');

      const response = await fetch(`${BASE}/categorie/${id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jwt }),
      });

      if (!response.ok) {
        set({ error: 'Erreur lors de la suppression de la catégorie', isLoading: false });
        return false;
      }

      const userId = localStorage.getItem('utilisateur');
      set((s) => ({ _lastFetched: { ...s._lastFetched, categories: 0 } }));
      await get().fetchCategories(userId, { force: true });
      return true;
    } catch {
      set({ error: 'Erreur lors de la suppression de la catégorie', isLoading: false });
      return false;
    }
  },

  // EXPENSES — copy all expenses from one month to another with a chosen date
  // targetDateISO : 'YYYY-MM-DD' — all copied expenses get this exact date
  copyMonthExpenses: async (sourceMonth, sourceYear, targetDateISO) => {
    const { expenses, categories } = get();
    const jwt    = localStorage.getItem('jwt');
    const userId = parseInt(localStorage.getItem('utilisateur'));

    // Filter expenses for the source month
    const sourceExpenses = expenses.filter((exp) => {
      if (!exp.dateTransaction) return false;
      const d = new Date(exp.dateTransaction.toString().replace(/\//g, '-'));
      return d.getMonth() === sourceMonth && d.getFullYear() === sourceYear;
    });

    if (sourceExpenses.length === 0) return { success: false, count: 0, total: 0 };

    // Build name→id map so we can resolve category IDs
    const catNameToId = {};
    categories.forEach((c) => { catNameToId[c.categorie] = c.id; });

    // Format the user-chosen date the same way addExpense does
    const chosenDate    = new Date(targetDateISO);
    const dateFormatted = chosenDate.toLocaleString('zh-CN', { timeZone: 'Europe/Paris' });

    let successCount = 0;
    for (const exp of sourceExpenses) {
      try {

        // Resolve category ID (API may return name or numeric id)
        let catId;
        if (exp.categorie_id)       catId = parseInt(exp.categorie_id);
        else if (!isNaN(exp.categorie)) catId = parseInt(exp.categorie);
        else                         catId = catNameToId[exp.categorie];
        if (!catId) continue;

        const response = await fetch(`${BASE}/action`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            montant:         parseFloat(exp.montant),
            categorie:       catId,
            description:     exp.description,
            user:            userId,
            dateTransaction: dateFormatted,
            jwt,
          }),
        });
        if (response.ok) successCount++;
      } catch {
        // Continue with remaining expenses
      }
    }

    set((s) => ({ _lastFetched: { ...s._lastFetched, expenses: 0 } }));
    await get().fetchExpenses(userId, { force: true });

    return { success: successCount > 0, count: successCount, total: sourceExpenses.length };
  },

  // ========================================
  // REVENUES — fetch
  // ========================================
  fetchRevenues: async ({ force = false } = {}) => {
    const { _lastFetched, CACHE_TTL } = get();
    if (!force && Date.now() - _lastFetched.revenues < CACHE_TTL) return;

    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${BASE}/revenues`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('jwt')}` },
      });

      if (!response.ok) {
        set({ error: 'Erreur lors du chargement des revenus', isLoading: false });
        return;
      }

      const data     = await response.json();
      const revenues = Array.isArray(data) ? data : data?.revenus ?? [];
      set((s) => ({
        revenues,
        isLoading: false,
        _lastFetched: { ...s._lastFetched, revenues: Date.now() },
      }));
    } catch {
      set({ error: 'Erreur lors du chargement des revenus', isLoading: false });
    }
  },

  // REVENUES — add
  addRevenue: async (revenue) => {
    set({ isLoading: true, error: null });
    try {
      const body = {
        name:   revenue.nom,
        amount: parseFloat(revenue.montant),
        date:   revenue.dateRevenu,
      };

      const response = await fetch(`${BASE}/revenues`, {
        method: 'POST',
        headers: jsonHeaders(),
        body: JSON.stringify(body),
      });

      if (!response.ok) {
        set({ error: "Erreur lors de l'ajout du revenu", isLoading: false });
        return false;
      }

      set((s) => ({ _lastFetched: { ...s._lastFetched, revenues: 0 } }));
      await get().fetchRevenues({ force: true });
      useGamifyStore.getState().onRevenueAdded();
      return true;
    } catch {
      set({ error: "Erreur lors de l'ajout du revenu", isLoading: false });
      return false;
    }
  },

  // REVENUES — delete
  deleteRevenue: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await fetch(`${BASE}/revenues/${id}`, {
        method: 'DELETE',
        headers: jsonHeaders(),
      });

      if (!response.ok) {
        set({ error: 'Erreur lors de la suppression', isLoading: false });
        return false;
      }

      set((s) => ({ _lastFetched: { ...s._lastFetched, revenues: 0 } }));
      await get().fetchRevenues({ force: true });
      return true;
    } catch {
      set({ error: 'Erreur lors de la suppression', isLoading: false });
      return false;
    }
  },

  // ========================================
  // FILTERS & SEARCH
  // ========================================
  setSearchTerm:         (term)       => set({ searchTerm: term }),
  setSelectedCategories: (categories) => set({ selectedCategories: categories }),
  setDateRange:          (range)      => set({ dateRange: range }),
  setAmountRange:        (range)      => set({ amountRange: range }),

  resetFilters: () =>
    set({
      searchTerm:         '',
      selectedCategories: [],
      dateRange:          { start: null, end: null },
      amountRange:        { min: null, max: null },
    }),

  // ========================================
  // COMPUTED / SELECTORS
  // ========================================
  getFilteredExpenses: () => {
    const state = get();
    let filtered = [...state.expenses];

    if (state.searchTerm) {
      const term = state.searchTerm.toLowerCase();
      filtered = filtered.filter(
        (e) =>
          e.description?.toLowerCase().includes(term) ||
          e.categorie?.toLowerCase().includes(term)
      );
    }

    if (state.selectedCategories.length > 0) {
      filtered = filtered.filter((e) => state.selectedCategories.includes(e.categorie));
    }

    if (state.dateRange.start || state.dateRange.end) {
      filtered = filtered.filter((e) => {
        const d     = new Date(e.dateTransaction);
        const start = state.dateRange.start ? new Date(state.dateRange.start) : null;
        const end   = state.dateRange.end   ? new Date(state.dateRange.end)   : null;
        if (start && d < start) return false;
        if (end   && d > end)   return false;
        return true;
      });
    }

    if (state.amountRange.min !== null || state.amountRange.max !== null) {
      filtered = filtered.filter((e) => {
        const amt = parseFloat(e.montant);
        if (state.amountRange.min !== null && amt < state.amountRange.min) return false;
        if (state.amountRange.max !== null && amt > state.amountRange.max) return false;
        return true;
      });
    }

    return filtered;
  },

  getTotalExpenses: () =>
    get().expenses.reduce((sum, e) => sum + parseFloat(e.montant || 0), 0),

  getTotalRevenues: () =>
    get().revenues.reduce((sum, r) => {
      const amount = r.amount ?? r.montant ?? 0;
      return sum + parseFloat(amount);
    }, 0),

  getExpensesByCategory: () => {
    const byCategory = {};
    get().expenses.forEach((e) => {
      const cat = e.categorie || 'Sans catégorie';
      if (!byCategory[cat]) byCategory[cat] = { total: 0, count: 0 };
      byCategory[cat].total += parseFloat(e.montant || 0);
      byCategory[cat].count += 1;
    });
    return byCategory;
  },

  getMonthlyExpenses: () => {
    const byMonth = {};
    get().expenses.forEach((e) => {
      const date     = new Date(e.dateTransaction);
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      if (!byMonth[monthKey]) byMonth[monthKey] = 0;
      byMonth[monthKey] += parseFloat(e.montant || 0);
    });
    return byMonth;
  },
}));

export default useAppStore;
