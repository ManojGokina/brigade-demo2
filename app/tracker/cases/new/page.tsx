"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, CheckCircle2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Badge } from "@/components/ui/badge"
import { useCases, useCaseStats } from "@/lib/case-context"
import type { Case } from "@/types/case"
import { ProtectedRoute } from "@/components/protected-route"

interface FormData {
  caseType: "Primary" | "Revision" | ""
  surgery: string
  nervesTreated: string
  opDate: string
  specialty: string
  extremity: "UE" | "LE" | ""
  userStatus: "EST" | "IN" | "VAL" | ""
  system: string
  site: string
  surgeon: string
  territory: string
  training: boolean
  neuromaCase: boolean
  caseStudy: boolean
  notes: string
}

interface ValidationErrors {
  caseType?: string
  surgery?: string
  nervesTreated?: string
  opDate?: string
  specialty?: string
  extremity?: string
  userStatus?: string
  system?: string
  site?: string
  surgeon?: string
  territory?: string
}

const initialFormData: FormData = {
  caseType: "",
  surgery: "",
  nervesTreated: "",
  opDate: "",
  specialty: "",
  extremity: "",
  userStatus: "",
  system: "",
  site: "",
  surgeon: "",
  territory: "",
  training: false,
  neuromaCase: false,
  caseStudy: false,
  notes: "",
}

