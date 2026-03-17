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

  const { data: statsData, isLoading: statsLoading, fetch: fetchStats, casesOverTime, casesOverTimeLoading, fetchCasesOverTime: fetchCasesOverTimeData, topPerformers, topPerformersLoading, fetchTopPerformers: fetchTopPerformersData, daysToMilestones, daysToMilestonesLoading, fetchDaysToMilestones: fetchDaysToMilestonesData, gracePeriodSurgeons: gracePeriodData, gracePeriodLoading, fetchGracePeriodSurgeons: fetchGracePeriodData, timeMilestones, timeMilestonesLoading, fetchTimeMilestones: fetchTimeMilestonesData, qoqGrowth, qoqGrowthLoading, fetchQoQGrowth: fetchQoQGrowthData, timeMetrics, timeMetricsLoading, fetchTimeMetrics: fetchTimeMetricsData, daysBetweenCases, daysBetweenCasesLoading, fetchDaysBetweenCases: fetchDaysBetweenCasesData, secondCaseBooking, secondCaseBookingLoading, fetchSecondCaseBooking: fetchSecondCaseBookingData, survivalTime, survivalTimeLoading, fetchSurvivalTime: fetchSurvivalTimeData, casesByRegion, casesByRegionLoading, fetchCasesByRegion: fetchCasesByRegionData, regionTimeSeries, regionTimeSeriesLoading, fetchRegionTimeSeries: fetchRegionTimeSeriesData, productivityByUserType, productivityByUserTypeLoading, fetchProductivityByUserType: fetchProductivityByUserTypeData, timeToSecondCase, timeToSecondCaseLoading, fetchTimeToSecondCase: fetchTimeToSecondCaseData } = useStatsStore()

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
  // Cases by Region - fetch on dateRange change
  useEffect(() => {
    fetchCasesByRegionData({ startDate: dateRange.from, endDate: dateRange.to })
  }, [dateRange])

  // Region Time Series - fetch when region selection or dateRange changes
  useEffect(() => {
    if (regionChartRegion.length === 0) return
    fetchRegionTimeSeriesData({
      startDate: dateRange.from,
      endDate: dateRange.to,
      regions: regionChartRegion,
    })
  }, [dateRange, regionChartRegion])

  const casesByRegionData = casesByRegion
  const regionTimeSeriesData = regionChartRegion.length === 0 ? [] : regionTimeSeries

  // Productivity by User Type - fetch when filters change
  useEffect(() => {
    fetchProductivityByUserTypeData({
      startDate: dateRange.from,
      endDate: dateRange.to,
      userTypes: productivityUserType.length > 0 ? productivityUserType : undefined,
    })
  }, [dateRange, productivityUserType])

  const productivityByUserTypeData = productivityByUserType

  // Time to Second Case Data
  useEffect(() => {
    fetchTimeToSecondCaseData({
      startDate: dateRange.from,
      endDate: dateRange.to,
    })
  }, [dateRange])



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

  // Days Between Cases - fetch when surgeon filter changes
  useEffect(() => {
    fetchDaysBetweenCasesData({
      startDate: dateRange.from,
      endDate: dateRange.to,
      surgeons: daysBetweenCasesSurgeon.length > 0 ? daysBetweenCasesSurgeon : undefined,
    })
  }, [dateRange, daysBetweenCasesSurgeon])

  // Days Between Cases - Sequential for selected surgeon
  const daysBetweenCasesData = daysBetweenCases

  // Second Case Booking - fetch when filters change
  useEffect(() => {
    fetchSecondCaseBookingData({
      startDate: dateRange.from,
      endDate: dateRange.to,
      statuses: secondCaseStatus.length > 0 ? secondCaseStatus : undefined,
      breakdown: secondCaseBreakdown as 'overall' | 'userType' | 'region' | 'specialty',
      excludeDays: parseInt(secondCaseExcludeDays),
    })
  }, [dateRange, secondCaseStatus, secondCaseBreakdown, secondCaseExcludeDays])

  const secondCaseBookingData = secondCaseBooking



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
  // Survival Time - fetch when filters change
  useEffect(() => {
    fetchSurvivalTimeData({
      startDate: dateRange.from,
      endDate: dateRange.to,
      surgeons: survivalTimeSurgeon.length > 0 ? survivalTimeSurgeon : undefined,
      specialties: survivalTimeSpecialty.length > 0 ? survivalTimeSpecialty : undefined,
    })
  }, [dateRange, survivalTimeSurgeon, survivalTimeSpecialty])

  const survivalTimeData = survivalTime

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
          isLoading={secondCaseBookingLoading}
          excludeDays={secondCaseExcludeDays} 
          statusFilter={secondCaseStatus} 
          breakdown={secondCaseBreakdown} 
          startDate={dateRange.from}
          endDate={dateRange.to}
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
          isLoading={survivalTimeLoading}
          onSurgeonChange={setSurvivalTimeSurgeon}
          onSpecialtyChange={setSurvivalTimeSpecialty}
        />



        <CasesByRegion 
          data={casesByRegionData} 
          timeSeriesData={regionTimeSeriesData} 
          regions={regionsList} 
          selectedRegion={regionChartRegion} 
          viewType={regionChartView} 
          isLoading={regionChartRegion.length === 0 ? casesByRegionLoading : regionTimeSeriesLoading}
          onRegionChange={setRegionChartRegion} 
          onViewTypeChange={setRegionChartView} 
        />

        <ProductivityByUserType 
          data={productivityByUserTypeData} 
          userTypes={userTypesList}
          userTypeFilter={productivityUserType}
          isLoading={productivityByUserTypeLoading}
          onUserTypeChange={setProductivityUserType}
        />

        <TimeToSecondCase 
          data={timeToSecondCase} 
          surgeons={surgeonsList} 
          selectedSurgeon={timeToSecondCaseSurgeon} 
          onSurgeonChange={setTimeToSecondCaseSurgeon}
          isLoading={timeToSecondCaseLoading}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <SurgeonsBySpecialty data={surgeonsBySpecialtyData} />
          <SurgeonsByCaseLoad data={surgeonsByCaseLoadData} />
        </div>
       
      </div>
    </ProtectedRoute>
  )
}
