import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

// Define the shape of the user object
// We can share this type from a shared package later
interface User {
  id: string;
  name: string | null;
  email: string;
  role: 'USER' | 'ADMIN';
}

// Define the shape of the store's state
interface AuthState {
  user: User | null;
  token: string | null;
  isLoggedIn: boolean;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  devtools(
    persist(
      (set) => ({
        user: null,
        token: null,
        isLoggedIn: false,
        setUser: (user) => set({ user, isLoggedIn: !!user }),
        setToken: (token) => set({ token }),
        logout: () => set({ user: null, token: null, isLoggedIn: false }),
      }),
      {
        name: 'auth-storage', // name of the item in the storage (must be unique)
      },
    ),
  ),
);
