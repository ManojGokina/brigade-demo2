"use client"

import React from "react"
import { useState } from "react"
import { useRouter } from "next/navigation"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { ArrowUpDown, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react"
import type { Case, SortField, SortDirection } from "@/types/case"
import { sortCases } from "@/lib/case-data"
import { CaseDetailDrawer } from "./case-detail-drawer"
import { deleteCase } from "@/lib/cases-api"

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
  sortField?: SortField
  sortDirection?: SortDirection
  onSortChange?: (field: SortField, direction: SortDirection) => void
  onCaseDeleted?: () => void
}

const PAGE_SIZE_OPTIONS = [10, 20, 25, 50, 100]

export function CasesTable({ cases, pagination, sortField: externalSortField, sortDirection: externalSortDirection, onSortChange, onCaseDeleted }: CasesTableProps) {
  const router = useRouter()
  const [localSortField, setLocalSortField] = useState<SortField | null>(null)
  const [localSortDirection, setLocalSortDirection] = useState<SortDirection>("asc")
  const [currentPage, setCurrentPage] = useState(0)
  const [pageSize, setPageSize] = useState(25)
  const [selectedCase, setSelectedCase] = useState<Case | null>(null)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [deletingId, setDeletingId] = useState<number | null>(null)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [deleteCaseTarget, setDeleteCaseTarget] = useState<Case | null>(null)
  const headerRef = React.useRef<HTMLDivElement>(null)
  const bodyRef = React.useRef<HTMLDivElement>(null)
  
  // Use server-side pagination if provided, otherwise use client-side
  const isServerSidePagination = !!pagination
  const isServerSideSorting = !!onSortChange
  
  // Use external sort state if provided, otherwise use local state
  const sortField = isServerSideSorting ? externalSortField : localSortField
  const sortDirection = isServerSideSorting ? (externalSortDirection || "asc") : localSortDirection

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

  const handleEdit = (e: React.MouseEvent, caseData: Case) => {
    e.stopPropagation()
    router.push(`/tracker/cases/edit/${caseData.caseNo}`)
  }

  const handleDelete = (e: React.MouseEvent, caseData: Case) => {
    e.stopPropagation()
    setDeleteCaseTarget(caseData)
    setIsDeleteDialogOpen(true)
  }

  const confirmDeleteCase = async () => {
    if (!deleteCaseTarget) return
    setDeletingId(deleteCaseTarget.caseNo)
    try {
      await deleteCase(String(deleteCaseTarget.caseNo))
      onCaseDeleted?.()
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete case')
    } finally {
      setDeletingId(null)
      setIsDeleteDialogOpen(false)
      setDeleteCaseTarget(null)
    }
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.currentTarget
    if (target === bodyRef.current && headerRef.current) {
      headerRef.current.scrollLeft = target.scrollLeft
    }
  }

  const handleSort = (field: SortField) => {
    let newDirection: SortDirection | null = null
    let newField: SortField | null = null
    
    if (field === sortField) {
      // Same field: cycle through asc → desc → none
      if (sortDirection === "asc") {
        newDirection = "desc"
        newField = field
      } else if (sortDirection === "desc") {
        // Third click: clear sorting
        newDirection = null
        newField = null
      }
    } else {
      // Different field: start with asc
      newDirection = "asc"
      newField = field
    }
    
    if (isServerSideSorting && onSortChange) {
      // Server-side sorting
      if (newField && newDirection) {
        onSortChange(newField, newDirection)
      } else {
        // Clear sorting by setting to default
        onSortChange("caseNo", "asc")
      }
    } else {
      // Client-side sorting
      setLocalSortField(newField || "caseNo")
      setLocalSortDirection(newDirection || "asc")
    }
    setCurrentPage(0)
  }

  // For server-side pagination/sorting, use cases as-is (already sorted and paginated)
  // For client-side, sort and paginate locally
  const sortedCases = (isServerSidePagination || isServerSideSorting)
    ? cases 
    : (sortField ? sortCases(cases || [], sortField, sortDirection) : cases)
  
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
  }) => {
    const isActive = sortField === field
    const showIcon = field === "caseNo" || field === "nervesTreated"
    
    return (
      <TableHead className={className}>
        {showIcon ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => handleSort(field)}
            className={`-ml-3 h-8 text-xs font-medium hover:text-foreground ${
              isActive ? "text-foreground bg-accent" : "text-muted-foreground"
            }`}
          >
            {children}
            <ArrowUpDown className="ml-1 h-3 w-3" />
          </Button>
        ) : (
          <span className="text-xs font-medium text-muted-foreground">{children}</span>
        )}
      </TableHead>
    )
  }

  return (
    <div className="rounded-lg border border-border/50 bg-card flex flex-col h-full">
      <div className="flex-1 overflow-auto" ref={bodyRef} onScroll={handleScroll}>
        <table className="w-full border-collapse" style={{ minWidth: '1800px' }}>
          <thead className="sticky top-0 bg-card z-10 border-b border-border/50">
            <tr className="border-border/50">
              <th className="sticky left-0 w-[80px] px-3 py-2 text-left bg-card border-r border-border/50 z-20">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("caseNo")}
                  className={`-ml-3 h-8 text-xs font-bold hover:text-foreground ${
                    sortField === "caseNo" ? "text-foreground bg-accent" : "text-muted-foreground"
                  }`}
                >
                  Case
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </th>
              <th className="sticky left-[80px] w-[120px] px-3 py-2 text-left bg-card border-r border-border/50 z-20">
                <span className="text-xs font-bold text-muted-foreground">Date</span>
              </th>
              <th className="w-[120px] px-3 py-2 text-left border-r border-border/50">
                <span className="text-xs font-bold text-muted-foreground">Type</span>
              </th>
              <th className="w-[150px] px-3 py-2 text-left border-r border-border/50">
                <span className="text-xs font-bold text-muted-foreground">Surgeon</span>
              </th>
              <th className="w-[150px] px-3 py-2 text-left border-r border-border/50">
                <span className="text-xs font-bold text-muted-foreground">Site</span>
              </th>
              <th className="w-[150px] px-3 py-2 text-left border-r border-border/50">
                <span className="text-xs font-bold text-muted-foreground">Specialty</span>
              </th>
              <th className="w-[300px] px-3 py-2 text-left border-r border-border/50">
                <span className="text-xs font-bold text-muted-foreground">Surgery</span>
              </th>
              <th className="w-[100px] px-3 py-2 text-left border-r border-border/50">
                <span className="text-xs font-bold text-muted-foreground">Ext</span>
              </th>
              <th className="w-[100px] px-3 py-2 text-left border-r border-border/50">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleSort("nervesTreated")}
                  className={`-ml-3 h-8 text-xs font-bold hover:text-foreground ${
                    sortField === "nervesTreated" ? "text-foreground bg-accent" : "text-muted-foreground"
                  }`}
                >
                  Nerves
                  <ArrowUpDown className="ml-1 h-3 w-3" />
                </Button>
              </th>
              <th className="w-[100px] px-3 py-2 text-left border-r border-border/50">
                <span className="text-xs font-bold text-muted-foreground">Status</span>
              </th>
              <th className="w-[120px] px-3 py-2 text-left border-r border-border/50">
                <span className="text-xs font-bold text-muted-foreground">Flags</span>
              </th>
              <th className="w-[150px] px-3 py-2 text-left border-r border-border/50">
                <span className="text-xs font-bold text-muted-foreground">Region</span>
              </th>
              <th className="sticky right-0 w-[120px] px-3 py-2 text-left bg-card border-l border-border/50">
                <span className="text-xs font-bold text-muted-foreground">Actions</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {paginatedCases.map((c) => (
              <tr
                key={c.caseNo}
                className="cursor-pointer border-b border-border/50 transition-colors hover:bg-accent/50"
                onClick={() => handleRowClick(c)}
              >
                <td className={`sticky left-0 px-3 py-2 font-mono text-sm text-foreground bg-card border-r border-border/50 z-10 ${
                  sortField === "caseNo" ? "bg-accent/30" : ""
                }`}>
                  {c.caseNo}
                </td>
                <td className="sticky left-[80px] px-3 py-2 text-sm text-muted-foreground bg-card border-r border-border/50 z-10">
                  {c.opDate}
                </td>
                <td className="px-3 py-2 border-r border-border/50">
                  <Badge
                    variant={c.tbd === "Primary" ? "default" : "secondary"}
                    className={
                      c.tbd === "Primary"
                        ? "bg-chart-1/20 text-chart-1 hover:bg-chart-1/30"
                        : "bg-chart-2/20 text-chart-2 hover:bg-chart-2/30"
                    }
                  >
                    {c.tbd}
                  </Badge>
                </td>
                <td className="px-3 py-2 font-medium text-sm text-foreground border-r border-border/50">
                  {c.surgeon}
                </td>
                <td className="px-3 py-2 text-sm text-muted-foreground border-r border-border/50">
                  {c.site}
                </td>
                <td className="px-3 py-2 text-sm text-foreground border-r border-border/50">
                  {c.specialty}
                </td>
                <td className="px-3 py-2 text-sm text-muted-foreground border-r border-border/50">
                  <div className="break-words line-clamp-3" title={c.surgeryPerformed}>
                    {c.surgeryPerformed}
                  </div>
                </td>
                <td className="px-3 py-2 border-r border-border/50">
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
                </td>
                <td className={`px-3 py-2 text-center font-mono text-sm text-foreground border-r border-border/50 ${
                  sortField === "nervesTreated" ? "bg-accent/30" : ""
                }`}>
                  {c.nervesTreated}
                </td>
                <td className="px-3 py-2 border-r border-border/50">
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
                </td>
                <td className="px-3 py-2 border-r border-border/50">
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
                </td>
                <td className="px-3 py-2 text-sm text-muted-foreground border-r border-border/50">
                  {c.region}
                </td>
                <td className="sticky right-0 px-3 py-2 bg-card border-l border-border/50">
                  <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleEdit(e, c)}
                      className="h-7 w-7 p-0 hover:bg-blue-100 hover:text-blue-600"
                      title="Edit case"
                    >
                      <Edit className="h-3.5 w-3.5" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={(e) => handleDelete(e, c)}
                      disabled={deletingId === c.caseNo}
                      className="h-7 w-7 p-0 hover:bg-red-100 hover:text-red-600"
                      title="Delete case"
                    >
                      {deletingId === c.caseNo ? (
                        <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                      ) : (
                        <Trash2 className="h-3.5 w-3.5" />
                      )}
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Fixed Footer */}
      <div className="flex items-center justify-between border-t border-border/50 px-4 py-3 bg-card">
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

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete this case?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete Case #{deleteCaseTarget?.caseNo}? This action will mark the case as inactive.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="cursor-pointer">Cancel</AlertDialogCancel>
            <AlertDialogAction
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90 cursor-pointer"
              onClick={confirmDeleteCase}
              disabled={deletingId !== null}
            >
              {deletingId !== null ? "Deleting..." : "Yes, delete case"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
