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

const SURGEON_LIST = [
  "Adams", "Barron", "Benson", "Bozenka", "Brancheau", "Braver", "Brown", "Buczek", "Buczek Jr",
  "C. Hoover", "Catalano", "Chang", "Chim", "Coleman", "Coye", "D. Wilson", "Dauphinee",
  "DeGrace", "Desai", "Diamond", "Dowlatshahi", "Drury", "Eberlin", "Eward", "Fallucco",
  "Felder", "Gatta", "Graves", "Hoover", "Huntsman", "Iyer", "Jack", "Jain", "Janowak",
  "Kachooie", "Klein", "Knapp", "Kobraei", "Kolovich", "Leversedge", "Li", "Lin", "Liu",
  "Lorenzana", "Minh Nguyen", "Miranda", "Mithani", "Monin", "Murdock", "Nguyen", "Parker",
  "Patel", "Quinnan", "Radacanu", "Reeves", "Rekant", "Rodrigues", "Rogers", "Saltzman",
  "Shane", "Sharma", "Sibley", "Simmons", "Smith", "Styron", "Szipala", "Thomjan",
  "Victor Greco", "Visgauss", "Wilson", "Wilton", "Yang", "Yurkanin", "Zuniga",
  "D. Bickley", "Monir", "Neidermeyer", "Park"
]

const SITE_LIST = [
  "Advent", "Advent  Apopka", "Advent East", "Advent Health", "Apopka", "ASC Alamo Heights",
  "Atlanticare", "Austin ASC", "Bayfront", "Bear Creek", "Beaumont", "Brook Army Medical",
  "BS&W Temple", "BSW Surgicare ASC", "Carrolton Regional", "Center for Outpatient",
  "Center for Special Surgery", "Center One ASC", "Cincinnati", "Cleveland Clinic", "Deaconess",
  "Deridder", "Duke ASC", "Duke Main", "Hackensack ASC", "Hankensack Surgery Center",
  "Holy Cross", "Horizons West", "Hunt Regional", "Innovation Tower", "Inspira Vineland",
  "IPASC", "Jefferson", "Jewett Orthopedic", "Jewettt Orthopedic", "King of Prussia",
  "KPRC", "KPSJC", "Lehigh Valley", "LSU", "Memorial Village ASC", "MGH", "Mt Sinai",
  "Mullica Hill", "Northside", "Optim", "Orlando Health", "ORMC", "Overlook Medical",
  "Palms of Pasadena", "PENN", "Riverside", "St. Anthonys", "St. Lukes", "St. Marys",
  "Stanford", "Sturdy", "Temple VA", "Toledo", "Townsend", "Univ of Colorado",
  "University Hospital", "UT Southwestern", "Valley Regional", "Wake Med Cary", "WESC",
  "Wood County"
]

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
    filters.ueOrLe !== "all" ||
    filters.userStatus !== "all" ||
    filters.search ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.surgeon ||
    filters.site ||
    filters.specialty ||
    filters.region

  const clearFilters = () => {
    onFiltersChange({
      type: "all",
      ueOrLe: "all",
      userStatus: "all",
      search: "",
      dateFrom: undefined,
      dateTo: undefined,
      surgeon: undefined,
      site: undefined,
      specialty: undefined,
      region: undefined,
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
        placeholder="Select Date Range"
      />

      <Select
        value={filters.surgeon || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, surgeon: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger className={`w-[150px] bg-white border-border text-foreground cursor-pointer ${
          filters.surgeon ? "ring-2 ring-primary border-primary" : ""
        }`}>
          <SelectValue placeholder="Surgeon" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="cursor-pointer">All Surgeons</SelectItem>
          {SURGEON_LIST.map((surgeon) => (
            <SelectItem key={surgeon} value={surgeon} className="cursor-pointer">{surgeon}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Select
        value={filters.site || "all"}
        onValueChange={(value) =>
          onFiltersChange({ ...filters, site: value === "all" ? undefined : value })
        }
      >
        <SelectTrigger className={`w-[130px] bg-white border-border text-foreground cursor-pointer ${
          filters.site ? "ring-2 ring-primary border-primary" : ""
        }`}>
          <SelectValue placeholder="Site" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="all" className="cursor-pointer">All Sites</SelectItem>
          {SITE_LIST.map((site) => (
            <SelectItem key={site} value={site} className="cursor-pointer">{site}</SelectItem>
          ))}
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
          {specialties.map((specialty) => (
            <SelectItem key={specialty} value={specialty} className="cursor-pointer">{specialty}</SelectItem>
          ))}
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
