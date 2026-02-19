"use client"

import { Card, CardContent } from "@/components/ui/card"
import type { CaseStats } from "@/types/case"
import { Activity, Stethoscope, Users, Building2, FileText, Clock } from "lucide-react"

interface StatsCardsProps {
  stats: CaseStats
}

export function StatsCards({ stats }: StatsCardsProps) {
  const cards = [
    {
      label: "Total Cases",
      value: stats.totalCases,
      icon: Activity,
      description: `${stats.primaryCases} Primary, ${stats.revisionCases} Revision`,
      color: "#1d99ac", // brand teal
      bgColor: "rgba(29, 153, 172, 0.10)",
    },
    {
      label: "Nerves Treated",
      value: stats.totalNervesTreated,
      icon: Stethoscope,
      description: `${(stats.totalNervesTreated / stats.totalCases).toFixed(1)} avg per case`,
      color: "#10b981", // emerald
      bgColor: "rgba(16, 185, 129, 0.1)",
    },
    {
      label: "Neuroma Cases",
      value: stats.neuromaCases,
      icon: FileText,
      description: `${Math.round((stats.neuromaCases / stats.totalCases) * 100)}% of total`,
      color: "#f59e0b", // amber
      bgColor: "rgba(245, 158, 11, 0.1)",
    },
    {
      label: "Case Studies",
      value: stats.caseStudies,
      icon: FileText,
      description: `${Math.round((stats.caseStudies / stats.totalCases) * 100)}% documented`,
      color: "#ec4899", // pink
      bgColor: "rgba(236, 72, 153, 0.1)",
    },
    {
      label: "Surgeons",
      value: stats.uniqueSurgeons,
      icon: Users,
      description: `Across ${stats.uniqueSites} sites`,
      color: "#8b5cf6", // violet
      bgColor: "rgba(139, 92, 246, 0.1)",
    },
    {
      label: "Avg Survival",
      value: `${stats.avgSurvivalDays}d`,
      icon: Clock,
      description: `~${Math.round(stats.avgSurvivalDays / 7)} weeks`,
      color: "#06b6d4", // cyan
      bgColor: "rgba(6, 182, 212, 0.1)",
    },
  ]

  return (
    <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-6">
      {cards.map((card) => (
        <Card 
          key={card.label} 
          className="relative overflow-hidden border-border/60 bg-card transition-all hover:border-border"
          style={{ 
            borderLeftWidth: '3px',
            borderLeftColor: card.color,
          }}
        >
          <div 
            className="absolute inset-0 opacity-30"
            style={{ 
              background: `linear-gradient(135deg, ${card.bgColor} 0%, transparent 60%)` 
            }}
          />
          <CardContent className="relative p-4">
            <div className="flex items-center gap-2">
              <div 
                className="flex h-7 w-7 items-center justify-center rounded-md"
                style={{ backgroundColor: card.bgColor }}
              >
                <card.icon className="h-4 w-4" style={{ color: card.color }} />
              </div>
              <span className="text-xs font-medium text-muted-foreground">{card.label}</span>
            </div>
            <div className="mt-3">
              <span 
                className="text-2xl font-bold tracking-tight"
                style={{ color: card.color }}
              >
                {card.value}
              </span>
            </div>
            <p className="mt-1 text-xs text-muted-foreground">{card.description}</p>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
