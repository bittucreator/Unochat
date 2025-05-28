import { NextRequest, NextResponse } from "next/server";
import { Pool } from "@neondatabase/serverless";
import { getServerSession } from "next-auth/next";

const pool = new Pool({
  connectionString: process.env.NEON_DB_URL,
  ssl: { rejectUnauthorized: false },
});

const LINEAR_CLIENT_ID = process.env.LINEAR_CLIENT_ID!;
const LINEAR_CLIENT_SECRET = process.env.LINEAR_CLIENT_SECRET!;
const LINEAR_REDIRECT_URI = process.env.LINEAR_REDIRECT_URI!;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url!);
  const code = searchParams.get("code");
  const state = searchParams.get("state");
  // TODO: Validate state with session/cookie for CSRF protection

  if (!code) {
    // Step 1: Redirect to Linear OAuth
    const state = Math.random().toString(36).substring(2); // Replace with secure random
    const url = `https://linear.app/oauth/authorize?response_type=code&client_id=${LINEAR_CLIENT_ID}&redirect_uri=${encodeURIComponent(
      LINEAR_REDIRECT_URI
    )}&state=${state}&scope=read,write`;
    return NextResponse.redirect(url);
  }

  // Step 2: Exchange code for access token
  const tokenRes = await fetch("https://api.linear.app/oauth/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: LINEAR_REDIRECT_URI,
      client_id: LINEAR_CLIENT_ID,
      client_secret: LINEAR_CLIENT_SECRET,
    }).toString(),
  });
  const tokenData = await tokenRes.json();
  if (!tokenData.access_token) {
    console.error('Linear OAuth error:', tokenData);
    return NextResponse.json({ error: "OAuth failed", details: tokenData }, { status: 400 });
  }

  // Save token in Neon DB for the authenticated user
  const session = await getServerSession();
  if (!session || !session.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await pool.query(
    "UPDATE users SET linear_token = $1 WHERE email = $2",
    [tokenData.access_token, session.user.email]
  );

  // Redirect to settings page (must be absolute URL)
  const baseUrl = process.env.NEXTAUTH_URL || "http://localhost:3000";
  return NextResponse.redirect(baseUrl + "/settings");
}
