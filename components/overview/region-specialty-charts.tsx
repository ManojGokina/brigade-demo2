"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LabelList, Label, AreaChart, Area } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { MultiSelect } from "@/components/ui/multi-select"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Maximize2, X, Download } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

const COLORS = ["#1d99ac", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#84cc16", "#f97316", "#6366f1"]

const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, name }: any) => {
  const RADIAN = Math.PI / 180
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5
  const x = cx + radius * Math.cos(-midAngle * RADIAN)
  const y = cy + radius * Math.sin(-midAngle * RADIAN)

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central" fontSize={11} fontWeight="bold">
      {`${name}: ${(percent * 100).toFixed(0)}%`}
    </text>
  )
}

export function CasesByRegion({ data, timeSeriesData, regions, selectedRegion, viewType, onRegionChange, onViewTypeChange }: { 
  data: any[], 
  timeSeriesData: any[], 
  regions: string[], 
  selectedRegion: string[], 
  viewType: string, 
  onRegionChange: (value: string[]) => void, 
  onViewTypeChange: (value: string) => void 
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleExport = () => {
    if (selectedRegion.length === 0) {
      const headers = ['#', 'Region', 'Cases']
      const rows = data.map((item, index) => [index + 1, item.region, item.cases])
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = 'cases-by-region.csv'
      a.click()
    } else {
      const headers = ['#', 'Month', 'Cases', 'Surgeons', 'Productivity']
      const rows = timeSeriesData.map((item, index) => [
        index + 1,
        item.month,
        item.cases,
        item.surgeons,
        item.productivity
      ])
      const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
      const blob = new Blob([csv], { type: 'text/csv' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `cases-${selectedRegion.join("-")}.csv`
      a.click()
    }
  }

  return (
    <>
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">Cases per Region</CardTitle>
          <div className="flex gap-2">
            <MultiSelect
              options={regions}
              selected={selectedRegion}
              onChange={onRegionChange}
              placeholder="All Regions"
              className="w-[140px] border-gray-300 focus:border-gray-500"
            />
            {selectedRegion.length > 0 && (
              <Select value={viewType} onValueChange={onViewTypeChange}>
                <SelectTrigger className="w-[120px] h-8 text-xs border-gray-300 focus:border-gray-500">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cases">Cases</SelectItem>
                  <SelectItem value="surgeons">Surgeons</SelectItem>
                  <SelectItem value="productivity">Productivity</SelectItem>
                </SelectContent>
              </Select>
            )}
            {/* <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button variant="outline" size="sm" className="h-8" onClick={handleExport}>
                    <Download className="h-4 w-4" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Download in CSV</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider> */}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          {selectedRegion.length === 0 ? (
            <BarChart data={data}>
              <XAxis dataKey="region" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="cases" fill="#1d99ac" radius={[4, 4, 0, 0]}>
                <LabelList dataKey="cases" position="top" style={{ fontSize: 10, fill: "#1d99ac" }} />
              </Bar>
            </BarChart>
          ) : (
            <AreaChart data={timeSeriesData}>
              <defs>
                <linearGradient id="casesGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#1d99ac" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#1d99ac" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="surgeonsGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                </linearGradient>
                <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6} />
                  <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
                </linearGradient>
              </defs>
              <XAxis dataKey="month" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Area 
                type="monotone" 
                dataKey={viewType} 
                stroke={viewType === "cases" ? "#1d99ac" : viewType === "surgeons" ? "#10b981" : "#f59e0b"} 
                strokeWidth={2}
                fill={viewType === "cases" ? "url(#casesGradient)" : viewType === "surgeons" ? "url(#surgeonsGradient)" : "url(#productivityGradient)"}
                name={viewType === "cases" ? "Cases" : viewType === "surgeons" ? "Surgeons" : "Productivity"}
              >
                <LabelList 
                  dataKey={viewType} 
                  position="top" 
                  style={{ 
                    fontSize: 10, 
                    fill: viewType === "cases" ? "#1d99ac" : viewType === "surgeons" ? "#10b981" : "#f59e0b",
                    fontWeight: "bold"
                  }} 
                />
              </Area>
            </AreaChart>
          )}
        </ChartContainer>
        <div className="mt-4 text-center">
          <button
            onClick={() => setDrawerOpen(true)}
            className="inline-flex items-center gap-1.5 text-sm font-bold text-primary underline decoration-dotted cursor-pointer hover:text-primary/80"
          >
            <Maximize2 className="h-4 w-4" />
            View Detailed Table
          </button>
        </div>
      </CardContent>
    </Card>

    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto bg-white p-0">
        <SheetHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-lg font-semibold">Cases per Region - Full Data</SheetTitle>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Calculation:</strong> {selectedRegion.length === 0 
                  ? "Cases = Total cases per region. Surgeons = Unique surgeons per region." 
                  : "Time series by month. Cases = Total cases in month. Surgeons = Unique surgeons in month. Productivity = Cases / Surgeons (average cases per surgeon per month)."}
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
                  <th className="text-left p-3 font-medium">{selectedRegion.length === 0 ? "Region" : "Month"}</th>
                  <th className="text-right p-3 font-medium">Cases</th>
                  {selectedRegion.length > 0 && (
                    <>
                      <th className="text-right p-3 font-medium">Surgeons</th>
                      <th className="text-right p-3 font-medium">Productivity</th>
                    </>
                  )}
                </tr>
              </thead>
              <tbody className="bg-white">
                {(selectedRegion.length === 0 ? data : timeSeriesData).map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-3 text-muted-foreground">{index + 1}</td>
                    <td className="p-3 font-medium text-gray-900">{selectedRegion.length === 0 ? item.region : item.month}</td>
                    <td className="p-3 text-right font-medium">
                      <span className="inline-block px-2 py-1 bg-cyan-100 text-cyan-800 rounded font-semibold">
                        {item.cases}
                      </span>
                    </td>
                    {selectedRegion.length > 0 && (
                      <>
                        <td className="p-3 text-right font-medium">
                          <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">
                            {item.surgeons}
                          </span>
                        </td>
                        <td className="p-3 text-right font-medium">
                          <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded font-semibold">
                            {item.productivity}
                          </span>
                        </td>
                      </>
                    )}
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

export function SurgeonsBySpecialty({ data }: { data: any[] }) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Surgeons by Specialty</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={renderCustomizedLabel} labelLine={false}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function SurgeonsByCaseLoad({ data }: { data: any[] }) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Surgeons by Case Load</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={renderCustomizedLabel} labelLine={false}>
              {data.map((entry, index) => (
                <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
             <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
