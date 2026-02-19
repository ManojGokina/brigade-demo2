import { api } from './api';

export interface CaseRow {
  id: string | number;
  caseNumber: number | null;
  operationDate: Date | string | null;
  nervesTreated: number | null;
  systemName: string | null;
  site: string | null;
  surgeon: string | null;
  region: string | null;
  userStatus: string | null;
  ueLe: string | null;
  surgeryPerformed: string | null;
  useCase: string | null;
  isNeuromaCase: boolean | null;
  isCaseStudy: boolean | null;
  specialty: string | null;
  training: string | null;
  tbd: string | null;
}

export interface CasesApiResponse {
  items: CaseRow[];
  pagination: {
    total: number;
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

export interface CasesApiParams {
  search?: string;
  limit?: number;
  offset?: number;
  caseNumber?: number;
  operationDateFrom?: string;
  operationDateTo?: string;
  useCase?: string;
  specialty?: string;
  surgeon?: string;
  site?: string;
  region?: string;
  userStatus?: string;
  ueLe?: string;
  systemName?: string;
  training?: string;
  tbd?: string;
  isNeuromaCase?: boolean;
  isCaseStudy?: boolean;
  nervesTreatedMin?: number;
  nervesTreatedMax?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}

/**
 * Fetch cases from the API
 */
export async function fetchCases(params: CasesApiParams = {}): Promise<CasesApiResponse> {
  const queryParams = new URLSearchParams();
  
  // Add all non-undefined params to query string
  Object.entries(params).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      queryParams.append(key, String(value));
    }
  });

  const response = await api.get<{ success: boolean; data: CasesApiResponse }>(
    `/users/cases?${queryParams.toString()}`
  );

  return response.data.data;
}

/**
 * Map API CaseRow to frontend Case type
 */
export function mapCaseRowToCase(row: CaseRow): import('@/types/case').Case {
  // Calculate survival days/weeks from operation date if available
  const opDate = row.operationDate ? new Date(row.operationDate) : null;
  const now = new Date();
  const survivalDays = opDate ? Math.floor((now.getTime() - opDate.getTime()) / (1000 * 60 * 60 * 24)) : 0;
  const survivalWeeks = Math.floor(survivalDays / 7);

  return {
    caseNo: row.caseNumber || 0,
    nervesTreated: row.nervesTreated || 0,
    opDate: opDate ? opDate.toISOString().split('T')[0] : '',
    type: (row.useCase === 'Primary' || row.useCase === 'Revision') ? row.useCase : 'Primary',
    system: row.systemName || '',
    site: row.site || '',
    surgeon: row.surgeon || '',
    userStatus: (row.userStatus === 'EST' || row.userStatus === 'IN' || row.userStatus === 'VAL') 
      ? row.userStatus 
      : 'EST',
    specialty: row.specialty || '',
    training: row.training || '',
    ueOrLe: (row.ueLe === 'UE' || row.ueLe === 'LE') ? row.ueLe : 'UE',
    surgeryPerformed: row.surgeryPerformed || '',
    neuromaCase: row.isNeuromaCase || false,
    caseStudy: row.isCaseStudy || false,
    survivalDays,
    survivalWeeks,
    region: row.region || '',
  };
}

