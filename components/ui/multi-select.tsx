"use client"

import * as React from "react"
import { Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"

interface MultiSelectProps {
  options: string[]
  selected: string[]
  onChange: (values: string[]) => void
  placeholder?: string
  className?: string
}

export function MultiSelect({
  options,
  selected,
  onChange,
  placeholder = "Select...",
  className,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false)

  const handleToggle = (value: string) => {
    const newSelected = selected.includes(value)
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
              : `${selected.length} selected`}
          </span>
          <ChevronDown className="ml-2 h-3 w-3 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0" align="start">
        <div className="max-h-64 overflow-auto p-2">
          {options.map((option) => (
            <div
              key={option}
              className="flex items-center space-x-2 rounded-sm px-2 py-1.5 hover:bg-accent cursor-pointer"
              onClick={() => handleToggle(option)}
            >
              <Checkbox
                checked={selected.includes(option)}
                onCheckedChange={() => handleToggle(option)}
              />
              <label className="text-sm cursor-pointer flex-1">
                {option}
              </label>
            </div>
          ))}
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
