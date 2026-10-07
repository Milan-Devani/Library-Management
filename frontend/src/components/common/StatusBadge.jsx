import React from 'react';
import { STATUS_COLORS } from '../../utils/constants';

const StatusBadge = ({ status, className = '' }) => {
  const style = STATUS_COLORS[status] || {
    bg: 'bg-slate-100',
    text: 'text-slate-700',
    border: 'border-slate-200'
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style.bg} ${style.text} ${style.border} ${className}`}
    >
      <span className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current opacity-70" />
      {status}
    </span>
  );
};

export default StatusBadge;
