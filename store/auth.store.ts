import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { api } from '../lib/api';

interface User {
  userId: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

interface DashboardAccess {
  dashboards: Array<{
    id: number;
    name: string;
    description: string;
    is_active: boolean;
    created_at: string;
    updated_at: string;
  }>;
  modules: Array<{
    id: number;
    name: string;
    description: string;
    actions: Array<{
      id: number;
      name: string;
      description: string;
    }>;
  }>;
}

interface DashboardModule {
  moduleId: number;
  moduleName: string;
  description: string;
  actions: Array<{
    actionId: number;
    actionName: string;
  }>;
}

interface AuthState {
  user: User | null;
  token: string | null;
  dashboardAccess: DashboardAccess | null;
  currentDashboardId: number | null;
  currentDashboardModules: DashboardModule[] | null;
  isLoading: boolean;
  error: string | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  fetchDashboardAccess: () => Promise<void>;
  fetchDashboardModules: (dashboardId: number) => Promise<void>;
  clearError: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      dashboardAccess: null,
      currentDashboardId: null,
      currentDashboardModules: null,
      isLoading: false,
      error: null,

      login: async (email: string, password: string) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/auth/login', { email, password });
          
          const { user, token } = response.data.data;
          
          // Store token in localStorage for axios interceptor
          localStorage.setItem('auth_token', token);
          
          set({ 
            user, 
            token, 
            isLoading: false,
            error: null 
          });

          // Fetch dashboard access immediately after successful login
          try {
            const dashboardResponse = await api.post('/users/dashboard-access', {
              user_id: user.userId
            });
            set({ dashboardAccess: { dashboards: dashboardResponse.data.data, modules: [] } });
          } catch (err) {
            console.error('Failed to fetch dashboard access:', err);
            set({ dashboardAccess: { dashboards: [], modules: [] } });
          }
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Login failed';
          set({ 
            error: errorMessage, 
            isLoading: false,
            user: null,
            token: null 
          });
          throw error;
        }
      },

      logout: () => {
        localStorage.removeItem('auth_token');
        set({ 
          user: null, 
          token: null, 
          dashboardAccess: null,
          currentDashboardId: null,
          currentDashboardModules: null,
          error: null 
        });
      },

      fetchDashboardAccess: async () => {
        const { user } = get();
        if (!user) return;

        set({ isLoading: true, error: null });
        try {
          const response = await api.post('/users/dashboard-access', {
            user_id: user.userId
          });
          
          set({ 
            dashboardAccess: response.data.data,
            isLoading: false 
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch dashboard access';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          throw error;
        }
      },

      clearError: () => set({ error: null }),

      fetchDashboardModules: async (dashboardId: number) => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get(`/dashboards/${dashboardId}/modules`);
          set({ 
            currentDashboardId: dashboardId,
            currentDashboardModules: response.data.data,
            isLoading: false 
          });
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Failed to fetch dashboard modules';
          set({ 
            error: errorMessage, 
            isLoading: false 
          });
          throw error;
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({ 
        user: state.user, 
        token: state.token,
        dashboardAccess: state.dashboardAccess,
        currentDashboardId: state.currentDashboardId,
        currentDashboardModules: state.currentDashboardModules
      }),
      skipHydration: false,
    }
  )
);
