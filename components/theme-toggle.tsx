"use client"

import * as React from "react"
import { Moon, Sun } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface ThemeToggleProps {
  size?: "default" | "sm"
  className?: string
}

export function ThemeToggle({ size = "default", className }: ThemeToggleProps) {
  const { theme, setTheme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = React.useState(false)
  const [currentTheme, setCurrentTheme] = React.useState<string>("light")

  React.useEffect(() => {
    setMounted(true)
  }, [])

  React.useEffect(() => {
    // Check actual DOM for theme class as fallback
    const htmlElement = document.documentElement
    const isDarkClass = htmlElement.classList.contains("dark")
    const actualTheme = resolvedTheme || theme || (isDarkClass ? "dark" : "light")
    setCurrentTheme(actualTheme)
  }, [theme, resolvedTheme])

  const sizeClasses = size === "sm" ? "h-6 w-6" : "h-9 w-9"
  const iconClasses = size === "sm" ? "h-3 w-3" : "h-4 w-4"

  if (!mounted) {
    return (
      <Button variant="outline" size="icon" className={cn(sizeClasses, className)} disabled>
        <Sun className={iconClasses} />
        <span className="sr-only">Toggle theme</span>
      </Button>
    )
  }

  const isDark = currentTheme === "dark"

  const handleToggle = () => {
    const newTheme = isDark ? "light" : "dark"
    setTheme(newTheme)
    setCurrentTheme(newTheme)
    // Also manually toggle the class as a backup
    document.documentElement.classList.remove("light", "dark")
    document.documentElement.classList.add(newTheme)
  }

  return (
    <Button
      variant="outline"
      size="icon"
      className={cn(sizeClasses, className)}
      onClick={handleToggle}
    >
      {isDark ? (
        <Sun className={iconClasses} />
      ) : (
        <Moon className={iconClasses} />
      )}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}
