import { config } from "../config"

export async function checkFigmaApiConfig() {
  const issues = []

  // Check if client ID is set
  if (!config.figma.clientId) {
    issues.push("Figma Client ID is not configured")
  }

  // Check if client secret is set
  if (!config.figma.clientSecret) {
    issues.push("Figma Client Secret is not configured")
  }

  // Check if redirect URI is set
  if (!config.figma.redirectUri) {
    issues.push("Figma Redirect URI is not configured")
  }

  // Check if redirect URI is properly formatted
  if (config.figma.redirectUri) {
    try {
      const url = new URL(config.figma.redirectUri)

      // Check if it's using HTTPS in production
      if (process.env.NODE_ENV === "production" && url.protocol !== "https:") {
        issues.push("Figma Redirect URI should use HTTPS in production")
      }
    } catch (error) {
      issues.push("Figma Redirect URI is not a valid URL")
    }
  }

  return {
    isValid: issues.length === 0,
    issues,
  }
}
