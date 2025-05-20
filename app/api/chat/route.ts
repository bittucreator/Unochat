import { StreamingTextResponse } from "ai"
import { openai } from "@ai-sdk/openai"
import { streamText } from "ai"

export const runtime = "nodejs"

export async function POST(req: Request) {
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

  // Use the AI SDK to stream the response
  const result = await streamText({
    model: openai(model),
    messages: processedMessages.map((m: any) => ({
      role: m.role,
      content: m.content,
    })),
  })

  // Convert the result to a StreamingTextResponse
  return new StreamingTextResponse(result.toReadableStream())
}
