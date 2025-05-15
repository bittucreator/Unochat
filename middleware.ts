import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { validateConfig } from "./lib/config"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  // Only run this check in development to avoid unnecessary overhead in production
  if (process.env.NODE_ENV === "development") {
    const missingVars = validateConfig()

    // If we're missing environment variables and not already on the setup page
    if (missingVars && !request.nextUrl.pathname.startsWith("/setup")) {
      // Redirect to a setup page that explains the missing variables
      const url = request.nextUrl.clone()
      url.pathname = "/setup"
      url.search = `?missing=${encodeURIComponent(JSON.stringify(missingVars))}`
      return NextResponse.redirect(url)
    }
  }

  // Create a Supabase client for auth checks
  const res = NextResponse.next()
  const supabase = createMiddlewareClient({ req: request, res })

  // Check if the user is authenticated for protected routes
  if (request.nextUrl.pathname.startsWith("/dashboard") || request.nextUrl.pathname.startsWith("/profile")) {
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (!session) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

// Only run the middleware on specific paths
export const config = {
  matcher: [
    "/figma-converter/:path*",
    "/nextjs-generator/:path*",
    "/api/:path*",
    "/dashboard/:path*",
    "/profile/:path*",
  ],
}
