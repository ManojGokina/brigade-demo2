import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis, PieChart, Pie, Cell } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function TimeActiveInactive({ data, timeUnit, onTimeUnitChange }: { data: any[], timeUnit: string, onTimeUnitChange: (value: string) => void }) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-sm font-medium">Time Active vs Inactive</CardTitle>
            <p className="text-xs text-muted-foreground">From first case and most recent case</p>
          </div>
          <Select value={timeUnit} onValueChange={onTimeUnitChange}>
            <SelectTrigger className="w-[120px] h-8 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="days">Days</SelectItem>
              <SelectItem value="weeks">Weeks</SelectItem>
              <SelectItem value="months">Months</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <BarChart data={data}>
            <XAxis dataKey="surgeon" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="timeActive" fill="#10b981" radius={[4, 4, 0, 0]} name="Active" />
            <Bar dataKey="timeInactive" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Inactive" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function TimeNormalized({ data }: { data: any[] }) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Time Normalized (Months)</CardTitle>
        <p className="text-xs text-muted-foreground">Months since 1st and 2nd case</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <BarChart data={data}>
            <XAxis dataKey="surgeon" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="monthsSince1st" fill="#1d99ac" radius={[4, 4, 0, 0]} name="Since 1st Case" />
            <Bar dataKey="monthsSince2nd" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Since 2nd Case" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function TimeMilestones({ data }: { data: any[] }) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Time Milestones (Months)</CardTitle>
        <p className="text-xs text-muted-foreground">Months to 2 cases/month and 3 consecutive months</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <BarChart data={data}>
            <XAxis dataKey="surgeon" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="monthsTo2PerMonth" fill="#ec4899" radius={[4, 4, 0, 0]} name="To 2/month" />
            <Bar dataKey="monthsTo2PerMonth3Consecutive" fill="#f59e0b" radius={[4, 4, 0, 0]} name="To 3 consecutive" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function GracePeriodStatus({ data }: { data: any[] }) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Grace Period Status</CardTitle>
        <p className="text-xs text-muted-foreground">Surgeons with first case in last 45 days</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <PieChart>
            <Pie data={data} cx="50%" cy="50%" outerRadius={80} dataKey="count" label>
              <Cell fill="#10b981" />
              <Cell fill="#f59e0b" />
            </Pie>
            <ChartTooltip content={<ChartTooltipContent />} />
          </PieChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
