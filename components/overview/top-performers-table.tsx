"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Badge } from "@/components/ui/badge"
import { Download, Info } from "lucide-react"
import * as XLSX from "xlsx-js-style"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

interface TopPerformerData {
  rank: number
  surgeon: string
  totalCases: number
  neuromaCases: number
  region: string
  specialty: string
  productivity: number
}

export function TopPerformersTable({ 
  data, 
  regions, 
  specialties, 
  viewType, 
  regionFilter, 
  specialtyFilter, 
  onViewTypeChange, 
  onRegionChange, 
  onSpecialtyChange 
}: { 
  data: TopPerformerData[], 
  regions: string[], 
  specialties: string[], 
  viewType: string, 
  regionFilter: string[], 
  specialtyFilter: string[], 
  onViewTypeChange: (value: string) => void, 
  onRegionChange: (value: string[]) => void, 
  onSpecialtyChange: (value: string[]) => void 
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const getTitle = () => {
    if (viewType === "caseLoad") return "Top Performers by Case Load"
    if (viewType === "neuroma") return "Top Performers by Neuroma Cases"
    return "Top Performers by Monthly Productivity"
  }

  const getSortedData = () => {
    if (viewType === "caseLoad") {
      return [...data].sort((a, b) => b.totalCases - a.totalCases)
    } else if (viewType === "neuroma") {
      return [...data].sort((a, b) => b.neuromaCases - a.neuromaCases)
    }
    return [...data].sort((a, b) => b.productivity - a.productivity)
  }

  const sortedData = getSortedData()
  const top5Data = sortedData.slice(0, 5)
  const next5Data = sortedData.slice(5, 10)

  const getValueForView = (item: TopPerformerData) => {
    if (viewType === "caseLoad") return item.totalCases
    if (viewType === "neuroma") return item.neuromaCases
    return item.productivity.toFixed(1)
  }

  const getColumnHeader = () => {
    if (viewType === "caseLoad") return "Total Cases"
    if (viewType === "neuroma") return "Neuroma Cases"
    return "Productivity"
  }

  const exportToExcel = () => {
    const ws_data = [
      ["Top Performers Report"],
      [],
      ["View Type:", viewType === "caseLoad" ? "Case Load" : viewType === "neuroma" ? "Neuroma Cases" : "Monthly Productivity"],
      ["Region Filter:", regionFilter.length === 0 ? "All Regions" : regionFilter.join(", ")],
      ["Specialty Filter:", specialtyFilter.length === 0 ? "All Specialties" : specialtyFilter.join(", ")],
      ["Total Records:", sortedData.length.toString()],
      [],
      ["Rank", "Surgeon", "Total Cases", "Neuroma Cases", "Region", "Specialty", "Productivity"]
    ]

    sortedData.forEach((item, index) => {
      ws_data.push([
        (index + 1).toString(),
        item.surgeon,
        item.totalCases.toString(),
        item.neuromaCases.toString(),
        item.region,
        item.specialty,
        item.productivity.toFixed(1)
      ])
    })

    const ws = XLSX.utils.aoa_to_sheet(ws_data)

    // Merge title cell
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 6 } }]

    // Style title
    ws["A1"].s = {
      font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1d99ac" } },
      alignment: { horizontal: "center", vertical: "center" }
    }

    // Style filter info
    const filterStyle = {
      font: { bold: true, sz: 11 },
      fill: { fgColor: { rgb: "E3F2FD" } }
    }
    ;["A3", "A4", "A5", "A6"].forEach(cell => {
      if (ws[cell]) ws[cell].s = filterStyle
    })

    // Style headers
    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4A90E2" } },
      alignment: { horizontal: "center", vertical: "center" }
    }
    ;["A8", "B8", "C8", "D8", "E8", "F8", "G8"].forEach(cell => {
      if (ws[cell]) ws[cell].s = headerStyle
    })

    // Column widths
    ws["!cols"] = [
      { wch: 8 },
      { wch: 25 },
      { wch: 15 },
      { wch: 18 },
      { wch: 20 },
      { wch: 20 },
      { wch: 15 }
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Top Performers")
    XLSX.writeFile(wb, `Top_Performers_${viewType}_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <>
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base font-semibold">{getTitle()}</CardTitle>
            <div className="flex gap-2">
              <Select value={viewType} onValueChange={onViewTypeChange}>
                <SelectTrigger className="w-[140px] h-8 text-xs border-gray-300 focus:border-gray-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="caseLoad">Case Load</SelectItem>
                  <SelectItem value="neuroma">Neuroma Cases</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                </SelectContent>
              </Select>
              {(
                <>
                  <MultiSelect
                    options={regions}
                    selected={regionFilter}
                    onChange={onRegionChange}
                    placeholder="All Regions"
                    className="w-[140px] border-gray-300 focus:border-gray-500"
                  />
                  <MultiSelect
                    options={specialties}
                    selected={specialtyFilter}
                    onChange={onSpecialtyChange}
                    placeholder="All Specialties"
                    className="w-[140px] border-gray-300 focus:border-gray-500"
                  />
                </>
              )}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setDrawerOpen(true)}
                className="h-8 text-xs border-input"
              >
                Show All ({sortedData.length})
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-semibold bg-muted">Rank</th>
                    <th className="text-left py-2 px-3 font-semibold bg-muted">Surgeon</th>
                    <th className="text-right py-2 px-3 font-semibold bg-muted">{getColumnHeader()}</th>
                    <th className="text-left py-2 px-3 font-semibold bg-muted">Region</th>
                    <th className="text-left py-2 px-3 font-semibold bg-muted">Specialty</th>
                  </tr>
                </thead>
                <tbody>
                  {top5Data.map((item, index) => (
                    <tr 
                      key={index} 
                      className={`border-b border-border/50 hover:bg-muted/50 transition-colors ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-50/30 to-amber-50/30' : ''
                      }`}
                    >
                      <td className="py-2 px-3">
                        <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-800' :
                          index === 2 ? 'bg-orange-300 text-orange-900' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium">{item.surgeon}</td>
                      <td className="py-2 px-3 text-right">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
                          {getValueForView(item)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{item.region}</td>
                      <td className="py-2 px-3 text-muted-foreground">{item.specialty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left py-2 px-3 font-semibold bg-muted">Rank</th>
                    <th className="text-left py-2 px-3 font-semibold bg-muted">Surgeon</th>
                    <th className="text-right py-2 px-3 font-semibold bg-muted">{getColumnHeader()}</th>
                    <th className="text-left py-2 px-3 font-semibold bg-muted">Region</th>
                    <th className="text-left py-2 px-3 font-semibold bg-muted">Specialty</th>
                  </tr>
                </thead>
                <tbody>
                  {next5Data.map((item, index) => (
                    <tr 
                      key={index} 
                      className="border-b border-border/50 hover:bg-muted/50 transition-colors"
                    >
                      <td className="py-2 px-3">
                        <span className="inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold bg-blue-100 text-blue-700">
                          {index + 6}
                        </span>
                      </td>
                      <td className="py-2 px-3 font-medium">{item.surgeon}</td>
                      <td className="py-2 px-3 text-right">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
                          {getValueForView(item)}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-muted-foreground">{item.region}</td>
                      <td className="py-2 px-3 text-muted-foreground">{item.specialty}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </CardContent>
      </Card>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto bg-white p-0">
          <SheetHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-lg font-semibold">{getTitle()} - All Data</SheetTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  This data shows surgeon performance metrics including total cases, neuroma cases, and monthly productivity (cases per month).
                </p>
              </div>
            </div>
          </SheetHeader>
          <div className="px-6 py-6 bg-white">
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="font-semibold">View:</span>
                <span>{viewType === "caseLoad" ? "Case Load" : viewType === "neuroma" ? "Neuroma" : "Productivity"}</span>
              </div>
              {regionFilter.length > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-medium">
                  <span className="font-semibold">Region:</span>
                  <span>{regionFilter.join(", ")}</span>
                </div>
              )}
              {specialtyFilter.length > 0 && (
                <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium">
                  <span className="font-semibold">Specialty:</span>
                  <span>{specialtyFilter.join(", ")}</span>
                </div>
              )}
              <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="font-semibold">Total Records:</span>
                <span>{sortedData.length}</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1.5 bg-gray-100 text-gray-800 px-3 py-1.5 rounded-full text-xs font-medium cursor-help">
                      <Info className="h-3 w-3" />
                      <span>How it's calculated</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs z-[110]">
                    <div className="space-y-2 text-xs">
                      <p><strong>Total Cases:</strong> Count of all cases for the surgeon</p>
                      <p><strong>Neuroma Cases:</strong> Count of cases where isNeuromaCase = true</p>
                      <p><strong>Productivity:</strong> Total cases ÷ Number of unique months with cases</p>
                      <p className="text-muted-foreground italic">Example: 30 cases over 6 months = 5.0 productivity</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
            <div className="mb-3 flex justify-end">
              <Button onClick={exportToExcel} size="sm" variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export Excel
              </Button>
            </div>
            <div className="border rounded-lg overflow-hidden shadow-lg bg-white">
              <table className="w-full text-sm bg-white">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">Rank</th>
                    <th className="text-left p-3 font-medium">Surgeon</th>
                    <th className="text-right p-3 font-medium">Total Cases</th>
                    <th className="text-right p-3 font-medium">Neuroma Cases</th>
                    <th className="text-left p-3 font-medium">Region</th>
                    <th className="text-left p-3 font-medium">Specialty</th>
                    <th className="text-right p-3 font-medium">Productivity</th>
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {sortedData.map((item, index) => (
                    <tr 
                      key={index} 
                      className={`border-t hover:bg-muted/50 transition-colors ${
                        index < 3 ? 'bg-gradient-to-r from-yellow-50/40 to-amber-50/40' : 'bg-white'
                      }`}
                    >
                      <td className="p-3">
                        <span className={`inline-flex items-center justify-center w-8 h-8 rounded-full text-xs font-bold ${
                          index === 0 ? 'bg-yellow-400 text-yellow-900' :
                          index === 1 ? 'bg-gray-300 text-gray-800' :
                          index === 2 ? 'bg-orange-300 text-orange-900' :
                          'bg-blue-100 text-blue-700'
                        }`}>
                          {index + 1}
                        </span>
                      </td>
                      <td className="p-3 font-medium text-gray-900">{item.surgeon}</td>
                      <td className="p-3 text-right font-medium">{item.totalCases}</td>
                      <td className="p-3 text-right font-medium">{item.neuromaCases}</td>
                      <td className="p-3 text-muted-foreground">{item.region}</td>
                      <td className="p-3 text-muted-foreground">{item.specialty}</td>
                      <td className="p-3 text-right font-medium">{item.productivity.toFixed(1)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
