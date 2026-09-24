import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productApi } from '../../api/productApi';
import DataTable from '../../components/DataTable';
import Button from '../../components/Button';
import Input from '../../components/Input';
import ErrorState from '../../components/ErrorState';
import toast from 'react-hot-toast';
import { Plus, Edit3, Trash2, X, AlertCircle } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as zod from 'zod';
import { formatCurrency } from '../../utils/formatCurrency';

const productSchema = zod.object({
  title: zod.string().min(1, 'Title is required'),
  brand: zod.string().min(1, 'Brand is required'),
  manufacturer: zod.string().optional(),
  category: zod.enum(['medicine', 'self-care', 'machine']),
  description: zod.string().min(5, 'Description is required'),
  price: zod.preprocess((val) => parseFloat(val), zod.number().positive('Price must be a positive number')),
  stock: zod.preprocess((val) => parseInt(val, 10), zod.number().min(0, 'Stock cannot be negative')),
});

const AdminProducts = () => {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  
  // Overlay States
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);

  // Fetch Products
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['adminProducts', page, search],
    queryFn: () => productApi.getProducts({ page, limit: 10, search }),
  });

  const products = data?.data?.products || [];
  const meta = data?.data?.meta || { page: 1, pages: 1 };

  // Form Setup
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm({
    resolver: zodResolver(productSchema),
  });

  // Mutations
  const createMutation = useMutation({
    mutationFn: (formData) => productApi.createProduct(formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast.success('Product created successfully');
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to create product'),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, formData }) => productApi.updateProduct(id, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast.success('Product updated successfully');
      closeModal();
    },
    onError: (err) => toast.error(err.response?.data?.message || 'Failed to update product'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => productApi.deleteProduct(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['adminProducts'] });
      toast.success('Product deleted successfully');
    },
  });

  const handleEditClick = (product) => {
    setEditingProduct(product);
    setValue('title', product.title);
    setValue('brand', product.brand);
    setValue('manufacturer', product.manufacturer || '');
    setValue('category', product.category);
    setValue('description', product.description);
    setValue('price', product.price);
    setValue('stock', product.stock);
    setIsModalOpen(true);
  };

  const handleAddClick = () => {
    setEditingProduct(null);
    reset({
      title: '', brand: '', manufacturer: '', category: 'medicine', description: '', price: '', stock: ''
    });
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
    setSelectedFile(null);
  };

  const onSubmit = (data) => {
    const formData = new FormData();
    Object.keys(data).forEach(key => formData.append(key, data[key]));
    if (selectedFile) {
      formData.append('image', selectedFile);
    }

    if (editingProduct) {
      updateMutation.mutate({ id: editingProduct._id, formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  const handleDelete = (id) => {
    if (window.confirm('Are you sure you want to deactivate this product?')) {
      deleteMutation.mutate(id);
    }
  };

  const columns = [
    {
      header: 'Product',
      cell: (row) => (
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 bg-slate-50 border rounded-lg p-1 flex items-center justify-center flex-shrink-0">
            {row.image ? (
              <img 
                src={row.image.startsWith('/uploads') ? `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000'}${row.image}` : row.image} 
                className="max-h-full object-contain" 
                alt={row.title} 
              />
            ) : <span className="text-[10px] text-slate-400">Empty</span>}
          </div>
          <div>
            <div className="font-semibold text-slate-800 line-clamp-1">{row.title}</div>
            <div className="text-xs text-slate-400">{row.brand}</div>
          </div>
        </div>
      )
    },
    { header: 'Category', accessor: 'category' },
    { header: 'Price', cell: (row) => formatCurrency(row.price) },
    { 
      header: 'Stock Status', 
      cell: (row) => (
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold px-2 py-0.5 rounded ${
            row.stock < 5 ? 'bg-red-50 text-red-600' : 'bg-emerald-50 text-emerald-600'
          }`}>
            {row.stock} items
          </span>
          {row.stock < 5 && <AlertCircle className="text-red-500" size={14} />}
        </div>
      )
    },
    {
      header: 'Actions',
      cell: (row) => (
        <div className="flex items-center gap-2">
          <button 
            onClick={() => handleEditClick(row)}
            className="p-1 text-slate-400 hover:text-primary transition-colors"
          >
            <Edit3 size={16} />
          </button>
          <button 
            onClick={() => handleDelete(row._id)}
            className="p-1 text-slate-400 hover:text-red-500 transition-colors"
          >
            <Trash2 size={16} />
          </button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-800 tracking-tight">Products Catalog</h1>
          <p className="text-slate-500 text-sm mt-1">Manage active medicines, diagnostics, and stock parameters.</p>
        </div>
        <Button onClick={handleAddClick} className="gap-2">
          <Plus size={16} />
          Add Product
        </Button>
      </div>

      {/* Search Filter Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-100 shadow-sm flex items-center max-w-md">
        <input 
          type="text" 
          placeholder="Search products by title or brand..." 
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
          data={products} 
          isLoading={isLoading} 
          pagination={{
            page,
            pages: meta.pages,
            onPageChange: (p) => setPage(p)
          }}
        />
      )}

      {/* Form Overlay Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-6 py-4 bg-slate-50 border-b flex justify-between items-center">
              <h3 className="font-bold text-slate-800 text-lg">
                {editingProduct ? 'Edit Product' : 'Add New Product'}
              </h3>
              <button onClick={closeModal} className="text-slate-400 hover:text-slate-600">
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 overflow-y-auto space-y-4">
              <Input label="Product Title" error={errors.title?.message} {...register('title')} />
              <Input label="Brand" error={errors.brand?.message} {...register('brand')} />
              <Input label="Manufacturer" error={errors.manufacturer?.message} {...register('manufacturer')} />
              
              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-1">Category</label>
                <select
                  className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary"
                  {...register('category')}
                >
                  <option value="medicine">Medicine</option>
                  <option value="self-care">Self-Care</option>
                  <option value="machine">Machine</option>
                </select>
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-1">Description</label>
                <textarea
                  className="px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-primary border-slate-300"
                  rows="3"
                  {...register('description')}
                ></textarea>
                {errors.description && <span className="text-xs text-red-500 mt-1">{errors.description.message}</span>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <Input label="Price (₹)" type="number" step="0.01" error={errors.price?.message} {...register('price')} />
                <Input label="Stock Quantity" type="number" error={errors.stock?.message} {...register('stock')} />
              </div>

              <div className="flex flex-col">
                <label className="text-sm font-medium text-slate-700 mb-1">Product Image</label>
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="text-sm"
                />
              </div>

              <div className="pt-4 border-t flex justify-end gap-3">
                <Button variant="outline" type="button" onClick={closeModal}>Cancel</Button>
                <Button type="submit" isLoading={createMutation.isPending || updateMutation.isPending}>
                  {editingProduct ? 'Save Changes' : 'Create Product'}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
