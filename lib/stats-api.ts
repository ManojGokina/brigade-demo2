import { api } from './api';

export interface StatsOverview {
  totalCases: number;
  activeSurgeons: number;
  avgProductivity: number;
  activeSites: number;
  neuromaCases: number;
  neuromaPercent: number;
}

export interface StatsParams {
  period?: 'today' | 'yesterday' | 'last7days' | 'thisMonth' | 'last3months' | 'last6months' | 'last1year' | 'custom';
  startDate?: string;
  endDate?: string;
}

export interface CasesOverTimeItem {
  month: string;
  monthKey: string;
  cases: number;
}

export interface CasesOverTimeParams {
  startDate?: string;
  endDate?: string;
  surgeons?: string[];
  statuses?: string[];
  regions?: string[];
  specialties?: string[];
  caseTypes?: string[];
  neuroma?: 'neuroma' | 'non-neuroma';
  sinceCase?: number;
}

export async function fetchStatsOverview(params: StatsParams = {}): Promise<StatsOverview> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== '') queryParams.append(key, String(value));
  });
  const query = queryParams.toString();
  const response = await api.get<{ success: boolean; data: StatsOverview }>(
    `/stats/overview${query ? `?${query}` : ''}`
  );
  return response.data.data;
}

export interface TimeMilestoneItem {
  surgeon: string;
  monthsTo2Cases: number;
  monthsTo3Consecutive: number;
}

export interface TimeMilestonesParams {
  startDate?: string;
  endDate?: string;
  surgeons?: string[];
}

export async function fetchTimeMilestones(params: TimeMilestonesParams = {}): Promise<TimeMilestoneItem[]> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value) && value.length > 0) queryParams.append(key, value.join(','));
    else if (!Array.isArray(value) && value !== '') queryParams.append(key, String(value));
  });
  const query = queryParams.toString();
  const response = await api.get<{ success: boolean; data: TimeMilestoneItem[] }>(
    `/stats/time-milestones${query ? `?${query}` : ''}`
  );
  return response.data.data;
}

export interface GracePeriodSurgeon {
  surgeon: string;
  firstCaseDate: string;
  daysSince: number;
}

export async function fetchGracePeriodSurgeons(): Promise<GracePeriodSurgeon[]> {
  const response = await api.get<{ success: boolean; data: GracePeriodSurgeon[] }>('/stats/grace-period-surgeons');
  return response.data.data;
}

export interface DaysToMilestonesItem {
  milestone: string;
  avg?: number;
  [surgeon: string]: any;
}

export interface DaysToMilestonesParams {
  startDate?: string;
  endDate?: string;
  surgeons?: string[];
}

export async function fetchDaysToMilestones(params: DaysToMilestonesParams = {}): Promise<DaysToMilestonesItem[]> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value) && value.length > 0) {
      queryParams.append(key, value.join(','));
    } else if (!Array.isArray(value) && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  const query = queryParams.toString();
  const response = await api.get<{ success: boolean; data: DaysToMilestonesItem[] }>(
    `/stats/days-to-milestones${query ? `?${query}` : ''}`
  );
  return response.data.data;
}

export interface TopPerformerItem {
  surgeon: string;
  totalCases: number;
  neuromaCases: number;
  region: string;
  specialty: string;
  productivity: number;
}

export interface TopPerformersParams {
  startDate?: string;
  endDate?: string;
  regions?: string[];
  specialties?: string[];
}

export async function fetchTopPerformers(params: TopPerformersParams = {}): Promise<TopPerformerItem[]> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value) && value.length > 0) {
      queryParams.append(key, value.join(','));
    } else if (!Array.isArray(value) && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  const query = queryParams.toString();
  const response = await api.get<{ success: boolean; data: TopPerformerItem[] }>(
    `/stats/top-performers${query ? `?${query}` : ''}`
  );
  return response.data.data;
}

export interface QoQGrowthItem {
  quarter: string;
  cases: number;
  surgeons: number;
  productivity: number;
}

export interface QoQGrowthParams {
  startDate?: string;
  endDate?: string;
  surgeons?: string[];
  regions?: string[];
  specialties?: string[];
  years?: string[];
}

export async function fetchQoQGrowth(params: QoQGrowthParams = {}): Promise<QoQGrowthItem[]> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value) && value.length > 0) queryParams.append(key, value.join(','));
    else if (!Array.isArray(value) && value !== '') queryParams.append(key, String(value));
  });
  const query = queryParams.toString();
  const response = await api.get<{ success: boolean; data: QoQGrowthItem[] }>(
    `/stats/qoq-growth${query ? `?${query}` : ''}`
  );
  return response.data.data;
}

export interface TimeMetricsItem {
  surgeon: string;
  timeActiveDays: number;
  timeInactiveDays: number;
  monthsSince1st: number;
  monthsSince2nd: number;
  firstCaseDate: string;
  secondCaseDate: string | null;
  lastCaseDate: string;
}

