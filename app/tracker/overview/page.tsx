"use client"

import { useState, useMemo } from "react"
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
import { TimeActiveInactive, TimeNormalized } from "@/components/overview/time-metrics-charts"
import { SurvivalTime } from "@/components/overview/survival-time-chart"
import { GracePeriodCard } from "@/components/overview/milestone-cards"
import { TimeMilestonesTable } from "@/components/overview/time-milestones-table"

export default function OverviewPage() {
  const [dateRange, setDateRange] = useState<DateRange>({})
  const [caseFilter, setCaseFilter] = useState<string[]>([])
  const [statusFilter, setStatusFilter] = useState<string[]>([])
  const [surgeonFilter, setSurgeonFilter] = useState<string[]>([])
  const [topPerformersView, setTopPerformersView] = useState<string>("caseLoad")
  const [topPerformersRegion, setTopPerformersRegion] = useState<string[]>([])
  const [topPerformersSpecialty, setTopPerformersSpecialty] = useState<string[]>([])
  const [secondCaseExcludeDays, setSecondCaseExcludeDays] = useState<string>("0")
  const [secondCaseStatus, setSecondCaseStatus] = useState<string[]>([])
  const [secondCaseBreakdown, setSecondCaseBreakdown] = useState<string>("overall")
  const [timeUnit, setTimeUnit] = useState<string>("days")
  const [qoqYear, setQoqYear] = useState<string[]>([new Date().getFullYear().toString()])
  const [qoqSurgeon, setQoqSurgeon] = useState<string[]>([])
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

  const sitesList = useMemo(() => {
    let filteredCases = casesData
    if (dateRange.from) filteredCases = filteredCases.filter((c: any) => c.operationDate >= dateRange.from!)
    if (dateRange.to) filteredCases = filteredCases.filter((c: any) => c.operationDate <= dateRange.to!)
    const sites = new Set(filteredCases.map((c: any) => c.site).filter(Boolean))
    return Array.from(sites).sort()
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

  const qoqGrowthData = useMemo(() => {
    let filteredCases = filteredCasesData
    if (qoqSurgeon.length > 0) {
      filteredCases = filteredCases.filter((c: any) => qoqSurgeon.includes(c.surgeon))
    }
    
    const quarterlyData: Record<string, { cases: number; surgeons: Set<string> }> = {}
    filteredCases.forEach((c: any) => {
      if (!c.operationDate) return
      const date = new Date(c.operationDate)
      const year = date.getFullYear()
      if (!qoqYear.includes(year.toString())) return
      const quarter = Math.floor(date.getMonth() / 3) + 1
      const quarterKey = `${year} - ${quarter}`
      if (!quarterlyData[quarterKey]) quarterlyData[quarterKey] = { cases: 0, surgeons: new Set() }
      quarterlyData[quarterKey].cases++
      if (c.surgeon) quarterlyData[quarterKey].surgeons.add(c.surgeon)
    })
    
    const allQuarters: string[] = []
    qoqYear.forEach(year => {
      for (let q = 1; q <= 4; q++) {
        allQuarters.push(`${year} - ${q}`)
      }
    })
    return allQuarters.map(quarter => ({
      quarter,
      cases: quarterlyData[quarter]?.cases || 0,
      surgeons: quarterlyData[quarter]?.surgeons.size || 0,
      productivity: quarterlyData[quarter] ? +(quarterlyData[quarter].cases / quarterlyData[quarter].surgeons.size).toFixed(2) : 0
    }))
  }, [qoqYear, qoqSurgeon, filteredCasesData])

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
    
    const monthlyData: Record<string, { cases: number; surgeons: Set<string> }> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.operationDate || !regionChartRegion.includes(c.region)) return
      const date = new Date(c.operationDate)
      const monthKey = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`
      if (!monthlyData[monthKey]) monthlyData[monthKey] = { cases: 0, surgeons: new Set() }
      monthlyData[monthKey].cases++
      if (c.surgeon) monthlyData[monthKey].surgeons.add(c.surgeon)
    })
    
    return Object.entries(monthlyData)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, data]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: '2-digit' }),
        cases: data.cases,
        surgeons: data.surgeons.size,
        productivity: data.surgeons.size > 0 ? +(data.cases / data.surgeons.size).toFixed(1) : 0
      }))
  }, [regionChartRegion, filteredCasesData])

  // Productivity by User Type Data
  const productivityByUserTypeData = useMemo(() => {
    const quarterlyData: Record<string, Record<string, { cases: number; firstCases: number; months: Set<string>; [key: string]: any }>> = {}
    
    filteredCasesData.forEach((c: any) => {
      if (!c.operationDate || !c.userStatus) return
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
  }, [filteredCasesData])

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

  // Combined Top Performers Data
  const topPerformersTableData = useMemo(() => {
    let filteredCases = filteredCasesData
    if (topPerformersRegion.length > 0) filteredCases = filteredCases.filter((c: any) => topPerformersRegion.includes(c.region))
    if (topPerformersSpecialty.length > 0) filteredCases = filteredCases.filter((c: any) => topPerformersSpecialty.includes(c.specialty))

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
      if (daysToCaseSurgeon.length > 0 && !daysToCaseSurgeon.includes(c.surgeon)) return
      if (!surgeonCases[c.surgeon]) surgeonCases[c.surgeon] = []
      surgeonCases[c.surgeon].push(c.operationDate)
    })
    
    // If specific surgeons selected, show each surgeon's days to reach milestones
    if (daysToCaseSurgeon.length > 0) {
      // Find the maximum number of cases any selected surgeon has
      let maxCases = 0;
      Object.values(surgeonCases).forEach(dates => {
        if (dates.length > maxCases) maxCases = dates.length;
      });

      if (maxCases === 0) return []

      const result = [];
      for (let caseNum = 1; caseNum <= maxCases; caseNum++) {
        const milestoneData: any = {
          milestone: caseNum === 1 ? '1st Case' : `${caseNum}${caseNum === 2 ? 'nd' : caseNum === 3 ? 'rd' : 'th'} Case`,
        };
        
        daysToCaseSurgeon.forEach(surgeon => {
          const dates = surgeonCases[surgeon];
          if (dates && dates.length >= caseNum) {
            const sorted = dates.sort()
            const daysDiff = Math.floor((new Date(sorted[caseNum - 1]).getTime() - new Date(sorted[0]).getTime()) / (1000 * 60 * 60 * 24))
            milestoneData[surgeon] = daysDiff;
            
            // If only one surgeon is selected, we can also provide the specific date
            if (daysToCaseSurgeon.length === 1) {
              milestoneData.date = sorted[caseNum - 1];
            }
          }
        });

        if (Object.keys(milestoneData).length > 1) { // more than just 'milestone' key
          result.push(milestoneData);
        }
      }
      return result;
    }
    
    // If all surgeons, show milestone averages
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
      return { milestone: `${milestone}${milestone === 2 ? 'nd' : milestone === 3 ? 'rd' : 'th'} Case`, avg }
    })
  }, [daysToCaseSurgeon, filteredCasesData])

  // Days Between Cases - Sequential for selected surgeon
  const daysBetweenCasesData = useMemo(() => {
    if (daysBetweenCasesSurgeon.length === 0) return []
    
    // Support comparing across multiple surgeons or just the first selected
    // Since this chart tracks sequential case numbers, it's best to show average days between cases for selected surgeons
    
    const surgeonCases: Record<string, string[]> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.surgeon || !c.operationDate) return
      if (daysBetweenCasesSurgeon.includes(c.surgeon)) {
        if (!surgeonCases[c.surgeon]) surgeonCases[c.surgeon] = []
        surgeonCases[c.surgeon].push(c.operationDate)
      }
    })
    
    const allSurgeonIntervals: number[][] = []
    
    Object.values(surgeonCases).forEach(dates => {
      const sorted = dates.sort()
      if (sorted.length < 1) return
      
      const intervals = [0] // Case 1 is 0
      for (let i = 1; i < sorted.length; i++) {
        intervals.push(Math.floor((new Date(sorted[i]).getTime() - new Date(sorted[i - 1]).getTime()) / (1000 * 60 * 60 * 24)))
      }
      allSurgeonIntervals.push(intervals)
    })
    
    if (allSurgeonIntervals.length === 0) return []
    
    // Find max length
    const maxLen = Math.max(...allSurgeonIntervals.map(arr => arr.length))
    const result = []
    
    for (let i = 0; i < maxLen; i++) {
      const valuesForCase = allSurgeonIntervals.map(arr => arr[i]).filter(val => val !== undefined)
      const avgDays = Math.round(valuesForCase.reduce((a, b) => a + b, 0) / valuesForCase.length)
      
      result.push({
        caseNumber: `Case ${i + 1}`,
        days: avgDays,
        // If single surgeon selected, provide the specific date, else undefined
        date: daysBetweenCasesSurgeon.length === 1 && surgeonCases[daysBetweenCasesSurgeon[0]] && surgeonCases[daysBetweenCasesSurgeon[0]].length > i
          ? surgeonCases[daysBetweenCasesSurgeon[0]].sort()[i]
          : undefined
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
      if (secondCaseStatus.length > 0 && !secondCaseStatus.includes(c.userStatus)) return
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



  // Time Metrics & Milestones
  const timeMetricsData = useMemo(() => {
    const surgeonCases: Record<string, string[]> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.surgeon || !c.operationDate) return
      if (!surgeonCases[c.surgeon]) surgeonCases[c.surgeon] = []
      surgeonCases[c.surgeon].push(c.operationDate)
    })
    
    const today = new Date()
    const convertTime = (days: number) => {
      if (timeUnit === "weeks") return Math.round(days / 7)
      if (timeUnit === "months") return Math.round(days / 30)
      return days
    }
    
    return Object.entries(surgeonCases)
      .map(([surgeon, dates]) => {
        const sortedDates = dates.sort()
        const firstCaseDate = sortedDates[0]
        const secondCaseDate = sortedDates.length > 1 ? sortedDates[1] : null
        const lastCaseDate = sortedDates[sortedDates.length - 1]
        
        const timeActiveDays = Math.floor((today.getTime() - new Date(firstCaseDate).getTime()) / (1000 * 60 * 60 * 24))
        const timeInactiveDays = Math.floor((today.getTime() - new Date(lastCaseDate).getTime()) / (1000 * 60 * 60 * 24))
        const monthsSince1st = Math.round(timeActiveDays / 30)
        const monthsSince2nd = secondCaseDate ? Math.round((today.getTime() - new Date(secondCaseDate).getTime()) / (1000 * 60 * 60 * 24) / 30) : 0
        
        return {
          surgeon,
          timeActive: convertTime(timeActiveDays),
          timeInactive: convertTime(timeInactiveDays),
          monthsSince1st,
          monthsSince2nd,
          firstCaseDate,
          secondCaseDate
        }
      })
      .sort((a, b) => b.timeActive - a.timeActive)
  }, [timeUnit, filteredCasesData])
  const gracePeriodSurgeons = useMemo(() => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 45)
    const surgeonFirstCase: Record<string, string> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.surgeon || !c.operationDate) return
      if (!surgeonFirstCase[c.surgeon] || c.operationDate < surgeonFirstCase[c.surgeon]) {
        surgeonFirstCase[c.surgeon] = c.operationDate
      }
    })
    return Object.entries(surgeonFirstCase)
      .filter(([, date]) => new Date(date) >= cutoffDate)
      .map(([surgeon]) => surgeon)
      .sort()
  }, [filteredCasesData])

  const gracePeriodDetails = useMemo(() => {
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - 45)
    const surgeonFirstCase: Record<string, string> = {}
    filteredCasesData.forEach((c: any) => {
      if (!c.surgeon || !c.operationDate) return
      if (!surgeonFirstCase[c.surgeon] || c.operationDate < surgeonFirstCase[c.surgeon]) {
        surgeonFirstCase[c.surgeon] = c.operationDate
      }
    })
    const today = new Date()
    return Object.entries(surgeonFirstCase)
      .filter(([, date]) => new Date(date) >= cutoffDate)
      .map(([surgeon, date]) => ({
        surgeon,
        firstCaseDate: date,
        daysSince: Math.floor((today.getTime() - new Date(date).getTime()) / (1000 * 60 * 60 * 24))
      }))
      .sort((a, b) => a.surgeon.localeCompare(b.surgeon))
  }, [filteredCasesData])

  // Time Milestones Years
  const timeMilestonesYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years: string[] = []
    for (let year = 2024; year <= currentYear; year++) {
      years.push(year.toString())
    }
    return years.reverse()
  }, [])

  // Time Milestones Data
  const timeMilestonesData = useMemo(() => {
    const surgeonData: Record<string, string[]> = {}
    
    casesData.forEach((c: any) => {
      if (!c.surgeon || !c.operationDate) return
      if (timeMilestonesSurgeon.length > 0 && !timeMilestonesSurgeon.includes(c.surgeon)) return
      if (!surgeonData[c.surgeon]) surgeonData[c.surgeon] = []
      surgeonData[c.surgeon].push(c.operationDate)
    })
    
    return Object.entries(surgeonData).map(([surgeon, dates]) => {
      const sorted = dates.sort((a, b) => new Date(a).getTime() - new Date(b).getTime());
      console.log(`Surgeon: ${surgeon}, Sorted Dates:`, sorted);
      const firstCaseDate = new Date(sorted[0])
      
      // Group by month and count
      const monthCounts: Record<string, string[]> = {}
      sorted.forEach(date => {
        const d = new Date(date)
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
        if (!monthCounts[key]) monthCounts[key] = []
        monthCounts[key].push(date)
      })
      
      // Mo to 2/Mo: Find first month with 2+ cases, use 2nd case date
      let monthsTo2Cases = 0
      const sortedMonths = Object.keys(monthCounts).sort()
      for (const month of sortedMonths) {
        if (monthCounts[month].length >= 2) {
          const sortedCasesInMonth = monthCounts[month].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
          const secondCaseDate = new Date(sortedCasesInMonth[1])
          const days = Math.floor((secondCaseDate.getTime() - firstCaseDate.getTime()) / (1000 * 60 * 60 * 24))
          monthsTo2Cases = +(days / 30).toFixed(1)
          break
        }
      }
      
      // Mo to 3 Consecutive: Find 3 consecutive months with 2+ cases each, use 2nd case of 3rd month
      let monthsTo3Consecutive = 0
      for (let i = 0; i <= sortedMonths.length - 3; i++) {
        const m1 = sortedMonths[i]
        const m2 = sortedMonths[i + 1]
        const m3 = sortedMonths[i + 2]
        
        if (monthCounts[m1].length >= 2 && monthCounts[m2].length >= 2 && monthCounts[m3].length >= 2) {
          const d1 = new Date(m1 + '-01')
          const d2 = new Date(m2 + '-01')
          const d3 = new Date(m3 + '-01')
          
          const diff1 = (d2.getFullYear() - d1.getFullYear()) * 12 + (d2.getMonth() - d1.getMonth())
          const diff2 = (d3.getFullYear() - d2.getFullYear()) * 12 + (d3.getMonth() - d2.getMonth())
          
          if (diff1 === 1 && diff2 === 1) {
            const sortedCasesInMonth3 = monthCounts[m3].sort((a, b) => new Date(a).getTime() - new Date(b).getTime())
            const secondCaseInMonth3 = sortedCasesInMonth3[1]
            const days = Math.floor((new Date(secondCaseInMonth3).getTime() - firstCaseDate.getTime()) / (1000 * 60 * 60 * 24))
            monthsTo3Consecutive = +(days / 30).toFixed(1)
            break
          }
        }
      }
      
      return { surgeon, monthsTo2Cases, monthsTo3Consecutive }
    }).sort((a, b) => b.monthsTo2Cases - a.monthsTo2Cases)
  }, [timeMilestonesSurgeon])

  // Survival Time Data
  const survivalTimeData = useMemo(() => {
    const today = new Date()
    return filteredCasesData
      .filter((c: any) => {
        if (!c.operationDate) return false
        if (survivalTimeSurgeon.length > 0 && !survivalTimeSurgeon.includes(c.surgeon)) return false
        if (survivalTimeSpecialty.length > 0 && !survivalTimeSpecialty.includes(c.specialty)) return false
        return true
      })
      .map((c: any, index: number) => {
        const daysSince = Math.floor((today.getTime() - new Date(c.operationDate).getTime()) / (1000 * 60 * 60 * 24))
        return {
          caseId: c.caseNumber || `Case-${index + 1}`,
          surgeon: c.surgeon,
          specialty: c.specialty || 'Unknown',
          operationDate: c.operationDate,
          daysSinceSurgery: daysSince
        }
      })
      .sort((a, b) => b.daysSinceSurgery - a.daysSinceSurgery)
  }, [filteredCasesData, survivalTimeSurgeon, survivalTimeSpecialty])

  // Calculate Surgeon Productivity Over Time from real data
  const surgeonProductivityOverTimeData = useMemo(() => {
    let filteredCases = casesData.filter((c: any) => c.operationDate)
    let casesWithoutDates = casesData.filter((c: any) => !c.operationDate)

    // Apply surgeon filter
    if (surgeonFilter.length > 0) {
      filteredCases = filteredCases.filter((c: any) => surgeonFilter.includes(c.surgeon))
      casesWithoutDates = casesWithoutDates.filter((c: any) => surgeonFilter.includes(c.surgeon))
    }

    // Apply date range filter
    if (dateRange.from) {
      filteredCases = filteredCases.filter((c: any) => c.operationDate >= dateRange.from!)
    }
    if (dateRange.to) {
      filteredCases = filteredCases.filter((c: any) => c.operationDate <= dateRange.to!)
    }

    // Apply user status filter
    if (statusFilter.length > 0) {
      filteredCases = filteredCases.filter((c: any) => statusFilter.includes(c.userStatus))
      casesWithoutDates = casesWithoutDates.filter((c: any) => statusFilter.includes(c.userStatus))
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
    if (caseFilter.length > 0) {
      // Find the maximum sequence selected to know how many cases to slice off
      // e.g., if ["Since 2nd Case", "Since 4th Case"] is selected, we should respect the most restrictive one (Since 4th Case)
      // or we can just apply the first one selected for simplicity.
      // Assuming we apply the highest sequence number selected:
      let sliceCount = 0;
      if (caseFilter.includes("Since 6th Case")) sliceCount = 5;
      else if (caseFilter.includes("Since 5th Case")) sliceCount = 4;
      else if (caseFilter.includes("Since 4th Case")) sliceCount = 3;
      else if (caseFilter.includes("Since 3rd Case")) sliceCount = 2;
      else if (caseFilter.includes("Since 2nd Case")) sliceCount = 1;
      else if (caseFilter.includes("Since 1st Case")) sliceCount = 0;

      const result = sortedData.length > sliceCount ? sortedData.slice(sliceCount) : sortedData;
      if (casesWithoutDates.length > 0) {
        result.push({ month: "", cases: casesWithoutDates.length })
      }
      return result;
    }

    if (casesWithoutDates.length > 0) {
      sortedData.push({ month: "", cases: casesWithoutDates.length })
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
          <GracePeriodCard surgeons={gracePeriodSurgeons} surgeonDetails={gracePeriodDetails} />
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

        <SurvivalTime 
          data={survivalTimeData} 
          surgeons={surgeonsList}
          specialties={specialtiesList}
          surgeonFilter={survivalTimeSurgeon}
          specialtyFilter={survivalTimeSpecialty}
          onSurgeonChange={setSurvivalTimeSurgeon}
          onSpecialtyChange={setSurvivalTimeSpecialty}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <TimeActiveInactive data={timeMetricsData} timeUnit={timeUnit} onTimeUnitChange={setTimeUnit} />
          <TimeNormalized 
            data={timeNormalizedSurgeon.length > 0 ? timeMetricsData.filter((d: any) => timeNormalizedSurgeon.includes(d.surgeon)) : timeMetricsData}
            surgeons={surgeonsList}
            surgeonFilter={timeNormalizedSurgeon}
            onSurgeonChange={setTimeNormalizedSurgeon}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <DaysBetweenCases 
            data={daysBetweenCasesData} 
            surgeons={surgeonsList} 
            surgeonFilter={daysBetweenCasesSurgeon} 
            onSurgeonChange={setDaysBetweenCasesSurgeon} 
          />
          <TimeMilestonesTable 
            data={timeMilestonesData}
            surgeons={surgeonsList}
            years={timeMilestonesYears}
            surgeonFilter={timeMilestonesSurgeon}
            selectedYears={timeMilestonesYear}
            onSurgeonChange={setTimeMilestonesSurgeon}
            onYearsChange={setTimeMilestonesYear}
          />
        </div>

        <QoQGrowthProgression data={qoqGrowthData} years={qoqYears} selectedYears={qoqYear} surgeons={surgeonsList} surgeon={qoqSurgeon} onYearsChange={setQoqYear} onSurgeonChange={setQoqSurgeon} />

        <CasesByRegion 
          data={casesByRegionData} 
          timeSeriesData={regionTimeSeriesData} 
          regions={regionsList} 
          selectedRegion={regionChartRegion} 
          viewType={regionChartView} 
          onRegionChange={setRegionChartRegion} 
          onViewTypeChange={setRegionChartView} 
        />

        <ProductivityByUserType data={productivityByUserTypeData} />

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
