"use server"

import { openai } from "@ai-sdk/openai"
import { azureOpenAI } from "@ai-sdk/azure-openai"
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

  if (activeProvider === "azure") {
    const deploymentName = process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME
    return azureOpenAI(deploymentName!)
  }

  // Default to OpenAI
  return openai("gpt-4o")
}
