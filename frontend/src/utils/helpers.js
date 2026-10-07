import { CURRENCY_SYMBOL } from './constants';

export const formatDate = (dateStr) => {
  if (!dateStr) return '—';
  try {
    const date = new Date(dateStr);
    if (isNaN(date.getTime())) return dateStr;
    return date.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};

export const formatCurrency = (val) => {
  const num = Number(val) || 0;
  return `${CURRENCY_SYMBOL}${num.toFixed(2)}`;
};

export const getErrorMessage = (error, defaultMessage = 'An unexpected error occurred') => {
  if (!error) return defaultMessage;
  if (typeof error === 'string') return error;
  if (error.response && error.response.data) {
    if (error.response.data.message) {
      return error.response.data.message;
    }
    if (error.response.data.errors) {
      const errs = error.response.data.errors;
      const firstKey = Object.keys(errs)[0];
      return errs[firstKey];
    }
  }
  return error.message || defaultMessage;
};

export const calculateDaysDiff = (date1, date2) => {
  const d1 = new Date(date1);
  const d2 = new Date(date2);
  const diffTime = d2 - d1;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
