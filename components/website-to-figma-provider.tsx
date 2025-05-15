"use client"

import type React from "react"

import { createContext, useContext, useState, type ReactNode } from "react"
import type { FigmaAuthState, WebsiteToFigmaConversion } from "@/lib/types/figma"
import { UrlForm } from "./url-form"
import { FigmaPreview } from "./figma-preview"

interface WebsiteToFigmaContextType {
  conversion: WebsiteToFigmaConversion | undefined
  setConversion: (conversion: WebsiteToFigmaConversion) => void
  isConverting: boolean
  setIsConverting: (isConverting: boolean) => void
  authState: FigmaAuthState
}

const WebsiteToFigmaContext = createContext<WebsiteToFigmaContextType | undefined>(undefined)

export function WebsiteToFigmaConversionProvider({
  children,
  authState,
}: {
  children: ReactNode
  authState: FigmaAuthState
}) {
  const [conversion, setConversion] = useState<WebsiteToFigmaConversion | undefined>()
  const [isConverting, setIsConverting] = useState(false)

  return (
    <WebsiteToFigmaContext.Provider
      value={{
        conversion,
        setConversion,
        isConverting,
        setIsConverting,
        authState,
      }}
    >
      {children}
    </WebsiteToFigmaContext.Provider>
  )
}

export function useWebsiteToFigmaConversion() {
  const context = useContext(WebsiteToFigmaContext)
  if (context === undefined) {
    throw new Error("useWebsiteToFigmaConversion must be used within a WebsiteToFigmaConversionProvider")
  }
  return context
}

// Override the original components to use the context
export function EnhancedUrlForm(
  props: Omit<React.ComponentProps<typeof UrlForm>, "onConversionComplete" | "onConversionStart" | "authState">,
) {
  const { setConversion, setIsConverting, authState } = useWebsiteToFigmaConversion()

  return (
    <UrlForm
      {...props}
      authState={authState}
      onConversionStart={() => setIsConverting(true)}
      onConversionComplete={(conversion) => {
        setConversion(conversion)
        setIsConverting(false)
      }}
    />
  )
}

export function EnhancedFigmaPreview(
  props: Omit<React.ComponentProps<typeof FigmaPreview>, "conversion" | "isAuthenticated">,
) {
  const { conversion, authState } = useWebsiteToFigmaConversion()

  return <FigmaPreview {...props} conversion={conversion} isAuthenticated={authState.isAuthenticated} />
}
