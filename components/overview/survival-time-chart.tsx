import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis } from "recharts"

export function SurvivalTime({ data }: { data: any[] }) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Survival Time (Days from Case Date)</CardTitle>
        <p className="text-xs text-muted-foreground">Average survival time per surgeon</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <BarChart data={data}>
            <XAxis dataKey="surgeon" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="avgDays" fill="#1d99ac" radius={[4, 4, 0, 0]} name="Avg Days" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
