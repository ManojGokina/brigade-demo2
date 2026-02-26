import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function SurgeonProductivityOverTime({ 
  data, 
  surgeons, 
  surgeonFilter, 
  caseFilter, 
  statusFilter, 
  onSurgeonChange, 
  onCaseFilterChange, 
  onStatusChange 
}: { 
  data: any[], 
  surgeons: string[], 
  surgeonFilter: string, 
  caseFilter: string, 
  statusFilter: string, 
  onSurgeonChange: (value: string) => void, 
  onCaseFilterChange: (value: string) => void, 
  onStatusChange: (value: string) => void 
}) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Surgeon Productivity - Cases Performed Over Time</CardTitle>
            <p className="text-xs text-muted-foreground">Sliceable by date range, case number, and user status</p>
          </div>
          <div className="flex gap-2">
            <Select value={surgeonFilter} onValueChange={onSurgeonChange}>
              <SelectTrigger className="w-[150px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Surgeons</SelectItem>
                {surgeons.map((surgeon) => (
                  <SelectItem key={surgeon} value={surgeon}>{surgeon}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={caseFilter} onValueChange={onCaseFilterChange}>
              <SelectTrigger className="w-[140px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Cases</SelectItem>
                <SelectItem value="since1st">Since 1st Case</SelectItem>
                <SelectItem value="since3rd">Since 3rd Case</SelectItem>
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
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <AreaChart data={data}>
            <defs>
              <linearGradient id="productivityAreaGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#1d99ac" stopOpacity={0.6} />
                <stop offset="100%" stopColor="#1d99ac" stopOpacity={0.1} />
              </linearGradient>
            </defs>
            <XAxis dataKey="month" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Area type="monotone" dataKey="cases" stroke="#1d99ac" strokeWidth={2} fill="url(#productivityAreaGradient)" />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
