"use client"

import React from "react"
import { useEffect, useState, useMemo } from "react"
import { useRouter, usePathname } from "next/navigation"
import Link from "next/link"
import {
  Activity,
  LayoutDashboard,
  FileText,
  PlusCircle,
  ChevronLeft,
  Menu,
  RotateCcw,
  Users,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuthStore } from "@/store/auth.store"
import type { TabId } from "@/lib/auth-context"
import { useCases } from "@/lib/case-context"
import { ThemeToggle } from "@/components/theme-toggle"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { cn } from "@/lib/utils"

interface NavItem {
  id: TabId
  label: string
  href: string
  icon: typeof LayoutDashboard
}

const allNavItems: NavItem[] = [
  { id: "add-case", label: "Add New Case", href: "/tracker/cases/new", icon: PlusCircle },
  { id: "all-cases", label: "All Cases", href: "/tracker/cases", icon: FileText },
  { id: "overview", label: "Overview", href: "/tracker/overview", icon: LayoutDashboard },
  { id: "user-management", label: "User Management", href: "/tracker/users", icon: Users },
]

// Map module names from API to tab IDs
const MODULE_NAME_TO_TAB_ID: Record<string, TabId> = {
  "Add New Case": "add-case",
  "All Cases": "all-cases",
  "Overview": "overview",
  "User Management": "user-management",
}

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  const { user: authStoreUser, token, logout: authStoreLogout, currentDashboardModules } = useAuthStore()
  const { resetToInitial, cases } = useCases()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isChecking, setIsChecking] = useState(true)
  
  // Convert auth store user to the format expected by the layout
  const user = authStoreUser ? {
    id: authStoreUser.userId,
    name: authStoreUser.username,
    email: authStoreUser.email,
    role: "admin" as const, // Default role - you may want to get this from API
    permissions: [] // You may want to derive this from currentDashboardModules
  } : null
  
  const isAuthenticated = !!(user && token)
  const isLoading = isChecking

  // Create a map of module permissions from currentDashboardModules
  const modulePermissions = useMemo(() => {
    const permissions: Map<TabId, { canView: boolean; canCreate: boolean; canEdit: boolean; canDelete: boolean }> = new Map()
    
    if (currentDashboardModules) {
      currentDashboardModules.forEach((module) => {
        const tabId = MODULE_NAME_TO_TAB_ID[module.moduleName]
        if (tabId) {
          const actions = module.actions || []
          permissions.set(tabId, {
            canView: actions.some(a => a.actionName === "view"),
            canCreate: actions.some(a => a.actionName === "create"),
            canEdit: actions.some(a => a.actionName === "edit"),
            canDelete: actions.some(a => a.actionName === "delete"),
          })
        }
      })
    }
    
    return permissions
  }, [currentDashboardModules])

  // Filter nav items based on user permissions from modules
  const navItems = useMemo(() => {
    if (!user || !isAuthenticated) return []
    
    // If we have module permissions, filter based on them
    if (modulePermissions.size > 0) {
      return allNavItems.filter((item) => {
        const perm = modulePermissions.get(item.id)
        return perm && perm.canView // Show tab if user can view it
      })
    }
    
    // If no modules loaded yet, show all items (will be filtered once modules load)
    return allNavItems
  }, [user, isAuthenticated, modulePermissions])
  
  // Helper functions for permissions based on modules
  const canAccessTab = (tabId: TabId): boolean => {
    if (!user) return false
    
    // If we have module permissions, check them
    if (modulePermissions.size > 0) {
      const perm = modulePermissions.get(tabId)
      return perm ? perm.canView : false
    }
    
    // If no modules loaded, allow access (will be restricted once modules load)
    return true
  }
  
  const getTabPermission = (tabId: TabId): "read" | "write" | "none" => {
    if (!user) return "none"
    
    // If we have module permissions, determine permission level
    if (modulePermissions.size > 0) {
      const perm = modulePermissions.get(tabId)
      if (!perm || !perm.canView) return "none"
      
      // If user can edit or delete, they have write access
      if (perm.canEdit || perm.canDelete) return "write"
      
      // If user can only view, they have read access
      if (perm.canView) return "read"
      
      return "none"
    }
    
    // If no modules loaded, default to write (will be restricted once modules load)
    return "write"
  }
  
  const handleReset = () => {
    if (window.confirm("Reset all case data to initial state? This will remove any cases you've added.")) {
      resetToInitial()
    }
  }

  // Wait for auth store to hydrate before checking authentication
  useEffect(() => {
    if (typeof window === 'undefined') return
    
    const timer = setTimeout(() => {
      setIsChecking(false)
      // Only redirect if we're sure there's no authentication
      // Check both Zustand store and localStorage as fallback
      const hasToken = token || localStorage.getItem('auth_token')
      if (!user || !hasToken) {
        router.replace("/login")
      }
    }, 400) // Give enough time for Zustand to hydrate
    
    return () => clearTimeout(timer)
  }, [user, token, router])

  // Check if user has access to current route (only after modules are loaded)
  useEffect(() => {
    if (isChecking || !isAuthenticated || !user) return
    
    // Wait for modules to load before checking permissions
    if (currentDashboardModules && currentDashboardModules.length > 0) {
      const currentNav = allNavItems.find((item) => pathname.startsWith(item.href))
      if (currentNav && !canAccessTab(currentNav.id)) {
        // Redirect to first accessible tab
        const firstAccessible = navItems[0]
        if (firstAccessible) {
          router.push(firstAccessible.href)
        } else {
          router.push("/select-dashboard")
        }
      }
    }
  }, [isChecking, isAuthenticated, user, pathname, canAccessTab, router, navItems, currentDashboardModules])

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
    <div className="flex min-h-screen bg-background">
      {/* Sidebar - Desktop */}
      <aside
        className={cn(
          "fixed left-0 top-0 z-40 hidden h-screen border-r border-border/50 bg-card/80 backdrop-blur-sm transition-all duration-300 lg:block",
          sidebarCollapsed ? "w-16" : "w-64"
        )}
      >
        {/* Logo */}
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          {!sidebarCollapsed && (
            <Link href="/select-dashboard" className="flex items-center justify-center flex-1">
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
          {navItems.map((item) => {
            // Use exact match or check if it's the most specific matching path
            const isActive = pathname === item.href || 
              (pathname.startsWith(item.href + "/") && !navItems.some(other => 
                other.href !== item.href && 
                pathname.startsWith(other.href) && 
                other.href.length > item.href.length
              ))
            const permission = getTabPermission(item.id)
            const isReadOnly = permission === "read"
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  sidebarCollapsed && "justify-center"
                )}
                title={sidebarCollapsed ? `${item.label}${isReadOnly ? " (Read Only)" : ""}` : undefined}
              >
                <item.icon
                  className="h-4 w-4 flex-shrink-0"
                  style={isActive ? { color: "#3b82f6" } : undefined}
                />
                {!sidebarCollapsed && (
                  <span className="flex-1">{item.label}</span>
                )}
                {!sidebarCollapsed && isReadOnly && (
                  <Lock className="h-3 w-3 text-muted-foreground" />
                )}
              </Link>
            )
          })}
        </nav>

        {/* Footer section - Only Cases count and Reset button */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 p-3">
          {!sidebarCollapsed ? (
            <div className="flex items-center justify-between rounded-lg bg-muted/30 px-2 py-1.5">
              <span className="text-xs text-muted-foreground">Cases: {cases.length}</span>
              <div className="flex items-center gap-1">
                {/* <ThemeToggle size="sm" /> */}
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 cursor-pointer hover:bg-accent/50 transition-colors"
                  onClick={handleReset}
                  title="Reset to initial data"
                >
                  <RotateCcw className="h-3 w-3" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 cursor-pointer hover:bg-accent/50 transition-colors"
                onClick={handleReset}
                title="Reset data"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </aside>

      {/* Mobile header */}
      <header className="fixed left-0 right-0 top-0 z-50 flex h-14 items-center justify-between border-b border-border/50 bg-card/80 px-4 backdrop-blur-sm lg:hidden">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 cursor-pointer hover:bg-accent/50 transition-colors"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <Link href="/select-dashboard" className="flex items-center gap-2 cursor-pointer">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}
            >
              <Activity className="h-3.5 w-3.5" style={{ color: "#3b82f6" }} />
            </div>
            <span className="font-semibold text-foreground">Analytics Platform</span>
          </Link>
        </div>
      </header>

      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            onClick={() => setMobileMenuOpen(false)}
          />
          <nav className="absolute left-0 top-14 w-64 border-r border-border/50 bg-card p-3">
            {navItems.map((item) => {
              const isActive = pathname === item.href || 
                (pathname.startsWith(item.href + "/") && !navItems.some(other => 
                  other.href !== item.href && 
                  pathname.startsWith(other.href) && 
                  other.href.length > item.href.length
                ))
              const permission = getTabPermission(item.id)
              const isReadOnly = permission === "read"
              
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  )}
                >
                  <item.icon
                    className="h-4 w-4"
                    style={isActive ? { color: "#3b82f6" } : undefined}
                  />
                  <span className="flex-1">{item.label}</span>
                  {isReadOnly && (
                    <Lock className="h-3 w-3 text-muted-foreground" />
                  )}
                </Link>
              )
            })}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main
        className={cn(
          "min-h-screen flex-1 flex flex-col transition-all duration-300",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        {/* Dashboard Header - fixed at top, visible on all screen sizes */}
        <DashboardHeader sidebarCollapsed={sidebarCollapsed} />
        
        {/* Page Content - add padding top to account for fixed header */}
        <div className="flex-1 overflow-auto pt-14">
          {children}
        </div>
      </main>
    </div>
  )
}
