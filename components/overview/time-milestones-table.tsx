"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Download, Info, Maximize2, X } from "lucide-react"
import * as XLSX from "xlsx-js-style"
import { MultiSelect } from "@/components/ui/multi-select"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function TimeMilestonesTable({ 
  data, 
  surgeons, 
  years,
  surgeonFilter, 
  selectedYears,
  onSurgeonChange,
  onYearsChange
}: { 
  data: any[], 
  surgeons: string[],
  years: string[],
  surgeonFilter: string,
  selectedYears: string[],
  onSurgeonChange: (value: string) => void,
  onYearsChange: (values: string[]) => void
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)
  const top10Data = data.slice(0, 10)

  const exportToExcel = () => {
    const surgeonLabel = surgeonFilter === "all" ? "All Surgeons" : surgeonFilter
    
    const wb = XLSX.utils.book_new()
    const wsData: any[][] = [
      ["Time Milestones Report", "", ""],
      ["", "", ""],
      ["Surgeon", surgeonLabel, ""],
      ["Export Date", new Date().toLocaleString(), ""],
      ["", "", ""],
      ["Surgeon", "Months to 2 Cases/Mo", "Months to 2 Cases/Mo (3 Consecutive)"],
      ...data.map((row) => [row.surgeon, row.monthsTo2Cases !== null ? row.monthsTo2Cases : '-', row.monthsTo3Consecutive !== null ? row.monthsTo3Consecutive : '-']),
    ]
    
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws['!cols'] = [{ wch: 25 }, { wch: 25 }, { wch: 30 }]
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }]
    
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
        if (!ws[cellAddress]) continue
        
        if (R === 0) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "1d99ac" } },
            alignment: { horizontal: "center", vertical: "center" }
          }
        } else if (R >= 2 && R <= 3) {
          ws[cellAddress].s = {
            font: { bold: C === 0, sz: 11 },
            fill: { fgColor: { rgb: "E3F2FD" } },
            alignment: { vertical: "center" }
          }
        } else if (R === 5) {
          ws[cellAddress].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "1d99ac" } },
            alignment: { horizontal: "center", vertical: "center" }
          }
        }
      }
    }
    
    XLSX.utils.book_append_sheet(wb, ws, "Time Milestones")
    XLSX.writeFile(wb, `time-milestones-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <>
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Time Milestones</CardTitle>
            <p className="text-xs text-muted-foreground">Monthly productivity milestones by surgeon</p>
          </div>
          <div className="flex gap-2 items-center">
            <Select value={surgeonFilter} onValueChange={onSurgeonChange}>
              <SelectTrigger className="w-[150px] h-8 text-xs border-gray-300 focus:border-gray-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Surgeons</SelectItem>
                {surgeons.map((surgeon) => (
                  <SelectItem key={surgeon} value={surgeon}>{surgeon}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <table className="w-full text-xs">
            <thead className="bg-muted">
              <tr>
                <th className="text-left p-1.5 font-medium">#</th>
                <th className="text-left p-1.5 font-medium">Surgeon</th>
                <th className="text-center p-1.5 font-medium">Mo to 2/Mo</th>
                <th className="text-center p-1.5 font-medium">Mo to 3 Consec</th>
              </tr>
            </thead>
            <tbody>
              {top10Data.length > 0 ? (
                top10Data.map((row, index) => (
                  <tr key={index} className="border-t hover:bg-muted/50">
                    <td className="p-1.5 text-muted-foreground">{index + 1}</td>
                    <td className="p-1.5 font-medium">{row.surgeon}</td>
                    <td className="p-1.5 text-center">
                      <span className="inline-block px-1.5 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-semibold">
                        {row.monthsTo2Cases !== null ? row.monthsTo2Cases : '-'}
                      </span>
                    </td>
                    <td className="p-1.5 text-center">
                      <span className="inline-block px-1.5 py-0.5 bg-green-100 text-green-800 rounded text-xs font-semibold">
                        {row.monthsTo3Consecutive !== null ? row.monthsTo3Consecutive : '-'}
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={4} className="p-4 text-center text-muted-foreground text-xs">
                    No data available for selected filters
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          {data.length > 10 && (
            <div className="bg-muted/50 px-2 py-1.5 text-xs text-center border-t">
              Showing 10 of {data.length} surgeons •{' '}
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="text-primary hover:underline font-medium"
              >
                View all {data.length}
              </button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>

    {isDrawerOpen && (
      <>
        <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setIsDrawerOpen(false)} />
        <div className="fixed right-0 top-0 h-full w-[90vw] sm:w-[700px] bg-white dark:bg-gray-900 shadow-2xl z-[101] overflow-y-auto animate-in slide-in-from-right duration-300">
          <div className="sticky top-0 bg-white dark:bg-gray-900 border-b p-6 flex items-start justify-between z-10">
            <div>
              <h2 className="text-lg font-semibold">Time Milestones - Full Data</h2>
              <p className="text-sm text-muted-foreground mt-2">
                Monthly productivity milestones showing months with 2+ cases and 3-month consecutive streaks with 2+ cases per month.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setIsDrawerOpen(false)} className="-mt-2 -mr-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
          
          <div className="p-6">
            <div className="mb-4 flex flex-wrap gap-2">
              <div className="inline-flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="font-semibold">Surgeon:</span>
                <span>{surgeonFilter === "all" ? "All Surgeons" : surgeonFilter}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="font-semibold">Total Records:</span>
                <span>{data.length}</span>
              </div>
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="inline-flex items-center gap-1.5 bg-gray-100 dark:bg-gray-800 text-gray-800 dark:text-gray-200 px-3 py-1.5 rounded-full text-xs font-medium cursor-help">
                      <Info className="h-3 w-3" />
                      <span>How it's calculated</span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent className="max-w-xs z-[110]">
                    <div className="space-y-2 text-xs">
                      <p><strong>Mo to 2/Mo:</strong> Time from first case until the date of the 2nd case in the first month with 2+ cases. Uses 2nd case date of that month.</p>
                      <p><strong>Mo to 3 Consec:</strong> Time from first case until the date of the 2nd case in the 3rd month of the first streak of 3 consecutive months with 2+ cases each.</p>
                      <p className="text-muted-foreground italic">Calculation: days difference ÷ 30 = months (rounded to 1 decimal)</p>
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
            <div className="border rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800">
              <table className="w-full text-sm">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-3 font-medium">#</th>
                    <th className="text-left p-3 font-medium">Surgeon</th>
                    <th className="text-center p-3 font-medium">Months to 2 Cases/Mo</th>
                    <th className="text-center p-3 font-medium">Months to 2 Cases/Mo (3 Consecutive)</th>
                  </tr>
                </thead>
                <tbody>
                  {data.map((row, index) => (
                    <tr key={index} className="border-t hover:bg-muted/50">
                      <td className="p-3 text-muted-foreground">{index + 1}</td>
                      <td className="p-3 font-medium">{row.surgeon}</td>
                      <td className="p-3 text-center">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
                          {row.monthsTo2Cases !== null ? row.monthsTo2Cases : '-'}
                        </span>
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">
                          {row.monthsTo3Consecutive !== null ? row.monthsTo3Consecutive : '-'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </>
    )}
    </>
  )
}
