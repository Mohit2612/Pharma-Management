import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { orderApi } from '../../api/orderApi';
import DataTable from '../../components/DataTable';
import Spinner from '../../components/Spinner';
import ErrorState from '../../components/ErrorState';
import toast from 'react-hot-toast';
import { Eye, X } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

const AdminOrders = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  
  // Modal states
  const [selectedOrder, setSelectedOrder] = useState(null);

  // Fetch Orders
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminOrders', page, status],
    queryFn: () => orderApi.getOrders({ page, limit: 10, status }),
  });

  const orders = data?.data?.orders || [];
  const meta = data?.data?.meta || { page: 1, pages: 1 };

  // Status Change Mutation
  const statusMutation = useMutation({
    mutationFn: ({ id, status }) => orderApi.updateOrderStatus(id, status),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminOrders'] });
      if (selectedOrder) {
        // Update selected order details on modal too
        queryClient.invalidateQueries({ queryKey: ['order', selectedOrder._id] });
      }
      toast.success('Order status updated');
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update order status'),
  });

  const handleViewDetails = (order) => {
    setSelectedOrder(order);
  };

  const closeModal = () => {
    setSelectedOrder(null);
  };

  const formatAddress = (addr) => {
    if (!addr) return 'Not provided';
    if (typeof addr === 'string') return addr;
    return `${addr.houseNo}, ${addr.street}, ${addr.landmark ? addr.landmark + ', ' : ''}${addr.city}, ${addr.state} - ${addr.pincode}`;
  };

  const handleStatusChange = (id, newStatus) => {
    statusMutation.mutate({ id, status: newStatus });
  };

  const columns = [
    { header: 'Order ID', accessor: '_id', cell: (row) => <span className="font-mono text-xs text-slate-400">#{row._id}</span> },
    { 
      header: 'Customer', 
      cell: (row) => row.user ? `${row.user.firstName} ${row.user.lastName}` : <span className="text-slate-400">Guest</span> 
    },
    { 
      header: 'Date', 
      cell: (row) => new Date(row.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) 
    },
    { header: 'Items', cell: (row) => row.items.reduce((acc, i) => acc + i.quantity, 0) },
    { header: 'Total Price', cell: (row) => formatCurrency(row.totalPrice) },
    {
      header: 'Status',
      cell: (row) => (
        <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase border ${
          row.status === 'pending' 
            ? 'bg-amber-50 text-amber-700 border-amber-100' 
            : row.status === 'fulfilled'
            ? 'bg-emerald-50 text-emerald-700 border-emerald-100'
            : 'bg-red-50 text-red-700 border-red-100'
        }`}>
          {row.status}
        </span>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <button 
          onClick={() => handleViewDetails(row)}
          className="p-1 text-slate-400 hover:text-primary transition-colors flex items-center gap-1 font-semibold text-xs"
        >
          <Eye size={16} /> View Invoice
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Order Log</h1>
        <p className="text-slate-500 text-sm mt-1">Review orders, check shipping parameters, and dispatch prescriptions.</p>
      </div>

      {/* Filter Options */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center gap-4">
        <span className="text-sm font-semibold text-slate-500">Filter by Status:</span>
        <select 
          value={status} 
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="border border-slate-300 rounded-lg text-sm px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-primary"
        >
          <option value="">All Orders</option>
          <option value="pending">Pending</option>
          <option value="fulfilled">Fulfilled</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <DataTable 
          columns={columns} 
          data={orders} 
          isLoading={isLoading} 
          pagination={{
            page,
            pages: meta.pages,
            onPageChange: (p) => setPage(p)
          }}
        />
      )}

      {/* Detail Invoice Modal Overlay */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">
                Order Invoice details
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-6">
              <div className="flex justify-between border-b pb-3 border-slate-100 text-sm font-semibold text-slate-500">
                <span>Order ID</span>
                <span className="font-mono text-slate-800 text-xs">#{selectedOrder._id}</span>
              </div>

              {/* Customer Profile info */}
              <div className="space-y-1">
                <h4 className="font-bold text-slate-800 text-sm">Customer Info</h4>
                <p className="text-sm text-slate-600">
                  {selectedOrder.user ? `${selectedOrder.user.firstName} ${selectedOrder.user.lastName}` : 'Guest User'} ({selectedOrder.user?.email})
                </p>
                <p className="text-xs text-slate-500">Shipping To: {formatAddress(selectedOrder.shippingAddress)}</p>
                {selectedOrder.user?.phone && <p className="text-xs text-slate-500">Phone: {selectedOrder.user.phone}</p>}
              </div>

              {/* Items ordered */}
              <div className="space-y-2">
                <h4 className="font-bold text-slate-800 text-sm">Items Ordered</h4>
                <div className="divide-y divide-slate-100 border rounded-lg overflow-hidden bg-slate-50">
                  {selectedOrder.items.map((item, idx) => (
                    <div key={idx} className="p-3 flex justify-between text-sm font-medium">
                      <span>{item.title} (x{item.quantity})</span>
                      <span>{formatCurrency(item.price * item.quantity)}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Invoice breakdown summary */}
              <div className="space-y-2 text-sm border-t pt-4 border-slate-100 font-semibold text-slate-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span className="text-slate-800">{formatCurrency(selectedOrder.subtotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Delivery Fee</span>
                  <span className="text-slate-800">{formatCurrency(selectedOrder.deliveryFee)}</span>
                </div>
                {selectedOrder.gst > 0 && (
                  <div className="flex justify-between">
                    <span>GST</span>
                    <span className="text-slate-800">{formatCurrency(selectedOrder.gst)}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-bold text-slate-800 pt-2 border-t">
                  <span>Total Amount Paid</span>
                  <span className="text-primary">{formatCurrency(selectedOrder.totalPrice)}</span>
                </div>
              </div>

              {/* Change fulfillment control */}
              {selectedOrder.status === 'pending' && (
                <div className="bg-slate-50 p-4 rounded-xl space-y-3 border">
                  <h4 className="font-bold text-slate-800 text-sm">Fulfillment Actions</h4>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleStatusChange(selectedOrder._id, 'fulfilled')}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 transition-colors flex-1"
                    >
                      Mark as Fulfilled
                    </button>
                    <button
                      onClick={() => handleStatusChange(selectedOrder._id, 'cancelled')}
                      className="border border-red-200 text-red-600 px-4 py-2 rounded-lg text-sm font-semibold hover:bg-red-50 transition-colors"
                    >
                      Cancel Order
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
