"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Trash2, Menu, X } from "lucide-react"
import Link from "next/link"
import { useMobile } from "@/hooks/use-mobile"
import { toast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { UnochatLogo } from "./unochat-logo"
import { useRouter } from "next/navigation"

type Conversation = {
  id: number
  title: string
  last_message_at: string
  model: string
}

interface SidebarProps {
  userId: string
  currentConversationId?: number
}

interface GoogleUser {
  name: string
  email: string
  picture: string
}

function getUserFromCookie() {
  if (typeof document === "undefined") return null
  const match = document.cookie.match(/user=([^;]+)/)
  if (!match) return null
  try {
    return JSON.parse(decodeURIComponent(match[1]))
  } catch {
    return null
  }
}

export function Sidebar({ userId, currentConversationId }: SidebarProps) {
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(!isMobile)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const { theme, setTheme } = useTheme()
  const isDarkMode = theme === "dark"
  const router = useRouter()
  const [user, setUser] = useState<GoogleUser | null>(null)

  useEffect(() => {
    setUser(getUserFromCookie())
  }, [])

  // Sign out: remove user cookie and reload
  const handleSignOut = () => {
    document.cookie = "user=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;"
    setUser(null)
    window.location.reload()
  }

  // Fetch conversations
  useEffect(() => {
    fetchConversations()
  }, [userId])

  const fetchConversations = async () => {
    if (!userId) return

    try {
      setIsLoading(true)
      const response = await fetch("/api/conversations", {
        headers: {
          "x-user-id": userId,
        },
      })

      if (!response.ok) {
        throw new Error("Failed to fetch conversations")
      }

      const data = await response.json()
      setConversations(data)
    } catch (error) {
      console.error("Error fetching conversations:", error)
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const createNewConversation = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/conversations", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId,
          title: "New Conversation",
          model: "gpt-4o",
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to create conversation")
      }

      const data = await response.json()

      // Redirect to the new conversation
      window.location.href = `/chat/${data.id}`
    } catch (error) {
      console.error("Error creating conversation:", error)
      toast({
        title: "Error",
        description: "Failed to create new conversation",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const deleteConversation = async (id: number, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!confirm("Are you sure you want to delete this conversation?")) {
      return
    }

    try {
      const response = await fetch(`/api/conversations/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete conversation")
      }

      // Remove from state
      setConversations((prev) => prev.filter((conv) => conv.id !== id))

      // If we're on the deleted conversation, redirect to home
      if (currentConversationId === id) {
        window.location.href = "/"
      }

      toast({
        title: "Success",
        description: "Conversation deleted",
      })
    } catch (error) {
      console.error("Error deleting conversation:", error)
      toast({
        title: "Error",
        description: "Failed to delete conversation",
        variant: "destructive",
      })
    }
  }

  // Filter conversations based on search term
  const filteredConversations = conversations.filter((conv) =>
    conv.title.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (isMobile && !isOpen) {
    return (
      <Button
        variant="ghost"
        size="icon"
        className="fixed left-4 top-4 z-50 rounded-full bg-white dark:bg-vercel-gray-900 shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-5 w-5 text-vercel-fg dark:text-white" />
      </Button>
    )
  }

  return (
    <div
      className={`${
        isMobile ? "fixed inset-0 z-50" : "relative"
      } w-72 h-full bg-vercel-gray-100 dark:bg-black flex flex-col border-r border-vercel-gray-200 dark:border-vercel-gray-800`}
    >
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 rounded-full hover:bg-vercel-gray-200 dark:hover:bg-vercel-gray-800"
          onClick={() => setIsOpen(false)}
        >
          <span className="sr-only">Close sidebar</span>
          <X className="h-5 w-5 text-vercel-fg dark:text-white" />
        </Button>
      )}

      <div className="p-4 flex items-center">
        <UnochatLogo className="mr-3" darkMode={isDarkMode} />
        <h1 className="text-xl font-bold text-vercel-fg dark:text-white">unochat</h1>
      </div>

      <div className="px-3 mb-2">
        <Button
          className="w-full bg-vercel-fg hover:bg-vercel-gray-800 text-white rounded-md h-10 shadow-sm transition-all duration-200 hover:shadow-md"
          onClick={createNewConversation}
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" /> New Chat
        </Button>
      </div>

      <div className="relative mx-3 mt-2">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-vercel-gray-500 dark:text-vercel-gray-400" />
        <Input
          placeholder="Search conversations..."
          className="pl-9 bg-white dark:bg-vercel-gray-900 border-vercel-gray-200 dark:border-vercel-gray-700 rounded-md h-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Separator className="my-3 bg-vercel-gray-200 dark:bg-vercel-gray-800" />

      <ScrollArea className="flex-1 px-3">
        <h2 className="text-xs font-semibold text-vercel-gray-500 dark:text-vercel-gray-400 mb-2 px-2">
          Conversations
        </h2>
        <nav className="space-y-1 pb-4">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/chat/${conversation.id}`}
                className={`sidebar-item group ${
                  currentConversationId === conversation.id ? "sidebar-item-active" : "sidebar-item-inactive"
                }`}
              >
                <div className="flex items-center">
                  <UnochatLogo size="sm" className="mr-2 opacity-70" darkMode={isDarkMode} />
                  <span className="truncate">{conversation.title}</span>
                </div>
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7 rounded-full opacity-0 group-hover:opacity-100 hover:bg-destructive/10 hover:text-destructive"
                        onClick={(e) => deleteConversation(conversation.id, e)}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Delete conversation</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </Link>
            ))
          ) : (
            <div className="px-3 py-10 text-center text-sm text-vercel-gray-500 dark:text-vercel-gray-400">
              {isLoading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary mb-2"></div>
                  <p>Loading conversations...</p>
                </div>
              ) : searchTerm ? (
                <p>No conversations found</p>
              ) : (
                <div className="space-y-2">
                  <p>No conversations yet</p>
                  <p className="text-xs">Start a new chat to begin</p>
                </div>
              )}
            </div>
          )}
        </nav>
      </ScrollArea>

      <div className="mt-auto p-3 space-y-2">
        <div className="flex items-center justify-center px-2 py-1"></div>

        <div className="flex flex-col gap-2">
          {user ? (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-3 p-2 rounded-md bg-white dark:bg-vercel-gray-900 border border-vercel-gray-200 dark:border-vercel-gray-700">
                <img
                  src={user.picture}
                  alt={user.name}
                  className="w-8 h-8 rounded-full border"
                />
                <div className="flex flex-col min-w-0">
                  <span className="text-sm font-medium text-vercel-gray-900 dark:text-vercel-gray-100 truncate">{user.name}</span>
                  <span className="text-xs text-vercel-gray-600 dark:text-vercel-gray-400 truncate">{user.email}</span>
                </div>
              </div>
              <Button
                className="w-full mt-2"
                variant="outline"
                onClick={handleSignOut}
              >
                Sign out
              </Button>
            </div>
          ) : (
            <a
              href="/api/auth/google"
              className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-100 text-gray-800 font-medium transition w-full justify-center"
            >
              <svg width="20" height="20" viewBox="0 0 48 48" className="mr-2"><g><path fill="#4285F4" d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.1-2.7-.5-4z"/><path fill="#34A853" d="M6.3 14.7l7 5.1C15.5 17.1 19.4 14 24 14c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.3 5.1 29.4 3 24 3 15.1 3 7.6 8.7 6.3 14.7z"/><path fill="#FBBC05" d="M24 45c5.8 0 10.7-1.9 14.3-5.1l-6.6-5.4C29.7 36.1 27 37 24 37c-5.7 0-10.5-3.7-12.2-8.8l-7 5.4C7.6 39.3 15.1 45 24 45z"/><path fill="#EA4335" d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.2 5.5-7.7 5.5-4.5 0-8.2-3.7-8.2-8.2s3.7-8.2 8.2-8.2c2.1 0 4 .8 5.5 2.1l6.4-6.4C34.3 5.1 29.4 3 24 3c-6.6 0-12 5.4-12 12s5.4 12 12 12c5.8 0 10.7-1.9 14.3-5.1l-6.6-5.4C29.7 36.1 27 37 24 37c-5.7 0-10.5-3.7-12.2-8.8l-7 5.4C7.6 39.3 15.1 45 24 45z"/></g></svg>
              Sign in with Google
            </a>
          )}
        </div>
      </div>
    </div>
  )
}
