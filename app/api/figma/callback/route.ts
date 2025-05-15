import { handleFigmaAuthCallback } from "@/app/actions/figma-actions"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const code = searchParams.get("code")
  const error = searchParams.get("error")

  if (error) {
    // Redirect to error page or show error message
    return NextResponse.redirect(new URL("/figma-converter?error=" + error, request.url))
  }

  if (!code) {
    return NextResponse.redirect(new URL("/figma-converter?error=no_code", request.url))
  }

  const result = await handleFigmaAuthCallback(code)

  if (!result.success) {
    return NextResponse.redirect(
      new URL(`/figma-converter?error=${encodeURIComponent(result.error || "unknown")}`, request.url),
    )
  }

  return NextResponse.redirect(new URL(result.redirectPath, request.url))
}
