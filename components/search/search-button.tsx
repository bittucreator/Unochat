"use client"

import { Search } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useSearch } from "./search-provider"

export function SearchButton() {
  const { openSearch } = useSearch()

  return (
    <Button
      variant="outline"
      size="sm"
      className="relative h-9 w-9 p-0 xl:h-9 xl:w-60 xl:justify-start xl:px-3 xl:py-2"
      onClick={openSearch}
    >
      <Search className="h-4 w-4 xl:mr-2" />
      <span className="hidden xl:inline-flex">Search...</span>
      <kbd className="pointer-events-none absolute right-1.5 top-1.5 hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium opacity-100 xl:flex">
        <span className="text-xs">⌘</span>K
      </kbd>
    </Button>
  )
}
