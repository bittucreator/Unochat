"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { Footer } from "@/components/footer"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { usePathname } from "next/navigation"

function FooterConditional() {
  const pathname = usePathname()

  // Don't show footer in app sections
  const appPaths = ["/dashboard", "/nextjs-generator", "/figma-converter", "/settings", "/billing", "/profile"]

  const isAppPath = appPaths.some((path) => pathname?.startsWith(path))

  if (!isAppPath) {
    return <Footer />
  }

  return null
}

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <div className="flex min-h-screen flex-col">
          <Header />
          <main className="flex-1">{children}</main>
          <FooterConditional />
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}
