"use client"

import { useState, useEffect, useMemo, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Plus } from "lucide-react"
import { Button } from "@/components/ui/button"
import { CaseFiltersComponent } from "@/components/dashboard/case-filters"
import { CasesTable } from "@/components/dashboard/cases-table"
import { fetchCases, mapCaseRowToCase, type CasesApiParams } from "@/lib/cases-api"
import { useCaseStats } from "@/lib/case-context"
import type { CaseFilters, Case } from "@/types/case"
import { ProtectedRoute } from "@/components/protected-route"
import { useToast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

const DEFAULT_PAGE_SIZE = 20

export default function CasesPage() {
  const router = useRouter()
  const { specialties, regions, surgeons } = useCaseStats()
  const [cases, setCases] = useState<Case[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: DEFAULT_PAGE_SIZE,
    offset: 0,
    hasMore: false,
  })

  const [filters, setFilters] = useState<CaseFilters>({
    type: "all",
    ueOrLe: "all",
    userStatus: "all",
    search: "",
  })

  const { toast } = useToast()

  // Convert frontend filters to API params
  const getApiParams = useCallback((currentFilters: CaseFilters, currentOffset: number = 0): CasesApiParams => {
    const params: CasesApiParams = {
      limit: pagination.limit,
      offset: currentOffset,
    }

    if (currentFilters.search) {
      params.search = currentFilters.search
    }

    if (currentFilters.type && currentFilters.type !== "all") {
      params.useCase = currentFilters.type
    }

    if (currentFilters.ueOrLe && currentFilters.ueOrLe !== "all") {
      params.ueLe = currentFilters.ueOrLe
    }

    if (currentFilters.userStatus && currentFilters.userStatus !== "all") {
      params.userStatus = currentFilters.userStatus
    }

    if (currentFilters.specialty) {
      params.specialty = currentFilters.specialty
    }

    if (currentFilters.surgeon) {
      params.surgeon = currentFilters.surgeon
    }

    if (currentFilters.region) {
      params.region = currentFilters.region
    }

    if (currentFilters.dateFrom) {
      params.operationDateFrom = currentFilters.dateFrom
    }

    if (currentFilters.dateTo) {
      params.operationDateTo = currentFilters.dateTo
    }

    return params
  }, [pagination.limit])

  // Fetch cases from API
  const loadCases = useCallback(async (currentFilters: CaseFilters, offset: number = 0) => {
    setIsLoading(true)
    setError(null)

    try {
      const apiParams = getApiParams(currentFilters, offset)
      const response = await fetchCases(apiParams)
      
      const mappedCases = response.items.map(mapCaseRowToCase)
      setCases(mappedCases)
      setPagination({
        total: response.pagination.total,
        limit: response.pagination.limit,
        offset: response.pagination.offset,
        hasMore: response.pagination.hasMore,
      })
    } catch (err: any) {
      console.error('Failed to fetch cases:', err)
      const message = err?.response?.data?.message || err.message || 'Failed to load cases'
      setError(message)
      toast({
        variant: "destructive",
        title: "Failed to load cases",
        description: message,
      })
      setCases([])
    } finally {
      setIsLoading(false)
    }
  }, [getApiParams])

  // Load cases when filters change (reset to first page)
  useEffect(() => {
    loadCases(filters, 0)
  }, [filters]) // Only reload when filters change

  // Handle filter changes
  const handleFiltersChange = (newFilters: CaseFilters) => {
    setFilters(newFilters)
    // Reset to first page when filters change
    setPagination(prev => ({ ...prev, offset: 0 }))
  }

  // Handle pagination
  const handlePageChange = (newOffset: number) => {
    loadCases(filters, newOffset)
  }

  // Handle page size change
  const handlePageSizeChange = useCallback((newPageSize: number) => {
    setIsLoading(true)
    setError(null)
    const apiParams = getApiParams(filters, 0)
    apiParams.limit = newPageSize
    
    fetchCases(apiParams).then(response => {
      const mappedCases = response.items.map(mapCaseRowToCase)
      setCases(mappedCases)
      setPagination({
        total: response.pagination.total,
        limit: response.pagination.limit,
        offset: response.pagination.offset,
        hasMore: response.pagination.hasMore,
      })
      setIsLoading(false)
    }).catch(err => {
      console.error('Failed to fetch cases:', err)
      setError(err.response?.data?.message || err.message || 'Failed to load cases')
      setIsLoading(false)
    })
  }, [filters, getApiParams])

  return (
    <ProtectedRoute>
    <div className="p-6">
      <div className="mb-6">
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-7 w-40 rounded-lg" />
            <Skeleton className="h-4 w-64 rounded-full" />
          </div>
        ) : (
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-foreground">All Cases</h1>
              <p className="text-sm text-muted-foreground">
                {`${pagination.total} total cases`}
                {pagination.offset > 0 && ` (showing ${pagination.offset + 1}-${Math.min(pagination.offset + pagination.limit, pagination.total)} of ${pagination.total})`}
              </p>
            </div>
            <Button
              onClick={() => router.push('/tracker/cases/new')}
              className="bg-primary hover:bg-primary/90 text-primary-foreground cursor-pointer flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Add New Case
            </Button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
          {error}
        </div>
      )}

      <CaseFiltersComponent
        filters={filters}
        onFiltersChange={handleFiltersChange}
        specialties={specialties || []}
        regions={regions || []}
        surgeons={surgeons || []}
      />

      <div className="mt-4">
        {isLoading ? (
          <div className="rounded-lg border border-border/50 bg-card/60 p-4 space-y-3">
            {/* Table header skeleton */}
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24 rounded-full" />
              <Skeleton className="h-4 w-32 rounded-full" />
            </div>
            {/* Column headers skeleton */}
            <div className="grid grid-cols-6 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Skeleton key={i} className="h-4 w-full rounded-full" />
              ))}
            </div>
            {/* Rows skeleton */}
            <div className="space-y-2">
              {Array.from({ length: 20 }).map((_, i) => (
                <div key={i} className="grid grid-cols-6 gap-4">
                  {Array.from({ length: 6 }).map((_, j) => (
                    <Skeleton key={j} className="h-5 w-full rounded-md" />
                  ))}
                </div>
              ))}
            </div>
          </div>
        ) : (
          <CasesTable 
            cases={cases} 
            pagination={{
              total: pagination.total,
              offset: pagination.offset,
              limit: pagination.limit,
              hasMore: pagination.hasMore,
              onPageChange: handlePageChange,
              onPageSizeChange: handlePageSizeChange,
            }}
          />
        )}
      </div>
    </div>
    </ProtectedRoute>
  )
}
