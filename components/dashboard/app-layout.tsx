import type React from "react"
import { DashboardSidebar } from "./dashboard-sidebar"
import { DashboardHeader } from "./dashboard-header"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <div className="flex flex-1">
        <DashboardSidebar />
        <div className="flex-1 overflow-x-hidden">
          <DashboardHeader />
          <main className="w-full max-w-full overflow-x-hidden">{children}</main>
        </div>
      </div>
    </div>
  )
}
