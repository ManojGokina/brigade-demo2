"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function UsersPage() {
  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-xl">Users</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            User management dashboard (Users module). Implement user listing and
            management UI here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


