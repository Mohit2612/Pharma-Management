import React from 'react';
import { Routes, Route } from 'react-router-dom';
import CustomerLayout from '../layouts/CustomerLayout';
import AdminLayout from '../layouts/AdminLayout';
import { ProtectedRoute, AdminRoute } from './Guards';

// Real Pages
import Home from '../pages/Home';
import Store from '../pages/Store';
import ProductDetail from '../pages/ProductDetail';
import About from '../pages/About';
import Login from '../pages/Login';
import Signup from '../pages/Signup';
import Cart from '../pages/Cart';
import Checkout from '../pages/Checkout';
import ThankYou from '../pages/ThankYou';
import OrderHistory from '../pages/OrderHistory';

// Real Admin Pages
import Dashboard from '../pages/admin/Dashboard';
import AdminProducts from '../pages/admin/AdminProducts';
import AdminOrders from '../pages/admin/AdminOrders';
import AdminCustomers from '../pages/admin/AdminCustomers';
import AdminStaff from '../pages/admin/AdminStaff';

const Placeholder = ({ title }) => <div className="p-8"><h1 className="text-2xl font-bold">{title}</h1><p>Scaffolding view</p></div>;

const AppRouter = () => {
  return (
    <Routes>
      {/* Customer Routes */}
      <Route element={<CustomerLayout />}>
        <Route path="/" element={<Home />} />
        <Route path="/store" element={<Store />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/about" element={<About />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        
        <Route path="/cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
        <Route path="/checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
        <Route path="/thank-you/:orderId" element={<ProtectedRoute><ThankYou /></ProtectedRoute>} />
        <Route path="/orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
      </Route>

      {/* Admin Login (Outside Admin Layout) */}
      <Route path="/admin/login" element={<Login isAdmin={true} />} />

      {/* Admin Routes */}
      <Route path="/admin" element={<AdminRoute><AdminLayout /></AdminRoute>}>
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="products" element={<AdminProducts />} />
        <Route path="orders" element={<AdminOrders />} />
        <Route path="customers" element={<AdminCustomers />} />
        <Route path="staff" element={<AdminStaff />} />
      </Route>

      {/* Global 404 */}
      <Route path="*" element={<Placeholder title="404 - Not Found" />} />
    </Routes>
  );
};

export default AppRouter;
