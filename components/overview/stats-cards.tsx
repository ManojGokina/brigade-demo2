import { StatsOverview } from "@/lib/stats-api"

const metrics = [
  {
    key: "totalCases",
    label: "Total Cases",
    sub: "Recorded",
    color: "text-[#1d99ac]",
    bg: "bg-[#1d99ac]/8",
    border: "border-[#1d99ac]/20",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    ),
  },
  {
    key: "activeSurgeons",
    label: "Surgeons",
    sub: "Active",
    color: "text-[#10b981]",
    bg: "bg-[#10b981]/8",
    border: "border-[#10b981]/20",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: "avgProductivity",
    label: "Avg Productivity",
    sub: "Cases / surgeon",
    color: "text-[#f59e0b]",
    bg: "bg-[#f59e0b]/8",
    border: "border-[#f59e0b]/20",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  {
    key: "activeSites",
    label: "Active Sites",
    sub: "All regions",
    color: "text-[#8b5cf6]",
    bg: "bg-[#8b5cf6]/8",
    border: "border-[#8b5cf6]/20",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
  },
  {
    key: "neuromaCases",
    label: "Neuroma Cases",
    subKey: "neuromaPercent",
    color: "text-[#06b6d4]",
    bg: "bg-[#06b6d4]/8",
    border: "border-[#06b6d4]/20",
    icon: (
      <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
      </svg>
    ),
  },
]

function SkeletonStrip() {
  return (
    <div className="flex items-stretch gap-0 rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
      {metrics.map((m, i) => (
        <div
          key={i}
          className={`flex-1 flex items-center gap-3 px-4 py-3 ${i < metrics.length - 1 ? "border-r border-border/40" : ""}`}
        >
          <div className="h-8 w-8 rounded-lg bg-muted animate-pulse shrink-0" />
          <div className="space-y-1.5 flex-1">
            <div className="h-2.5 w-16 bg-muted rounded animate-pulse" />
            <div className="h-5 w-10 bg-muted rounded animate-pulse" />
            <div className="h-2 w-20 bg-muted rounded animate-pulse" />
          </div>
        </div>
      ))}
    </div>
  )
}

export function StatsCards({ data, isLoading }: { data: StatsOverview; isLoading: boolean }) {
  if (isLoading) return <SkeletonStrip />

  return (
    <div className="flex items-stretch gap-0 rounded-xl border border-border/50 bg-card overflow-hidden shadow-sm">
      {metrics.map((m, i) => {
        const value = data[m.key as keyof StatsOverview] ?? 0
        const sub = m.subKey
          ? `${data[m.subKey as keyof StatsOverview] ?? 0}% of total`
          : m.sub

        return (
          <div
            key={m.key}
            className={`
              flex-1 flex items-center gap-3 px-4 py-3
              hover:bg-muted/40 transition-colors cursor-default
              ${i < metrics.length - 1 ? "border-r border-border/40" : ""}
            `}
          >
            <div className={`h-8 w-8 rounded-lg ${m.bg} border ${m.border} flex items-center justify-center shrink-0 ${m.color}`}>
              {m.icon}
            </div>
            <div className="min-w-0">
              <p className="text-[11px] font-medium text-muted-foreground leading-none mb-1 truncate">{m.label}</p>
              <p className={`text-xl font-bold leading-none ${m.color}`}>{value}</p>
              <p className="text-[10px] text-muted-foreground/70 mt-1 leading-none">{sub}</p>
            </div>
          </div>
        )
      })}
    </div>
  )
}
