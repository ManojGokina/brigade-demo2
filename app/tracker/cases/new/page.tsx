"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, CheckCircle2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
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
  region: string
  training: string
  typeOfSurgery: string
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
  region?: string
  training?: string
  typeOfSurgery?: string
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
  region: "",
  training: "",
  typeOfSurgery: "",
  neuromaCase: false,
  caseStudy: false,
  notes: "",
}

// Dropdown options - Update these arrays with actual values from your data source
// Column references match the requirements table (G, H, I, J, K, L, M, N columns)
const SYSTEM_OPTIONS: string[] = [] // G column - System options
const SITE_OPTIONS: string[] = [] // H column - Site options
const SURGEON_OPTIONS: string[] = [] // I column - Surgeon options
const SPECIALTY_OPTIONS: string[] = [] // J column - Specialty options (falls back to useCaseStats if empty)
const TRAINING_OPTIONS: string[] = [] // K column - Training options
const SURGERY_PERFORMED_OPTIONS: string[] = [] // L column - Surgery Performed options
const REGION_OPTIONS: string[] = [] // M column - Region options (falls back to regions from useCaseStats if empty)
const TYPE_OF_SURGERY_OPTIONS: string[] = ["Cap", "TMR Adj", "Wrap", "Sheet"] // N column - Type of Surgery options

