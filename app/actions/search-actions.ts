import type React from "react"
;("use server")

import { createServerActionClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

type SearchResult = {
  id: string
  title: string
  description?: string
  url: string
  category: "conversions" | "templates" | "settings" | "documentation" | "profile"
  icon?: React.ReactNode
}

export async function searchContent(query: string, signal?: AbortSignal): Promise<SearchResult[]> {
  if (!query.trim()) return []

  const supabase = createServerActionClient<Database>({ cookies })

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return getPublicSearchResults(query)
  }

  try {
    // Search conversions
    const { data: conversions, error: conversionsError } = await supabase
      .from("conversions")
      .select("id, url, created_at, status, type")
      .eq("user_id", user.id)
      .or(`url.ilike.%${query}%`)
      .order("created_at", { ascending: false })
      .limit(5)

    if (conversionsError) {
      console.error("Error searching conversions:", conversionsError)
    }

    // Map conversions to search results
    const conversionResults: SearchResult[] = (conversions || []).map((conversion) => ({
      id: conversion.id,
      title: conversion.url,
      description: `${conversion.type} conversion - ${conversion.status}`,
      url: `/dashboard/history?id=${conversion.id}`,
      category: "conversions",
    }))

    // Add static results based on query
    const staticResults = getStaticSearchResults(query)

    return [...conversionResults, ...staticResults]
  } catch (error) {
    console.error("Search error:", error)
    return getStaticSearchResults(query)
  }
}

// Fallback for unauthenticated users or when database search fails
function getPublicSearchResults(query: string): SearchResult[] {
  return getStaticSearchResults(query)
}

// Static search results for navigation items, settings, etc.
function getStaticSearchResults(query: string): SearchResult[] {
  const allItems: SearchResult[] = [
    {
      id: "nextjs-generator",
      title: "Next.js Generator",
      description: "Generate Next.js code from websites",
      url: "/nextjs-generator",
      category: "conversions",
    },
    {
      id: "dashboard",
      title: "Dashboard",
      description: "View your dashboard",
      url: "/dashboard",
      category: "conversions",
    },
    {
      id: "history",
      title: "Conversion History",
      description: "View your past conversions",
      url: "/dashboard/history",
      category: "conversions",
    },
    {
      id: "profile",
      title: "Profile Settings",
      description: "Manage your profile information",
      url: "/profile",
      category: "profile",
    },
    {
      id: "account-settings",
      title: "Account Settings",
      description: "Manage your account settings",
      url: "/settings",
      category: "settings",
    },
    {
      id: "billing",
      title: "Billing & Subscription",
      description: "Manage your billing information and subscription",
      url: "/billing",
      category: "settings",
    },
    {
      id: "api-settings",
      title: "API Settings",
      description: "Manage your API keys and settings",
      url: "/settings?tab=api",
      category: "settings",
    },
    {
      id: "notification-settings",
      title: "Notification Settings",
      description: "Manage your notification preferences",
      url: "/settings?tab=notifications",
      category: "settings",
    },
    {
      id: "documentation",
      title: "Documentation",
      description: "View the TooliQ documentation",
      url: "/documentation",
      category: "documentation",
    },
    {
      id: "pricing",
      title: "Pricing",
      description: "View pricing plans",
      url: "/pricing",
      category: "documentation",
    },
  ]

  // Filter items based on query
  const lowerQuery = query.toLowerCase()
  return allItems.filter(
    (item) =>
      item.title.toLowerCase().includes(lowerQuery) ||
      (item.description && item.description.toLowerCase().includes(lowerQuery)),
  )
}
