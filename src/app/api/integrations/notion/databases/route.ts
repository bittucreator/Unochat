import { NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import { getServerSession } from "next-auth/next";

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
});

// Fetch Notion databases for the authenticated user
export async function GET() {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  // Get user's Notion token
  const { rows } = await pool.query(
    "SELECT notion_token FROM users WHERE email = $1",
    [session.user.email]
  );
  if (!rows.length || !rows[0].notion_token) {
    return NextResponse.json({ error: "Notion not connected" }, { status: 400 });
  }
  const notionToken = rows[0].notion_token;
  // Fetch databases from Notion API
  const notionRes = await fetch("https://api.notion.com/v1/search", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${notionToken}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ filter: { property: "object", value: "database" } })
  });
  const data = await notionRes.json();
  return NextResponse.json(data);
}
