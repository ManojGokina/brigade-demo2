"use client"

import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import initialCasesData from "@/data/cases.json"
import type { Case, CaseFilters } from "@/types/case"
import { filterCases } from "@/lib/case-data"

const STORAGE_KEY = "case-tracker-data"
const STORAGE_VERSION = "2.0"

interface CaseContextValue {
  cases: Case[]
  isLoaded: boolean
  addCase: (newCase: Omit<Case, "caseNo">) => Case
  updateCase: (caseNo: number, updates: Partial<Case>) => void
  deleteCase: (caseNo: number) => void
  resetToInitial: () => void
  getNextCaseNo: () => number
}

const CaseContext = createContext<CaseContextValue | undefined>(undefined)

interface StoredData {
  version: string
  cases: Case[]
  lastModified: string
}

function loadFromStorage(): Case[] | null {
  if (typeof window === "undefined") return null
  
  try {
    const stored = localStorage.getItem(STORAGE_KEY)
    if (!stored) return null
    
    const data: StoredData = JSON.parse(stored)
    
    // Version check for future migrations
    if (data.version !== STORAGE_VERSION) {
      console.log("[v0] Storage version mismatch, resetting to initial data")
      return null
    }
    
    return data.cases
  } catch (error) {
    console.error("[v0] Failed to load from localStorage:", error)
    return null
  }
}

function saveToStorage(cases: Case[]): void {
  if (typeof window === "undefined") return
  
  try {
    const data: StoredData = {
      version: STORAGE_VERSION,
      cases,
      lastModified: new Date().toISOString(),
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data))
  } catch (error) {
    console.error("[v0] Failed to save to localStorage:", error)
  }
}

export function CaseProvider({ children }: { children: React.ReactNode }) {
  const [cases, setCases] = useState<Case[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  // Load data on mount
  useEffect(() => {
    const storedCases = loadFromStorage()
    if (storedCases && storedCases.length > 0) {
      setCases(storedCases)
    } else {
      // Use initial data from JSON
      setCases(initialCasesData as Case[])
    }
    setIsLoaded(true)
  }, [])

  // Save to localStorage whenever cases change (after initial load)
  useEffect(() => {
    if (isLoaded && cases.length > 0) {
      saveToStorage(cases)
    }
  }, [cases, isLoaded])

  const getNextCaseNo = useCallback((): number => {
    if (cases.length === 0) return 1
    return Math.max(...cases.map((c) => c.caseNo)) + 1
  }, [cases])

  const addCase = useCallback(
    (newCaseData: Omit<Case, "caseNo">): Case => {
      const newCase: Case = {
        ...newCaseData,
        caseNo: getNextCaseNo(),
      }
      setCases((prev) => [...prev, newCase])
      return newCase
    },
    [getNextCaseNo]
  )

  const updateCase = useCallback((caseNo: number, updates: Partial<Case>): void => {
    setCases((prev) =>
      prev.map((c) => (c.caseNo === caseNo ? { ...c, ...updates } : c))
    )
  }, [])

  const deleteCase = useCallback((caseNo: number): void => {
    setCases((prev) => prev.filter((c) => c.caseNo !== caseNo))
  }, [])

  const resetToInitial = useCallback((): void => {
    setCases(initialCasesData as Case[])
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY)
    }
  }, [])

  const value = useMemo(
    () => ({
      cases,
      isLoaded,
      addCase,
      updateCase,
      deleteCase,
      resetToInitial,
      getNextCaseNo,
    }),
    [cases, isLoaded, addCase, updateCase, deleteCase, resetToInitial, getNextCaseNo]
  )

  return <CaseContext.Provider value={value}>{children}</CaseContext.Provider>
}

export function useCases() {
  const context = useContext(CaseContext)
  if (!context) {
    throw new Error("useCases must be used within a CaseProvider")
  }
  return context
}

