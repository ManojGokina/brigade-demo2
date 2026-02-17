"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UserActivityPage() {
  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-xl">User Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            User Activity module placeholder. Implement login/activity log views here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}