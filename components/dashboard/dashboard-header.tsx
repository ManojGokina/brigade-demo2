"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Home, LogOut } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuthStore } from "@/store/auth.store"
import { cn } from "@/lib/utils"

// Route mapping by dashboard ID
// 101 -> Case Tracking, 102 -> Sales, 103 -> Inventory, 104 -> User Management
const DASHBOARD_ROUTES_BY_ID: Record<number, string> = {
  101: "/tracker/cases/new",
  102: "/sales/overview",
  103: "/inventory/add-inventory",
  104: "/user-management/users",
}

interface DashboardHeaderProps {
  sidebarCollapsed?: boolean
}

export function DashboardHeader({ sidebarCollapsed = false }: DashboardHeaderProps) {
  const router = useRouter()
  const { 
    user, 
    dashboardAccess, 
    currentDashboardId, 
    fetchDashboardAccess, 
    fetchDashboardModules,
    logout,
    isLoading 
  } = useAuthStore()
  
  const [isSwitching, setIsSwitching] = useState(false)

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }
      case "analyst":
        return { bg: "rgba(29, 153, 172, 0.12)", color: "#1d99ac" }
      default:
        return { bg: "rgba(107, 114, 128, 0.15)", color: "#6b7280" }
    }
  }

  const handleLogout = () => {
    logout()
    router.push("/login")
  }

  // Fetch dashboard access on mount if not available
  useEffect(() => {
    if (!dashboardAccess && user) {
      fetchDashboardAccess()
    }
  }, [dashboardAccess, user, fetchDashboardAccess])

  const userDashboards = dashboardAccess?.dashboards || []
  
  // Find current dashboard
  const currentDashboard = userDashboards.find(
    (d) => d.id === currentDashboardId
  )

  const handleHomeClick = () => {
    router.push("/select-dashboard")
  }

  const handleDashboardChange = async (dashboardId: string) => {
    if (!dashboardId || dashboardId === String(currentDashboardId)) return

    setIsSwitching(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) {
        console.error('No authentication token found')
        router.push('/login')
        return
      }

      const selectedDashboard = userDashboards.find(
        (d) => d.id === Number(dashboardId)
      )

      if (!selectedDashboard) {
        console.error('Dashboard not found')
        return
      }

      // Fetch modules for the selected dashboard
      await fetchDashboardModules(Number(dashboardId))
      
      // Navigate to the appropriate route based on dashboard ID
      const route = DASHBOARD_ROUTES_BY_ID[selectedDashboard.id] || "/tracker/cases/new"
      router.push(route)
    } catch (error: any) {
      console.error('Failed to switch dashboard:', error)
      if (error.response?.status === 401 || error.message?.includes('authentication')) {
        router.push('/login')
      }
    } finally {
      setIsSwitching(false)
    }
  }

  return (
    <header 
      className={cn(
        "fixed top-0 z-50 flex h-16 items-center justify-between border-b border-border/50 bg-card/95 backdrop-blur-md px-4 shadow-sm",
        "transition-all duration-300",
        sidebarCollapsed ? "lg:left-16" : "lg:left-64",
        "left-0 right-0 lg:px-6"
      )}
    >
      {/* Left Section - Home Button */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="sm"
          onClick={handleHomeClick}
          className="flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium shadow-sm transition-all cursor-pointer"
          style={{
            backgroundColor: "#1d99ac",
            color: "#ffffff",
          }}
        >
          <Home className="h-4 w-4" />
          <span className="hidden sm:inline font-medium">Home</span>
        </Button>
      </div>

      {/* Center Section - Dashboard Dropdown */}
      <div className="flex-1 flex items-center justify-center px-4">
        {userDashboards.length > 0 && (
          <div className="flex items-center gap-3 w-full max-w-md justify-center">
            <span className="hidden md:inline text-sm font-medium text-muted-foreground whitespace-nowrap">Dashboard:</span>
            <Select
              value={currentDashboardId ? String(currentDashboardId) : undefined}
              onValueChange={handleDashboardChange}
              disabled={isSwitching || isLoading}
            >
              <SelectTrigger className="w-full cursor-pointer bg-white border border-slate-400 hover:border-primary/50 hover:bg-accent/30 transition-all focus:ring-2 focus:ring-primary/20 focus:border-primary">
                <SelectValue placeholder="Select dashboard">
                  {isSwitching ? (
                    <span className="text-muted-foreground">Switching...</span>
                  ) : currentDashboard ? (
                    <span className="font-semibold text-foreground">{currentDashboard.name}</span>
                  ) : (
                    "Select dashboard"
                  )}
                </SelectValue>
              </SelectTrigger>
              <SelectContent className="cursor-pointer">
                {userDashboards.map((dashboard) => (
                  <SelectItem 
                    key={dashboard.id} 
                    value={String(dashboard.id)}
                    disabled={!dashboard.is_active}
                    className="cursor-pointer hover:bg-primary/10 hover:text-primary focus:bg-primary/10 transition-colors font-medium"
                  >
                    <div className="flex items-center gap-2">
                      <span>{dashboard.name}</span>
                      {!dashboard.is_active && (
                        <span className="text-xs text-muted-foreground">(Inactive)</span>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
      </div>

      {/* Right Section - User Info & Logout */}
      <div className="flex items-center gap-3">
        {user && (
          <>
            {/* Username + role on a single line */}
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gradient-to-r from-muted/40 to-muted/20 border border-border/50 hover:border-border transition-colors cursor-default">
              <span className="text-sm font-semibold text-foreground">
                {user.username}
              </span>
              <Badge
                variant="secondary"
                className="text-[10px] font-bold px-2 py-0.5"
                style={getRoleBadgeColor("admin")}
              >
                ADMIN
              </Badge>
            </div>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-2 bg-destructive/10 text-destructive border-destructive/20 transition-all cursor-pointer rounded-lg px-3 border"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Logout</span>
            </Button>
          </>
        )}
      </div>
    </header>
  )
}

