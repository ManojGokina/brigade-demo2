"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, LabelList } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Maximize2, Download, X, Info } from "lucide-react"
import * as XLSX from "xlsx-js-style"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

export function SecondCaseBooking({ 
  data, 
  excludeDays, 
  statusFilter, 
  breakdown, 
  onExcludeDaysChange, 
  onStatusChange, 
  onBreakdownChange 
}: { 
  data: any[], 
  excludeDays: string, 
  statusFilter: string, 
  breakdown: string, 
  onExcludeDaysChange: (value: string) => void, 
  onStatusChange: (value: string) => void, 
  onBreakdownChange: (value: string) => void 
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const exportToExcel = () => {
    const ws_data = [
      ["Second Case Booking Report"],
      [],
      ["Exclude Days:", excludeDays === "0" ? "Include All" : `Exclude 1st case < ${excludeDays} days`],
      ["Status Filter:", statusFilter === "all" ? "All Status" : statusFilter],
      ["Breakdown:", breakdown === "overall" ? "Overall" : breakdown === "userType" ? "By User Type" : breakdown === "region" ? "By Region" : "By Specialty"],
      ["Total Records:", data.length.toString()],
      [],
      ["#", "Category", "Percentage (%)"]
    ]

    data.forEach((item, index) => {
      ws_data.push([
        (index + 1).toString(),
        item.category,
        item.percentage.toString()
      ])
    })

    const ws = XLSX.utils.aoa_to_sheet(ws_data)

    ws["!merges"] = [{ s: { r: 0, c: 0 }, e: { r: 0, c: 2 } }]

    ws["A1"].s = {
      font: { bold: true, sz: 16, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "1d99ac" } },
      alignment: { horizontal: "center", vertical: "center" }
    }

    const filterStyle = {
      font: { bold: true, sz: 11 },
      fill: { fgColor: { rgb: "E3F2FD" } }
    }
    ;["A3", "A4", "A5", "A6"].forEach(cell => {
      if (ws[cell]) ws[cell].s = filterStyle
    })

    const headerStyle = {
      font: { bold: true, color: { rgb: "FFFFFF" } },
      fill: { fgColor: { rgb: "4A90E2" } },
      alignment: { horizontal: "center", vertical: "center" }
    }
    ;["A8", "B8", "C8"].forEach(cell => {
      if (ws[cell]) ws[cell].s = headerStyle
    })

    ws["!cols"] = [
      { wch: 8 },
      { wch: 30 },
      { wch: 18 }
    ]

    const wb = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(wb, ws, "Second Case Booking")
    XLSX.writeFile(wb, `Second_Case_Booking_${new Date().toISOString().split('T')[0]}.xlsx`)
  }

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
        <div className="relative">
          <ChartContainer config={{}} className="h-[300px] w-full">
            <BarChart data={data}>
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
              <Bar dataKey="percentage" fill="#10b981" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="percentage" position="top" formatter={(value: number) => `${value}%`} style={{ fontSize: 10, fill: "#10b981" }} />
              </Bar>
            </BarChart>
          </ChartContainer>
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
      </CardContent>
    </Card>

    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto bg-white p-0">
        <SheetHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-lg font-semibold">% of Surgeons Booking Second Cases - Full Data</SheetTitle>
              <p className="text-sm text-muted-foreground mt-2">
                This data shows the percentage of surgeons who have booked subsequent cases. Sequential view shows progression through case milestones.
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
              <span>{statusFilter === "all" ? "All Status" : statusFilter}</span>
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
                    <p className="text-muted-foreground italic">Example: "2nd Case: 75%" means 75% of surgeons reached their 2nd case</p>
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
                  <th className="text-left p-3 font-medium">#</th>
                  <th className="text-left p-3 font-medium">Category</th>
                  <th className="text-right p-3 font-medium">Percentage (%)</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-3 text-muted-foreground">{index + 1}</td>
                    <td className="p-3 font-medium text-gray-900">{item.category}</td>
                    <td className="p-3 text-right font-medium">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">
                        {item.percentage}%
                      </span>
                    </td>
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
