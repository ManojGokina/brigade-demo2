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
