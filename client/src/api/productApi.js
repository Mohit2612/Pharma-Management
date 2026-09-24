import axiosInstance from './axiosInstance';

export const productApi = {
  getProducts: async (params) => {
    const { data } = await axiosInstance.get('/api/products', { params });
    return data;
  },
  getProductById: async (id) => {
    const { data } = await axiosInstance.get(`/api/products/${id}`);
    return data;
  },
  createProduct: async (formData) => {
    // formData required for multi-part file uploads
    const { data } = await axiosInstance.post('/api/products', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  updateProduct: async (id, formData) => {
    const { data } = await axiosInstance.put(`/api/products/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });
    return data;
  },
  deleteProduct: async (id) => {
    const { data } = await axiosInstance.delete(`/api/products/${id}`);
    return data;
  },
};