export default function AddCasePage() {
  const router = useRouter()
  const { addCase, getNextCaseNo } = useCases()
  const { specialties, territories, surgeons, sites } = useCaseStats()

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [newCaseNo, setNewCaseNo] = useState<number | null>(null)

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.caseType) {
      newErrors.caseType = "Case type is required"
    }
    if (!formData.surgery.trim()) {
      newErrors.surgery = "Surgery performed is required"
    }
    if (!formData.nervesTreated || parseInt(formData.nervesTreated) < 1) {
      newErrors.nervesTreated = "At least 1 nerve must be treated"
    }
    if (!formData.opDate) {
      newErrors.opDate = "Operation date is required"
    }
    if (!formData.specialty) {
      newErrors.specialty = "Specialty is required"
    }
    if (!formData.extremity) {
      newErrors.extremity = "Extremity is required"
    }
    if (!formData.userStatus) {
      newErrors.userStatus = "User status is required"
    }
    if (!formData.system.trim()) {
      newErrors.system = "System is required"
    }
    if (!formData.site.trim()) {
      newErrors.site = "Site is required"
    }
    if (!formData.surgeon.trim()) {
      newErrors.surgeon = "Surgeon is required"
    }
    if (!formData.territory) {
      newErrors.territory = "Territory is required"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsSubmitting(true)

    // Simulate brief processing delay for UX
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Parse the date to MM/DD/YYYY format
    const dateParts = formData.opDate.split("-")
    const formattedDate = `${dateParts[1]}/${dateParts[2]}/${dateParts[0]}`

    // Calculate survival days from op date to today
    const opDate = new Date(formData.opDate)
    const today = new Date()
    const survivalDays = Math.floor((today.getTime() - opDate.getTime()) / (1000 * 60 * 60 * 24))
    const survivalWeeks = Math.floor(survivalDays / 7)

    const newCaseData: Omit<Case, "caseNo"> = {
      nervesTreated: parseInt(formData.nervesTreated),
      opDate: formattedDate,
      type: formData.caseType as "Primary" | "Revision",
      system: formData.system,
      site: formData.site,
      surgeon: formData.surgeon,
      userStatus: formData.userStatus as "EST" | "IN" | "VAL",
      specialty: formData.specialty,
      training: formData.training ? "Yes" : "No",
      extremity: formData.extremity as "UE" | "LE",
      surgeryPerformed: formData.surgery,
      neuromaCase: formData.neuromaCase,
      caseStudy: formData.caseStudy,
      survivalDays: Math.max(0, survivalDays),
      survivalWeeks: Math.max(0, survivalWeeks),
      territory: formData.territory,
    }

    const newCase = addCase(newCaseData)
    setNewCaseNo(newCase.caseNo)
    setIsSubmitting(false)
    setShowSuccess(true)

    // Redirect after showing success
    setTimeout(() => {
      router.push("/tracker/cases")
    }, 2000)
  }

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    // Clear error when field is updated
    if (errors[field as keyof ValidationErrors]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }))
    }
  }

  const nextCaseNo = getNextCaseNo()

  if (showSuccess) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center p-6">
        <div
          className="mb-4 flex h-20 w-20 items-center justify-center rounded-full"
          style={{ backgroundColor: "rgba(16, 185, 129, 0.15)" }}
        >
          <CheckCircle2 className="h-10 w-10" style={{ color: "#10b981" }} />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Case Added Successfully</h2>
        <p className="mt-2 text-muted-foreground">
          Case #{newCaseNo} has been saved to the system
        </p>
        <Badge className="mt-4" style={{ backgroundColor: "#10b981" }}>
          Data persisted to localStorage
        </Badge>
        <p className="mt-4 text-sm text-muted-foreground">Redirecting to cases list...</p>
      </div>
    )
  }

  return (
    <ProtectedRoute>
    <div className="p-6">
      {/* Header */}
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/tracker/cases">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-foreground">Add New Case</h1>
            <p className="text-sm text-muted-foreground">
              Enter case details to add to the tracker
            </p>
          </div>
        </div>
        <Badge variant="outline" className="text-sm">
          Case #{nextCaseNo}
        </Badge>
      </div>

      {/* Info banner */}
      <div
        className="mb-6 flex items-start gap-3 rounded-lg border p-4"
        style={{ borderColor: "#3b82f6", backgroundColor: "rgba(59, 130, 246, 0.1)" }}
      >
        <div
          className="mt-0.5 flex h-5 w-5 items-center justify-center rounded-full"
          style={{ backgroundColor: "#3b82f6" }}
        >
          <span className="text-xs font-bold text-white">i</span>
        </div>
        <div>
          <p className="text-sm font-medium text-foreground">Persistent Demo Mode</p>
          <p className="text-sm text-muted-foreground">
            Cases you add will be saved to localStorage and persist across page refreshes. 
            Dashboard statistics will update automatically.
          </p>
        </div>
      </div>

      {/* Validation errors summary */}
      {Object.keys(errors).length > 0 && (
        <div
          className="mb-6 flex items-start gap-3 rounded-lg border p-4"
          style={{ borderColor: "#ef4444", backgroundColor: "rgba(239, 68, 68, 0.1)" }}
        >
          <AlertTriangle className="mt-0.5 h-5 w-5 flex-shrink-0" style={{ color: "#ef4444" }} />
          <div>
            <p className="text-sm font-medium text-foreground">Please fix the following errors:</p>
            <ul className="mt-1 list-inside list-disc text-sm text-muted-foreground">
              {Object.values(errors).map((error, i) => (
                <li key={i}>{error}</li>
              ))}
            </ul>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="grid gap-6 lg:grid-cols-2">
          {/* Case Information */}
          <Card className="border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Case Information</CardTitle>
              <CardDescription>Basic details about the surgical case</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="opDate">
                  Operation Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="opDate"
                  type="date"
                  value={formData.opDate}
                  onChange={(e) => updateField("opDate", e.target.value)}
                  className={`bg-background/50 ${errors.opDate ? "border-destructive" : ""}`}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="caseType">
                  Case Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.caseType}
                  onValueChange={(v) => updateField("caseType", v as "Primary" | "Revision")}
                >
                  <SelectTrigger
                    id="caseType"
                    className={`bg-background/50 ${errors.caseType ? "border-destructive" : ""}`}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Primary">Primary</SelectItem>
                    <SelectItem value="Revision">Revision</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="surgery">
                  Surgery Performed <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="surgery"
                  placeholder="e.g., Carpal Tunnel Release"
                  value={formData.surgery}
                  onChange={(e) => updateField("surgery", e.target.value)}
                  className={`bg-background/50 ${errors.surgery ? "border-destructive" : ""}`}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="nervesTreated">
                  Number of Nerves Treated <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nervesTreated"
                  type="number"
                  min="1"
                  placeholder="e.g., 3"
                  value={formData.nervesTreated}
                  onChange={(e) => updateField("nervesTreated", e.target.value)}
                  className={`bg-background/50 ${errors.nervesTreated ? "border-destructive" : ""}`}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="specialty">
                    Specialty <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.specialty}
                    onValueChange={(v) => updateField("specialty", v)}
                  >
                    <SelectTrigger
                      id="specialty"
                      className={`bg-background/50 ${errors.specialty ? "border-destructive" : ""}`}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      {specialties.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))}
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid gap-2">
                  <Label htmlFor="extremity">
                    Extremity <span className="text-destructive">*</span>
                  </Label>
                  <Select
                    value={formData.extremity}
                    onValueChange={(v) => updateField("extremity", v as "UE" | "LE")}
                  >
                    <SelectTrigger
                      id="extremity"
                      className={`bg-background/50 ${errors.extremity ? "border-destructive" : ""}`}
                    >
                      <SelectValue placeholder="Select" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="UE">Upper (UE)</SelectItem>
                      <SelectItem value="LE">Lower (LE)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="userStatus">
                  User Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.userStatus}
                  onValueChange={(v) => updateField("userStatus", v as "EST" | "IN" | "VAL")}
                >
                  <SelectTrigger
                    id="userStatus"
                    className={`bg-background/50 ${errors.userStatus ? "border-destructive" : ""}`}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EST">EST - Established</SelectItem>
                    <SelectItem value="IN">IN - In Progress</SelectItem>
                    <SelectItem value="VAL">VAL - Validated</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Location & Provider */}
          <Card className="border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Location & Provider</CardTitle>
              <CardDescription>Where and who performed the surgery</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="system">
                  System <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="system"
                  placeholder="e.g., Virtua, Penn Medicine"
                  value={formData.system}
                  onChange={(e) => updateField("system", e.target.value)}
                  className={`bg-background/50 ${errors.system ? "border-destructive" : ""}`}
                  list="systems-list"
                />
                <datalist id="systems-list">
                  {[...new Set(sites)].slice(0, 10).map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="site">
                  Site <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="site"
                  placeholder="e.g., Main Campus"
                  value={formData.site}
                  onChange={(e) => updateField("site", e.target.value)}
                  className={`bg-background/50 ${errors.site ? "border-destructive" : ""}`}
                  list="sites-list"
                />
                <datalist id="sites-list">
                  {sites.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="surgeon">
                  Surgeon <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="surgeon"
                  placeholder="e.g., Dr. Smith"
                  value={formData.surgeon}
                  onChange={(e) => updateField("surgeon", e.target.value)}
                  className={`bg-background/50 ${errors.surgeon ? "border-destructive" : ""}`}
                  list="surgeons-list"
                />
                <datalist id="surgeons-list">
                  {surgeons.map((s) => (
                    <option key={s} value={s} />
                  ))}
                </datalist>
              </div>

              <div className="grid gap-2">
                <Label htmlFor="territory">
                  Territory <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.territory}
                  onValueChange={(v) => updateField("territory", v)}
                >
                  <SelectTrigger
                    id="territory"
                    className={`bg-background/50 ${errors.territory ? "border-destructive" : ""}`}
                  >
                    <SelectValue placeholder="Select territory" />
                  </SelectTrigger>
                  <SelectContent>
                    {territories.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                    <SelectItem value="Other">Other</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* Status & Flags */}
          <Card className="border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Status & Flags</CardTitle>
              <CardDescription>Case classification and tracking flags</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/30 p-3">
                <div>
                  <Label htmlFor="training" className="font-medium">
                    Training Case
                  </Label>
                  <p className="text-xs text-muted-foreground">Mark if used for training purposes</p>
                </div>
                <Switch
                  id="training"
                  checked={formData.training}
                  onCheckedChange={(v) => updateField("training", v)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/30 p-3">
                <div>
                  <Label htmlFor="neuromaCase" className="font-medium">
                    Neuroma Case
                  </Label>
                  <p className="text-xs text-muted-foreground">Case involves neuroma treatment</p>
                </div>
                <Switch
                  id="neuromaCase"
                  checked={formData.neuromaCase}
                  onCheckedChange={(v) => updateField("neuromaCase", v)}
                />
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border/50 bg-background/30 p-3">
                <div>
                  <Label htmlFor="caseStudy" className="font-medium">
                    Case Study
                  </Label>
                  <p className="text-xs text-muted-foreground">Include in case study documentation</p>
                </div>
                <Switch
                  id="caseStudy"
                  checked={formData.caseStudy}
                  onCheckedChange={(v) => updateField("caseStudy", v)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Notes */}
          <Card className="border-border/60 bg-card">
            <CardHeader>
              <CardTitle className="text-lg">Additional Notes</CardTitle>
              <CardDescription>Any additional information about the case</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea
                placeholder="Enter any additional notes or observations..."
                value={formData.notes}
                onChange={(e) => updateField("notes", e.target.value)}
                className="min-h-[120px] bg-background/50"
              />
            </CardContent>
          </Card>
        </div>

        {/* Submit */}
        <div className="mt-6 flex items-center justify-between rounded-lg border border-border/50 bg-card/50 p-4">
          <p className="text-sm text-muted-foreground">
            Fields marked with <span className="text-destructive">*</span> are required
          </p>
          <div className="flex items-center gap-3">
            <Link href="/tracker/cases">
              <Button type="button" variant="outline">
                Cancel
              </Button>
            </Link>
            <Button type="submit" disabled={isSubmitting} style={{ backgroundColor: "#3b82f6" }}>
              {isSubmitting ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
                  Saving...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Case
                </span>
              )}
            </Button>
          </div>
        </div>
      </form>
    </div>
    </ProtectedRoute>
  )
}
