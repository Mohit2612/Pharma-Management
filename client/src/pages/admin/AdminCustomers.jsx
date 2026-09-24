import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import DataTable from '../../components/DataTable';
import Spinner from '../../components/Spinner';
import ErrorState from '../../components/ErrorState';
import { Eye, X, Calendar } from 'lucide-react';
import { formatCurrency } from '../../utils/formatCurrency';

const formatAddress = (addr) => {
  if (!addr) return 'Not specified';
  if (typeof addr === 'string') return addr;
  return `${addr.houseNo || ''}, ${addr.street || ''}, ${addr.city || ''}, ${addr.state || ''} - ${addr.pincode || ''}`;
};

const AdminCustomers = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  // Modal states
  const [selectedCustomerId, setSelectedCustomerId] = useState(null);

  // Fetch Customer List
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminCustomers', page, search],
    queryFn: () => adminApi.getCustomers({ page, limit: 10, search }),
  });

  const customers = data?.data?.customers || [];
  const meta = data?.data?.meta || { page: 1, pages: 1 };

  // Fetch Single Customer Details + Order history
  const { data: detailsData, isLoading: isLoadingDetails } = useQuery({
    queryKey: ['customerDetails', selectedCustomerId],
    queryFn: () => adminApi.getCustomerById(selectedCustomerId),
    enabled: !!selectedCustomerId,
  });

  const customerProfile = detailsData?.data?.customer;
  const customerOrders = detailsData?.data?.orders || [];

  const handleViewCustomer = (id) => {
    setSelectedCustomerId(id);
  };

  const closeModal = () => {
    setSelectedCustomerId(null);
  };

  const columns = [
    { 
      header: 'Name', 
      cell: (row) => <span className="font-semibold text-slate-800">{row.firstName} {row.lastName}</span> 
    },
    { header: 'Email Address', accessor: 'email' },
    { 
      header: 'Address', 
      cell: (row) => <span className="text-xs text-slate-400 block max-w-xs truncate">{formatAddress(row.address)}</span> 
    },
    {
      header: 'Actions',
      cell: (row) => (
        <button
          onClick={() => handleViewCustomer(row._id)}
          className="p-1 text-slate-400 hover:text-primary transition-colors flex items-center gap-1 font-semibold text-xs"
        >
          <Eye size={16} /> View Profile
        </button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Customer Directory</h1>
        <p className="text-slate-500 text-sm mt-1">Search, examine shipping profiles, and view order histories of registered patients.</p>
      </div>

      {/* Filter Options */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center max-w-md">
        <input 
          type="text" 
          placeholder="Search by customer name or email..." 
          value={search} 
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          className="w-full text-sm outline-none bg-transparent"
        />
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <DataTable 
          columns={columns} 
          data={customers} 
          isLoading={isLoading} 
          pagination={{
            page,
            pages: meta.pages,
            onPageChange: (p) => setPage(p)
          }}
        />
      )}

      {/* Profile Detail Modal Overlay */}
      {selectedCustomerId && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">
                Patient Account Details
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>

            {isLoadingDetails ? (
              <div className="p-12"><Spinner size="lg" /></div>
            ) : !customerProfile ? (
              <div className="p-6 text-center text-slate-400">Failed to load customer profile</div>
            ) : (
              <div className="p-6 overflow-y-auto space-y-6">
                {/* Account card details */}
                <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 grid grid-cols-2 gap-4">
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block uppercase">First Name</span>
                    <span className="text-sm font-bold text-slate-800">{customerProfile.firstName}</span>
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 font-semibold block uppercase">Last Name</span>
                    <span className="text-sm font-bold text-slate-800">{customerProfile.lastName}</span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-xs text-slate-400 font-semibold block uppercase">Email Address</span>
                    <span className="text-sm font-bold text-slate-800">{customerProfile.email}</span>
                  </div>
                  <div className="col-span-2 border-t pt-3">
                    <span className="text-xs text-slate-400 font-semibold block uppercase">Default Address</span>
                    <span className="text-sm font-bold text-slate-800">{formatAddress(customerProfile.address)}</span>
                  </div>
                </div>

                {/* Patient order history log */}
                <div className="space-y-3">
                  <h4 className="font-bold text-slate-800 text-sm">Purchase History ({customerOrders.length} orders)</h4>
                  {customerOrders.length === 0 ? (
                    <p className="text-sm text-slate-400 p-4 border rounded-lg bg-slate-50 text-center">No orders recorded for this patient.</p>
                  ) : (
                    <div className="divide-y divide-slate-100 border rounded-lg overflow-hidden max-h-56 overflow-y-auto bg-white text-sm">
                      {customerOrders.map((order) => {
                        const date = new Date(order.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
                        return (
                          <div key={order._id} className="p-3 flex justify-between items-center hover:bg-slate-50">
                            <div>
                              <span className="font-semibold block text-slate-700 font-mono text-xs">#{order._id}</span>
                              <span className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Calendar size={12} /> {date}</span>
                            </div>
                            <div className="text-right">
                              <span className="font-bold text-slate-800 block">{formatCurrency(order.totalPrice)}</span>
                              <span className={`text-[10px] font-bold px-2 py-0.2 rounded uppercase ${
                                order.status === 'pending' ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'
                              }`}>{order.status}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCustomers;
