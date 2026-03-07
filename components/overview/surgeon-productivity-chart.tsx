"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis, LabelList } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Maximize2, Download, X, Info } from "lucide-react"
import * as XLSX from "xlsx-js-style"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function SurgeonProductivityOverTime({ 
  data, 
  surgeons, 
  surgeonFilter, 
  caseFilter, 
  statusFilter, 
  onSurgeonChange, 
  onCaseFilterChange, 
  onStatusChange 
}: { 
  data: any[], 
  surgeons: string[], 
  surgeonFilter: string, 
  caseFilter: string, 
  statusFilter: string, 
  onSurgeonChange: (value: string) => void, 
  onCaseFilterChange: (value: string) => void, 
  onStatusChange: (value: string) => void 
}) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const exportToCSV = () => {
    const surgeonLabel = surgeonFilter === "all" ? "All Surgeons" : surgeonFilter
    const caseFilterLabel = caseFilter === "all" ? "All Cases" : caseFilter.replace("since", "Since ").replace("1st", "1st").replace("2nd", "2nd").replace("3rd", "3rd").replace("4th", "4th").replace("5th", "5th").replace("6th", "6th") + " Case"
    const statusLabel = statusFilter === "all" ? "All Status" : statusFilter
    
    const wb = XLSX.utils.book_new()
    const wsData: any[][] = [
      ["Surgeon Productivity Report", "", ""],
      ["", "", ""],
      ["Surgeon", surgeonLabel, ""],
      ["Case Filter", caseFilterLabel, ""],
      ["Status", statusLabel, ""],
      ["Total Records", data.length, ""],
      ["Export Date", new Date().toLocaleString(), ""],
      ["", "", ""],
      ["#", "Month", "Number of Cases"],
      ...data.map((row, index) => [index + 1, row.month, row.cases]),
      ["", "", ""],
      ["", "Total", data.reduce((sum, row) => sum + row.cases, 0)]
    ]
    
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    
    // Set column widths
    ws['!cols'] = [{ wch: 15 }, { wch: 25 }, { wch: 20 }]
    
    // Merge cells for title
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }]
    
    // Apply styles to all cells
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
        if (!ws[cellAddress]) continue
        
        // Title row (row 0)
        if (R === 0) {
          ws[cellAddress].s = {
            font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "1d99ac" } },
            alignment: { horizontal: "center", vertical: "center" }
          }
        }
        // Filter rows (rows 2-6)
        else if (R >= 2 && R <= 6) {
          ws[cellAddress].s = {
            font: { bold: C === 0, sz: 11 },
            fill: { fgColor: { rgb: "E3F2FD" } },
            alignment: { vertical: "center" }
          }
        }
        // Header row (row 8)
        else if (R === 8) {
          ws[cellAddress].s = {
            font: { bold: true, color: { rgb: "FFFFFF" } },
            fill: { fgColor: { rgb: "1d99ac" } },
            alignment: { horizontal: "center", vertical: "center" }
          }
        }
        // Total row (last row)
        else if (R === range.e.r) {
          if (C === 1) {
            ws[cellAddress].s = { font: { bold: true }, alignment: { horizontal: "right" } }
          } else if (C === 2) {
            ws[cellAddress].s = {
              font: { bold: true },
              fill: { fgColor: { rgb: "FFF3E0" } },
              alignment: { horizontal: "center" }
            }
          }
        }
      }
    }
    
    XLSX.utils.book_append_sheet(wb, ws, "Surgeon Productivity")
    XLSX.writeFile(wb, `surgeon-productivity-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Cases Performed Over Time</CardTitle>
            <p className="text-xs text-muted-foreground">Sliceable by date range, case number, and user status</p>
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
            <Select value={caseFilter} onValueChange={onCaseFilterChange}>
              <SelectTrigger className="w-[140px] h-8 text-xs border-gray-300 focus:border-gray-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cases</SelectItem>
                <SelectItem value="since1st">Since 1st Case</SelectItem>
                <SelectItem value="since2nd">Since 2nd Case</SelectItem>
                <SelectItem value="since3rd">Since 3rd Case</SelectItem>
                <SelectItem value="since4th">Since 4th Case</SelectItem>
                <SelectItem value="since5th">Since 5th Case</SelectItem>
                <SelectItem value="since6th">Since 6th Case</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-[120px] h-8 text-xs border-gray-300 focus:border-gray-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="EST">EST</SelectItem>
                <SelectItem value="IN">IN</SelectItem>
                <SelectItem value="VAL">VAL</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8" onClick={() => setIsDrawerOpen(true)}>
              <Download className="h-3 w-3 mr-1" />
              Export
            </Button>
            
            {/* Side Drawer */}
            {isDrawerOpen && (
              <>
                <div 
                  className="fixed inset-0 bg-black/50 z-[100]" 
                  onClick={() => setIsDrawerOpen(false)}
                />
                <div className="fixed right-0 top-0 h-full w-[90vw] sm:w-[700px] bg-white dark:bg-gray-900 shadow-2xl z-[101] overflow-y-auto animate-in slide-in-from-right duration-300">
                  <div className="sticky top-0 bg-white dark:bg-gray-900 border-b p-6 flex items-start justify-between z-10">
                    <div>
                      <h2 className="text-lg font-semibold">Surgeon Productivity - Full Data</h2>
                      <p className="text-sm text-muted-foreground mt-2">
                        This data shows the total number of cases performed by surgeons grouped by month. 
                        Cases are aggregated based on their operation date and filtered according to your selected criteria (surgeon, case number range, and user status).
                      </p>
                    </div>
                    <Button variant="ghost" size="sm" onClick={() => setIsDrawerOpen(false)} className="-mt-2 -mr-2">
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                  
                  <div className="p-6">
                    <div className="mb-4 flex flex-wrap gap-2">
                      <div className="inline-flex items-center gap-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200 px-3 py-1.5 rounded-full text-xs font-medium">
                        <span className="font-semibold">Surgeon:</span>
                        <span>{surgeonFilter === "all" ? "All Surgeons" : surgeonFilter}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200 px-3 py-1.5 rounded-full text-xs font-medium">
                        <span className="font-semibold">Case Filter:</span>
                        <span>{caseFilter === "all" ? "All Cases" : caseFilter.replace("since", "Since ").replace("1st", "1st").replace("2nd", "2nd").replace("3rd", "3rd").replace("4th", "4th").replace("5th", "5th").replace("6th", "6th") + " Case"}</span>
                      </div>
                      <div className="inline-flex items-center gap-1.5 bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200 px-3 py-1.5 rounded-full text-xs font-medium">
                        <span className="font-semibold">Status:</span>
                        <span>{statusFilter === "all" ? "All Status" : statusFilter}</span>
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
                              <p><strong>Number of Cases:</strong> Total cases performed in each month</p>
                              <p><strong>Grouping:</strong> Cases grouped by operation date month</p>
                              <p><strong>Filters:</strong> Applied to surgeon, case range, and user status</p>
                              <p className="text-muted-foreground italic">Example: "Jan '24" shows all cases in January 2024</p>
                            </div>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </div>
                    <div className="mb-3 flex justify-end">
                      <Button onClick={exportToCSV} size="sm" variant="outline" className="gap-2">
                        <Download className="h-4 w-4" />
                        Export Excel
                      </Button>
                    </div>
                    <div className="border rounded-lg overflow-hidden shadow-lg bg-white dark:bg-gray-800">
                      <table className="w-full text-sm">
                        <thead className="bg-muted">
                          <tr>
                            <th className="text-left p-3 font-medium">#</th>
                            <th className="text-left p-3 font-medium">Month</th>
                            <th className="text-right p-3 font-medium">Number of Cases</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((row, index) => (
                            <tr key={index} className="border-t hover:bg-muted/50">
                              <td className="p-3 text-muted-foreground">{index + 1}</td>
                              <td className="p-3">{row.month}</td>
                              <td className="p-3 text-right font-medium">{row.cases}</td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot className="bg-muted border-t-2">
                          <tr>
                            <td colSpan={2} className="p-3 font-medium">Total Cases</td>
                            <td className="p-3 text-right font-bold">{data.reduce((sum, row) => sum + row.cases, 0)}</td>
                          </tr>
                        </tfoot>
                      </table>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[300px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="productivityAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1d99ac" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#1d99ac" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="month" 
              tick={{ fontSize: 11 }} 
              label={{ value: "Month", position: "insideBottom", offset: -5, style: { fontSize: 12, fontWeight: 500, fill: "#000" } }}
            />
            <YAxis 
              tick={{ fontSize: 11 }} 
              label={{ value: "Number of Cases", angle: -90, position: "insideLeft", style: { fontSize: 12, fontWeight: 500, fill: "#000" } }}
              domain={[0, (dataMax: number) => Math.ceil(dataMax) + 10]}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="cases" stroke="#1d99ac" strokeWidth={2} fill="url(#productivityAreaGradient)">
              <LabelList dataKey="cases" position="top" style={{ fontSize: 10, fill: "#1d99ac", fontWeight: "bold" }} />
            </Area>
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
