import axiosInstance from './axiosInstance';

export const adminApi = {
  getDashboardStats: async () => {
    const { data } = await axiosInstance.get('/api/admin/dashboard/stats');
    return data;
  },
  getCustomers: async (params) => {
    const { data } = await axiosInstance.get('/api/admin/customers', { params });
    return data;
  },
  getCustomerById: async (id) => {
    const { data } = await axiosInstance.get(`/api/admin/customers/${id}`);
    return data;
  },
  updateCustomer: async (id, profileData) => {
    const { data } = await axiosInstance.put(`/api/admin/customers/${id}`, profileData);
    return data;
  },
  getStaff: async (params) => {
    const { data } = await axiosInstance.get('/api/admin/staff', { params });
    return data;
  },
  createStaff: async (staffData) => {
    const { data } = await axiosInstance.post('/api/admin/staff', staffData);
    return data;
  },
  updateStaff: async (id, staffData) => {
    const { data } = await axiosInstance.put(`/api/admin/staff/${id}`, staffData);
    return data;
  },
};
