"use server"

import { isAzureOpenAIConfigured } from "./azure-openai-client"

// Define the available AI providers
export type AIProvider = "openai" | "azure"

// Get the configured AI provider
export async function getAIProvider() {
  // Check if Azure OpenAI is configured
  const azureConfigured = await isAzureOpenAIConfigured()

  // Return the appropriate provider
  if (azureConfigured) {
    return "azure" as AIProvider
  }

  // Default to OpenAI
  return "openai" as AIProvider
}

// Get the AI model based on the provider
export async function getAIModel(provider?: AIProvider) {
  const activeProvider = provider || (await getAIProvider())

  // Use the unified AI SDK approach
  if (activeProvider === "azure") {
    return {
      provider: "azure",
      apiKey: process.env.AZURE_OPENAI_API_KEY,
      endpoint: process.env.AZURE_OPENAI_API_ENDPOINT,
      deploymentName: process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
    }
  }

  // Default to OpenAI
  return {
    provider: "openai",
    model: "gpt-4o",
  }
}
