"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, LineChart, Line, LabelList } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Button } from "@/components/ui/button"
import { Maximize2, Download, X, Info } from "lucide-react"
import * as XLSX from "xlsx-js-style"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function DaysToCaseMilestones({ data, surgeons, surgeonFilter, isLoading, onSurgeonChange }: { data: any[], surgeons: string[], surgeonFilter: string[], isLoading?: boolean, onSurgeonChange: (value: string[]) => void }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const chartData = surgeonFilter.length > 0 ? data.slice(1, 6) : data

  const colors = [
    "#1d99ac", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899",
    "#3b82f6", "#f43f5e", "#84cc16", "#06b6d4", "#a855f7",
    "#ef4444", "#14b8a6", "#f97316", "#22c55e", "#d946ef",
    "#0ea5e9", "#fb923c", "#4ade80", "#c026d3", "#38bdf8"
  ]

  const exportToExcel = () => {
    const surgeonLabel = surgeonFilter.length === 0 ? "All Surgeons" : surgeonFilter.join(", ")
    const wb = XLSX.utils.book_new()
    let headers = ["Case Milestone"]
    if (surgeonFilter.length === 0) {
      headers.push("Average Days from 1st Case")
    } else {
      headers.push(...surgeonFilter.map(s => `${s} (Days)`))
    }
    const wsData: any[][] = [
      ["Days to Case Milestones Report"],
      [],
      ["Surgeon", surgeonLabel],
      ["Export Date", new Date().toLocaleString()],
      [],
      headers,
      ...data.map((row) => {
        const rowData = [row.milestone]
        if (surgeonFilter.length === 0) {
          rowData.push(row.avg)
        } else {
          surgeonFilter.forEach(surgeon => rowData.push(row[surgeon] !== undefined ? row[surgeon] : '-'))
        }
        return rowData
      }),
    ]
    const ws = XLSX.utils.aoa_to_sheet(wsData)
    ws['!cols'] = [{ wch: 20 }, ...headers.slice(1).map(() => ({ wch: 20 }))]
    ws['!merges'] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: headers.length - 1 } }]
    const range = XLSX.utils.decode_range(ws['!ref'] || 'A1')
    for (let R = range.s.r; R <= range.e.r; ++R) {
      for (let C = range.s.c; C <= range.e.c; ++C) {
        const cellAddress = XLSX.utils.encode_cell({ r: R, c: C })
        if (!ws[cellAddress]) continue
        if (R === 0) {
          ws[cellAddress].s = { font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1d99ac" } }, alignment: { horizontal: "center", vertical: "center" } }
        } else if (R >= 2 && R <= 3) {
          ws[cellAddress].s = { font: { bold: C === 0, sz: 11 }, fill: { fgColor: { rgb: "E3F2FD" } }, alignment: { vertical: "center" } }
        } else if (R === 5) {
          ws[cellAddress].s = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1d99ac" } }, alignment: { horizontal: "center", vertical: "center" } }
        }
      }
    }
    XLSX.utils.book_append_sheet(wb, ws, "Days to Case Milestones")
    XLSX.writeFile(wb, `days-to-case-milestones-${new Date().toISOString().split('T')[0]}.xlsx`)
  }

  const chartConfig = surgeonFilter.length === 0
    ? { avg: { label: "Average Days", color: "#1d99ac" } }
    : surgeonFilter.reduce((acc, surgeon, idx) => {
        acc[surgeon] = { label: surgeon, color: colors[idx % colors.length] }
        return acc
      }, {} as Record<string, any>)

  return (
    <Card className="border-border/50 bg-card flex flex-col">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Days to Case Milestones</CardTitle>
            <p className="text-xs text-muted-foreground">Time to reach specific case numbers</p>
          </div>
          <MultiSelect
            options={surgeons}
            selected={surgeonFilter}
            onChange={onSurgeonChange}
            placeholder="All Surgeons"
            className="w-[150px] border-gray-300 focus:border-gray-500"
            maxCount={10}
          />
        </div>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col">
        {isLoading ? (
          <div className="h-[200px] flex items-end gap-3 px-2 animate-pulse">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="flex-1 bg-muted rounded-t" style={{ height: `${40 + i * 15}%` }} />
            ))}
          </div>
        ) : (
          <>
            {surgeonFilter.length > 0 && (
              <div className="flex flex-wrap gap-3 mb-4 justify-center">
                {surgeonFilter.map((surgeon, idx) => (
                  <div key={surgeon} className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
                    <span className="text-xs text-muted-foreground">{surgeon}</span>
                  </div>
                ))}
              </div>
            )}
            <div className="flex-1 pb-8">
              <ChartContainer config={chartConfig} className="h-full w-full">
                <BarChart data={chartData} margin={{ bottom: 20 }}>
                  <XAxis
                    dataKey="milestone"
                    tick={{ fontSize: 11 }}
                    label={{ value: "Case Milestone", position: "insideBottom", offset: -5, style: { fontSize: 12, fontWeight: 500, fill: "#000" } }}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    label={{ value: "Days", angle: -90, position: "insideLeft", style: { fontSize: 12, fontWeight: 500, fill: "#000" } }}
                    domain={[0, (dataMax: number) => dataMax + 10]}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {surgeonFilter.length === 0 ? (
                    <Bar dataKey="avg" fill="#1d99ac" radius={[4, 4, 0, 0]} name="Days from 1st Case">
                      <LabelList dataKey="avg" position="top" style={{ fontSize: 10, fill: "#1d99ac" }} />
                    </Bar>
                  ) : (
                    surgeonFilter.map((surgeon, idx) => (
                      <Bar key={surgeon} dataKey={surgeon} fill={colors[idx % colors.length]} stackId="a" name={surgeon} />
                    ))
                  )}
                </BarChart>
              </ChartContainer>
            </div>
            <div className="text-center pt-2">
              <button
                onClick={() => setIsDrawerOpen(true)}
                className="inline-flex items-center gap-1.5 text-sm font-bold text-primary underline decoration-dotted cursor-pointer hover:text-primary/80"
              >
                <Maximize2 className="h-4 w-4" />
                View Detailed Table
              </button>
            </div>
          </>
        )}
      </CardContent>

      {isDrawerOpen && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setIsDrawerOpen(false)} />
          <div className="fixed right-0 top-0 h-full w-[90vw] sm:w-[700px] bg-white dark:bg-gray-900 shadow-2xl z-[101] overflow-y-auto animate-in slide-in-from-right duration-300">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b p-6 flex items-start justify-between z-10">
              <div>
                <h2 className="text-lg font-semibold">Days to Case Milestones - Full Data</h2>
                <p className="text-sm text-muted-foreground mt-2">
                  {surgeonFilter.length === 0
                    ? "Shows average days from 1st case to reach milestone cases (2nd, 3rd, 6th, 10th)."
                    : "Shows days from 1st case to each subsequent case for the selected surgeon(s)."}
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
                  <span>{surgeonFilter.length === 0 ? "All Surgeons" : surgeonFilter.join(", ")}</span>
                </div>
                <div className="inline-flex items-center gap-1.5 bg-orange-100 dark:bg-orange-900/30 text-orange-800 dark:text-orange-200 px-3 py-1.5 rounded-full text-xs font-medium">
                  <span className="font-semibold">Total Records:</span>
                  <span>{data.length}</span>
                </div>
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
                      {surgeonFilter.length === 0 ? (
                        <th className="text-right p-3 font-medium">Average Days from 1st Case</th>
                      ) : (
                        surgeonFilter.map(surgeon => (
                          <th key={surgeon} className="text-right p-3 font-medium">{surgeon} (Days)</th>
                        ))
                      )}
                    </tr>
                  </thead>
                  <tbody>
                    {data.map((row, index) => (
                      <tr key={index} className="border-t hover:bg-muted/50">
                        <td className="p-3">{row.milestone}</td>
                        {surgeonFilter.length === 0 ? (
                          <td className="p-3 text-right font-medium">{row.avg}</td>
                        ) : (
                          surgeonFilter.map(surgeon => (
                            <td key={surgeon} className="p-3 text-right font-medium">
                              {row[surgeon] !== undefined ? row[surgeon] : '-'}
                            </td>
                          ))
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </>
      )}
    </Card>
  )
}

export function DaysBetweenCases({ data, surgeons, surgeonFilter, onSurgeonChange, isLoading = false }: { data: any[], surgeons: string[], surgeonFilter: string[], onSurgeonChange: (value: string[]) => void, isLoading?: boolean }) {
  const [isDrawerOpen, setIsDrawerOpen] = useState(false)

  const colors = [
    "#1d99ac", "#8b5cf6", "#f59e0b", "#10b981", "#ec4899", 
    "#3b82f6", "#f43f5e", "#84cc16", "#06b6d4", "#a855f7",
    "#ef4444", "#14b8a6", "#f97316", "#22c55e", "#d946ef",
    "#0ea5e9", "#fb923c", "#4ade80", "#c026d3", "#38bdf8"
  ]

  const exportToExcel = () => {
    const surgeonLabel = surgeonFilter.length === 0 ? "All Surgeons" : surgeonFilter.join(", ")
    
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
            <MultiSelect
              options={surgeons}
              selected={surgeonFilter}
              onChange={onSurgeonChange}
              placeholder="All Surgeons"
              className="w-[150px] border-gray-300 focus:border-gray-500"
              maxCount={10}
            />
            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8" 
                    onClick={() => setIsDrawerOpen(true)}
                    disabled={surgeonFilter.length === 0 || data.length === 0}
                  >
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download in CSV</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider> */}

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
                        <span>{surgeonFilter.length === 0 ? "All Surgeons" : surgeonFilter.join(", ")}</span>
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
                            {surgeonFilter.length === 1 ? (
                              <>
                                <th className="text-left p-3 font-medium">Case Date</th>
                                <th className="text-right p-3 font-medium">Days Since Previous Case</th>
                              </>
                            ) : (
                              surgeonFilter.map(surgeon => (
                                <th key={surgeon} className="text-right p-3 font-medium">{surgeon} (Days)</th>
                              ))
                            )}
                          </tr>
                        </thead>
                        <tbody>
                          {data.map((row, index) => (
                            <tr key={index} className="border-t hover:bg-muted/50">
                              <td className="p-3">
                                {row.caseNumber}
                                {index === 0 && <span className="ml-2 text-xs text-muted-foreground">(First case)</span>}
                              </td>
                              {surgeonFilter.length === 1 ? (
                                <>
                                  <td className="p-3">
                                    {row.date ? new Date(row.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) : '-'}
                                  </td>
                                  <td className="p-3 text-right font-medium">
                                    {row.days}
                                    {row.days === 0 && index > 0 && <span className="ml-2 text-xs text-muted-foreground">(Same day)</span>}
                                  </td>
                                </>
                              ) : (
                                surgeonFilter.map(surgeon => (
                                  <td key={surgeon} className="p-3 text-right font-medium">
                                    {row[surgeon] !== null && row[surgeon] !== undefined ? row[surgeon] : '-'}
                                  </td>
                                ))
                              )}
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
        {surgeonFilter.length > 0 && data.length > 0 && (
          <div className="flex flex-wrap gap-3 mb-4 justify-center">
            {surgeonFilter.map((surgeon, idx) => (
              <div key={surgeon} className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[idx % colors.length] }} />
                <span className="text-xs text-muted-foreground">{surgeon}</span>
              </div>
            ))}
          </div>
        )}
        <ChartContainer config={{}} className="h-[350px] w-full">
          {data.length > 0 ? (
            <LineChart data={data}>
              <XAxis 
                dataKey="caseNumber" 
                tick={{ fontSize: 11 }} 
                label={{ value: "Case Number", position: "insideBottom", offset: -5, style: { fontSize: 12, fontWeight: 500, fill: "#000" } }}
              />
              <YAxis 
                tick={{ fontSize: 11 }} 
                label={{ value: "Days Since Previous Case", angle: -90, position: "insideLeft", style: { fontSize: 12, fontWeight: 500, fill: "#000" } }}
                domain={[0, (dataMax: number) => Math.ceil(dataMax) + 10]}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              {surgeonFilter.map((surgeon, idx) => (
                <Line 
                  key={surgeon} 
                  type="monotone" 
                  dataKey={surgeonFilter.length === 1 ? "days" : surgeon}
                  stroke={colors[idx % colors.length]} 
                  strokeWidth={2} 
                  dot={{ fill: colors[idx % colors.length], r: 4 }} 
                  name={surgeon}
                >
                  {/* <LabelList dataKey={surgeonFilter.length === 1 ? "days" : surgeon} position="top" offset={10} style={{ fontSize: 10, fill: colors[idx % colors.length] }} /> */}
                </Line>
              ))}
            </LineChart>
          ) : (
            <div className="flex flex-col items-center justify-center h-full">
              <div className="relative mb-6">
                <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 blur-3xl rounded-full" />
                <svg className="relative w-24 h-24 text-muted-foreground/30" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-base font-medium text-foreground mb-2">No Surgeon Selected</p>
              <p className="text-sm text-muted-foreground mb-6 text-center max-w-xs">Choose one or more surgeons from the dropdown above to visualize the days between their consecutive cases</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground bg-muted/50 px-4 py-2 rounded-full">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                </svg>
                <span>Track case frequency trends</span>
              </div>
            </div>
          )}
        </ChartContainer>
        {data.length > 0 && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setIsDrawerOpen(true)}
              className="inline-flex items-center gap-1.5 text-sm font-bold text-primary underline decoration-dotted cursor-pointer hover:text-primary/80"
            >
              <Maximize2 className="h-4 w-4" />
              View Detailed Table
            </button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
