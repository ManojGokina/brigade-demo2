"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Activity, BarChart3, ArrowRight, Lock, Sparkles, Package, ShieldAlert } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { useAuthStore } from "@/store/auth.store"
import { useCaseStats } from "@/lib/case-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { ProtectedRoute } from "@/components/protected-route"
import { useToast } from "@/hooks/use-toast"

interface DashboardOption {
  id: string
  name: string
  description: string
  icon: typeof Activity
  href: string
  color: string
  bgColor: string
  available: boolean
  badge?: string
}

const DASHBOARD_ICONS: Record<string, typeof Activity> = {
  "Case Tracking Dashboard": Activity,
  "Sales Dashboard": BarChart3,
  "Inventory Management": Package,
}

const DASHBOARD_COLORS: Record<string, { color: string; bgColor: string }> = {
  "Case Tracking Dashboard": { color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.1)" },
  "Sales Dashboard": { color: "#10b981", bgColor: "rgba(16, 185, 129, 0.1)" },
  "Inventory Management": { color: "#f59e0b", bgColor: "rgba(245, 158, 11, 0.1)" },
}

// Dashboard route mapping by ID from the database
// 101 -> Case Tracking, 102 -> Sales, 103 -> Inventory, 104 -> User Management
const DASHBOARD_ROUTES_BY_ID: Record<number, string> = {
  101: "/tracker/cases/new",
  102: "/sales/overview",
  103: "/inventory/add-inventory",
  104: "/user-management/users",
}

