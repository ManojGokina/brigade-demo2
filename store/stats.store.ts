import { create } from 'zustand';
import { fetchStatsOverview, fetchCasesOverTime, StatsOverview, StatsParams, CasesOverTimeItem, CasesOverTimeParams } from '../lib/stats-api';

const FALLBACK_OVERVIEW: StatsOverview = {
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

  casesOverTime: CasesOverTimeItem[];
  casesOverTimeLoading: boolean;
  casesOverTimeError: string | null;
  fetchCasesOverTime: (params?: CasesOverTimeParams) => Promise<void>;

  clearError: () => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  data: FALLBACK_OVERVIEW,
  isLoading: false,
  error: null,

  casesOverTime: [],
  casesOverTimeLoading: false,
  casesOverTimeError: null,

  fetch: async (params = {}) => {
    set({ isLoading: true, error: null });
    try {
      const data = await fetchStatsOverview(params);
      set({ data, isLoading: false });
    } catch (error: any) {
      set({ data: FALLBACK_OVERVIEW, isLoading: false, error: error.response?.data?.message || 'Failed to fetch stats' });
    }
  },

  fetchCasesOverTime: async (params = {}) => {
    set({ casesOverTimeLoading: true, casesOverTimeError: null });
    try {
      const casesOverTime = await fetchCasesOverTime(params);
      set({ casesOverTime, casesOverTimeLoading: false });
    } catch (error: any) {
      set({ casesOverTime: [], casesOverTimeLoading: false, casesOverTimeError: error.response?.data?.message || 'Failed to fetch cases over time' });
    }
  },

  clearError: () => set({ error: null, casesOverTimeError: null }),
}));
