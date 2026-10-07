import React from 'react';

const StatCard = ({
  title,
  value,
  subtitle = null,
  icon: Icon,
  color = 'blue',
  className = ''
}) => {
  const colorStyles = {
    blue: { bg: 'bg-blue-50', text: 'text-blue-600', ring: 'ring-blue-100' },
    emerald: { bg: 'bg-emerald-50', text: 'text-emerald-600', ring: 'ring-emerald-100' },
    amber: { bg: 'bg-amber-50', text: 'text-amber-600', ring: 'ring-amber-100' },
    rose: { bg: 'bg-rose-50', text: 'text-rose-600', ring: 'ring-rose-100' },
    purple: { bg: 'bg-purple-50', text: 'text-purple-600', ring: 'ring-purple-100' },
    indigo: { bg: 'bg-indigo-50', text: 'text-indigo-600', ring: 'ring-indigo-100' },
    slate: { bg: 'bg-slate-50', text: 'text-slate-600', ring: 'ring-slate-100' },
  };

  const currentStyle = colorStyles[color] || colorStyles.blue;

  return (
    <div className={`bg-white rounded-xl border border-slate-200 p-5 shadow-sm hover:shadow-md transition-shadow ${className}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500">{title}</p>
          <h4 className="text-2xl font-bold text-slate-800 mt-1">{value}</h4>
          {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
        </div>
        {Icon && (
          <div className={`p-3 rounded-xl ${currentStyle.bg} ${currentStyle.text} ring-4 ${currentStyle.ring} shrink-0`}>
            <Icon className="text-2xl" />
          </div>
        )}
      </div>
    </div>
  );
};

export default StatCard;
