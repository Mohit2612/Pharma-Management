import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';
import EmptyState from '../components/EmptyState';
import ErrorState from '../components/ErrorState';
import Button from '../components/Button';
import { Search } from 'lucide-react';

const Store = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  // Sync state with URL params
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);

  // Local inputs
  const [searchInput, setSearchInput] = useState(search);

  // Debounce search input
  useEffect(() => {
    const timer = setTimeout(() => {
      updateParam('search', searchInput);
    }, 450);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const updateParam = (key, value) => {
    const newParams = new URLSearchParams(searchParams);
    if (value) {
      newParams.set(key, value);
    } else {
      newParams.delete(key);
    }
    newParams.set('page', '1'); // Reset to page 1 on filter change
    setSearchParams(newParams);
  };

  const handlePageChange = (newPage) => {
    const newParams = new URLSearchParams(searchParams);
    newParams.set('page', newPage.toString());
    setSearchParams(newParams);
  };

  // Fetch products
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['products', category, search, sort, page],
    queryFn: () => productApi.getProducts({ category, search, sort, page, limit: 8 }),
  });

  const products = data?.data?.products || [];
  const meta = data?.data?.meta || { page: 1, pages: 1, total: 0 };

  const categories = [
    { label: 'All Products', value: '' },
    { label: 'Medicines', value: 'medicine' },
    { label: 'Machines', value: 'machine' },
    { label: 'Self-Care', value: 'self-care' },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 flex flex-col md:flex-row gap-8">
      {/* Filter Sidebar */}
      <aside className="w-full md:w-64 flex-shrink-0 space-y-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-100 space-y-6">
          {/* Search Box */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800 text-sm">Search Catalog</h4>
            <div className="relative">
              <input
                type="text"
                placeholder="Search..."
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Search className="absolute left-3 top-2.5 text-slate-400" size={16} />
            </div>
          </div>

          {/* Category Filter */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800 text-sm">Categories</h4>
            <div className="flex flex-col gap-2">
              {categories.map((cat) => (
                <button
                  key={cat.label}
                  onClick={() => updateParam('category', cat.value)}
                  className={`text-left px-3 py-2 rounded-lg text-sm transition-colors ${
                    category === cat.value 
                      ? 'bg-primary/5 text-primary font-semibold' 
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-800'
                  }`}
                >
                  {cat.label}
                </button>
              ))}
            </div>
          </div>

          {/* Sorting */}
          <div className="space-y-2">
            <h4 className="font-semibold text-slate-800 text-sm">Sort By</h4>
            <select
              value={sort}
              onChange={(e) => updateParam('sort', e.target.value)}
              className="w-full border border-slate-300 rounded-lg py-2 px-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="">Default (Newest)</option>
              <option value="price_asc">Price: Low to High</option>
              <option value="price_desc">Price: High to Low</option>
            </select>
          </div>
        </div>
      </aside>

      {/* Product List Grid */}
      <main className="flex-1 space-y-8">
        {isError ? (
          <ErrorState onRetry={refetch} />
        ) : isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : products.length === 0 ? (
          <EmptyState 
            title="No matches found" 
            message="Try widening your search inputs or clearing some active filters."
            actionText="Clear Filters"
            actionPath="/store"
          />
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {products.map((product) => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>

            {/* Pagination Controls */}
            {meta.pages > 1 && (
              <div className="flex justify-center items-center gap-2 pt-8 border-t border-slate-100">
                <Button
                  variant="outline"
                  disabled={page <= 1}
                  onClick={() => handlePageChange(page - 1)}
                >
                  Previous
                </Button>
                <span className="text-sm text-slate-600">
                  Page {meta.page} of {meta.pages}
                </span>
                <Button
                  variant="outline"
                  disabled={page >= meta.pages}
                  onClick={() => handlePageChange(page + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
};

export default Store;
