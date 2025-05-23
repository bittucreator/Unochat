"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { UnochatLogo } from "@/components/unochat-logo"
import { useTheme } from "next-themes"
import { ArrowLeft } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const redirectTo = searchParams.get("redirectTo") || "/"

  useEffect(() => {
    // Redirect to the desired page after login
    const handleLogin = () => {
      router.push(redirectTo)
    }

    handleLogin()
  }, [router, redirectTo])

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-vercel-gray-100 dark:bg-black p-4">
      <div className="w-full max-w-md">
        <div className="mb-8 flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center text-sm text-vercel-gray-600 dark:text-vercel-gray-400 hover:text-vercel-gray-900 dark:hover:text-white transition-colors"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Link>
          <div className="flex items-center">
            <UnochatLogo className="mr-2" darkMode={isDarkMode} />
            <span className="text-lg font-semibold text-vercel-fg dark:text-white">unochat</span>
          </div>
        </div>

        <div className="bg-white dark:bg-vercel-gray-900 rounded-lg shadow-sm border border-vercel-gray-200 dark:border-vercel-gray-800 p-8">
          <h1 className="text-2xl font-bold text-center text-vercel-fg dark:text-white mb-6">Log in to unochat</h1>

          <div className="space-y-6">
            {/* Google Auth button will be added here */}
            <div className="w-full flex flex-col items-center gap-4">
              <a
                href="/api/auth/google"
                className="inline-flex items-center px-4 py-2 bg-white border border-gray-300 rounded shadow hover:bg-gray-100 text-gray-800 font-medium transition"
              >
                <svg width="20" height="20" viewBox="0 0 48 48" className="mr-2">
                  <g>
                    <path
                      fill="#4285F4"
                      d="M44.5 20H24v8.5h11.7C34.7 33.1 29.8 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.3 5.1 29.4 3 24 3 12.4 3 3 12.4 3 24s9.4 21 21 21c10.5 0 20-7.5 20-21 0-1.3-.1-2.7-.5-4z"
                    />
                    <path
                      fill="#34A853"
                      d="M6.3 14.7l7 5.1C15.5 17.1 19.4 14 24 14c2.7 0 5.2.9 7.2 2.4l6.4-6.4C34.3 5.1 29.4 3 24 3 15.1 3 7.6 8.7 6.3 14.7z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M24 45c5.8 0 10.7-1.9 14.3-5.1l-6.6-5.4C29.7 36.1 27 37 24 37c-5.7 0-10.5-3.7-12.2-8.8l-7 5.4C7.6 39.3 15.1 45 24 45z"
                    />
                    <path
                      fill="#EA4335"
                      d="M44.5 20H24v8.5h11.7c-1.1 3.1-4.2 5.5-7.7 5.5-4.5 0-8.2-3.7-8.2-8.2s3.7-8.2 8.2-8.2c2.1 0 4 .8 5.5 2.1l6.4-6.4C34.3 5.1 29.4 3 24 3c-6.6 0-12 5.4-12 12s5.4 12 12 12c5.8 0 10.7-1.9 14.3-5.1l-6.6-5.4C29.7 36.1 27 37 24 37c-5.7 0-10.5-3.7-12.2-8.8l-7 5.4C7.6 39.3 15.1 45 24 45z"
                    />
                  </g>
                </svg>
                Sign in with Google
              </a>
            </div>

            <div className="text-center text-sm text-vercel-gray-500 dark:text-vercel-gray-400">
              By continuing, you agree to unochat's{" "}
              <Link href="/terms" className="text-primary hover:text-primary/90">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:text-primary/90">
                Privacy Policy
              </Link>
              .
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
