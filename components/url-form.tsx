"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { AlertCircle } from "lucide-react"
import type { FigmaAuthState } from "@/lib/types/figma"

interface UrlFormProps {
  onSubmit: (url: string) => Promise<void>
  isLoading: boolean
  authState?: FigmaAuthState
  title?: string
  description?: string
  buttonText?: string
  placeholder?: string
  className?: string
}

export function UrlForm({
  onSubmit,
  isLoading,
  authState = { isAuthenticated: true },
  title = "Enter a URL",
  description = "Enter the URL of the website you want to convert",
  buttonText = "Convert",
  placeholder = "https://example.com",
  className,
}: UrlFormProps) {
  const [url, setUrl] = useState("")
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)

    // Basic URL validation
    if (!url) {
      setError("Please enter a URL")
      return
    }

    // Check if URL has http:// or https:// prefix
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      setError("URL must start with http:// or https://")
      return
    }

    try {
      // Additional validation
      new URL(url)
      await onSubmit(url)
    } catch (error) {
      console.error("Error submitting URL:", error)
      setError((error as Error).message || "An error occurred while processing your request")
    }
  }

  return (
    <Card className={className}>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col space-y-2">
            <Input
              type="url"
              placeholder={placeholder}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              required
              className="w-full"
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading || !authState.isAuthenticated}>
            {isLoading ? "Converting..." : buttonText}
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex justify-center text-sm text-muted-foreground">
        {!authState.isAuthenticated && <p>You need to authenticate with the service before converting websites.</p>}
      </CardFooter>
    </Card>
  )
}
