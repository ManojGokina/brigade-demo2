"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function AddInventoryPage() {
  return (
    <div className="space-y-4">
      <Card className="border-border/60 bg-card">
        <CardHeader>
          <CardTitle className="text-xl">Add Inventory</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Add Inventory module placeholder. Implement inventory item creation
            and management UI here.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}


