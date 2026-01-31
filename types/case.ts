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
  extremity: "UE" | "LE"
  surgeryPerformed: string
  neuromaCase: boolean
  caseStudy: boolean
  survivalDays: number
  survivalWeeks: number
  territory: string
}

export interface CaseFilters {
  type?: "Primary" | "Revision" | "all"
  specialty?: string
  territory?: string
  extremity?: "UE" | "LE" | "all"
  userStatus?: "EST" | "IN" | "VAL" | "all"
  search?: string
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
