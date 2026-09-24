import React from 'react';
import useAuthStore from '../store/useAuthStore';
import { LogOut } from 'lucide-react';

const AdminTopbar = () => {
  const { user, logout } = useAuthStore();

  return (
    <header className="bg-white shadow-sm h-16 flex items-center justify-between px-6 z-10 relative">
      <div className="flex items-center">
        {/* Mobile menu button would go here */}
      </div>
      
      <div className="flex items-center gap-4">
        <div className="text-sm">
          <span className="text-slate-500 block text-right text-xs">Logged in as</span>
          <span className="font-semibold text-slate-800">{user?.firstName} {user?.lastName}</span>
        </div>
        <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold">
          {user?.firstName?.charAt(0) || 'A'}
        </div>
        <button 
          onClick={logout}
          className="ml-2 p-2 text-slate-400 hover:text-red-500 transition-colors rounded-full hover:bg-slate-100"
          title="Logout"
        >
          <LogOut size={20} />
        </button>
      </div>
    </header>
  );
};

export default AdminTopbar;
