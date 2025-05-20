import { executeQuery } from "./db"

export type FileData = {
  id: number
  message_id: number | null
  filename: string
  content_type: string
  data: Buffer
  size: number
  created_at: Date
}

export async function uploadFile(
  file: File,
  messageId?: number,
): Promise<{ id: number; filename: string; content_type: string; size: number }> {
  try {
    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    // Insert file into database
    const result = await executeQuery(
      `
      INSERT INTO files (message_id, filename, content_type, data, size, created_at)
      VALUES ($1, $2, $3, $4, $5, CURRENT_TIMESTAMP)
      RETURNING id, filename, content_type, size
      `,
      [messageId || null, file.name, file.type, buffer, file.size],
    )

    return result[0]
  } catch (error) {
    console.error("Error uploading file:", error)
    throw new Error("Failed to upload file")
  }
}

export async function getFile(fileId: number): Promise<FileData | null> {
  try {
    const result = await executeQuery(
      `
      SELECT id, message_id, filename, content_type, data, size, created_at
      FROM files
      WHERE id = $1
      `,
      [fileId],
    )

    return result[0] || null
  } catch (error) {
    console.error("Error retrieving file:", error)
    throw new Error("Failed to retrieve file")
  }
}

export async function getFilesByMessageId(messageId: number): Promise<Omit<FileData, "data">[]> {
  try {
    const result = await executeQuery(
      `
      SELECT id, message_id, filename, content_type, size, created_at
      FROM files
      WHERE message_id = $1
      `,
      [messageId],
    )

    return result
  } catch (error) {
    console.error("Error retrieving files for message:", error)
    throw new Error("Failed to retrieve files for message")
  }
}
