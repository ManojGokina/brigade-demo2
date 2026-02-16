"use client"

import { useState, useMemo } from "react"
import { CaseFiltersComponent } from "@/components/dashboard/case-filters"
import { CasesTable } from "@/components/dashboard/cases-table"
import { filterCases } from "@/lib/case-data"
import { useCases, useCaseStats } from "@/lib/case-context"
import type { CaseFilters } from "@/types/case"
import { ProtectedRoute } from "@/components/protected-route"

export default function CasesPage() {
  const { cases, isLoaded } = useCases()
  const { specialties, territories, surgeons } = useCaseStats()

  const [filters, setFilters] = useState<CaseFilters>({
    type: "all",
    ueOrLe: "all",
    userStatus: "all",
    search: "",
  })

  const filteredCases = useMemo(() => {
    if (!cases || !Array.isArray(cases)) return []
    return filterCases(cases, filters)
  }, [cases, filters])

  if (!isLoaded) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <ProtectedRoute>
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight text-foreground">All Cases</h1>
        <p className="text-sm text-muted-foreground">
          {filteredCases.length} cases
          {filteredCases.length !== cases.length && ` (filtered from ${cases.length})`}
        </p>
      </div>

      <CaseFiltersComponent
        filters={filters}
        onFiltersChange={setFilters}
        specialties={specialties || []}
        territories={territories || []}
        surgeons={surgeons || []}
      />

      <div className="mt-4">
        <CasesTable cases={filteredCases} />
      </div>
    </div>
    </ProtectedRoute>
  )
}
