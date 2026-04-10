import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export const useAuthStore = create(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      // Authenticate
      login: (userData, jwtToken) => set({
        user: userData,
        token: jwtToken,
        isAuthenticated: true
      }),

      // Logout securely
      logout: () => set({
        user: null,
        token: null,
        isAuthenticated: false
      })
    }),
    {
      name: 'sahayak-auth-storage' // Will use localStorage by default
    }
  )
);
