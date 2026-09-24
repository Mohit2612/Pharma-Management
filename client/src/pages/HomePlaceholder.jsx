import React, { useEffect, useState } from 'react';
import { productApi } from '../api/productApi';
import Spinner from '../components/Spinner';
import { formatCurrency } from '../utils/formatCurrency';

const HomePlaceholder = () => {
  // Test connection to backend
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testConnection = async () => {
      try {
        const data = await productApi.getProducts();
        setProducts(data.data.products); // Assuming { success, data: { products, meta } }
        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };
    testConnection();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-4xl font-bold text-slate-800 mb-8">Welcome to Sanjeevani Pharmacy</h1>
      <p className="text-lg text-slate-600 mb-8">This is the Home Page scaffolding.</p>

      <div className="bg-white p-6 rounded-lg shadow-sm border border-slate-200">
        <h2 className="text-xl font-semibold mb-4">Backend Connection Test</h2>
        {loading ? (
          <Spinner />
        ) : error ? (
          <div className="text-red-500">Error connecting to backend: {error}</div>
        ) : (
          <div>
            <p className="text-green-600 font-medium mb-4">Successfully connected to backend API!</p>
            <p className="text-sm text-slate-500 mb-2">Products in database: {products.length}</p>
            <ul className="list-disc pl-5">
              {products.slice(0, 5).map(p => (
                <li key={p._id} className="text-slate-700">{p.title} - {formatCurrency(p.price)}</li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default HomePlaceholder;
