"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function RolesPage() {
  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-xl">Roles</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Roles module placeholder. Implement role definitions and management UI here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}