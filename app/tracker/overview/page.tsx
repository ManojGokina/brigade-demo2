"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell, LineChart, Line, ResponsiveContainer, AreaChart, Area } from "recharts"
import { ProtectedRoute } from "@/components/protected-route"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { DateRange } from "@/components/ui/date-range-picker"

const COLORS = ["#1d99ac", "#10b981", "#f59e0b", "#ec4899", "#8b5cf6", "#84cc16", "#f97316", "#6366f1"]

// Dummy Data
const qoqGrowthData = [
  { quarter: "Q1 2024", cases: 45, surgeons: 12, productivity: 3.75 },
  { quarter: "Q2 2024", cases: 62, surgeons: 15, productivity: 4.13 },
  { quarter: "Q3 2024", cases: 78, surgeons: 18, productivity: 4.33 },
  { quarter: "Q4 2024", cases: 95, surgeons: 22, productivity: 4.32 },
]

const casesByRegionData = [
  { region: "Northeast", cases: 85, surgeons: 12 },
  { region: "Southeast", cases: 72, surgeons: 10 },
  { region: "Midwest", cases: 58, surgeons: 8 },
  { region: "West", cases: 65, surgeons: 9 },
]

const productivityByUserTypeData = [
  { quarter: "Q1", EST: 4.2, IN: 3.5, VAL: 4.8 },
  { quarter: "Q2", EST: 4.5, IN: 3.8, VAL: 5.1 },
  { quarter: "Q3", EST: 4.7, IN: 4.0, VAL: 5.3 },
  { quarter: "Q4", EST: 4.9, IN: 4.2, VAL: 5.5 },
]

const timeToSecondCaseData = [
  { quarter: "Q1", avg: 45, median: 38, max: 120 },
  { quarter: "Q2", avg: 42, median: 35, max: 110 },
  { quarter: "Q3", avg: 38, median: 32, max: 95 },
  { quarter: "Q4", avg: 35, median: 30, max: 85 },
]

const surgeonsBySpecialtyData = [
  { name: "Podiatry", value: 35 },
  { name: "Hand", value: 25 },
  { name: "Plastics", value: 20 },
  { name: "Vascular", value: 12 },
  { name: "Neurosurgery", value: 8 },
]

const surgeonsByCaseLoadData = [
  { name: "1-5 cases", value: 45 },
  { name: "6-10 cases", value: 28 },
  { name: "11-20 cases", value: 18 },
  { name: "21+ cases", value: 9 },
]

const top10ByCaseLoadData = [
  { name: "Dr. Smith", cases: 45 },
  { name: "Dr. Johnson", cases: 38 },
  { name: "Dr. Williams", cases: 35 },
  { name: "Dr. Brown", cases: 32 },
  { name: "Dr. Davis", cases: 28 },
  { name: "Dr. Miller", cases: 25 },
  { name: "Dr. Wilson", cases: 22 },
  { name: "Dr. Moore", cases: 20 },
  { name: "Dr. Taylor", cases: 18 },
  { name: "Dr. Anderson", cases: 15 },
]

const top10ByNeuromaData = [
  { name: "Dr. Williams", cases: 28 },
  { name: "Dr. Smith", cases: 25 },
  { name: "Dr. Johnson", cases: 22 },
  { name: "Dr. Brown", cases: 18 },
  { name: "Dr. Davis", cases: 15 },
  { name: "Dr. Miller", cases: 12 },
  { name: "Dr. Wilson", cases: 10 },
  { name: "Dr. Moore", cases: 8 },
  { name: "Dr. Taylor", cases: 7 },
  { name: "Dr. Anderson", cases: 5 },
]

const top10ByProductivityData = [
  { name: "Dr. Davis", productivity: 5.8 },
  { name: "Dr. Smith", productivity: 5.5 },
  { name: "Dr. Johnson", productivity: 5.2 },
  { name: "Dr. Williams", productivity: 4.9 },
  { name: "Dr. Brown", productivity: 4.7 },
  { name: "Dr. Miller", productivity: 4.5 },
  { name: "Dr. Wilson", productivity: 4.3 },
  { name: "Dr. Moore", productivity: 4.1 },
  { name: "Dr. Taylor", productivity: 3.9 },
  { name: "Dr. Anderson", productivity: 3.7 },
]

