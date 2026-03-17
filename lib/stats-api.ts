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
