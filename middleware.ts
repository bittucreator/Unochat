import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { validateConfig } from "./lib/config"

export function middleware(request: NextRequest) {
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

  return NextResponse.next()
}

// Only run the middleware on specific paths
export const config = {
  matcher: ["/figma-converter/:path*", "/nextjs-generator/:path*", "/api/:path*"],
}
