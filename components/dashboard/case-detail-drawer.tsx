"use client"

import React from "react"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet"
import { Badge } from "@/components/ui/badge"
import {
  Calendar,
  User,
  MapPin,
  Stethoscope,
  Activity,
  FileText,
  Clock,
  Building2,
  GraduationCap,
  Zap,
  Hash,
  Globe,
} from "lucide-react"
import type { Case } from "@/types/case"

interface CaseDetailDrawerProps {
  caseData: Case | null
  open: boolean
  onClose: () => void
}

export function CaseDetailDrawer({ caseData, open, onClose }: CaseDetailDrawerProps) {
  if (!caseData) return null

  return (
    <Sheet open={open} onOpenChange={onClose}>
      <SheetContent className="w-full overflow-y-auto border-l border-border bg-background p-0 sm:max-w-md">
        {/* Header */}
        <div className="sticky top-0 z-10 border-b border-border bg-background px-6 py-5">
          <SheetHeader className="space-y-0">
            <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <Hash className="h-3 w-3" />
              Case Details
            </div>
            <SheetTitle className="mt-1 text-2xl font-bold text-foreground">
              {caseData.caseNo}
            </SheetTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              {caseData.surgeon} • {caseData.opDate}
            </p>
          </SheetHeader>

          {/* Status Badges */}
          <div className="mt-4 flex flex-wrap gap-2">
            <Badge
              style={{
                backgroundColor: caseData.type === "Primary" ? "#1d99ac20" : "#10b98120",
                color: caseData.type === "Primary" ? "#1d99ac" : "#10b981",
              }}
            >
              {caseData.type}
            </Badge>
            <Badge
              style={{
                backgroundColor: caseData.ueOrLe === "UE" ? "#f59e0b20" : "#ec489920",
                color: caseData.ueOrLe === "UE" ? "#f59e0b" : "#ec4899",
              }}
            >
              {caseData.ueOrLe === "UE" ? "Upper Extremity" : "Lower Extremity"}
            </Badge>
            {caseData.neuromaCase && (
              <Badge style={{ backgroundColor: "#8b5cf620", color: "#8b5cf6" }}>
                Neuroma
              </Badge>
            )}
            {caseData.caseStudy && (
              <Badge style={{ backgroundColor: "#06b6d420", color: "#06b6d4" }}>
                Case Study
              </Badge>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="px-6 py-6">
          {/* Key Metrics */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Zap className="h-4 w-4" style={{ color: "#10b981" }} />
                <span className="text-xs font-medium">Nerves Treated</span>
              </div>
              <p className="mt-2 text-3xl font-bold" style={{ color: "#10b981" }}>
                {caseData.nervesTreated}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Clock className="h-4 w-4" style={{ color: "#f59e0b" }} />
                <span className="text-xs font-medium">Survival</span>
              </div>
              <p className="mt-2 text-3xl font-bold" style={{ color: "#f59e0b" }}>
                {caseData.survivalWeeks}
                <span className="ml-1 text-sm font-normal text-muted-foreground">wks</span>
              </p>
            </div>
          </div>

          {/* Surgery Information */}
          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Stethoscope className="h-3.5 w-3.5" />
              Surgery Information
            </h3>
            <div className="mt-3 space-y-0 rounded-xl border border-border bg-card">
              <DetailItem
                icon={FileText}
                label="Surgery Performed"
                value={caseData.surgeryPerformed}
              />
              <DetailItem
                icon={Activity}
                label="Specialty"
                value={caseData.specialty}
              />
              <DetailItem
                icon={GraduationCap}
                label="Training"
                value={caseData.training || "Not specified"}
                isLast
              />
            </div>
          </div>

          {/* Location & Provider */}
          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              Location & Provider
            </h3>
            <div className="mt-3 space-y-0 rounded-xl border border-border bg-card">
              <DetailItem
                icon={User}
                label="Surgeon"
                value={caseData.surgeon}
              />
              <DetailItem
                icon={Building2}
                label="Site"
                value={caseData.site}
              />
              <DetailItem
                icon={Globe}
                label="Territory"
                value={caseData.tty}
              />
              <DetailItem
                icon={Activity}
                label="System"
                value={caseData.system}
                isLast
              />
            </div>
          </div>

          {/* Timeline */}
          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Calendar className="h-3.5 w-3.5" />
              Timeline
            </h3>
            <div className="mt-3 space-y-0 rounded-xl border border-border bg-card">
              <DetailItem
                icon={Calendar}
                label="Operation Date"
                value={caseData.opDate}
              />
              <DetailItem
                icon={Clock}
                label="Days Since Surgery"
                value={`${caseData.survivalDays} days`}
                isLast
              />
            </div>
          </div>

          {/* Status */}
          <div className="mt-6">
            <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
              <Activity className="h-3.5 w-3.5" />
              Status
            </h3>
            <div className="mt-3 space-y-0 rounded-xl border border-border bg-card">
              <DetailItem
                icon={Activity}
                label="User Status"
                value={
                  caseData.userStatus === "EST"
                    ? "Established"
                    : caseData.userStatus === "VAL"
                      ? "Validated"
                      : "In Progress"
                }
              />
              <DetailItem
                icon={FileText}
                label="Neuroma Case"
                value={caseData.neuromaCase ? "Yes" : "No"}
              />
              <DetailItem
                icon={FileText}
                label="Case Study"
                value={caseData.caseStudy ? "Yes" : "No"}
                isLast
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 border-t border-border bg-muted/50 px-6 py-4">
          <p className="text-center text-xs text-muted-foreground">
            Read-only view • Medical records system of record
          </p>
        </div>
      </SheetContent>
    </Sheet>
  )
}

interface DetailItemProps {
  icon: React.ElementType
  label: string
  value: string
  isLast?: boolean
}

function DetailItem({ icon: Icon, label, value, isLast }: DetailItemProps) {
  return (
    <div
      className={`flex items-center justify-between px-4 py-3 ${
        !isLast ? "border-b border-border" : ""
      }`}
    >
      <div className="flex items-center gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <span className="text-sm text-muted-foreground">{label}</span>
      </div>
      <span className="text-sm font-medium text-foreground">{value}</span>
    </div>
  )
}
