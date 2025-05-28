import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import { getServerSession } from "next-auth/next";

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
});

// Save selected Notion database for the authenticated user
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  const { databaseId } = body;
  if (!databaseId) {
    return NextResponse.json({ error: "Missing databaseId" }, { status: 400 });
  }
  await pool.query(
    "UPDATE users SET notion_database_id = $1 WHERE email = $2",
    [databaseId, session.user.email]
  );
  return NextResponse.json({ success: true });
}
