"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { DateRange } from "@/components/ui/date-range-picker"
import casesData from "@/data/cases.json"
import { QoQGrowthProgression } from "@/components/overview/qoq-growth-charts"
import { CasesByRegion } from "@/components/overview/region-specialty-charts"
import { ProductivityByUserType } from "@/components/overview/productivity-by-user-type-chart"
import { TimeToSecondCase } from "@/components/overview/time-to-second-case-chart"
import { SurgeonsBySpecialty, SurgeonsByCaseLoad } from "@/components/overview/surgeon-demographic-charts"
import { TopPerformersTable } from "@/components/overview/top-performers-table"
import { SurgeonProductivityOverTime } from "@/components/overview/surgeon-productivity-chart"
import { DaysToCaseMilestones, DaysBetweenCases } from "@/components/overview/milestone-charts"
import { SecondCaseBooking } from "@/components/overview/second-case-booking-chart"
import { StatsCards } from "@/components/overview/stats-cards"
import { useStatsStore } from "@/store/stats.store"
import { TimeActiveInactive, TimeNormalized } from "@/components/overview/time-metrics-charts"
import { SurvivalTime } from "@/components/overview/survival-time-chart"
import { GracePeriodCard } from "@/components/overview/milestone-cards"
import { TimeMilestonesTable } from "@/components/overview/time-milestones-table"

