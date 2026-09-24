import React from 'react';
import { Link } from 'react-router-dom';
import { Pill, Activity, ShieldAlert, HeartPulse } from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { productApi } from '../api/productApi';
import ProductCard from '../components/ProductCard';
import SkeletonCard from '../components/SkeletonCard';

const Home = () => {
  // Fetch featured products (newest arrivals)
  const { data, isLoading } = useQuery({
    queryKey: ['featuredProducts'],
    queryFn: () => productApi.getProducts({ limit: 4, sort: 'newest' }),
  });

  const featuredProducts = data?.data?.products || [];

  const categories = [
    { name: 'Medicines', desc: 'Prescription & OTC Drugs', path: 'medicine', icon: Pill, color: 'text-blue-500 bg-blue-50' },
    { name: 'Self-Care', desc: 'Wellness & Personal Health', path: 'self-care', icon: Activity, color: 'text-emerald-500 bg-emerald-50' },
    { name: 'Machines', desc: 'Devices & Diagnostic Kits', path: 'machine', icon: ShieldAlert, color: 'text-amber-500 bg-amber-50' },
  ];

  return (
    <div className="space-y-20 pb-20">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-tr from-slate-900 to-slate-800 text-white py-24 px-4 sm:px-6 lg:px-8 overflow-hidden">
        <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#fff_1px,transparent_1px)] [background-size:16px_16px]"></div>
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-12 relative z-10">
          <div className="flex-1 space-y-6 text-center md:text-left">
            <div className="inline-flex items-center gap-2 bg-slate-800 px-3 py-1.5 rounded-full border border-slate-700">
              <HeartPulse size={16} className="text-secondary" />
              <span className="text-xs font-semibold text-slate-300">Trusted by families across India</span>
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight leading-tight">
              Premium Indian Healthcare. <br />
              <span className="text-secondary">Delivered Instantly.</span>
            </h1>
            <p className="text-lg text-slate-300 max-w-lg mx-auto md:mx-0">
              Browse thousands of certified medicines and premium diagnostic tools. 
              Always authenticated, always in stock.
            </p>
            <div className="flex flex-wrap gap-4 justify-center md:justify-start pt-4">
              <Link 
                to="/store" 
                className="bg-secondary text-white font-semibold px-8 py-3 rounded-lg shadow-lg hover:bg-secondary-light hover:shadow-xl transition-all"
              >
                Shop Store
              </Link>
              <Link 
                to="/about" 
                className="bg-transparent border border-slate-600 hover:border-slate-400 font-semibold px-8 py-3 rounded-lg transition-all"
              >
                Learn More
              </Link>
            </div>
          </div>
          
          <div className="flex-1 w-full max-w-md hidden lg:flex justify-center items-center">
            <img 
              src="/pharma-hero.jpg" 
              alt="Pharmacy Illustration" 
              className="w-full h-auto max-h-[400px] object-cover rounded-2xl shadow-2xl border-4 border-white/10 transform hover:scale-105 transition-transform duration-500" 
            />
          </div>
        </div>
      </section>

      {/* Categories Row */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight mb-8 text-center md:text-left">
          Browse by Category
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {categories.map((cat) => (
            <Link 
              key={cat.name} 
              to={`/store?category=${cat.path}`}
              className="bg-white p-8 rounded-2xl border border-slate-100 hover:border-primary/20 hover:shadow-lg transition-all duration-300 flex items-center gap-6 group"
            >
              <div className={`p-4 rounded-xl ${cat.color} group-hover:scale-105 transition-transform`}>
                <cat.icon size={32} />
              </div>
              <div>
                <h3 className="font-bold text-slate-800 text-lg group-hover:text-primary transition-colors">{cat.name}</h3>
                <p className="text-slate-500 text-sm">{cat.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-3xl font-extrabold text-slate-800 tracking-tight">
            Popular Products
          </h2>
          <Link to="/store" className="text-primary hover:text-primary-light font-semibold text-sm">
            View All &rarr;
          </Link>
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
            <SkeletonCard />
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
};

export default Home;
