import type { FigmaAuthResponse, FigmaCreateFileResponse } from "../types/figma"

export async function getAuthorizationUrl() {
  const clientId = process.env.FIGMA_CLIENT_ID
  const redirectUri = process.env.FIGMA_REDIRECT_URI
  const state = Math.random().toString(36).substring(7)

  // Store state in session for verification when the user returns
  // This would typically be stored in a database or session

  const authUrl = `https://www.figma.com/oauth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri!)}&scope=file_read file_write&state=${state}&response_type=code`

  return { authUrl, state }
}

export async function exchangeCodeForToken(code: string): Promise<FigmaAuthResponse> {
  const clientId = process.env.FIGMA_CLIENT_ID
  const clientSecret = process.env.FIGMA_CLIENT_SECRET
  const redirectUri = process.env.FIGMA_REDIRECT_URI

  const response = await fetch("https://www.figma.com/api/oauth/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      redirect_uri: redirectUri,
      code,
      grant_type: "authorization_code",
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Failed to exchange code for token: ${errorData.message || response.statusText}`)
  }

  return response.json()
}

export async function refreshAccessToken(refreshToken: string): Promise<FigmaAuthResponse> {
  const clientId = process.env.FIGMA_CLIENT_ID
  const clientSecret = process.env.FIGMA_CLIENT_SECRET

  const response = await fetch("https://www.figma.com/api/oauth/refresh", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: "refresh_token",
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Failed to refresh token: ${errorData.message || response.statusText}`)
  }

  return response.json()
}

export async function createFigmaFile(accessToken: string, name: string): Promise<FigmaCreateFileResponse> {
  const response = await fetch("https://api.figma.com/v1/files", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      name,
      thumbnail_url: null,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Failed to create Figma file: ${errorData.message || response.statusText}`)
  }

  return response.json()
}

export async function createFigmaNodes(accessToken: string, fileKey: string, elements: any[]): Promise<any> {
  // This is a simplified version - in a real implementation, you would need to
  // convert the elements to Figma's node structure format
  const response = await fetch(`https://api.figma.com/v1/files/${fileKey}/nodes`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      nodes: elements,
    }),
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Failed to create Figma nodes: ${errorData.message || response.statusText}`)
  }

  return response.json()
}

export async function getUserFiles(accessToken: string): Promise<any> {
  const response = await fetch("https://api.figma.com/v1/me/files", {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  })

  if (!response.ok) {
    const errorData = await response.json()
    throw new Error(`Failed to get user files: ${errorData.message || response.statusText}`)
  }

  return response.json()
}
