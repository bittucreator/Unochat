"use client"

import type React from "react"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { SearchProvider } from "@/components/search/search-provider"
import { SearchDialog } from "@/components/search/search-dialog"
import { Toaster } from "@/components/ui/toaster"
import { AppHeader } from "./app-header"
import { DashboardSidebar } from "./dashboard-sidebar"

export function AppLayoutWrapper({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <SearchProvider>
          <div className="flex min-h-screen flex-col">
            <AppHeader />
            <div className="flex flex-1">
              <DashboardSidebar />
              <div className="flex-1 overflow-x-hidden">
                <main className="w-full max-w-full overflow-x-hidden">
                  <div className="max-w-screen-2xl mx-auto px-4 py-6 w-full">{children}</div>
                </main>
              </div>
            </div>
          </div>
          <SearchDialog />
          <Toaster />
        </SearchProvider>
      </AuthProvider>
    </ThemeProvider>
  )
}
