import axiosInstance from './axiosInstance';

export const orderApi = {
  createOrder: async (payload) => {
    const { data } = await axiosInstance.post('/api/orders', payload);
    return data;
  },
  getMyOrders: async () => {
    const { data } = await axiosInstance.get('/api/orders/my');
    return data;
  },
  getOrderById: async (id) => {
    const { data } = await axiosInstance.get(`/api/orders/${id}`);
    return data;
  },
  getOrders: async (params) => {
    const { data } = await axiosInstance.get('/api/orders', { params });
    return data;
  },
  updateOrderStatus: async (id, status) => {
    const { data } = await axiosInstance.put(`/api/orders/${id}/status`, { status });
    return data;
  },
};
