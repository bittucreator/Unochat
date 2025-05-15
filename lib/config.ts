/**
 * Application configuration derived from environment variables
 */
export const config = {
  app: {
    name: process.env.NEXT_PUBLIC_APP_NAME || "TooliQ",
    url: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
    environment: process.env.NODE_ENV || "development",
    isProduction: process.env.NODE_ENV === "production",
  },
  figma: {
    clientId: process.env.FIGMA_CLIENT_ID || "",
    clientSecret: process.env.FIGMA_CLIENT_SECRET || "",
    redirectUri: process.env.FIGMA_REDIRECT_URI || "http://localhost:3000/api/figma/callback",
  },
  websiteAnalysis: {
    apiKey: process.env.WEBSITE_ANALYSIS_API_KEY || "",
  },
}

/**
 * Validates that all required environment variables are set
 * @returns An object containing any missing environment variables
 */
export function validateConfig() {
  const missingVariables: Record<string, string[]> = {}

  // Check Figma configuration
  const missingFigmaVars = []
  if (!config.figma.clientId) missingFigmaVars.push("FIGMA_CLIENT_ID")
  if (!config.figma.clientSecret) missingFigmaVars.push("FIGMA_CLIENT_SECRET")
  if (!config.figma.redirectUri) missingFigmaVars.push("FIGMA_REDIRECT_URI")
  if (missingFigmaVars.length > 0) {
    missingVariables.figma = missingFigmaVars
  }

  // Check website analysis configuration
  const missingAnalysisVars = []
  if (!config.websiteAnalysis.apiKey) missingAnalysisVars.push("WEBSITE_ANALYSIS_API_KEY")
  if (missingAnalysisVars.length > 0) {
    missingVariables.websiteAnalysis = missingAnalysisVars
  }

  return Object.keys(missingVariables).length > 0 ? missingVariables : null
}
