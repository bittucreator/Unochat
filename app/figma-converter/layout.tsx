import type React from "react"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { AppLayout } from "@/components/dashboard/app-layout"

export default async function FigmaConverterLayout({
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
    redirect("/login?redirectTo=/figma-converter")
  }

  return <AppLayout>{children}</AppLayout>
}
