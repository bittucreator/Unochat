"use client"

import type { SearchResult } from "@/app/actions/search-actions"

// Client-side search function that calls the server action
export async function searchClient(query: string): Promise<SearchResult[]> {
  try {
    // Use dynamic import to avoid bundling the server action with the client code
    const { searchContent } = await import("@/app/actions/search-actions")
    return await searchContent(query)
  } catch (error) {
    console.error("Search error:", error)
    return []
  }
}
