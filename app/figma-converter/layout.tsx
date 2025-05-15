import type React from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar"

export default async function FigmaConverterLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login?redirectTo=/figma-converter")
  }

  return (
    <div className="min-h-screen">
      <SidebarProvider>
        <DashboardSidebar />
        <SidebarInset className="bg-background">
          <div className="h-full">{children}</div>
        </SidebarInset>
      </SidebarProvider>
    </div>
  )
}
