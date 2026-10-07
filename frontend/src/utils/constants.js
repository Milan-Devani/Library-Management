export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

export const STATUS_COLORS = {
  Available: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  Unavailable: { bg: 'bg-rose-100', text: 'text-rose-800', border: 'border-rose-200' },
  Issued: { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' },
  Overdue: { bg: 'bg-red-100', text: 'text-red-800', border: 'border-red-200' },
  Returned: { bg: 'bg-emerald-100', text: 'text-emerald-800', border: 'border-emerald-200' },
  Pending: { bg: 'bg-amber-100', text: 'text-amber-800', border: 'border-amber-200' },
  Paid: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  Active: { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' },
  Inactive: { bg: 'bg-slate-100', text: 'text-slate-700', border: 'border-slate-200' },
};

export const DEFAULT_PAGE_LIMIT = 10;
export const CURRENCY_SYMBOL = '₹';
