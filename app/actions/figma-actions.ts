"use server"

import { cookies } from "next/headers"
import {
  createFigmaFile,
  createFigmaNodes,
  exchangeCodeForToken,
  getAuthorizationUrl,
  refreshAccessToken,
} from "@/lib/services/figma-api"
import type { FigmaAuthState, WebsiteElement, WebsiteToFigmaConversion } from "@/lib/types/figma"
import { createServerSupabaseClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Helper to extract website elements (simplified version)
async function extractWebsiteElements(url: string): Promise<WebsiteElement[]> {
  try {
    // In a real implementation, you would use a headless browser like Puppeteer
    // to extract elements from the website

    // This is a simplified mock implementation
    return [
      {
        type: "header",
        tag: "header",
        children: [
          {
            type: "heading",
            tag: "h1",
            text: "Website Header",
            style: {
              fontSize: "24px",
              fontWeight: "bold",
              color: "#333333",
            },
            boundingBox: {
              x: 0,
              y: 0,
              width: 800,
              height: 80,
            },
          },
        ],
        boundingBox: {
          x: 0,
          y: 0,
          width: 1200,
          height: 80,
        },
      },
      {
        type: "main",
        tag: "main",
        children: [
          {
            type: "section",
            tag: "section",
            children: [
              {
                type: "heading",
                tag: "h2",
                text: "Main Content",
                style: {
                  fontSize: "20px",
                  fontWeight: "bold",
                  color: "#333333",
                },
                boundingBox: {
                  x: 0,
                  y: 100,
                  width: 800,
                  height: 40,
                },
              },
              {
                type: "paragraph",
                tag: "p",
                text: "This is a paragraph of text from the website.",
                style: {
                  fontSize: "16px",
                  color: "#666666",
                },
                boundingBox: {
                  x: 0,
                  y: 150,
                  width: 800,
                  height: 60,
                },
              },
            ],
            boundingBox: {
              x: 0,
              y: 100,
              width: 1200,
              height: 300,
            },
          },
        ],
        boundingBox: {
          x: 0,
          y: 100,
          width: 1200,
          height: 500,
        },
      },
    ]
  } catch (error) {
    console.error("Error extracting website elements:", error)
    // Return a minimal set of elements in case of error
    return [
      {
        type: "header",
        tag: "header",
        children: [
          {
            type: "heading",
            tag: "h1",
            text: "Website Header",
            boundingBox: {
              x: 0,
              y: 0,
              width: 800,
              height: 80,
            },
          },
        ],
        boundingBox: {
          x: 0,
          y: 0,
          width: 1200,
          height: 80,
        },
      },
    ]
  }
}

// Convert website elements to Figma design elements
function convertToFigmaElements(elements: WebsiteElement[]): any[] {
  try {
    // This is a simplified conversion - in a real implementation,
    // you would need to map the website elements to Figma's node structure

    // Mock implementation
    return elements.map((element, index) => {
      return {
        id: `element-${index}`,
        type: "FRAME",
        name: element.type || element.tag || "Element",
        x: element.boundingBox?.x || 0,
        y: element.boundingBox?.y || 0,
        width: element.boundingBox?.width || 100,
        height: element.boundingBox?.height || 100,
        children: element.children ? convertToFigmaElements(element.children) : [],
      }
    })
  } catch (error) {
    console.error("Error converting to Figma elements:", error)
    // Return a minimal set of elements in case of error
    return [
      {
        id: "element-fallback",
        type: "FRAME",
        name: "Fallback Frame",
        x: 0,
        y: 0,
        width: 1200,
        height: 800,
        children: [],
      },
    ]
  }
}

// Store auth state in cookies (in a real app, use a more secure method)
export async function storeFigmaAuthState(authState: FigmaAuthState) {
  cookies().set("figmaAuthState", JSON.stringify(authState), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: authState.expiresAt ? (authState.expiresAt - Date.now()) / 1000 : 3600,
    path: "/",
  })
}

// Get auth state from cookies
export async function getFigmaAuthState(): Promise<FigmaAuthState> {
  const authStateCookie = cookies().get("figmaAuthState")

  if (!authStateCookie?.value) {
    return { isAuthenticated: false }
  }

  try {
    const authState = JSON.parse(authStateCookie.value) as FigmaAuthState

    // Check if token is expired and needs refresh
    if (authState.expiresAt && authState.expiresAt < Date.now() && authState.refreshToken) {
      try {
        const refreshedAuth = await refreshAccessToken(authState.refreshToken)
        const newAuthState: FigmaAuthState = {
          isAuthenticated: true,
          accessToken: refreshedAuth.access_token,
          refreshToken: refreshedAuth.refresh_token,
          expiresAt: Date.now() + refreshedAuth.expires_in * 1000,
          userId: refreshedAuth.user_id,
        }

        await storeFigmaAuthState(newAuthState)
        return newAuthState
      } catch (error) {
        // If refresh fails, clear auth state
        cookies().delete("figmaAuthState")
        return { isAuthenticated: false }
      }
    }

    return authState
  } catch (error) {
    // If parsing fails, clear auth state
    cookies().delete("figmaAuthState")
    return { isAuthenticated: false }
  }
}

