import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import { validate as validateUUID } from 'uuid';
import { getServerSession } from "next-auth/next";
import { authOptions } from "../auth/[...nextauth]/route";

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
});

// GET /api/messages?chatId=...
export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url!);
    const chatId = searchParams.get("chatId");
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);
    if (!chatId) return NextResponse.json({ error: "chatId required" }, { status: 400 });
    if (!validateUUID(chatId)) {
      return NextResponse.json({ error: "chatId must be a valid UUID" }, { status: 400 });
    }
    const { rows } = await pool.query(
      "SELECT id, chatId, userId, role, content, createdAt FROM messages WHERE chatId = $1 AND (deleted IS NULL OR deleted = false) ORDER BY createdAt ASC LIMIT $2 OFFSET $3",
      [chatId, limit, offset]
    );
    return NextResponse.json(rows);
  } catch (err) {
    console.error('[API/messages GET] Error:', err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// POST /api/messages (create a new message)
export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await req.json();
  } catch (err) {
    console.error('[API/messages POST] Invalid JSON:', err);
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { chatId, userId, role, content } = body;
  // Validate chatId is a UUID
  if (!chatId || !validateUUID(chatId)) {
    console.error('[API/messages POST] Invalid chatId:', chatId);
    return NextResponse.json({ error: "chatId must be a valid UUID" }, { status: 400 });
  }
  // Validate role and content
  if (!role || typeof role !== 'string' || !content || typeof content !== 'string') {
    return NextResponse.json({ error: "role and content must be non-empty strings" }, { status: 400 });
  }
  // Optionally validate userId if present
  if (userId && typeof userId === 'string' && !validateUUID(userId)) {
    console.error('[API/messages POST] Invalid userId:', userId);
    return NextResponse.json({ error: "userId must be a valid UUID or null" }, { status: 400 });
  }
  // Check if chatId exists in chats table
  try {
    const chatCheck = await pool.query("SELECT id FROM chats WHERE id = $1", [chatId]);
    if (!chatCheck.rows || chatCheck.rows.length === 0) {
      console.error('[API/messages POST] chatId does not exist:', chatId);
      return NextResponse.json({ error: "chatId does not exist" }, { status: 400 });
    }
  } catch {
    return NextResponse.json({ error: "Database error during chatId lookup" }, { status: 500 });
  }
  try {
    const { rows } = await pool.query(
      "INSERT INTO messages (chatId, userId, role, content) VALUES ($1, $2, $3, $4) RETURNING id, chatId, userId, role, content, createdAt",
      [chatId, userId ?? null, role, content]
    );
    if (!rows || rows.length === 0) {
      console.error('[API/messages POST] Insert returned no rows', { chatId, userId, role, content });
      return NextResponse.json({ error: "Failed to insert message" }, { status: 500 });
    }
    return NextResponse.json(rows[0]);
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// PATCH /api/messages (edit a message)
export async function PATCH(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { id, content } = body;
  if (!id || typeof content !== 'string' || !content.trim()) {
    return NextResponse.json({ error: "id and new content required" }, { status: 400 });
  }
  // Only allow editing if user owns the message
  try {
    const { rows } = await pool.query("SELECT userId FROM messages WHERE id = $1", [id]);
    if (!rows.length) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    if (!session.user || rows[0].userId !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const update = await pool.query(
      "UPDATE messages SET content = $1 WHERE id = $2 RETURNING id, chatId, userId, role, content, createdAt",
      [content, id]
    );
    return NextResponse.json(update.rows[0]);
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// SOFT DELETE: set deleted=true instead of removing
export async function DELETE(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  let body;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }
  const { id } = body;
  if (!id) return NextResponse.json({ error: "id required" }, { status: 400 });
  // Only allow deleting if user owns the message
  try {
    const { rows } = await pool.query("SELECT userId FROM messages WHERE id = $1", [id]);
    if (!rows.length) return NextResponse.json({ error: "Message not found" }, { status: 404 });
    if (!session.user || rows[0].userId !== session.user.email) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await pool.query("UPDATE messages SET deleted = true WHERE id = $1", [id]);
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
