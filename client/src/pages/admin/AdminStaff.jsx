import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminApi } from '../../api/adminApi';
import DataTable from '../../components/DataTable';
import Input from '../../components/Input';
import Button from '../../components/Button';
import ErrorState from '../../components/ErrorState';
import toast from 'react-hot-toast';
import { Plus, X, ShieldAlert } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';

const staffSchema = zod.object({
  firstName: zod.string().min(1, 'First name is required'),
  lastName: zod.string().min(1, 'Last name is required'),
  email: zod.string().email('Please enter a valid email address'),
  password: zod.string().min(8, 'Password must be at least 8 characters'),
  role: zod.enum(['superadmin', 'manager', 'support', 'inventory']),
});

const AdminStaff = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Fetch Staff list
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminStaff', search],
    queryFn: () => adminApi.getStaff({ search }),
  });

  const staff = data?.data || [];

  // Form Setup
  const { register, handleSubmit, reset, formState: { errors } } = useForm({
    resolver: zodResolver(staffSchema),
    defaultValues: {
      role: 'manager'
    }
  });

  // Invite Mutation
  const inviteMutation = useMutation({
    mutationFn: (staffData) => adminApi.createStaff(staffData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminStaff'] });
      toast.success('New administrator successfully registered!');
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to register administrator'),
  });

  const onSubmit = (data) => {
    inviteMutation.mutate(data);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset({
      firstName: '', lastName: '', email: '', password: '', role: 'manager'
    });
  };

  const columns = [
    { 
      header: 'Name', 
      cell: (row) => <span className="font-semibold text-slate-800">{row.firstName} {row.lastName}</span> 
    },
    { header: 'Email Address', accessor: 'email' },
    { 
      header: 'Role Key', 
      cell: (row) => (
        <span className={`text-xs font-semibold px-2 py-0.5 rounded capitalize ${
          row.role === 'superadmin' ? 'bg-indigo-50 text-indigo-700' : 'bg-slate-100 text-slate-700'
        }`}>
          {row.role}
        </span>
      )
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Staff Directories</h1>
          <p className="text-slate-500 text-sm mt-1">Review, search, and register administrators to manage site operations.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2">
          <Plus size={16} />
          Register Staff
        </Button>
      </div>

      {/* Filter Options */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center max-w-md">
        <input 
          type="text" 
          placeholder="Search staff directory by name or email..." 
          value={search} 
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-sm outline-none bg-transparent"
        />
      </div>

      {isError ? (
        <ErrorState onRetry={refetch} />
      ) : (
        <DataTable 
          columns={columns} 
          data={staff} 
          isLoading={isLoading} 
        />
      )}

      {/* Form Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-md shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">
                Register Administrator
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Input label="First Name" error={errors.firstName?.message} {...register('firstName')} />
                <Input label="Last Name" error={errors.lastName?.message} {...register('lastName')} />
              </div>
              <Input label="Email Address" type="email" error={errors.email?.message} {...register('email')} />
              <Input label="Password" type="password" error={errors.password?.message} {...register('password')} />

              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-1">Administrative Role</label>
                <select
                  className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary border-slate-300"
                  {...register('role')}
                >
                  <option value="manager">Manager</option>
                  <option value="superadmin">Superadmin</option>
                  <option value="support">Customer Support</option>
                  <option value="inventory">Inventory Clerk</option>
                </select>
              </div>

              <div className="bg-slate-50 p-4 rounded-xl border flex gap-3 text-xs text-slate-500 items-start">
                <ShieldAlert className="text-primary flex-shrink-0" size={16} />
                <span>
                  Staff accounts get backend API access based on roles. Superadmins can modify staff parameters.
                </span>
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={closeModal}>Cancel</Button>
                <Button type="submit" isLoading={inviteMutation.isPending}>
                  Confirm Registration
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminStaff;
