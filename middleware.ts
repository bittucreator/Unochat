import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { validateConfig } from "./lib/config"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

// Define public and protected routes
const publicRoutes = ["/", "/login", "/pricing", "/documentation", "/terms", "/privacy", "/setup"]
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

  // Create a response to modify
  const res = NextResponse.next()

  // Create a Supabase client for auth checks
  const supabase = createMiddlewareClient({ req: request, res })

  try {
    // Get the user's session
    const {
      data: { session },
    } = await supabase.auth.getSession()

    const pathname = request.nextUrl.pathname

    // Check if the current path is a protected route
    const isProtectedRoute = protectedRoutes.some((route) => pathname.startsWith(route))

    // Check if the current path is the home page
    const isHomePage = pathname === "/"

    // If user is authenticated and on the home page, redirect to dashboard
    if (session && isHomePage) {
      const redirectUrl = new URL("/dashboard", request.url)
      return NextResponse.redirect(redirectUrl)
    }

    // If user is not authenticated and on a protected route, redirect to login
    if (!session && isProtectedRoute) {
      const redirectUrl = new URL("/login", request.url)
      redirectUrl.searchParams.set("redirectTo", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Continue with the request
    return res
  } catch (error) {
    console.error("Middleware error:", error)
    // In case of an error, allow the request to continue
    // The client-side auth provider will handle redirects if needed
    return res
  }
}

// Run the middleware on all routes except static assets
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.svg).*)",
  ],
}
