"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search } from "lucide-react"
import Link from "next/link"
import { useMobile } from "@/hooks/use-mobile"

export function Sidebar() {
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(!isMobile)

  if (isMobile && !isOpen) {
    return (
      <Button variant="ghost" size="icon" className="fixed left-4 top-4 z-50" onClick={() => setIsOpen(true)}>
        <span className="sr-only">Open sidebar</span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="lucide lucide-menu"
        >
          <line x1="4" x2="20" y1="12" y2="12" />
          <line x1="4" x2="20" y1="6" y2="6" />
          <line x1="4" x2="20" y1="18" y2="18" />
        </svg>
      </Button>
    )
  }

  return (
    <div
      className={`${isMobile ? "fixed inset-0 z-50" : "relative"} w-64 h-full bg-purple-50 dark:bg-purple-950 flex flex-col border-r border-purple-100 dark:border-purple-900`}
    >
      {isMobile && (
        <Button variant="ghost" size="icon" className="absolute right-4 top-4" onClick={() => setIsOpen(false)}>
          <span className="sr-only">Close sidebar</span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className="lucide lucide-x"
          >
            <path d="M18 6 6 18" />
            <path d="m6 6 12 12" />
          </svg>
        </Button>
      )}

      <div className="p-4 flex items-center">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="text-purple-600 mr-2"
        >
          <path d="m14.5 2-6 6c-1.7 1.7-1.7 4.3 0 6l6 6" />
          <path d="m19 2-6 6c-1.7 1.7-1.7 4.3 0 6l6 6" />
        </svg>
        <h1 className="text-xl font-bold text-purple-800 dark:text-purple-200">TooliQ</h1>
      </div>

      <Button className="mx-4 bg-purple-600 hover:bg-purple-700 text-white">New Chat</Button>

      <div className="relative mx-4 mt-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input placeholder="Search your threads..." className="pl-8 bg-white dark:bg-purple-900" />
      </div>

      <div className="mt-6 px-2">
        <h2 className="px-2 text-xs font-semibold text-purple-800 dark:text-purple-300 mb-2">Older</h2>
        <nav className="space-y-1">
          <Link
            href="#"
            className="flex items-center px-2 py-2 text-sm rounded-md text-purple-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-800"
          >
            Welcome to TooliQ
          </Link>
          <Link
            href="#"
            className="flex items-center px-2 py-2 text-sm rounded-md text-purple-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-800"
          >
            FAQ
          </Link>
        </nav>
      </div>

      <div className="mt-auto p-4">
        <Button variant="outline" className="w-full">
          Login
        </Button>
      </div>
    </div>
  )
}
