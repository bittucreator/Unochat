import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code || !state) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  try {
    // Exchange code for token
    const tokenResponse = await fetch("https://api.stackauth.net/v1/token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        code,
        project_id: process.env.NEXT_PUBLIC_STACK_PROJECT_ID,
        secret_key: process.env.STACK_SECRET_SERVER_KEY,
      }),
    })

    if (!tokenResponse.ok) {
      throw new Error("Failed to exchange code for token")
    }

    // Redirect to the original page or home
    return NextResponse.redirect(new URL(state || "/", request.url))
  } catch (error) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(new URL("/", request.url))
  }
}
