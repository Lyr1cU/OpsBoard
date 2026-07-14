/**
 * Root application layout.
 *
 * Wraps every page in the OpsBoard app. Responsible for global HTML structure,
 * font loading, theme switching, SEO metadata, and production analytics.
 * Child route groups (auth, dashboard) nest inside this layout via {children}.
 */
import { Analytics } from "@vercel/analytics/next"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AppToaster } from "@/components/app-toaster"
import "./globals.css"

/** Inter font exposed as a CSS variable for Tailwind's font-sans utility. */
const inter = Inter({ subsets: ["latin"], variable: "--font-sans" })

/** Default metadata applied to all pages unless overridden by nested layouts. */
export const metadata: Metadata = {
  title: "OpsBoard",
  description: "Internal operations dashboard for digital agencies",
  icons: {
    icon: [
      {
        url: "/icon-light-32x32.png",
        media: "(prefers-color-scheme: light)",
      },
      {
        url: "/icon-dark-32x32.png",
        media: "(prefers-color-scheme: dark)",
      },
      {
        url: "/icon.svg",
        type: "image/svg+xml",
      },
    ],
    apple: "/apple-icon.png",
  },
}

/** Viewport and theme-color hints for mobile browsers and PWA install prompts. */
export const viewport: Viewport = {
  colorScheme: "light dark",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className={`${inter.variable} bg-background`} suppressHydrationWarning>
      <body className="font-sans antialiased">
        {/* System/light/dark theme via class on <html>; suppressHydrationWarning avoids mismatch on first paint. */}
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <AppToaster />
        </ThemeProvider>
        {/* Vercel Analytics is omitted in development to reduce noise. */}
        {process.env.NODE_ENV === "production" && <Analytics />}
      </body>
    </html>
  )
}
