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
  LogOut,
  ChevronLeft,
  Menu,
  RotateCcw,
  Users,
  Lock,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useAuth, type TabId } from "@/lib/auth-context"
import { useCases } from "@/lib/case-context"
import { ThemeToggle } from "@/components/theme-toggle"
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

export default function TrackerLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, isLoading, logout, canAccessTab, getTabPermission } = useAuth()
  const { resetToInitial, cases } = useCases()
  const router = useRouter()
  const pathname = usePathname()
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false)
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Filter nav items based on user permissions
  const navItems = useMemo(() => {
    if (!user) return []
    return allNavItems.filter((item) => canAccessTab(item.id))
  }, [canAccessTab, user])

  const handleReset = () => {
    if (window.confirm("Reset all case data to initial state? This will remove any cases you've added.")) {
      resetToInitial()
    }
  }

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push("/login")
    }
  }, [isLoading, isAuthenticated, router])

  // Check if user has access to current route
  useEffect(() => {
    if (!isLoading && isAuthenticated && user && navItems.length > 0) {
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
  }, [isLoading, isAuthenticated, user, pathname, canAccessTab, router, navItems])

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

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case "admin":
        return { bg: "rgba(239, 68, 68, 0.15)", color: "#ef4444" }
      case "analyst":
        return { bg: "rgba(59, 130, 246, 0.15)", color: "#3b82f6" }
      default:
        return { bg: "rgba(107, 114, 128, 0.15)", color: "#6b7280" }
    }
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

        {/* Footer section */}
        <div className="absolute bottom-0 left-0 right-0 border-t border-border/50 p-3">
          {!sidebarCollapsed ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between rounded-lg bg-muted/30 px-2 py-1.5">
                <span className="text-xs text-muted-foreground">Cases: {cases.length}</span>
                <div className="flex items-center gap-1">
                  {/* <ThemeToggle size="sm" /> */}
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-6 w-6"
                    onClick={handleReset}
                    title="Reset to initial data"
                  >
                    <RotateCcw className="h-3 w-3" />
                  </Button>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">{user?.name}</p>
                  <Badge
                    variant="secondary"
                    className="mt-0.5 text-[10px] font-medium"
                    style={getRoleBadgeColor(user?.role || "viewer")}
                  >
                    {user?.role?.toUpperCase()}
                  </Badge>
                </div>
                <Button variant="ghost" size="icon" className="h-8 w-8 flex-shrink-0" onClick={logout}>
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {/* <ThemeToggle /> */}
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 w-full"
                onClick={handleReset}
                title="Reset data"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-8 w-8 w-full" onClick={logout}>
                <LogOut className="h-4 w-4" />
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
            className="h-8 w-8"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <Menu className="h-4 w-4" />
          </Button>
          <Link href="/select-dashboard" className="flex items-center gap-2">
            <div
              className="flex h-7 w-7 items-center justify-center rounded-lg"
              style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}
            >
              <Activity className="h-3.5 w-3.5" style={{ color: "#3b82f6" }} />
            </div>
            <span className="font-semibold text-foreground">Analytics Platform</span>
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <Badge
            variant="secondary"
            className="text-[10px] font-medium"
            style={getRoleBadgeColor(user?.role || "viewer")}
          >
            {user?.role?.toUpperCase()}
          </Badge>
          {/* <ThemeToggle /> */}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={logout}>
            <LogOut className="h-4 w-4" />
          </Button>
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
          "min-h-screen flex-1 pt-14 transition-all duration-300 lg:pt-0",
          sidebarCollapsed ? "lg:pl-16" : "lg:pl-64"
        )}
      >
        {children}
      </main>
    </div>
  )
}