export default function AddCasePage() {
  const router = useRouter()
  const { addCase, getNextCaseNo } = useCases()
  const { specialties, regions, surgeons, sites } = useCaseStats()

  const [formData, setFormData] = useState<FormData>(initialFormData)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [newCaseNo, setNewCaseNo] = useState<number | null>(null)

  // Compute dropdown options to avoid key warnings
  const specialtyOptions = SPECIALTY_OPTIONS.length > 0 ? SPECIALTY_OPTIONS : specialties
  const regionOptions = REGION_OPTIONS.length > 0 ? REGION_OPTIONS : regions

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!formData.caseType) {
      newErrors.caseType = "Case type is required"
    }
    if (!formData.surgery || (typeof formData.surgery === 'string' && !formData.surgery.trim())) {
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
    if (!formData.system || (typeof formData.system === 'string' && !formData.system.trim())) {
      newErrors.system = "System is required"
    }
    if (!formData.site || (typeof formData.site === 'string' && !formData.site.trim())) {
      newErrors.site = "Site is required"
    }
    if (!formData.surgeon || (typeof formData.surgeon === 'string' && !formData.surgeon.trim())) {
      newErrors.surgeon = "Surgeon is required"
    }
    if (!formData.region) {
      newErrors.region = "Region is required"
    }
    if (!formData.training || (typeof formData.training === 'string' && !formData.training.trim())) {
      newErrors.training = "Training is required"
    }
    if (!formData.typeOfSurgery || (typeof formData.typeOfSurgery === 'string' && !formData.typeOfSurgery.trim())) {
      newErrors.typeOfSurgery = "Type of Surgery is required"
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

    // Format date for database (YYYY-MM-DD format for database, but display as MM/DD/YYYY)
    const dbDate = formData.opDate // Already in YYYY-MM-DD format from date input

    const newCaseData: Omit<Case, "caseNo"> = {
      nervesTreated: parseInt(formData.nervesTreated),
      opDate: formattedDate, // Display format MM/DD/YYYY
      type: formData.caseType as "Primary" | "Revision",
      system: formData.system,
      site: formData.site,
      surgeon: formData.surgeon,
      userStatus: formData.userStatus as "EST" | "IN" | "VAL",
      specialty: formData.specialty,
      training: formData.training, // String value from dropdown
      ueOrLe: formData.extremity as "UE" | "LE",
      surgeryPerformed: formData.surgery,
      typeOfSurgery: formData.typeOfSurgery, // Cap, TMR Adj, Wrap, Sheet - maps to use_case in database
      neuromaCase: formData.neuromaCase,
      caseStudy: formData.caseStudy,
      survivalDays: Math.max(0, survivalDays),
      survivalWeeks: Math.max(0, survivalWeeks),
      region: formData.region,
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
          style={{ backgroundColor: "rgba(29, 153, 172, 0.12)" }}
        >
          <CheckCircle2 className="h-10 w-10" style={{ color: "#1d99ac" }} />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Case Added Successfully</h2>
        <p className="mt-2 text-muted-foreground">
          Case #{newCaseNo} has been saved to the system
        </p>
        <Badge className="mt-4" style={{ backgroundColor: "#1d99ac" }}>
          Data persisted to localStorage
        </Badge>
        <p className="mt-4 text-sm text-muted-foreground">Redirecting to cases list...</p>
      </div>
    )
  }

  return (
    <ProtectedRoute>
    <div className="max-w-5xl mx-auto">
      <div className="p-4">
      {/* Header */}
      <div className="mb-4 flex items-center gap-3">
        <Link href="/tracker/cases">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <ArrowLeft className="h-4 w-4" />
          </Button>
        </Link>
        <div>
          <h1 className="text-xl font-bold tracking-tight text-foreground">Add New Case</h1>
          <p className="text-xs text-muted-foreground">
            Enter case details to add to the tracker
          </p>
        </div>
      </div>


      <form onSubmit={handleSubmit}>
        <div className="rounded-lg border border-border/60 bg-card shadow-sm p-4 overflow-visible">
          <div className="space-y-6">
            {/* Case Information Section */}
            <div className="space-y-4">
              <div className="space-y-0.5">
                <h2 className="text-lg font-semibold text-foreground">Case Information</h2>
                <p className="text-xs text-muted-foreground">Basic details about the surgical case</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="opDate" className="text-sm">
                  Operation Date <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="opDate"
                  type="date"
                  value={formData.opDate}
                  onChange={(e) => updateField("opDate", e.target.value)}
                  className={`h-9 w-full bg-white border border-slate-400 text-sm ${errors.opDate ? "border-destructive" : ""}`}
                />
                {errors.opDate && (
                  <p className="text-xs text-destructive mt-0.5">{errors.opDate}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="caseType" className="text-sm">
                  Case Type <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.caseType}
                  onValueChange={(v) => updateField("caseType", v as "Primary" | "Revision")}
                >
                  <SelectTrigger
                    id="caseType"
                    className={`h-9 w-full bg-white border border-slate-400 text-sm ${
                      errors.caseType ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Primary">Primary</SelectItem>
                    <SelectItem value="Revision">Revision</SelectItem>
                  </SelectContent>
                </Select>
                {errors.caseType && (
                  <p className="text-xs text-destructive mt-0.5">{errors.caseType}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="surgery" className="text-sm">
                  Surgery Performed <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.surgery}
                  onValueChange={(v) => updateField("surgery", v)}
                >
                  <SelectTrigger
                    id="surgery"
                    className={`h-9 w-full bg-white border border-slate-400 text-sm ${
                      errors.surgery ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select surgery performed" />
                  </SelectTrigger>
                  <SelectContent>
                    {SURGERY_PERFORMED_OPTIONS.length > 0 ? (
                      SURGERY_PERFORMED_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">No options available</div>
                    )}
                  </SelectContent>
                </Select>
                {errors.surgery && (
                  <p className="text-xs text-destructive mt-0.5">{errors.surgery}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="nervesTreated" className="text-sm">
                  Number of Nerves Treated <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="nervesTreated"
                  type="number"
                  min="1"
                  placeholder="e.g., 3"
                  value={formData.nervesTreated}
                  onChange={(e) => updateField("nervesTreated", e.target.value)}
                  className={`h-9 w-full bg-white border border-slate-400 text-sm ${
                    errors.nervesTreated ? "border-destructive" : ""
                  }`}
                />
                {errors.nervesTreated && (
                  <p className="text-xs text-destructive mt-0.5">{errors.nervesTreated}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="specialty" className="text-sm">
                  Specialty <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.specialty}
                  onValueChange={(v) => updateField("specialty", v)}
                >
                  <SelectTrigger
                    id="specialty"
                    className={`h-9 w-full bg-white border border-slate-400 text-sm ${
                      errors.specialty ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    {specialtyOptions.map((s) => (
                      <SelectItem key={s} value={s}>
                        {s}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.specialty && (
                  <p className="text-xs text-destructive mt-0.5">{errors.specialty}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="extremity" className="text-sm">
                  Extremity <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.extremity}
                  onValueChange={(v) => updateField("extremity", v as "UE" | "LE")}
                >
                  <SelectTrigger
                    id="extremity"
                    className={`h-9 w-full bg-white border border-slate-400 text-sm ${
                      errors.extremity ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="UE">Upper (UE)</SelectItem>
                    <SelectItem value="LE">Lower (LE)</SelectItem>
                  </SelectContent>
                </Select>
                {errors.extremity && (
                  <p className="text-xs text-destructive mt-0.5">{errors.extremity}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="userStatus" className="text-sm">
                  User Status <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.userStatus}
                  onValueChange={(v) => updateField("userStatus", v as "EST" | "IN" | "VAL")}
                >
                  <SelectTrigger
                    id="userStatus"
                    className={`h-9 w-full bg-white border border-slate-400 text-sm ${
                      errors.userStatus ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="EST">EST - Established</SelectItem>
                    <SelectItem value="IN">IN - In Progress</SelectItem>
                    <SelectItem value="VAL">VAL - Validated</SelectItem>
                  </SelectContent>
                </Select>
                {errors.userStatus && (
                  <p className="text-xs text-destructive mt-0.5">{errors.userStatus}</p>
                )}
              </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/60"></div>

            {/* Location & Provider Section */}
            <div className="space-y-4">
              <div className="space-y-0.5">
                <h2 className="text-lg font-semibold text-foreground">Location & Provider</h2>
                <p className="text-xs text-muted-foreground">Where and who performed the surgery</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="system" className="text-sm">
                  System <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.system}
                  onValueChange={(v) => updateField("system", v)}
                >
                  <SelectTrigger
                    id="system"
                    className={`h-9 w-full bg-white border border-slate-400 text-sm ${
                      errors.system ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select system" />
                  </SelectTrigger>
                  <SelectContent>
                    {SYSTEM_OPTIONS.length > 0 ? (
                      SYSTEM_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">No options available</div>
                    )}
                  </SelectContent>
                </Select>
                {errors.system && (
                  <p className="text-xs text-destructive mt-0.5">{errors.system}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="site" className="text-sm">
                  Site <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.site}
                  onValueChange={(v) => updateField("site", v)}
                >
                  <SelectTrigger
                    id="site"
                    className={`h-9 w-full bg-white border border-slate-400 text-sm ${
                      errors.site ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select site" />
                  </SelectTrigger>
                  <SelectContent>
                    {SITE_OPTIONS.length > 0 ? (
                      SITE_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">No options available</div>
                    )}
                  </SelectContent>
                </Select>
                {errors.site && (
                  <p className="text-xs text-destructive mt-0.5">{errors.site}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="surgeon" className="text-sm">
                  Surgeon <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.surgeon}
                  onValueChange={(v) => updateField("surgeon", v)}
                >
                  <SelectTrigger
                    id="surgeon"
                    className={`h-9 w-full bg-white border border-slate-400 text-sm ${
                      errors.surgeon ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select surgeon" />
                  </SelectTrigger>
                  <SelectContent>
                    {SURGEON_OPTIONS.length > 0 ? (
                      SURGEON_OPTIONS.map((s) => (
                        <SelectItem key={s} value={s}>
                          {s}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">No options available</div>
                    )}
                  </SelectContent>
                </Select>
                {errors.surgeon && (
                  <p className="text-xs text-destructive mt-0.5">{errors.surgeon}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="region" className="text-sm">
                  Region <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.region}
                  onValueChange={(v) => updateField("region", v)}
                >
                  <SelectTrigger
                    id="region"
                    className={`h-9 w-full bg-white border border-slate-400 text-sm ${
                      errors.region ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select region" />
                  </SelectTrigger>
                  <SelectContent>
                    {regionOptions.map((r) => (
                      <SelectItem key={r} value={r}>
                        {r}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.region && (
                  <p className="text-xs text-destructive mt-0.5">{errors.region}</p>
                )}
              </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/60"></div>

            {/* Status & Flags Section */}
            <div className="space-y-4">
              <div className="space-y-0.5">
                <h2 className="text-lg font-semibold text-foreground">Status & Flags</h2>
                <p className="text-xs text-muted-foreground">Case classification and tracking flags</p>
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
              <div className="grid gap-1.5">
                <Label htmlFor="training" className="text-sm">
                  Training <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.training}
                  onValueChange={(v) => updateField("training", v)}
                >
                  <SelectTrigger
                    id="training"
                    className={`h-9 w-full bg-white border border-slate-400 text-sm ${
                      errors.training ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select training" />
                  </SelectTrigger>
                  <SelectContent>
                    {TRAINING_OPTIONS.length > 0 ? (
                      TRAINING_OPTIONS.map((t) => (
                        <SelectItem key={t} value={t}>
                          {t}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="px-2 py-1.5 text-xs text-muted-foreground">No options available</div>
                    )}
                  </SelectContent>
                </Select>
                {errors.training && (
                  <p className="text-xs text-destructive mt-0.5">{errors.training}</p>
                )}
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="typeOfSurgery" className="text-sm">
                  Type of Surgery <span className="text-destructive">*</span>
                </Label>
                <Select
                  value={formData.typeOfSurgery}
                  onValueChange={(v) => updateField("typeOfSurgery", v)}
                >
                  <SelectTrigger
                    id="typeOfSurgery"
                    className={`h-9 w-full bg-white border border-slate-400 text-sm ${
                      errors.typeOfSurgery ? "border-destructive" : ""
                    }`}
                  >
                    <SelectValue placeholder="Select type of surgery" />
                  </SelectTrigger>
                  <SelectContent>
                    {TYPE_OF_SURGERY_OPTIONS.map((t) => (
                      <SelectItem key={t} value={t}>
                        {t}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.typeOfSurgery && (
                  <p className="text-xs text-destructive mt-0.5">{errors.typeOfSurgery}</p>
                )}
              </div>

              </div>

              <div
                onClick={(e) => {
                  const target = e.target as HTMLElement
                  // Don't toggle if clicking directly on the switch or its container
                  if (target.closest('[role="switch"]') || target.closest('button')) {
                    return
                  }
                  updateField("neuromaCase", !formData.neuromaCase)
                }}
                className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all ${
                  formData.neuromaCase
                    ? "border-[#1d99ac] bg-[#1d99ac]/10 shadow-sm"
                    : "border-border/50 bg-background/30 hover:border-border/70 hover:bg-background/40"
                }`}
              >
                <div className="flex-1">
                  <Label htmlFor="neuromaCase" className="text-sm font-medium cursor-pointer">
                    Neuroma Case
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Case involves neuroma treatment</p>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Switch
                    id="neuromaCase"
                    checked={formData.neuromaCase}
                    onCheckedChange={(v) => {
                      updateField("neuromaCase", v)
                    }}
                    className="border-2 border-slate-400 data-[state=checked]:border-[#1d99ac]"
                  />
                </div>
              </div>

              <div
                onClick={(e) => {
                  const target = e.target as HTMLElement
                  // Don't toggle if clicking directly on the switch or its container
                  if (target.closest('[role="switch"]') || target.closest('button')) {
                    return
                  }
                  updateField("caseStudy", !formData.caseStudy)
                }}
                className={`flex items-center justify-between rounded-lg border p-3 cursor-pointer transition-all ${
                  formData.caseStudy
                    ? "border-[#1d99ac] bg-[#1d99ac]/10 shadow-sm"
                    : "border-border/50 bg-background/30 hover:border-border/70 hover:bg-background/40"
                }`}
              >
                <div className="flex-1">
                  <Label htmlFor="caseStudy" className="text-sm font-medium cursor-pointer">
                    Case Study
                  </Label>
                  <p className="text-xs text-muted-foreground mt-0.5">Include in case study documentation</p>
                </div>
                <div
                  onClick={(e) => {
                    e.stopPropagation()
                  }}
                  onMouseDown={(e) => {
                    e.stopPropagation()
                  }}
                >
                  <Switch
                    id="caseStudy"
                    checked={formData.caseStudy}
                    onCheckedChange={(v) => {
                      updateField("caseStudy", v)
                    }}
                    className="border-2 border-slate-400 data-[state=checked]:border-[#1d99ac]"
                  />
                </div>
              </div>
            </div>

            {/* Divider */}
            <div className="border-t border-border/60"></div>

            {/* Additional Notes Section */}
            <div className="space-y-4">
              <div className="space-y-0.5">
                <h2 className="text-lg font-semibold text-foreground">Additional Notes</h2>
                <p className="text-xs text-muted-foreground">Any additional information about the case</p>
              </div>
              <div>
                <Textarea
                  placeholder="Enter any additional notes or observations..."
                  value={formData.notes}
                  onChange={(e) => updateField("notes", e.target.value)}
                  className="min-h-[100px] bg-white border border-slate-400 text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </form>

      {/* Footer Buttons */}
      <div className="mt-6 flex items-center justify-end gap-2">
        <Link href="/tracker/cases">
          <Button type="button" variant="outline" size="sm" className="cursor-pointer">
            Cancel
          </Button>
        </Link>
        <Button 
          type="button" 
          onClick={(e) => {
            e.preventDefault()
            const form = document.querySelector('form')
            if (form) {
              form.requestSubmit()
            }
          }}
          disabled={isSubmitting} 
          size="sm" 
          className="cursor-pointer"
          style={{ backgroundColor: "#1d99ac" }}
        >
          {isSubmitting ? (
            <span className="flex items-center gap-2">
              <span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />
              Saving...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Save className="h-3 w-3" />
              Save Case
            </span>
          )}
        </Button>
      </div>
      </div>
    </div>
    </ProtectedRoute>
  )
}