export default function OverviewPage() {
  const [dateRange, setDateRange] = useState<DateRange>({})
  const [caseFilter, setCaseFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [surgeonFilter, setSurgeonFilter] = useState<string[]>([])
  const [regionFilter, setRegionFilter] = useState<string[]>([])
  const [specialtyFilter, setSpecialtyFilter] = useState<string[]>([])
  const [caseTypeFilter, setCaseTypeFilter] = useState<string[]>([])
  const [neuromaFilter, setNeuromaFilter] = useState<string[]>([])
  const [topPerformersView, setTopPerformersView] = useState<string>("productivity")
  const [topPerformersRegion, setTopPerformersRegion] = useState<string[]>([])
  const [topPerformersSpecialty, setTopPerformersSpecialty] = useState<string[]>([])
  const [secondCaseExcludeDays, setSecondCaseExcludeDays] = useState<string>("0")
  const [secondCaseStatus, setSecondCaseStatus] = useState<string[]>([])
  const [secondCaseBreakdown, setSecondCaseBreakdown] = useState<string>("overall")
  const [timeUnit, setTimeUnit] = useState<string>("days")
  const [qoqYear, setQoqYear] = useState<string[]>([new Date().getFullYear().toString()])
  const [qoqSurgeon, setQoqSurgeon] = useState<string[]>([])
  const [qoqRegion, setQoqRegion] = useState<string[]>([])
  const [qoqSpecialty, setQoqSpecialty] = useState<string[]>([])
  const [daysToCaseSurgeon, setDaysToCaseSurgeon] = useState<string[]>([])
  const [daysBetweenCasesSurgeon, setDaysBetweenCasesSurgeon] = useState<string[]>([])
  const [survivalTimeSurgeon, setSurvivalTimeSurgeon] = useState<string[]>([])
  const [survivalTimeSpecialty, setSurvivalTimeSpecialty] = useState<string[]>([])
  const [timeNormalizedSurgeon, setTimeNormalizedSurgeon] = useState<string[]>([])
  const [regionChartRegion, setRegionChartRegion] = useState<string[]>([])
  const [regionChartView, setRegionChartView] = useState<string>("cases")
  const [timeToSecondCaseSurgeon, setTimeToSecondCaseSurgeon] = useState<string[]>([])
  const [timeMilestonesSurgeon, setTimeMilestonesSurgeon] = useState<string[]>([])
  const [timeMilestonesYear, setTimeMilestonesYear] = useState<string[]>([new Date().getFullYear().toString()])
  const [productivityUserType, setProductivityUserType] = useState<string[]>([])

  const { data: statsData, isLoading: statsLoading, fetch: fetchStats, casesOverTime, casesOverTimeLoading, fetchCasesOverTime: fetchCasesOverTimeData, topPerformers, topPerformersLoading, fetchTopPerformers: fetchTopPerformersData, daysToMilestones, daysToMilestonesLoading, fetchDaysToMilestones: fetchDaysToMilestonesData, gracePeriodSurgeons: gracePeriodData, gracePeriodLoading, fetchGracePeriodSurgeons: fetchGracePeriodData, timeMilestones, timeMilestonesLoading, fetchTimeMilestones: fetchTimeMilestonesData, qoqGrowth, qoqGrowthLoading, fetchQoQGrowth: fetchQoQGrowthData, timeMetrics, timeMetricsLoading, fetchTimeMetrics: fetchTimeMetricsData } = useStatsStore()

  useEffect(() => {
    fetchTimeMilestonesData({
      startDate: dateRange.from,
      endDate: dateRange.to,
      surgeons: timeMilestonesSurgeon.length > 0 ? timeMilestonesSurgeon : undefined,
    })
  }, [dateRange, timeMilestonesSurgeon])

  // Fetch grace period surgeons once on mount
  useEffect(() => {
    fetchGracePeriodData()
  }, [])

  // Fetch stats on mount and when dateRange changes
  useEffect(() => {
    const params: Record<string, string> = {}
    if (dateRange.from) params.startDate = dateRange.from
    if (dateRange.to) params.endDate = dateRange.to
    if (dateRange.from || dateRange.to) {
      fetchStats({ period: 'custom', ...params })
    } else {
      fetchStats()
    }
  }, [dateRange])
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

  const sitesList = useMemo(() => {
    let filteredCases = casesData
    if (dateRange.from) filteredCases = filteredCases.filter((c: any) => c.operationDate >= dateRange.from!)
    if (dateRange.to) filteredCases = filteredCases.filter((c: any) => c.operationDate <= dateRange.to!)
    const sites = new Set(filteredCases.map((c: any) => c.site).filter(Boolean))
    return Array.from(sites).sort()
  }, [dateRange])

  const userTypesList = useMemo(() => {
    let filteredCases = casesData
    if (dateRange.from) filteredCases = filteredCases.filter((c: any) => c.operationDate >= dateRange.from!)
    if (dateRange.to) filteredCases = filteredCases.filter((c: any) => c.operationDate <= dateRange.to!)
    const userTypes = new Set(filteredCases.map((c: any) => c.userStatus).filter(Boolean))
    return Array.from(userTypes).sort()
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
    const currentYear = new Date().getFullYear()
    const years: string[] = []
    for (let year = 2024; year <= currentYear; year++) {
      years.push(year.toString())
    }
    return years
  }, [])

  useEffect(() => {
    fetchQoQGrowthData({
      startDate: dateRange.from,
      endDate: dateRange.to,
      surgeons: qoqSurgeon.length > 0 ? qoqSurgeon : undefined,
      regions: qoqRegion.length > 0 ? qoqRegion : undefined,
      specialties: qoqSpecialty.length > 0 ? qoqSpecialty : undefined,
      years: qoqYear.length > 0 ? qoqYear : undefined,
    })
  }, [dateRange, qoqSurgeon, qoqRegion, qoqSpecialty, qoqYear])

  const qoqGrowthData = qoqGrowth

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

  // Region Time Series Data
  const regionTimeSeriesData = useMemo(() => {
    if (regionChartRegion.length === 0) return []
    
    const monthlyData: Record<string, Record<string, { cases: number; surgeons: Set<string> }>> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.operationDate || !regionChartRegion.includes(c.region)) return
      const date = new Date(c.operationDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyData[monthKey]) monthlyData[monthKey] = {}
      if (!monthlyData[monthKey][c.region]) monthlyData[monthKey][c.region] = { cases: 0, surgeons: new Set() }
      monthlyData[monthKey][c.region].cases++
      if (c.surgeon) monthlyData[monthKey][c.region].surgeons.add(c.surgeon)
    })
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, regionData]) => {
        const result: any = {
          month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' })
        }
        regionChartRegion.forEach(region => {
          const data = regionData[region] || { cases: 0, surgeons: new Set() }
          result[`${region}_cases`] = data.cases
          result[`${region}_surgeons`] = data.surgeons.size
          result[`${region}_productivity`] = data.surgeons.size > 0 ? +(data.cases / data.surgeons.size).toFixed(1) : 0
        })
        return result
      })
  }, [regionChartRegion, filteredCasesData])

  // Productivity by User Type Data
  const productivityByUserTypeData = useMemo(() => {
    const quarterlyData: Record<string, Record<string, { cases: number; firstCases: number; months: Set<string>; [key: string]: any }>> = {}
    
    filteredCasesData.forEach((c: any) => {
      if (!c.operationDate || !c.userStatus) return
      if (productivityUserType.length > 0 && !productivityUserType.includes(c.userStatus)) return
      const date = new Date(c.operationDate)
      const year = date.getFullYear()
      const quarter = Math.floor(date.getMonth() / 3) + 1
      const quarterKey = `Q${quarter} ${year}`
      const monthKey = `${year}-${String(date.getMonth() + 1).padStart(2, '0')}`
      
      if (!quarterlyData[quarterKey]) quarterlyData[quarterKey] = {}
      if (!quarterlyData[quarterKey][c.userStatus]) {
        quarterlyData[quarterKey][c.userStatus] = { cases: 0, firstCases: 0, months: new Set() }
      }
      
      quarterlyData[quarterKey][c.userStatus].cases++
      quarterlyData[quarterKey][c.userStatus].months.add(monthKey)
      
      // Track first cases per surgeon
      const surgeonKey = `${c.surgeon}-${c.userStatus}`
      if (!quarterlyData[quarterKey][c.userStatus][surgeonKey]) {
        quarterlyData[quarterKey][c.userStatus][surgeonKey] = true
        quarterlyData[quarterKey][c.userStatus].firstCases++
      }
    })
    
    const result: any[] = []
    Object.entries(quarterlyData).forEach(([quarter, regions]) => {
      Object.entries(regions).forEach(([region, data]) => {
        const monthCount = data.months.size || 1
        const standard = +(data.cases / monthCount).toFixed(2)
        const excludingFirst = +((data.cases - data.firstCases) / monthCount).toFixed(2)
        result.push({
          quarter,
          region,
          label: `${quarter}\n${region}`,
          standard,
          excludingFirst
        })
      })
    })
    
    return result.sort((a, b) => {
      const [aQ, aY] = a.quarter.split(' ')
      const [bQ, bY] = b.quarter.split(' ')
      if (aY !== bY) return parseInt(aY) - parseInt(bY)
      if (aQ !== bQ) return aQ.localeCompare(bQ)
      return a.region.localeCompare(b.region)
    })
  }, [filteredCasesData, productivityUserType])

  // Time to Second Case Data
  const timeToSecondCaseData = useMemo(() => {
    const surgeonCases: Record<string, string[]> = {}
    
    filteredCasesData.forEach((c: any) => {
      if (!c.surgeon || !c.operationDate) return
      if (timeToSecondCaseSurgeon.length > 0 && !timeToSecondCaseSurgeon.includes(c.surgeon)) return
      
      if (!surgeonCases[c.surgeon]) {
        surgeonCases[c.surgeon] = []
      }
      surgeonCases[c.surgeon].push(c.operationDate)
    })
    
    const surgeonTimes = Object.entries(surgeonCases)
      .filter(([, dates]) => dates.length >= 2)
      .map(([surgeon, dates]) => {
        const sorted = dates.sort()
        const firstCaseDate = new Date(sorted[0])
        const days = Math.floor((new Date(sorted[1]).getTime() - firstCaseDate.getTime()) / (1000 * 60 * 60 * 24))
        const year = firstCaseDate.getFullYear()
        const quarter = Math.floor(firstCaseDate.getMonth() / 3) + 1
        const quarterKey = `Q${quarter} ${year}`
        return { surgeon, days, quarterKey, year, quarter }
      })
    
    // Group by quarter
    const quarterlyData: Record<string, { days: number[] }> = {}
    surgeonTimes.forEach(({ quarterKey, days }) => {
      if (!quarterlyData[quarterKey]) quarterlyData[quarterKey] = { days: [] }
      quarterlyData[quarterKey].days.push(days)
    })
    
    return Object.entries(quarterlyData)
      .map(([quarter, data]) => {
        const sorted = data.days.sort((a, b) => a - b)
        return {
          quarter,
          avg: Math.round(data.days.reduce((a, b) => a + b, 0) / data.days.length),
          median: sorted[Math.floor(sorted.length / 2)],
          max: Math.max(...data.days)
        }
      })
      .sort((a, b) => {
        const [qA, yearA] = a.quarter.split(' ')
        const [qB, yearB] = b.quarter.split(' ')
        if (yearA !== yearB) return parseInt(yearA) - parseInt(yearB)
        return qA.localeCompare(qB)
      })
  }, [filteredCasesData, timeToSecondCaseSurgeon])



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
    if (topPerformersRegion.length > 0) filteredCases = filteredCases.filter((c: any) => topPerformersRegion.includes(c.region))
    if (topPerformersSpecialty.length > 0) filteredCases = filteredCases.filter((c: any) => topPerformersSpecialty.includes(c.specialty))
    
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

  useEffect(() => {
    fetchTopPerformersData({
      startDate: dateRange.from,
      endDate: dateRange.to,
      regions: topPerformersRegion.length > 0 ? topPerformersRegion : undefined,
      specialties: topPerformersSpecialty.length > 0 ? topPerformersSpecialty : undefined,
    })
  }, [dateRange, topPerformersRegion, topPerformersSpecialty])

  // Combined Top Performers Data (kept for fallback, replaced by store)
  const topPerformersTableData = topPerformers

  // Days to Case Milestones (replaced by store)
  const daysToCaseMilestonesData = daysToMilestones

  useEffect(() => {
    fetchDaysToMilestonesData({
      startDate: dateRange.from,
      endDate: dateRange.to,
      surgeons: daysToCaseSurgeon.length > 0 ? daysToCaseSurgeon : undefined,
    })
  }, [dateRange, daysToCaseSurgeon])

  // Days Between Cases - Sequential for selected surgeon
  const daysBetweenCasesData = useMemo(() => {
    if (daysBetweenCasesSurgeon.length === 0) return []
    
    const surgeonCases: Record<string, string[]> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.surgeon || !c.operationDate) return
      if (daysBetweenCasesSurgeon.includes(c.surgeon)) {
        if (!surgeonCases[c.surgeon]) surgeonCases[c.surgeon] = []
        surgeonCases[c.surgeon].push(c.operationDate)
      }
    })
    
    if (daysBetweenCasesSurgeon.length === 1) {
      // Single surgeon - show sequential data
      const surgeon = daysBetweenCasesSurgeon[0]
      const dates = surgeonCases[surgeon]?.sort() || []
      if (dates.length === 0) return []
      
      const result = [{ caseNumber: "Case 1", days: 0, date: dates[0] }]
      for (let i = 1; i < dates.length; i++) {
        const days = Math.floor((new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / (1000 * 60 * 60 * 24))
        result.push({ caseNumber: `Case ${i + 1}`, days, date: dates[i] })
      }
      return result
    }
    
    // Multiple surgeons - show comparison
    const surgeonIntervals: Record<string, number[]> = {}
    daysBetweenCasesSurgeon.forEach(surgeon => {
      const dates = surgeonCases[surgeon]?.sort() || []
      if (dates.length === 0) return
      
      const intervals = [0]
      for (let i = 1; i < dates.length; i++) {
        intervals.push(Math.floor((new Date(dates[i]).getTime() - new Date(dates[i - 1]).getTime()) / (1000 * 60 * 60 * 24)))
      }
      surgeonIntervals[surgeon] = intervals
    })
    
    const maxLen = Math.max(...Object.values(surgeonIntervals).map(arr => arr.length), 0)
    if (maxLen === 0) return []
    
    const result = []
    for (let i = 0; i < maxLen; i++) {
      const row: any = { caseNumber: `Case ${i + 1}` }
      daysBetweenCasesSurgeon.forEach(surgeon => {
        row[surgeon] = surgeonIntervals[surgeon]?.[i] ?? null
      })
      result.push(row)
    }
    
    return result
  }, [daysBetweenCasesSurgeon, filteredCasesData])

  // Second Case Booking Data - Sequential
  const secondCaseBookingData = useMemo(() => {
    const excludeDays = parseInt(secondCaseExcludeDays)
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - excludeDays)
    
    if (secondCaseStatus.length === 0) {
      // No status filter - show overall data
      let surgeonCases: Record<string, any[]> = {}
      filteredCasesData.forEach((c: any) => {
        if (!c.surgeon || !c.operationDate) return
        if (!surgeonCases[c.surgeon]) surgeonCases[c.surgeon] = []
        surgeonCases[c.surgeon].push(c)
      })
      
      const eligibleSurgeons = Object.entries(surgeonCases).filter(([surgeon, cases]) => {
        const sorted = cases.sort((a, b) => a.operationDate.localeCompare(b.operationDate))
        return excludeDays === 0 || new Date(sorted[0].operationDate) < cutoffDate
      })
      
      if (secondCaseBreakdown === "overall") {
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
    }
    
    // Multiple status filters - calculate for each status
    const statusData: Record<string, Record<string, any[]>> = {}
    secondCaseStatus.forEach(status => {
      statusData[status] = {}
    })
    
    filteredCasesData.forEach((c: any) => {
      if (!c.surgeon || !c.operationDate || !c.userStatus) return
      if (!secondCaseStatus.includes(c.userStatus)) return
      if (!statusData[c.userStatus][c.surgeon]) statusData[c.userStatus][c.surgeon] = []
      statusData[c.userStatus][c.surgeon].push(c)
    })
    
    if (secondCaseBreakdown === "overall") {
      const result: any[] = []
      const maxCases = Math.max(...Object.values(statusData).flatMap(surgeons => 
        Object.values(surgeons).map(cases => cases.length)
      ), 0)
      
      for (let i = 2; i <= Math.min(maxCases, 10); i++) {
        const row: any = {
          category: `${i}${i === 2 ? 'nd' : i === 3 ? 'rd' : 'th'} Case`
        }
        
        secondCaseStatus.forEach(status => {
          const surgeons = statusData[status]
          const eligibleSurgeons = Object.entries(surgeons).filter(([surgeon, cases]) => {
            const sorted = cases.sort((a, b) => a.operationDate.localeCompare(b.operationDate))
            return excludeDays === 0 || new Date(sorted[0].operationDate) < cutoffDate
          })
          
          const surgeonsWithCase = eligibleSurgeons.filter(([, cases]) => cases.length >= i).length
          row[status] = eligibleSurgeons.length > 0 ? Math.round((surgeonsWithCase / eligibleSurgeons.length) * 100) : 0
        })
        
        result.push(row)
      }
      return result
    }
    
    const groupKey = secondCaseBreakdown === "userType" ? "userStatus" : secondCaseBreakdown === "region" ? "region" : "specialty"
    const categories = new Set<string>()
    
    Object.values(statusData).forEach(surgeons => {
      Object.values(surgeons).forEach(cases => {
        cases.forEach(c => categories.add(c[groupKey] || "Unknown"))
      })
    })
    
    return Array.from(categories).map(category => {
      const row: any = { category }
      
      secondCaseStatus.forEach(status => {
        const surgeons = statusData[status]
        const categorySurgeons: Record<string, any[]> = {}
        
        Object.entries(surgeons).forEach(([surgeon, cases]) => {
          const eligibleCases = cases.filter(c => (c[groupKey] || "Unknown") === category)
          if (eligibleCases.length > 0) {
            const sorted = eligibleCases.sort((a, b) => a.operationDate.localeCompare(b.operationDate))
            if (excludeDays === 0 || new Date(sorted[0].operationDate) < cutoffDate) {
              categorySurgeons[surgeon] = eligibleCases
            }
          }
        })
        
        const total = Object.keys(categorySurgeons).length
        const withSecond = Object.values(categorySurgeons).filter(cases => cases.length >= 2).length
        row[status] = total > 0 ? Math.round((withSecond / total) * 100) : 0
      })
      
      return row
    }).sort((a, b) => {
      const aTotal = secondCaseStatus.reduce((sum, s) => sum + (a[s] || 0), 0)
      const bTotal = secondCaseStatus.reduce((sum, s) => sum + (b[s] || 0), 0)
      return bTotal - aTotal
    })
  }, [secondCaseExcludeDays, secondCaseStatus, secondCaseBreakdown, filteredCasesData])



  useEffect(() => {
    fetchTimeMetricsData({
      startDate: dateRange.from,
      endDate: dateRange.to,
    })
  }, [dateRange])

  // Time Metrics & Milestones - convert days to selected unit
  const timeMetricsData = useMemo(() => {
    const convertTime = (days: number) => {
      if (timeUnit === "weeks") return Math.round(days / 7)
      if (timeUnit === "months") return Math.round(days / 30)
      return days
    }
    return timeMetrics.map((d) => ({
      ...d,
      timeActive: convertTime(d.timeActiveDays),
      timeInactive: convertTime(d.timeInactiveDays),
    }))
  }, [timeMetrics, timeUnit])
  const gracePeriodSurgeons = gracePeriodData.map((d: any) => d.surgeon)
  const gracePeriodDetails = gracePeriodData

  // Time Milestones Years
  const timeMilestonesYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years: string[] = []
    for (let year = 2024; year <= currentYear; year++) {
      years.push(year.toString())
    }
    return years.reverse()
  }, [])

  // Time Milestones (replaced by store)
  const timeMilestonesData = timeMilestones

  // Survival Time Data
  const survivalTimeData = useMemo(() => {
    const today = new Date()
    return filteredCasesData
      .filter((c: any) => {
        if (survivalTimeSurgeon.length > 0 && !survivalTimeSurgeon.includes(c.surgeon)) return false
        if (survivalTimeSpecialty.length > 0 && !survivalTimeSpecialty.includes(c.specialty)) return false
        return true
      })
      .map((c: any, index: number) => {
        const daysSince = c.operationDate ? Math.floor((today.getTime() - new Date(c.operationDate).getTime()) / (1000 * 60 * 60 * 24)) : null
        return {
          caseId: c.caseNumber || `Case-${index + 1}`,
          surgeon: c.surgeon || '',
          specialty: c.specialty || '',
          operationDate: c.operationDate || null,
          daysSinceSurgery: daysSince
        }
      })
      .sort((a, b) => {
        if (a.daysSinceSurgery === null) return 1
        if (b.daysSinceSurgery === null) return -1
        return b.daysSinceSurgery - a.daysSinceSurgery
      })
  }, [filteredCasesData, survivalTimeSurgeon, survivalTimeSpecialty])

  useEffect(() => {
    const sinceCaseMap: Record<string, number> = {
      'Since 2nd Case': 1, 'Since 3rd Case': 2, 'Since 4th Case': 3,
      'Since 5th Case': 4, 'Since 6th Case': 5,
    }
    const sinceCase = caseFilter.length > 0
      ? Math.max(...caseFilter.map((f: string) => sinceCaseMap[f] ?? 0))
      : undefined
    const neuromaVal = neuromaFilter.includes('Neuroma') && !neuromaFilter.includes('Non-Neuroma')
      ? 'neuroma' as const
      : neuromaFilter.includes('Non-Neuroma') && !neuromaFilter.includes('Neuroma')
      ? 'non-neuroma' as const
      : undefined
    fetchCasesOverTimeData({
      startDate: dateRange.from,
      endDate: dateRange.to,
      surgeons: surgeonFilter.length > 0 ? surgeonFilter : undefined,
      statuses: statusFilter.length > 0 ? statusFilter : undefined,
      regions: regionFilter.length > 0 ? regionFilter : undefined,
      specialties: specialtyFilter.length > 0 ? specialtyFilter : undefined,
      caseTypes: caseTypeFilter.length > 0 ? caseTypeFilter : undefined,
      neuroma: neuromaVal,
      sinceCase,
    })
  }, [dateRange, surgeonFilter, statusFilter, regionFilter, specialtyFilter, caseTypeFilter, neuromaFilter, caseFilter])

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

        <StatsCards data={statsData} isLoading={statsLoading} />

        <SurgeonProductivityOverTime 
          data={casesOverTime}
          isLoading={casesOverTimeLoading} 
          surgeons={surgeonsList}
          regions={regionsList}
          specialties={specialtiesList}
          surgeonFilter={surgeonFilter} 
          caseFilter={caseFilter} 
          statusFilter={statusFilter}
          regionFilter={regionFilter}
          specialtyFilter={specialtyFilter}
          caseTypeFilter={caseTypeFilter}
          neuromaFilter={neuromaFilter}
          onSurgeonChange={setSurgeonFilter} 
          onCaseFilterChange={setCaseFilter} 
          onStatusChange={setStatusFilter}
          onRegionChange={setRegionFilter}
          onSpecialtyChange={setSpecialtyFilter}
          onCaseTypeChange={setCaseTypeFilter}
          onNeuromaChange={setNeuromaFilter}
        />

        <TopPerformersTable 
          data={topPerformersTableData} 
          regions={regionsList} 
          specialties={specialtiesList} 
          viewType={topPerformersView} 
          regionFilter={topPerformersRegion} 
          specialtyFilter={topPerformersSpecialty} 
          isLoading={topPerformersLoading}
          onViewTypeChange={setTopPerformersView} 
          onRegionChange={setTopPerformersRegion} 
          onSpecialtyChange={setTopPerformersSpecialty} 
        />

        <div className="grid gap-4 md:grid-cols-2">
          <DaysToCaseMilestones 
            data={daysToCaseMilestonesData} 
            surgeons={surgeonsList} 
            surgeonFilter={daysToCaseSurgeon} 
            isLoading={daysToMilestonesLoading}
            onSurgeonChange={setDaysToCaseSurgeon} 
          />
          <TimeMilestonesTable 
            data={timeMilestonesData}
            surgeons={surgeonsList}
            years={timeMilestonesYears}
            surgeonFilter={timeMilestonesSurgeon}
            selectedYears={timeMilestonesYear}
            isLoading={timeMilestonesLoading}
            onSurgeonChange={setTimeMilestonesSurgeon}
            onYearsChange={setTimeMilestonesYear}
          />
        </div>

        <GracePeriodCard surgeons={gracePeriodSurgeons} surgeonDetails={gracePeriodDetails} isLoading={gracePeriodLoading} />

        <QoQGrowthProgression
          data={qoqGrowthData}
          isLoading={qoqGrowthLoading}
          years={qoqYears}
          selectedYears={qoqYear}
          surgeons={surgeonsList}
          surgeon={qoqSurgeon}
          regions={regionsList}
          specialties={specialtiesList}
          regionFilter={qoqRegion}
          specialtyFilter={qoqSpecialty}
          onYearsChange={setQoqYear}
          onSurgeonChange={setQoqSurgeon}
          onRegionChange={setQoqRegion}
          onSpecialtyChange={setQoqSpecialty}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <TimeActiveInactive data={timeMetricsData} timeUnit={timeUnit} onTimeUnitChange={setTimeUnit} />
          <TimeNormalized 
            data={timeNormalizedSurgeon.length > 0 ? timeMetricsData.filter((d: any) => timeNormalizedSurgeon.includes(d.surgeon)) : timeMetricsData}
            surgeons={surgeonsList}
            surgeonFilter={timeNormalizedSurgeon}
            rawCases={filteredCasesData}
            onSurgeonChange={setTimeNormalizedSurgeon}
          />
        </div>

        <DaysBetweenCases 
          data={daysBetweenCasesData} 
          surgeons={surgeonsList} 
          surgeonFilter={daysBetweenCasesSurgeon} 
          onSurgeonChange={setDaysBetweenCasesSurgeon} 
        />

        <SecondCaseBooking 
          data={secondCaseBookingData}
          rawCases={filteredCasesData}
          excludeDays={secondCaseExcludeDays} 
          statusFilter={secondCaseStatus} 
          breakdown={secondCaseBreakdown} 
          onExcludeDaysChange={setSecondCaseExcludeDays} 
          onStatusChange={setSecondCaseStatus} 
          onBreakdownChange={setSecondCaseBreakdown} 
        />

        <SurvivalTime 
          data={survivalTimeData} 
          surgeons={surgeonsList}
          specialties={specialtiesList}
          surgeonFilter={survivalTimeSurgeon}
          specialtyFilter={survivalTimeSpecialty}
          onSurgeonChange={setSurvivalTimeSurgeon}
          onSpecialtyChange={setSurvivalTimeSpecialty}
        />



        <CasesByRegion 
          data={casesByRegionData} 
          timeSeriesData={regionTimeSeriesData} 
          regions={regionsList} 
          selectedRegion={regionChartRegion} 
          viewType={regionChartView} 
          onRegionChange={setRegionChartRegion} 
          onViewTypeChange={setRegionChartView} 
        />

        <ProductivityByUserType 
          data={productivityByUserTypeData} 
          userTypes={userTypesList}
          userTypeFilter={productivityUserType}
          onUserTypeChange={setProductivityUserType}
        />

        <TimeToSecondCase 
          data={timeToSecondCaseData} 
          surgeons={surgeonsList} 
          selectedSurgeon={timeToSecondCaseSurgeon} 
          onSurgeonChange={setTimeToSecondCaseSurgeon} 
        />

        <div className="grid gap-4 md:grid-cols-2">
          <SurgeonsBySpecialty data={surgeonsBySpecialtyData} />
          <SurgeonsByCaseLoad data={surgeonsByCaseLoadData} />
        </div>
       
      </div>
    </ProtectedRoute>
  )
}
