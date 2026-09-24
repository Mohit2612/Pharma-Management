import axiosInstance from './axiosInstance';

export const authApi = {
  login: async (credentials) => {
    const { data } = await axiosInstance.post('/api/auth/login', credentials);
    return data;
  },
  adminLogin: async (credentials) => {
    const { data } = await axiosInstance.post('/api/auth/admin/login', credentials);
    return data;
  },
  register: async (userData) => {
    const { data } = await axiosInstance.post('/api/auth/register', userData);
    return data;
  },
  logout: async () => {
    const { data } = await axiosInstance.post('/api/auth/logout');
    return data;
  },
  getMe: async () => {
    const { data } = await axiosInstance.get('/api/auth/me');
    return data; // Needs to return user data
  },
};