// New data for missing metrics
const surgeonProductivityOverTimeData = [
  { month: "Jan", cases: 12 },
  { month: "Feb", cases: 18 },
  { month: "Mar", cases: 15 },
  { month: "Apr", cases: 22 },
  { month: "May", cases: 28 },
  { month: "Jun", cases: 25 },
]

const daysToCaseMilestonesData = [
  { milestone: "2nd Case", avg: 35, median: 30 },
  { milestone: "3rd Case", avg: 52, median: 45 },
  { milestone: "6th Case", avg: 95, median: 82 },
  { milestone: "10th Case", avg: 145, median: 128 },
]

const secondCaseBookingData = [
  { category: "Overall", percentage: 68 },
  { category: "EST", percentage: 72 },
  { category: "IN", percentage: 58 },
  { category: "VAL", percentage: 85 },
  { category: "Podiatry", percentage: 75 },
  { category: "Hand", percentage: 65 },
]

const timeMetricsData = [
  { surgeon: "Dr. Smith", timeActive: 245, timeInactive: 12, monthsSince1st: 8, monthsSince2nd: 7 },
  { surgeon: "Dr. Johnson", timeActive: 198, timeInactive: 5, monthsSince1st: 6, monthsSince2nd: 5 },
  { surgeon: "Dr. Williams", timeActive: 312, timeInactive: 18, monthsSince1st: 10, monthsSince2nd: 9 },
  { surgeon: "Dr. Brown", timeActive: 156, timeInactive: 8, monthsSince1st: 5, monthsSince2nd: 4 },
  { surgeon: "Dr. Davis", timeActive: 278, timeInactive: 15, monthsSince1st: 9, monthsSince2nd: 8 },
]

const timeMilestonesData = [
  { surgeon: "Dr. Smith", monthsTo2PerMonth: 4, monthsTo2PerMonth3Consecutive: 6 },
  { surgeon: "Dr. Johnson", monthsTo2PerMonth: 3, monthsTo2PerMonth3Consecutive: 5 },
  { surgeon: "Dr. Williams", monthsTo2PerMonth: 5, monthsTo2PerMonth3Consecutive: 7 },
  { surgeon: "Dr. Brown", monthsTo2PerMonth: 6, monthsTo2PerMonth3Consecutive: 8 },
  { surgeon: "Dr. Davis", monthsTo2PerMonth: 4, monthsTo2PerMonth3Consecutive: 6 },
]

const gracePeriodData = [
  { status: "In Grace Period", count: 8 },
  { status: "Past Grace Period", count: 14 },
]

