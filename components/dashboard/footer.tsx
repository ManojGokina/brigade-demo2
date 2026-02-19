export function Footer() {
  const currentYear = new Date().getFullYear()
  
  return (
    <footer className="border-t border-border/30 bg-background/50 py-3">
      <div className="px-6 text-center">
        <p className="text-xs text-muted-foreground">
          © {currentYear} All rights reserved to Brigade Solutions Pvt Ltd
        </p>
      </div>
    </footer>
  )
}
