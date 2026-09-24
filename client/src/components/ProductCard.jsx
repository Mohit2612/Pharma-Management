import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import Button from './Button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cartApi';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatCurrency';

const ProductCard = ({ product }) => {
  const { isAuthenticated } = useAuthStore();
  const queryClient = useQueryClient();

  const addToCartMutation = useMutation({
    mutationFn: () => cartApi.addToCart({ productId: product._id, quantity: 1 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`${product.title} added to cart`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add to cart');
    },
  });

  const handleAddToCart = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isAuthenticated) {
      toast.error('Please login to add items to cart');
      return;
    }
    addToCartMutation.mutate();
  };

  return (
    <Link 
      to={`/product/${product._id}`} 
      className="bg-white rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-all duration-300 flex flex-col h-full group overflow-hidden"
    >
      <div className="relative aspect-square w-full bg-slate-50 flex items-center justify-center overflow-hidden">
        {product.image ? (
          <img 
            src={product.image.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${product.image}` : product.image} 
            alt={product.title}
            className="object-contain h-48 w-48 group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="text-slate-400 text-sm">No Image</div>
        )}
        {product.stock === 0 && (
          <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-semibold px-2.5 py-1 rounded">Out of Stock</span>
        )}
      </div>

      <div className="p-5 flex flex-col flex-1">
        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">{product.brand}</span>
        <h3 className="font-semibold text-slate-800 text-base mb-2 group-hover:text-primary transition-colors line-clamp-1">{product.title}</h3>
        <p className="text-sm text-slate-500 line-clamp-2 mb-4 flex-1">{product.description}</p>
        
        <div className="flex items-center justify-between mt-auto pt-4 border-t border-slate-50">
          <span className="text-lg font-bold text-slate-900">{formatCurrency(product.price)}</span>
          <Button 
            onClick={handleAddToCart}
            disabled={product.stock === 0 || addToCartMutation.isPending}
            className="p-2 rounded-full"
            variant="ghost"
          >
            <ShoppingCart size={18} className="text-primary hover:text-primary-dark" />
          </Button>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
