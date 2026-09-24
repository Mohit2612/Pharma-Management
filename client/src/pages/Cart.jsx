import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { cartApi } from '../api/cartApi';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Button from '../components/Button';
import { Trash2, Minus, Plus } from 'lucide-react';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatCurrency';

const Cart = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Fetch Cart Sourced Live
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
  });

  const cart = data?.data;
  const items = cart?.items || [];

  // Mutations
  const updateQuantityMutation = useMutation({
    mutationFn: ({ productId, quantity }) => cartApi.updateCartItem({ productId, quantity }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to update quantity');
    },
  });

  const removeItemMutation = useMutation({
    mutationFn: (productId) => cartApi.removeCartItem(productId),
    onSuccess: (res, productId) => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      
      // Unduable style toast simulation or clean confirmation
      toast((t) => (
        <span>
          Item removed.
          <button 
            onClick={() => {
              toast.dismiss(t.id);
              // Undo action: add item back with default quantity 1
              cartApi.addToCart({ productId, quantity: 1 }).then(() => {
                queryClient.invalidateQueries({ queryKey: ['cart'] });
                toast.success('Restored item');
              });
            }} 
            className="ml-3 font-semibold text-primary underline"
          >
            Undo
          </button>
        </span>
      ));
    },
    onError: (err) => {
      toast.error(err.response?.data?.message || 'Failed to remove item');
    },
  });

  const clearCartMutation = useMutation({
    mutationFn: cartApi.clearCart,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      toast.success('Cart cleared');
    },
  });

  const handleQtyChange = (productId, quantity, stock) => {
    if (quantity < 1) return;
    if (quantity > stock) {
      toast.error(`Only ${stock} items available in stock`);
      return;
    }
    updateQuantityMutation.mutate({ productId, quantity });
  };

  if (isLoading) {
    return <div className="min-h-[70vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (isError) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <ErrorState onRetry={refetch} />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <EmptyState
          title="Your Cart is Empty"
          message="Look like you haven't added any medicines or devices to your cart yet."
          actionText="Shop Catalog"
          actionPath="/store"
        />
      </div>
    );
  }

  // Calculation summaries
  const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  // Delivery fee replicates backend: count * 40 if subtotal < 1000, else 0
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const deliveryFee = subtotal < 1000 ? itemCount * 40 : 0;
  const total = subtotal + deliveryFee;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Your Shopping Cart</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Items List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-100 divide-y divide-slate-100 shadow-sm overflow-hidden">
            {items.map((item) => (
              <div key={item.product._id} className="p-6 flex flex-col sm:flex-row items-center gap-6">
                <div className="h-20 w-20 bg-slate-50 border rounded-lg p-2 flex items-center justify-center flex-shrink-0">
                  <img
                    src={item.product.image.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${item.product.image}` : item.product.image}
                    alt={item.product.title}
                    className="object-contain max-h-full"
                  />
                </div>
                
                <div className="flex-1 text-center sm:text-left">
                  <h4 className="font-semibold text-slate-800 text-lg">{item.product.title}</h4>
                  <p className="text-sm text-slate-400">Price: {formatCurrency(item.product.price)}</p>
                </div>

                <div className="flex items-center gap-6">
                  <div className="flex items-center border border-slate-200 rounded-md">
                    <button
                      onClick={() => handleQtyChange(item.product._id, item.quantity - 1, item.product.stock)}
                      className="p-1.5 hover:bg-slate-50 transition-colors"
                      disabled={item.quantity <= 1 || updateQuantityMutation.isPending}
                    >
                      <Minus size={14} />
                    </button>
                    <span className="px-3 text-sm font-semibold">{item.quantity}</span>
                    <button
                      onClick={() => handleQtyChange(item.product._id, item.quantity + 1, item.product.stock)}
                      className="p-1.5 hover:bg-slate-50 transition-colors"
                      disabled={item.quantity >= item.product.stock || updateQuantityMutation.isPending}
                    >
                      <Plus size={14} />
                    </button>
                  </div>
                  
                  <span className="font-bold text-slate-800 text-base w-20 text-right">
                    {formatCurrency(item.product.price * item.quantity)}
                  </span>

                  <button
                    onClick={() => removeItemMutation.mutate(item.product._id)}
                    className="text-slate-400 hover:text-red-500 transition-colors p-1"
                    disabled={removeItemMutation.isPending}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center px-2">
            <Button
              variant="outline"
              onClick={() => clearCartMutation.mutate()}
              disabled={clearCartMutation.isPending}
            >
              Clear Cart
            </Button>
            <Link to="/store" className="text-primary font-semibold text-sm hover:underline">
              &larr; Continue Shopping
            </Link>
          </div>
        </div>

        {/* Summary Side Card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-6">
          <h3 className="font-bold text-xl text-slate-800 border-b pb-4 border-slate-100">Order Summary</h3>
          
          <div className="space-y-3 text-sm font-medium">
            <div className="flex justify-between text-slate-500">
              <span>Subtotal</span>
              <span className="text-slate-800">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Delivery Fee</span>
              <span className="text-slate-800">
                {deliveryFee > 0 ? formatCurrency(deliveryFee) : 'FREE'}
              </span>
            </div>
            {subtotal < 1000 && (
              <p className="text-[11px] text-amber-600 bg-amber-50 p-2.5 rounded-lg">
                Add {formatCurrency(1000 - subtotal)} more subtotal for FREE delivery (currently {formatCurrency(40)} per unit).
              </p>
            )}
            <div className="h-px bg-slate-100 my-4"></div>
            <div className="flex justify-between text-base font-bold text-slate-800">
              <span>Total Price</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>

          <Button
            onClick={() => navigate('/checkout')}
            className="w-full py-3"
          >
            Proceed to Checkout
          </Button>
        </div>
      </div>
    </div>
  );
};

export default Cart;
