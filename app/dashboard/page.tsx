import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DashboardTabs } from "@/components/dashboard/dashboard-tabs"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { RealTimeConversions } from "@/components/dashboard/real-time-conversions"

export default async function DashboardPage() {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { session },
  } = await supabase.auth.getSession()

  if (!session) {
    redirect("/login")
  }

  // Fetch user's conversion history
  const { data: conversions } = await supabase
    .from("website_conversions")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto px-4 py-12">
      <RealTimeConversions />
      <DashboardHeader user={session.user} />
      <DashboardTabs conversions={conversions || []} />
    </div>
  )
}
