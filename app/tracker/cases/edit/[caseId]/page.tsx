"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, CheckCircle2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { getCaseById, updateCase } from "@/lib/cases-api"
import { ProtectedRoute } from "@/components/protected-route"

export default function EditCasePage() {
  const router = useRouter()
  const params = useParams()
  const caseId = params.caseId as string
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [caseData, setCaseData] = useState<any>(null)

  useEffect(() => {
    loadCase()
  }, [caseId])

  const loadCase = async () => {
    try {
      const data = await getCaseById(caseId)
      setCaseData(data)
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to load case')
      setShowError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setShowError(false)

    try {
      await updateCase(caseId, caseData)
      setShowSuccess(true)
      setTimeout(() => router.push("/tracker/cases"), 2000)
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to update case')
      setShowError(true)
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      </div>
    )
  }

  if (showSuccess) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
        <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full" style={{ backgroundColor: "rgba(29, 153, 172, 0.12)" }}>
          <CheckCircle2 className="h-10 w-10" style={{ color: "#1d99ac" }} />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Case Updated Successfully</h2>
        <p className="mt-4 text-sm text-muted-foreground">Redirecting to cases list...</p>
      </div>
    )
  }

  return (
    <ProtectedRoute>
      <div className="max-w-5xl mx-auto p-4">
        <div className="mb-4 flex items-center gap-3">
          <Link href="/tracker/cases">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-foreground">Edit Case #{caseData?.caseNumber}</h1>
            <p className="text-xs text-muted-foreground">Update case details</p>
          </div>
        </div>

        {showError && (
          <div className="mb-4 rounded-lg border border-red-200 bg-red-50 p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-semibold text-red-800">Error</h3>
                <p className="text-sm text-red-700 mt-1">{errorMessage}</p>
              </div>
              <button type="button" onClick={() => setShowError(false)} className="text-red-400 hover:text-red-600">×</button>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="rounded-lg border border-border/60 bg-card shadow-sm p-4">
            <p className="text-sm text-muted-foreground">Edit functionality coming soon. Case data loaded: {JSON.stringify(caseData, null, 2)}</p>
          </div>

          <div className="mt-6 flex items-center justify-end gap-2">
            <Link href="/tracker/cases">
              <Button type="button" variant="outline" size="sm" disabled={isSubmitting}>Cancel</Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} size="sm" style={{ backgroundColor: "#1d99ac" }}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Updating...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-3 w-3" />
                  Update Case
                </span>
              )}
            </Button>
          </div>
        </form>
      </div>
    </ProtectedRoute>
  )
}
