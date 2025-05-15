"use client"

import type React from "react"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { WebsiteToNextjsConversion } from "@/lib/types/nextjs"
import { UrlForm } from "./url-form"
import { NextjsPreview } from "./nextjs-preview"

interface WebsiteToNextjsContextType {
  conversion: WebsiteToNextjsConversion | undefined
  setConversion: (conversion: WebsiteToNextjsConversion) => void
  isConverting: boolean
  setIsConverting: (isConverting: boolean) => void
  selectedFile: string | null
  setSelectedFile: (file: string | null) => void
}

const WebsiteToNextjsContext = createContext<WebsiteToNextjsContextType | undefined>(undefined)

export function WebsiteToNextjsConversionProvider({ children }: { children: ReactNode }) {
  const [conversion, setConversion] = useState<WebsiteToNextjsConversion | undefined>()
  const [isConverting, setIsConverting] = useState(false)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)

  return (
    <WebsiteToNextjsContext.Provider
      value={{
        conversion,
        setConversion,
        isConverting,
        setIsConverting,
        selectedFile,
        setSelectedFile,
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

// Override the original components to use the context
export function EnhancedUrlForm(
  props: Omit<React.ComponentProps<typeof UrlForm>, "onConversionComplete" | "onConversionStart" | "authState">,
) {
  const { setConversion, setIsConverting } = useWebsiteToNextjsConversion()

  // Create a default auth state for the UrlForm
  const defaultAuthState = { isAuthenticated: true }

  return (
    <UrlForm
      {...props}
      authState={defaultAuthState}
      onConversionStart={() => setIsConverting(true)}
      onConversionComplete={(conversion: any) => {
        setConversion(conversion as WebsiteToNextjsConversion)
        setIsConverting(false)
      }}
    />
  )
}

export function EnhancedNextjsPreview(
  props: Omit<React.ComponentProps<typeof NextjsPreview>, "conversion" | "selectedFile" | "onSelectFile">,
) {
  const { conversion, selectedFile, setSelectedFile } = useWebsiteToNextjsConversion()

  return <NextjsPreview {...props} conversion={conversion} selectedFile={selectedFile} onSelectFile={setSelectedFile} />
}
