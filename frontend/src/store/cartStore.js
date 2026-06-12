import { create } from 'zustand';
import api from '../services/api';
import { useAuthStore } from './authStore';

export const useCartStore = create((set, get) => ({
  cart: null,
  isLoading: false,
  error: null,
  itemCount: 0,

  fetchCart: async () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      set({ cart: null, itemCount: 0 });
      return;
    }
    
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get('/cart');
      const count = data.cart?.items?.reduce((total, item) => total + item.quantity, 0) || 0;
      set({ cart: data.cart, itemCount: count, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.message || 'Failed to fetch cart', isLoading: false });
    }
  },

  clearCartState: () => {
    set({ cart: null, itemCount: 0, error: null });
  }
}));
