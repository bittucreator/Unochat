import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import { getServerSession } from "next-auth/next";
import { v4 as uuidv4 } from 'uuid';

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  // Neon recommends always enabling SSL
  ssl: { rejectUnauthorized: false },
});

export async function GET() {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Get all chats (no content)
  const { rows } = await pool.query("SELECT id, title FROM chats ORDER BY created_at DESC");
  return NextResponse.json(rows);
}

export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { title } = await req.json();
  const id = uuidv4();
  // Insert with generated UUID
  const { rows } = await pool.query(
    "INSERT INTO chats (id, title, content) VALUES ($1, $2, $3) RETURNING id, title",
    [id, title, ""]
  );
  return NextResponse.json(rows[0]);
}

export async function DELETE(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await req.json();
  await pool.query("DELETE FROM chats WHERE id = $1", [id]);
  return NextResponse.json({ success: true });
}

export async function PATCH(req: NextRequest) {
  const session = await getServerSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id, title } = await req.json();
  const { rows } = await pool.query(
    "UPDATE chats SET title = $1 WHERE id = $2 RETURNING id, title",
    [title, id]
  );
  return NextResponse.json(rows[0]);
}
