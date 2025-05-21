"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Send, Loader2, AlertCircle, Sparkles, Info, ImageIcon, Zap, Bot, Code } from "lucide-react"
import { FileUpload } from "./file-upload"
import { FilePreview } from "./file-preview"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { ModelBadge } from "./model-badge"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Card, CardContent } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { UnochatLogo } from "./unochat-logo"
import { useTheme } from "next-themes"
import { CodeBlock } from "./ui/code-block"

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
  { id: "azure-grok", name: "Grok 3 (Azure)", icon: <Zap className="h-4 w-4 mr-1.5" /> },
  { id: "gpt-4o", name: "GPT-4o", icon: <Sparkles className="h-4 w-4 mr-1.5" /> },
  { id: "gpt-3.5-turbo", name: "GPT-3.5 Turbo", icon: <Bot className="h-4 w-4 mr-1.5" /> },
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
  const [isTyping, setIsTyping] = useState(false)
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"

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

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value)
    setIsTyping(e.target.value.length > 0)
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
    setIsTyping(false)

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

  // Function to format message content with code blocks
  const formatMessageContent = (content: string) => {
    // Simple regex to detect code blocks (\`\`\`language...\`\`\`)
    const codeBlockRegex = /```(\w+)?\n([\s\S]*?)```/g

    let lastIndex = 0
    const parts = []
    let match

    // Find all code blocks
    while ((match = codeBlockRegex.exec(content)) !== null) {
      // Add text before code block
      if (match.index > lastIndex) {
        parts.push(<span key={`text-${lastIndex}`}>{content.slice(lastIndex, match.index)}</span>)
      }

      // Add code block
      const language = match[1] || ""
      const code = match[2]
      parts.push(
        <CodeBlock key={`code-${match.index}`} language={language}>
          {code}
        </CodeBlock>,
      )

      lastIndex = match.index + match[0].length
    }

    // Add remaining text
    if (lastIndex < content.length) {
      parts.push(<span key={`text-${lastIndex}`}>{content.slice(lastIndex)}</span>)
    }

    return parts.length > 0 ? parts : content
  }

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-vercel-gray-900">
      <header className="flex justify-between items-center p-4 border-b border-vercel-gray-200 dark:border-vercel-gray-800 bg-white dark:bg-black">
        <h1 className="text-lg font-medium text-vercel-fg dark:text-white hidden sm:block">
          {conversationId ? "Chat" : "Welcome to unochat"}
        </h1>
        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className="rounded-md border-vercel-gray-200 dark:border-vercel-gray-800 bg-white dark:bg-vercel-gray-900"
                >
                  <Info className="h-4 w-4 mr-1.5 text-primary" />
                  <span className="hidden sm:inline">About unochat</span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Learn more about unochat</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </header>

      <ScrollArea className="flex-1 p-4 sm:p-6">
        {error && (
          <Alert variant="destructive" className="mb-4 max-w-3xl mx-auto animate-fade-in">
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              {error}
              <div className="mt-2">Please try a different model or try again later.</div>
            </AlertDescription>
          </Alert>
        )}

        {isWelcomePage ? (
          <div className="max-w-3xl mx-auto animate-fade-in">
            <Card className="border-vercel-gray-200 dark:border-vercel-gray-800 bg-white dark:bg-vercel-gray-900 shadow-sm mb-8">
              <CardContent className="p-6">
                <div className="flex items-center justify-center mb-6">
                  <UnochatLogo size="lg" darkMode={isDarkMode} />
                </div>
                <h1 className="text-3xl font-bold text-center text-vercel-fg dark:text-white mb-8">
                  Welcome to unochat
                </h1>

                <div className="space-y-8">
                  <div className="flex items-start gap-4">
                    <div className="bg-vercel-gray-100 dark:bg-vercel-gray-800 p-2 rounded-md">
                      <Zap className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-vercel-fg dark:text-white mb-2">Lightning Fast</h2>
                      <p className="text-vercel-gray-600 dark:text-vercel-gray-300">
                        We're 2x faster than ChatGPT, 10x faster than DeepSeek. You'll feel the difference - trust us.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-vercel-gray-100 dark:bg-vercel-gray-800 p-2 rounded-md">
                      <Bot className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-vercel-fg dark:text-white mb-2">Multiple Models</h2>
                      <p className="text-vercel-gray-600 dark:text-vercel-gray-300">
                        Access <span className="font-semibold">Grok 3</span> for code,
                        <span className="font-semibold"> GPT-4o</span> for images, and
                        <span className="font-semibold"> GPT-3.5</span> for quick responses.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-vercel-gray-100 dark:bg-vercel-gray-800 p-2 rounded-md">
                      <ImageIcon className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-vercel-fg dark:text-white mb-2">File Sharing</h2>
                      <p className="text-vercel-gray-600 dark:text-vercel-gray-300">
                        Share images, PDFs, and text files directly in your conversations for instant analysis.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-4">
                    <div className="bg-vercel-gray-100 dark:bg-vercel-gray-800 p-2 rounded-md">
                      <Code className="h-5 w-5 text-primary" />
                    </div>
                    <div>
                      <h2 className="text-xl font-semibold text-vercel-fg dark:text-white mb-2">Code Support</h2>
                      <p className="text-vercel-gray-600 dark:text-vercel-gray-300">
                        Beautiful code formatting with syntax highlighting using{" "}
                        <span className="font-mono">GeistMono</span>, Vercel's custom monospace font.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="max-w-3xl mx-auto space-y-6">
            {messages.map((message, index) => (
              <div
                key={message.id}
                className={`flex ${message.role === "user" ? "justify-end" : "justify-start"} animate-slide-in`}
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className={`flex gap-3 max-w-[85%] ${message.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
                  <Avatar
                    className={`h-8 w-8 ${
                      message.role === "user" ? "bg-vercel-gray-200" : "bg-primary"
                    } dark:bg-vercel-gray-800`}
                  >
                    {message.role === "assistant" ? (
                      <div className="p-1.5">
                        <UnochatLogo darkMode={true} />
                      </div>
                    ) : (
                      <AvatarFallback>{message.role === "user" ? "U" : "AI"}</AvatarFallback>
                    )}
                  </Avatar>

                  <div className={`space-y-2 ${message.role === "user" ? "items-end" : "items-start"}`}>
                    <div
                      className={`message-bubble ${
                        message.role === "user" ? "message-bubble-user" : "message-bubble-assistant"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <div className="text-xs font-medium text-vercel-gray-500 dark:text-vercel-gray-400">
                          {message.role === "user" ? "You" : "unochat"}
                        </div>
                        {message.role === "assistant" && <ModelBadge model={selectedModel} />}
                      </div>
                      <div className="whitespace-pre-wrap">{formatMessageContent(message.content)}</div>

                      {/* Display attachments if any */}
                      {message.files?.map((file) => (
                        <FilePreview
                          key={file.id}
                          id={file.id}
                          filename={file.filename}
                          contentType={file.contentType}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
            <div ref={messagesEndRef} />
          </div>
        )}
      </ScrollArea>

      <footer className="border-t border-vercel-gray-200 dark:border-vercel-gray-800 p-4 bg-white dark:bg-black">
        <div className="max-w-3xl mx-auto">
          <div className="text-center text-xs text-vercel-gray-500 dark:text-vercel-gray-400 mb-4">
            <span className="inline-flex items-center">
              <Info className="h-3 w-3 mr-1" />
              By using unochat, you agree to our{" "}
              <a href="#" className="text-primary hover:underline mx-1">
                Terms
              </a>{" "}
              and{" "}
              <a href="#" className="text-primary hover:underline ml-1">
                Privacy Policy
              </a>
            </span>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            {/* Display pending attachments */}
            {attachments.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-2 animate-fade-in">
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
                      className="absolute -top-2 -right-2 h-5 w-5 rounded-full bg-white dark:bg-vercel-gray-800 hover:bg-vercel-gray-200 dark:hover:bg-vercel-gray-700"
                      onClick={() => setAttachments((prev) => prev.filter((a) => a.id !== attachment.id))}
                    >
                      ×
                    </Button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex items-end gap-2">
              <div className="input-container flex-1">
                <FileUpload onFileUploaded={handleFileUploaded} />
                <Textarea
                  value={input}
                  onChange={handleInputChange}
                  placeholder="Type your message here..."
                  className="flex-1 min-h-[60px] resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0 bg-transparent"
                />
              </div>
              <div className="flex flex-col gap-2">
                <Select value={selectedModel} onValueChange={handleModelChange}>
                  <SelectTrigger className="w-[140px] rounded-md border-vercel-gray-200 dark:border-vercel-gray-700 bg-white dark:bg-vercel-gray-900">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {AVAILABLE_MODELS.map((model) => (
                      <SelectItem key={model.id} value={model.id} className="flex items-center">
                        <div className="flex items-center">
                          {model.icon}
                          {model.name}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  type="submit"
                  className={`rounded-md h-10 transition-all duration-300 ${
                    isTyping
                      ? "bg-vercel-fg hover:bg-vercel-gray-800 text-white"
                      : "bg-vercel-gray-100 dark:bg-vercel-gray-800 text-vercel-fg dark:text-white hover:bg-vercel-gray-200 dark:hover:bg-vercel-gray-700"
                  }`}
                  disabled={isLoading}
                >
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
