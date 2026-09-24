import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import { cartApi } from '../api/cartApi';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import Button from '../components/Button';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { Minus, Plus, ShoppingCart, ShieldCheck } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuthStore();
  const [quantity, setQuantity] = useState(1);

  // Fetch Product details
  const { data, isLoading, isError } = useQuery({
    queryKey: ['product', id],
    queryFn: () => productApi.getProductById(id),
    retry: false,
  });

  const product = data?.data;

  // Add to Cart Mutation
  const addToCartMutation = useMutation({
    mutationFn: () => cartApi.addToCart({ productId: id, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success(`${product.title} added to cart`);
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to add item to cart');
    },
  });

  const handleAddToCart = () => {
    if (!isAuthenticated) {
      toast.error('Please log in to add items to your cart.');
      navigate('/login');
      return;
    }
    addToCartMutation.mutate();
  };

  if (isLoading) {
    return <div className="min-h-[70vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (isError || !product) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <ErrorState 
          title="Product not found" 
          message="The medical catalog item you are looking for does not exist or has been discontinued."
          onRetry={() => navigate('/store')}
        />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="bg-white rounded-3xl border border-slate-100 p-8 md:p-12 shadow-sm grid grid-cols-1 md:grid-cols-2 gap-12">
        {/* Left Column: Image */}
        <div className="bg-slate-50 rounded-2xl flex items-center justify-center p-8 border border-slate-50 min-h-[300px]">
          {product.image ? (
            <img
              src={product.image.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${product.image}` : product.image}
              alt={product.title}
              className="object-contain max-h-[400px] w-full"
            />
          ) : (
            <span className="text-slate-400">No Image Available</span>
          )}
        </div>

        {/* Right Column: Content */}
        <div className="flex flex-col space-y-6">
          <div>
            <span className="text-xs font-semibold text-primary uppercase bg-primary/5 px-3 py-1 rounded-full">{product.category}</span>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight mt-3">{product.title}</h1>
            <p className="text-slate-400 font-semibold text-sm mt-1">Brand: {product.brand}</p>
          </div>

          <p className="text-slate-600 leading-relaxed flex-grow">{product.description}</p>

          <div className="bg-slate-50 p-4 rounded-xl flex items-center gap-3">
            <ShieldCheck size={20} className="text-secondary" />
            <span className="text-xs font-semibold text-slate-600">Prescription verified check on dispatch</span>
          </div>

          <div className="flex items-center gap-4">
            <span className="text-3xl font-extrabold text-slate-900">{formatCurrency(product.price)}</span>
            {product.stock > 0 ? (
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-1 rounded-full">In Stock ({product.stock} available)</span>
            ) : (
              <span className="bg-red-50 text-red-700 text-xs font-bold px-2.5 py-1 rounded-full">Out of Stock</span>
            )}
          </div>

          {/* Action Row */}
          {product.stock > 0 && (
            <div className="flex items-center gap-6 pt-4 border-t border-slate-100">
              <div className="flex items-center border border-slate-300 rounded-lg">
                <button
                  onClick={() => setQuantity(q => Math.max(1, q - 1))}
                  className="p-2.5 hover:bg-slate-100 transition-colors rounded-l-lg"
                  disabled={quantity <= 1}
                >
                  <Minus size={16} />
                </button>
                <span className="px-5 font-semibold text-slate-800">{quantity}</span>
                <button
                  onClick={() => setQuantity(q => Math.min(product.stock, q + 1))}
                  className="p-2.5 hover:bg-slate-100 transition-colors rounded-r-lg"
                  disabled={quantity >= product.stock}
                >
                  <Plus size={16} />
                </button>
              </div>

              <Button
                onClick={handleAddToCart}
                isLoading={addToCartMutation.isPending}
                className="flex-1 py-3 px-6 gap-2"
              >
                <ShoppingCart size={20} />
                Add to Cart
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
