"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, LabelList, Legend } from "recharts"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Maximize2, X, Download } from "lucide-react"

export function ProductivityByUserType({ data }: { data: any[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleExport = () => {
    const headers = ['Quarter', 'Region', 'Standard Productivity', 'Excluding First Case']
    const rows = data.map(item => [
      item.quarter,
      item.region,
      item.standard,
      item.excludingFirst
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'productivity-by-user-type.csv'
    a.click()
  }

  return (
    <>
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Overall Productivity by User Type (QoQ)</CardTitle>
            <p className="text-xs text-muted-foreground">Standard vs Excluding First Case by Region</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#60a5fa]" />
                <span className="text-xs text-muted-foreground">Standard</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#1d4ed8]" />
                <span className="text-xs text-muted-foreground">Excl. 1st Case</span>
              </div>
            </div>
            <Button variant="outline" size="sm" className="h-8" onClick={() => setDrawerOpen(true)}>
              <Maximize2 className="h-3 w-3 mr-1" />
              See All
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[300px] w-full">
          <BarChart data={data}>
            <XAxis 
              dataKey="label" 
              tick={{ fontSize: 10 }} 
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 11 }} label={{ value: "Cases per Month", angle: -90, position: "insideLeft" }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="standard" fill="#60a5fa" radius={[4, 4, 0, 0]} name="Standard Productivity">
              <LabelList dataKey="standard" position="top" style={{ fontSize: 9, fill: "#60a5fa" }} />
            </Bar>
            <Bar dataKey="excludingFirst" fill="#1d4ed8" radius={[4, 4, 0, 0]} name="Excluding First Case">
              <LabelList dataKey="excludingFirst" position="top" style={{ fontSize: 9, fill: "#1d4ed8" }} />
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
              <SheetTitle className="text-lg font-semibold">Overall Productivity by User Type - Full Data</SheetTitle>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Calculation:</strong> Standard Productivity = Total cases / Total months. 
                Excluding First Case = (Total cases - First cases) / Total months. 
                Grouped by quarter and region (EST, VAL). Shows surgeon performance comparison.
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
                  <th className="text-left p-3 font-medium">Quarter</th>
                  <th className="text-left p-3 font-medium">Region</th>
                  <th className="text-right p-3 font-medium">Standard Productivity</th>
                  <th className="text-right p-3 font-medium">Excluding First Case</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-3 text-muted-foreground">{index + 1}</td>
                    <td className="p-3 font-medium text-gray-900">{item.quarter}</td>
                    <td className="p-3 font-medium text-gray-900">{item.region}</td>
                    <td className="p-3 text-right font-medium">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
                        {item.standard}
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium">
                      <span className="inline-block px-2 py-1 bg-blue-900 text-white rounded font-semibold">
                        {item.excludingFirst}
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
