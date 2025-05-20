import { executeQuery } from "./db"

export type Conversation = {
  id: number
  user_id: string
  title: string
  created_at: Date
  updated_at: Date
  last_message_at: Date
  model: string
}

export type Message = {
  id: number
  conversation_id: number
  role: "user" | "assistant" | "system"
  content: string
  created_at: Date
  model: string | null
}

export async function createConversation(
  userId: string,
  title = "New Conversation",
  model = "gpt-4o",
): Promise<Conversation> {
  try {
    const result = await executeQuery(
      `
      INSERT INTO conversations (user_id, title, model, created_at, updated_at, last_message_at)
      VALUES ($1, $2, $3, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
      RETURNING id, user_id, title, created_at, updated_at, last_message_at, model
      `,
      [userId, title, model],
    )

    return result[0]
  } catch (error) {
    console.error("Error creating conversation:", error)
    throw new Error("Failed to create conversation")
  }
}

export async function getConversations(userId: string): Promise<Conversation[]> {
  try {
    return await executeQuery(
      `
      SELECT id, user_id, title, created_at, updated_at, last_message_at, model
      FROM conversations
      WHERE user_id = $1
      ORDER BY last_message_at DESC
      `,
      [userId],
    )
  } catch (error) {
    console.error("Error retrieving conversations:", error)
    throw new Error("Failed to retrieve conversations")
  }
}

export async function getConversation(conversationId: number): Promise<Conversation | null> {
  try {
    const result = await executeQuery(
      `
      SELECT id, user_id, title, created_at, updated_at, last_message_at, model
      FROM conversations
      WHERE id = $1
      `,
      [conversationId],
    )

    return result[0] || null
  } catch (error) {
    console.error("Error retrieving conversation:", error)
    throw new Error("Failed to retrieve conversation")
  }
}

export async function updateConversationTitle(conversationId: number, title: string): Promise<void> {
  try {
    await executeQuery(
      `
      UPDATE conversations
      SET title = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [title, conversationId],
    )
  } catch (error) {
    console.error("Error updating conversation title:", error)
    throw new Error("Failed to update conversation title")
  }
}

export async function updateConversationModel(conversationId: number, model: string): Promise<void> {
  try {
    await executeQuery(
      `
      UPDATE conversations
      SET model = $1, updated_at = CURRENT_TIMESTAMP
      WHERE id = $2
      `,
      [model, conversationId],
    )
  } catch (error) {
    console.error("Error updating conversation model:", error)
    throw new Error("Failed to update conversation model")
  }
}

export async function deleteConversation(conversationId: number): Promise<void> {
  try {
    await executeQuery(
      `
      DELETE FROM conversations
      WHERE id = $1
      `,
      [conversationId],
    )
  } catch (error) {
    console.error("Error deleting conversation:", error)
    throw new Error("Failed to delete conversation")
  }
}

export async function addMessage(
  conversationId: number,
  role: "user" | "assistant" | "system",
  content: string,
  model?: string,
): Promise<Message> {
  try {
    // Add the message
    const messageResult = await executeQuery(
      `
      INSERT INTO messages (conversation_id, role, content, model, created_at)
      VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
      RETURNING id, conversation_id, role, content, created_at, model
      `,
      [conversationId, role, content, model || null],
    )

    // Update the conversation's last_message_at timestamp
    await executeQuery(
      `
      UPDATE conversations
      SET last_message_at = CURRENT_TIMESTAMP, updated_at = CURRENT_TIMESTAMP
      WHERE id = $1
      `,
      [conversationId],
    )

    return messageResult[0]
  } catch (error) {
    console.error("Error adding message:", error)
    throw new Error("Failed to add message")
  }
}

export async function getMessages(conversationId: number): Promise<Message[]> {
  try {
    return await executeQuery(
      `
      SELECT id, conversation_id, role, content, created_at, model
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      `,
      [conversationId],
    )
  } catch (error) {
    console.error("Error retrieving messages:", error)
    throw new Error("Failed to retrieve messages")
  }
}
