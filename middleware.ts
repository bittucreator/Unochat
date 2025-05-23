import { NextRequest, NextResponse } from "next/server"
import { executeQuery } from "@/lib/db"

export async function middleware(request: NextRequest) {
  const sessionToken = request.cookies.get("session")?.value
  if (!sessionToken) {
    // Not authenticated
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Validate session in database
  const result = await executeQuery(
    `SELECT users.id, users.name, users.email, users.picture FROM sessions
     JOIN users ON users.id = sessions.user_id
     WHERE sessions.session_token = $1 AND sessions.expires_at > NOW()`,
    [sessionToken]
  )

  if (!result.length) {
    // Invalid or expired session
    return NextResponse.redirect(new URL("/auth/login", request.url))
  }

  // Optionally, attach user info to request (for API routes)
  request.headers.set("x-user-id", result[0].id)
  request.headers.set("x-user-name", result[0].name)
  request.headers.set("x-user-email", result[0].email)
  request.headers.set("x-user-picture", result[0].picture)

  return NextResponse.next()
}

export const config = {
  matcher: [
    "/chat/:path*",
    "/api/chat/:path*",
    "/api/conversations/:path*",
    "/api/files/:path*",
    // Add more protected routes as needed
  ],
}
