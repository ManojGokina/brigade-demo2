"use client"

import { useEffect, useState } from "react"
import { useRouter, useParams } from "next/navigation"
import { ArrowLeft, Save, CheckCircle2, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { getCaseById, updateCase } from "@/lib/cases-api"
import { ProtectedRoute } from "@/components/protected-route"
import { useCaseStats } from "@/lib/case-context"

interface FormData {
  caseType: string
  surgery: string
  nervesTreated: string
  opDate: string
  specialty: string
  extremity: string
  userStatus: string
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

const SYSTEM_OPTIONS = ["Advent", "Advent Health", "AdventHealth", "ASC", "Ascension", "Atlantic Health", "Baycare", "Baylor", "Beth Isreal", "Bon Secours", "BS&W", "Carrolton Regional", "Christus", "Cleveland Clinic", "Corewell", "Dartmouth", "Deridder", "Duke", "HCA", "Holy Cross", "Hunt Regional", "Inspira", "Jefferson", "Kaiser", "Lehigh Valley", "LSU", "MGH", "Mt Sinai", "Optim", "Orlando Health", "Penn", "St. Davids", "Stanford", "Sturdy", "Tenet", "Townsend", "U of Cincinatti", "Univ of Colorado", "University Health", "USPI", "UT Southwestern", "VA", "VA Healthcare", "Wake Med", "Wood County"]
const SITE_OPTIONS = ["Advent", "Advent  Apopka", "Advent East", "Advent Health", "Apopka", "ASC Alamo Heights", "Atlanticare", "Austin ASC", "Bayfront", "Bear Creek", "Beaumont", "Brook Army Medical", "BS&W Temple", "BSW Surgicare ASC", "Carrolton Regional", "Center for Outpatient", "Center for Special Surgery", "Center One ASC", "Cincinnati", "Cleveland Clinic", "Deaconess", "Deridder", "Duke ASC", "Duke Main", "Hackensack ASC", "Hankensack Surgery Center", "Holy Cross", "Horizons West", "Hunt Regional", "Innovation Tower", "Inspira Vineland", "IPASC", "Jefferson", "Jewett Orthopedic", "Jewettt Orthopedic", "King of Prussia", "KPRC", "KPSJC", "Lehigh Valley", "LSU", "Memorial Village ASC", "MGH", "Mt Sinai", "Mullica Hill", "Northside", "Optim", "Orlando Health", "ORMC", "Overlook Medical", "Palms of Pasadena", "PENN", "Riverside", "St. Anthonys", "St. Lukes", "St. Marys", "Stanford", "Sturdy", "Temple VA", "Toledo", "Townsend", "Univ of Colorado", "University Hospital", "UT Southwestern", "Valley Regional", "Wake Med Cary", "WESC", "Wood County"]
const SURGEON_OPTIONS = ["Adams", "Barron", "Benson", "Bozenka", "Brancheau", "Braver", "Brown", "Buczek", "Buczek Jr", "C. Hoover", "Catalano", "Chang", "Chim", "Coleman", "Coye", "D. Wilson", "Dauphinee", "DeGrace", "Desai", "Diamond", "Dowlatshahi", "Drury", "Eberlin", "Eward", "Fallucco", "Felder", "Gatta", "Graves", "Hoover", "Huntsman", "Iyer", "Jack", "Jain", "Janowak", "Kachooie", "Klein", "Knapp", "Kobraei", "Kolovich", "Leversedge", "Li", "Lin", "Liu", "Lorenzana", "Minh Nguyen", "Miranda", "Mithani", "Monin", "Murdock", "Nguyen", "Parker", "Patel", "Quinnan", "Radacanu", "Reeves", "Rekant", "Rodrigues", "Rogers", "Saltzman", "Shane", "Sharma", "Sibley", "Simmons", "Smith", "Styron", "Szipala", "Thomjan", "Victor Greco", "Visgauss", "Wilson", "Wilton", "Yang", "Yurkanin", "Zuniga", "D. Bickley", "Monir", "Neidermeyer", "Park"]
const SPECIALTY_OPTIONS = ["Podiatry", "Hand", "Oncology", "Vascular", "Neurosurgery", "Trauma", "Plastics"]
const TRAINING_OPTIONS = ["Foot and Ankle", "Neuro", "Orthopedic", "Plastics", "Vascular"]
const SURGERY_PERFORMED_OPTIONS = ["Proper Digital", "Tibial", "Common Digital", "Infrapatellar", "Sural", "BKA", "TKA", "Peroneal", "Saphenous", "Revision Amp", "AKA", "Arm", "Genicular", "Radial", "Occipital", "Median", "SRN", "AIN", "PIN", "Sciatic", "Intercostal", "Axillary", "RSN", "Leg", "Spasticity", "TMR", "Lingual"]
const REGION_OPTIONS = ["Atlanta", "Mid Atlantic", "N. Florida", "N. Texas", "National", "New Orleans", "Northeast", "Ohio Valley", "S. Atlantic", "S. Florida", "S. Texas", "West"]
const TYPE_OF_SURGERY_OPTIONS = ["Capping", "Other", "TMR / TMR Adjunct", "Sheet", "Wrap"]

export default function EditCasePage() {
  const router = useRouter()
  const params = useParams()
  const caseId = params.caseId as string
  const { specialties, regions } = useCaseStats()
  
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [showError, setShowError] = useState(false)
  const [errorMessage, setErrorMessage] = useState('')
  const [formData, setFormData] = useState<FormData>({
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
  })
  const [errors, setErrors] = useState<any>({})

  const specialtyOptions = SPECIALTY_OPTIONS.length > 0 ? SPECIALTY_OPTIONS : specialties
  const regionOptions = REGION_OPTIONS.length > 0 ? REGION_OPTIONS : regions

  useEffect(() => {
    loadCase()
  }, [caseId])

  const loadCase = async () => {
    try {
      const data = await getCaseById(caseId)
      setFormData({
        caseType: data.tbd || "",
        surgery: data.surgeryPerformed || "",
        nervesTreated: data.nervesTreated?.toString() || "",
        opDate: data.operationDate ? new Date(data.operationDate).toISOString().split('T')[0] : "",
        specialty: data.specialty || "",
        extremity: data.ueLe || "",
        userStatus: data.userStatus || "",
        system: data.systemName || "",
        site: data.site || "",
        surgeon: data.surgeon || "",
        region: data.region || "",
        training: data.training || "",
        typeOfSurgery: data.useCase || "",
        neuromaCase: data.isNeuromaCase || false,
        caseStudy: data.isCaseStudy || false,
        notes: "",
      })
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to load case')
      setShowError(true)
    } finally {
      setIsLoading(false)
    }
  }

  const validateForm = (): boolean => {
    const newErrors: any = {}
    if (!formData.caseType) newErrors.caseType = "Case type is required"
    if (!formData.surgery?.trim()) newErrors.surgery = "Surgery performed is required"
    if (!formData.nervesTreated || parseInt(formData.nervesTreated) < 1) newErrors.nervesTreated = "At least 1 nerve must be treated"
    if (!formData.opDate) newErrors.opDate = "Operation date is required"
    if (!formData.specialty) newErrors.specialty = "Specialty is required"
    if (!formData.extremity) newErrors.extremity = "Extremity is required"
    if (!formData.userStatus) newErrors.userStatus = "User status is required"
    if (!formData.system?.trim()) newErrors.system = "System is required"
    if (!formData.site?.trim()) newErrors.site = "Site is required"
    if (!formData.surgeon?.trim()) newErrors.surgeon = "Surgeon is required"
    if (!formData.region) newErrors.region = "Region is required"
    if (!formData.training?.trim()) newErrors.training = "Training is required"
    if (!formData.typeOfSurgery?.trim()) newErrors.typeOfSurgery = "Type of Surgery is required"
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!validateForm()) return

    setIsSubmitting(true)
    setShowError(false)

    try {
      const apiPayload = {
        operationDate: formData.opDate,
        nervesTreated: parseInt(formData.nervesTreated),
        systemName: formData.system,
        site: formData.site,
        surgeon: formData.surgeon,
        region: formData.region,
        userStatus: formData.userStatus,
        ueLe: formData.extremity,
        surgery_Performed: formData.surgery,
        useCase: formData.typeOfSurgery,
        isNeuromaCase: formData.neuromaCase,
        isCaseStudy: formData.caseStudy,
        specialty: formData.specialty,
        training: formData.training,
        tbd: formData.caseType,
        isActive: true,
      }
      await updateCase(caseId, apiPayload)
      setShowSuccess(true)
      setTimeout(() => router.push("/tracker/cases"), 2000)
    } catch (error: any) {
      setErrorMessage(error.response?.data?.message || 'Failed to update case')
      setShowError(true)
      setIsSubmitting(false)
    }
  }

  const updateField = <K extends keyof FormData>(field: K, value: FormData[K]) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) setErrors((prev: any) => ({ ...prev, [field]: undefined }))
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
      <div className="h-full flex flex-col max-w-5xl mx-auto">
        <div className="p-4">
          <div className="mb-4 flex items-center gap-3">
            <Link href="/tracker/cases">
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-foreground">Edit Case #{caseId}</h1>
              <p className="text-xs text-muted-foreground">Update case details</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
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

            <div className="rounded-lg border border-border/60 bg-card shadow-sm p-4">
              <div className="space-y-6">
                <div className="space-y-4">
                  <div className="space-y-0.5">
                    <h2 className="text-lg font-semibold text-foreground">Case Information</h2>
                    <p className="text-xs text-muted-foreground">Basic details about the surgical case</p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="opDate" className="text-sm">Operation Date <span className="text-destructive">*</span></Label>
                      <Input id="opDate" type="date" value={formData.opDate} onChange={(e) => updateField("opDate", e.target.value)} disabled={isSubmitting} className={`h-9 w-full bg-white border border-slate-400 text-sm ${errors.opDate ? "border-destructive" : ""} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`} />
                      {errors.opDate && <p className="text-xs text-destructive mt-0.5">{errors.opDate}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="caseType" className="text-sm">Case Type <span className="text-destructive">*</span></Label>
                      <Select value={formData.caseType} onValueChange={(v) => updateField("caseType", v)} disabled={isSubmitting}>
                        <SelectTrigger id="caseType" className={`h-9 w-full bg-white border border-slate-400 text-sm ${errors.caseType ? "border-destructive" : ""} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}><SelectValue placeholder="Select type" /></SelectTrigger>
                        <SelectContent><SelectItem value="Primary">Primary</SelectItem><SelectItem value="Revision">Revision</SelectItem></SelectContent>
                      </Select>
                      {errors.caseType && <p className="text-xs text-destructive mt-0.5">{errors.caseType}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="surgery" className="text-sm">Surgery Performed <span className="text-destructive">*</span></Label>
                      <Select value={formData.surgery} onValueChange={(v) => updateField("surgery", v)} disabled={isSubmitting}>
                        <SelectTrigger id="surgery" className={`h-9 w-full bg-white border border-slate-400 text-sm ${errors.surgery ? "border-destructive" : ""} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}><SelectValue placeholder="Select surgery performed" /></SelectTrigger>
                        <SelectContent>{SURGERY_PERFORMED_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      {errors.surgery && <p className="text-xs text-destructive mt-0.5">{errors.surgery}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="nervesTreated" className="text-sm">Number of Nerves Treated <span className="text-destructive">*</span></Label>
                      <Input id="nervesTreated" type="number" min="1" placeholder="e.g., 3" value={formData.nervesTreated} onChange={(e) => updateField("nervesTreated", e.target.value)} disabled={isSubmitting} className={`h-9 w-full bg-white border border-slate-400 text-sm ${errors.nervesTreated ? "border-destructive" : ""} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`} />
                      {errors.nervesTreated && <p className="text-xs text-destructive mt-0.5">{errors.nervesTreated}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="specialty" className="text-sm">Specialty <span className="text-destructive">*</span></Label>
                      <Select value={formData.specialty} onValueChange={(v) => updateField("specialty", v)} disabled={isSubmitting}>
                        <SelectTrigger id="specialty" className={`h-9 w-full bg-white border border-slate-400 text-sm ${errors.specialty ? "border-destructive" : ""} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent>{specialtyOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      {errors.specialty && <p className="text-xs text-destructive mt-0.5">{errors.specialty}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="extremity" className="text-sm">Extremity <span className="text-destructive">*</span></Label>
                      <Select value={formData.extremity} onValueChange={(v) => updateField("extremity", v)} disabled={isSubmitting}>
                        <SelectTrigger id="extremity" className={`h-9 w-full bg-white border border-slate-400 text-sm ${errors.extremity ? "border-destructive" : ""} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}><SelectValue placeholder="Select" /></SelectTrigger>
                        <SelectContent><SelectItem value="UE">Upper (UE)</SelectItem><SelectItem value="LE">Lower (LE)</SelectItem></SelectContent>
                      </Select>
                      {errors.extremity && <p className="text-xs text-destructive mt-0.5">{errors.extremity}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="userStatus" className="text-sm">User Status <span className="text-destructive">*</span></Label>
                      <Select value={formData.userStatus} onValueChange={(v) => updateField("userStatus", v)} disabled={isSubmitting}>
                        <SelectTrigger id="userStatus" className={`h-9 w-full bg-white border border-slate-400 text-sm ${errors.userStatus ? "border-destructive" : ""} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}><SelectValue placeholder="Select status" /></SelectTrigger>
                        <SelectContent><SelectItem value="EST">EST - Established</SelectItem><SelectItem value="IN">IN - In Progress</SelectItem><SelectItem value="VAL">VAL - Validated</SelectItem></SelectContent>
                      </Select>
                      {errors.userStatus && <p className="text-xs text-destructive mt-0.5">{errors.userStatus}</p>}
                    </div>
                  </div>
                </div>
                <div className="border-t border-border/60"></div>
                <div className="space-y-4">
                  <div className="space-y-0.5">
                    <h2 className="text-lg font-semibold text-foreground">Location & Provider</h2>
                    <p className="text-xs text-muted-foreground">Where and who performed the surgery</p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="system" className="text-sm">System <span className="text-destructive">*</span></Label>
                      <Select value={formData.system} onValueChange={(v) => updateField("system", v)} disabled={isSubmitting}>
                        <SelectTrigger id="system" className={`h-9 w-full bg-white border border-slate-400 text-sm ${errors.system ? "border-destructive" : ""} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}><SelectValue placeholder="Select system" /></SelectTrigger>
                        <SelectContent>{SYSTEM_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      {errors.system && <p className="text-xs text-destructive mt-0.5">{errors.system}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="site" className="text-sm">Site <span className="text-destructive">*</span></Label>
                      <Select value={formData.site} onValueChange={(v) => updateField("site", v)} disabled={isSubmitting}>
                        <SelectTrigger id="site" className={`h-9 w-full bg-white border border-slate-400 text-sm ${errors.site ? "border-destructive" : ""} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}><SelectValue placeholder="Select site" /></SelectTrigger>
                        <SelectContent>{SITE_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      {errors.site && <p className="text-xs text-destructive mt-0.5">{errors.site}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="surgeon" className="text-sm">Surgeon <span className="text-destructive">*</span></Label>
                      <Select value={formData.surgeon} onValueChange={(v) => updateField("surgeon", v)} disabled={isSubmitting}>
                        <SelectTrigger id="surgeon" className={`h-9 w-full bg-white border border-slate-400 text-sm ${errors.surgeon ? "border-destructive" : ""} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}><SelectValue placeholder="Select surgeon" /></SelectTrigger>
                        <SelectContent>{SURGEON_OPTIONS.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}</SelectContent>
                      </Select>
                      {errors.surgeon && <p className="text-xs text-destructive mt-0.5">{errors.surgeon}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="region" className="text-sm">Region <span className="text-destructive">*</span></Label>
                      <Select value={formData.region} onValueChange={(v) => updateField("region", v)} disabled={isSubmitting}>
                        <SelectTrigger id="region" className={`h-9 w-full bg-white border border-slate-400 text-sm ${errors.region ? "border-destructive" : ""} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}><SelectValue placeholder="Select region" /></SelectTrigger>
                        <SelectContent>{regionOptions.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                      </Select>
                      {errors.region && <p className="text-xs text-destructive mt-0.5">{errors.region}</p>}
                    </div>
                  </div>
                </div>
                <div className="border-t border-border/60"></div>
                <div className="space-y-4">
                  <div className="space-y-0.5">
                    <h2 className="text-lg font-semibold text-foreground">Status & Flags</h2>
                    <p className="text-xs text-muted-foreground">Case classification and tracking flags</p>
                  </div>
                  <div className="grid gap-4 lg:grid-cols-3">
                    <div className="grid gap-1.5">
                      <Label htmlFor="training" className="text-sm">Training <span className="text-destructive">*</span></Label>
                      <Select value={formData.training} onValueChange={(v) => updateField("training", v)} disabled={isSubmitting}>
                        <SelectTrigger id="training" className={`h-9 w-full bg-white border border-slate-400 text-sm ${errors.training ? "border-destructive" : ""} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}><SelectValue placeholder="Select training" /></SelectTrigger>
                        <SelectContent>{TRAINING_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                      {errors.training && <p className="text-xs text-destructive mt-0.5">{errors.training}</p>}
                    </div>
                    <div className="grid gap-1.5">
                      <Label htmlFor="typeOfSurgery" className="text-sm">Type of Surgery <span className="text-destructive">*</span></Label>
                      <Select value={formData.typeOfSurgery} onValueChange={(v) => updateField("typeOfSurgery", v)} disabled={isSubmitting}>
                        <SelectTrigger id="typeOfSurgery" className={`h-9 w-full bg-white border border-slate-400 text-sm ${errors.typeOfSurgery ? "border-destructive" : ""} ${isSubmitting ? "opacity-50 cursor-not-allowed" : ""}`}><SelectValue placeholder="Select type of surgery" /></SelectTrigger>
                        <SelectContent>{TYPE_OF_SURGERY_OPTIONS.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                      </Select>
                      {errors.typeOfSurgery && <p className="text-xs text-destructive mt-0.5">{errors.typeOfSurgery}</p>}
                    </div>
                  </div>
                  <div onClick={(e) => { if (isSubmitting) return; const target = e.target as HTMLElement; if (target.closest('[role="switch"]') || target.closest('button')) return; updateField("neuromaCase", !formData.neuromaCase) }} className={`flex items-center justify-between rounded-lg border p-3 transition-all ${formData.neuromaCase ? "border-[#1d99ac] bg-[#1d99ac]/10 shadow-sm" : "border-border/50 bg-background/30 hover:border-border/70 hover:bg-background/40"} ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                    <div className="flex-1"><Label htmlFor="neuromaCase" className="text-sm font-medium cursor-pointer">Neuroma Case</Label><p className="text-xs text-muted-foreground mt-0.5">Case involves neuroma treatment</p></div>
                    <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}><Switch id="neuromaCase" checked={formData.neuromaCase} onCheckedChange={(v) => updateField("neuromaCase", v)} disabled={isSubmitting} className="border-2 border-slate-400 data-[state=checked]:border-[#1d99ac]" /></div>
                  </div>
                  <div onClick={(e) => { if (isSubmitting) return; const target = e.target as HTMLElement; if (target.closest('[role="switch"]') || target.closest('button')) return; updateField("caseStudy", !formData.caseStudy) }} className={`flex items-center justify-between rounded-lg border p-3 transition-all ${formData.caseStudy ? "border-[#1d99ac] bg-[#1d99ac]/10 shadow-sm" : "border-border/50 bg-background/30 hover:border-border/70 hover:bg-background/40"} ${isSubmitting ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}>
                    <div className="flex-1"><Label htmlFor="caseStudy" className="text-sm font-medium cursor-pointer">Case Study</Label><p className="text-xs text-muted-foreground mt-0.5">Include in case study documentation</p></div>
                    <div onClick={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()}><Switch id="caseStudy" checked={formData.caseStudy} onCheckedChange={(v) => updateField("caseStudy", v)} disabled={isSubmitting} className="border-2 border-slate-400 data-[state=checked]:border-[#1d99ac]" /></div>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2">
              <Link href="/tracker/cases"><Button type="button" variant="outline" size="sm" disabled={isSubmitting}>Cancel</Button></Link>
              <Button type="submit" disabled={isSubmitting} size="sm" style={{ backgroundColor: "#1d99ac" }}>
                {isSubmitting ? <span className="flex items-center gap-2"><span className="h-3 w-3 animate-spin rounded-full border-2 border-current border-t-transparent" />Updating...</span> : <span className="flex items-center gap-2"><Save className="h-3 w-3" />Update Case</span>}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </ProtectedRoute>
  )
}
