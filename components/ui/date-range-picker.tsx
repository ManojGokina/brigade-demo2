"use client"

import * as React from "react"
import { Calendar as CalendarIcon, ChevronLeft, ChevronRight, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format, addDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek, addMonths, isSameMonth, isSameDay, isWithinInterval, isBefore, isAfter, startOfDay } from "date-fns"

export interface DateRange {
  from?: string
  to?: string
}

interface DateRangePickerProps {
  value?: DateRange
  onChange?: (range: DateRange) => void
  placeholder?: string
  className?: string
  minDate?: string
  maxDate?: string
}

type Preset = "today" | "yesterday" | "last7days" | "last3months" | "last6months" | "last1year" | "thisMonth" | "custom"

const PRESETS = [
  { id: "today" as Preset, label: "Today" },
  { id: "yesterday" as Preset, label: "Yesterday" },
  { id: "last7days" as Preset, label: "Last 7 Days" },
  { id: "thisMonth" as Preset, label: "This Month" },
  { id: "last3months" as Preset, label: "Last 3 Months" },
  { id: "last6months" as Preset, label: "Last 6 Months" },
  { id: "last1year" as Preset, label: "Last 1 Year" },
  { id: "custom" as Preset, label: "Custom Range" },
]

const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"]

export function DateRangePicker({
  value,
  onChange,
  placeholder = "Pick a date range",
  className,
  minDate,
  maxDate,
}: DateRangePickerProps) {
  const [open, setOpen] = React.useState(false)
  const [selectedPreset, setSelectedPreset] = React.useState<Preset>("custom")
  const [startDate, setStartDate] = React.useState<Date | null>(value?.from ? new Date(value.from) : null)
  const [endDate, setEndDate] = React.useState<Date | null>(value?.to ? new Date(value.to) : null)
  const [hoverDate, setHoverDate] = React.useState<Date | null>(null)
  const [visibleMonthLeft, setVisibleMonthLeft] = React.useState(new Date())
  const [visibleMonthRight, setVisibleMonthRight] = React.useState(addMonths(new Date(), 1))

  // Sync internal state with external value prop
  React.useEffect(() => {
    setStartDate(value?.from ? new Date(value.from) : null)
    setEndDate(value?.to ? new Date(value.to) : null)
    if (!value?.from && !value?.to) {
      setSelectedPreset("custom")
    }
  }, [value?.from, value?.to])

  const formatDate = (date?: Date | null) => {
    if (!date) return null
    try {
      return format(date, "MMM dd, yyyy")
    } catch {
      return null
    }
  }

  const displayText = React.useMemo(() => {
    if (startDate && endDate) {
      return `${formatDate(startDate)} - ${formatDate(endDate)}`
    }
    if (startDate) {
      return `${formatDate(startDate)} - ...`
    }
    return placeholder
  }, [startDate, endDate, placeholder])

  const handlePresetClick = (preset: Preset) => {
    setSelectedPreset(preset)
    const today = startOfDay(new Date())
    
    switch (preset) {
      case "today":
        setStartDate(today)
        setEndDate(today)
        setVisibleMonthLeft(today)
        setVisibleMonthRight(addMonths(today, 1))
        break
      case "yesterday":
        const yesterday = addDays(today, -1)
        setStartDate(yesterday)
        setEndDate(yesterday)
        setVisibleMonthLeft(yesterday)
        setVisibleMonthRight(addMonths(yesterday, 1))
        break
      case "last7days":
        const last7 = addDays(today, -6)
        setStartDate(last7)
        setEndDate(today)
        setVisibleMonthLeft(last7)
        setVisibleMonthRight(addMonths(last7, 1))
        break
      case "last3months":
        const last3months = addMonths(today, -3)
        setStartDate(last3months)
        setEndDate(today)
        setVisibleMonthLeft(last3months)
        setVisibleMonthRight(addMonths(last3months, 1))
        break
      case "last6months":
        const last6months = addMonths(today, -6)
        setStartDate(last6months)
        setEndDate(today)
        setVisibleMonthLeft(last6months)
        setVisibleMonthRight(addMonths(last6months, 1))
        break
      case "last1year":
        const last1year = addMonths(today, -12)
        setStartDate(last1year)
        setEndDate(today)
        setVisibleMonthLeft(last1year)
        setVisibleMonthRight(addMonths(last1year, 1))
        break
      case "thisMonth":
        const monthStart = startOfMonth(today)
        setStartDate(monthStart)
        setEndDate(today)
        setVisibleMonthLeft(monthStart)
        setVisibleMonthRight(addMonths(monthStart, 1))
        break
      case "custom":
        setStartDate(null)
        setEndDate(null)
        break
    }
  }

  const handleDateClick = (date: Date) => {
    if (!startDate || (startDate && endDate)) {
      setStartDate(date)
      setEndDate(null)
      setSelectedPreset("custom")
    } else {
      if (isBefore(date, startDate)) {
        setStartDate(date)
        setEndDate(null)
      } else {
        setEndDate(date)
      }
    }
  }

  const handleApply = () => {
    if (startDate && endDate) {
      onChange?.({
        from: format(startDate, "yyyy-MM-dd"),
        to: format(endDate, "yyyy-MM-dd"),
      })
    } else if (startDate) {
      onChange?.({
        from: format(startDate, "yyyy-MM-dd"),
        to: format(startDate, "yyyy-MM-dd"),
      })
    }
    setOpen(false)
  }

  const handleCancel = () => {
    setStartDate(value?.from ? new Date(value.from) : null)
    setEndDate(value?.to ? new Date(value.to) : null)
    setOpen(false)
  }

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation()
    setStartDate(null)
    setEndDate(null)
    setSelectedPreset("custom")
    onChange?.({ from: undefined, to: undefined })
  }

  const renderCalendar = (month: Date, isLeft: boolean) => {
    const monthStart = startOfMonth(month)
    const monthEnd = endOfMonth(month)
    const calendarStart = startOfWeek(monthStart)
    const calendarEnd = endOfWeek(monthEnd)
    
    const days: Date[] = []
    let day = calendarStart
    while (day <= calendarEnd) {
      days.push(day)
      day = addDays(day, 1)
    }

    const handlePrevMonth = () => {
      if (isLeft) {
        setVisibleMonthLeft(addMonths(visibleMonthLeft, -1))
        setVisibleMonthRight(addMonths(visibleMonthRight, -1))
      }
    }

    const handleNextMonth = () => {
      if (!isLeft) {
        setVisibleMonthLeft(addMonths(visibleMonthLeft, 1))
        setVisibleMonthRight(addMonths(visibleMonthRight, 1))
      }
    }

    return (
      <div className="flex-1">
        <div className="flex items-center justify-between mb-4 px-2">
          {isLeft && (
            <button
              onClick={handlePrevMonth}
              className="p-1 hover:bg-[#f2fbfd] rounded transition-colors cursor-pointer"
            >
              <ChevronLeft className="h-4 w-4 text-[#1f2937]" />
            </button>
          )}
          <div className="flex-1 text-center font-medium text-[#1f2937]">
            {format(month, "MMMM yyyy")}
          </div>
          {!isLeft && (
            <button
              onClick={handleNextMonth}
              className="p-1 hover:bg-[#f2fbfd] rounded transition-colors cursor-pointer"
            >
              <ChevronRight className="h-4 w-4 text-[#1f2937]" />
            </button>
          )}
          {isLeft && <div className="w-6" />}
          {!isLeft && <div className="w-6" />}
        </div>
        
        <div className="grid grid-cols-7 gap-1 mb-2">
          {WEEKDAYS.map((day) => (
            <div key={day} className="text-center text-xs font-medium text-[#9ca3af] py-1">
              {day}
            </div>
          ))}
        </div>
        
        <div className="grid grid-cols-7 gap-1">
          {days.map((day, idx) => {
            const isCurrentMonth = isSameMonth(day, month)
            const isSelected = (startDate && isSameDay(day, startDate)) || (endDate && isSameDay(day, endDate))
            const isInRange = startDate && endDate && isWithinInterval(day, { start: startDate, end: endDate })
            const isHoverRange = startDate && !endDate && hoverDate && isWithinInterval(day, { 
              start: startDate, 
              end: isAfter(hoverDate, startDate) ? hoverDate : startDate 
            })
            
            return (
              <button
                key={idx}
                onClick={() => isCurrentMonth && handleDateClick(day)}
                onMouseEnter={() => setHoverDate(day)}
                onMouseLeave={() => setHoverDate(null)}
                disabled={!isCurrentMonth}
                className={cn(
                  "h-8 w-8 text-sm rounded-lg transition-all duration-150",
                  !isCurrentMonth && "text-[#9ca3af] cursor-default",
                  isCurrentMonth && "text-[#1f2937] hover:bg-[#f2fbfd] cursor-pointer",
                  isSelected && "bg-[#1d99ac] text-white hover:bg-[#177e8f]",
                  isInRange && !isSelected && "bg-[#e6f6f9]",
                  isHoverRange && !isSelected && "bg-[#e6f6f9]"
                )}
              >
                {format(day, "d")}
              </button>
            )
          })}
        </div>
      </div>
    )
  }

  const hasValue = startDate || endDate

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            "justify-start text-left font-normal min-w-[280px] h-9 bg-white cursor-pointer transition-all",
            "text-foreground border-border hover:bg-accent hover:text-accent-foreground",
            !hasValue && "text-muted-foreground",
            hasValue && "ring-2 ring-[#1d99ac] border-[#1d99ac]",
            className
          )}
        >
          <CalendarIcon className="mr-2 h-4 w-4" />
          <span className="text-sm">{displayText}</span>
          {hasValue && (
            <X
              className="ml-auto h-4 w-4 opacity-50 hover:opacity-100"
              onClick={handleClear}
            />
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <div className="flex flex-col md:flex-row bg-white rounded-lg shadow-lg" style={{ width: "750px" }}>
          {/* Left Panel - Presets */}
          <div className="w-[200px] border-r border-[#d9e6ea] p-4">
            <div className="space-y-1">
              {PRESETS.map((preset) => (
                <button
                  key={preset.id}
                  onClick={() => handlePresetClick(preset.id)}
                  className={cn(
                    "w-full text-left px-3 py-2 rounded-lg text-sm transition-all duration-150 cursor-pointer",
                    selectedPreset === preset.id
                      ? "bg-[#1d99ac] text-white"
                      : "text-[#1f2937] hover:bg-[#f2fbfd]"
                  )}
                >
                  {preset.label}
                </button>
              ))}
            </div>
          </div>
          
          {/* Right Panel - Dual Calendar */}
          <div className="flex-1 p-4">
            <div className="flex gap-4 mb-4">
              {renderCalendar(visibleMonthLeft, true)}
              {renderCalendar(visibleMonthRight, false)}
            </div>
            
            {/* Footer */}
            <div className="flex justify-end gap-2 pt-4 border-t border-[#d9e6ea]">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCancel}
                className="cursor-pointer border-[#d9e6ea] text-[#1f2937] hover:bg-[#f2fbfd]"
              >
                Cancel
              </Button>
              <Button
                size="sm"
                onClick={handleApply}
                disabled={!startDate}
                className="cursor-pointer bg-[#1d99ac] hover:bg-[#177e8f] text-white"
              >
                Apply
              </Button>
            </div>
          </div>
        </div>
      </PopoverContent>
    </Popover>
  )
}
