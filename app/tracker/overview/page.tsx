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
import { Skeleton } from "@/components/ui/skeleton"
import type { CaseFilters } from "@/types/case"
import { ProtectedRoute } from "@/components/protected-route"

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

  const showSkeleton = !isLoaded || !stats

  if (showSkeleton) {
    return (
      <ProtectedRoute>
      <div className="p-6 space-y-6">
        {/* Header skeleton */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <Skeleton className="h-7 w-56 rounded-lg" />
            <Skeleton className="h-4 w-72 rounded-full" />
          </div>
          <Skeleton className="h-8 w-40 rounded-full" />
        </div>

        {/* Filters skeleton */}
        <div className="rounded-lg border border-border/50 bg-card/50 p-4 space-y-3">
          <div className="flex flex-wrap gap-3">
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-9 w-32 rounded-md" />
            <Skeleton className="h-9 w-40 rounded-md" />
            <Skeleton className="h-9 w-48 rounded-md" />
          </div>
        </div>

        {/* Stats cards skeleton */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
          {Array.from({ length: 6 }).map((_, i) => (
            <div
              key={i}
              className="relative overflow-hidden rounded-lg border border-border/60 bg-card p-4"
            >
              <Skeleton className="mb-3 h-4 w-16 rounded-full" />
              <Skeleton className="h-7 w-20 rounded-lg" />
              <Skeleton className="mt-2 h-3 w-24 rounded-full" />
            </div>
          ))}
        </div>

        {/* Charts skeleton */}
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-2">
          <Skeleton className="h-64 rounded-xl" />
          <Skeleton className="h-64 rounded-xl" />
        </div>
      </div>
      </ProtectedRoute>
    )
  }

  return (
    <ProtectedRoute>
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
    </ProtectedRoute>
  )
}
