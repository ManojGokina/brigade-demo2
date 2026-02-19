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
import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { CaseFilters } from "@/types/case"

interface CaseFiltersComponentProps {
  filters: CaseFilters
  onFiltersChange: (filters: CaseFilters) => void
  specialties: string[]
  regions: string[]
  surgeons: string[]
  showSearch?: boolean
}

export function CaseFiltersComponent({
  filters,
  onFiltersChange,
  specialties,
  regions,
  surgeons,
  showSearch = true,
}: CaseFiltersComponentProps) {
  const hasActiveFilters =
    filters.type !== "all" ||
    filters.specialty ||
    filters.region ||
    filters.ueOrLe !== "all" ||
    filters.userStatus !== "all" ||
    filters.surgeon ||
    filters.search ||
    filters.dateFrom ||
    filters.dateTo

  const clearFilters = () => {
    onFiltersChange({
      type: "all",
      specialty: undefined,
      region: undefined,
      ueOrLe: "all",
      userStatus: "all",
      surgeon: undefined,
      search: "",
      dateFrom: undefined,
      dateTo: undefined,
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
            className="pl-9 bg-white border-border text-foreground placeholder:text-muted-foreground cursor-pointer"
          />
        </div>
      )}

      <DateRangePicker
        value={{ from: filters.dateFrom, to: filters.dateTo }}
        onChange={(range) => onFiltersChange({ ...filters, dateFrom: range.from, dateTo: range.to })}
        placeholder="Select date range"
      />

      <Select
        value={filters.surgeon || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, surgeon: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger className={`w-[140px] bg-white border-border text-foreground cursor-pointer ${
          filters.surgeon ? "ring-2 ring-primary border-primary" : ""
        }`}>
          <SelectValue placeholder="Surgeon" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="cursor-pointer">All Surgeons</SelectItem>
          {(surgeons || []).map((s, index) => (
            <SelectItem key={`${s}-${index}`} value={s} className="cursor-pointer">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.type || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, type: value as CaseFilters["type"] })
        }
      >
        <SelectTrigger className={`w-[130px] bg-white border-border text-foreground cursor-pointer ${
          filters.type !== "all" ? "ring-2 ring-primary border-primary" : ""
        }`}>
          <SelectValue placeholder="Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="cursor-pointer">All Types</SelectItem>
          <SelectItem value="Primary" className="cursor-pointer">Primary</SelectItem>
          <SelectItem value="Revision" className="cursor-pointer">Revision</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.specialty || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, specialty: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger className={`w-[140px] bg-white border-border text-foreground cursor-pointer ${
          filters.specialty ? "ring-2 ring-primary border-primary" : ""
        }`}>
          <SelectValue placeholder="Specialty" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="cursor-pointer">All Specialties</SelectItem>
          {(specialties || []).map((s) => (
            <SelectItem key={s} value={s} className="cursor-pointer">
              {s}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.region || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, region: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger className={`w-[140px] bg-white border-border text-foreground cursor-pointer ${
          filters.region ? "ring-2 ring-primary border-primary" : ""
        }`}>
          <SelectValue placeholder="Region" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="cursor-pointer">All Regions</SelectItem>
          {(regions || []).map((r, index) => (
            <SelectItem key={`${r}-${index}`} value={r} className="cursor-pointer">
              {r}
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
        <SelectTrigger className={`w-[120px] bg-white border-border text-foreground cursor-pointer ${
          filters.ueOrLe !== "all" ? "ring-2 ring-primary border-primary" : ""
        }`}>
          <SelectValue placeholder="Extremity" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="cursor-pointer">All</SelectItem>
          <SelectItem value="UE" className="cursor-pointer">Upper (UE)</SelectItem>
          <SelectItem value="LE" className="cursor-pointer">Lower (LE)</SelectItem>
        </SelectContent>
      </Select>

      <Select
        value={filters.userStatus || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, userStatus: value as CaseFilters["userStatus"] })
        }
      >
        <SelectTrigger className={`w-[120px] bg-white border-border text-foreground cursor-pointer ${
          filters.userStatus !== "all" ? "ring-2 ring-primary border-primary" : ""
        }`}>
          <SelectValue placeholder="Status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="cursor-pointer">All Status</SelectItem>
          <SelectItem value="EST" className="cursor-pointer">EST</SelectItem>
          <SelectItem value="IN" className="cursor-pointer">IN</SelectItem>
          <SelectItem value="VAL" className="cursor-pointer">VAL</SelectItem>
        </SelectContent>
      </Select>

      {hasActiveFilters && (
        <Button
          variant="ghost"
          size="sm"
          onClick={clearFilters}
          className="text-white bg-primary hover:bg-primary/90 hover:text-white cursor-pointer"
        >
          <X className="mr-1 h-4 w-4" />
          Clear
        </Button>
      )}
    </div>
  )
}