export interface TimeMetricsParams {
  startDate?: string;
  endDate?: string;
  surgeons?: string[];
}

export async function fetchTimeMetrics(params: TimeMetricsParams = {}): Promise<TimeMetricsItem[]> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value) && value.length > 0) queryParams.append(key, value.join(','));
    else if (!Array.isArray(value) && value !== '') queryParams.append(key, String(value));
  });
  const query = queryParams.toString();
  const response = await api.get<{ success: boolean; data: TimeMetricsItem[] }>(
    `/stats/time-metrics${query ? `?${query}` : ''}`
  );
  return response.data.data;
}

export interface SurvivalTimeItem {
  caseId: string;
  surgeon: string;
  specialty: string;
  operationDate: string | null;
  daysSinceSurgery: number | null;
}

export interface SurvivalTimeParams {
  startDate?: string;
  endDate?: string;
  surgeons?: string[];
  specialties?: string[];
}

export async function fetchSurvivalTime(params: SurvivalTimeParams = {}): Promise<SurvivalTimeItem[]> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value) && value.length > 0) queryParams.append(key, value.join(','));
    else if (!Array.isArray(value) && value !== '') queryParams.append(key, String(value));
  });
  const query = queryParams.toString();
  const response = await api.get<{ success: boolean; data: SurvivalTimeItem[] }>(
    `/stats/survival-time${query ? `?${query}` : ''}`
  );
  return response.data.data;
}

export interface SecondCaseBookingRow {
  category: string;
  percentage?: number;
  [status: string]: any;
}

export interface SecondCaseBookingParams {
  startDate?: string;
  endDate?: string;
  statuses?: string[];
  breakdown?: 'overall' | 'userType' | 'region' | 'specialty';
  excludeDays?: number;
}

export interface DrilldownSurgeon {
  surgeon: string;
  totalCases: number;
  status: string;
}

export interface SecondCaseBookingDrilldownResult {
  with: DrilldownSurgeon[];
  without: DrilldownSurgeon[];
}

export interface SecondCaseBookingDrilldownParams {
  startDate?: string;
  endDate?: string;
  category: string;
  status?: string;
  statuses?: string[];
  breakdown?: 'overall' | 'userType' | 'region' | 'specialty';
  excludeDays?: number;
}

export async function fetchSecondCaseBooking(params: SecondCaseBookingParams = {}): Promise<SecondCaseBookingRow[]> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value) && value.length > 0) queryParams.append(key, value.join(','));
    else if (!Array.isArray(value) && value !== '') queryParams.append(key, String(value));
  });
  const query = queryParams.toString();
  const response = await api.get<{ success: boolean; data: SecondCaseBookingRow[] }>(
    `/stats/second-case-booking${query ? `?${query}` : ''}`
  );
  return response.data.data;
}

export async function fetchSecondCaseBookingDrilldown(params: SecondCaseBookingDrilldownParams): Promise<SecondCaseBookingDrilldownResult> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value) && value.length > 0) queryParams.append(key, value.join(','));
    else if (!Array.isArray(value) && value !== '') queryParams.append(key, String(value));
  });
  const query = queryParams.toString();
  const response = await api.get<{ success: boolean; data: SecondCaseBookingDrilldownResult }>(
    `/stats/second-case-booking/drilldown${query ? `?${query}` : ''}`
  );
  return response.data.data;
}

export interface DaysBetweenCasesRow {
  caseNumber: string;
  days?: number;
  date?: string;
  [surgeon: string]: any;
}

export interface DaysBetweenCasesParams {
  startDate?: string;
  endDate?: string;
  surgeons?: string[];
}

export async function fetchDaysBetweenCases(params: DaysBetweenCasesParams = {}): Promise<DaysBetweenCasesRow[]> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value) && value.length > 0) queryParams.append(key, value.join(','));
    else if (!Array.isArray(value) && value !== '') queryParams.append(key, String(value));
  });
  const query = queryParams.toString();
  const response = await api.get<{ success: boolean; data: DaysBetweenCasesRow[] }>(
    `/stats/days-between-cases${query ? `?${query}` : ''}`
  );
  return response.data.data;
}

export async function fetchCasesOverTime(params: CasesOverTimeParams = {}): Promise<CasesOverTimeItem[]> {
  const queryParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    if (Array.isArray(value) && value.length > 0) {
      queryParams.append(key, value.join(','));
    } else if (!Array.isArray(value) && value !== '') {
      queryParams.append(key, String(value));
    }
  });
  const query = queryParams.toString();
  const response = await api.get<{ success: boolean; data: CasesOverTimeItem[] }>(
    `/stats/cases-over-time${query ? `?${query}` : ''}`
  );
  return response.data.data;
}
