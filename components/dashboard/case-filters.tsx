"use client"

import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Search, X } from "lucide-react"
import type { CaseFilters } from "@/types/case"

interface CaseFiltersComponentProps {
  filters: CaseFilters
  onFiltersChange: (filters: CaseFilters) => void
  specialties: string[]
  territories: string[]
  surgeons: string[]
  showSearch?: boolean
}

export function CaseFiltersComponent({
  filters,
  onFiltersChange,
  specialties,
  territories,
  surgeons,
  showSearch = true,
}: CaseFiltersComponentProps) {
  const hasActiveFilters =
    filters.type !== "all" ||
    filters.specialty ||
    filters.tty ||
    filters.ueOrLe !== "all" ||
    filters.userStatus !== "all" ||
    filters.surgeon ||
    filters.search

  const clearFilters = () => {
    onFiltersChange({
      type: "all",
      specialty: undefined,
      tty: undefined,
      ueOrLe: "all",
      userStatus: "all",
      surgeon: undefined,
      search: "",
    })
  }

  return (
    <div className="flex flex-wrap items-center gap-3">
      {showSearch && (
        <div className="relative flex-1 min-w-[200px] max-w-sm">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search cases..."
            value={filters.search || ""}
            onChange={(e) => onFiltersChange({ ...filters, search: e.target.value })}
            className="pl-9 bg-input border-border text-foreground placeholder:text-muted-foreground"
          />
        </div>
      )}

      <Select
        value={filters.type || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, type: value as CaseFilters["type"] })
        }
      >
        <SelectTrigger className="w-[130px] bg-input border-border text-foreground">
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Types</SelectItem>
          <SelectItem value="Primary">Primary</SelectItem>
          <SelectItem value="Revision">Revision</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.specialty || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, specialty: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger className="w-[140px] bg-input border-border text-foreground">
          <SelectValue placeholder="Specialty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Specialties</SelectItem>
          {(specialties || []).map((s) => (
            <SelectItem key={s} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.tty || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, tty: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger className="w-[140px] bg-input border-border text-foreground">
          <SelectValue placeholder="Territory" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Territories</SelectItem>
          {(territories || []).map((t, index) => (
            <SelectItem key={`${t}-${index}`} value={t}>
              {t}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.surgeon || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, surgeon: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger className="w-[140px] bg-input border-border text-foreground">
          <SelectValue placeholder="Surgeon" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Surgeons</SelectItem>
          {(surgeons || []).map((s, index) => (
            <SelectItem key={`${s}-${index}`} value={s}>
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.ueOrLe || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, ueOrLe: value as CaseFilters["ueOrLe"] })
        }
      >
        <SelectTrigger className="w-[120px] bg-input border-border text-foreground">
          <SelectValue placeholder="Extremity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All</SelectItem>
          <SelectItem value="UE">Upper (UE)</SelectItem>
          <SelectItem value="LE">Lower (LE)</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.userStatus || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, userStatus: value as CaseFilters["userStatus"] })
        }
      >
        <SelectTrigger className="w-[120px] bg-input border-border text-foreground">
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all">All Status</SelectItem>
          <SelectItem value="EST">EST</SelectItem>
          <SelectItem value="IN">IN</SelectItem>
          <SelectItem value="VAL">VAL</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
