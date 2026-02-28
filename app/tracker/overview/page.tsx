"use client"

import { useState, useMemo } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { DateRange } from "@/components/ui/date-range-picker"
import casesData from "@/data/cases.json"
import { QoQGrowthProgression } from "@/components/overview/qoq-growth-charts"
import { ProductivityByUserType, TimeToSecondCase } from "@/components/overview/productivity-charts"
import { CasesByRegion, SurgeonsBySpecialty, SurgeonsByCaseLoad } from "@/components/overview/region-specialty-charts"
import { TopPerformersTable } from "@/components/overview/top-performers-table"
import { SurgeonProductivityOverTime } from "@/components/overview/surgeon-productivity-chart"
import { DaysToCaseMilestones, DaysBetweenCases } from "@/components/overview/milestone-charts"
import { SecondCaseBooking } from "@/components/overview/second-case-booking-chart"
import { StatsCards } from "@/components/overview/stats-cards"
import { TimeActiveInactive, TimeNormalized, TimeMilestones, GracePeriodStatus } from "@/components/overview/time-metrics-charts"
import { SurvivalTime } from "@/components/overview/survival-time-chart"

export default function OverviewPage() {
  const [dateRange, setDateRange] = useState<DateRange>({})
  const [caseFilter, setCaseFilter] = useState<string>("all")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [surgeonFilter, setSurgeonFilter] = useState<string>("all")
  const [topPerformersView, setTopPerformersView] = useState<string>("caseLoad")
  const [topPerformersRegion, setTopPerformersRegion] = useState<string>("all")
  const [topPerformersSpecialty, setTopPerformersSpecialty] = useState<string>("all")
  const [secondCaseExcludeDays, setSecondCaseExcludeDays] = useState<string>("0")
  const [secondCaseStatus, setSecondCaseStatus] = useState<string>("all")
  const [secondCaseBreakdown, setSecondCaseBreakdown] = useState<string>("overall")
  const [timeUnit, setTimeUnit] = useState<string>("days")
  const [qoqYear, setQoqYear] = useState<string>(new Date().getFullYear().toString())
  const [daysToCaseSurgeon, setDaysToCaseSurgeon] = useState<string>("all")
  const [daysBetweenCasesSurgeon, setDaysBetweenCasesSurgeon] = useState<string>("all")

  // Get unique surgeons, regions, specialties
  const surgeonsList = useMemo(() => {
    let filteredCases = casesData
    if (dateRange.from) filteredCases = filteredCases.filter((c: any) => c.operationDate >= dateRange.from!)
    if (dateRange.to) filteredCases = filteredCases.filter((c: any) => c.operationDate <= dateRange.to!)
    const surgeons = new Set(filteredCases.map((c: any) => c.surgeon).filter(Boolean))
    return Array.from(surgeons).sort()
  }, [dateRange])

  const regionsList = useMemo(() => {
    let filteredCases = casesData
    if (dateRange.from) filteredCases = filteredCases.filter((c: any) => c.operationDate >= dateRange.from!)
    if (dateRange.to) filteredCases = filteredCases.filter((c: any) => c.operationDate <= dateRange.to!)
    const regions = new Set(filteredCases.map((c: any) => c.region).filter(Boolean))
    return Array.from(regions).sort()
  }, [dateRange])

  const specialtiesList = useMemo(() => {
    let filteredCases = casesData
    if (dateRange.from) filteredCases = filteredCases.filter((c: any) => c.operationDate >= dateRange.from!)
    if (dateRange.to) filteredCases = filteredCases.filter((c: any) => c.operationDate <= dateRange.to!)
    const specialties = new Set(filteredCases.map((c: any) => c.specialty).filter(Boolean))
    return Array.from(specialties).sort()
  }, [dateRange])

  // Filtered cases data based on date range
  const filteredCasesData = useMemo(() => {
    let filtered = casesData
    if (dateRange.from) filtered = filtered.filter((c: any) => c.operationDate >= dateRange.from!)
    if (dateRange.to) filtered = filtered.filter((c: any) => c.operationDate <= dateRange.to!)
    return filtered
  }, [dateRange])

  // QoQ Growth Data
  const qoqYears = useMemo(() => {
    const years = new Set<number>()
    filteredCasesData.forEach((c: any) => {
      if (c.operationDate) years.add(new Date(c.operationDate).getFullYear())
    })
    const currentYear = new Date().getFullYear()
    return Array.from(years).filter(y => y <= currentYear).sort().map(String)
  }, [filteredCasesData])

  const qoqGrowthData = useMemo(() => {
    const quarterlyData: Record<string, { cases: number; surgeons: Set<string> }> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.operationDate) return
      const date = new Date(c.operationDate)
      const year = date.getFullYear()
      if (year.toString() !== qoqYear) return
      const quarter = Math.floor(date.getMonth() / 3) + 1
      const quarterKey = `${year} - ${quarter}`
      if (!quarterlyData[quarterKey]) quarterlyData[quarterKey] = { cases: 0, surgeons: new Set() }
      quarterlyData[quarterKey].cases++
      if (c.surgeon) quarterlyData[quarterKey].surgeons.add(c.surgeon)
    })
    
    const allQuarters = [`${qoqYear} - 1`, `${qoqYear} - 2`, `${qoqYear} - 3`, `${qoqYear} - 4`]
    return allQuarters.map(quarter => ({
      quarter,
      cases: quarterlyData[quarter]?.cases || 0,
      surgeons: quarterlyData[quarter]?.surgeons.size || 0,
      productivity: quarterlyData[quarter] ? +(quarterlyData[quarter].cases / quarterlyData[quarter].surgeons.size).toFixed(2) : 0
    }))
  }, [qoqYear, filteredCasesData])

  // Cases by Region
  const casesByRegionData = useMemo(() => {
    const regionData: Record<string, { cases: number; surgeons: Set<string> }> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.region) return
      if (!regionData[c.region]) regionData[c.region] = { cases: 0, surgeons: new Set() }
      regionData[c.region].cases++
      if (c.surgeon) regionData[c.region].surgeons.add(c.surgeon)
    })
    return Object.entries(regionData).map(([region, data]) => ({
      region,
      cases: data.cases,
      surgeons: data.surgeons.size
    }))
  }, [filteredCasesData])

  // Productivity by User Type
  const productivityByUserTypeData = useMemo(() => {
    const quarterlyUserData: Record<string, Record<string, { cases: number; surgeons: Set<string> }>> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.operationDate || !c.userStatus) return
      const date = new Date(c.operationDate)
      const quarter = `Q${Math.floor(date.getMonth() / 3) + 1}`
      if (!quarterlyUserData[quarter]) quarterlyUserData[quarter] = {}
      if (!quarterlyUserData[quarter][c.userStatus]) quarterlyUserData[quarter][c.userStatus] = { cases: 0, surgeons: new Set() }
      quarterlyUserData[quarter][c.userStatus].cases++
      if (c.surgeon) quarterlyUserData[quarter][c.userStatus].surgeons.add(c.surgeon)
    })
    return Object.entries(quarterlyUserData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-4)
      .map(([quarter, userData]) => ({
        quarter,
        EST: userData.EST ? +(userData.EST.cases / userData.EST.surgeons.size).toFixed(1) : 0,
        IN: userData.IN ? +(userData.IN.cases / userData.IN.surgeons.size).toFixed(1) : 0,
        VAL: userData.VAL ? +(userData.VAL.cases / userData.VAL.surgeons.size).toFixed(1) : 0
      }))
  }, [filteredCasesData])

  // Surgeons by Specialty
  const surgeonsBySpecialtyData = useMemo(() => {
    const specialtyData: Record<string, Set<string>> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.specialty || !c.surgeon) return
      if (!specialtyData[c.specialty]) specialtyData[c.specialty] = new Set()
      specialtyData[c.specialty].add(c.surgeon)
    })
    return Object.entries(specialtyData).map(([name, surgeons]) => ({ name, value: surgeons.size }))
  }, [filteredCasesData])

  // Surgeons by Case Load
  const surgeonsByCaseLoadData = useMemo(() => {
    const surgeonCases: Record<string, number> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.surgeon) return
      surgeonCases[c.surgeon] = (surgeonCases[c.surgeon] || 0) + 1
    })
    const ranges = { "1-5 cases": 0, "6-10 cases": 0, "11-20 cases": 0, "21+ cases": 0 }
    Object.values(surgeonCases).forEach(count => {
      if (count <= 5) ranges["1-5 cases"]++
      else if (count <= 10) ranges["6-10 cases"]++
      else if (count <= 20) ranges["11-20 cases"]++
      else ranges["21+ cases"]++
    })
    return Object.entries(ranges).map(([name, value]) => ({ name, value }))
  }, [filteredCasesData])

  // Top 10 by Case Load
  const top10ByCaseLoadData = useMemo(() => {
    let filteredCases = filteredCasesData
    if (topPerformersRegion !== "all") filteredCases = filteredCases.filter((c: any) => c.region === topPerformersRegion)
    if (topPerformersSpecialty !== "all") filteredCases = filteredCases.filter((c: any) => c.specialty === topPerformersSpecialty)
    
    const surgeonCases: Record<string, number> = {}
    filteredCases.forEach((c: any) => {
      if (!c.surgeon) return
      surgeonCases[c.surgeon] = (surgeonCases[c.surgeon] || 0) + 1
    })
    return Object.entries(surgeonCases)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, cases]) => ({ name, cases }))
  }, [topPerformersRegion, topPerformersSpecialty, filteredCasesData])

  // Top 10 by Neuroma Cases
  const top10ByNeuromaData = useMemo(() => {
    const surgeonNeuroma: Record<string, number> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.surgeon || !c.isNeuromaCase) return
      surgeonNeuroma[c.surgeon] = (surgeonNeuroma[c.surgeon] || 0) + 1
    })
    return Object.entries(surgeonNeuroma)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 10)
      .map(([name, cases]) => ({ name, cases }))
  }, [filteredCasesData])

  // Top 10 by Productivity
  const top10ByProductivityData = useMemo(() => {
    const surgeonData: Record<string, { cases: number; months: Set<string> }> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.surgeon || !c.operationDate) return
      if (!surgeonData[c.surgeon]) surgeonData[c.surgeon] = { cases: 0, months: new Set() }
      surgeonData[c.surgeon].cases++
      const monthKey = c.operationDate.substring(0, 7)
      surgeonData[c.surgeon].months.add(monthKey)
    })
    return Object.entries(surgeonData)
      .map(([name, data]) => ({ name, productivity: +(data.cases / data.months.size).toFixed(1) }))
      .sort((a, b) => b.productivity - a.productivity)
      .slice(0, 10)
  }, [filteredCasesData])

  // Combined Top Performers Data
  const topPerformersTableData = useMemo(() => {
    let filteredCases = filteredCasesData
    if (topPerformersRegion !== "all") filteredCases = filteredCases.filter((c: any) => c.region === topPerformersRegion)
    if (topPerformersSpecialty !== "all") filteredCases = filteredCases.filter((c: any) => c.specialty === topPerformersSpecialty)

    const surgeonStats: Record<string, { totalCases: number; neuromaCases: number; region: string; specialty: string; months: Set<string> }> = {}
    
    filteredCases.forEach((c: any) => {
      if (!c.surgeon) return
      if (!surgeonStats[c.surgeon]) {
        surgeonStats[c.surgeon] = {
          totalCases: 0,
          neuromaCases: 0,
          region: c.region || "Unknown",
          specialty: c.specialty || "Unknown",
          months: new Set()
        }
      }
      surgeonStats[c.surgeon].totalCases++
      if (c.isNeuromaCase) surgeonStats[c.surgeon].neuromaCases++
      if (c.operationDate) {
        const monthKey = c.operationDate.substring(0, 7)
        surgeonStats[c.surgeon].months.add(monthKey)
      }
    })

    return Object.entries(surgeonStats).map(([surgeon, stats], index) => ({
      rank: index + 1,
      surgeon,
      totalCases: stats.totalCases,
      neuromaCases: stats.neuromaCases,
      region: stats.region,
      specialty: stats.specialty,
      productivity: stats.months.size > 0 ? +(stats.totalCases / stats.months.size) : 0
    }))
  }, [topPerformersRegion, topPerformersSpecialty, filteredCasesData])

  // Days to Case Milestones
  const daysToCaseMilestonesData = useMemo(() => {
    const surgeonCases: Record<string, string[]> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.surgeon || !c.operationDate) return
      if (daysToCaseSurgeon !== "all" && c.surgeon !== daysToCaseSurgeon) return
      if (!surgeonCases[c.surgeon]) surgeonCases[c.surgeon] = []
      surgeonCases[c.surgeon].push(c.operationDate)
    })
    
    const milestones = [2, 3, 6, 10]
    return milestones.map(milestone => {
      const days: number[] = []
      Object.values(surgeonCases).forEach(dates => {
        if (dates.length >= milestone) {
          const sorted = dates.sort()
          const daysDiff = Math.floor((new Date(sorted[milestone - 1]).getTime() - new Date(sorted[0]).getTime()) / (1000 * 60 * 60 * 24))
          days.push(daysDiff)
        }
      })
      const avg = days.length > 0 ? Math.round(days.reduce((a, b) => a + b, 0) / days.length) : 0
      const median = days.length > 0 ? days.sort((a, b) => a - b)[Math.floor(days.length / 2)] : 0
      return { milestone: `${milestone}${milestone === 2 ? 'nd' : milestone === 3 ? 'rd' : 'th'} Case`, avg, median }
    })
  }, [daysToCaseSurgeon, filteredCasesData])

  // Days Between Cases - Sequential for selected surgeon
  const daysBetweenCasesData = useMemo(() => {
    if (daysBetweenCasesSurgeon === "all") return []
    
    const surgeonCases = filteredCasesData
      .filter((c: any) => c.surgeon === daysBetweenCasesSurgeon && c.operationDate)
      .map((c: any) => c.operationDate)
      .sort()
    
    if (surgeonCases.length < 1) return []
    
    const result = [
      {
        caseNumber: "Case 1",
        days: 0,
        date: surgeonCases[0]
      }
    ]
    
    for (let i = 1; i < surgeonCases.length; i++) {
      const days = Math.floor((new Date(surgeonCases[i]).getTime() - new Date(surgeonCases[i - 1]).getTime()) / (1000 * 60 * 60 * 24))
      result.push({
        caseNumber: `Case ${i + 1}`,
        days,
        date: surgeonCases[i]
      })
    }
    return result
  }, [daysBetweenCasesSurgeon, filteredCasesData])

  // Second Case Booking Data - Sequential
  const secondCaseBookingData = useMemo(() => {
    const excludeDays = parseInt(secondCaseExcludeDays)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - excludeDays)
    
    let surgeonCases: Record<string, any[]> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.surgeon || !c.operationDate) return
      if (secondCaseStatus !== "all" && c.userStatus !== secondCaseStatus) return
      if (!surgeonCases[c.surgeon]) surgeonCases[c.surgeon] = []
      surgeonCases[c.surgeon].push(c)
    })
    
    // Filter surgeons based on exclude days
    const eligibleSurgeons = Object.entries(surgeonCases).filter(([surgeon, cases]) => {
      const sorted = cases.sort((a, b) => a.operationDate.localeCompare(b.operationDate))
      return excludeDays === 0 || new Date(sorted[0].operationDate) < cutoffDate
    })
    
    if (secondCaseBreakdown === "overall") {
      // Sequential: Show % who reached 2nd, 3rd, 4th, etc. case
      const maxCases = Math.max(...eligibleSurgeons.map(([, cases]) => cases.length))
      const result = []
      
      for (let i = 2; i <= Math.min(maxCases, 10); i++) {
        const surgeonsWithCase = eligibleSurgeons.filter(([, cases]) => cases.length >= i).length
        const percentage = eligibleSurgeons.length > 0 ? Math.round((surgeonsWithCase / eligibleSurgeons.length) * 100) : 0
        result.push({
          category: `${i}${i === 2 ? 'nd' : i === 3 ? 'rd' : 'th'} Case`,
          percentage
        })
      }
      return result
    }
    
    // Breakdown by type/region/specialty
    const groupKey = secondCaseBreakdown === "userType" ? "userStatus" : secondCaseBreakdown === "region" ? "region" : "specialty"
    const grouped: Record<string, Record<string, any[]>> = {}
    
    eligibleSurgeons.forEach(([surgeon, cases]) => {
      cases.forEach(c => {
        const key = c[groupKey] || "Unknown"
        if (!grouped[key]) grouped[key] = {}
        if (!grouped[key][surgeon]) grouped[key][surgeon] = []
        grouped[key][surgeon].push(c)
      })
    })
    
    return Object.entries(grouped).map(([category, surgeons]) => {
      let total = Object.keys(surgeons).length
      let withSecond = Object.values(surgeons).filter(cases => cases.length >= 2).length
      return { category, percentage: total > 0 ? Math.round((withSecond / total) * 100) : 0 }
    }).sort((a, b) => b.percentage - a.percentage)
  }, [secondCaseExcludeDays, secondCaseStatus, secondCaseBreakdown, filteredCasesData])

  // Time to Second Case (QoQ)
  const timeToSecondCaseData = useMemo(() => {
    const quarterlyData: Record<string, number[]> = {}
    const surgeonCases: Record<string, any[]> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.surgeon || !c.operationDate) return
      if (!surgeonCases[c.surgeon]) surgeonCases[c.surgeon] = []
      surgeonCases[c.surgeon].push(c)
    })
    
    Object.values(surgeonCases).forEach(cases => {
      if (cases.length >= 2) {
        const sorted = cases.sort((a, b) => a.operationDate.localeCompare(b.operationDate))
        const date = new Date(sorted[1].operationDate)
        const quarter = `Q${Math.floor(date.getMonth() / 3) + 1}`
        const days = Math.floor((new Date(sorted[1].operationDate).getTime() - new Date(sorted[0].operationDate).getTime()) / (1000 * 60 * 60 * 24))
        if (!quarterlyData[quarter]) quarterlyData[quarter] = []
        quarterlyData[quarter].push(days)
      }
    })
    
    return Object.entries(quarterlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-4)
      .map(([quarter, days]) => ({
        quarter,
        avg: Math.round(days.reduce((a, b) => a + b, 0) / days.length),
        median: days.sort((a, b) => a - b)[Math.floor(days.length / 2)],
        max: Math.max(...days)
      }))
  }, [filteredCasesData])

  // Time Metrics & Milestones (placeholder - complex calculations)
  const timeMetricsData = useMemo(() => {
    const surgeonData: Record<string, { firstCase: string; lastCase: string }> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.surgeon || !c.operationDate) return
      if (!surgeonData[c.surgeon]) {
        surgeonData[c.surgeon] = { firstCase: c.operationDate, lastCase: c.operationDate }
      } else {
        if (c.operationDate < surgeonData[c.surgeon].firstCase) surgeonData[c.surgeon].firstCase = c.operationDate
        if (c.operationDate > surgeonData[c.surgeon].lastCase) surgeonData[c.surgeon].lastCase = c.operationDate
      }
    })
    
    const today = new Date()
    const convertTime = (days: number) => {
      if (timeUnit === "weeks") return Math.round(days / 7)
      if (timeUnit === "months") return Math.round(days / 30)
      return days
    }
    
    return Object.entries(surgeonData)
      .map(([surgeon, dates]) => {
        const firstCaseDate = new Date(dates.firstCase)
        const lastCaseDate = new Date(dates.lastCase)
        const timeActiveDays = Math.floor((today.getTime() - firstCaseDate.getTime()) / (1000 * 60 * 60 * 24))
        const timeInactiveDays = Math.floor((today.getTime() - lastCaseDate.getTime()) / (1000 * 60 * 60 * 24))
        return {
          surgeon,
          timeActive: convertTime(timeActiveDays),
          timeInactive: convertTime(timeInactiveDays),
          monthsSince1st: 0,
          monthsSince2nd: 0
        }
      })
      .sort((a, b) => b.timeActive - a.timeActive)
      .slice(0, 10)
  }, [timeUnit, filteredCasesData])
  const timeMilestonesData = useMemo(() => [], [])
  const gracePeriodData = useMemo(() => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 45)
    const surgeonFirstCase: Record<string, string> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.surgeon || !c.operationDate) return
      if (!surgeonFirstCase[c.surgeon] || c.operationDate < surgeonFirstCase[c.surgeon]) {
        surgeonFirstCase[c.surgeon] = c.operationDate
      }
    })
    let inGrace = 0, pastGrace = 0
    Object.values(surgeonFirstCase).forEach(date => {
      if (new Date(date) >= cutoffDate) inGrace++
      else pastGrace++
    })
    return [{ status: "In Grace Period", count: inGrace }, { status: "Past Grace Period", count: pastGrace }]
  }, [filteredCasesData])

  // Survival Time Data
  const survivalTimeData = useMemo(() => {
    const surgeonData: Record<string, number[]> = {}
    const today = new Date()
    filteredCasesData.forEach((c: any) => {
      if (!c.surgeon || !c.operationDate) return
      if (!surgeonData[c.surgeon]) surgeonData[c.surgeon] = []
      const daysSince = Math.floor((today.getTime() - new Date(c.operationDate).getTime()) / (1000 * 60 * 60 * 24))
      surgeonData[c.surgeon].push(daysSince)
    })
    return Object.entries(surgeonData)
      .map(([surgeon, days]) => ({
        surgeon,
        avgDays: Math.round(days.reduce((a, b) => a + b, 0) / days.length)
      }))
      .sort((a, b) => b.avgDays - a.avgDays)
      .slice(0, 10)
  }, [filteredCasesData])

  // Calculate Surgeon Productivity Over Time from real data
  const surgeonProductivityOverTimeData = useMemo(() => {
    let filteredCases = casesData.filter((c: any) => c.operationDate)

    // Apply surgeon filter
    if (surgeonFilter !== "all") {
      filteredCases = filteredCases.filter((c: any) => c.surgeon === surgeonFilter)
    }

    // Apply date range filter
    if (dateRange.from) {
      filteredCases = filteredCases.filter((c: any) => c.operationDate >= dateRange.from!)
    }
    if (dateRange.to) {
      filteredCases = filteredCases.filter((c: any) => c.operationDate <= dateRange.to!)
    }

    // Apply user status filter
    if (statusFilter !== "all") {
      filteredCases = filteredCases.filter((c: any) => c.userStatus === statusFilter)
    }

    // Group by month
    const monthlyData: Record<string, number> = {}
    filteredCases.forEach((c: any) => {
      const date = new Date(c.operationDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      monthlyData[monthKey] = (monthlyData[monthKey] || 0) + 1
    })

    // Convert to array and sort by date
    const sortedData = Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, cases]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        cases
      }))

    // Apply case number filter
    if (caseFilter === "since1st") {
      return sortedData
    } else if (caseFilter === "since2nd" && sortedData.length > 1) {
      return sortedData.slice(1)
    } else if (caseFilter === "since3rd" && sortedData.length > 2) {
      return sortedData.slice(2)
    } else if (caseFilter === "since4th" && sortedData.length > 3) {
      return sortedData.slice(3)
    } else if (caseFilter === "since5th" && sortedData.length > 4) {
      return sortedData.slice(4)
    } else if (caseFilter === "since6th" && sortedData.length > 5) {
      return sortedData.slice(5)
    }

    return sortedData
  }, [dateRange, caseFilter, statusFilter, surgeonFilter])

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
            <p className="text-sm text-muted-foreground">Quarterly analytics and surgeon performance metrics</p>
          </div>
          <div className="flex gap-2 items-center">
            <DateRangePicker
              value={dateRange}
              onChange={setDateRange}
              placeholder="Select Date Range"
            />
            {(dateRange.from || dateRange.to) && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => setDateRange({})}
                className="h-9"
              >
                Clear
              </Button>
            )}
          </div>
        </div>

        <StatsCards data={filteredCasesData} />

        <SurgeonProductivityOverTime 
          data={surgeonProductivityOverTimeData} 
          surgeons={surgeonsList} 
          surgeonFilter={surgeonFilter} 
          caseFilter={caseFilter} 
          statusFilter={statusFilter} 
          onSurgeonChange={setSurgeonFilter} 
          onCaseFilterChange={setCaseFilter} 
          onStatusChange={setStatusFilter} 
        />

        <div className="grid gap-4 md:grid-cols-2">
          <DaysToCaseMilestones 
            data={daysToCaseMilestonesData} 
            surgeons={surgeonsList} 
            surgeonFilter={daysToCaseSurgeon} 
            onSurgeonChange={setDaysToCaseSurgeon} 
          />
          <DaysBetweenCases 
            data={daysBetweenCasesData} 
            surgeons={surgeonsList} 
            surgeonFilter={daysBetweenCasesSurgeon} 
            onSurgeonChange={setDaysBetweenCasesSurgeon} 
          />
        </div>

        <TopPerformersTable 
          data={topPerformersTableData} 
          regions={regionsList} 
          specialties={specialtiesList} 
          viewType={topPerformersView} 
          regionFilter={topPerformersRegion} 
          specialtyFilter={topPerformersSpecialty} 
          onViewTypeChange={setTopPerformersView} 
          onRegionChange={setTopPerformersRegion} 
          onSpecialtyChange={setTopPerformersSpecialty} 
        />

        <SecondCaseBooking 
          data={secondCaseBookingData} 
          excludeDays={secondCaseExcludeDays} 
          statusFilter={secondCaseStatus} 
          breakdown={secondCaseBreakdown} 
          onExcludeDaysChange={setSecondCaseExcludeDays} 
          onStatusChange={setSecondCaseStatus} 
          onBreakdownChange={setSecondCaseBreakdown} 
        />

        <div className="grid gap-4 md:grid-cols-2">
          <TimeActiveInactive data={timeMetricsData} timeUnit={timeUnit} onTimeUnitChange={setTimeUnit} />
          <TimeNormalized data={timeMetricsData} />
        </div>

        <QoQGrowthProgression data={qoqGrowthData} year={qoqYear} years={qoqYears} onYearChange={setQoqYear} />

        <div className="grid gap-4 md:grid-cols-2">
          <ProductivityByUserType data={productivityByUserTypeData} />
          <TimeToSecondCase data={timeToSecondCaseData} />
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <CasesByRegion data={casesByRegionData} />
          <SurgeonsBySpecialty data={surgeonsBySpecialtyData} />
          <SurgeonsByCaseLoad data={surgeonsByCaseLoadData} />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <TimeMilestones data={timeMilestonesData} />
          <GracePeriodStatus data={gracePeriodData} />
        </div>

        <SurvivalTime data={survivalTimeData} />
      </div>
    </ProtectedRoute>
  )
}
