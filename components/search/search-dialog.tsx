"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Command } from "cmdk"
import { SearchIcon, FileCode, History, Settings, User, CreditCard, X, Loader2 } from "lucide-react"
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { useSearch } from "./search-provider"
import { searchContent } from "@/app/actions/search-actions"

type SearchResult = {
  id: string
  title: string
  description?: string
  url: string
  category: "conversions" | "templates" | "settings" | "documentation" | "profile"
  icon?: React.ReactNode
}

export function SearchDialog() {
  const { isOpen, closeSearch } = useSearch()
  const router = useRouter()
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  // Focus input when dialog opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus()
      }, 100)
    } else {
      setQuery("")
      setResults([])
    }
  }, [isOpen])

  // Handle search
  useEffect(() => {
    const controller = new AbortController()
    const signal = controller.signal

    const performSearch = async () => {
      if (query.trim().length === 0) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const searchResults = await searchContent(query, signal)
        setResults(searchResults)
      } catch (error) {
        if (!(error instanceof DOMException && error.name === "AbortError")) {
          console.error("Search error:", error)
        }
      } finally {
        setIsLoading(false)
      }
    }

    // Debounce search
    const timer = setTimeout(performSearch, 300)
    return () => {
      clearTimeout(timer)
      controller.abort()
    }
  }, [query])

  // Handle navigation
  const handleSelect = (result: SearchResult) => {
    router.push(result.url)
    closeSearch()
  }

  // Default categories when no search is performed
  const defaultCategories = [
    {
      name: "Quick Links",
      items: [
        {
          id: "nextjs-generator",
          title: "Next.js Generator",
          description: "Generate Next.js code from websites",
          url: "/nextjs-generator",
          category: "conversions",
          icon: <FileCode className="h-4 w-4" />,
        },
        {
          id: "history",
          title: "Conversion History",
          description: "View your past conversions",
          url: "/dashboard/history",
          category: "conversions",
          icon: <History className="h-4 w-4" />,
        },
        {
          id: "settings",
          title: "Settings",
          description: "Manage your account settings",
          url: "/settings",
          category: "settings",
          icon: <Settings className="h-4 w-4" />,
        },
        {
          id: "profile",
          title: "Profile",
          description: "View and edit your profile",
          url: "/profile",
          category: "profile",
          icon: <User className="h-4 w-4" />,
        },
        {
          id: "billing",
          title: "Billing",
          description: "Manage your subscription and billing",
          url: "/billing",
          category: "settings",
          icon: <CreditCard className="h-4 w-4" />,
        },
      ],
    },
  ]

  // Group results by category
  const groupedResults =
    query.trim().length > 0
      ? Object.entries(
          results.reduce<Record<string, SearchResult[]>>((acc, result) => {
            const category = result.category
            if (!acc[category]) {
              acc[category] = []
            }
            acc[category].push(result)
            return acc
          }, {}),
        ).map(([name, items]) => ({ name: formatCategoryName(name), items }))
      : defaultCategories

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && closeSearch()}>
      <DialogContent className="sm:max-w-[550px] p-0 gap-0 overflow-hidden">
        <Command className="rounded-lg border shadow-md">
          <div className="flex items-center border-b px-3">
            <SearchIcon className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <Command.Input
              ref={inputRef}
              value={query}
              onValueChange={setQuery}
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Search across TooliQ..."
            />
            {query.length > 0 && (
              <button
                onClick={() => setQuery("")}
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100"
              >
                <X className="h-4 w-4" />
                <span className="sr-only">Clear search</span>
              </button>
            )}
          </div>
          <Command.List className="max-h-[300px] overflow-y-auto overflow-x-hidden p-2">
            {isLoading && query.trim().length > 0 ? (
              <div className="py-6 text-center text-sm">
                <Loader2 className="mx-auto h-4 w-4 animate-spin opacity-70" />
                <p className="mt-2 text-muted-foreground">Searching...</p>
              </div>
            ) : groupedResults.length === 0 ? (
              <p className="py-6 text-center text-sm text-muted-foreground">No results found.</p>
            ) : (
              groupedResults.map((group) => (
                <div key={group.name} className="mb-2 last:mb-0">
                  <Command.Group heading={group.name}>
                    {group.items.map((result) => (
                      <Command.Item
                        key={result.id}
                        value={result.title}
                        onSelect={() => handleSelect(result)}
                        className="flex items-center gap-2 px-2 py-1.5 text-sm rounded-md cursor-pointer"
                      >
                        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md border bg-background shadow-sm">
                          {result.icon || getCategoryIcon(result.category)}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-medium">{result.title}</span>
                          {result.description && (
                            <span className="text-xs text-muted-foreground">{result.description}</span>
                          )}
                        </div>
                      </Command.Item>
                    ))}
                  </Command.Group>
                </div>
              ))
            )}
            <div className="py-2 px-2 text-xs text-muted-foreground border-t mt-2">
              <div className="flex justify-between">
                <div className="flex gap-2">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <span className="text-xs">⏎</span>
                  </kbd>
                  <span>to select</span>
                </div>
                <div className="flex gap-2">
                  <kbd className="pointer-events-none inline-flex h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground">
                    <span className="text-xs">esc</span>
                  </kbd>
                  <span>to close</span>
                </div>
              </div>
            </div>
          </Command.List>
        </Command>
      </DialogContent>
    </Dialog>
  )
}

// Helper functions
function formatCategoryName(category: string): string {
  const categoryMap: Record<string, string> = {
    conversions: "Conversions",
    templates: "Templates",
    settings: "Settings",
    documentation: "Documentation",
    profile: "Profile",
  }

  return categoryMap[category] || category.charAt(0).toUpperCase() + category.slice(1)
}

function getCategoryIcon(category: string) {
  switch (category) {
    case "conversions":
      return <FileCode className="h-4 w-4" />
    case "templates":
      return <FileCode className="h-4 w-4" />
    case "settings":
      return <Settings className="h-4 w-4" />
    case "documentation":
      return <FileCode className="h-4 w-4" />
    case "profile":
      return <User className="h-4 w-4" />
    default:
      return <SearchIcon className="h-4 w-4" />
  }
}
