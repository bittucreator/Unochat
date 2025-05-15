"use client"

import type React from "react"

import { ThemeProvider } from "@/components/theme-provider"
import { Header } from "@/components/header"
import { AuthProvider } from "@/components/auth/auth-provider"
import { Toaster } from "@/components/ui/toaster"
import { FooterConditional } from "@/components/footer-conditional"
import { SearchProvider } from "@/components/search/search-provider"
import { SearchDialog } from "@/components/search/search-dialog"

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
            <Header />
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
