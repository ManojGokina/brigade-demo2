import casesData from "@/data/cases.json"
import type { Case, CaseFilters, CaseStats, SortField, SortDirection } from "@/types/case"

// Data access layer - abstracts the data source
// In production, replace this with API calls

export function getAllCases(): Case[] {
  return casesData as Case[]
}

export function getCaseById(id: number): Case | undefined {
  return getAllCases().find((c) => c.caseNo === id)
}

export function filterCases(cases: Case[], filters: CaseFilters): Case[] {
  return cases.filter((c) => {
    if (filters.type && filters.type !== "all" && c.type !== filters.type) {
      return false
    }
    if (filters.specialty && c.specialty !== filters.specialty) {
      return false
    }
    if (filters.tty && c.tty !== filters.tty) {
      return false
    }
    if (filters.ueOrLe && filters.ueOrLe !== "all" && c.ueOrLe !== filters.ueOrLe) {
      return false
    }
    if (filters.surgeon && c.surgeon !== filters.surgeon) {
      return false
    }
    if (filters.userStatus && filters.userStatus !== "all" && c.userStatus !== filters.userStatus) {
      return false
    }
    if (filters.search) {
      const searchLower = filters.search.toLowerCase()
      return (
        c.surgeryPerformed.toLowerCase().includes(searchLower) ||
        c.surgeon.toLowerCase().includes(searchLower) ||
        c.site.toLowerCase().includes(searchLower) ||
        c.system.toLowerCase().includes(searchLower)
      )
    }
    return true
  })
}

export function sortCases(cases: Case[], field: SortField, direction: SortDirection): Case[] {
  return [...cases].sort((a, b) => {
    const aVal = a[field]
    const bVal = b[field]
    
    if (typeof aVal === "string" && typeof bVal === "string") {
      return direction === "asc" 
        ? aVal.localeCompare(bVal) 
        : bVal.localeCompare(aVal)
    }
    
    if (typeof aVal === "number" && typeof bVal === "number") {
      return direction === "asc" ? aVal - bVal : bVal - aVal
    }
    
    if (typeof aVal === "boolean" && typeof bVal === "boolean") {
      return direction === "asc" 
        ? (aVal === bVal ? 0 : aVal ? 1 : -1)
        : (aVal === bVal ? 0 : aVal ? -1 : 1)
    }
    
    return 0
  })
}

export function calculateStats(cases: Case[]): CaseStats {
  const uniqueSurgeons = new Set(cases.map((c) => c.surgeon))
  const uniqueSites = new Set(cases.map((c) => c.site))
  
  return {
    totalCases: cases.length,
    totalNervesTreated: cases.reduce((sum, c) => sum + c.nervesTreated, 0),
    primaryCases: cases.filter((c) => c.type === "Primary").length,
    revisionCases: cases.filter((c) => c.type === "Revision").length,
    neuromaCases: cases.filter((c) => c.neuromaCase).length,
    caseStudies: cases.filter((c) => c.caseStudy).length,
    avgSurvivalDays: Math.round(
      cases.reduce((sum, c) => sum + c.survivalDays, 0) / cases.length
    ),
    uniqueSurgeons: uniqueSurgeons.size,
    uniqueSites: uniqueSites.size,
  }
}

// Aggregation functions for charts
export function getCasesByType(cases: Case[]): { name: string; value: number }[] {
  const primary = cases.filter((c) => c.type === "Primary").length
  const revision = cases.filter((c) => c.type === "Revision").length
  return [
    { name: "Primary", value: primary },
    { name: "Revision", value: revision },
  ]
}

export function getCasesBySpecialty(cases: Case[]): { name: string; value: number }[] {
  const counts: Record<string, number> = {}
  cases.forEach((c) => {
    counts[c.specialty] = (counts[c.specialty] || 0) + 1
  })
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function getCasesByTerritory(cases: Case[]): { name: string; value: number }[] {
  const counts: Record<string, number> = {}
  cases.forEach((c) => {
    counts[c.tty] = (counts[c.tty] || 0) + 1
  })
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function getCasesByExtremity(cases: Case[]): { name: string; value: number }[] {
  const ue = cases.filter((c) => c.ueOrLe === "UE").length
  const le = cases.filter((c) => c.ueOrLe === "LE").length
  return [
    { name: "Upper (UE)", value: ue },
    { name: "Lower (LE)", value: le },
  ]
}

export function getCasesByUserStatus(cases: Case[]): { name: string; value: number }[] {
  const counts: Record<string, number> = {}
  cases.forEach((c) => {
    counts[c.userStatus] = (counts[c.userStatus] || 0) + 1
  })
  return Object.entries(counts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value)
}

export function getCasesByMonth(cases: Case[]): { name: string; cases: number; nerves: number }[] {
  const monthOrder = ["Aug", "Sep", "Oct", "Nov", "Dec"]
  const counts: Record<string, { cases: number; nerves: number }> = {}
  
  cases.forEach((c) => {
    const [month] = c.opDate.split("/")
    const monthName = new Date(2024, parseInt(month) - 1).toLocaleString("en-US", { month: "short" })
    if (!counts[monthName]) {
      counts[monthName] = { cases: 0, nerves: 0 }
    }
    counts[monthName].cases += 1
    counts[monthName].nerves += c.nervesTreated
  })
  
  return monthOrder
    .filter((m) => counts[m])
    .map((name) => ({
      name,
      cases: counts[name].cases,
      nerves: counts[name].nerves,
    }))
}

// Get unique values for filter dropdowns
export function getUniqueSpecialties(cases: Case[]): string[] {
  return [...new Set(cases.map((c) => c.specialty))].sort()
}

export function getUniqueTerritories(cases: Case[]): string[] {
  return [...new Set(cases.map((c) => c.tty))].sort()
}

export function getUniqueSurgeons(cases: Case[]): string[] {
  return [...new Set(cases.map((c) => c.surgeon))].sort()
}

export function getUniqueSites(cases: Case[]): string[] {
  return [...new Set(cases.map((c) => c.site))].sort()
}
