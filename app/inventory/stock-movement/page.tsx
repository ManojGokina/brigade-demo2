"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function StockMovementPage() {
  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-xl">Stock Movement</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Stock Movement module placeholder. Implement stock in/out tracking
            and history UI here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


