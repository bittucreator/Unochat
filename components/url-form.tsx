"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { LinkIcon, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { FigmaAuthState, WebsiteToFigmaConversion } from "@/lib/types/figma"
import { convertWebsiteToFigma } from "@/app/actions/figma-actions"

interface UrlFormProps {
  authState: FigmaAuthState
  onConversionStart?: () => void
  onConversionComplete?: (conversion: WebsiteToFigmaConversion) => void
  conversionType?: "figma" | "nextjs"
}

export function UrlForm({
  authState,
  onConversionStart,
  onConversionComplete,
  conversionType = "figma",
}: UrlFormProps) {
  const [url, setUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!url) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please enter a valid URL",
      })
      return
    }

    // Validate URL
    try {
      new URL(url)
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Invalid URL",
        description: "Please enter a valid URL including http:// or https://",
      })
      return
    }

    // Check if authenticated for Figma conversion
    if (conversionType === "figma" && !authState.isAuthenticated) {
      toast({
        variant: "destructive",
        title: "Authentication Required",
        description: "Please connect to Figma first to enable website to Figma conversion.",
      })
      return
    }

    setIsLoading(true)
    onConversionStart?.()

    try {
      if (conversionType === "figma") {
        // Convert website to Figma
        const conversion = await convertWebsiteToFigma(url)

        if (conversion.status === "completed") {
          toast({
            title: "Conversion Successful",
            description: "Your website has been converted to a Figma design.",
          })
        } else {
          toast({
            variant: "destructive",
            title: "Conversion Failed",
            description: conversion.error || "Failed to convert website to Figma.",
          })
        }

        onConversionComplete?.(conversion)
      } else {
        // Simulate Next.js conversion for now
        setTimeout(() => {
          setIsLoading(false)
          toast({
            title: "Website processed successfully!",
            description: "Your Next.js code is ready to view and customize.",
          })
        }, 2000)
      }
    } catch (error) {
      console.error("Error converting website:", error)
      toast({
        variant: "destructive",
        title: "Conversion Error",
        description: (error as Error).message || "An error occurred during conversion.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Only check auth state for Figma conversions
  const isButtonDisabled = isLoading || (conversionType === "figma" && !authState.isAuthenticated)

  return (
    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
      <div className="relative flex-1">
        <LinkIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          type="text"
          placeholder="Enter website URL (e.g., https://example.com)"
          className="pl-10"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
      </div>
      <Button type="submit" disabled={isButtonDisabled}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Convert"
        )}
      </Button>
    </form>
  )
}
