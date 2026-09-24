import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import Spinner from '../../components/Spinner';
import ErrorState from '../../components/ErrorState';
import { DollarSign, ShoppingBag, Package, Users, AlertTriangle, ArrowUpRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/formatCurrency';

const Dashboard = () => {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminStats'],
    queryFn: adminApi.getDashboardStats,
  });

  const stats = data?.data;

  if (isLoading) {
    return <div className="min-h-[70vh] flex items-center justify-center"><Spinner size="lg" /></div>;
  }

  if (isError || !stats) {
    return <ErrorState onRetry={refetch} />;
  }

  const kpis = [
    { name: 'Total Revenue', value: formatCurrency(stats.revenue), icon: DollarSign, color: 'text-blue-500 bg-blue-50' },
    { name: 'Total Orders', value: stats.orders.total, icon: ShoppingBag, color: 'text-indigo-500 bg-indigo-50' },
    { name: 'Pending Orders', value: stats.orders.pending, icon: AlertTriangle, color: 'text-amber-500 bg-amber-50' },
    { name: 'Total Customers', value: stats.customers, icon: Users, color: 'text-emerald-500 bg-emerald-50' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 text-sm mt-1">Aggregated clinical operations metrics and sales statistics.</p>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {kpis.map((kpi) => (
          <div key={kpi.name} className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm flex items-center gap-5">
            <div className={`p-4 rounded-xl ${kpi.color}`}>
              <kpi.icon size={24} />
            </div>
            <div>
              <span className="text-xs font-semibold text-slate-400 block uppercase tracking-wider">{kpi.name}</span>
              <span className="text-2xl font-bold text-slate-800 mt-1 block">{kpi.value}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Custom Bar Chart using Tailwind SVG */}
      <div className="bg-white p-6 rounded-2xl border border-slate-100 shadow-sm space-y-4">
        <h3 className="font-bold text-slate-800 text-lg">Orders Breakdown</h3>
        <div className="h-64 flex items-end justify-around border-b border-slate-100 pb-2">
          {/* Pending bar */}
          <div className="flex flex-col items-center gap-2 w-1/4">
            <div className="text-xs font-semibold text-slate-500">{stats.orders.pending}</div>
            <div 
              style={{ height: `${stats.orders.total > 0 ? (stats.orders.pending / stats.orders.total) * 160 : 0}px` }} 
              className="bg-amber-400 w-16 rounded-t-lg transition-all duration-500 min-h-[8px]"
            ></div>
            <span className="text-xs text-slate-500 font-semibold">Pending</span>
          </div>

          {/* Fulfilled bar */}
          <div className="flex flex-col items-center gap-2 w-1/4">
            <div className="text-xs font-semibold text-slate-500">{stats.orders.fulfilled}</div>
            <div 
              style={{ height: `${stats.orders.total > 0 ? (stats.orders.fulfilled / stats.orders.total) * 160 : 0}px` }} 
              className="bg-emerald-400 w-16 rounded-t-lg transition-all duration-500 min-h-[8px]"
            ></div>
            <span className="text-xs text-slate-500 font-semibold">Fulfilled</span>
          </div>

          {/* Total bar */}
          <div className="flex flex-col items-center gap-2 w-1/4">
            <div className="text-xs font-semibold text-slate-500">{stats.orders.total}</div>
            <div className="bg-indigo-400 w-16 h-40 rounded-t-lg transition-all duration-500 min-h-[8px]"></div>
            <span className="text-xs text-slate-500 font-semibold">Total Orders</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Orders table */}
        <div className="lg:col-span-2 bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-slate-800 text-lg">Recent Orders</h3>
            <Link to="/admin/orders" className="text-primary hover:text-primary-light font-semibold text-xs inline-flex items-center gap-1">
              View All <ArrowUpRight size={14} />
            </Link>
          </div>
          
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-100 text-sm">
              <thead>
                <tr className="text-slate-400 text-left font-semibold">
                  <th className="pb-3">Order ID</th>
                  <th className="pb-3">Customer</th>
                  <th className="pb-3">Total</th>
                  <th className="pb-3 text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50 font-medium">
                {stats.recentOrders.map((order) => (
                  <tr key={order._id}>
                    <td className="py-3 font-mono text-xs text-slate-400">#{order._id}</td>
                    <td className="py-3 text-slate-700">{order.user?.firstName} {order.user?.lastName}</td>
                    <td className="py-3 text-slate-900">{formatCurrency(order.totalPrice)}</td>
                    <td className="py-3 text-right">
                      <span className={`text-[10px] px-2 py-0.5 rounded font-bold uppercase ${
                        order.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Info panel for Alerts */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
          <h3 className="font-bold text-slate-800 text-lg">System Alerts</h3>
          
          <div className="space-y-4">
            <div className="flex items-center gap-4 bg-amber-50/50 p-4 rounded-xl border border-amber-100">
              <AlertTriangle className="text-amber-500 flex-shrink-0" size={24} />
              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Low Stock Products</span>
                <span className="text-lg font-bold text-slate-800">{stats.products.lowStock} products alert</span>
                <Link to="/admin/products" className="text-xs font-semibold text-primary block mt-1 hover:underline">
                  Manage inventory &rarr;
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-4 bg-blue-50/50 p-4 rounded-xl border border-blue-100">
              <Package className="text-blue-500 flex-shrink-0" size={24} />
              <div>
                <span className="text-xs text-slate-400 font-semibold block uppercase tracking-wider">Active Inventory</span>
                <span className="text-lg font-bold text-slate-800">{stats.products.total} Catalog Items</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
