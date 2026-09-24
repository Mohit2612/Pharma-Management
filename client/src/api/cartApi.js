import axiosInstance from './axiosInstance';

export const cartApi = {
  getCart: async () => {
    const { data } = await axiosInstance.get('/api/cart');
    return data;
  },
  addToCart: async ({ productId, quantity }) => {
    const { data } = await axiosInstance.post('/api/cart', { productId, quantity });
    return data;
  },
  updateCartItem: async ({ productId, quantity }) => {
    const { data } = await axiosInstance.put(`/api/cart/${productId}`, { quantity });
    return data;
  },
  removeCartItem: async (productId) => {
    const { data } = await axiosInstance.delete(`/api/cart/${productId}`);
    return data;
  },
  clearCart: async () => {
    const { data } = await axiosInstance.delete('/api/cart');
    return data;
  },
};
