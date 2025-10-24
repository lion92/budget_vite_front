// ========================================
// CATEGORIES UTILITIES
// ========================================

/**
 * Predefined categories with icons and colors
 */
export const DEFAULT_CATEGORIES = [
  // Alimentation
  { name: 'Alimentation', icon: '🍽️', color: '#ef4444' },
  { name: 'Supermarché', icon: '🛒', color: '#f97316' },
  { name: 'Restaurant', icon: '🍴', color: '#f59e0b' },
  { name: 'Café', icon: '☕', color: '#eab308' },
  { name: 'Fast-food', icon: '🍔', color: '#84cc16' },

  // Transport
  { name: 'Transport', icon: '🚗', color: '#22c55e' },
  { name: 'Essence', icon: '⛽', color: '#10b981' },
  { name: 'Parking', icon: '🅿️', color: '#14b8a6' },
  { name: 'Transport public', icon: '🚌', color: '#06b6d4' },
  { name: 'Taxi', icon: '🚕', color: '#0ea5e9' },

  // Logement
  { name: 'Loyer', icon: '🏠', color: '#3b82f6' },
  { name: 'Électricité', icon: '💡', color: '#6366f1' },
  { name: 'Eau', icon: '💧', color: '#8b5cf6' },
  { name: 'Internet', icon: '📡', color: '#a855f7' },
  { name: 'Assurance', icon: '🛡️', color: '#d946ef' },

  // Santé
  { name: 'Santé', icon: '🏥', color: '#ec4899' },
  { name: 'Pharmacie', icon: '💊', color: '#f43f5e' },
  { name: 'Médecin', icon: '⚕️', color: '#e11d48' },
  { name: 'Dentiste', icon: '🦷', color: '#be123c' },

  // Loisirs
  { name: 'Loisirs', icon: '🎮', color: '#64748b' },
  { name: 'Sport', icon: '⚽', color: '#475569' },
  { name: 'Cinéma', icon: '🎬', color: '#334155' },
  { name: 'Musique', icon: '🎵', color: '#1e293b' },
  { name: 'Livres', icon: '📚', color: '#0f172a' },

  // Shopping
  { name: 'Vêtements', icon: '👔', color: '#dc2626' },
  { name: 'Chaussures', icon: '👟', color: '#ea580c' },
  { name: 'Cosmétiques', icon: '💄', color: '#ca8a04' },
  { name: 'Cadeaux', icon: '🎁', color: '#65a30d' },

  // Éducation
  { name: 'Éducation', icon: '🎓', color: '#059669' },
  { name: 'Formation', icon: '📖', color: '#0d9488' },
  { name: 'Fournitures', icon: '✏️', color: '#0891b2' },

  // Technologie
  { name: 'Téléphone', icon: '📱', color: '#0284c7' },
  { name: 'Ordinateur', icon: '💻', color: '#4f46e5' },
  { name: 'Logiciels', icon: '💿', color: '#7c3aed' },

  // Famille
  { name: 'Enfants', icon: '👶', color: '#c026d3' },
  { name: 'Animaux', icon: '🐕', color: '#db2777' },
  { name: 'Garde d\'enfants', icon: '👨‍👩‍👧', color: '#e11d48' },

  // Autres
  { name: 'Autre', icon: '📝', color: '#6b7280' },
  { name: 'Divers', icon: '🔧', color: '#4b5563' },
];

/**
 * Get category color
 */
export const getCategoryColor = (categoryName) => {
  const category = DEFAULT_CATEGORIES.find(
    (cat) => cat.name.toLowerCase() === categoryName?.toLowerCase()
  );
  return category?.color || '#6b7280';
};

/**
 * Get category icon
 */
export const getCategoryIcon = (categoryName) => {
  const category = DEFAULT_CATEGORIES.find(
    (cat) => cat.name.toLowerCase() === categoryName?.toLowerCase()
  );
  return category?.icon || '📝';
};

/**
 * Get random color for new category
 */
export const getRandomColor = () => {
  const colors = [
    '#ef4444', '#f97316', '#f59e0b', '#eab308', '#84cc16',
    '#22c55e', '#10b981', '#14b8a6', '#06b6d4', '#0ea5e9',
    '#3b82f6', '#6366f1', '#8b5cf6', '#a855f7', '#d946ef',
    '#ec4899', '#f43f5e'
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

/**
 * Get category statistics
 */
export const getCategoryStats = (expenses) => {
  const stats = {};

  expenses.forEach((expense) => {
    const cat = expense.categorie || 'Autre';
    if (!stats[cat]) {
      stats[cat] = {
        total: 0,
        count: 0,
        color: getCategoryColor(cat),
        icon: getCategoryIcon(cat)
      };
    }
    stats[cat].total += parseFloat(expense.montant || 0);
    stats[cat].count += 1;
  });

  return Object.entries(stats)
    .map(([name, data]) => ({ name, ...data }))
    .sort((a, b) => b.total - a.total);
};
