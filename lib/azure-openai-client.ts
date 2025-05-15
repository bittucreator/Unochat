"use server"

// Initialize the Azure OpenAI client
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
