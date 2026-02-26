import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SecondCaseBooking({ 
  data, 
  excludeDays, 
  statusFilter, 
  breakdown, 
  onExcludeDaysChange, 
  onStatusChange, 
  onBreakdownChange 
}: { 
  data: any[], 
  excludeDays: string, 
  statusFilter: string, 
  breakdown: string, 
  onExcludeDaysChange: (value: string) => void, 
  onStatusChange: (value: string) => void, 
  onBreakdownChange: (value: string) => void 
}) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">% of Surgeons Booking Second Cases</CardTitle>
            <p className="text-xs text-muted-foreground">Overall, filtered by status, and broken down by type/region/specialty</p>
          </div>
          <div className="flex gap-2">
            <Select value={excludeDays} onValueChange={onExcludeDaysChange}>
              <SelectTrigger className="w-[180px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Include All</SelectItem>
                <SelectItem value="30">Exclude 1st case &lt; 30 days</SelectItem>
                <SelectItem value="45">Exclude 1st case &lt; 45 days</SelectItem>
                <SelectItem value="60">Exclude 1st case &lt; 60 days</SelectItem>
                <SelectItem value="90">Exclude 1st case &lt; 90 days</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-[120px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="EST">EST</SelectItem>
                <SelectItem value="IN">IN</SelectItem>
                <SelectItem value="VAL">VAL</SelectItem>
              </SelectContent>
            </Select>
            <Select value={breakdown} onValueChange={onBreakdownChange}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="overall">Overall</SelectItem>
                <SelectItem value="userType">By User Type</SelectItem>
                <SelectItem value="region">By Region</SelectItem>
                <SelectItem value="specialty">By Specialty</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <BarChart data={data}>
            <XAxis dataKey="category" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="percentage" fill="#10b981" radius={[4, 4, 0, 0]} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
