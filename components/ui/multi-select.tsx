"use client"

import * as React from "react"
import { Check, ChevronDown, Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import { Input } from "@/components/ui/input"

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
  maxCount?: number
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  className,
  maxCount,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)
  const [searchQuery, setSearchQuery] = React.useState("")

  const filteredOptions = React.useMemo(() => {
    return options.filter((option) =>
      option.toLowerCase().includes(searchQuery.toLowerCase())
    )
  }, [options, searchQuery])

  const handleToggle = (value: string) => {
    const isSelected = selected.includes(value)
    if (!isSelected && maxCount !== undefined && selected.length >= maxCount) {
      return // limit reached
    }
    const newSelected = isSelected
      ? selected.filter((item) => item !== value)
      : [...selected, value]
    onChange(newSelected)
  }

  const handleClear = () => {
    onChange([])
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className={cn("h-8 justify-between text-xs", className)}
        >
          <span className="truncate">
            {selected.length === 0
              ? placeholder
              : maxCount !== undefined
                ? `${selected.length}/${maxCount} selected`
                : `${selected.length} selected`}
          </span>
          <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="p-2 border-b">
          <div className="relative">
            <Search className="absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-8 pl-8 text-xs bg-muted/50"
            />
          </div>
        </div>
        <div className="max-h-64 overflow-auto p-2">
          {filteredOptions.length === 0 ? (
            <div className="py-2 text-center text-xs text-muted-foreground">
              No results found.
            </div>
          ) : (
            filteredOptions.map((option) => {
              const isSelected = selected.includes(option)
              const isDisabled = !isSelected && maxCount !== undefined && selected.length >= maxCount

              return (
                <div
                  key={option}
                  className={cn(
                    "flex items-center space-x-2 rounded-sm px-2 py-1.5",
                    isDisabled ? "opacity-50 cursor-not-allowed" : "hover:bg-accent cursor-pointer"
                  )}
                  onClick={() => !isDisabled && handleToggle(option)}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={isDisabled}
                    onCheckedChange={() => !isDisabled && handleToggle(option)}
                    className="border-slate-400 dark:border-slate-500"
                  />
                  <label className={cn("text-sm flex-1", isDisabled ? "cursor-not-allowed" : "cursor-pointer")}>
                    {option}
                  </label>
                </div>
              )
            })
          )}
        </div>
        {selected.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              size="sm"
              className="h-7 w-full text-xs"
              onClick={handleClear}
            >
              Clear all
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
