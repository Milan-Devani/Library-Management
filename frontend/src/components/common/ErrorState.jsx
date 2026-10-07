import React from 'react';
import { FiAlertCircle, FiRefreshCw } from 'react-icons/fi';
import Button from './Button';

const ErrorState = ({
  title = 'Something went wrong',
  message = 'Unable to load data. Please verify your connection or try again.',
  onRetry = null,
  className = ''
}) => {
  return (
    <div className={`p-6 bg-red-50 border border-red-200 rounded-xl text-center ${className}`}>
      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600 mx-auto mb-3">
        <FiAlertCircle className="h-6 w-6" />
      </div>
      <h3 className="text-base font-semibold text-red-900 mb-1">{title}</h3>
      <p className="text-sm text-red-700 max-w-md mx-auto mb-4">{message}</p>
      {onRetry && (
        <Button variant="danger" size="sm" icon={FiRefreshCw} onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
