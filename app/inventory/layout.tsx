"use client"

import React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"
import { ProtectedRoute } from "@/components/protected-route"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { cn } from "@/lib/utils"

// Map module names to routes for the Inventory dashboard (dashboard_id: 103)
const MODULE_ROUTES: Record<string, string> = {
  "Add Inventory": "/inventory/add-inventory",
  "Stock Movement": "/inventory/stock-movement",
}

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentDashboardModules, isLoading } = useAuthStore()
  const pathname = usePathname()

  const modules =
    currentDashboardModules?.filter((m) => MODULE_ROUTES[m.moduleName]) || []

  const showSkeleton = isLoading && modules.length === 0

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar */}
        <aside className="hidden w-64 border-r border-border/60 bg-card/80 px-3 py-4 lg:block">
          <div className="mb-4 px-2">
            <h2 className="text-sm font-semibold text-muted-foreground">
              Inventory Dashboard
            </h2>
          </div>
          <nav className="space-y-1">
            {showSkeleton
              ? Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-8 w-full rounded-md bg-accent/60"
                  />
                ))
              : modules.map((module) => {
                  const href = MODULE_ROUTES[module.moduleName]
                  const active = pathname.startsWith(href)

                  return (
                    <Link
                      key={module.moduleId}
                      href={href}
                      className={cn(
                        "flex items-center justify-between rounded-md px-3 py-2 text-sm font-medium transition-colors cursor-pointer",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-accent/40 hover:text-foreground"
                      )}
                    >
                      <span>{module.moduleName}</span>
                    </Link>
                  )
                })}
          </nav>
        </aside>

        {/* Main content with shared dashboard header */}
        <main className="flex-1 flex flex-col">
          <DashboardHeader sidebarCollapsed={false} />
          <div className="flex-1 pt-14 px-4 py-6 lg:px-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}


