import { create } from 'zustand';
import { fetchStatsOverview, fetchCasesOverTime, fetchTopPerformers, fetchDaysToMilestones, fetchGracePeriodSurgeons, StatsOverview, StatsParams, CasesOverTimeItem, CasesOverTimeParams, TopPerformerItem, TopPerformersParams, DaysToMilestonesItem, DaysToMilestonesParams, GracePeriodSurgeon } from '../lib/stats-api';

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

  topPerformers: TopPerformerItem[];
  topPerformersLoading: boolean;
  topPerformersError: string | null;
  fetchTopPerformers: (params?: TopPerformersParams) => Promise<void>;

  daysToMilestones: DaysToMilestonesItem[];
  daysToMilestonesLoading: boolean;
  daysToMilestonesError: string | null;
  fetchDaysToMilestones: (params?: DaysToMilestonesParams) => Promise<void>;

  gracePeriodSurgeons: GracePeriodSurgeon[];
  gracePeriodLoading: boolean;
  gracePeriodError: string | null;
  fetchGracePeriodSurgeons: () => Promise<void>;

  clearError: () => void;
}

export const useStatsStore = create<StatsState>((set) => ({
  data: FALLBACK_OVERVIEW,
  isLoading: false,
  error: null,

  casesOverTime: [],
  casesOverTimeLoading: false,
  casesOverTimeError: null,

  topPerformers: [],
  topPerformersLoading: false,
  topPerformersError: null,

  daysToMilestones: [],
  daysToMilestonesLoading: false,
  daysToMilestonesError: null,

  gracePeriodSurgeons: [],
  gracePeriodLoading: false,
  gracePeriodError: null,

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

  fetchTopPerformers: async (params = {}) => {
    set({ topPerformersLoading: true, topPerformersError: null });
    try {
      const topPerformers = await fetchTopPerformers(params);
      set({ topPerformers, topPerformersLoading: false });
    } catch (error: any) {
      set({ topPerformers: [], topPerformersLoading: false, topPerformersError: error.response?.data?.message || 'Failed to fetch top performers' });
    }
  },

  fetchDaysToMilestones: async (params = {}) => {
    set({ daysToMilestonesLoading: true, daysToMilestonesError: null });
    try {
      const daysToMilestones = await fetchDaysToMilestones(params);
      set({ daysToMilestones, daysToMilestonesLoading: false });
    } catch (error: any) {
      set({ daysToMilestones: [], daysToMilestonesLoading: false, daysToMilestonesError: error.response?.data?.message || 'Failed to fetch days to milestones' });
    }
  },

  fetchGracePeriodSurgeons: async () => {
    set({ gracePeriodLoading: true, gracePeriodError: null });
    try {
      const gracePeriodSurgeons = await fetchGracePeriodSurgeons();
      set({ gracePeriodSurgeons, gracePeriodLoading: false });
    } catch (error: any) {
      set({ gracePeriodSurgeons: [], gracePeriodLoading: false, gracePeriodError: error.response?.data?.message || 'Failed to fetch grace period surgeons' });
    }
  },

  clearError: () => set({ error: null, casesOverTimeError: null, topPerformersError: null, daysToMilestonesError: null, gracePeriodError: null }),
}));
