import { NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import { getServerSession } from "next-auth/next";

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
});

// Disconnect Notion integration for the authenticated user
export async function POST() {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Remove Notion token from user in DB
  await pool.query(
    "UPDATE users SET notion_token = NULL WHERE email = $1",
    [session.user.email]
  );
  return NextResponse.json({ success: true });
}
