"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function PermissionsPage() {
  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-xl">Permissions</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Permissions module placeholder. Implement module/action assignment UI here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}