// Hook for computed stats and aggregations with optional filters
export function useCaseStats(filters?: CaseFilters) {
  const { cases, isLoaded } = useCases()

  return useMemo(() => {
    if (!isLoaded || cases.length === 0) {
      return {
        isLoaded,
        stats: null,
        byType: [],
        bySpecialty: [],
        byTerritory: [],
        byExtremity: [],
        bySurgeon: [],
        byMonth: [],
        specialties: [],
        territories: [],
        surgeons: [],
        sites: [],
        totalCases: 0,
        filteredCount: 0,
      }
    }

    // Get all unique values from ALL cases (not filtered) for filter dropdowns
    const allSpecialties = [...new Set(cases.map((c) => c.specialty))].sort()
    const allTerritories = [...new Set(cases.map((c) => c.tty))].sort()
    const allSurgeons = [...new Set(cases.map((c) => c.surgeon))].sort()
    const allSites = [...new Set(cases.map((c) => c.site))].sort()

    // Apply filters if provided
    const filteredCases = filters ? filterCases(cases, filters) : cases

    const uniqueSurgeons = [...new Set(filteredCases.map((c) => c.surgeon))]
    const uniqueSites = [...new Set(filteredCases.map((c) => c.site))]

    const stats = {
      totalCases: filteredCases.length,
      totalNervesTreated: filteredCases.reduce((sum, c) => sum + c.nervesTreated, 0),
      primaryCases: filteredCases.filter((c) => c.type === "Primary").length,
      revisionCases: filteredCases.filter((c) => c.type === "Revision").length,
      neuromaCases: filteredCases.filter((c) => c.neuromaCase).length,
      caseStudies: filteredCases.filter((c) => c.caseStudy).length,
      avgSurvivalDays: filteredCases.length > 0 
        ? Math.round(filteredCases.reduce((sum, c) => sum + c.survivalDays, 0) / filteredCases.length)
        : 0,
      uniqueSurgeons: uniqueSurgeons.length,
      uniqueSites: uniqueSites.length,
    }

    const byType = [
      { name: "Primary", value: stats.primaryCases },
      { name: "Revision", value: stats.revisionCases },
    ]

    const specialtyCounts: Record<string, number> = {}
    const territoryCounts: Record<string, number> = {}
    filteredCases.forEach((c) => {
      specialtyCounts[c.specialty] = (specialtyCounts[c.specialty] || 0) + 1
      territoryCounts[c.tty] = (territoryCounts[c.tty] || 0) + 1
    })

    const bySpecialty = Object.entries(specialtyCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    const byTerritory = Object.entries(territoryCounts)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => b.value - a.value)

    const byExtremity = [
      { name: "Upper (UE)", value: filteredCases.filter((c) => c.ueOrLe === "UE").length },
      { name: "Lower (LE)", value: filteredCases.filter((c) => c.ueOrLe === "LE").length },
    ]

    // Surgeon productivity data
    const surgeonCounts: Record<string, { cases: number; nerves: number; primary: number; revision: number }> = {}
    filteredCases.forEach((c) => {
      if (!surgeonCounts[c.surgeon]) {
        surgeonCounts[c.surgeon] = { cases: 0, nerves: 0, primary: 0, revision: 0 }
      }
      surgeonCounts[c.surgeon].cases += 1
      surgeonCounts[c.surgeon].nerves += c.nervesTreated
      if (c.type === "Primary") surgeonCounts[c.surgeon].primary += 1
      else surgeonCounts[c.surgeon].revision += 1
    })

    const bySurgeon = Object.entries(surgeonCounts)
      .map(([name, data]) => ({ name, ...data }))
      .sort((a, b) => b.cases - a.cases)

    // Cases by month
    const monthOrder = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
    const monthCounts: Record<string, { cases: number; nerves: number }> = {}
    filteredCases.forEach((c) => {
      const [month] = c.opDate.split("/")
      const monthName = new Date(2024, parseInt(month) - 1).toLocaleString("en-US", { month: "short" })
      if (!monthCounts[monthName]) {
        monthCounts[monthName] = { cases: 0, nerves: 0 }
      }
      monthCounts[monthName].cases += 1
      monthCounts[monthName].nerves += c.nervesTreated
    })
    const byMonth = monthOrder
      .filter((m) => monthCounts[m])
      .map((name) => ({
        name,
        cases: monthCounts[name].cases,
        nerves: monthCounts[name].nerves,
      }))

    return {
      isLoaded,
      stats,
      byType,
      bySpecialty,
      byTerritory,
      byExtremity,
      bySurgeon,
      byMonth,
      specialties: allSpecialties,
      territories: allTerritories,
      surgeons: allSurgeons,
      sites: allSites,
      totalCases: cases.length,
      filteredCount: filteredCases.length,
    }
  }, [cases, isLoaded, filters])
}
