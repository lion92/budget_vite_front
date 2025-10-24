// ========================================
// FORMATTERS UTILITIES
// ========================================

/**
 * Format a number as currency (EUR)
 */
export const formatCurrency = (amount) => {
  if (amount === null || amount === undefined) return '0,00 €';

  const num = parseFloat(amount);
  if (isNaN(num)) return '0,00 €';

  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR',
  }).format(num);
};

/**
 * Format a date
 */
export const formatDate = (date, format = 'short') => {
  if (!date) return '';

  const d = new Date(date);
  if (isNaN(d.getTime())) return '';

  if (format === 'short') {
    return d.toLocaleDateString('fr-FR');
  }

  if (format === 'long') {
    return d.toLocaleDateString('fr-FR', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  }

  if (format === 'month-year') {
    return d.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
    });
  }

  return d.toLocaleDateString('fr-FR');
};

/**
 * Format a number with spaces as thousand separator
 */
export const formatNumber = (num) => {
  if (num === null || num === undefined) return '0';

  const n = parseFloat(num);
  if (isNaN(n)) return '0';

  return new Intl.NumberFormat('fr-FR').format(n);
};

/**
 * Capitalize first letter
 */
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

/**
 * Get month name from date
 */
export const getMonthName = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', { month: 'long' });
};

/**
 * Get month and year from date
 */
export const getMonthYear = (date) => {
  const d = new Date(date);
  return d.toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' });
};

/**
 * Parse date string to Date object
 */
export const parseDate = (dateString) => {
  if (!dateString) return null;
  const date = new Date(dateString);
  return isNaN(date.getTime()) ? null : date;
};

/**
 * Get ISO date string (YYYY-MM-DD)
 */
export const toISODate = (date) => {
  if (!date) return '';
  const d = new Date(date);
  if (isNaN(d.getTime())) return '';
  return d.toISOString().split('T')[0];
};

/**
 * Truncate text
 */
export const truncate = (text, maxLength = 50) => {
  if (!text) return '';
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};
