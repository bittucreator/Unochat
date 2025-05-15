"use server"

import { AzureOpenAIClient } from "@ai-sdk/azure-openai"

// Initialize the Azure OpenAI client
let azureOpenAIClient: AzureOpenAIClient | null = null

export async function getAzureOpenAIClient() {
  if (!azureOpenAIClient) {
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const endpoint = process.env.AZURE_OPENAI_API_ENDPOINT
    const deploymentName = process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME

    if (!apiKey || !endpoint || !deploymentName) {
      throw new Error("Azure OpenAI environment variables are not properly set")
    }

    azureOpenAIClient = new AzureOpenAIClient({
      apiKey,
      endpoint,
      deploymentName,
    })
  }

  return azureOpenAIClient
}

// Helper function to check if Azure OpenAI is properly configured
export async function isAzureOpenAIConfigured() {
  try {
    const apiKey = process.env.AZURE_OPENAI_API_KEY
    const endpoint = process.env.AZURE_OPENAI_API_ENDPOINT
    const deploymentName = process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME

    return !!(apiKey && endpoint && deploymentName)
  } catch (error) {
    console.error("Azure OpenAI configuration error:", error)
    return false
  }
}
