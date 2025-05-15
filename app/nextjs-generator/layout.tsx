import type React from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppSidebarLayout } from "@/components/dashboard/app-sidebar-layout"

export default async function NextJsGeneratorLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = createServerSupabaseClient()

  // Check if user is authenticated
  const {
    data: { session },
    error,
  } = await supabase.auth.getSession()

  if (error) {
    console.error("Error getting session:", error)
    redirect("/login?error=session")
  }

  if (!session) {
    redirect("/login?redirectTo=/nextjs-generator")
  }

  return <AppSidebarLayout>{children}</AppSidebarLayout>
}
