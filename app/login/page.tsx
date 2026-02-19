"use client"

import { useState, useEffect, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { ArrowRight, Mail, Lock, AlertCircle, Eye, EyeOff } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useAuthStore } from "@/store/auth.store"
import { ThemeToggle } from "@/components/theme-toggle"
import { useToast } from "@/hooks/use-toast"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const { user, token, login, isLoading, error, clearError } = useAuthStore()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    setMounted(true)
    // Clear any stale errors on mount
    clearError()
  }, [])

  // Redirect if already authenticated - but only after mount and hydration
  // This prevents redirect loops by ensuring we only redirect once
  useEffect(() => {
    if (!mounted) return
    
    // Wait for hydration and ensure we're not in a loading state
    const timer = setTimeout(() => {
      // Only redirect if user exists, we're not loading, no errors, and we're on login page
      if (user && token && !isLoading && !error) {
        const currentPath = typeof window !== 'undefined' ? window.location.pathname : ''
        if (currentPath === '/login') {
          // Use replace to avoid adding to history
          router.replace("/select-dashboard")
          toast({
            title: "Welcome back",
            description: "You are already logged in.",
          })
        }
      }
    }, 500) // Longer delay to ensure Zustand has fully hydrated

    return () => clearTimeout(timer)
  }, [user, token, isLoading, error, router, mounted])

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim() || !password.trim()) return

    try {
      await login(email.trim(), password.trim())
      toast({
        title: "Login successful",
        description: "Redirecting to your dashboards...",
      })
    } catch (err: any) {
      // Error is already set in store, also show toast
      toast({
        variant: "destructive",
        title: "Login failed",
        description: err?.response?.data?.message || "Please check your credentials and try again.",
      })
      return
    }
  }

  const isValidEmail = email.includes("@") && email.includes(".")
  const isFormValid = isValidEmail && password.length >= 6

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background p-4">
      {/* Theme toggle */}
      <div className="absolute right-4 top-4">
        <ThemeToggle />
      </div>

      {/* Background decorative elements */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div 
          className="absolute -left-40 -top-40 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "linear-gradient(135deg, #3b82f6 0%, #06b6d4 100%)" }}
        />
        <div 
          className="absolute -bottom-40 -right-40 h-80 w-80 rounded-full opacity-20 blur-3xl"
          style={{ background: "linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%)" }}
        />
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 flex flex-col items-center text-center">
          <div className="mb-4">
            <img 
              src="https://tulavi.com/wp-content/uploads/2024/01/Tulavi-logo-turquoise-rgb-2.svg" 
              alt="Tulavi Logo" 
              className="h-16 w-auto"
            />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Tulavi Analytics Dashboard</h1>
          {/* <p className="mt-1 text-sm text-muted-foreground">
            Surgical Analytics Platform
          </p> */}
        </div>

        {/* Login Card */}
        <Card className="border-border/60 bg-card/80 backdrop-blur-sm">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-xl">Sign in</CardTitle>
            <CardDescription>
              Enter your email to access the dashboard
            </CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-4">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="name@hospital.org"
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value)
                      if (error) clearError()
                    }}
                    className="h-11 bg-white border border-slate-400 pl-10"
                    autoFocus
                    autoComplete="email"
                    disabled={isLoading}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value)
                      if (error) clearError()
                    }}
                    className="h-11 bg-white border border-slate-400 pl-10 pr-10"
                    autoComplete="current-password"
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    disabled={isLoading}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                className="h-11 w-full"
                disabled={!isFormValid || isLoading}
                style={{ 
                  backgroundColor: isFormValid ? "#3b82f6" : undefined,
                }}
              >
                {isLoading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Sign In
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer */}
        <p className="mt-6 text-center text-xs text-muted-foreground">
          Enterprise Healthcare Analytics Demo
        </p>
      </div>
    </div>
  )
}
