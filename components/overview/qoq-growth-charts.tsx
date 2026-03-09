"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, LabelList } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Maximize2, X, Download } from "lucide-react"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"

import { MultiSelect } from "@/components/ui/multi-select"

export function QoQGrowthProgression({ data, years, selectedYears, surgeons, surgeon, onYearsChange, onSurgeonChange }: { data: any[], years: string[], selectedYears: string[], surgeons: string[], surgeon: string[], onYearsChange: (values: string[]) => void, onSurgeonChange: (value: string[]) => void }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleExport = () => {
    const headers = ['Quarter', 'Cases', 'Surgeons', 'Productivity']
    const rows = data.map(item => [
      item.quarter,
      item.cases,
      item.surgeons,
      item.productivity
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `qoq-growth-${selectedYears.join('-')}.csv`
    a.click()
  }

  return (
    <>
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">QoQ Growth Progression - Quaterly</CardTitle>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#1d99ac]" />
                <span className="text-xs text-muted-foreground">Cases</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#10b981]" />
                <span className="text-xs text-muted-foreground">Surgeons</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                <span className="text-xs text-muted-foreground">Productivity</span>
              </div>
            </div>
            <MultiSelect
              options={surgeons}
              selected={surgeon}
              onChange={onSurgeonChange}
              placeholder="All Surgeons"
              className="w-[120px] border-gray-300 focus:border-gray-500"
              maxCount={10}
            />
            <MultiSelect
              options={years}
              selected={selectedYears}
              onChange={onYearsChange}
              placeholder="Select Years"
              className="w-[120px]"
            />
            
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <BarChart data={data}>
            <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="cases" fill="#1d99ac" radius={[4, 4, 0, 0]} name="Cases">
              <LabelList dataKey="cases" position="top" style={{ fontSize: 10, fill: "#1d99ac" }} />
            </Bar>
            <Bar dataKey="surgeons" fill="#10b981" radius={[4, 4, 0, 0]} name="Surgeons">
              <LabelList dataKey="surgeons" position="top" style={{ fontSize: 10, fill: "#10b981" }} />
            </Bar>
            <Bar dataKey="productivity" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Productivity">
              <LabelList dataKey="productivity" position="top" style={{ fontSize: 10, fill: "#f59e0b" }} />
            </Bar>
          </BarChart>
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
              <SheetTitle className="text-lg font-semibold">QoQ Growth Progression - Full Data</SheetTitle>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Calculation:</strong> Cases = Total cases per quarter. 
                Surgeons = Unique surgeons per quarter. 
                Productivity = Cases / Surgeons (average cases per surgeon per quarter). 
                Quarter determined by operation date: Q1 (Jan-Mar), Q2 (Apr-Jun), Q3 (Jul-Sep), Q4 (Oct-Dec).
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
              <span className="font-semibold">Years:</span>
              <span>{selectedYears.join(', ')}</span>
            </div>
            <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium">
              <span className="font-semibold">Surgeon:</span>
              <span>{surgeon.length === 0 ? "All Surgeons" : surgeon.join(", ")}</span>
            </div>
          </div>
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
                  <th className="text-left p-3 font-medium">Quarter</th>
                  <th className="text-right p-3 font-medium">Cases</th>
                  <th className="text-right p-3 font-medium">Surgeons</th>
                  <th className="text-right p-3 font-medium">Productivity</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium text-gray-900">{item.quarter}</td>
                    <td className="p-3 text-right font-medium">
                      <span className="inline-block px-2 py-1 bg-cyan-100 text-cyan-800 rounded font-semibold">
                        {item.cases}
                      </span>
                    </td>
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
