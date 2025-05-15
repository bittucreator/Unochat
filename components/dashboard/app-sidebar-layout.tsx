import type React from "react"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export function AppSidebarLayout({ children }: { children: React.ReactNode }) {
  return (
    <SidebarProvider>
      <DashboardSidebar />
      <SidebarInset className="bg-background">
        <div className="h-full max-w-full overflow-x-hidden">
          <div className="max-w-screen-2xl mx-auto px-4 py-6 w-full">{children}</div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  )
}
