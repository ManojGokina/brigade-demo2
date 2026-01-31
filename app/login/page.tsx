"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import { Activity, ArrowRight, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useAuth } from "@/lib/auth-context"
import { ThemeToggle } from "@/components/theme-toggle"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { login, isAuthenticated } = useAuth()
  const router = useRouter()

  // Redirect if already authenticated
  if (isAuthenticated) {
    router.push("/select-dashboard")
    return null
  }

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!email.trim()) return

    setIsSubmitting(true)
    // Simulate network delay for realistic feel
    await new Promise((resolve) => setTimeout(resolve, 500))
    login(email.trim())
  }

  const isValidEmail = email.includes("@") && email.includes(".")

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
          <div 
            className="mb-4 flex h-14 w-14 items-center justify-center rounded-xl"
            style={{ backgroundColor: "rgba(59, 130, 246, 0.15)" }}
          >
            <Activity className="h-7 w-7" style={{ color: "#3b82f6" }} />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Case Tracker</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Surgical Analytics Platform
          </p>
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
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="name@hospital.org"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 bg-background/50 pl-10"
                    autoFocus
                    autoComplete="email"
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  Demo mode: Any valid email format will work
                </p>
              </div>

              <Button
                type="submit"
                className="h-11 w-full"
                disabled={!isValidEmail || isSubmitting}
                style={{ 
                  backgroundColor: isValidEmail ? "#3b82f6" : undefined,
                }}
              >
                {isSubmitting ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                    Signing in...
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    Continue
                    <ArrowRight className="h-4 w-4" />
                  </span>
                )}
              </Button>
            </form>

            {/* Demo credentials hint */}
            <div className="mt-6 rounded-lg border border-border/50 bg-muted/30 p-3">
              <p className="text-xs font-medium text-muted-foreground">
                Quick access demo accounts:
              </p>
              <div className="mt-2 space-y-2">
                {[
                  { email: "admin@hospital.org", role: "Admin", color: "#ef4444", desc: "Full access" },
                  { email: "analyst@clinic.com", role: "Analyst", color: "#3b82f6", desc: "Read/Write cases" },
                  { email: "dr.smith@medical.net", role: "Viewer", color: "#6b7280", desc: "Read only" },
                ].map((demo) => (
                  <button
                    key={demo.email}
                    type="button"
                    onClick={() => setEmail(demo.email)}
                    className="flex w-full items-center justify-between rounded-md border border-border/50 bg-background/50 px-3 py-2 text-left transition-colors hover:border-primary/50"
                  >
                    <div>
                      <p className="text-xs font-medium text-foreground">{demo.email}</p>
                      <p className="text-[10px] text-muted-foreground">{demo.desc}</p>
                    </div>
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium"
                      style={{ backgroundColor: `${demo.color}20`, color: demo.color }}
                    >
                      {demo.role}
                    </span>
                  </button>
                ))}
              </div>
            </div>
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
