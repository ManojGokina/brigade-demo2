"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LabelList } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Maximize2, X, Download } from "lucide-react"

export function TimeActiveInactive({ data, timeUnit, onTimeUnitChange }: { data: any[], timeUnit: string, onTimeUnitChange: (value: string) => void }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const getUnitLabel = () => {
    if (timeUnit === "weeks") return "Weeks"
    if (timeUnit === "months") return "Months"
    return "Days"
  }

  // Show top 10 in chart, all in drawer
  const top10Data = data.slice(0, 10)

  return (
    <>
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Time Active vs Inactive</CardTitle>
            <p className="text-xs text-muted-foreground">From first case and most recent case</p>
          </div>
          <div className="flex gap-2">
            <Select value={timeUnit} onValueChange={onTimeUnitChange}>
              <SelectTrigger className="w-[120px] h-8 text-xs border-gray-300 focus:border-gray-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="days">Days</SelectItem>
                <SelectItem value="weeks">Weeks</SelectItem>
                <SelectItem value="months">Months</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm" className="h-8" onClick={() => setDrawerOpen(true)}>
              <Maximize2 className="h-3 w-3 mr-1" />
              See All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <BarChart data={top10Data}>
            <XAxis 
              dataKey="surgeon" 
              tick={{ fontSize: 10 }} 
              label={{ value: "Surgeon", position: "insideBottom", offset: 0, style: { fontSize: 12, fontWeight: 500, fill: "#000" } }}
            />
            <YAxis 
              tick={{ fontSize: 11 }} 
              label={{ value: getUnitLabel(), angle: -90, position: "insideLeft", style: { fontSize: 12, fontWeight: 500, fill: "#000" } }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="timeActive" fill="#10b981" radius={[4, 4, 0, 0]} name="Active">
              <LabelList dataKey="timeActive" position="top" style={{ fontSize: 10, fill: "#10b981" }} />
            </Bar>
            <Bar dataKey="timeInactive" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Inactive">
              <LabelList dataKey="timeInactive" position="top" style={{ fontSize: 10, fill: "#f59e0b" }} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>

    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto bg-white p-0">
        <SheetHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-lg font-semibold">Time Active vs Inactive - Full Data</SheetTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Time Active: Calculated from first case date to today. Time Inactive: Calculated from most recent case date to today.
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
              <span className="font-semibold">Time Unit:</span>
              <span>{getUnitLabel()}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-xs font-medium">
              <span className="font-semibold">Total Records:</span>
              <span>{data.length}</span>
            </div>
          </div>
          <div className="border rounded-lg overflow-hidden shadow-lg bg-white">
            <table className="w-full text-sm bg-white">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">#</th>
                  <th className="text-left p-3 font-medium">Surgeon</th>
                  <th className="text-right p-3 font-medium">Time Active ({getUnitLabel()})</th>
                  <th className="text-right p-3 font-medium">Time Inactive ({getUnitLabel()})</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-3 text-muted-foreground">{index + 1}</td>
                    <td className="p-3 font-medium text-gray-900">{item.surgeon}</td>
                    <td className="p-3 text-right font-medium">
                      <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">
                        {item.timeActive}
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium">
                      <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded font-semibold">
                        {item.timeInactive}
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

export function TimeNormalized({ data }: { data: any[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const top10Data = data.slice(0, 10)

  const handleExport = () => {
    const headers = ['#', 'Surgeon', '1st Case Date', 'Months Since 1st', '2nd Case Date', 'Months Since 2nd']
    const rows = data.map((item, index) => [
      index + 1,
      item.surgeon,
      item.firstCaseDate || 'N/A',
      item.monthsSince1st,
      item.secondCaseDate || 'N/A',
      item.monthsSince2nd || 'N/A'
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'time-normalized-data.csv'
    a.click()
  }

  return (
    <>
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Time Normalized (Months)</CardTitle>
            <p className="text-xs text-muted-foreground">Months since 1st and 2nd case</p>
          </div>
          <Button variant="outline" size="sm" className="h-8" onClick={() => setDrawerOpen(true)}>
            <Maximize2 className="h-3 w-3 mr-1" />
            See All
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <BarChart data={top10Data}>
            <XAxis dataKey="surgeon" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="monthsSince1st" fill="#1d99ac" radius={[4, 4, 0, 0]} name="Since 1st Case">
              <LabelList dataKey="monthsSince1st" position="top" style={{ fontSize: 10, fill: "#1d99ac" }} />
            </Bar>
            <Bar dataKey="monthsSince2nd" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Since 2nd Case">
              <LabelList dataKey="monthsSince2nd" position="top" style={{ fontSize: 10, fill: "#8b5cf6" }} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>

    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto bg-white p-0">
        <SheetHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-lg font-semibold">Time Normalized - Full Data</SheetTitle>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Calculation:</strong> Months Since 1st Case = (Today - First Case Date) / 30 days. 
                Months Since 2nd Case = (Today - Second Case Date) / 30 days. 
                Shows time elapsed since surgeon's first and second cases.
              </p>
            </div>
            <Button variant="ghost" size="sm" onClick={() => setDrawerOpen(false)} className="-mt-2 -mr-2">
              <X className="h-4 w-4" />
            </Button>
          </div>
        </SheetHeader>
        <div className="px-6 py-6 bg-white">
          <div className="mb-3 flex justify-end">
            <Button onClick={handleExport} size="sm" variant="outline" className="gap-2">
              <Download className="h-4 w-4" />
              Export CSV
            </Button>
          </div>
          <div className="border rounded-lg overflow-hidden shadow-lg bg-white">
            <table className="w-full text-sm bg-white">
              <thead className="bg-muted">
                <tr>
                  <th className="text-left p-3 font-medium">#</th>
                  <th className="text-left p-3 font-medium">Surgeon</th>
                  <th className="text-right p-3 font-medium">1st Case Date</th>
                  <th className="text-right p-3 font-medium">Months Since 1st</th>
                  <th className="text-right p-3 font-medium">2nd Case Date</th>
                  <th className="text-right p-3 font-medium">Months Since 2nd</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-3 text-muted-foreground">{index + 1}</td>
                    <td className="p-3 font-medium text-gray-900">{item.surgeon}</td>
                    <td className="p-3 text-right text-sm text-gray-600">{item.firstCaseDate || 'N/A'}</td>
                    <td className="p-3 text-right font-medium">
                      <span className="inline-block px-2 py-1 bg-cyan-100 text-cyan-800 rounded font-semibold">
                        {item.monthsSince1st}
                      </span>
                    </td>
                    <td className="p-3 text-right text-sm text-gray-600">{item.secondCaseDate || 'N/A'}</td>
                    <td className="p-3 text-right font-medium">
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded font-semibold">
                        {item.monthsSince2nd || 'N/A'}
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

export function TimeMilestones({ data }: { data: any[] }) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Time Milestones (Months)</CardTitle>
        <p className="text-xs text-muted-foreground">Months to 2 cases/month and 3 consecutive months</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <BarChart data={data}>
            <XAxis dataKey="surgeon" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="monthsTo2PerMonth" fill="#ec4899" radius={[4, 4, 0, 0]} name="To 2/month">
              <LabelList dataKey="monthsTo2PerMonth" position="top" style={{ fontSize: 10, fill: "#ec4899" }} />
            </Bar>
            <Bar dataKey="monthsTo2PerMonth3Consecutive" fill="#f59e0b" radius={[4, 4, 0, 0]} name="To 3 consecutive">
              <LabelList dataKey="monthsTo2PerMonth3Consecutive" position="top" style={{ fontSize: 10, fill: "#f59e0b" }} />
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function GracePeriodStatus({ data }: { data: any[] }) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Grace Period Status</CardTitle>
        <p className="text-xs text-muted-foreground">Surgeons with first case in last 45 days</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="count" label>
              <Cell fill="#10b981" />
              <Cell fill="#f59e0b" />
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
