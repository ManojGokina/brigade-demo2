"use client"

import React from "react"
import { useState } from "react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { ArrowUpDown, ChevronLeft, ChevronRight } from "lucide-react"
import type { Case, SortField, SortDirection } from "@/types/case"
import { sortCases } from "@/lib/case-data"
import { CaseDetailDrawer } from "./case-detail-drawer"

const PAGE_SIZE = 25 // Declared PAGE_SIZE variable

interface PaginationProps {
  total: number
  offset: number
  limit: number
  hasMore: boolean
  onPageChange: (offset: number) => void
  onPageSizeChange: (pageSize: number) => void
}

interface CasesTableProps {
  cases: Case[]
  pagination?: PaginationProps
}

const PAGE_SIZE_OPTIONS = [10, 20, 25, 50, 100]

export function CasesTable({ cases, pagination }: CasesTableProps) {
  const [sortField, setSortField] = useState<SortField>("caseNo")
  const [sortDirection, setSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  
  // Use server-side pagination if provided, otherwise use client-side
  const isServerSidePagination = !!pagination

  // Early return if cases is not available
  if (!cases || !Array.isArray(cases)) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  const handlePageSizeChange = (value: string) => {
    const newPageSize = Number(value)
    setPageSize(newPageSize)
    setCurrentPage(0)
    if (isServerSidePagination && pagination) {
      pagination.onPageSizeChange(newPageSize)
    }
  }

  const handleRowClick = (caseData: Case) => {
    setSelectedCase(caseData)
    setDrawerOpen(true)
  }

  const handleDrawerClose = () => {
    setDrawerOpen(false)
  }

  const handleSort = (field: SortField) => {
    if (field === sortField) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
    setCurrentPage(0)
  }

  // For server-side pagination, use cases as-is (already paginated)
  // For client-side, sort and paginate locally
  const sortedCases = isServerSidePagination 
    ? cases 
    : sortCases(cases || [], sortField, sortDirection)
  
  const totalItems = isServerSidePagination 
    ? (pagination?.total || 0)
    : sortedCases.length
  
  const totalPages = isServerSidePagination
    ? Math.ceil(totalItems / (pagination?.limit || pageSize))
    : Math.ceil(sortedCases.length / pageSize)
  
  const currentPageIndex = isServerSidePagination
    ? Math.floor((pagination?.offset || 0) / (pagination?.limit || pageSize))
    : currentPage
  
  const paginatedCases = isServerSidePagination
    ? sortedCases
    : sortedCases.slice(
        currentPage * pageSize,
        (currentPage + 1) * pageSize
      )

  const SortableHeader = ({
    field,
    children,
    className,
  }: {
    field: SortField
    children: React.ReactNode
    className?: string
  }) => (
    <TableHead className={className}>
      <Button
        variant="ghost"
        size="sm"
        onClick={() => handleSort(field)}
        className="-ml-3 h-8 text-xs font-medium text-muted-foreground hover:text-foreground"
      >
        {children}
        <ArrowUpDown className="ml-1 h-3 w-3" />
      </Button>
    </TableHead>
  )

  return (
    <div className="rounded-lg border border-border/50 bg-card">
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow className="border-border/50 hover:bg-transparent">
              <SortableHeader field="caseNo" className="w-[60px]">
                Case
              </SortableHeader>
              <SortableHeader field="opDate" className="w-[90px]">
                Date
              </SortableHeader>
              <SortableHeader field="type" className="w-[90px]">
                Type
              </SortableHeader>
              <SortableHeader field="surgeon" className="w-[80px]">
                Surgeon
              </SortableHeader>
              <SortableHeader field="site" className="w-[80px]">
                Site
              </SortableHeader>
              <SortableHeader field="specialty" className="w-[100px]">
                Specialty
              </SortableHeader>
              <TableHead className="min-w-[200px]">
                <span className="text-xs font-medium text-muted-foreground">Surgery</span>
              </TableHead>
              <SortableHeader field="ueOrLe" className="w-[60px]">
                Ext
              </SortableHeader>
              <SortableHeader field="nervesTreated" className="w-[70px]">
                Nerves
              </SortableHeader>
              <SortableHeader field="userStatus" className="w-[70px]">
                Status
              </SortableHeader>
              <TableHead className="w-[100px]">
                <span className="text-xs font-medium text-muted-foreground">Flags</span>
              </TableHead>
              <SortableHeader field="region" className="w-[100px]">
                Region
              </SortableHeader>
            </TableRow>
          </TableHeader>
          <TableBody>
            {paginatedCases.map((c) => (
              <TableRow
                key={c.caseNo}
                className="cursor-pointer border-border/50 transition-colors hover:bg-accent/50"
                onClick={() => handleRowClick(c)}
              >
                <TableCell className="font-mono text-sm text-foreground">
                  {c.caseNo}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {c.opDate}
                </TableCell>
                <TableCell>
                  <Badge
                    variant={c.type === "Primary" ? "default" : "secondary"}
                    className={
                      c.type === "Primary"
                        ? "bg-chart-1/20 text-chart-1 hover:bg-chart-1/30"
                        : "bg-chart-2/20 text-chart-2 hover:bg-chart-2/30"
                    }
                  >
                    {c.type}
                  </Badge>
                </TableCell>
                <TableCell className="font-medium text-sm text-foreground">
                  {c.surgeon}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {c.site}
                </TableCell>
                <TableCell className="text-sm text-foreground">
                  {c.specialty}
                </TableCell>
                <TableCell className="max-w-[200px] truncate text-sm text-muted-foreground">
                  <span title={c.surgeryPerformed}>{c.surgeryPerformed}</span>
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      c.ueOrLe === "UE"
                        ? "border-chart-3/50 text-chart-3"
                        : "border-chart-4/50 text-chart-4"
                    }
                  >
                    {c.ueOrLe}
                  </Badge>
                </TableCell>
                <TableCell className="text-center font-mono text-sm text-foreground">
                  {c.nervesTreated}
                </TableCell>
                <TableCell>
                  <Badge
                    variant="outline"
                    className={
                      c.userStatus === "EST"
                        ? "border-success/50 text-success"
                        : c.userStatus === "VAL"
                          ? "border-chart-1/50 text-chart-1"
                          : "border-warning/50 text-warning"
                    }
                  >
                    {c.userStatus}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex gap-1">
                    {c.neuromaCase && (
                      <Badge
                        variant="outline"
                        className="border-chart-5/50 text-chart-5 text-xs"
                      >
                        N
                      </Badge>
                    )}
                    {c.caseStudy && (
                      <Badge
                        variant="outline"
                        className="border-chart-1/50 text-chart-1 text-xs"
                      >
                        CS
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-sm text-muted-foreground">
                  {c.region}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

<div className="flex items-center justify-between border-t border-border/50 px-4 py-3">
        <div className="flex items-center gap-4">
          <span className="text-xs text-muted-foreground">
            {isServerSidePagination && pagination
              ? `Showing ${pagination.offset + 1}-${Math.min(pagination.offset + pagination.limit, pagination.total)} of ${pagination.total}`
              : `Showing ${currentPage * pageSize + 1}-${Math.min((currentPage + 1) * pageSize, sortedCases.length)} of ${sortedCases.length}`
            }
          </span>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">Rows per page:</span>
            <Select 
              value={String(isServerSidePagination && pagination ? pagination.limit : pageSize)} 
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="h-8 w-[70px] border-border bg-white text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {PAGE_SIZE_OPTIONS.map((size) => (
                  <SelectItem key={size} value={String(size)}>
                    {size}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isServerSidePagination && pagination) {
                  const newOffset = Math.max(0, pagination.offset - pagination.limit)
                  pagination.onPageChange(newOffset)
                } else {
                  setCurrentPage((p) => Math.max(0, p - 1))
                }
              }}
              disabled={isServerSidePagination 
                ? (pagination?.offset || 0) === 0
                : currentPage === 0
              }
              className="h-8 border-border bg-white text-foreground hover:bg-accent"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <span className="text-xs text-muted-foreground">
              {currentPageIndex + 1} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (isServerSidePagination && pagination) {
                  const newOffset = pagination.offset + pagination.limit
                  if (pagination.hasMore) {
                    pagination.onPageChange(newOffset)
                  }
                } else {
                  setCurrentPage((p) => Math.min(totalPages - 1, p + 1))
                }
              }}
              disabled={isServerSidePagination 
                ? !pagination?.hasMore
                : currentPage >= totalPages - 1
              }
              className="h-8 border-border bg-white text-foreground hover:bg-accent"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>

      {/* Case Detail Drawer */}
      <CaseDetailDrawer
        caseData={selectedCase}
        open={drawerOpen}
        onClose={handleDrawerClose}
      />
    </div>
  )
}
