"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Users, Calendar, TrendingUp, Maximize2, X, Download } from "lucide-react"

export function GracePeriodCard({ surgeons, surgeonDetails }: { surgeons: string[], surgeonDetails?: { surgeon: string, firstCaseDate: string, daysSince: number }[] }) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const handleExport = () => {
    const headers = ['Surgeon', 'First Case Date', 'Days Since First Case']
    const rows = surgeonDetails?.map(item => [item.surgeon, item.firstCaseDate, item.daysSince]) || surgeons.map(s => [s, '', ''])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'grace-period-surgeons.csv'
    a.click()
  }

  return (
    <>
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-cyan-600" />
              Grace Period Surgeons
            </CardTitle>
            <p className="text-xs text-muted-foreground mt-1">First case within last 45 days</p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-cyan-100 text-cyan-800 rounded-full">
              <Calendar className="h-3.5 w-3.5" />
              <span className="text-sm font-semibold">{surgeons.length} Surgeons</span>
            </div>
            {surgeons.length > 0 && (
              <Button variant="outline" size="sm" className="h-8" onClick={() => setDrawerOpen(true)}>
                <Maximize2 className="h-3 w-3 mr-1" />
                See All
              </Button>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {surgeons.length > 0 ? (
          <div className="grid grid-cols-2 gap-3">
            {surgeons.map((surgeon, index) => (
              <div 
                key={index} 
                className="flex items-center gap-3 p-3 bg-gradient-to-r from-cyan-50 to-blue-50 border border-cyan-200 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-shrink-0 w-8 h-8 bg-cyan-600 text-white rounded-full flex items-center justify-center font-semibold text-sm">
                  {index + 1}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{surgeon}</p>
                  <p className="text-xs text-gray-500 flex items-center gap-1">
                    <TrendingUp className="h-3 w-3" />
                    New Surgeon
                  </p>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Users className="h-12 w-12 text-gray-300 mx-auto mb-3" />
            <p className="text-sm text-muted-foreground">No surgeons in grace period</p>
            <p className="text-xs text-muted-foreground mt-1">All surgeons have been active for more than 45 days</p>
          </div>
        )}
      </CardContent>
    </Card>

    <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
      <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto bg-white p-0">
        <SheetHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10">
          <div className="flex items-start justify-between">
            <div>
              <SheetTitle className="text-lg font-semibold">Grace Period Surgeons - Full Data</SheetTitle>
              <p className="text-sm text-muted-foreground mt-2">
                <strong>Calculation:</strong> Surgeons whose first case was performed within the last 45 days. Days Since = (Today - First Case Date).
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
                  <th className="text-right p-3 font-medium">First Case Date</th>
                  <th className="text-right p-3 font-medium">Days Since First Case</th>
                </tr>
              </thead>
              <tbody className="bg-white">
                {surgeonDetails?.map((item, index) => (
                  <tr key={index} className="border-t hover:bg-muted/50 transition-colors">
                    <td className="p-3 font-medium text-gray-900">{index + 1}</td>
                    <td className="p-3 font-medium text-gray-900">{item.surgeon}</td>
                    <td className="p-3 text-right font-medium">
                      <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">
                        {new Date(item.firstCaseDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </td>
                    <td className="p-3 text-right font-medium">
                      <span className="inline-block px-2 py-1 bg-cyan-100 text-cyan-800 rounded font-semibold">
                        {item.daysSince} days
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
