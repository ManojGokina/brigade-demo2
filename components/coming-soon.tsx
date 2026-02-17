import { Rocket, Sparkles } from "lucide-react"

interface ComingSoonProps {
  title?: string
  description?: string
}

export function ComingSoon({ 
  title = "Coming Soon", 
  description = "This feature is currently under development and will be available soon." 
}: ComingSoonProps) {
  return (
    <div className="flex min-h-[calc(100vh-4rem)] items-center justify-center p-6">
      <div className="text-center max-w-md">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-primary/20 to-primary/5 animate-pulse">
          <Rocket className="h-10 w-10 text-primary" />
        </div>
        <h2 className="text-2xl font-bold text-foreground mb-3 flex items-center justify-center gap-2">
          {title}
          <Sparkles className="h-5 w-5 text-primary" />
        </h2>
        <p className="text-muted-foreground leading-relaxed">
          {description}
        </p>
      </div>
    </div>
  )
}
