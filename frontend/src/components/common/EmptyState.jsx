import React from 'react';
import { FiInbox } from 'react-icons/fi';
import Button from './Button';

const EmptyState = ({
  icon: Icon = FiInbox,
  title = 'No records found',
  description = 'There is currently no data matching your criteria.',
  actionText = null,
  onAction = null,
  actionIcon = null,
  className = ''
}) => {
  return (
    <div className={`flex flex-col items-center justify-center p-12 text-center bg-white rounded-xl border border-slate-200 shadow-sm ${className}`}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-50 text-blue-600 mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-base font-semibold text-slate-800 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 max-w-sm mb-6">{description}</p>
      {actionText && onAction && (
        <Button onClick={onAction} icon={actionIcon} variant="primary" size="md">
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
