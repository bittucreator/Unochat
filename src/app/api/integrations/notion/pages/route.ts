import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import { getServerSession } from "next-auth/next";

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
});

// Create a Notion page in the selected database from a chat message
export async function POST(req: NextRequest) {
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const body = await req.json();
  let { message, databaseId } = body;
  if (!message) {
    return NextResponse.json({ error: "Missing message" }, { status: 400 });
  }
  // Get user's Notion token and saved database
  const { rows } = await pool.query(
    "SELECT notion_token, notion_database_id FROM users WHERE email = $1",
    [session.user.email]
  );
  if (!rows.length || !rows[0].notion_token) {
    return NextResponse.json({ error: "Notion not connected" }, { status: 400 });
  }
  if (!databaseId) {
    databaseId = rows[0].notion_database_id;
  }
  if (!databaseId) {
    return NextResponse.json({ error: "No Notion database selected" }, { status: 400 });
  }
  const notionToken = rows[0].notion_token;
  // Create Notion page
  const notionRes = await fetch("https://api.notion.com/v1/pages", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${notionToken}`,
      "Notion-Version": "2022-06-28",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      parent: { database_id: databaseId },
      properties: {
        Name: {
          title: [
            {
              text: { content: message.substring(0, 50) }
            }
          ]
        }
      },
      children: [
        {
          object: "block",
          type: "paragraph",
          paragraph: {
            rich_text: [
              {
                type: "text",
                text: { content: message }
              }
            ]
          }
        }
      ]
    })
  });
  if (!notionRes.ok) {
    const error = await notionRes.json();
    return NextResponse.json({ error }, { status: 500 });
  }
  const data = await notionRes.json();
  return NextResponse.json(data);
}
