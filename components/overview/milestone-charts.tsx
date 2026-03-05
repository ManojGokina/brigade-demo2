"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, LabelList } from "recharts"
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

export function DaysToCaseMilestones({ data, surgeons, surgeonFilter, onSurgeonChange }: { data: any[], surgeons: string[], surgeonFilter: string, onSurgeonChange: (value: string) => void }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  // For chart: show only 2nd to 6th case when surgeon is selected
  const chartData = surgeonFilter !== "all" ? data.slice(1, 6) : data

  const exportToExcel = () => {
    const surgeonLabel = surgeonFilter === "all" ? "All Surgeons" : surgeonFilter
    const hasDate = data[0]?.date
    
    const wb = XLSX.utils.book_new()
    const wsData: any[][] = [
      ["Days to Case Milestones Report", "", ""],
      ["", "", ""],
      ["Surgeon", surgeonLabel, ""],
      ["Export Date", new Date().toLocaleString(), ""],
      ["", "", ""],
      hasDate 
        ? ["Case Milestone", "Case Date", "Days from 1st Case"]
        : ["Case Milestone", "Days from 1st Case", ""],
      ...data.map((row) => hasDate 
        ? [row.milestone, new Date(row.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), row.avg]
        : [row.milestone, row.avg, ""]
      ),
    ]
    
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 20 }]
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
    
    XLSX.utils.book_append_sheet(wb, ws, "Days to Case Milestones")
    XLSX.writeFile(wb, `days-to-case-milestones-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Days to Case Milestones</CardTitle>
            <p className="text-xs text-muted-foreground">Time to reach specific case numbers</p>
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
            <Button variant="outline" size="sm" className="h-8" onClick={() => setIsDrawerOpen(true)}>
              <Maximize2 className="h-3 w-3 mr-1" />
              See All
            </Button>

            {isDrawerOpen && (
              <>
                <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setIsDrawerOpen(false)} />
                <div className="fixed right-0 top-0 h-full w-[90vw] sm:w-[700px] bg-white dark:bg-gray-900 shadow-2xl z-[101] overflow-y-auto animate-in slide-in-from-right duration-300">
                  <div className="sticky top-0 bg-white dark:bg-gray-900 border-b p-6 flex items-start justify-between z-10">
                    <div>
                      <h2 className="text-lg font-semibold">Days to Case Milestones - Full Data</h2>
                      <p className="text-sm text-muted-foreground mt-2">
                        {surgeonFilter === "all" 
                          ? "Shows average days from 1st case to reach milestone cases (2nd, 3rd, 6th, 10th). Calculated by averaging days across all surgeons who reached each milestone."
                          : "Shows days from 1st case to each subsequent case for the selected surgeon. Calculated as: (Case Date - 1st Case Date) in days."}
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
                              {surgeonFilter === "all" ? (
                                <>
                                  <p><strong>Milestone Averages:</strong> Average days from 1st case to reach 2nd, 3rd, 6th, and 10th cases</p>
                                  <p><strong>Calculation:</strong> For each milestone, calculate days for all surgeons who reached it, then average</p>
                                  <p className="text-muted-foreground italic">Example: If 10 surgeons reached 2nd case in 20, 25, 30... days, average is shown</p>
                                </>
                              ) : (
                                <>
                                  <p><strong>Days from 1st Case:</strong> Calendar days from surgeon's first case to each subsequent case</p>
                                  <p><strong>Calculation:</strong> (Case N Date - 1st Case Date) in days</p>
                                  <p className="text-muted-foreground italic">Example: If 1st case on Jan 1 and 3rd case on Jan 31, shows 30 days</p>
                                </>
                              )}
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
                            <th className="text-left p-3 font-medium">Case Milestone</th>
                            {data[0]?.date && <th className="text-left p-3 font-medium">Case Date</th>}
                            <th className="text-right p-3 font-medium">Days from 1st Case</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((row, index) => (
                            <tr key={index} className="border-t hover:bg-muted/50">
                              <td className="p-3">{row.milestone}</td>
                              {row.date && (
                                <td className="p-3">
                                  {new Date(row.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                                </td>
                              )}
                              <td className="p-3 text-right font-medium">{row.avg}</td>
                            </tr>
                          ))}
                        </tbody>
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
        <ChartContainer config={{}} className="h-[250px] w-full">
          <BarChart data={chartData}>
            <XAxis 
              dataKey="milestone" 
              tick={{ fontSize: 11 }} 
              label={{ value: "Case Milestone", position: "insideBottom", offset: -5, style: { fontSize: 12, fontWeight: 500, fill: "#000" } }}
            />
            <YAxis 
              tick={{ fontSize: 11 }} 
              label={{ value: "Days", angle: -90, position: "insideLeft", style: { fontSize: 12, fontWeight: 500, fill: "#000" } }}
              domain={[0, (dataMax: number) => Math.ceil(dataMax) + 10]}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="avg" fill="#1d99ac" radius={[4, 4, 0, 0]} name="Days from 1st Case">
              <LabelList dataKey="avg" position="top" style={{ fontSize: 10, fill: "#1d99ac" }} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function DaysBetweenCases({ data, surgeons, surgeonFilter, onSurgeonChange }: { data: any[], surgeons: string[], surgeonFilter: string, onSurgeonChange: (value: string) => void }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const exportToExcel = () => {
    const surgeonLabel = surgeonFilter === "all" ? "All Surgeons" : surgeonFilter
    
    const wb = XLSX.utils.book_new()
    const wsData: any[][] = [
      ["Days Between Consecutive Cases Report", "", "", ""],
      ["", "", "", ""],
      ["Surgeon", surgeonLabel, "", ""],
      ["Export Date", new Date().toLocaleString(), "", ""],
      ["", "", "", ""],
      ["Case Number", "Case Date", "Days Since Previous Case", ""],
      ...data.map((row) => [row.caseNumber, new Date(row.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }), row.days, ""]),
    ]
    
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws['!cols'] = [{ wch: 20 }, { wch: 20 }, { wch: 25 }, { wch: 20 }]
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 3 } }]
    
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
    
    XLSX.utils.book_append_sheet(wb, ws, "Days Between Cases")
    XLSX.writeFile(wb, `days-between-cases-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Days Between Consecutive Cases</CardTitle>
            <p className="text-xs text-muted-foreground">Days between each case for selected surgeon</p>
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
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8" 
              onClick={() => setIsDrawerOpen(true)}
              disabled={surgeonFilter === "all" || data.length === 0}
            >
              <Maximize2 className="h-3 w-3 mr-1" />
              See All
            </Button>

            {isDrawerOpen && (
              <>
                <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setIsDrawerOpen(false)} />
                <div className="fixed right-0 top-0 h-full w-[90vw] sm:w-[700px] bg-white dark:bg-gray-900 shadow-2xl z-[101] overflow-y-auto animate-in slide-in-from-right duration-300">
                  <div className="sticky top-0 bg-white dark:bg-gray-900 border-b p-6 flex items-start justify-between z-10">
                    <div>
                      <h2 className="text-lg font-semibold">Days Between Consecutive Cases - Full Data</h2>
                      <p className="text-sm text-muted-foreground mt-2">
                        This shows the number of days between each consecutive case for the selected surgeon. Case 1 shows 0 days (first case baseline). A value of 0 days means cases were performed on the same day.
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
                        <span>{surgeonFilter}</span>
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
                              <p><strong>Days Since Previous:</strong> Calendar days between consecutive cases</p>
                              <p><strong>Case 1:</strong> Shows 0 days (baseline/first case)</p>
                              <p><strong>0 days:</strong> Cases performed on the same day</p>
                              <p className="text-muted-foreground italic">Example: Case 3 with 15 days means 15 days after Case 2</p>
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
                            <th className="text-left p-3 font-medium">Case Number</th>
                            <th className="text-left p-3 font-medium">Case Date</th>
                            <th className="text-right p-3 font-medium">Days Since Previous Case</th>
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((row, index) => (
                            <tr key={index} className="border-t hover:bg-muted/50">
                              <td className="p-3">
                                {row.caseNumber}
                                {index === 0 && <span className="ml-2 text-xs text-muted-foreground">(First case)</span>}
                              </td>
                              <td className="p-3">
                                {new Date(row.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                              </td>
                              <td className="p-3 text-right font-medium">
                                {row.days}
                                {row.days === 0 && index > 0 && <span className="ml-2 text-xs text-muted-foreground">(Same day)</span>}
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          {data.length > 0 ? (
            <LineChart data={data}>
              <XAxis 
                dataKey="caseNumber" 
                tick={{ fontSize: 11 }} 
                label={{ value: "Case Number", position: "insideBottom", offset: -5, style: { fontSize: 12, fontWeight: 500, fill: "#000" } }}
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                label={{ value: "Days Since Previous Case", angle: -90, position: "insideLeft", offset: 25, style: { fontSize: 12, fontWeight: 500, fill: "#000" } }}
                domain={[0, (dataMax: number) => Math.ceil(dataMax) + 10]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Line type="monotone" dataKey="days" stroke="#ec4899" strokeWidth={2} dot={{ fill: "#ec4899", r: 4 }} name="Days">
                <LabelList dataKey="days" position="top" style={{ fontSize: 10, fill: "#ec4899" }} />
              </Line>
            </LineChart>
          ) : (
            <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
              Select a surgeon to view data
            </div>
          )}
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
