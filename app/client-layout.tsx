"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { FooterConditional } from "@/components/footer-conditional"
import { SearchProvider } from "@/components/search/search-provider"
import { SearchDialog } from "@/components/search/search-dialog"
import { usePathname } from "next/navigation"

function HeaderConditional() {
  const pathname = usePathname()

  // Don't show header in app sections
  const appPaths = ["/dashboard", "/nextjs-generator", "/figma-converter", "/settings", "/billing", "/profile"]

  const isAppPath = appPaths.some((path) => pathname?.startsWith(path))

  if (!isAppPath) {
    return <Header />
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
        <SearchProvider>
          <div className="flex min-h-screen flex-col">
            <HeaderConditional />
            <main className="flex-1">{children}</main>
            <FooterConditional />
            <SearchDialog />
            <Toaster />
          </div>
        </SearchProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
