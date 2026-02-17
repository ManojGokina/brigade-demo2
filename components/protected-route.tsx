"use client"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { useAuthStore } from "@/store/auth.store"

export function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { user, token } = useAuthStore()
  const router = useRouter()
  const pathname = usePathname()
  const [isChecking, setIsChecking] = useState(true)
  const [hasRedirected, setHasRedirected] = useState(false)

  useEffect(() => {
    // Wait for client-side hydration
    if (typeof window === 'undefined') return

    // Give Zustand time to hydrate from localStorage
    const timer = setTimeout(() => {
      setIsChecking(false)
      
      // Only redirect if we're not already on login page and haven't redirected yet
      if ((!user || !token) && pathname !== '/login' && !hasRedirected) {
        setHasRedirected(true)
        router.replace("/login")
      }
    }, 300) // Increased delay to ensure Zustand has hydrated

    return () => clearTimeout(timer)
  }, [user, token, router, pathname, hasRedirected])

  // Show loading while checking
  if (isChecking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    )
  }

  // If not authenticated, don't render children (redirect will happen)
  if (!user || !token) {
    return null
  }

  return <>{children}</>
}
