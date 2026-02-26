import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart"
import { BarChart, Bar, XAxis, YAxis } from "recharts"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function QoQGrowthProgression({ data, year, years, onYearChange }: { data: any[], year: string, years: string[], onYearChange: (value: string) => void }) {
  return (
    <Card className="border-border/50 bg-card">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm font-medium">QoQ Growth Progression</CardTitle>
          <div className="flex items-center gap-3">
            <div className="flex gap-3">
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#1d99ac]" />
                <span className="text-xs text-muted-foreground">Cases</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#10b981]" />
                <span className="text-xs text-muted-foreground">Surgeons</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="h-2 w-2 rounded-full bg-[#f59e0b]" />
                <span className="text-xs text-muted-foreground">Productivity</span>
              </div>
            </div>
            <Select value={year} onValueChange={onYearChange}>
              <SelectTrigger className="w-[100px] h-8 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <ChartContainer config={{}} className="h-[250px] w-full">
          <BarChart data={data}>
            <XAxis dataKey="quarter" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="cases" fill="#1d99ac" radius={[4, 4, 0, 0]} name="Cases" />
            <Bar dataKey="surgeons" fill="#10b981" radius={[4, 4, 0, 0]} name="Surgeons" />
            <Bar dataKey="productivity" fill="#f59e0b" radius={[4, 4, 0, 0]} name="Productivity" />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