export default function SelectDashboardPage() {
  const { user, logout, dashboardAccess, fetchDashboardAccess, fetchDashboardModules, isLoading } = useAuthStore()
  const { stats, isLoaded: caseDataLoaded } = useCaseStats()
  const router = useRouter()
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null)
  const { toast } = useToast()

  const userDashboards = dashboardAccess?.dashboards || []
  const hasAccess = userDashboards.length > 0
  const showSkeleton = isLoading && !dashboardAccess

  // Always ensure dashboard access is loaded when this page mounts / refreshes
  useEffect(() => {
    if (!user) return

    // Call backend to get fresh dashboard access on every visit/refresh
    fetchDashboardAccess().catch((error: any) => {
      console.error("Failed to fetch dashboard access on select-dashboard:", error)
      toast({
        variant: "destructive",
        title: "Failed to load dashboards",
        description: error?.response?.data?.message || "Please try again or contact support.",
      })
    })
  // we intentionally don't include dashboardAccess to avoid refetch loops
  }, [user, fetchDashboardAccess, toast])

  const handleDashboardSelect = async (dashboardId: number, name: string) => {
    setSelectedDashboard(dashboardId.toString())
    
    try {
      // Ensure we have a token before making the API call
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.error('No authentication token found')
        router.push('/login')
        return
      }
      
      await fetchDashboardModules(dashboardId)
      toast({
        title: "Dashboard selected",
        description: name,
      })
      const route = DASHBOARD_ROUTES_BY_ID[dashboardId] || "/tracker/cases/new"
      console.log('Modules fetched, navigating to:', route)
      // Use router.push for client-side navigation to avoid page reload
      await router.push(route)
    } catch (error: any) {
      console.error('Failed to fetch dashboard modules:', error)
      toast({
        variant: "destructive",
        title: "Failed to load dashboard",
        description: error?.response?.data?.message || "Please try again or contact support.",
      })
      
      // Only redirect to login if it's an authentication error
      // Otherwise, still navigate to the dashboard
      if (error.response?.status === 401 || error.message?.includes('authentication')) {
        console.error('Authentication error - redirecting to login')
        router.push('/login')
      } else {
        // For other errors, still navigate to the dashboard
        const route = DASHBOARD_ROUTES[name] || "/tracker/cases/new"
        await router.push(route)
      }
    }
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-muted/10">
      {/* Header */}
      <header className="border-b border-border/50 bg-white backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <img 
              src="https://tulavi.com/wp-content/uploads/2024/01/Tulavi-logo-turquoise-rgb-2.svg" 
              alt="Tulavi Logo" 
              className="h-8 w-auto"
            />
            <span className="font-semibold text-foreground">Tulavi Analytics Dashboard</span>
          </div>
          <div className="flex items-center gap-3">
            {/* <ThemeToggle /> */}
            <div className="text-right">
              <p className="text-sm font-medium text-foreground">{user?.username}</p>
              <p className="text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button variant="outline" size="sm" onClick={logout}>
              Sign out
            </Button>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="mx-auto max-w-6xl px-6 py-12">
        <div className="mb-10">
          {showSkeleton ? (
            <div className="space-y-3">
              <Skeleton className="h-4 w-32 rounded-full" />
              <Skeleton className="h-8 w-64 rounded-lg" />
              <Skeleton className="h-4 w-80 rounded-full max-w-full" />
            </div>
          ) : (
            <>
              <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                Dashboard Hub
              </p>
              <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
                Welcome back, {user?.username?.split(" ")[0]}
              </h1>
              <p className="mt-2 text-muted-foreground">
                {hasAccess ? "Select a module to access your healthcare analytics workspace" : "Contact your administrator for dashboard access"}
              </p>
            </>
          )}
        </div>

        {showSkeleton ? (
          <div className="grid gap-6 sm:grid-cols-2">
            {[0, 1].map((i) => (
              <Card
                key={i}
                className="relative overflow-hidden border-border/60 bg-card/60"
                style={{
                  borderLeftWidth: "4px",
                }}
              >
                <CardHeader className="relative pb-3 space-y-4">
                  <div className="flex items-center justify-between">
                    <Skeleton className="h-12 w-12 rounded-xl" />
                    <Skeleton className="h-6 w-16 rounded-full" />
                  </div>
                  <div className="space-y-2">
                    <Skeleton className="h-5 w-40 rounded-lg" />
                    <Skeleton className="h-4 w-full rounded-lg" />
                    <Skeleton className="h-4 w-3/4 rounded-lg" />
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  <Skeleton className="h-5 w-32 rounded-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !hasAccess ? (
          <div className="flex min-h-[400px] items-center justify-center">
            <div className="text-center">
              <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(239, 68, 68, 0.1)" }}>
                <ShieldAlert className="h-10 w-10" style={{ color: "#ef4444" }} />
              </div>
              <h2 className="text-2xl font-bold text-foreground">No Dashboard Access</h2>
              <p className="mt-2 text-muted-foreground max-w-md">
                You currently don't have access to any dashboards. Please contact your system administrator to request access.
              </p>
            </div>
          </div>
        ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {userDashboards.map((dashboard, index) => {
            const isSelected = selectedDashboard === dashboard.id.toString()
            const Icon = DASHBOARD_ICONS[dashboard.name] || Activity
            const colors = DASHBOARD_COLORS[dashboard.name] || { color: "#3b82f6", bgColor: "rgba(59, 130, 246, 0.1)" }
            return (
              <Card
                key={dashboard.id}
                className={`group relative overflow-hidden border-border/60 bg-card transition-all duration-300 ${isSelected && isLoading ? "opacity-50 cursor-wait" : "cursor-pointer hover:border-border hover:shadow-xl hover:-translate-y-1"} ${isSelected && !isLoading ? "scale-95 opacity-70" : ""}`}
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor: colors.color,
                  animationDelay: `${index * 100}ms`,
                }}
                onClick={() => !isLoading && handleDashboardSelect(dashboard.id, dashboard.name)}
              >
                <div
                  className="absolute inset-0 opacity-20 transition-opacity duration-300 group-hover:opacity-40"
                  style={{
                    background: `linear-gradient(135deg, ${colors.bgColor} 0%, transparent 70%)`,
                  }}
                />
                <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />

                <CardHeader className="relative pb-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: colors.bgColor }}
                    >
                      <Icon className="h-6 w-6" style={{ color: colors.color }} />
                    </div>
                    {dashboard.is_active && (
                      <Badge
                        variant="default"
                        className="text-xs"
                        style={{ backgroundColor: colors.color, color: "#fff" }}
                      >
                        <Sparkles className="mr-1 h-3 w-3" />
                        Active
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-lg font-semibold">{dashboard.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {dashboard.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative pt-0">
                  {isSelected && isLoading ? (
                    <div className="flex items-center gap-2 text-sm font-semibold">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" style={{ borderColor: colors.color, borderTopColor: "transparent" }} />
                      <span style={{ color: colors.color }}>Loading...</span>
                    </div>
                  ) : (
                    <div
                      className="flex items-center gap-2 text-sm font-semibold transition-all"
                      style={{ color: colors.color }}
                    >
                      <span>Launch Dashboard</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
        )}

        {hasAccess && (
        <>
        {/* Quick stats */}
        <div className="mt-12 rounded-xl border border-border/50 bg-white p-6">
          <div className="flex items-center justify-between">
            {showSkeleton ? (
              <>
                <Skeleton className="h-4 w-32 rounded-full" />
                <Skeleton className="h-6 w-16 rounded-full" />
              </>
            ) : (
              <>
                <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
                  Platform Overview
                </h2>
                <Badge variant="outline" className="text-xs">
                  Live Data
                </Badge>
              </>
            )}
          </div>
          <div className="mt-6 grid gap-8 sm:grid-cols-4">
            {showSkeleton ? (
              [0, 1, 2, 3].map((i) => (
                <div className="relative space-y-2" key={i}>
                  <Skeleton className="absolute -left-3 top-0 h-full w-1 rounded-full" />
                  <Skeleton className="h-8 w-16 rounded-lg" />
                  <Skeleton className="h-4 w-24 rounded-full" />
                </div>
              ))
            ) : (
              <>
                <div className="relative">
                  <div
                    className="absolute -left-3 top-0 h-full w-1 rounded-full"
                    style={{ backgroundColor: "#3b82f6" }}
                  />
                  <p className="text-3xl font-bold" style={{ color: "#3b82f6" }}>
                    {caseDataLoaded && stats ? stats.totalCases : "..."}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Total Cases</p>
                </div>
                <div className="relative">
                  <div
                    className="absolute -left-3 top-0 h-full w-1 rounded-full"
                    style={{ backgroundColor: "#10b981" }}
                  />
                  <p className="text-3xl font-bold" style={{ color: "#10b981" }}>
                    {caseDataLoaded && stats ? stats.uniqueSurgeons : "..."}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Active Surgeons</p>
                </div>
                <div className="relative">
                  <div
                    className="absolute -left-3 top-0 h-full w-1 rounded-full"
                    style={{ backgroundColor: "#f59e0b" }}
                  />
                  <p className="text-3xl font-bold" style={{ color: "#f59e0b" }}>
                    {caseDataLoaded && stats ? stats.uniqueSites : "..."}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Active Sites</p>
                </div>
                <div className="relative">
                  <div
                    className="absolute -left-3 top-0 h-full w-1 rounded-full"
                    style={{ backgroundColor: "#8b5cf6" }}
                  />
                  <p className="text-3xl font-bold" style={{ color: "#8b5cf6" }}>
                    {caseDataLoaded && stats ? stats.totalNervesTreated : "..."}
                  </p>
                  <p className="mt-1 text-sm text-muted-foreground">Nerves Treated</p>
                </div>
              </>
            )}
          </div>
        </div>
        </>
        )}
      </main>
    </div>
    </ProtectedRoute>
  )
}
