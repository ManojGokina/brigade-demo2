"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Activity, BarChart3, ArrowRight, Lock, Sparkles, FileText, Settings, Package } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/lib/auth-context"
import { useCaseStats } from "@/lib/case-context"
import { ThemeToggle } from "@/components/theme-toggle"

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

const dashboards: DashboardOption[] = [
  {
    id: "case-tracker",
    name: "Case Tracking Dashboard",
    description: "Surgical case tracking and analytics dashboard with real-time insights",
    icon: Activity,
    href: "/tracker/cases/new",
    color: "#3b82f6",
    bgColor: "rgba(59, 130, 246, 0.1)",
    available: true,
    badge: "Active",
  },
  {
    id: "sales-dashboard",
    name: "Sales Dashboard",
    description: "Track sales performance, revenue metrics, and team analytics",
    icon: BarChart3,
    href: "/sales",
    color: "#10b981",
    bgColor: "rgba(16, 185, 129, 0.1)",
    available: true,
    badge: "Active",
  },
  {
    id: "inventory-management",
    name: "Inventory Management",
    description: "Manage medical supplies, equipment tracking, and stock levels",
    icon: Package,
    href: "/inventory",
    color: "#f59e0b",
    bgColor: "rgba(245, 158, 11, 0.1)",
    available: true,
    badge: "Active",
  },
]

export default function SelectDashboardPage() {
  const { user, isAuthenticated, isLoading, logout } = useAuth()
  const { stats, isLoaded: caseDataLoaded } = useCaseStats()
  const router = useRouter()
  const [selectedDashboard, setSelectedDashboard] = useState<string | null>(null)

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  const handleDashboardSelect = (dashboard: DashboardOption) => {
    if (!dashboard.available) return
    setSelectedDashboard(dashboard.id)
    // Animate then navigate
    setTimeout(() => {
      router.push(dashboard.href)
    }, 300)
  }

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  if (!isAuthenticated) {
    return null
  }

  return (
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
              <p className="text-sm font-medium text-foreground">{user?.name}</p>
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
          <p className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
            Dashboard Hub
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-tight text-foreground">
            Welcome back, {user?.name?.split(" ")[0]}
          </h1>
          <p className="mt-2 text-muted-foreground">
            Select a module to access your healthcare analytics workspace
          </p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2">
          {dashboards.map((dashboard, index) => {
            const isSelected = selectedDashboard === dashboard.id
            return (
              <Card
                key={dashboard.id}
                className={`group relative overflow-hidden border-border/60 bg-card transition-all duration-300 ${
                  dashboard.available
                    ? "cursor-pointer hover:border-border hover:shadow-xl hover:-translate-y-1"
                    : "opacity-70 grayscale-[15%]"
                } ${isSelected ? "scale-95 opacity-70" : ""}`}
                style={{
                  borderLeftWidth: "4px",
                  borderLeftColor: dashboard.color,
                  animationDelay: `${index * 100}ms`,
                }}
                onClick={() => handleDashboardSelect(dashboard)}
              >
                {/* Gradient overlay */}
                <div
                  className="absolute inset-0 opacity-20 transition-opacity duration-300 group-hover:opacity-40"
                  style={{
                    background: `linear-gradient(135deg, ${dashboard.bgColor} 0%, transparent 70%)`,
                  }}
                />

                {/* Shine effect for available dashboards */}
                {dashboard.available && (
                  <div className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-white/5 to-transparent transition-transform duration-700 group-hover:translate-x-full" />
                )}

                <CardHeader className="relative pb-3">
                  <div className="flex items-center justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform duration-300 group-hover:scale-110"
                      style={{ backgroundColor: dashboard.bgColor }}
                    >
                      <dashboard.icon className="h-6 w-6" style={{ color: dashboard.color }} />
                    </div>
                    {dashboard.badge && (
                      <Badge
                        variant={dashboard.available ? "default" : "secondary"}
                        className="text-xs"
                        style={
                          dashboard.available
                            ? { backgroundColor: dashboard.color, color: "#fff" }
                            : {}
                        }
                      >
                        {dashboard.available && <Sparkles className="mr-1 h-3 w-3" />}
                        {dashboard.badge}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="mt-4 text-lg font-semibold">{dashboard.name}</CardTitle>
                  <CardDescription className="text-sm leading-relaxed">
                    {dashboard.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="relative pt-0">
                  {dashboard.available ? (
                    <div
                      className="flex items-center gap-2 text-sm font-semibold transition-all"
                      style={{ color: dashboard.color }}
                    >
                      <span>Launch Dashboard</span>
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-2" />
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Lock className="h-3.5 w-3.5" />
                      <span>Coming {dashboard.badge}</span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Quick stats */}
        <div className="mt-12 rounded-xl border border-border/50 bg-white p-6">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-medium uppercase tracking-wider text-muted-foreground">
              Platform Overview
            </h2>
            <Badge variant="outline" className="text-xs">
              Live Data
            </Badge>
          </div>
          <div className="mt-6 grid gap-8 sm:grid-cols-4">
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
          </div>
        </div>
      </main>
    </div>
  )
}
