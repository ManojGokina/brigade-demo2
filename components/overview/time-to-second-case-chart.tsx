"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, LabelList, Legend, CartesianGrid } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Maximize2, X, Download } from "lucide-react"

export function TimeToSecondCase({ data, sites, selectedSite, onSiteChange }: { 
  data: any[], 
  sites: string[], 
  selectedSite: string, 
  onSiteChange: (value: string) => void 
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleExport = () => {
    const headers = ['Site', 'Avg Days', 'Median Days', 'Max Days']
    const rows = data.map(item => [
      item.site,
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

  return (
    <>
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Time to Surgeon's 2nd Case (Days, QoQ)</CardTitle>
            <p className="text-xs text-muted-foreground">Avg / Median / Max times by site</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#3b82f6]" />
                <span className="text-xs text-muted-foreground">Avg</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                <span className="text-xs text-muted-foreground">Max</span>
              </div>
            </div>
            <Select value={selectedSite} onValueChange={onSiteChange}>
              <SelectTrigger className="w-[140px] h-8 text-xs border-gray-300 focus:border-gray-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Sites</SelectItem>
                {sites.map((s) => (
                  <SelectItem key={s} value={s}>{s}</SelectItem>
                ))}
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
        <ChartContainer config={{}} className="h-[300px] w-full">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
            <XAxis dataKey="site" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} label={{ value: "Days", angle: -90, position: "insideLeft" }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Legend />
            <Bar dataKey="avg" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Avg Days to 2nd Case">
              <LabelList dataKey="avg" position="top" style={{ fontSize: 9, fill: "#3b82f6" }} />
            </Bar>
            <Bar dataKey="max" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Max Days to 2nd Case">
              <LabelList dataKey="max" position="top" style={{ fontSize: 9, fill: "#f59e0b" }} />
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
              <SheetTitle className="text-lg font-semibold">Time to Surgeon's 2nd Case - Full Data</SheetTitle>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Calculation:</strong> For each surgeon, calculate days between 1st and 2nd case. 
                Avg = Average of all surgeons' times. Median = Middle value. Max = Longest time. 
                Grouped by site/center.
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
              <span className="font-semibold">Site:</span>
              <span>{selectedSite === "all" ? "All Sites" : selectedSite}</span>
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
                  <th className="text-left p-3 font-medium">#</th>
                  <th className="text-left p-3 font-medium">Site</th>
                  <th className="text-right p-3 font-medium">Avg Days</th>
                  <th className="text-right p-3 font-medium">Median Days</th>
                  <th className="text-right p-3 font-medium">Max Days</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-3 text-muted-foreground">{index + 1}</td>
                    <td className="p-3 font-medium text-gray-900">{item.site}</td>
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