export default function OverviewPage() {
  const [dateRange, setDateRange] = useState<DateRange>({})

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
            <p className="text-sm text-muted-foreground">Quarterly analytics and surgeon performance metrics</p>
          </div>
          <DateRangePicker
            value={dateRange}
            onChange={setDateRange}
            placeholder="Select Date Range"
          />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
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
              <p className="text-3xl font-bold text-white">280</p>
              <p className="text-xs text-white/80 font-medium mt-1">↑ 12% from last quarter</p>
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
              <p className="text-3xl font-bold text-white">22</p>
              <p className="text-xs text-white/80 font-medium mt-1">↑ 4 new this quarter</p>
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
              <p className="text-3xl font-bold text-white">4.5</p>
              <p className="text-xs text-white/80 font-medium mt-1">↑ 0.3 from last quarter</p>
            </CardContent>
          </Card>
          <Card className="border-none bg-gradient-to-br from-[#ec4899] to-[#db2777] shadow-lg">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs font-medium text-white/90">Nerves Treated</p>
                <div className="h-8 w-8 rounded-lg bg-white/20 flex items-center justify-center">
                  <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
              </div>
              <p className="text-3xl font-bold text-white">1,260</p>
              <p className="text-xs text-white/80 font-medium mt-1">↑ 15% from last quarter</p>
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
              <p className="text-3xl font-bold text-white">18</p>
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
              <p className="text-3xl font-bold text-white">150</p>
              <p className="text-xs text-white/80 font-medium mt-1">53% of total</p>
            </CardContent>
          </Card>
        </div>

        {/* QoQ Growth */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">QoQ Case Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px] w-full">
                <AreaChart data={qoqGrowthData}>
                  <defs>
                    <linearGradient id="casesGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1d99ac" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#1d99ac" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="cases" stroke="#1d99ac" strokeWidth={2} fill="url(#casesGradient)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">QoQ Surgeon Growth</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px] w-full">
                <AreaChart data={qoqGrowthData}>
                  <defs>
                    <linearGradient id="surgeonsGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="surgeons" stroke="#10b981" strokeWidth={2} fill="url(#surgeonsGradient)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">QoQ Productivity</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[200px] w-full">
                <AreaChart data={qoqGrowthData}>
                  <defs>
                    <linearGradient id="productivityGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.8} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.1} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="productivity" stroke="#f59e0b" strokeWidth={2} fill="url(#productivityGradient)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Productivity by User Type & Time to 2nd Case */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Productivity by User Type (QoQ)</CardTitle>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#1d99ac]" />
                    <span className="text-xs text-muted-foreground">EST</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#10b981]" />
                    <span className="text-xs text-muted-foreground">IN</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                    <span className="text-xs text-muted-foreground">VAL</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[250px] w-full">
                <AreaChart data={productivityByUserTypeData}>
                  <defs>
                    <linearGradient id="estGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1d99ac" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#1d99ac" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="inGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="valGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="EST" stroke="#1d99ac" strokeWidth={2} fill="url(#estGradient)" />
                  <Area type="monotone" dataKey="IN" stroke="#10b981" strokeWidth={2} fill="url(#inGradient)" />
                  <Area type="monotone" dataKey="VAL" stroke="#f59e0b" strokeWidth={2} fill="url(#valGradient)" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">Time to Surgeon's 2nd Case (Days, QoQ)</CardTitle>
                <div className="flex gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#1d99ac]" />
                    <span className="text-xs text-muted-foreground">Average</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#10b981]" />
                    <span className="text-xs text-muted-foreground">Median</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                    <span className="text-xs text-muted-foreground">Max</span>
                  </div>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[250px] w-full">
                <AreaChart data={timeToSecondCaseData}>
                  <defs>
                    <linearGradient id="avgGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#1d99ac" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#1d99ac" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="medianGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#10b981" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#10b981" stopOpacity={0.05} />
                    </linearGradient>
                    <linearGradient id="maxGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#f59e0b" stopOpacity={0.6} />
                      <stop offset="100%" stopColor="#f59e0b" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Area type="monotone" dataKey="avg" stroke="#1d99ac" strokeWidth={2} fill="url(#avgGradient)" name="Average" />
                  <Area type="monotone" dataKey="median" stroke="#10b981" strokeWidth={2} fill="url(#medianGradient)" name="Median" />
                  <Area type="monotone" dataKey="max" stroke="#f59e0b" strokeWidth={2} fill="url(#maxGradient)" name="Max" />
                </AreaChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Cases per Region, Surgeons by Specialty, Surgeons by Case Load */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Cases per Region</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[250px] w-full">
                <BarChart data={casesByRegionData}>
                  <XAxis dataKey="region" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="cases" fill="#1d99ac" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Surgeons by Specialty</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[250px] w-full">
                <PieChart>
                  <Pie data={surgeonsBySpecialtyData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                    {surgeonsBySpecialtyData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Surgeons by Case Load</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[250px] w-full">
                <PieChart>
                  <Pie data={surgeonsByCaseLoadData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label>
                    {surgeonsByCaseLoadData.map((entry, index) => (
                      <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* Top 10 Lists */}
        <div className="grid gap-4 md:grid-cols-3">
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top 10 by Case Load</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px] w-full">
                <BarChart data={top10ByCaseLoadData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="cases" fill="#1d99ac" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top 10 by Neuroma Cases</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px] w-full">
                <BarChart data={top10ByNeuromaData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="cases" fill="#10b981" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Top 10 by Monthly Productivity</CardTitle>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[300px] w-full">
                <BarChart data={top10ByProductivityData} layout="vertical">
                  <XAxis type="number" tick={{ fontSize: 10 }} />
                  <YAxis dataKey="name" type="category" width={80} tick={{ fontSize: 10 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="productivity" fill="#f59e0b" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* NEW: Surgeon Productivity Over Time */}
        <Card className="border-border/50 bg-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Surgeon Productivity - Cases Performed Over Time</CardTitle>
            <p className="text-xs text-muted-foreground">Sliceable by date range, case number, and user status</p>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[250px] w-full">
              <LineChart data={surgeonProductivityOverTimeData}>
                <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <ChartTooltip content={<ChartTooltipContent />} />
                <Line type="monotone" dataKey="cases" stroke="#1d99ac" strokeWidth={2} />
              </LineChart>
            </ChartContainer>
          </CardContent>
        </Card>

        {/* NEW: Days to Case Milestones & Second Case Booking % */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Days to Case Milestones</CardTitle>
              <p className="text-xs text-muted-foreground">Average time to reach case milestones</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[250px] w-full">
                <BarChart data={daysToCaseMilestonesData}>
                  <XAxis dataKey="milestone" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="avg" fill="#1d99ac" radius={[4, 4, 0, 0]} name="Average" />
                  <Bar dataKey="median" fill="#10b981" radius={[4, 4, 0, 0]} name="Median" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">% of Surgeons Booking Second Cases</CardTitle>
              <p className="text-xs text-muted-foreground">Breakdown by type, region, and specialty</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[250px] w-full">
                <BarChart data={secondCaseBookingData}>
                  <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="percentage" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* NEW: Time Metrics - Active/Inactive/Normalized */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Time Active vs Inactive (Days)</CardTitle>
              <p className="text-xs text-muted-foreground">From first case and most recent case</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[250px] w-full">
                <BarChart data={timeMetricsData}>
                  <XAxis dataKey="surgeon" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="timeActive" fill="#10b981" radius={[4, 4, 0, 0]} name="Active" />
                  <Bar dataKey="timeInactive" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Inactive" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Time Normalized (Months)</CardTitle>
              <p className="text-xs text-muted-foreground">Months since 1st and 2nd case</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[250px] w-full">
                <BarChart data={timeMetricsData}>
                  <XAxis dataKey="surgeon" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="monthsSince1st" fill="#1d99ac" radius={[4, 4, 0, 0]} name="Since 1st Case" />
                  <Bar dataKey="monthsSince2nd" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Since 2nd Case" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>

        {/* NEW: Time Milestones & Grace Period */}
        <div className="grid gap-4 md:grid-cols-2">
          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Time Milestones (Months)</CardTitle>
              <p className="text-xs text-muted-foreground">Months to 2 cases/month and 3 consecutive months</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[250px] w-full">
                <BarChart data={timeMilestonesData}>
                  <XAxis dataKey="surgeon" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 11 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="monthsTo2PerMonth" fill="#ec4899" radius={[4, 4, 0, 0]} name="To 2/month" />
                  <Bar dataKey="monthsTo2PerMonth3Consecutive" fill="#f59e0b" radius={[4, 4, 0, 0]} name="To 3 consecutive" />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-card">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Grace Period Status</CardTitle>
              <p className="text-xs text-muted-foreground">Surgeons with first case in last 45 days</p>
            </CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-[250px] w-full">
                <PieChart>
                  <Pie data={gracePeriodData} cx="50%" cy="50%" outerRadius={80} dataKey="count" label>
                    <Cell fill="#10b981" />
                    <Cell fill="#f59e0b" />
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </div>
      </div>
    </ProtectedRoute>
  )
}
