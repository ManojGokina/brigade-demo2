import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { AreaChart, Area, XAxis, YAxis } from "recharts"

export function ProductivityByUserType({ data }: { data: any[] }) {
  return (
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
          <AreaChart data={data}>
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
  )
}

export function TimeToSecondCase({ data }: { data: any[] }) {
  return (
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
          <AreaChart data={data}>
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
  )
}
