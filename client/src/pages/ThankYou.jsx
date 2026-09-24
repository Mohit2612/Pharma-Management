import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../api/orderApi';
import Spinner from '../components/Spinner';
import ErrorState from '../components/ErrorState';
import { CheckCircle2, ShoppingBag, ArrowRight } from 'lucide-react';
import { formatCurrency } from '../utils/formatCurrency';

const ThankYou = () => {
  const { orderId } = useParams();

  const { data, isLoading, isError } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => orderApi.getOrderById(orderId),
    retry: false,
  });

  const order = data?.data;

  if (isLoading) {
    return <div className="min-h-[70vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (isError || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <ErrorState 
          title="Order not found" 
          message="We could not retrieve the details of this order. It might be invalid or restricted."
          onRetry={() => {}}
        />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-16">
      <div className="bg-white border border-slate-100 rounded-3xl p-8 md:p-12 shadow-sm text-center space-y-8">
        {/* Success Icon */}
        <div className="inline-flex p-4 rounded-full bg-emerald-50 text-emerald-500">
          <CheckCircle2 size={64} strokeWidth={1.5} />
        </div>

        {/* Title */}
        <div className="space-y-2">
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Order Placed Successfully!</h1>
          <p className="text-slate-500 font-medium">Thank you for choosing Sanjeevani Pharmacy. Your prescription has been sent to processing.</p>
        </div>

        {/* Summary Card */}
        <div className="bg-slate-50 rounded-2xl p-6 text-left space-y-4 border border-slate-100">
          <div className="flex justify-between border-b pb-3 border-slate-200/60 text-sm font-semibold text-slate-600">
            <span>Order ID</span>
            <span className="text-slate-800 font-mono text-xs">{order._id}</span>
          </div>
          
          <div className="space-y-3">
            <h4 className="font-bold text-slate-800 text-sm">Items Ordered</h4>
            {order.items.map((item, idx) => (
              <div key={idx} className="flex justify-between text-sm text-slate-600 font-medium">
                <span>{item.title} (x{item.quantity})</span>
                <span className="text-slate-800">{formatCurrency(item.price * item.quantity)}</span>
              </div>
            ))}
          </div>

          <div className="h-px bg-slate-200/60 my-2"></div>

          <div className="flex justify-between text-sm font-semibold text-slate-600">
            <span>Delivery Fee</span>
            <span className="text-slate-800">{order.deliveryFee > 0 ? formatCurrency(order.deliveryFee) : 'FREE'}</span>
          </div>

          <div className="flex justify-between text-base font-bold text-slate-800 pt-1">
            <span>Amount Paid</span>
            <span className="text-primary">{formatCurrency(order.totalPrice)}</span>
          </div>

          <div className="pt-2 border-t border-slate-200/60 space-y-1">
            <h4 className="font-bold text-slate-800 text-sm">Shipping Address</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              {typeof order.shippingAddress === 'string' 
                ? order.shippingAddress 
                : `${order.shippingAddress.houseNo}, ${order.shippingAddress.street}, ${order.shippingAddress.landmark ? order.shippingAddress.landmark + ', ' : ''}${order.shippingAddress.city}, ${order.shippingAddress.state} - ${order.shippingAddress.pincode}`}
            </p>
          </div>
        </div>

        {/* CTAs */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4">
          <Link 
            to="/store" 
            className="bg-primary hover:bg-primary-light text-white font-semibold py-3 px-6 rounded-lg transition-all text-sm inline-flex items-center justify-center gap-2"
          >
            <ShoppingBag size={16} />
            Continue Shopping
          </Link>
          <Link 
            to="/orders" 
            className="border border-slate-200 hover:bg-slate-50 text-slate-600 font-semibold py-3 px-6 rounded-lg transition-all text-sm inline-flex items-center justify-center gap-2"
          >
            View Order History
            <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ThankYou;
