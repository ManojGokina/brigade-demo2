"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  ResponsiveContainer,
  LineChart,
  Line,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
} from "recharts"

interface SurgeonData {
  name: string
  cases: number
  nerves: number
  primary: number
  revision: number
}

interface ChartData {
  name: string
  value: number
}

interface TimeSeriesData {
  name: string
  cases: number
  nerves: number
}

const COLORS = [
  "#1d99ac", // brand teal
  "#5cc6d4", // light teal
  "#0f7482", // deep teal
  "#10b981", // emerald green
  "#f59e0b", // amber
  "#ec4899", // pink
  "#8b5cf6", // violet
  "#84cc16", // lime
  "#f97316", // orange
  "#6366f1", // indigo
]

function getSurgeonColor(surgeonName: string, allSurgeons: string[]): string {
  const index = allSurgeons.indexOf(surgeonName)
  return COLORS[index % COLORS.length]
}

interface CasesByTypeChartProps {
  data: ChartData[]
}

export function CasesByTypeChart({ data }: CasesByTypeChartProps) {
  const chartConfig = {
    Primary: { label: "Primary", color: "var(--color-chart-1)" },
    Revision: { label: "Revision", color: "var(--color-chart-2)" },
    value: { label: "Count" },
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Cases by Type</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <span className="text-sm text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Cases by Type</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              innerRadius={50}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
              nameKey="name"
            >
              {data.map((entry, index) => (
                <Cell
                  key={`cell-${entry.name}`}
                  fill={COLORS[index % COLORS.length]}
                  stroke="transparent"
                />
              ))}
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
        <div className="mt-2 flex justify-center gap-4">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center gap-2">
              <div
                className="h-2.5 w-2.5 rounded-sm"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-xs text-muted-foreground">
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}

interface CasesBySpecialtyChartProps {
  data: ChartData[]
}

export function CasesBySpecialtyChart({ data }: CasesBySpecialtyChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Cases by Specialty</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <span className="text-sm text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    )
  }

  const chartConfig = data.reduce(
    (acc, item, index) => ({
      ...acc,
      [item.name]: { label: item.name, color: COLORS[index % COLORS.length] },
    }),
    { value: { label: "Count" } } as Record<string, { label: string; color?: string }>
  )

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Cases by Specialty</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={data} layout="vertical" margin={{ left: 0, right: 16 }}>
            <XAxis type="number" hide />
            <YAxis
              dataKey="name"
              type="category"
              tickLine={false}
              axisLine={false}
              width={85}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" radius={[0, 4, 4, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

interface CasesByTerritoryChartProps {
  data: ChartData[]
}

export function CasesByTerritoryChart({ data }: CasesByTerritoryChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Cases by Territory</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <span className="text-sm text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    )
  }

  const chartConfig = data.reduce(
    (acc, item, index) => ({
      ...acc,
      [item.name]: { label: item.name, color: COLORS[index % COLORS.length] },
    }),
    { value: { label: "Count" } } as Record<string, { label: string; color?: string }>
  )

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Cases by Territory</CardTitle>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <BarChart data={data} margin={{ left: 0, right: 16 }}>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 10 }}
              interval={0}
              angle={-45}
              textAnchor="end"
              height={60}
            />
            <YAxis hide />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {data.map((entry, index) => (
                <Cell key={`cell-${entry.name}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

interface CasesOverTimeChartProps {
  data: TimeSeriesData[]
}

export function CasesOverTimeChart({ data }: CasesOverTimeChartProps) {
  const chartConfig = {
    cases: { label: "Cases", color: "var(--color-chart-1)" },
    nerves: { label: "Nerves", color: "var(--color-chart-2)" },
  }

  if (!data || data.length === 0) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Cases Over Time</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <span className="text-sm text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium text-foreground">Cases Over Time</CardTitle>
          <div className="flex gap-3">
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#1d99ac" }} />
              <span className="text-xs text-muted-foreground">Cases</span>
            </div>
            <div className="flex items-center gap-1.5">
              <div className="h-2 w-2 rounded-full" style={{ backgroundColor: "#10b981" }} />
              <span className="text-xs text-muted-foreground">Nerves</span>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[200px] w-full">
          <AreaChart data={data} margin={{ left: 0, right: 0, top: 10, bottom: 0 }}>
            <defs>
              <linearGradient id="casesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1d99ac" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#1d99ac" stopOpacity={0.05} />
              </linearGradient>
              <linearGradient id="nervesGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#10b981" stopOpacity={0.4} />
                <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="name"
              tickLine={false}
              axisLine={false}
              tick={{ fill: "var(--color-muted-foreground)", fontSize: 11 }}
            />
            <YAxis hide />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area
              type="monotone"
              dataKey="cases"
              stroke="#1d99ac"
              fill="url(#casesGradient)"
              strokeWidth={2}
            />
            <Area
              type="monotone"
              dataKey="nerves"
              stroke="#10b981"
              fill="url(#nervesGradient)"
              strokeWidth={2}
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

interface ExtremityChartProps {
  data: ChartData[]
}

export function ExtremityChart({ data }: ExtremityChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Upper vs Lower Extremity</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <span className="text-sm text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    )
  }

  const total = data.reduce((sum, d) => sum + d.value, 0)

  if (total === 0) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Upper vs Lower Extremity</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <span className="text-sm text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Upper vs Lower Extremity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.map((item, index) => {
            const percentage = Math.round((item.value / total) * 100)
            return (
              <div key={item.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">{item.name}</span>
                  <span className="font-medium text-foreground">
                    {item.value} ({percentage}%)
                  </span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: COLORS[index % COLORS.length],
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

interface SurgeonProductivityChartProps {
  data: SurgeonData[]
  allSurgeons: string[]
}

export function SurgeonProductivityChart({ data, allSurgeons }: SurgeonProductivityChartProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Surgeon Productivity</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[300px] items-center justify-center">
          <span className="text-sm text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    )
  }

  const chartConfig = {
    cases: { label: "Cases", color: "#1d99ac" },
    nerves: { label: "Nerves", color: "#10b981" },
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Surgeon Productivity</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {data.slice(0, 6).map((surgeon, index) => {
            const maxCases = Math.max(...data.map(d => d.cases))
            const percentage = Math.round((surgeon.cases / maxCases) * 100)
            return (
              <div key={surgeon.name}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="font-medium text-foreground">{surgeon.name}</span>
                  <span className="text-muted-foreground">
                    {surgeon.cases} cases • {surgeon.nerves} nerves
                  </span>
                </div>
                <div className="h-3 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{
                      width: `${percentage}%`,
                      backgroundColor: getSurgeonColor(surgeon.name, allSurgeons),
                    }}
                  />
                </div>
              </div>
            )
          })}
        </div>
      </CardContent>
    </Card>
  )
}

interface TopPerformingSurgeonsProps {
  data: SurgeonData[]
  allSurgeons: string[]
}

export function TopPerformingSurgeons({ data, allSurgeons }: TopPerformingSurgeonsProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="border-border/50 bg-card">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-foreground">Top Performing Surgeons</CardTitle>
        </CardHeader>
        <CardContent className="flex h-[200px] items-center justify-center">
          <span className="text-sm text-muted-foreground">No data available</span>
        </CardContent>
      </Card>
    )
  }

  const topSurgeons = data.slice(0, 5)
  const pieData = topSurgeons.map(surgeon => ({ name: surgeon.name, value: surgeon.cases }))

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium text-foreground">Top Performing Surgeons</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <ChartContainer config={{}} className="h-[200px] w-[200px]">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                >
                  {pieData.map((entry, index) => (
                    <Cell
                      key={entry.name}
                      fill={getSurgeonColor(entry.name, allSurgeons)}
                      stroke="var(--color-background)"
                      strokeWidth={2}
                    />
                  ))}
                </Pie>
                <ChartTooltip 
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const surgeonData = topSurgeons.find(s => s.name === payload[0].name)
                      return (
                        <div className="rounded-lg border bg-background p-2 shadow-sm">
                          <p className="font-medium">{payload[0].name}</p>
                          <p className="text-sm text-muted-foreground">
                            {surgeonData?.cases} cases • {surgeonData?.nerves} nerves
                          </p>
                        </div>
                      )
                    }
                    return null
                  }}
                />
              </PieChart>
            </ChartContainer>
          </div>
          <div className="ml-4 space-y-2">
            {topSurgeons.map((surgeon, index) => (
              <div key={surgeon.name} className="flex items-center gap-2">
                <div 
                  className="h-3 w-3 rounded-full" 
                  style={{ backgroundColor: getSurgeonColor(surgeon.name, allSurgeons) }}
                />
                <div className="text-xs">
                  <p className="font-medium text-foreground">{surgeon.name}</p>
                  <p className="text-muted-foreground">{surgeon.cases} cases</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}