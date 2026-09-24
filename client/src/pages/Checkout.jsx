import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { cartApi } from '../api/cartApi';
import { orderApi } from '../api/orderApi';
import useAuthStore from '../store/useAuthStore';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import Input from '../components/Input';
import Button from '../components/Button';
import toast from 'react-hot-toast';
import { formatCurrency } from '../utils/formatCurrency';

const checkoutSchema = zod.object({
  houseNo: zod.string().min(1, 'Required'),
  street: zod.string().min(3, 'Required'),
  landmark: zod.string().optional(),
  city: zod.string().min(2, 'Required'),
  state: zod.string().min(2, 'Required'),
  pincode: zod.string().regex(/^[0-9]{6}$/, 'Must be a 6-digit valid Indian pincode'),
  phone: zod.string().regex(/^[6-9]\d{9}$/, 'Must be a valid 10-digit Indian mobile number'),
});

const Checkout = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  // Fetch cart details
  const { data, isLoading, isError } = useQuery({
    queryKey: ['cart'],
    queryFn: cartApi.getCart,
  });

  const cart = data?.data;
  const items = cart?.items || [];

  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: zodResolver(checkoutSchema),
    defaultValues: {
      houseNo: user?.address?.houseNo || '',
      street: user?.address?.street || '',
      landmark: user?.address?.landmark || '',
      city: user?.address?.city || '',
      state: user?.address?.state || '',
      pincode: user?.address?.pincode || '',
      phone: user?.phone || '',
    },
  });

  const placeOrderMutation = useMutation({
    mutationFn: orderApi.createOrder,
    onSuccess: (res) => {
      // Clear React Query cache for cart
      queryClient.invalidateQueries({ queryKey: ['cart'] });
      queryClient.invalidateQueries({ queryKey: ['orders'] });
      toast.success('Order placed successfully!');
      navigate(`/thank-you/${res.data._id}`);
    },
    onError: (err) => {
      // Graceful error reporting (such as stock conflicts)
      const msg = err.response?.data?.message || 'Failed to place order';
      toast.error(msg, { duration: 5000 });
    },
  });

  const onSubmit = (data) => {
    placeOrderMutation.mutate({ shippingAddress: data, phone: data.phone });
  };

  if (isLoading) {
    return <div className="min-h-[70vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (isError || items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <ErrorState 
          title="Unable to checkout" 
          message="Your cart appears empty or there was an issue retrieving items. Please add items before checking out."
          onRetry={() => navigate('/store')}
        />
      </div>
    );
  }

  const subtotal = items.reduce((acc, item) => acc + (item.product.price * item.quantity), 0);
  const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
  const deliveryFee = subtotal < 1000 ? itemCount * 40 : 0;
  const gst = subtotal * 0.05;
  const total = subtotal + deliveryFee + gst;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Checkout & Dispatch</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Form panel */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm">
            <h3 className="font-bold text-lg text-slate-800 mb-6">1. Shipping Address</h3>
            <form onSubmit={handleSubmit(onSubmit)}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Input label="House/Flat No." type="text" error={errors.houseNo?.message} {...register('houseNo')} />
                <Input label="Street/Locality" type="text" error={errors.street?.message} {...register('street')} />
                <Input label="Landmark (Optional)" type="text" error={errors.landmark?.message} {...register('landmark')} />
                <Input label="City" type="text" error={errors.city?.message} {...register('city')} />
                <Input label="State" type="text" error={errors.state?.message} {...register('state')} />
                <Input label="Pincode" type="text" error={errors.pincode?.message} {...register('pincode')} />
                <Input label="Phone Number" type="tel" error={errors.phone?.message} {...register('phone')} />
              </div>
              
              <div className="mt-8 border-t pt-6 flex justify-between items-center">
                <span className="text-sm text-slate-400">Checking prescriptions on dispatch</span>
                <Button
                  type="submit"
                  isLoading={placeOrderMutation.isPending}
                  className="py-3 px-8"
                >
                  Place Order ({formatCurrency(total)})
                </Button>
              </div>
            </form>
          </div>
        </div>

        {/* Order review side card */}
        <div className="bg-white p-8 rounded-2xl border border-slate-100 shadow-sm h-fit space-y-6">
          <h3 className="font-bold text-lg text-slate-800 border-b pb-4 border-slate-100">Review Cart Items ({itemCount})</h3>
          
          <div className="divide-y divide-slate-100 max-h-60 overflow-y-auto">
            {items.map((item) => (
              <div key={item.product._id} className="py-3 flex justify-between items-center text-sm font-medium">
                <div className="pr-4">
                  <p className="text-slate-800 line-clamp-1">{item.product.title}</p>
                  <p className="text-xs text-slate-400">Qty: {item.quantity}</p>
                </div>
                <span className="text-slate-800 flex-shrink-0">{formatCurrency(item.product.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="space-y-2.5 text-xs font-semibold text-slate-500 pt-4 border-t border-slate-100">
            <div className="flex justify-between">
              <span>Subtotal</span>
              <span className="text-slate-800">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex justify-between">
              <span>Delivery Fee</span>
              <span className="text-slate-800">{deliveryFee > 0 ? formatCurrency(deliveryFee) : 'FREE'}</span>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>GST (5%)</span>
              <span className="text-slate-800">{formatCurrency(gst)}</span>
            </div>
            <div className="h-px bg-slate-100 my-2"></div>
            <div className="flex justify-between text-sm font-bold text-slate-800">
              <span>Order Total</span>
              <span className="text-primary">{formatCurrency(total)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;
