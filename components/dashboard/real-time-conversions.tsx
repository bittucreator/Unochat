"use client"

import { useEffect } from "react"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/database.types"
import { useToast } from "@/hooks/use-toast"
import { useAuth } from "../auth/auth-provider"

export function RealTimeConversions() {
  const { user } = useAuth()
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  useEffect(() => {
    if (!user) return

    // Subscribe to real-time updates for the user's conversions
    const channel = supabase
      .channel("website_conversions_changes")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "website_conversions",
          filter: `user_id=eq.${user.id}`,
        },
        (payload) => {
          const conversion = payload.new as Tables<"website_conversions">

          if (conversion.status === "completed") {
            toast({
              title: "Conversion Completed",
              description: `Your ${conversion.type} conversion for ${new URL(conversion.url).hostname} is ready.`,
            })
          } else if (conversion.status === "failed") {
            toast({
              variant: "destructive",
              title: "Conversion Failed",
              description: `Your ${conversion.type} conversion for ${new URL(conversion.url).hostname} failed: ${conversion.error || "Unknown error"}`,
            })
          }
        },
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }, [user, supabase, toast])

  return null
}
