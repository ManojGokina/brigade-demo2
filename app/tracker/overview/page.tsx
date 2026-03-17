"use client"

import { useState, useMemo, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ProtectedRoute } from "@/components/protected-route"
import { DateRangePicker } from "@/components/ui/date-range-picker"
import type { DateRange } from "@/components/ui/date-range-picker"
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
  const [timeMilestonesSurgeon, setTimeMilestonesSurgeon] = useState<string[]>([])
  const [timeMilestonesYear, setTimeMilestonesYear] = useState<string[]>([new Date().getFullYear().toString()])
  const [productivityUserType, setProductivityUserType] = useState<string[]>([])

  const {
    data: statsData, isLoading: statsLoading, fetch: fetchStats,
    casesOverTime, casesOverTimeLoading, fetchCasesOverTime: fetchCasesOverTimeData,
    topPerformers, topPerformersLoading, fetchTopPerformers: fetchTopPerformersData,
    daysToMilestones, daysToMilestonesLoading, fetchDaysToMilestones: fetchDaysToMilestonesData,
    gracePeriodSurgeons: gracePeriodData, gracePeriodLoading, fetchGracePeriodSurgeons: fetchGracePeriodData,
    timeMilestones, timeMilestonesLoading, fetchTimeMilestones: fetchTimeMilestonesData,
    qoqGrowth, qoqGrowthLoading, fetchQoQGrowth: fetchQoQGrowthData,
    timeMetrics, timeMetricsLoading, fetchTimeMetrics: fetchTimeMetricsData,
    daysBetweenCases, daysBetweenCasesLoading, fetchDaysBetweenCases: fetchDaysBetweenCasesData,
    secondCaseBooking, secondCaseBookingLoading, fetchSecondCaseBooking: fetchSecondCaseBookingData,
    survivalTime, survivalTimeLoading, fetchSurvivalTime: fetchSurvivalTimeData,
    casesByRegion, casesByRegionLoading, fetchCasesByRegion: fetchCasesByRegionData,
    regionTimeSeries, regionTimeSeriesLoading, fetchRegionTimeSeries: fetchRegionTimeSeriesData,
    productivityByUserType, productivityByUserTypeLoading, fetchProductivityByUserType: fetchProductivityByUserTypeData,
    timeToSecondCase, timeToSecondCaseLoading, fetchTimeToSecondCase: fetchTimeToSecondCaseData,
    surgeonDemographics, surgeonDemographicsLoading, fetchSurgeonDemographics: fetchSurgeonDemographicsData,
  } = useStatsStore()

  // Derive filter lists from already-fetched store data
  const surgeonsList = useMemo(() => Array.from(new Set(topPerformers.map(d => d.surgeon))).sort(), [topPerformers])
  const regionsList = useMemo(() => Array.from(new Set(topPerformers.map(d => d.region).filter(Boolean))).sort(), [topPerformers])
  const specialtiesList = useMemo(() => Array.from(new Set(topPerformers.map(d => d.specialty).filter(Boolean))).sort(), [topPerformers])
  const userTypesList = useMemo(() => Array.from(new Set(productivityByUserType.map(d => d.label).filter(Boolean))).sort(), [productivityByUserType])

  const qoqYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years: string[] = []
    for (let year = 2024; year <= currentYear; year++) years.push(year.toString())
    return years
  }, [])

  const timeMilestonesYears = useMemo(() => {
    const currentYear = new Date().getFullYear()
    const years: string[] = []
    for (let year = 2024; year <= currentYear; year++) years.push(year.toString())
    return years.reverse()
  }, [])

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

  useEffect(() => { fetchGracePeriodData() }, [])

  useEffect(() => {
    const params: Record<string, string> = {}
    if (dateRange.from) params.startDate = dateRange.from
    if (dateRange.to) params.endDate = dateRange.to
    fetchStats(dateRange.from || dateRange.to ? { period: 'custom', ...params } : {})
  }, [dateRange])

  useEffect(() => {
    fetchTopPerformersData({
      startDate: dateRange.from, endDate: dateRange.to,
      regions: topPerformersRegion.length > 0 ? topPerformersRegion : undefined,
      specialties: topPerformersSpecialty.length > 0 ? topPerformersSpecialty : undefined,
    })
  }, [dateRange, topPerformersRegion, topPerformersSpecialty])

  useEffect(() => {
    fetchTimeMilestonesData({
      startDate: dateRange.from, endDate: dateRange.to,
      surgeons: timeMilestonesSurgeon.length > 0 ? timeMilestonesSurgeon : undefined,
    })
  }, [dateRange, timeMilestonesSurgeon])

  useEffect(() => {
    fetchQoQGrowthData({
      startDate: dateRange.from, endDate: dateRange.to,
      surgeons: qoqSurgeon.length > 0 ? qoqSurgeon : undefined,
      regions: qoqRegion.length > 0 ? qoqRegion : undefined,
      specialties: qoqSpecialty.length > 0 ? qoqSpecialty : undefined,
      years: qoqYear.length > 0 ? qoqYear : undefined,
    })
  }, [dateRange, qoqSurgeon, qoqRegion, qoqSpecialty, qoqYear])

  useEffect(() => {
    fetchCasesByRegionData({ startDate: dateRange.from, endDate: dateRange.to })
  }, [dateRange])

  useEffect(() => {
    if (regionChartRegion.length === 0) return
    fetchRegionTimeSeriesData({ startDate: dateRange.from, endDate: dateRange.to, regions: regionChartRegion })
  }, [dateRange, regionChartRegion])

  useEffect(() => {
    fetchProductivityByUserTypeData({
      startDate: dateRange.from, endDate: dateRange.to,
      userTypes: productivityUserType.length > 0 ? productivityUserType : undefined,
    })
  }, [dateRange, productivityUserType])

  useEffect(() => {
    fetchTimeToSecondCaseData({ startDate: dateRange.from, endDate: dateRange.to })
  }, [dateRange])

  useEffect(() => {
    fetchSurgeonDemographicsData({ startDate: dateRange.from, endDate: dateRange.to })
  }, [dateRange])

  useEffect(() => {
    fetchDaysToMilestonesData({
      startDate: dateRange.from, endDate: dateRange.to,
      surgeons: daysToCaseSurgeon.length > 0 ? daysToCaseSurgeon : undefined,
    })
  }, [dateRange, daysToCaseSurgeon])

  useEffect(() => {
    fetchDaysBetweenCasesData({
      startDate: dateRange.from, endDate: dateRange.to,
      surgeons: daysBetweenCasesSurgeon.length > 0 ? daysBetweenCasesSurgeon : undefined,
    })
  }, [dateRange, daysBetweenCasesSurgeon])

  useEffect(() => {
    fetchSecondCaseBookingData({
      startDate: dateRange.from, endDate: dateRange.to,
      statuses: secondCaseStatus.length > 0 ? secondCaseStatus : undefined,
      breakdown: secondCaseBreakdown as 'overall' | 'userType' | 'region' | 'specialty',
      excludeDays: parseInt(secondCaseExcludeDays),
    })
  }, [dateRange, secondCaseStatus, secondCaseBreakdown, secondCaseExcludeDays])

  useEffect(() => {
    fetchTimeMetricsData({ startDate: dateRange.from, endDate: dateRange.to })
  }, [dateRange])

  useEffect(() => {
    fetchSurvivalTimeData({
      startDate: dateRange.from, endDate: dateRange.to,
      surgeons: survivalTimeSurgeon.length > 0 ? survivalTimeSurgeon : undefined,
      specialties: survivalTimeSpecialty.length > 0 ? survivalTimeSpecialty : undefined,
    })
  }, [dateRange, survivalTimeSurgeon, survivalTimeSpecialty])

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
      startDate: dateRange.from, endDate: dateRange.to,
      surgeons: surgeonFilter.length > 0 ? surgeonFilter : undefined,
      statuses: statusFilter.length > 0 ? statusFilter : undefined,
      regions: regionFilter.length > 0 ? regionFilter : undefined,
      specialties: specialtyFilter.length > 0 ? specialtyFilter : undefined,
      caseTypes: caseTypeFilter.length > 0 ? caseTypeFilter : undefined,
      neuroma: neuromaVal,
      sinceCase,
    })
  }, [dateRange, surgeonFilter, statusFilter, regionFilter, specialtyFilter, caseTypeFilter, neuromaFilter, caseFilter])

  const gracePeriodSurgeons = gracePeriodData.map((d: any) => d.surgeon)

  return (
    <ProtectedRoute>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Dashboard Overview</h1>
            <p className="text-sm text-muted-foreground">Quarterly analytics and surgeon performance metrics</p>
          </div>
          <div className="flex gap-2 items-center">
            <DateRangePicker value={dateRange} onChange={setDateRange} placeholder="Select Date Range" />
            {(dateRange.from || dateRange.to) && (
              <Button variant="outline" size="sm" onClick={() => setDateRange({})} className="h-9">Clear</Button>
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
          data={topPerformers}
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
            data={daysToMilestones}
            surgeons={surgeonsList}
            surgeonFilter={daysToCaseSurgeon}
            isLoading={daysToMilestonesLoading}
            onSurgeonChange={setDaysToCaseSurgeon}
          />
          <TimeMilestonesTable
            data={timeMilestones}
            surgeons={surgeonsList}
            years={timeMilestonesYears}
            surgeonFilter={timeMilestonesSurgeon}
            selectedYears={timeMilestonesYear}
            isLoading={timeMilestonesLoading}
            onSurgeonChange={setTimeMilestonesSurgeon}
            onYearsChange={setTimeMilestonesYear}
          />
        </div>

        <GracePeriodCard surgeons={gracePeriodSurgeons} surgeonDetails={gracePeriodData} isLoading={gracePeriodLoading} />

        <QoQGrowthProgression
          data={qoqGrowth}
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
            rawCases={[]}
            onSurgeonChange={setTimeNormalizedSurgeon}
          />
        </div>

        <DaysBetweenCases
          data={daysBetweenCases}
          surgeons={surgeonsList}
          surgeonFilter={daysBetweenCasesSurgeon}
          onSurgeonChange={setDaysBetweenCasesSurgeon}
        />

        <SecondCaseBooking
          data={secondCaseBooking}
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
          data={survivalTime}
          surgeons={surgeonsList}
          specialties={specialtiesList}
          surgeonFilter={survivalTimeSurgeon}
          specialtyFilter={survivalTimeSpecialty}
          isLoading={survivalTimeLoading}
          onSurgeonChange={setSurvivalTimeSurgeon}
          onSpecialtyChange={setSurvivalTimeSpecialty}
        />

        <CasesByRegion
          data={casesByRegion}
          timeSeriesData={regionChartRegion.length === 0 ? [] : regionTimeSeries}
          regions={regionsList}
          selectedRegion={regionChartRegion}
          viewType={regionChartView}
          isLoading={regionChartRegion.length === 0 ? casesByRegionLoading : regionTimeSeriesLoading}
          onRegionChange={setRegionChartRegion}
          onViewTypeChange={setRegionChartView}
        />

        <ProductivityByUserType
          data={productivityByUserType}
          userTypes={userTypesList}
          userTypeFilter={productivityUserType}
          isLoading={productivityByUserTypeLoading}
          onUserTypeChange={setProductivityUserType}
        />

        <TimeToSecondCase
          data={timeToSecondCase}
          surgeons={surgeonsList}
          selectedSurgeon={[]}
          onSurgeonChange={() => {}}
          isLoading={timeToSecondCaseLoading}
        />

        <div className="grid gap-4 md:grid-cols-2">
          <SurgeonsBySpecialty data={surgeonDemographics?.bySpecialty ?? []} isLoading={surgeonDemographicsLoading} />
          <SurgeonsByCaseLoad data={surgeonDemographics?.byCaseLoad ?? []} isLoading={surgeonDemographicsLoading} />
        </div>

      </div>
    </ProtectedRoute>
  )
}
