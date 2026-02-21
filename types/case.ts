export interface Case {
  caseNo: number
  nervesTreated: number
  opDate: string
  type: "Primary" | "Revision"
  system: string
  site: string
  surgeon: string
  userStatus: "EST" | "IN" | "VAL"
  specialty: string
  training: string
  ueOrLe: "UE" | "LE"
  surgeryPerformed: string
  typeOfSurgery?: string // Cap, TMR Adj, Wrap, Sheet - maps to use_case in database
  neuromaCase: boolean
  caseStudy: boolean
  tbd: "Primary" | "Revision" | ""
  survivalDays: number
  survivalWeeks: number
  region: string
}

export interface CaseFilters {
  type?: "Primary" | "Revision" | "all"
  specialty?: string
  region?: string
  ueOrLe?: "UE" | "LE" | "all"
  userStatus?: "EST" | "IN" | "VAL" | "all"
  surgeon?: string
  search?: string
  dateFrom?: string
  dateTo?: string
}

export interface CaseStats {
  totalCases: number
  totalNervesTreated: number
  primaryCases: number
  revisionCases: number
  neuromaCases: number
  caseStudies: number
  avgSurvivalDays: number
  uniqueSurgeons: number
  uniqueSites: number
}

export type SortField = keyof Case
export type SortDirection = "asc" | "desc"
