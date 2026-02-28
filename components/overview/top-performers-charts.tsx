import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent, ChartLegend, ChartLegendContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TopPerformers({ 
  caseLoadData, 
  neuromaData, 
  productivityData, 
  regions, 
  specialties, 
  viewType, 
  regionFilter, 
  specialtyFilter, 
  onViewTypeChange, 
  onRegionChange, 
  onSpecialtyChange 
}: { 
  caseLoadData: any[], 
  neuromaData: any[], 
  productivityData: any[], 
  regions: string[], 
  specialties: string[], 
  viewType: string, 
  regionFilter: string, 
  specialtyFilter: string, 
  onViewTypeChange: (value: string) => void, 
  onRegionChange: (value: string) => void, 
  onSpecialtyChange: (value: string) => void 
}) {
  const getChartData = () => {
    if (viewType === "caseLoad") return caseLoadData
    if (viewType === "neuroma") return neuromaData
    return productivityData
  }

  const getDataKey = () => {
    if (viewType === "productivity") return "productivity"
    return "cases"
  }

  const getColor = () => {
    if (viewType === "caseLoad") return "#1d99ac"
    if (viewType === "neuroma") return "#10b981"
    return "#f59e0b"
  }

  const getTitle = () => {
    if (viewType === "caseLoad") return "Top 10 by Case Load"
    if (viewType === "neuroma") return "Top 10 by Neuroma Cases"
    return "Top 10 by Monthly Productivity"
  }

  const getLegendLabel = () => {
    if (viewType === "caseLoad") return "Case Load"
    if (viewType === "neuroma") return "Neuroma Cases"
    return "Monthly Productivity"
  }

  const chartConfig = {
    [getDataKey()]: {
      label: getLegendLabel(),
      color: getColor()
    }
  }

  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">{getTitle()}</CardTitle>
          <div className="flex gap-2">
            <Select value={viewType} onValueChange={onViewTypeChange}>
              <SelectTrigger className="w-[140px] h-7 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="caseLoad">Case Load</SelectItem>
                <SelectItem value="neuroma">Neuroma Cases</SelectItem>
                <SelectItem value="productivity">Productivity</SelectItem>
              </SelectContent>
            </Select>
            {viewType === "caseLoad" && (
              <>
                <Select value={regionFilter} onValueChange={onRegionChange}>
                  <SelectTrigger className="w-[110px] h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Regions</SelectItem>
                    {regions.map((region) => (
                      <SelectItem key={region} value={region}>{region}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={specialtyFilter} onValueChange={onSpecialtyChange}>
                  <SelectTrigger className="w-[110px] h-7 text-xs">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Specialties</SelectItem>
                    {specialties.map((specialty) => (
                      <SelectItem key={specialty} value={specialty}>{specialty}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <BarChart data={getChartData()}>
            <XAxis dataKey="name" tick={{ fontSize: 10, fill: "#000" }} angle={-45} textAnchor="end" height={80} />
            <YAxis type="number" tick={{ fontSize: 10, fill: "#000" }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <ChartLegend content={<ChartLegendContent />} />
            <Bar dataKey={getDataKey()} fill={getColor()} radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
