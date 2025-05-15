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

// Helper to extract website elements (simplified version)
async function extractWebsiteElements(url: string): Promise<WebsiteElement[]> {
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
}

// Convert website elements to Figma design elements
function convertToFigmaElements(elements: WebsiteElement[]): any[] {
  // This is a simplified conversion - in a real implementation,
  // you would need to map the website elements to Figma's node structure

  // Mock implementation
  return elements.map((element, index) => {
    return {
      id: `element-${index}`,
      type: "FRAME",
      name: element.type || element.tag,
      x: element.boundingBox?.x || 0,
      y: element.boundingBox?.y || 0,
      width: element.boundingBox?.width || 100,
      height: element.boundingBox?.height || 100,
      children: element.children ? convertToFigmaElements(element.children) : [],
    }
  })
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

  if (!authState.isAuthenticated || !authState.accessToken) {
    throw new Error("Not authenticated with Figma")
  }

  try {
    // Create a new conversion record
    const conversion: WebsiteToFigmaConversion = {
      url,
      status: "processing",
      createdAt: new Date(),
    }

    // Extract website elements
    const websiteElements = await extractWebsiteElements(url)

    // Create a new Figma file
    const fileName = `TooliQ - ${url.replace(/^https?:\/\//, "").split("/")[0]}`
    const figmaFile = await createFigmaFile(authState.accessToken, fileName)

    // Convert website elements to Figma elements
    const figmaElements = convertToFigmaElements(websiteElements)

    // Create Figma nodes in the file
    await createFigmaNodes(authState.accessToken, figmaFile.file_key, figmaElements)

    // Update conversion record
    conversion.status = "completed"
    conversion.figmaFileKey = figmaFile.file_key
    conversion.figmaFileUrl = `https://www.figma.com/file/${figmaFile.file_key}/${encodeURIComponent(fileName)}`

    return conversion
  } catch (error) {
    console.error("Error converting website to Figma:", error)

    return {
      url,
      status: "failed",
      createdAt: new Date(),
      error: (error as Error).message,
    }
  }
}
