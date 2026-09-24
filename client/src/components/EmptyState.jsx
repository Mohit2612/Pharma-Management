import React from 'react';
import { PackageOpen } from 'lucide-react';
import Button from './Button';
import { useNavigate } from 'react-router-dom';

const EmptyState = ({ 
  title = "No items found", 
  message = "We couldn't find anything matching your search.", 
  actionText, 
  actionPath,
  icon: Icon = PackageOpen 
}) => {
  const navigate = useNavigate();
  
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white rounded-lg border border-slate-200 border-dashed">
      <div className="p-4 rounded-full bg-slate-50 text-slate-400 mb-4">
        <Icon size={48} strokeWidth={1.5} />
      </div>
      <h3 className="text-lg font-semibold text-slate-800 mb-2">{title}</h3>
      <p className="text-slate-500 max-w-sm mb-6">{message}</p>
      
      {actionText && actionPath && (
        <Button onClick={() => navigate(actionPath)}>
          {actionText}
        </Button>
      )}
    </div>
  );
};

export default EmptyState;
