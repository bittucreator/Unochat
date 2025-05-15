"use server"

import { LinearClient } from "@linear/sdk"

// Initialize the Linear client with the API key
let linearClient: LinearClient | null = null

export async function getLinearClient() {
  if (!linearClient) {
    const apiKey = process.env.LINEAR_API_KEY

    if (!apiKey) {
      throw new Error("LINEAR_API_KEY environment variable is not set")
    }

    linearClient = new LinearClient({ apiKey })
  }

  return linearClient
}

// Helper function to check if the Linear client is properly configured
export async function isLinearConfigured() {
  try {
    const client = await getLinearClient()
    // Try to fetch the viewer to verify the API key works
    const { viewer } = await client.viewer
    return !!viewer
  } catch (error) {
    console.error("Linear API configuration error:", error)
    return false
  }
}
