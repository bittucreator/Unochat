import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = new URL(request.url)
  const redirectUri = `${url.origin}/api/auth/google/callback`
  const clientId = process.env.GOOGLE_CLIENT_ID
  const scope = "openid email profile"
  const state = Math.random().toString(36).substring(2)

  const googleAuthUrl =
    `https://accounts.google.com/o/oauth2/v2/auth?` +
    `client_id=${clientId}` +
    `&redirect_uri=${encodeURIComponent(redirectUri)}` +
    `&response_type=code` +
    `&scope=${encodeURIComponent(scope)}` +
    `&state=${state}`

  return NextResponse.redirect(googleAuthUrl)
}
