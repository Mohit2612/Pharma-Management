import React from 'react';
import { AlertCircle } from 'lucide-react';
import Button from './Button';

const ErrorState = ({ 
  title = "Something went wrong", 
  message = "An error occurred while loading this data. Please try again.",
  onRetry 
}) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-red-100 bg-red-50/30">
      <div className="p-4 rounded-full bg-red-100 text-red-500 mb-4">
        <AlertCircle size={48} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-6">{message}</p>
      
      {onRetry && (
        <Button variant="outline" onClick={onRetry}>
          Try Again
        </Button>
      )}
    </div>
  );
};

export default ErrorState;
