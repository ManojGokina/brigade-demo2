"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronLeft, Package, TrendingUp } from "lucide-react"
import { useAuthStore } from "@/store/auth.store"
import { ProtectedRoute } from "@/components/protected-route"
import { Skeleton } from "@/components/ui/skeleton"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

// Map module names to routes and icons for the Inventory dashboard (dashboard_id: 103)
const MODULE_CONFIG: Record<string, { route: string; icon: typeof Package }> = {
  "Add Inventory": { route: "/inventory/add-inventory", icon: Package },
  "Stock Movement": { route: "/inventory/stock-movement", icon: TrendingUp },
}

export default function InventoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { currentDashboardModules, isLoading } = useAuthStore()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)

  const modules =
    currentDashboardModules?.filter((m) => MODULE_CONFIG[m.moduleName]) || []

  const showSkeleton = isLoading && modules.length === 0

  return (
    <ProtectedRoute>
      <div className="flex min-h-screen bg-background">
        {/* Sidebar - Desktop (matches Case Tracker layout) */}
        <aside
          className={cn(
            "fixed left-0 top-0 z-40 hidden h-screen border-r border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 lg:block",
            sidebarCollapsed ? "w-16" : "w-64"
          )}
        >
          {/* Logo + collapse */}
          <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
            {!sidebarCollapsed && (
              <Link href="/select-dashboard" className="flex flex-1 items-center justify-center">
                <img
                  src="https://tulavi.com/wp-content/uploads/2024/01/Tulavi-logo-turquoise-rgb-2.svg"
                  alt="Tulavi Logo"
                  className="h-8 w-auto"
                />
              </Link>
            )}
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
            >
              <ChevronLeft
                className={cn(
                  "h-4 w-4 transition-transform",
                  sidebarCollapsed && "rotate-180"
                )}
              />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex flex-col gap-1 p-3">
            {showSkeleton
              ? Array.from({ length: 2 }).map((_, i) => (
                  <Skeleton
                    key={i}
                    className="h-8 w-full rounded-md bg-accent/60"
                  />
                ))
              : modules.map((module) => {
                  const config = MODULE_CONFIG[module.moduleName]
                  const href = config.route
                  const Icon = config.icon
                  const active = pathname.startsWith(href)

                  return (
                    <Link
                      key={module.moduleId}
                      href={href}
                      className={cn(
                        "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors cursor-pointer",
                        active
                          ? "bg-primary/10 text-primary"
                          : "text-muted-foreground hover:bg-muted hover:text-foreground",
                        sidebarCollapsed && "justify-center"
                      )}
                      title={sidebarCollapsed ? module.moduleName : undefined}
                    >
                      <Icon
                        className="h-4 w-4 flex-shrink-0"
                        style={active ? { color: "#3b82f6" } : undefined}
                      />
                      {!sidebarCollapsed && (
                        <span className="flex-1 truncate">{module.moduleName}</span>
                      )}
                    </Link>
                  )
                })}
          </nav>
        </aside>

        {/* Main content with shared dashboard header */}
        <main
          className={cn(
            "flex-1 flex flex-col transition-all duration-300",
            sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
          )}
        >
          <DashboardHeader sidebarCollapsed={sidebarCollapsed} />
          <div className="flex-1 pt-14 px-4 py-6 lg:px-6 overflow-auto">
            {children}
          </div>
        </main>
      </div>
    </ProtectedRoute>
  )
}


