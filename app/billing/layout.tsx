import type React from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"

export default async function BillingLayout({
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
    redirect("/login?redirectTo=/billing")
  }

  return (
    <div className="flex h-[calc(100vh-4rem)]">
      <DashboardSidebar user={session.user} />
      <div className="flex-1 overflow-auto">{children}</div>
    </div>
  )
}