// Start Figma OAuth flow
export async function startFigmaAuth(redirectPath = "/figma-converter") {
  const { authUrl } = await getAuthorizationUrl()

  // Store the redirect path to return to after auth
  cookies().set("figmaAuthRedirect", redirectPath, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    maxAge: 3600,
    path: "/",
  })

  return { authUrl }
}

// Handle Figma OAuth callback
export async function handleFigmaAuthCallback(code: string) {
  try {
    const authResponse = await exchangeCodeForToken(code)

    const authState: FigmaAuthState = {
      isAuthenticated: true,
      accessToken: authResponse.access_token,
      refreshToken: authResponse.refresh_token,
      expiresAt: Date.now() + authResponse.expires_in * 1000,
      userId: authResponse.user_id,
    }

    await storeFigmaAuthState(authState)

    // Get the redirect path or default to figma-converter
    const redirectPath = cookies().get("figmaAuthRedirect")?.value || "/figma-converter"
    cookies().delete("figmaAuthRedirect")

    return { success: true, redirectPath }
  } catch (error) {
    console.error("Error handling Figma auth callback:", error)
    return { success: false, error: (error as Error).message }
  }
}

// Log out from Figma
export async function logoutFromFigma() {
  cookies().delete("figmaAuthState")
  return { success: true }
}

// Convert website to Figma design
export async function convertWebsiteToFigma(url: string, options: any = {}): Promise<WebsiteToFigmaConversion> {
  const authState = await getFigmaAuthState()
  const supabase = createServerSupabaseClient()

  // Get current user
  const {
    data: { session },
  } = await supabase.auth.getSession()
  const userId = session?.user?.id

  if (!authState.isAuthenticated || !authState.accessToken) {
    throw new Error("Not authenticated with Figma")
  }

  try {
    // Validate URL
    try {
      new URL(url)
    } catch (error) {
      throw new Error("Invalid URL. Please enter a valid URL including http:// or https://")
    }

    // Create a new conversion record in the database
    const conversionData = {
      user_id: userId,
      url,
      type: "figma" as const,
      status: "processing" as const,
      options: options,
    }

    // Insert the conversion record
    const { data: conversionRecord, error } = await supabase
      .from("website_conversions")
      .insert(conversionData)
      .select()
      .single()

    if (error) {
      throw new Error(`Failed to create conversion record: ${error.message}`)
    }

    // Create a conversion object for the client
    const conversion: WebsiteToFigmaConversion = {
      url,
      status: "processing",
      createdAt: new Date(),
    }

    // Extract website elements
    let websiteElements
    try {
      websiteElements = await extractWebsiteElements(url)
      if (!websiteElements || websiteElements.length === 0) {
        throw new Error("Failed to extract website elements")
      }
    } catch (extractError) {
      console.error("Error extracting website elements:", extractError)
      throw new Error(`Website element extraction failed: ${(extractError as Error).message || "Unknown error"}`)
    }

    // Create a new Figma file
    let figmaFile
    try {
      const fileName = `TooliQ - ${url.replace(/^https?:\/\//, "").split("/")[0]}`
      figmaFile = await createFigmaFile(authState.accessToken, fileName)
      if (!figmaFile || !figmaFile.file_key) {
        throw new Error("Failed to create Figma file")
      }
    } catch (figmaError) {
      console.error("Error creating Figma file:", figmaError)
      throw new Error(`Figma file creation failed: ${(figmaError as Error).message || "Unknown error"}`)
    }

    // Convert website elements to Figma elements
    const figmaElements = convertToFigmaElements(websiteElements)

    // Create Figma nodes in the file
    try {
      await createFigmaNodes(authState.accessToken, figmaFile.file_key, figmaElements)
    } catch (nodesError) {
      console.error("Error creating Figma nodes:", nodesError)
      throw new Error(`Figma node creation failed: ${(nodesError as Error).message || "Unknown error"}`)
    }

    // Update conversion record in the database
    const figmaFileUrl = `https://www.figma.com/file/${figmaFile.file_key}/${encodeURIComponent(
      figmaFile.name || "TooliQ Conversion",
    )}`

    const { error: updateError } = await supabase
      .from("website_conversions")
      .update({
        status: "completed",
        figma_file_key: figmaFile.file_key,
        figma_file_url: figmaFileUrl,
        updated_at: new Date().toISOString(),
      })
      .eq("id", conversionRecord.id)

    if (updateError) {
      throw new Error(`Failed to update conversion record: ${updateError.message}`)
    }

    // Update conversion object for the client
    conversion.status = "completed"
    conversion.figmaFileKey = figmaFile.file_key
    conversion.figmaFileUrl = figmaFileUrl

    // Revalidate the dashboard page
    revalidatePath("/dashboard")

    return conversion
  } catch (error) {
    console.error("Error converting website to Figma:", error)

    // Update the conversion record in the database if it exists
    if (userId) {
      await supabase
        .from("website_conversions")
        .update({
          status: "failed",
          error: (error as Error).message || "An unknown error occurred during conversion",
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", userId)
        .eq("url", url)
        .eq("type", "figma")
        .eq("status", "processing")
    }

    return {
      url,
      status: "failed",
      createdAt: new Date(),
      error: (error as Error).message || "An unknown error occurred during conversion",
    }
  }
}
