"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { UnochatLogo } from "@/components/unochat-logo"
import { useTheme } from "next-themes"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const redirectTo = searchParams.get("redirectTo") || "/"
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // Check if user is authenticated after redirect
    if (typeof window !== "undefined" && window.StackAuth) {
      const checkAuth = setTimeout(() => {
        window.StackAuth.getUser()
          .then((user: any) => {
            if (user) {
              // User is signed in, redirect
              router.push(redirectTo)
            } else {
              // No user, something went wrong
              setError("Authentication failed. Please try again.")
            }
          })
          .catch((err: any) => {
            console.error("Auth error:", err)
            setError("Authentication error. Please try again.")
          })
      }, 1000) // Give Stack Auth time to process the auth

      return () => clearTimeout(checkAuth)
    }
  }, [router, redirectTo])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-vercel-gray-100 dark:bg-black p-4">
      <div className="text-center">
        <div className="flex justify-center mb-6">
          <UnochatLogo className="h-12 w-12" darkMode={isDarkMode} />
        </div>

        {error ? (
          <div>
            <h1 className="text-xl font-semibold text-vercel-fg dark:text-white mb-2">Authentication Error</h1>
            <p className="text-vercel-gray-600 dark:text-vercel-gray-400 mb-4">{error}</p>
            <button onClick={() => router.push("/auth/login")} className="text-primary hover:text-primary/90">
              Try Again
            </button>
          </div>
        ) : (
          <div>
            <h1 className="text-xl font-semibold text-vercel-fg dark:text-white mb-2">Completing authentication...</h1>
            <div className="flex justify-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
