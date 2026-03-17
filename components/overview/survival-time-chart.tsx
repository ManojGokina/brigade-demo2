"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { MultiSelect } from "@/components/ui/multi-select"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet"
import { Skeleton } from "@/components/ui/skeleton"
import { Maximize2, X, Download } from "lucide-react"

export function SurvivalTime({
  data,
  surgeons,
  specialties,
  surgeonFilter,
  specialtyFilter,
  isLoading,
  onSurgeonChange,
  onSpecialtyChange,
}: {
  data: any[]
  surgeons: string[]
  specialties: string[]
  surgeonFilter: string[]
  specialtyFilter: string[]
  isLoading?: boolean
  onSurgeonChange: (value: string[]) => void
  onSpecialtyChange: (value: string[]) => void
}) {
  const [drawerOpen, setDrawerOpen] = useState(false)

  const top10Data = data.slice(0, 10)
  const validCases = data.filter(item => item.daysSinceSurgery !== null)
  const averageDays = validCases.length > 0
    ? Math.round(validCases.reduce((sum, item) => sum + item.daysSinceSurgery, 0) / validCases.length)
    : 0

  const handleExport = () => {
    const headers = ['Case ID', 'Surgeon', 'Specialty', 'Operation Date', 'Days Since Surgery']
    const rows = data.map(item => [item.caseId, item.surgeon, item.specialty, item.operationDate, item.daysSinceSurgery])
    const csv = [headers, ...rows].map(row => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'survival-time.csv'
    a.click()
  }

  const TableSkeleton = ({ rows = 10 }: { rows?: number }) => (
    <div className="border rounded-lg overflow-hidden">
      <table className="w-full text-xs">
        <thead className="bg-muted">
          <tr>
            {['Case ID', 'Surgeon', 'Specialty', 'Operation Date', 'Days Since'].map(h => (
              <th key={h} className="text-left p-2 font-medium">{h}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: rows }).map((_, i) => (
            <tr key={i} className="border-t">
              <td className="p-2"><Skeleton className="h-4 w-20" /></td>
              <td className="p-2"><Skeleton className="h-4 w-28" /></td>
              <td className="p-2"><Skeleton className="h-4 w-20" /></td>
              <td className="p-2"><Skeleton className="h-4 w-24" /></td>
              <td className="p-2"><Skeleton className="h-5 w-12 rounded" /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )

  return (
    <>
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-sm font-medium">Survival Time</CardTitle>
              <p className="text-xs text-muted-foreground">Days since surgery per case</p>
            </div>
            <div className="flex gap-2">
              <MultiSelect
                options={surgeons}
                selected={surgeonFilter}
                onChange={onSurgeonChange}
                placeholder="All Surgeons"
                className="w-[150px] border-gray-300 focus:border-gray-500"
                maxCount={10}
              />
              <MultiSelect
                options={specialties}
                selected={specialtyFilter}
                onChange={onSpecialtyChange}
                placeholder="All Specialties"
                className="w-[150px] border-gray-300 focus:border-gray-500"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <TableSkeleton rows={10} />
          ) : (
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full text-xs">
                <thead className="bg-muted">
                  <tr>
                    <th className="text-left p-2 font-medium">Case ID</th>
                    <th className="text-left p-2 font-medium">Surgeon</th>
                    <th className="text-left p-2 font-medium">Specialty</th>
                    <th className="text-right p-2 font-medium">Operation Date</th>
                    <th className="text-right p-2 font-medium">Days Since</th>
                  </tr>
                </thead>
                <tbody>
                  {top10Data.map((item, index) => (
                    <tr key={index} className="border-t hover:bg-muted/50">
                      <td className="p-2">{item.caseId}</td>
                      <td className="p-2 font-medium">{item.surgeon || '-'}</td>
                      <td className="p-2">{item.specialty || '-'}</td>
                      <td className="p-2 text-right">{item.operationDate ? new Date(item.operationDate).toLocaleDateString() : '-'}</td>
                      <td className="p-2 text-right">
                        {item.daysSinceSurgery !== null ? (
                          <span className="inline-block px-2 py-0.5 bg-cyan-100 text-cyan-800 rounded text-xs font-semibold">
                            {item.daysSinceSurgery}
                          </span>
                        ) : (
                          <span className="text-muted-foreground">-</span>
                        )}
                      </td>
                    </tr>
                  ))}
                  <tr className="border-t bg-muted font-bold">
                    <td colSpan={3} className="p-2" />
                    <td className="p-2 text-right">Total Cases:</td>
                    <td className="p-2 text-right">
                      <span className="inline-block px-2 py-0.5 bg-blue-100 text-blue-800 rounded text-xs font-semibold">{data.length}</span>
                    </td>
                  </tr>
                  <tr className="bg-muted font-bold">
                    <td colSpan={3} className="p-2" />
                    <td className="p-2 text-right">Avg Days:</td>
                    <td className="p-2 text-right">
                      <span className="inline-block px-2 py-0.5 bg-green-100 text-green-800 rounded text-xs font-semibold">{averageDays}</span>
                    </td>
                  </tr>
                </tbody>
              </table>
              {data.length > 10 && (
                <div className="bg-muted/50 px-3 py-2 text-xs text-center border-t">
                  Showing 10 of {data.length} cases •{' '}
                  <button onClick={() => setDrawerOpen(true)} className="text-primary hover:underline font-medium">
                    View all {data.length}
                  </button>
                </div>
              )}
            </div>
          )}
          {!isLoading && data.length > 0 && (
            <div className="mt-3 flex justify-center">
              <button
                onClick={() => setDrawerOpen(true)}
                className="text-sm text-primary hover:text-primary/80 hover:underline font-bold flex items-center gap-1.5 transition-colors"
              >
                <Maximize2 className="h-4 w-4" />
                View Detailed Table
              </button>
            </div>
          )}
        </CardContent>
      </Card>

      <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
        <SheetContent side="right" className="w-full sm:max-w-4xl overflow-y-auto bg-white p-0">
          <SheetHeader className="px-6 py-4 border-b bg-white sticky top-0 z-10">
            <div className="flex items-start justify-between">
              <div>
                <SheetTitle className="text-lg font-semibold">Survival Time - Full Data</SheetTitle>
                <p className="text-sm text-muted-foreground mt-2">
                  Days since surgery calculated as (Today − Operation Date) for each case.
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
                <span>{surgeonFilter.length === 0 ? 'All Surgeons' : surgeonFilter.join(', ')}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-purple-100 text-purple-800 px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="font-semibold">Specialty:</span>
                <span>{specialtyFilter.length === 0 ? 'All Specialties' : specialtyFilter.join(', ')}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-orange-100 text-orange-800 px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="font-semibold">Total Cases:</span>
                <span>{data.length}</span>
              </div>
              <div className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 px-3 py-1.5 rounded-full text-xs font-medium">
                <span className="font-semibold">Avg Days:</span>
                <span>{averageDays}</span>
              </div>
            </div>
            <div className="mb-3 flex justify-end">
              <Button onClick={handleExport} size="sm" variant="outline" className="gap-2">
                <Download className="h-4 w-4" />
                Export CSV
              </Button>
            </div>
            {isLoading ? (
              <div className="space-y-2">
                {Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-10 w-full" />)}
              </div>
            ) : (
              <div className="border rounded-lg overflow-hidden shadow-lg bg-white">
                <table className="w-full text-sm bg-white">
                  <thead className="bg-muted">
                    <tr>
                      <th className="text-left p-3 font-medium">#</th>
                      <th className="text-left p-3 font-medium">Case ID</th>
                      <th className="text-left p-3 font-medium">Surgeon</th>
                      <th className="text-left p-3 font-medium">Specialty</th>
                      <th className="text-right p-3 font-medium">Operation Date</th>
                      <th className="text-right p-3 font-medium">Days Since Surgery</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white">
                    {data.map((item, index) => (
                      <tr key={index} className="border-t hover:bg-muted/50 transition-colors">
                        <td className="p-3 text-muted-foreground">{index + 1}</td>
                        <td className="p-3 font-medium">{item.caseId}</td>
                        <td className="p-3 font-medium text-gray-900">{item.surgeon || '-'}</td>
                        <td className="p-3">{item.specialty || '-'}</td>
                        <td className="p-3 text-right">{item.operationDate ? new Date(item.operationDate).toLocaleDateString() : '-'}</td>
                        <td className="p-3 text-right">
                          {item.daysSinceSurgery !== null ? (
                            <span className="inline-block px-2 py-1 bg-cyan-100 text-cyan-800 rounded font-semibold">
                              {item.daysSinceSurgery}
                            </span>
                          ) : (
                            <span className="text-muted-foreground">-</span>
                          )}
                        </td>
                      </tr>
                    ))}
                    <tr className="border-t bg-muted font-bold">
                      <td colSpan={4} className="p-3" />
                      <td className="p-3 text-right">Total Cases:</td>
                      <td className="p-3 text-right">
                        <span className="inline-block px-2 py-1 bg-blue-100 text-blue-800 rounded font-semibold">{data.length}</span>
                      </td>
                    </tr>
                    <tr className="bg-muted font-bold">
                      <td colSpan={4} className="p-3" />
                      <td className="p-3 text-right">Avg Days:</td>
                      <td className="p-3 text-right">
                        <span className="inline-block px-2 py-1 bg-green-100 text-green-800 rounded font-semibold">{averageDays}</span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  )
}
