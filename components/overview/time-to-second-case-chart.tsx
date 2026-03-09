"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, LabelList, Legend, CartesianGrid, ResponsiveContainer } from "recharts"
import { MultiSelect } from "@/components/ui/multi-select"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Maximize2, X, Download } from "lucide-react"

export function TimeToSecondCase({ data, surgeons, selectedSurgeon, onSurgeonChange }: { 
  data: any[], 
  surgeons: string[], 
  selectedSurgeon: string[], 
  onSurgeonChange: (value: string[]) => void 
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleExport = () => {
    const headers = ['Quarter', 'Avg Days', 'Median Days', 'Max Days']
    const rows = data.map(item => [
      item.quarter,
      item.avg,
      item.median,
      item.max
    ])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'time-to-second-case.csv'
    a.click()
  }

  const sortedData = [...data].sort((a, b) => {
    const [qA, yearA] = a.quarter.split(' ')
    const [qB, yearB] = b.quarter.split(' ')
    if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB)
    return qA.localeCompare(qB)
  })

  const groupedData: Record<string, any[]> = {}
  sortedData.forEach(item => {
    const [q, year] = item.quarter.split(' ')
    if (!groupedData[year]) groupedData[year] = []
    groupedData[year].push({ ...item, q })
  })

  return (
    <>
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Time to Surgeon's 2nd Case (Days, QoQ)</CardTitle>
            <p className="text-xs text-muted-foreground">Avg / Median / Max times by quarter</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                <span className="text-xs text-muted-foreground">Avg</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#8b5cf6]" />
                <span className="text-xs text-muted-foreground">Median</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                <span className="text-xs text-muted-foreground">Max</span>
              </div>
            </div>
            <MultiSelect
              options={surgeons}
              selected={selectedSurgeon}
              onChange={onSurgeonChange}
              placeholder="All Surgeons"
              className="w-[150px] border-gray-300 focus:border-gray-500"
            />
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="relative pb-8">
          <ChartContainer config={{}} className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={sortedData} margin={{ bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="q" 
                  tick={(props) => {
                    const { x, y, payload } = props
                    const item = sortedData[payload.index]
                    const [q] = item.quarter.split(' ')
                    return (
                      <g transform={`translate(${x},${y})`}>
                        <text x={0} y={0} dy={16} textAnchor="middle" fontSize={10}>{q}</text>
                      </g>
                    )
                  }}
                  height={50}
                />
                <YAxis tick={{ fontSize: 11 }} label={{ value: "Days", angle: -90, position: "insideLeft" }} domain={[0, (dataMax: number) => Math.ceil(dataMax) + 25]} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Days to 2nd Case">
                  <LabelList dataKey="avg" position="top" style={{ fontSize: 9, fill: "#3b82f6" }} />
                </Bar>
                <Bar dataKey="median" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Median Days to 2nd Case">
                  <LabelList dataKey="median" position="top" style={{ fontSize: 9, fill: "#8b5cf6" }} />
                </Bar>
                <Bar dataKey="max" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Max Days to 2nd Case">
                  <LabelList dataKey="max" position="top" style={{ fontSize: 9, fill: "#f59e0b" }} />
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </ChartContainer>
          <div className="absolute" style={{ bottom: '20px', left: '60px', right: '20px', height: '30px' }}>
            <div className="flex h-full">
              {Object.entries(groupedData).map(([year, quarters], yearIdx) => {
                const yearWidth = (quarters.length / sortedData.length) * 100
                const isLast = yearIdx === Object.keys(groupedData).length - 1
                return (
                  <div key={year} className="relative text-center" style={{ width: `${yearWidth}%` }}>
                    {!isLast && (
                      <div className="absolute right-0 top-[-20px] h-16 border-r-2 border-dashed border-gray-400" />
                    )}
                    <div className="text-xs font-bold text-gray-700 mt-3">{year}</div>
                  </div>
                )
              })}
            </div>
          </div>
        </div>
        <div className="flex justify-center mt-3">
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
              <SheetTitle className="text-lg font-semibold">Time to Surgeon's 2nd Case - Full Data</SheetTitle>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Calculation:</strong> For each surgeon, calculate days between 1st and 2nd case. 
                Avg = Average of all surgeons' times. Median = Middle value. Max = Longest time. Grouped by quarter.
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
                  <th className="text-right p-3 font-medium">Avg Days</th>
                  <th className="text-right p-3 font-medium">Median Days</th>
                  <th className="text-right p-3 font-medium">Max Days</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-3 text-muted-foreground">{index + 1}</td>
                    <td className="p-3 font-medium text-gray-900">{item.quarter}</td>
                    <td className="p-3 text-right font-medium">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
                        {item.avg}
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium">
                      <span className="inline-block px-2 py-1 bg-purple-100 text-purple-800 rounded font-semibold">
                        {item.median}
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium">
                      <span className="inline-block px-2 py-1 bg-orange-100 text-orange-800 rounded font-semibold">
                        {item.max}
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
