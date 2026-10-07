import React from 'react';

const Skeleton = ({ className = '', count = 1, variant = 'text' }) => {
  const items = Array.from({ length: count }, (_, i) => i);

  if (variant === 'table') {
    return (
      <div className="w-full space-y-3 animate-pulse p-4">
        <div className="h-6 bg-slate-200 rounded w-full" />
        {items.map((i) => (
          <div key={i} className="h-10 bg-slate-100 rounded w-full" />
        ))}
      </div>
    );
  }

  if (variant === 'card') {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 w-full animate-pulse">
        {items.map((i) => (
          <div key={i} className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm space-y-3">
            <div className="h-4 bg-slate-200 rounded w-1/2" />
            <div className="h-8 bg-slate-200 rounded w-3/4" />
            <div className="h-3 bg-slate-100 rounded w-1/3" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {items.map((i) => (
        <div key={i} className={`animate-pulse bg-slate-200 rounded ${className || 'h-4 w-full'}`} />
      ))}
    </div>
  );
};

export default Skeleton;
