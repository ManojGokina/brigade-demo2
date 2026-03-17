"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, LabelList } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Maximize2, Download, X, Info } from "lucide-react"
import * as XLSX from "xlsx-js-style"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { fetchSecondCaseBookingDrilldown, SecondCaseBookingDrilldownResult } from "@/lib/stats-api"

export function SecondCaseBooking({
  data,
  isLoading,
  excludeDays,
  statusFilter,
  breakdown,
  startDate,
  endDate,
  onExcludeDaysChange,
  onStatusChange,
  onBreakdownChange,
}: {
  data: any[]
  isLoading?: boolean
  excludeDays: string
  statusFilter: string[]
  breakdown: string
  startDate?: string
  endDate?: string
  onExcludeDaysChange: (value: string) => void
  onStatusChange: (value: string[]) => void
  onBreakdownChange: (value: string) => void
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drillDown, setDrillDown] = useState<{ category: string; status?: string } | null>(null)
  const [drillDownData, setDrillDownData] = useState<SecondCaseBookingDrilldownResult | null>(null)
  const [drillDownLoading, setDrillDownLoading] = useState(false)

  const colors: Record<string, string> = { EST: "#1d99ac", IN: "#8b5cf6", VAL: "#f59e0b" }

  // Fetch drilldown from API when a bar is clicked
  useEffect(() => {
    if (!drillDown) return
    setDrillDownLoading(true)
    setDrillDownData(null)
    fetchSecondCaseBookingDrilldown({
      startDate,
      endDate,
      category: drillDown.category,
      status: drillDown.status,
      statuses: statusFilter.length > 0 ? statusFilter : undefined,
      breakdown: breakdown as any,
      excludeDays: parseInt(excludeDays),
    })
      .then(setDrillDownData)
      .finally(() => setDrillDownLoading(false))
  }, [drillDown])

  const exportToExcel = () => {
    const ws_data: any[][] = [
      ["Second Case Booking Report"],
      [],
      ["Exclude Days:", excludeDays === "0" ? "Include All" : `Exclude 1st case < ${excludeDays} days`],
      ["Status Filter:", statusFilter.length === 0 ? "All Status" : statusFilter.join(", ")],
      ["Breakdown:", breakdown === "overall" ? "Overall" : breakdown === "userType" ? "By User Type" : breakdown === "region" ? "By Region" : "By Specialty"],
      ["Total Records:", data.length.toString()],
      [],
      ["#", "Category", "Percentage (%)"],
    ]
    data.forEach((item, index) => {
      ws_data.push([(index + 1).toString(), item.category, item.percentage?.toString() ?? ""])
    })
    const ws = XLSX.utils.aoa_to_sheet(ws_data)
    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }]
    ws["A1"].s = { font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "1d99ac" } }, alignment: { horizontal: "center" } }
    const headerStyle = { font: { bold: true, color: { rgb: "FFFFFF" } }, fill: { fgColor: { rgb: "4A90E2" } }, alignment: { horizontal: "center" } }
    ;["A8", "B8", "C8"].forEach(cell => { if (ws[cell]) ws[cell].s = headerStyle })
    ws["!cols"] = [{ wch: 8 }, { wch: 30 }, { wch: 18 }]
    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Second Case Booking")
    XLSX.writeFile(wb, `Second_Case_Booking_${new Date().toISOString().split("T")[0]}.xlsx`)
  }

  const ChartSkeleton = () => (
    <div className="space-y-3 py-2">
      <div className="flex items-end gap-2 h-[250px] px-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="flex-1 rounded-t" style={{ height: `${40 + Math.random() * 60}%` }} />
        ))}
      </div>
      <Skeleton className="h-3 w-32 mx-auto" />
    </div>
  )

  return (
    <>
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">% of Surgeons Booking Second Cases</CardTitle>
              <p className="text-xs text-muted-foreground">Overall, filtered by status, and broken down by type/region/specialty</p>
            </div>
            <div className="flex gap-2">
              <Select value={excludeDays} onValueChange={onExcludeDaysChange}>
                <SelectTrigger className="w-[180px] h-8 text-xs border-gray-300 focus:border-gray-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="0">Include All</SelectItem>
                  <SelectItem value="30">Exclude 1st case &lt; 30 days</SelectItem>
                  <SelectItem value="45">Exclude 1st case &lt; 45 days</SelectItem>
                  <SelectItem value="60">Exclude 1st case &lt; 60 days</SelectItem>
                  <SelectItem value="90">Exclude 1st case &lt; 90 days</SelectItem>
                </SelectContent>
              </Select>
              <MultiSelect
                options={["EST", "IN", "VAL"]}
                selected={statusFilter}
                onChange={onStatusChange}
                placeholder="All Status"
                className="w-[120px] border-gray-300 focus:border-gray-500"
              />
              <Select value={breakdown} onValueChange={onBreakdownChange}>
                <SelectTrigger className="w-[140px] h-8 text-xs border-gray-300 focus:border-gray-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="overall">Overall</SelectItem>
                  <SelectItem value="userType">By User Type</SelectItem>
                  <SelectItem value="region">By Region</SelectItem>
                  <SelectItem value="specialty">By Specialty</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <ChartSkeleton />
          ) : (
            <div className="relative">
              {statusFilter.length > 0 && (
                <div className="flex flex-wrap gap-3 mb-4 justify-center">
                  {statusFilter.map((status) => (
                    <div key={status} className="flex items-center gap-1.5">
                      <div className="h-2 w-2 rounded-full" style={{ backgroundColor: colors[status] }} />
                      <span className="text-xs text-muted-foreground">{status}</span>
                    </div>
                  ))}
                </div>
              )}
              <ChartContainer config={{}} className="h-[300px] w-full">
                <BarChart
                  data={data}
                  barCategoryGap="20%"
                  barGap={4}
                  onClick={(chartData) => {
                    if (!chartData?.activePayload?.length) return
                    const payload = chartData.activePayload[0].payload
                    const clickedStatus = statusFilter.length === 1 ? statusFilter[0] : undefined
                    setDrillDown({ category: payload.category, status: clickedStatus })
                  }}
                  style={{ cursor: "pointer" }}
                >
                  <XAxis
                    dataKey="category"
                    tick={{ fontSize: 11 }}
                    label={{ value: "Category", position: "insideBottom", offset: 0, style: { fontSize: 12, fontWeight: 500, fill: "#000" } }}
                  />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    label={{ value: "Percentage (%)", angle: -90, position: "insideLeft", style: { fontSize: 12, fontWeight: 500, fill: "#000" } }}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  {statusFilter.length === 0 ? (
                    <Bar dataKey="percentage" fill="#10b981" radius={[4, 4, 0, 0]}>
                      <LabelList dataKey="percentage" position="top" formatter={(v: number) => `${v}%`} style={{ fontSize: 10, fill: "#10b981" }} />
                    </Bar>
                  ) : (
                    statusFilter.map((status) => (
                      <Bar key={status} dataKey={status} fill={colors[status]} radius={[4, 4, 0, 0]} name={status} />
                    ))
                  )}
                </BarChart>
              </ChartContainer>
              <p className="text-xs text-center text-muted-foreground mt-1">Click a bar to see surgeon breakdown</p>
              <div className="flex justify-center mt-3">
                <button
                  onClick={() => setDrawerOpen(true)}
                  className="text-sm text-primary hover:text-primary/80 hover:underline font-bold flex items-center gap-1.5 transition-colors"
                >
                  <Maximize2 className="h-4 w-4" />
                  View Detailed Table
                </button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Full data drawer */}
      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto bg-white p-0">
          <SheetHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-lg font-semibold">% of Surgeons Booking Second Cases - Full Data</SheetTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  This data shows the percentage of surgeons who have booked subsequent cases.
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(false)} className="-mt-2 -mr-2">
                <X className="h-4 w-4" />
              </Button>
            </div>
          </SheetHeader>
          <div className="px-6 py-6 bg-white">
            <div className="flex flex-wrap gap-2 mb-4">
              <div className="inline-flex items-center gap-1.5 bg-blue-100 text-blue-800 px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="font-semibold">Exclude Days:</span>
                <span>{excludeDays === "0" ? "Include All" : `< ${excludeDays} days`}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="font-semibold">Status:</span>
                <span>{statusFilter.length === 0 ? "All Status" : statusFilter.join(", ")}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="font-semibold">Breakdown:</span>
                <span>{breakdown === "overall" ? "Overall" : breakdown === "userType" ? "By User Type" : breakdown === "region" ? "By Region" : "By Specialty"}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="font-semibold">Total Records:</span>
                <span>{data.length}</span>
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
                      <p><strong>Overall (Sequential):</strong> Shows % of surgeons who reached each case milestone (2nd, 3rd, 4th, etc.)</p>
                      <p><strong>Breakdown Views:</strong> Shows % of surgeons in each category who booked a 2nd case</p>
                      <p><strong>Exclude Days:</strong> Filters out surgeons whose 1st case was within the specified days</p>
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
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden shadow-lg bg-white">
                <table className="w-full text-sm bg-white">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">#</th>
                      <th className="text-left p-3 font-medium">Category</th>
                      {statusFilter.length === 0 ? (
                        <th className="text-right p-3 font-medium">Percentage (%)</th>
                      ) : (
                        statusFilter.map((s) => <th key={s} className="text-right p-3 font-medium">{s} (%)</th>)
                      )}
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {data.map((item, index) => (
                      <tr key={index} className="border-t hover:bg-muted/50 transition-colors">
                        <td className="p-3 text-muted-foreground">{index + 1}</td>
                        <td className="p-3 font-medium text-gray-900">{item.category}</td>
                        {statusFilter.length === 0 ? (
                          <td className="p-3 text-right font-medium">
                            <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">{item.percentage}%</span>
                          </td>
                        ) : (
                          statusFilter.map((s) => (
                            <td key={s} className="p-3 text-right font-medium">
                              <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">{item[s] ?? 0}%</span>
                            </td>
                          ))
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>

      {/* Drilldown panel */}
      {drillDown && (
        <>
          <div className="fixed inset-0 bg-black/50 z-[100]" onClick={() => setDrillDown(null)} />
          <div className="fixed right-0 top-0 h-full w-[90vw] sm:w-[600px] bg-white dark:bg-gray-900 shadow-2xl z-[101] overflow-y-auto">
            <div className="sticky top-0 bg-white dark:bg-gray-900 border-b p-5 flex items-start justify-between z-10">
              <div>
                <h2 className="text-base font-semibold">Surgeon Breakdown</h2>
                <p className="text-xs text-muted-foreground mt-1">
                  {drillDown.category}{drillDown.status ? ` · ${drillDown.status}` : ""}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={() => setDrillDown(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <div className="p-5 space-y-5">
              {drillDownLoading ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-3 gap-3">
                    {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-lg" />)}
                  </div>
                  <Skeleton className="h-4 w-40" />
                  <div className="space-y-2">
                    {Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-9 w-full" />)}
                  </div>
                </div>
              ) : drillDownData ? (
                <>
                  <div className="flex gap-3">
                    <div className="flex-1 bg-green-50 border border-green-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-green-700">{drillDownData.with.length}</div>
                      <div className="text-xs text-green-600 mt-0.5">Reached milestone</div>
                    </div>
                    <div className="flex-1 bg-red-50 border border-red-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-red-700">{drillDownData.without.length}</div>
                      <div className="text-xs text-red-600 mt-0.5">Have not reached</div>
                    </div>
                    <div className="flex-1 bg-blue-50 border border-blue-200 rounded-lg p-3 text-center">
                      <div className="text-2xl font-bold text-blue-700">
                        {drillDownData.with.length + drillDownData.without.length > 0
                          ? Math.round((drillDownData.with.length / (drillDownData.with.length + drillDownData.without.length)) * 100)
                          : 0}%
                      </div>
                      <div className="text-xs text-blue-600 mt-0.5">Conversion rate</div>
                    </div>
                  </div>

                  {drillDownData.with.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-green-700 uppercase tracking-wide mb-2">✓ Reached milestone ({drillDownData.with.length})</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-2 font-medium">Surgeon</th>
                              <th className="text-center p-2 font-medium">Status</th>
                              <th className="text-center p-2 font-medium">Total Cases</th>
                            </tr>
                          </thead>
                          <tbody>
                            {drillDownData.with.map((s, i) => (
                              <tr key={i} className="border-t hover:bg-muted/50">
                                <td className="p-2 font-medium">{s.surgeon}</td>
                                <td className="p-2 text-center">
                                  <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: colors[s.status] ? colors[s.status] + "22" : "#e5e7eb", color: colors[s.status] || "#374151" }}>
                                    {s.status || "—"}
                                  </span>
                                </td>
                                <td className="p-2 text-center font-semibold">{s.totalCases}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}

                  {drillDownData.without.length > 0 && (
                    <div>
                      <h3 className="text-xs font-semibold text-red-700 uppercase tracking-wide mb-2">✗ Have not reached ({drillDownData.without.length})</h3>
                      <div className="border rounded-lg overflow-hidden">
                        <table className="w-full text-xs">
                          <thead className="bg-muted">
                            <tr>
                              <th className="text-left p-2 font-medium">Surgeon</th>
                              <th className="text-center p-2 font-medium">Status</th>
                              <th className="text-center p-2 font-medium">Total Cases</th>
                            </tr>
                          </thead>
                          <tbody>
                            {drillDownData.without.map((s, i) => (
                              <tr key={i} className="border-t hover:bg-muted/50">
                                <td className="p-2 font-medium">{s.surgeon}</td>
                                <td className="p-2 text-center">
                                  <span className="px-1.5 py-0.5 rounded text-xs" style={{ backgroundColor: colors[s.status] ? colors[s.status] + "22" : "#e5e7eb", color: colors[s.status] || "#374151" }}>
                                    {s.status || "—"}
                                  </span>
                                </td>
                                <td className="p-2 text-center font-semibold">{s.totalCases}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </>
      )}
    </>
  )
}
