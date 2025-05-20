"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Trash2 } from "lucide-react"
import Link from "next/link"
import { useMobile } from "@/hooks/use-mobile"
import { toast } from "@/hooks/use-toast"

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

export function Sidebar({ userId, currentConversationId }: SidebarProps) {
  const isMobile = useMobile()
  const [isOpen, setIsOpen] = useState(!isMobile)
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")

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
      className={`${
        isMobile ? "fixed inset-0 z-50" : "relative"
      } w-64 h-full bg-purple-50 dark:bg-purple-950 flex flex-col border-r border-purple-100 dark:border-purple-900`}
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

      <Button
        className="mx-4 bg-purple-600 hover:bg-purple-700 text-white"
        onClick={createNewConversation}
        disabled={isLoading}
      >
        <Plus className="mr-2 h-4 w-4" /> New Chat
      </Button>

      <div className="relative mx-4 mt-4">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          className="pl-8 bg-white dark:bg-purple-900"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="mt-6 px-2 flex-1 overflow-auto">
        <h2 className="px-2 text-xs font-semibold text-purple-800 dark:text-purple-300 mb-2">Conversations</h2>
        <nav className="space-y-1">
          {filteredConversations.length > 0 ? (
            filteredConversations.map((conversation) => (
              <Link
                key={conversation.id}
                href={`/chat/${conversation.id}`}
                className={`flex items-center justify-between px-2 py-2 text-sm rounded-md text-purple-700 dark:text-purple-200 hover:bg-purple-100 dark:hover:bg-purple-800 ${
                  currentConversationId === conversation.id ? "bg-purple-100 dark:bg-purple-800" : ""
                }`}
              >
                <span className="truncate">{conversation.title}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 opacity-0 group-hover:opacity-100 hover:opacity-100"
                  onClick={(e) => deleteConversation(conversation.id, e)}
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </Link>
            ))
          ) : (
            <div className="px-2 py-2 text-sm text-gray-500">No conversations found</div>
          )}
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
