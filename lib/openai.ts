// Direct Azure OpenAI API client

export type Message = {
  role: "user" | "assistant" | "system"
  content: string
}

export async function generateChatCompletion(
  messages: Message[],
  options: {
    model?: string
    temperature?: number
    max_tokens?: number
    stream?: boolean
    signal?: AbortSignal
  } = {},
) {
  const {
    model = process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME,
    temperature = 0.7,
    max_tokens = 1000,
    stream = false,
    signal,
  } = options

  // Validate environment variables
  if (!process.env.AZURE_OPENAI_ENDPOINT) {
    throw new Error("AZURE_OPENAI_ENDPOINT environment variable is not set")
  }
  if (!process.env.AZURE_OPENAI_API_KEY) {
    throw new Error("AZURE_OPENAI_API_KEY environment variable is not set")
  }
  if (!process.env.AZURE_OPENAI_DEPLOYMENT) {
    throw new Error("AZURE_OPENAI_DEPLOYMENT environment variable is not set")
  }

  const endpoint = process.env.AZURE_OPENAI_ENDPOINT.trim()
  const apiKey = process.env.AZURE_OPENAI_API_KEY.trim()
  const deploymentName = model || process.env.AZURE_OPENAI_DEPLOYMENT.trim()

  // If endpoint already contains query params, don't add them again
  let apiUrl: string
  if (endpoint.includes("chat/completions?")) {
    // Replace deployment name in endpoint if present
    apiUrl = endpoint.replace(/deployment=[^&]*/, `deployment=${deploymentName}`)
  } else {
    apiUrl = `${endpoint}/openai/deployments/${deploymentName}/chat/completions?api-version=2023-05-15`
  }

  // Ensure apiUrl is a valid Azure OpenAI endpoint
  if (!apiUrl.includes("openai") || !apiUrl.includes("chat/completions")) {
    throw new Error("AZURE_OPENAI_ENDPOINT is not a valid Azure OpenAI chat completions endpoint.")
  }

  try {
    console.log(`Calling Azure OpenAI API at: ${apiUrl} with model: ${deploymentName}`)

    const response = await fetch(apiUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "api-key": apiKey,
      },
      body: JSON.stringify({
        messages,
        temperature,
        max_tokens,
        stream,
      }),
      signal,
    })

    // If the response is HTML, throw a clear error
    const contentType = response.headers.get("content-type") || ""
    if (contentType.includes("text/html")) {
      const text = await response.text()
      throw new Error(`Azure OpenAI endpoint returned HTML instead of JSON. Check your endpoint URL and deployment name. Response: ${text.slice(0, 200)}`)
    }

    if (!response.ok) {
      let errorMessage = `Azure OpenAI API error: ${response.status} ${response.statusText}`

      try {
        const errorData = await response.json()
        errorMessage += ` ${JSON.stringify(errorData)}`

        // Check for specific error types
        if (response.status === 404) {
          errorMessage += "\nPossible causes: Incorrect deployment name, endpoint URL, or API key permissions."
        } else if (response.status === 401) {
          errorMessage += "\nPossible causes: Invalid API key or insufficient permissions."
        } else if (response.status === 429) {
          errorMessage += "\nPossible causes: Rate limit exceeded or quota exhausted."
        }
      } catch (e) {
        // If we can't parse the error response, just use the status
      }

      console.error(errorMessage)
      throw new Error(errorMessage)
    }

    if (stream) {
      return response
    } else {
      const data = await response.json()
      return data.choices[0].message.content
    }
  } catch (error) {
    console.error("Error calling Azure OpenAI API:", error)

    // Provide a more helpful error message
    if (error instanceof Error) {
      if (error.message.includes("fetch failed")) {
        throw new Error(
          `Network error connecting to Azure OpenAI API. Please check your internet connection and the API endpoint: ${error.message}`,
        )
      }
      throw error
    }
    throw new Error(`Unknown error calling Azure OpenAI API: ${String(error)}`)
  }
}

// Function to handle streaming responses
export async function* streamChatCompletion(
  messages: Message[],
  options: {
    model?: string
    temperature?: number
    max_tokens?: number
    signal?: AbortSignal
  } = {},
) {
  const response = await generateChatCompletion(messages, { ...options, stream: true })

  if (!response.body) {
    throw new Error("Response body is null")
  }

  const reader = response.body.getReader()
  const decoder = new TextDecoder("utf-8")
  let buffer = ""

  try {
    while (true) {
      const { done, value } = await reader.read()
      if (done) break

      buffer += decoder.decode(value, { stream: true })

      // Process the buffer to extract complete SSE messages
      const lines = buffer.split("\n")
      buffer = lines.pop() || ""

      for (const line of lines) {
        const trimmedLine = line.trim()
        if (!trimmedLine || trimmedLine === "data: [DONE]") continue

        if (trimmedLine.startsWith("data: ")) {
          try {
            const data = JSON.parse(trimmedLine.slice(6))
            const content = data.choices[0]?.delta?.content || ""
            if (content) {
              yield content
            }
          } catch (e) {
            console.error("Error parsing SSE message:", e)
          }
        }
      }
    }
  } finally {
    reader.releaseLock()
  }
}

// Helper function to validate Azure OpenAI configuration
export function validateAzureOpenAIConfig(): { isValid: boolean; error?: string } {
  if (!process.env.AZURE_OPENAI_ENDPOINT) {
    return { isValid: false, error: "AZURE_OPENAI_ENDPOINT environment variable is not set" }
  }
  if (!process.env.AZURE_OPENAI_API_KEY) {
    return { isValid: false, error: "AZURE_OPENAI_API_KEY environment variable is not set" }
  }
  if (!process.env.AZURE_OPENAI_DEPLOYMENT) {
    return { isValid: false, error: "AZURE_OPENAI_DEPLOYMENT environment variable is not set" }
  }
  return { isValid: true }
}
