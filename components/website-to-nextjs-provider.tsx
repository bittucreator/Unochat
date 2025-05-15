"use client"

import type React from "react"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { WebsiteToNextjsConversion } from "@/lib/types/nextjs"
import { UrlForm } from "./url-form"
import { NextjsPreview } from "./nextjs-preview"
import { convertWebsiteToNextjs } from "@/app/actions/nextjs-actions"
import { useToast } from "@/hooks/use-toast"
import type { FigmaAuthState } from "@/lib/types/figma"

interface WebsiteToNextjsContextType {
  conversion: WebsiteToNextjsConversion | undefined
  setConversion: (conversion: WebsiteToNextjsConversion) => void
  isConverting: boolean
  setIsConverting: (isConverting: boolean) => void
  selectedFile: string | null
  setSelectedFile: (file: string | null) => void
  convertWebsite: (url: string) => Promise<void>
}

const WebsiteToNextjsContext = createContext<WebsiteToNextjsContextType | undefined>(undefined)

interface WebsiteToNextjsConversionProviderProps {
  children: ReactNode
  authState?: FigmaAuthState
}

export function WebsiteToNextjsConversionProvider({ children, authState }: WebsiteToNextjsConversionProviderProps) {
  const [conversion, setConversion] = useState<WebsiteToNextjsConversion | undefined>()
  const [isConverting, setIsConverting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const { toast } = useToast()

  // Function to convert a website to Next.js code
  const convertWebsite = async (url: string) => {
    try {
      setIsConverting(true)
      setSelectedFile(null)

      const result = await convertWebsiteToNextjs(url)
      setConversion(result)

      if (result.status === "completed") {
        toast({
          title: "Conversion successful",
          description: "Your website has been converted to Next.js code.",
        })
      } else if (result.status === "failed") {
        toast({
          variant: "destructive",
          title: "Conversion failed",
          description: result.error || "Failed to convert website to Next.js code.",
        })
      }
    } catch (error) {
      console.error("Error converting website:", error)
      toast({
        variant: "destructive",
        title: "Conversion error",
        description: (error as Error).message || "An error occurred during conversion.",
      })
    } finally {
      setIsConverting(false)
    }
  }

  return (
    <WebsiteToNextjsContext.Provider
      value={{
        conversion,
        setConversion,
        isConverting,
        setIsConverting,
        selectedFile,
        setSelectedFile,
        convertWebsite,
      }}
    >
      {children}
    </WebsiteToNextjsContext.Provider>
  )
}

export function useWebsiteToNextjsConversion() {
  const context = useContext(WebsiteToNextjsContext)
  if (context === undefined) {
    throw new Error("useWebsiteToNextjsConversion must be used within a WebsiteToNextjsConversionProvider")
  }
  return context
}

// Enhanced URL Form that uses the context
export function EnhancedUrlForm(
  props: Omit<React.ComponentProps<typeof UrlForm>, "onSubmit" | "isLoading" | "authState">,
) {
  const { isConverting, convertWebsite } = useWebsiteToNextjsConversion()

  // Create a default auth state for the UrlForm if needed
  const defaultAuthState = { isAuthenticated: true }

  return <UrlForm {...props} authState={defaultAuthState} isLoading={isConverting} onSubmit={convertWebsite} />
}

// Enhanced NextjsPreview that uses the context
export function EnhancedNextjsPreview(
  props: Omit<React.ComponentProps<typeof NextjsPreview>, "conversion" | "selectedFile" | "onSelectFile">,
) {
  const { conversion, selectedFile, setSelectedFile } = useWebsiteToNextjsConversion()

  return <NextjsPreview {...props} conversion={conversion} selectedFile={selectedFile} onSelectFile={setSelectedFile} />
}
