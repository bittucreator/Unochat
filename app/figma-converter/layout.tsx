"use client"

import type React from "react"
import { AppHeader } from "@/components/dashboard/app-header"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

export default function FigmaConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <style jsx global>{`
        header, footer {
          display: none;
        }
      `}</style>
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
    </>
  )
}
