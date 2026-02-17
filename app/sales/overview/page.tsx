"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SalesOverviewPage() {
  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-xl">Sales Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Sales Overview module placeholder. Implement sales KPIs and summary
            charts here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


