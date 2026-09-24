import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart, User, LogOut, HeartPulse } from 'lucide-react';
import useAuthStore from '../store/useAuthStore';
import { useQuery } from '@tanstack/react-query';
import { cartApi } from '../api/cartApi';

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  
  const { data: cartData } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
    enabled: isAuthenticated,
  });

  const cartItemCount = cartData?.data?.items?.reduce((acc, item) => acc + item.quantity, 0) || 0; 

  return (
    <nav className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <HeartPulse className="h-8 w-8 text-primary" />
              <span className="text-xl font-bold text-slate-800 tracking-tight">Pharma<span className="text-primary">.com</span></span>
            </Link>
            
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link to="/" className="text-slate-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">Home</Link>
              <Link to="/store" className="text-slate-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">Store</Link>
              <Link to="/about" className="text-slate-600 hover:text-primary px-3 py-2 text-sm font-medium transition-colors">About Us</Link>
            </div>
          </div>
          
          <div className="flex items-center gap-4">
            <Link to="/cart" className="relative p-2 text-slate-600 hover:text-primary transition-colors">
              <ShoppingCart className="h-6 w-6" />
              {cartItemCount > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-secondary rounded-full">
                  {cartItemCount}
                </span>
              )}
            </Link>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-4 border-l pl-4 ml-2 border-slate-200">
                <span className="text-sm font-medium text-slate-700 hidden sm:block">
                  Hi, {user?.firstName}
                </span>
                <Link to="/orders" className="text-slate-600 hover:text-primary">
                  <User className="h-5 w-5" />
                </Link>
                <button onClick={logout} className="text-slate-600 hover:text-red-500 transition-colors">
                  <LogOut className="h-5 w-5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-3 ml-2">
                <Link to="/login" className="text-sm font-medium text-slate-600 hover:text-primary">Log in</Link>
                <Link to="/signup" className="text-sm font-medium bg-primary text-white px-4 py-2 rounded-md hover:bg-primary-light transition-colors">Sign up</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
