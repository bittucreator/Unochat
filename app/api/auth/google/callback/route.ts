import { db, executeQuery } from "@/lib/db"
import { randomBytes } from "crypto"
import { NextRequest, NextResponse } from "next/server"

async function upsertUser({ name, email, picture }: { name: string; email: string; picture: string }) {
  // Upsert user in the database
  const result = await executeQuery(
    `INSERT INTO users (name, email, picture) VALUES ($1, $2, $3)
     ON CONFLICT (email) DO UPDATE SET name = $1, picture = $3 RETURNING id, name, email, picture`,
    [name, email, picture]
  )
  return result[0]
}

async function storeSession(userId: number, sessionToken: string, refreshToken: string, expiresAt: Date) {
  await executeQuery(
    `INSERT INTO sessions (user_id, session_token, refresh_token, expires_at) VALUES ($1, $2, $3, $4)
     ON CONFLICT (session_token) DO UPDATE SET expires_at = $4`,
    [userId, sessionToken, refreshToken, expiresAt]
  )
}

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const redirectUri = `${url.origin}/api/auth/google/callback`

  if (!code) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Exchange code for tokens
  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      code,
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      redirect_uri: redirectUri,
      grant_type: "authorization_code",
    }),
  })

  if (!tokenRes.ok) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  const tokenData = await tokenRes.json()

  // Get user info from Google
  const userRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
    headers: {
      Authorization: `Bearer ${tokenData.access_token}`,
    },
  })

  if (!userRes.ok) {
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  const user = await userRes.json()

  // Upsert user in Neon database
  const dbUser = await upsertUser({ name: user.name, email: user.email, picture: user.picture })

  // Generate a secure session token and refresh token
  const sessionToken = randomBytes(32).toString("hex")
  const refreshToken = randomBytes(32).toString("hex")
  const expiresAt = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7) // 7 days

  // Store session in Neon database
  await storeSession(dbUser.id, sessionToken, refreshToken, expiresAt)

  // Set session cookie (httpOnly, secure)
  const response = NextResponse.redirect(new URL("/", request.url))
  response.cookies.set("session", sessionToken, {
    path: "/",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  })
  response.cookies.set("refresh_token", refreshToken, {
    path: "/api/auth/google/callback",
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    expires: expiresAt,
  })
  return response
}
