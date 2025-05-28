import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
});

const NOTION_CLIENT_ID = process.env.NOTION_CLIENT_ID!;
const NOTION_CLIENT_SECRET = process.env.NOTION_CLIENT_SECRET!;
const NOTION_REDIRECT_URI = process.env.NOTION_REDIRECT_URI!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url!);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  // TODO: Validate state with session/cookie for CSRF protection

  if (!code) {
    // Step 1: Redirect to Notion OAuth
    const state = Math.random().toString(36).substring(2); // Replace with secure random
    const url = `https://api.notion.com/v1/oauth/authorize?owner=user&client_id=${NOTION_CLIENT_ID}&redirect_uri=${encodeURIComponent(NOTION_REDIRECT_URI)}&response_type=code&state=${state}`;
    return NextResponse.redirect(url);
  }

  // Step 2: Exchange code for access token
  const tokenRes = await fetch("https://api.notion.com/v1/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/json", "Authorization": `Basic ${Buffer.from(`${NOTION_CLIENT_ID}:${NOTION_CLIENT_SECRET}`).toString("base64")}` },
    body: JSON.stringify({
      grant_type: "authorization_code",
      code,
      redirect_uri: NOTION_REDIRECT_URI,
    }),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    return NextResponse.json({ error: "OAuth failed" }, { status: 400 });
  }

  // Save token in Neon DB for the authenticated user
  const session = await getServerSession(authOptions);
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await pool.query(
    "UPDATE users SET notion_token = $1 WHERE email = $2",
    [tokenData.access_token, session.user.email]
  );

  // If Notion returns a workspace/page selection, you can store it here as well
  // Example: const workspaceId = tokenData.workspace_id; (store in DB if needed)

  // Redirect to AI chat page after successful connection
  // Use absolute URL for redirect to avoid ERR_INVALID_URL
  const baseUrl = req.nextUrl.origin;
  return NextResponse.redirect(baseUrl + "/");
}
