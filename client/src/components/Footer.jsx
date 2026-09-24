import React from 'react';
import { HeartPulse } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-slate-900 text-slate-300 py-12 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="col-span-1 md:col-span-2">
          <div className="flex items-center gap-2 mb-4">
            <HeartPulse className="h-8 w-8 text-secondary" />
            <span className="text-2xl font-bold text-white tracking-tight">Pharma.com</span>
          </div>
          <p className="text-sm text-slate-400 max-w-md">
            Providing premium healthcare products and medicines directly to your door. 
            Trusted by thousands of professionals and families.
          </p>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Quick Links</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="/store" className="hover:text-secondary transition-colors">Shop Medicines</a></li>
            <li><a href="/about" className="hover:text-secondary transition-colors">About Us</a></li>
            <li><a href="/contact" className="hover:text-secondary transition-colors">Contact Support</a></li>
          </ul>
        </div>
        <div>
          <h4 className="text-white font-semibold mb-4">Legal</h4>
          <ul className="space-y-2 text-sm">
            <li><a href="#" className="hover:text-secondary transition-colors">Privacy Policy</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Terms of Service</a></li>
            <li><a href="#" className="hover:text-secondary transition-colors">Return Policy</a></li>
          </ul>
        </div>
      </div>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-12 pt-8 border-t border-slate-800 text-sm text-center text-slate-500">
        &copy; {new Date().getFullYear()} Pharma.com. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;
