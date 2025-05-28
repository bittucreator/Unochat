import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import { getServerSession } from "next-auth/next";

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
});

// Create a new Notion database (table) for a waitlist
export async function POST(req: NextRequest) {
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
  const body = await req.json();
  const { parentPageId, title } = body;
  if (!parentPageId || !title) {
    return NextResponse.json({ error: "Missing parentPageId or title" }, { status: 400 });
  }
  // Create Notion database
  const notionRes = await fetch("https://api.notion.com/v1/databases", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${notionToken}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      parent: { type: "page_id", page_id: parentPageId },
      title: [
        {
          type: "text",
          text: { content: title }
        }
      ],
      properties: {
        Name: { title: {} },
        Email: { email: {} },
        "Date Joined": { date: {} },
        Status: { select: { options: [ { name: "Pending", color: "yellow" }, { name: "Approved", color: "green" }, { name: "Rejected", color: "red" } ] } },
        Notes: { rich_text: {} }
      }
    })
  });
  const data = await notionRes.json();
  if (!notionRes.ok) {
    return NextResponse.json({ error: data }, { status: 500 });
  }
  return NextResponse.json(data);
}
