import { create } from 'zustand';
import { fetchStatsOverview, fetchCasesOverTime, fetchTopPerformers, fetchDaysToMilestones, fetchGracePeriodSurgeons, fetchTimeMilestones, fetchQoQGrowth, fetchTimeMetrics, fetchDaysBetweenCases, fetchSecondCaseBooking, StatsOverview, StatsParams, CasesOverTimeItem, CasesOverTimeParams, TopPerformerItem, TopPerformersParams, DaysToMilestonesItem, DaysToMilestonesParams, GracePeriodSurgeon, TimeMilestoneItem, TimeMilestonesParams, QoQGrowthItem, QoQGrowthParams, TimeMetricsItem, TimeMetricsParams, DaysBetweenCasesRow, DaysBetweenCasesParams, SecondCaseBookingRow, SecondCaseBookingParams } from '../lib/stats-api';

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

  timeMilestones: TimeMilestoneItem[];
  timeMilestonesLoading: boolean;
  timeMilestonesError: string | null;
  fetchTimeMilestones: (params?: TimeMilestonesParams) => Promise<void>;

  qoqGrowth: QoQGrowthItem[];
  qoqGrowthLoading: boolean;
  qoqGrowthError: string | null;
  fetchQoQGrowth: (params?: QoQGrowthParams) => Promise<void>;

  timeMetrics: TimeMetricsItem[];
  timeMetricsLoading: boolean;
  timeMetricsError: string | null;
  fetchTimeMetrics: (params?: TimeMetricsParams) => Promise<void>;

  daysBetweenCases: DaysBetweenCasesRow[];
  daysBetweenCasesLoading: boolean;
  daysBetweenCasesError: string | null;
  fetchDaysBetweenCases: (params?: DaysBetweenCasesParams) => Promise<void>;

  secondCaseBooking: SecondCaseBookingRow[];
  secondCaseBookingLoading: boolean;
  secondCaseBookingError: string | null;
  fetchSecondCaseBooking: (params?: SecondCaseBookingParams) => Promise<void>;

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

  timeMilestones: [],
  timeMilestonesLoading: false,
  timeMilestonesError: null,

  qoqGrowth: [],
  qoqGrowthLoading: false,
  qoqGrowthError: null,

  timeMetrics: [],
  timeMetricsLoading: false,
  timeMetricsError: null,

  daysBetweenCases: [],
  daysBetweenCasesLoading: false,
  daysBetweenCasesError: null,

  secondCaseBooking: [],
  secondCaseBookingLoading: false,
  secondCaseBookingError: null,

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

  fetchTimeMilestones: async (params = {}) => {
    set({ timeMilestonesLoading: true, timeMilestonesError: null });
    try {
      const timeMilestones = await fetchTimeMilestones(params);
      set({ timeMilestones, timeMilestonesLoading: false });
    } catch (error: any) {
      set({ timeMilestones: [], timeMilestonesLoading: false, timeMilestonesError: error.response?.data?.message || 'Failed to fetch time milestones' });
    }
  },

  fetchQoQGrowth: async (params = {}) => {
    set({ qoqGrowthLoading: true, qoqGrowthError: null });
    try {
      const qoqGrowth = await fetchQoQGrowth(params);
      set({ qoqGrowth, qoqGrowthLoading: false });
    } catch (error: any) {
      set({ qoqGrowth: [], qoqGrowthLoading: false, qoqGrowthError: error.response?.data?.message || 'Failed to fetch QoQ growth' });
    }
  },

  fetchTimeMetrics: async (params = {}) => {
    set({ timeMetricsLoading: true, timeMetricsError: null });
    try {
      const timeMetrics = await fetchTimeMetrics(params);
      set({ timeMetrics, timeMetricsLoading: false });
    } catch (error: any) {
      set({ timeMetrics: [], timeMetricsLoading: false, timeMetricsError: error.response?.data?.message || 'Failed to fetch time metrics' });
    }
  },

  fetchDaysBetweenCases: async (params = {}) => {
    set({ daysBetweenCasesLoading: true, daysBetweenCasesError: null });
    try {
      const daysBetweenCases = await fetchDaysBetweenCases(params);
      set({ daysBetweenCases, daysBetweenCasesLoading: false });
    } catch (error: any) {
      set({ daysBetweenCases: [], daysBetweenCasesLoading: false, daysBetweenCasesError: error.response?.data?.message || 'Failed to fetch days between cases' });
    }
  },

  fetchSecondCaseBooking: async (params = {}) => {
    set({ secondCaseBookingLoading: true, secondCaseBookingError: null });
    try {
      const secondCaseBooking = await fetchSecondCaseBooking(params);
      set({ secondCaseBooking, secondCaseBookingLoading: false });
    } catch (error: any) {
      set({ secondCaseBooking: [], secondCaseBookingLoading: false, secondCaseBookingError: error.response?.data?.message || 'Failed to fetch second case booking' });
    }
  },

  clearError: () => set({ error: null, casesOverTimeError: null, topPerformersError: null, daysToMilestonesError: null, gracePeriodError: null, timeMilestonesError: null, qoqGrowthError: null, timeMetricsError: null, daysBetweenCasesError: null, secondCaseBookingError: null }),
}));
