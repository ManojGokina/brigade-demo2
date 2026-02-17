"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function SalesStockOverviewPage() {
  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-xl">Stock Overview</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Stock Overview (Sales) module placeholder. Implement stock level and
            availability views here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


