import { StreamingTextResponse } from "ai"
import { openai } from "@ai-sdk/openai"
import { xai } from "@ai-sdk/xai"
import { streamText } from "ai"

export const runtime = "nodejs"

export async function POST(req: Request) {
  try {
    const { messages, model = "gpt-4o" } = await req.json()

    // Process any attachments in the messages
    const processedMessages = messages.map((message: any) => {
      // If the message has attachments, include them in the content
      if (message.attachments && message.attachments.length > 0) {
        // For images, we can include their URLs
        const attachmentDescriptions = message.attachments
          .map((attachment: any) => {
            if (attachment.contentType.startsWith("image/")) {
              return `[Image: ${attachment.filename} (${attachment.url})]`
            } else {
              return `[File: ${attachment.filename}]`
            }
          })
          .join("\n")

        // Combine the original content with attachment descriptions
        return {
          ...message,
          content: `${message.content}\n\n${attachmentDescriptions}`.trim(),
        }
      }

      return message
    })

    // Log the model being used for debugging
    console.log(`Using model: ${model}`)

    // Select the appropriate model provider based on the model name
    let selectedModel

    if (model.startsWith("grok")) {
      // For Grok models, we need to use the correct model ID format
      // The format might be different depending on your Azure deployment
      // Try using the model name directly from Azure
      console.log("Using xAI provider for Grok model")

      // Use the XAI_API_KEY environment variable that was set up during integration
      if (!process.env.XAI_API_KEY) {
        throw new Error("XAI_API_KEY environment variable is not set")
      }

      selectedModel = xai(model)
    } else {
      // Default to OpenAI for other models
      console.log("Using OpenAI provider")
      selectedModel = openai(model)
    }

    // Format messages for the AI SDK
    const formattedMessages = processedMessages.map((m: any) => ({
      role: m.role,
      content: m.content,
    }))

    console.log("Sending request to AI model with messages:", JSON.stringify(formattedMessages))

    // Use the AI SDK to stream the response
    const result = await streamText({
      model: selectedModel,
      messages: formattedMessages,
    })

    // Convert the result to a StreamingTextResponse
    return new StreamingTextResponse(result.toReadableStream())
  } catch (error) {
    console.error("Error in chat API:", error)

    // Return a more detailed error response
    return new Response(
      JSON.stringify({
        error: "Failed to get response from AI model",
        details: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      },
    )
  }
}
