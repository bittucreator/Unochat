import { executeQuery } from "./db"

export async function initializeDatabase() {
  try {
    console.log("Initializing database schema...")

    // Check if conversations table exists
    const tableExists = await checkTableExists("conversations")

    if (!tableExists) {
      console.log("Creating database tables...")

      // Create conversations table
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS conversations (
          id SERIAL PRIMARY KEY,
          user_id TEXT NOT NULL,
          title TEXT NOT NULL DEFAULT 'New Conversation',
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          last_message_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          model TEXT NOT NULL DEFAULT 'gpt-4o'
        )
      `)

      // Create messages table
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS messages (
          id SERIAL PRIMARY KEY,
          conversation_id INTEGER NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
          role TEXT NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
          content TEXT NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
          model TEXT
        )
      `)

      // Create files table
      await executeQuery(`
        CREATE TABLE IF NOT EXISTS files (
          id SERIAL PRIMARY KEY,
          message_id INTEGER REFERENCES messages(id) ON DELETE CASCADE,
          filename TEXT NOT NULL,
          content_type TEXT NOT NULL,
          data BYTEA NOT NULL,
          size INTEGER NOT NULL,
          created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
        )
      `)

      // Create indexes for better performance
      await executeQuery(`CREATE INDEX IF NOT EXISTS idx_conversations_user_id ON conversations(user_id)`)
      await executeQuery(`CREATE INDEX IF NOT EXISTS idx_messages_conversation_id ON messages(conversation_id)`)
      await executeQuery(`CREATE INDEX IF NOT EXISTS idx_files_message_id ON files(message_id)`)

      console.log("Database schema initialized successfully")
    } else {
      console.log("Database schema already exists")
    }

    return { success: true }
  } catch (error) {
    console.error("Error initializing database schema:", error)
    return { success: false, error }
  }
}

async function checkTableExists(tableName: string): Promise<boolean> {
  try {
    const result = await executeQuery(
      `
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_name = $1
      )
    `,
      [tableName],
    )

    return result[0]?.exists || false
  } catch (error) {
    console.error(`Error checking if table ${tableName} exists:`, error)
    return false
  }
}
