"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Maximize2, X } from "lucide-react"

export function SurvivalTime({ data, surgeons, surgeonFilter, onSurgeonChange }: { 
  data: any[], 
  surgeons: string[], 
  surgeonFilter: string, 
  onSurgeonChange: (value: string) => void 
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)
  
  // Show top 10 in chart, all in drawer
  const top10Data = data.slice(0, 10)

  return (
    <>
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Survival Time (Days from Surgery Date)</CardTitle>
            <p className="text-xs text-muted-foreground">Average days since surgery per surgeon</p>
          </div>
          <div className="flex gap-2">
            {/* <Select value={surgeonFilter} onValueChange={onSurgeonChange}>
              <SelectTrigger className="w-[150px] h-8 text-xs border-gray-300 focus:border-gray-500">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Surgeons</SelectItem>
                {surgeons.map((surgeon) => (
                  <SelectItem key={surgeon} value={surgeon}>{surgeon}</SelectItem>
                ))}
              </SelectContent>
            </Select> */}
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
              label={{ value: "Days", angle: -90, position: "insideLeft", style: { fontSize: 12, fontWeight: 500, fill: "#000" } }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="avgDays" fill="#1d99ac" radius={[4, 4, 0, 0]} name="Avg Days" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>

    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto bg-white p-0">
        <SheetHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-lg font-semibold">Survival Time - Full Data</SheetTitle>
              <p className="text-sm text-muted-foreground mt-2">
                Average days since surgery date (operationDate) to today. Calculated as: (Today - Surgery Date) / Number of cases per surgeon.
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
              <span className="font-semibold">Surgeon:</span>
              <span>{surgeonFilter === "all" ? "All Surgeons" : surgeonFilter}</span>
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
                  <th className="text-right p-3 font-medium">Avg Days Since Surgery</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {data.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-3 text-muted-foreground">{index + 1}</td>
                    <td className="p-3 font-medium text-gray-900">{item.surgeon}</td>
                    <td className="p-3 text-right font-medium">
                      <span className="inline-block px-2 py-1 bg-cyan-100 text-cyan-800 rounded font-semibold">
                        {item.avgDays}
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
