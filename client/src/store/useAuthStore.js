import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { authApi } from '../api/authApi';

const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      role: null, // 'user' or 'admin' / 'superadmin' etc
      isLoading: true, // For initial boot

      checkAuth: async () => {
        try {
          const res = await authApi.getMe();
          set({ 
            user: res.data, 
            isAuthenticated: true, 
            role: res.data.role || 'user',
            isLoading: false 
          });
        } catch (error) {
          set({ 
            user: null, 
            isAuthenticated: false, 
            role: null,
            isLoading: false 
          });
        }
      },

      login: async (credentials, isAdmin = false) => {
        try {
          const res = isAdmin 
            ? await authApi.adminLogin(credentials)
            : await authApi.login(credentials);
            
          set({ 
            user: res.data, 
            isAuthenticated: true, 
            role: res.data.role || 'user'
          });
          return { success: true };
        } catch (error) {
          return { 
            success: false, 
            message: error.response?.data?.message || 'Login failed' 
          };
        }
      },

      logout: async () => {
        try {
          await authApi.logout();
          set({ user: null, isAuthenticated: false, role: null });
        } catch (error) {
          console.error('Logout error', error);
          // Still clear local state just in case
          set({ user: null, isAuthenticated: false, role: null });
        }
      },
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ 
        user: state.user, 
        isAuthenticated: state.isAuthenticated,
        role: state.role
      }),
    }
  )
);

export default useAuthStore;
