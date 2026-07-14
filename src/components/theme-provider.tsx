"use client"

/**
 * Application-wide theme context wrapper.
 *
 * Re-exports `next-themes` so the root layout can configure light/dark mode
 * without importing the library directly. Must be a client component because
 * theme resolution depends on browser APIs (localStorage, matchMedia).
 */
import type * as React from "react"
import { ThemeProvider as NextThemesProvider } from "next-themes"

/** Thin adapter around NextThemesProvider for consistent imports across the app. */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>
}
