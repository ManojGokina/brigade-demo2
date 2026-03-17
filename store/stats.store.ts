import { create } from 'zustand';
import { fetchStatsOverview, StatsOverview, StatsParams } from '../lib/stats-api';

const FALLBACK: StatsOverview = {
  totalCases: 0,
  activeSurgeons: 0,
  avgProductivity: 0,
  activeSites: 0,
  neuromaCases: 0,
  neuromaPercent: 0,
};

interface StatsState {
  data: StatsOverview;
  isLoading: boolean;
  error: string | null;
  fetch: (params?: StatsParams) => Promise<void>;
  clearError: () => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  data: FALLBACK,
  isLoading: false,
  error: null,

  fetch: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchStatsOverview(params);
      set({ data, isLoading: false });
    } catch (error: any) {
      const message = error.response?.data?.message || 'Failed to fetch stats';
      set({ data: FALLBACK, isLoading: false, error: message });
    }
  },

  clearError: () => set({ error: null }),
}));
