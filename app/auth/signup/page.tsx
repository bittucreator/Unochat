"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Script from "next/script"
import { UnochatLogo } from "@/components/unochat-logo"
import { useTheme } from "next-themes"
import { ArrowLeft } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const { theme } = useTheme()
  const isDarkMode = theme === "dark"
  const redirectTo = searchParams.get("redirectTo") || "/"

  useEffect(() => {
    // Check if user is already authenticated
    if (typeof window !== "undefined" && window.StackAuth) {
      const unsubscribe = window.StackAuth.onAuthStateChanged((user: any) => {
        if (user) {
          // User is signed in, redirect
          router.push(redirectTo)
        }
      })

      return () => unsubscribe()
    }
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
          <h1 className="text-2xl font-bold text-center text-vercel-fg dark:text-white mb-6">Create your account</h1>

          <div className="space-y-4">
            <Script src="https://cdn.stackauth.net/auth.js" strategy="afterInteractive" />

            <div id="stack-auth-container" className="w-full">
              <button
                id="stack-auth-button"
                data-project-id={process.env.NEXT_PUBLIC_STACK_PROJECT_ID}
                data-redirect-url={`${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?redirectTo=${redirectTo}`}
                data-mode="signup"
                className="w-full py-2 px-4 border border-vercel-gray-200 dark:border-vercel-gray-700 rounded-md shadow-sm text-sm font-medium text-vercel-fg dark:text-white bg-white dark:bg-vercel-gray-900 hover:bg-vercel-gray-50 dark:hover:bg-vercel-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
              >
                Continue with Email
              </button>
            </div>

            <div className="text-center text-sm text-vercel-gray-500 dark:text-vercel-gray-400">
              Already have an account?{" "}
              <Link
                href={`/auth/login${redirectTo !== "/" ? `?redirectTo=${redirectTo}` : ""}`}
                className="font-medium text-primary hover:text-primary/90"
              >
                Log in
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
