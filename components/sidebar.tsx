"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, Plus, Trash2, MessageSquare, Menu, X, Settings, LogOut, Moon, Sun } from "lucide-react"
import Link from "next/link"
import { useMobile } from "@/hooks/use-mobile"
import { toast } from "@/hooks/use-toast"
import { useTheme } from "next-themes"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

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
  const { theme, setTheme } = useTheme()

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
        className="fixed left-4 top-4 z-50 rounded-full bg-white dark:bg-gray-800 shadow-md"
        onClick={() => setIsOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Menu className="h-5 w-5 text-primary" />
      </Button>
    )
  }

  return (
    <div
      className={`${
        isMobile ? "fixed inset-0 z-50" : "relative"
      } w-72 h-full bg-pastel-lavender/20 dark:bg-gray-900 flex flex-col border-r border-pastel-lavender/30 dark:border-pastel-lilac/10 backdrop-blur-sm`}
    >
      {isMobile && (
        <Button
          variant="ghost"
          size="icon"
          className="absolute right-3 top-3 rounded-full hover:bg-pastel-lavender/30 dark:hover:bg-pastel-lilac/10"
          onClick={() => setIsOpen(false)}
        >
          <span className="sr-only">Close sidebar</span>
          <X className="h-5 w-5 text-primary" />
        </Button>
      )}

      <div className="p-4 flex items-center">
        <div className="bg-primary/10 p-2 rounded-lg mr-3">
          <MessageSquare className="text-primary h-5 w-5" />
        </div>
        <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-pastel-lilac bg-clip-text text-transparent">
          TooliQ
        </h1>
      </div>

      <div className="px-3 mb-2">
        <Button
          className="w-full bg-primary hover:bg-primary/90 text-white rounded-xl h-10 shadow-sm transition-all duration-200 hover:shadow-md"
          onClick={createNewConversation}
          disabled={isLoading}
        >
          <Plus className="mr-2 h-4 w-4" /> New Chat
        </Button>
      </div>

      <div className="relative mx-3 mt-2">
        <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search conversations..."
          className="pl-9 bg-white/80 dark:bg-gray-800/60 border-pastel-lavender/50 dark:border-pastel-lilac/20 rounded-xl h-10"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>

      <Separator className="my-3 bg-pastel-lavender/30 dark:bg-pastel-lilac/10" />

      <ScrollArea className="flex-1 px-3">
        <h2 className="text-xs font-semibold text-muted-foreground mb-2 px-2">Conversations</h2>
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
                  <MessageSquare className="h-4 w-4 mr-2 opacity-70" />
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
            <div className="px-3 py-10 text-center text-sm text-muted-foreground">
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
        <div className="flex items-center justify-between px-2 py-1">
          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg hover:bg-pastel-lavender/30 dark:hover:bg-pastel-lilac/10"
            onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
          >
            {theme === "dark" ? (
              <Sun className="h-5 w-5 text-pastel-lemon" />
            ) : (
              <Moon className="h-5 w-5 text-pastel-lilac" />
            )}
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg hover:bg-pastel-lavender/30 dark:hover:bg-pastel-lilac/10"
          >
            <Settings className="h-5 w-5 text-muted-foreground" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            className="rounded-lg hover:bg-pastel-lavender/30 dark:hover:bg-pastel-lilac/10"
          >
            <LogOut className="h-5 w-5 text-muted-foreground" />
          </Button>
        </div>

        <Button
          variant="outline"
          className="w-full rounded-xl border-pastel-lavender/50 dark:border-pastel-lilac/20 bg-white/80 dark:bg-gray-800/60"
        >
          Login
        </Button>
      </div>
    </div>
  )
}
