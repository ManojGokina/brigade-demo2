"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function TeamPerformancePage() {
  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-xl">Team Performance</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Team Performance module placeholder. Implement sales team metrics
            and leaderboards here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


