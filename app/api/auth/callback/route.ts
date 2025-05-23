import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const state = searchParams.get("state")

  if (!code || !state) {
    return NextResponse.redirect(new URL("/", request.url))
  }

  try {
    // Google Auth callback logic will be added here

    // Redirect to the original page or home
    return NextResponse.redirect(new URL(state || "/", request.url))
  } catch (error) {
    console.error("Auth callback error:", error)
    return NextResponse.redirect(new URL("/", request.url))
  }
}
