import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { validateConfig } from "./lib/config"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

const publicRoutes = ["/", "/login", "/pricing", "/documentation", "/setup"]
const protectedRoutes = ["/dashboard", "/profile", "/settings", "/billing", "/figma-converter", "/nextjs-generator"]

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
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Redirect authenticated users from home page to dashboard
  if (session && request.nextUrl.pathname === "/") {
    const redirectUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Check if the user is authenticated for protected routes
  if (protectedRoutes.some((route) => request.nextUrl.pathname.startsWith(route))) {
    if (!session) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }
  }

  return res
}

// Run the middleware on all routes
export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.svg).*)"],
}
