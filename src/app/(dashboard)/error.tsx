"use client"

import { useEffect } from "react"
import { Button } from "@/components/ui/button"

type DashboardErrorProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function DashboardError({ error, reset }: DashboardErrorProps) {
  useEffect(() => {
    console.error("Dashboard error:", error)
  }, [error])

  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 px-6 text-center">
      <h2 className="text-xl font-semibold text-foreground">Something went wrong</h2>
      <p className="max-w-md text-sm text-muted-foreground">
        The page failed to load. This is often a database connection issue. Try again, or sign out and
        sign back in.
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-muted-foreground">Error: {error.digest}</p>
      )}
      <div className="flex gap-2">
        <Button onClick={reset}>Try again</Button>
        <Button variant="outline" onClick={() => (window.location.href = "/login")}>
          Go to login
        </Button>
      </div>
    </div>
  )
}
