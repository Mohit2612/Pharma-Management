import axios from 'axios';
import useAuthStore from '../store/useAuthStore';

const axiosInstance = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000',
  withCredentials: true, // Important for sending/receiving httpOnly cookies
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const isLogoutRequest = error.config?.url?.includes('/logout');
    if (error.response && error.response.status === 401 && !isLogoutRequest) {
      console.warn('Unauthorized request intercepted. Resetting session...');
      // Direct call to clear local state to prevent loop
      useAuthStore.setState({ user: null, isAuthenticated: false, role: null });
    }
    return Promise.reject(error);
  }
);

export default axiosInstance;
