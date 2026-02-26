import { Card, CardContent } from "@/components/ui/card"

export function StatsCards({ data }: { data: any[] }) {
  const totalCases = data.length
  const uniqueSurgeons = new Set(data.map((c: any) => c.surgeon).filter(Boolean)).size
  const neuromaCases = data.filter((c: any) => c.isNeuromaCase).length
  const uniqueSites = new Set(data.map((c: any) => c.site).filter(Boolean)).size
  
  const surgeonCases: Record<string, number> = {}
  data.forEach((c: any) => {
    if (c.surgeon) surgeonCases[c.surgeon] = (surgeonCases[c.surgeon] || 0) + 1
  })
  const avgProductivity = uniqueSurgeons > 0 ? +(totalCases / uniqueSurgeons).toFixed(1) : 0

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
      <Card className="border-none bg-gradient-to-br from-[#1d99ac] to-[#16818f] shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-white/90">Total Cases</p>
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{totalCases}</p>
          <p className="text-xs text-white/80 font-medium mt-1">Total recorded cases</p>
        </CardContent>
      </Card>
      
      <Card className="border-none bg-gradient-to-br from-[#10b981] to-[#059669] shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-white/90">Active Surgeons</p>
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{uniqueSurgeons}</p>
          <p className="text-xs text-white/80 font-medium mt-1">Unique surgeons</p>
        </CardContent>
      </Card>
      
      <Card className="border-none bg-gradient-to-br from-[#f59e0b] to-[#d97706] shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-white/90">Avg Productivity</p>
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{avgProductivity}</p>
          <p className="text-xs text-white/80 font-medium mt-1">Cases per surgeon</p>
        </CardContent>
      </Card>
      
      <Card className="border-none bg-gradient-to-br from-[#8b5cf6] to-[#7c3aed] shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-white/90">Active Sites</p>
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{uniqueSites}</p>
          <p className="text-xs text-white/80 font-medium mt-1">Across all regions</p>
        </CardContent>
      </Card>
      
      <Card className="border-none bg-gradient-to-br from-[#06b6d4] to-[#0891b2] shadow-lg">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-white/90">Neuroma Cases</p>
            <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
          </div>
          <p className="text-3xl font-bold text-white">{neuromaCases}</p>
          <p className="text-xs text-white/80 font-medium mt-1">{totalCases > 0 ? Math.round((neuromaCases / totalCases) * 100) : 0}% of total</p>
        </CardContent>
      </Card>
    </div>
  )
}
