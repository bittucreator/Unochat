"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Loader2, AlertCircle } from "lucide-react"
import { FileUpload } from "./file-upload"
import { FilePreview } from "./file-preview"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ModelBadge } from "./model-badge"
import { toast } from "@/hooks/use-toast"

type Message = {
  id: number
  role: "user" | "assistant" | "system"
  content: string
  files?: Array<{
    id: number
    filename: string
    contentType: string
  }>
}

// Define available models
const AVAILABLE_MODELS = [
  { id: "azure-grok", name: "Grok 3 (Azure)" },
  { id: "gpt-4o", name: "GPT-4o" },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo" },
]

interface ChatInterfaceProps {
  userId: string
  initialConversationId?: number
}

export function ChatInterface({ userId, initialConversationId }: ChatInterfaceProps) {
  const [selectedModel, setSelectedModel] = useState("gpt-4o")
  const [conversationId, setConversationId] = useState<number | undefined>(initialConversationId)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [attachments, setAttachments] = useState<Array<{ id: number; filename: string; contentType: string }>>([])
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const [isWelcomePage, setIsWelcomePage] = useState(!initialConversationId)

  // Load messages if conversation ID is provided
  useEffect(() => {
    if (conversationId) {
      fetchMessages(conversationId)
    }
  }, [conversationId])

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages])

  const fetchMessages = async (convId: number) => {
    try {
      const response = await fetch(`/api/conversations/${convId}/messages`)
      if (!response.ok) {
        throw new Error("Failed to fetch messages")
      }
      const data = await response.json()
      setMessages(data)
      setIsWelcomePage(false)
    } catch (error) {
      console.error("Error fetching messages:", error)
      toast({
        title: "Error",
        description: "Failed to load conversation messages",
        variant: "destructive",
      })
    }
  }

  const handleModelChange = (modelId: string) => {
    setSelectedModel(modelId)
    setError(null)
  }

  const handleFileUploaded = (fileData: { id: number; filename: string; contentType: string }) => {
    setAttachments((prev) => [...prev, fileData])
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!input.trim() && attachments.length === 0) return

    setIsLoading(true)
    setError(null)

    // Add user message to UI immediately
    const userMessage: Message = {
      id: Date.now(),
      role: "user",
      content: input || "Here's a file I'd like to share.",
      files: attachments.length > 0 ? [...attachments] : undefined,
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setAttachments([])

    try {
      // Format messages for API
      const apiMessages = messages.map((msg) => ({
        role: msg.role,
        content: msg.content,
      }))

      // Add the new user message
      apiMessages.push({
        role: "user",
        content: userMessage.content,
      })

      // Call the API
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: apiMessages,
          model: selectedModel,
          conversationId,
          userId,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.details || "Failed to get response from AI")
      }

      const data = await response.json()

      // Update conversation ID if this is a new conversation
      if (!conversationId && data.conversationId) {
        setConversationId(data.conversationId)
      }

      // Add assistant response to messages
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: data.text,
        },
      ])

      setIsWelcomePage(false)
    } catch (error) {
      console.error("Error in chat:", error)
      setError(error instanceof Error ? error.message : "An unexpected error occurred")
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get a response",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden">
      <header className="flex justify-end p-4">
        <Button
          variant="ghost"
          className="bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 hover:bg-purple-200 dark:hover:bg-purple-800"
        >
          What is TooliQ?
        </Button>
      </header>

      <main className="flex-1 overflow-auto p-6">
        {error && (
          <Alert variant="destructive" className="mb-4 max-w-3xl mx-auto">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2">Please try a different model or try again later.</div>
            </AlertDescription>
          </Alert>
        )}

        {isWelcomePage ? (
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold text-center text-purple-800 dark:text-purple-200 mb-8">
              TooliQ is the best AI Chat ever made.
            </h1>

            <div className="space-y-12">
              <div>
                <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-2">1. We're fast.</h2>
                <p className="text-gray-700 dark:text-gray-300">
                  We're 2x faster than ChatGPT, 10x faster than DeepSeek. You'll feel the difference - trust us.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-2">
                  2. We have every model you could want.
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Want to use <span className="font-semibold">Grok 3</span> for code? We got you.
                  <span className="font-semibold"> GPT-4o</span> for picture analysis? Of course.
                  <span className="font-semibold"> GPT-3.5</span> for quick responses? Why not.
                </p>
                <p className="mt-2 text-gray-700 dark:text-gray-300">
                  When new models come out, we make them available within hours of release.
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-2">
                  3. We're cheap. ($8/month)
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  We're less than half the price of ChatGPT or Claude, and we're MORE generous with limits. You get over
                  1,500 messages per month!
                </p>
              </div>

              <div>
                <h2 className="text-xl font-semibold text-purple-700 dark:text-purple-300 mb-2">
                  Whatcha waiting for?
                </h2>
                <p className="text-gray-700 dark:text-gray-300">
                  Reply here to get started, or click the little "chat" icon up top to make a new chat. Or you can{" "}
                  <a href="#" className="text-pink-600 hover:underline">
                    check out the FAQ
                  </a>
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`p-4 rounded-lg ${
                  message.role === "user"
                    ? "bg-purple-100 dark:bg-purple-900 ml-auto max-w-[80%]"
                    : "bg-gray-100 dark:bg-gray-800 mr-auto max-w-[80%]"
                }`}
              >
                <div className="flex justify-between items-center mb-1">
                  <div className="text-sm font-semibold">{message.role === "user" ? "You" : "TooliQ"}</div>
                  {message.role === "assistant" && <ModelBadge model={selectedModel} />}
                </div>
                <div className="whitespace-pre-wrap">{message.content}</div>

                {/* Display attachments if any */}
                {message.files?.map((file) => (
                  <FilePreview key={file.id} id={file.id} filename={file.filename} contentType={file.contentType} />
                ))}
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </main>

      <footer className="border-t border-gray-200 dark:border-gray-800 p-4">
        <div className="max-w-3xl mx-auto">
          <div className="text-center text-xs text-gray-500 mb-4">
            Make sure you agree to our{" "}
            <a href="#" className="text-purple-600 hover:underline">
              Terms
            </a>{" "}
            and our{" "}
            <a href="#" className="text-purple-600 hover:underline">
              Privacy Policy
            </a>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            {/* Display pending attachments */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2">
                {attachments.map((attachment) => (
                  <div key={attachment.id} className="relative">
                    <FilePreview
                      id={attachment.id}
                      filename={attachment.filename}
                      contentType={attachment.contentType}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600"
                      onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== attachment.id))}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="flex-1 flex items-end gap-2 bg-white dark:bg-gray-800 rounded-md border border-gray-200 dark:border-gray-700 p-2">
                <FileUpload onFileUploaded={handleFileUploaded} />
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Type your message here..."
                  className="flex-1 min-h-[60px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Select value={selectedModel} onValueChange={handleModelChange}>
                  <SelectTrigger className="w-[140px]">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700" disabled={isLoading}>
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span className="sr-only">Send message</span>
                </Button>
              </div>
            </div>
          </form>
        </div>
      </footer>
    </div>
  )
}
