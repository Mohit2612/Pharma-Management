import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { orderApi } from '../api/orderApi';
import Spinner from '../components/Spinner';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import { Calendar, PackageOpen } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../utils/formatCurrency';

const OrderHistory = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['orders'],
    queryFn: orderApi.getMyOrders,
  });

  const orders = data?.data || [];

  if (isLoading) {
    return <div className="min-h-[70vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (isError) {
    return <div className="max-w-3xl mx-auto px-4 py-12"><ErrorState onRetry={refetch} /></div>;
  }

  if (orders.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <EmptyState
          title="No Orders Found"
          message="You haven't placed any medical orders yet. Visit our shop to get started."
          actionText="Shop Catalog"
          actionPath="/store"
        />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-3xl font-extrabold text-slate-900 mb-8">Your Order History</h1>

      <div className="space-y-6">
        {orders.map((order) => {
          const date = new Date(order.createdAt).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
          });
          const statusColors = {
            pending: 'bg-amber-50 text-amber-700 border-amber-100',
            fulfilled: 'bg-emerald-50 text-emerald-700 border-emerald-100',
            cancelled: 'bg-red-50 text-red-700 border-red-100',
          };

          return (
            <div 
              key={order._id}
              className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 hover:shadow-md transition-shadow duration-300 flex flex-col md:flex-row md:items-center justify-between gap-6"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <span className="text-sm text-slate-400 font-semibold font-mono">#{order._id}</span>
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border ${statusColors[order.status] || 'bg-slate-50 text-slate-700'}`}>
                    {order.status}
                  </span>
                </div>

                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Calendar size={16} />
                  <span>Placed on {date}</span>
                </div>
                
                <p className="text-slate-600 text-sm font-medium">
                  {order.items.length} {order.items.length === 1 ? 'item' : 'items'} ordered
                </p>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 border-t pt-4 md:border-0 md:pt-0">
                <div className="text-right">
                  <span className="text-xs text-slate-400 font-semibold block">Total Amount</span>
                  <span className="text-lg font-bold text-slate-800">{formatCurrency(order.totalPrice)}</span>
                </div>

                <Link
                  to={`/thank-you/${order._id}`}
                  className="bg-slate-50 hover:bg-slate-100 text-slate-700 border border-slate-200 font-semibold px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  View Details
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistory;
