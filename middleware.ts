import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createMiddlewareClient } from "@supabase/auth-helpers-nextjs"

export async function middleware(request: NextRequest) {
  // Create a Supabase client configured to use cookies
  const supabase = createMiddlewareClient({ req: request, res: NextResponse.next() })

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Check if the request is for an auth page
  const isAuthPage = request.nextUrl.pathname.startsWith("/auth")

  // If user is signed in and trying to access an auth page, redirect to dashboard
  if (session && isAuthPage) {
    const redirectUrl = new URL("/dashboard", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // If user is not signed in and trying to access a protected page, redirect to login
  if (!session && !isAuthPage && request.nextUrl.pathname !== "/") {
    const redirectUrl = new URL("/auth/login", request.url)
    return NextResponse.redirect(redirectUrl)
  }

  // Check if the LINEAR_API_KEY environment variable is set
  const hasLinearApiKey = process.env.LINEAR_API_KEY !== undefined

  // Check if Azure OpenAI is configured
  const hasAzureOpenAI =
    process.env.AZURE_OPENAI_API_KEY !== undefined &&
    process.env.AZURE_OPENAI_API_ENDPOINT !== undefined &&
    process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME !== undefined

  // If accessing any page other than settings and the API key is not set,
  // redirect to the settings page with a warning
  if (
    session &&
    !hasLinearApiKey &&
    !request.nextUrl.pathname.startsWith("/settings") &&
    request.nextUrl.pathname !== "/"
  ) {
    const settingsUrl = new URL("/settings", request.url)
    settingsUrl.searchParams.set("setup", "linear")

    return NextResponse.redirect(settingsUrl)
  }

  // If Linear is configured but Azure OpenAI is not, suggest setting up Azure OpenAI
  if (
    session &&
    hasLinearApiKey &&
    !hasAzureOpenAI &&
    !request.nextUrl.pathname.startsWith("/settings") &&
    request.nextUrl.pathname !== "/"
  ) {
    // We'll just add a query param to suggest setting up Azure OpenAI
    // but we won't redirect, as the app can still function with OpenAI
    const url = new URL(request.url)
    url.searchParams.set("suggest-azure", "true")

    return NextResponse.rewrite(url)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    // Match all paths except for:
    // - API routes
    // - Static files
    // - _next (Next.js internals)
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
}
