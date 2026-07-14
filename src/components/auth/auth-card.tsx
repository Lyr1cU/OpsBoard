/**
 * Shared card shell for unauthenticated login and registration pages.
 *
 * Centers the OpsBoard brand mark, page title, and child form content inside a
 * constrained card layout used by both auth flows.
 */
import Link from "next/link"
import type { ReactNode } from "react"
import { Layers } from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"

type AuthCardProps = {
  title: string
  children: ReactNode
}

export function AuthCard({ title, children }: AuthCardProps) {
  return (
    <Card className="w-full max-w-[420px] border-border shadow-sm">
      <CardContent className="p-8">
        <div className="mb-8 flex flex-col items-center gap-4 text-center">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-md bg-primary text-primary-foreground">
              <Layers className="size-5" />
            </div>
            <span className="text-lg font-semibold tracking-tight text-foreground">OpsBoard</span>
          </Link>
          <h1 className="text-xl font-semibold tracking-tight text-foreground">{title}</h1>
        </div>
        {children}
      </CardContent>
    </Card>
  )
}
