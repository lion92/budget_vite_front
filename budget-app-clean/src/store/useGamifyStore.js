import { create } from 'zustand';
import { toast } from 'react-toastify';

export const LEVELS = [
  { level: 1, minXP: 0,    title: 'Débutant',     color: '#94a3b8', emoji: '🌱' },
  { level: 2, minXP: 100,  title: 'Apprenti',     color: '#60a5fa', emoji: '📘' },
  { level: 3, minXP: 300,  title: 'Comptable',    color: '#34d399', emoji: '📊' },
  { level: 4, minXP: 600,  title: 'Gestionnaire', color: '#a78bfa', emoji: '💼' },
  { level: 5, minXP: 1000, title: 'Expert',        color: '#f59e0b', emoji: '🏅' },
  { level: 6, minXP: 1500, title: 'Maître',        color: '#ef4444', emoji: '👑' },
];

export const BADGES = [
  { id: 'first_expense',  label: 'Premier pas',     icon: '🎯', desc: 'Première dépense ajoutée',       xp: 10  },
  { id: 'first_revenue',  label: 'Revenu régulier', icon: '💰', desc: 'Premier revenu ajouté',           xp: 15  },
  { id: 'first_category', label: 'Organisé',        icon: '📁', desc: 'Première catégorie créée',        xp: 20  },
  { id: 'ten_expenses',   label: 'Prolifique',      icon: '📈', desc: '10 dépenses enregistrées',        xp: 50  },
  { id: 'fifty_expenses', label: 'Comptable pro',   icon: '🏆', desc: '50 dépenses enregistrées',        xp: 100 },
  { id: 'streak_3',       label: 'Régulier',        icon: '🔥', desc: '3 jours consécutifs',             xp: 30  },
  { id: 'streak_7',       label: 'Assidu',          icon: '⚡', desc: '7 jours consécutifs',             xp: 75  },
  { id: 'level_3',        label: 'Comptable confirmé', icon: '⭐', desc: 'Atteindre le niveau 3',        xp: 0   },
  { id: 'level_5',        label: 'Expert financier', icon: '💎', desc: 'Atteindre le niveau 5',          xp: 0   },
  { id: 'saver',          label: 'Épargnant',       icon: '🐷', desc: 'Taux d\'épargne > 20%',           xp: 60  },
  { id: 'analyst',        label: 'Analyste',        icon: '🔍', desc: 'Consulter la page Analytics',     xp: 20  },
];

const STORAGE_KEY = 'budget_gamify';

const loadPersistedState = () => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
};

const persist = (state) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({
      xp:        state.xp,
      badges:    state.badges,
      streak:    state.streak,
      lastLogin: state.lastLogin,
      expenseCount: state.expenseCount,
    }));
  } catch {}
};

const computeLevel = (xp) => {
  let current = LEVELS[0];
  for (const lvl of LEVELS) {
    if (xp >= lvl.minXP) current = lvl;
  }
  return current;
};

const nextLevel = (xp) => {
  for (const lvl of LEVELS) {
    if (xp < lvl.minXP) return lvl;
  }
  return null;
};

const saved = loadPersistedState();

const useGamifyStore = create((set, get) => ({
  xp:           saved?.xp           ?? 0,
  badges:       saved?.badges        ?? [],
  streak:       saved?.streak        ?? 0,
  lastLogin:    saved?.lastLogin     ?? null,
  expenseCount: saved?.expenseCount  ?? 0,

  getCurrentLevel: () => computeLevel(get().xp),
  getNextLevel:    () => nextLevel(get().xp),

  addXP: (amount, reason) => {
    const prevXP    = get().xp;
    const prevLevel = computeLevel(prevXP);
    const newXP     = prevXP + amount;
    const newLevel  = computeLevel(newXP);

    set((s) => {
      const next = { ...s, xp: newXP };
      persist(next);
      return next;
    });

    if (newLevel.level > prevLevel.level) {
      toast.success(
        `${newLevel.emoji} Niveau ${newLevel.level} atteint — ${newLevel.title} !`,
        { icon: false, toastId: `levelup-${newLevel.level}` }
      );
      get().checkBadge('level_3', newLevel.level >= 3);
      get().checkBadge('level_5', newLevel.level >= 5);
    }

    if (reason) {
      toast.info(`+${amount} XP — ${reason}`, {
        autoClose: 2000,
        toastId: `xp-${reason}-${Date.now()}`,
        style: { fontSize: '0.85rem' },
      });
    }
  },

  unlockBadge: (badgeId) => {
    const { badges } = get();
    if (badges.includes(badgeId)) return;

    const badge = BADGES.find((b) => b.id === badgeId);
    if (!badge) return;

    set((s) => {
      const next = { ...s, badges: [...s.badges, badgeId] };
      persist(next);
      return next;
    });

    toast.success(`${badge.icon} Badge débloqué : ${badge.label} !`, {
      toastId: `badge-${badgeId}`,
      autoClose: 4000,
    });

    if (badge.xp > 0) get().addXP(badge.xp, null);
  },

  checkBadge: (badgeId, condition) => {
    if (condition && !get().badges.includes(badgeId)) {
      get().unlockBadge(badgeId);
    }
  },

  onExpenseAdded: (totalCount) => {
    const newCount = totalCount;
    set((s) => {
      const next = { ...s, expenseCount: newCount };
      persist(next);
      return next;
    });
    get().addXP(10, 'Dépense ajoutée');
    get().checkBadge('first_expense', newCount >= 1);
    get().checkBadge('ten_expenses',  newCount >= 10);
    get().checkBadge('fifty_expenses',newCount >= 50);
  },

  onRevenueAdded: () => {
    get().addXP(15, 'Revenu ajouté');
    get().checkBadge('first_revenue', true);
  },

  onCategoryAdded: () => {
    get().addXP(20, 'Catégorie créée');
    get().checkBadge('first_category', true);
  },

  onAnalyticsVisited: () => {
    get().checkBadge('analyst', true);
  },

  onSaverAchieved: () => {
    get().checkBadge('saver', true);
  },

  checkStreak: () => {
    const { lastLogin, streak } = get();
    const today     = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    if (lastLogin === today) return;

    let newStreak = 1;
    if (lastLogin === yesterday) {
      newStreak = streak + 1;
    }

    set((s) => {
      const next = { ...s, streak: newStreak, lastLogin: today };
      persist(next);
      return next;
    });

    if (newStreak > 1) {
      get().addXP(5 * newStreak, `${newStreak} jours consécutifs`);
    }

    get().checkBadge('streak_3', newStreak >= 3);
    get().checkBadge('streak_7', newStreak >= 7);
  },
}));

export default useGamifyStore;
