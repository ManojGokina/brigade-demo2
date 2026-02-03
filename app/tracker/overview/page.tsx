"use client"

import { useState } from "react"
import { StatsCards } from "@/components/dashboard/stats-cards"
import {
  CasesByTypeChart,
  CasesBySpecialtyChart,
  CasesByTerritoryChart,
  CasesOverTimeChart,
  ExtremityChart,
  SurgeonProductivityChart,
  TopPerformingSurgeons,
} from "@/components/dashboard/case-charts"
import { CaseFiltersComponent } from "@/components/dashboard/case-filters"
import { useCaseStats } from "@/lib/case-context"
import { Badge } from "@/components/ui/badge"
import { Filter } from "lucide-react"
import type { CaseFilters } from "@/types/case"

export default function OverviewPage() {
  const [filters, setFilters] = useState<CaseFilters>({
    type: "all",
    ueOrLe: "all",
    userStatus: "all",
    search: "",
  })

  const {
    isLoaded,
    stats,
    byType,
    bySpecialty,
    byTerritory,
    byExtremity,
    bySurgeon,
    byMonth,
    specialties,
    territories,
    surgeons,
    totalCases,
    filteredCount,
  } = useCaseStats(filters)

  const hasActiveFilters =
    filters.type !== "all" ||
    filters.specialty ||
    filters.tty ||
    filters.ueOrLe !== "all" ||
    filters.userStatus !== "all" ||
    filters.surgeon ||
    filters.search

  if (!isLoaded || !stats) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="p-6">
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
          <p className="text-sm text-muted-foreground">
            Surgical case tracking and analytics
          </p>
        </div>
        {hasActiveFilters && (
          <Badge variant="secondary" className="w-fit gap-1.5">
            <Filter className="h-3 w-3" />
            Showing {filteredCount} of {totalCases} cases
          </Badge>
        )}
      </div>

      {/* Filters Section */}
      <div className="mb-6 rounded-lg border border-border/50 bg-card/50 p-4">
        <CaseFiltersComponent
          filters={filters}
          onFiltersChange={setFilters}
          specialties={specialties}
          territories={territories}
          surgeons={surgeons}
          showSearch={false}
        />
      </div>

      <StatsCards stats={stats} />

      {/* Top Row - Surgeon Focus */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <SurgeonProductivityChart data={bySurgeon} allSurgeons={surgeons} />
        <CasesBySpecialtyChart data={bySpecialty} />
      </div>

      {/* Middle Row - Case Analytics */}
      <div className="mt-6 grid gap-4 md:grid-cols-3">
        <TopPerformingSurgeons data={bySurgeon} allSurgeons={surgeons} />
        <CasesByTypeChart data={byType} />
        <ExtremityChart data={byExtremity} />
      </div>

      {/* Bottom Row - Time & Territory */}
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <CasesOverTimeChart data={byMonth} />
        <CasesByTerritoryChart data={byTerritory} />
      </div>
    </div>
  )
}
