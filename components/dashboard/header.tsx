"use client"

import { Activity } from "lucide-react"

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <Activity className="h-4 w-4 text-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-semibold text-foreground">Analytics Platform</h1>
            <p className="text-xs text-muted-foreground">Surgical Analytics Dashboard</p>
          </div>
        </div>
        <nav className="flex items-center gap-6">
          <span className="text-sm font-medium text-foreground">Overview</span>
          <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            Cases
          </span>
          <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            Reports
          </span>
          <span className="text-sm text-muted-foreground hover:text-foreground cursor-pointer transition-colors">
            Settings
          </span>
        </nav>
      </div>
    </header>
  )
}
