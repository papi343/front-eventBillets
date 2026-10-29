import { create } from 'zustand';
import { eventBilletApi } from '../api/services';
import type { User, UserRole } from '../types';

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (payload: {
    name: string;
    email: string;
    password: string;
    phone?: string;
    role: UserRole;
  }) => Promise<boolean>;
  logout: () => Promise<void>;
  clearError: () => void;
}

const getInitialUser = (): User | null => {
  try {
    const raw = localStorage.getItem('eb_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
};

export const useAuthStore = create<AuthState>((set) => ({
  user: getInitialUser(),
  token: localStorage.getItem('eb_token'),
  loading: false,
  error: null,

  login: async (email, password) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await eventBilletApi.login(email, password);
      localStorage.setItem('eb_token', token);
      localStorage.setItem('eb_user', JSON.stringify(user));
      set({ token, user, loading: false });
      return true;
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || 'Identifiants invalides',
      });
      return false;
    }
  },

  register: async (payload) => {
    set({ loading: true, error: null });
    try {
      const { token, user } = await eventBilletApi.register(payload);
      localStorage.setItem('eb_token', token);
      localStorage.setItem('eb_user', JSON.stringify(user));
      set({ token, user, loading: false });
      return true;
    } catch (err: any) {
      set({
        loading: false,
        error: err.message || "Erreur lors de l'inscription",
      });
      return false;
    }
  },

  logout: async () => {
    await eventBilletApi.logout();
    localStorage.removeItem('eb_token');
    localStorage.removeItem('eb_user');
    set({ user: null, token: null, error: null });
  },

  clearError: () => set({ error: null }),
}));
