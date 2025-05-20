import { type NextRequest, NextResponse } from "next/server"
import { getMessages, addMessage } from "@/lib/conversation-service"
import { getConversation } from "@/lib/conversation-service"

export const runtime = "nodejs"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conversationId = Number.parseInt(params.id)
    if (isNaN(conversationId)) {
      return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 })
    }

    const conversation = await getConversation(conversationId)
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const messages = await getMessages(conversationId)
    return NextResponse.json(messages)
  } catch (error) {
    console.error("Error retrieving messages:", error)
    return NextResponse.json(
      { error: "Failed to retrieve messages", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conversationId = Number.parseInt(params.id)
    if (isNaN(conversationId)) {
      return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 })
    }

    const { role, content, model } = await req.json()
    if (!role || !content) {
      return NextResponse.json({ error: "Role and content are required" }, { status: 400 })
    }

    const conversation = await getConversation(conversationId)
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    const message = await addMessage(conversationId, role, content, model)
    return NextResponse.json(message)
  } catch (error) {
    console.error("Error adding message:", error)
    return NextResponse.json(
      { error: "Failed to add message", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
