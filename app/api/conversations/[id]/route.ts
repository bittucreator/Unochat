import { type NextRequest, NextResponse } from "next/server"
import {
  getConversation,
  updateConversationTitle,
  updateConversationModel,
  deleteConversation,
} from "@/lib/conversation-service"

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

    return NextResponse.json(conversation)
  } catch (error) {
    console.error("Error retrieving conversation:", error)
    return NextResponse.json(
      { error: "Failed to retrieve conversation", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conversationId = Number.parseInt(params.id)
    if (isNaN(conversationId)) {
      return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 })
    }

    const { title, model } = await req.json()

    const conversation = await getConversation(conversationId)
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    if (title) {
      await updateConversationTitle(conversationId, title)
    }

    if (model) {
      await updateConversationModel(conversationId, model)
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error updating conversation:", error)
    return NextResponse.json(
      { error: "Failed to update conversation", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const conversationId = Number.parseInt(params.id)
    if (isNaN(conversationId)) {
      return NextResponse.json({ error: "Invalid conversation ID" }, { status: 400 })
    }

    const conversation = await getConversation(conversationId)
    if (!conversation) {
      return NextResponse.json({ error: "Conversation not found" }, { status: 404 })
    }

    await deleteConversation(conversationId)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting conversation:", error)
    return NextResponse.json(
      { error: "Failed to delete conversation", details: error instanceof Error ? error.message : String(error) },
      { status: 500 },
    )
  }
}
