import { type NextRequest, NextResponse } from "next/server"
import {
  streamChatCompletion,
  generateChatCompletion,
  type Message as OpenAIMessage,
  validateAzureOpenAIConfig,
} from "@/lib/openai"
import { addMessage, createConversation, getConversation } from "@/lib/conversation-service"

export const runtime = "nodejs"

export async function POST(req: NextRequest) {
  try {
    // Validate Azure OpenAI configuration first
    const configValidation = validateAzureOpenAIConfig()
    if (!configValidation.isValid) {
      return NextResponse.json(
        {
          error: "Azure OpenAI configuration error",
          details: configValidation.error,
          message: "Please check your environment variables for Azure OpenAI API",
        },
        { status: 500 },
      )
    }

    const { messages, model = "gpt-4o", conversationId, userId } = await req.json()

    if (!userId) {
      return NextResponse.json({ error: "User ID is required" }, { status: 400 })
    }

    // Get or create conversation
    let conversation
    if (conversationId) {
      conversation = await getConversation(conversationId)
      if (!conversation) {
        return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
      }
      if (conversation.user_id !== userId) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
      }
    } else {
      // Create a new conversation
      conversation = await createConversation(userId, "New Conversation", model)
    }

    // Format messages for OpenAI
    const formattedMessages: OpenAIMessage[] = messages.map((message: any) => ({
      role: message.role,
      content: message.content,
    }))

    // Save user message to database
    const lastUserMessage = formattedMessages[formattedMessages.length - 1]
    if (lastUserMessage.role === "user") {
      await addMessage(conversation.id, "user", lastUserMessage.content)
    }

    // Check if streaming is requested
    const stream = req.headers.get("accept")?.includes("text/event-stream")

    if (stream) {
      // For streaming responses
      const encoder = new TextEncoder()
      const customReadable = new ReadableStream({
        async start(controller) {
          try {
            // Create a variable to accumulate the assistant's response
            let assistantResponse = ""

            // Stream the chat completion
            for await (const chunk of streamChatCompletion(formattedMessages, {
              model: model,
              temperature: 0.7,
              max_tokens: 1000,
            })) {
              // Accumulate the response
              assistantResponse += chunk

              // Send the chunk to the client
              controller.enqueue(encoder.encode(`data: ${JSON.stringify({ text: chunk })}\n\n`))
            }

            // Save the complete assistant response to the database
            await addMessage(conversation.id, "assistant", assistantResponse, model)

            // Signal the end of the stream
            controller.enqueue(encoder.encode("data: [DONE]\n\n"))
            controller.close()
          } catch (error) {
            console.error("Error in streaming response:", error)

            // Send error to client
            const errorMessage = error instanceof Error ? error.message : String(error)
            controller.enqueue(encoder.encode(`data: ${JSON.stringify({ error: errorMessage })}\n\n`))
            controller.close()
          }
        },
      })

      return new Response(customReadable, {
        headers: {
          "Content-Type": "text/event-stream",
          "Cache-Control": "no-cache",
          Connection: "keep-alive",
        },
      })
    } else {
      // For non-streaming responses
      try {
        const response = await generateChatCompletion(formattedMessages, {
          model: model,
          temperature: 0.7,
          max_tokens: 1000,
        })

        // Save assistant response to database
        await addMessage(conversation.id, "assistant", response, model)

        return NextResponse.json({ text: response, conversationId: conversation.id })
      } catch (error) {
        console.error("Error generating chat completion:", error)

        // Create a fallback response for critical errors
        const errorMessage = error instanceof Error ? error.message : String(error)
        const fallbackResponse =
          "I'm sorry, I encountered an error connecting to my AI service. Please try again later or contact support if the issue persists."

        // Save the fallback response to the database
        await addMessage(conversation.id, "assistant", fallbackResponse, model)

        return NextResponse.json({
          text: fallbackResponse,
          conversationId: conversation.id,
          error: "Failed to get response from AI model",
          details: errorMessage,
        })
      }
    }
  } catch (error) {
    console.error("Error in chat API:", error)
    return NextResponse.json(
      {
        error: "Failed to get response from AI model",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 },
    )
  }
}
