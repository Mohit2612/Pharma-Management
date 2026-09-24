import React from 'react';

const SkeletonCard = () => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-slate-100 flex flex-col h-full overflow-hidden animate-pulse">
      <div className="aspect-square w-full bg-slate-100"></div>
      <div className="p-5 flex flex-col flex-1 space-y-3">
        <div className="h-3 bg-slate-100 rounded w-1/4"></div>
        <div className="h-5 bg-slate-100 rounded w-3/4"></div>
        <div className="h-4 bg-slate-100 rounded w-full"></div>
        <div className="h-4 bg-slate-100 rounded w-5/6"></div>
        <div className="flex justify-between items-center pt-4 border-t border-slate-50 mt-auto">
          <div className="h-6 bg-slate-100 rounded w-1/4"></div>
          <div className="h-8 w-8 bg-slate-100 rounded-full"></div>
        </div>
      </div>
    </div>
  );
};

export default SkeletonCard;
