"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { UnochatLogo } from "@/components/unochat-logo"
import { useTheme } from "next-themes"

export default function AuthCallbackPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const redirectTo = searchParams.get("redirectTo") || "/"

  useEffect(() => {
    // Check if user is authenticated after callback
    if (typeof window !== "undefined" && window.StackAuth) {
      const checkAuth = setInterval(() => {
        const user = window.StackAuth.currentUser
        if (user) {
          clearInterval(checkAuth)
          router.push(redirectTo)
        }
      }, 500)

      // Clear interval after 10 seconds to prevent infinite checking
      setTimeout(() => {
        clearInterval(checkAuth)
        router.push("/auth/login")
      }, 10000)

      return () => clearInterval(checkAuth)
    }
  }, [router, redirectTo])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-vercel-gray-100 dark:bg-black p-4">
      <div className="flex flex-col items-center justify-center gap-6">
        <UnochatLogo className="h-12 w-12" darkMode={isDarkMode} />
        <h1 className="text-2xl font-bold text-vercel-fg dark:text-white">Signing you in...</h1>
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    </div>
  )
}
