import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis } from "recharts"

export function DaysToCaseMilestones({ data }: { data: any[] }) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Days to Case Milestones (Per Surgeon Avg)</CardTitle>
        <p className="text-xs text-muted-foreground">Average time to reach case milestones</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <BarChart data={data}>
            <XAxis dataKey="milestone" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="avg" fill="#1d99ac" radius={[4, 4, 0, 0]} name="Average" />
            <Bar dataKey="median" fill="#10b981" radius={[4, 4, 0, 0]} name="Median" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}

export function DaysBetweenCases({ data }: { data: any[] }) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Days Between Case Milestones (Per Surgeon Avg)</CardTitle>
        <p className="text-xs text-muted-foreground">Average days between case milestones</p>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <BarChart data={data}>
            <XAxis dataKey="milestone" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="avg" fill="#ec4899" radius={[4, 4, 0, 0]} name="Average" />
            <Bar dataKey="median" fill="#8b5cf6" radius={[4, 4, 0, 0]} name="Median" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
