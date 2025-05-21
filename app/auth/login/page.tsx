"use client"

import { useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import Script from "next/script"
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
          <h1 className="text-2xl font-bold text-center text-vercel-fg dark:text-white mb-6">Log in to unochat</h1>

          <div className="space-y-6">
            <Script src="https://cdn.stackauth.net/auth.js" strategy="afterInteractive" />

            <div id="stack-auth-container" className="w-full">
              <button
                id="stack-auth-button"
                data-project-id={process.env.NEXT_PUBLIC_STACK_PROJECT_ID}
                data-redirect-url={`${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback?redirectTo=${redirectTo}`}
                data-provider="google"
                className="w-full flex items-center justify-center gap-3 py-2.5 px-4 border border-vercel-gray-200 dark:border-vercel-gray-700 rounded-md shadow-sm text-sm font-medium text-vercel-fg dark:text-white bg-white dark:bg-vercel-gray-900 hover:bg-vercel-gray-50 dark:hover:bg-vercel-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M17.64 9.20455C17.64 8.56636 17.5827 7.95273 17.4764 7.36364H9V10.845H13.8436C13.635 11.97 13.0009 12.9232 12.0477 13.5614V15.8195H14.9564C16.6582 14.2527 17.64 11.9455 17.64 9.20455Z"
                    fill="#4285F4"
                  />
                  <path
                    d="M9 18C11.43 18 13.4673 17.1941 14.9564 15.8195L12.0477 13.5614C11.2418 14.1014 10.2109 14.4205 9 14.4205C6.65591 14.4205 4.67182 12.8373 3.96409 10.71H0.957275V13.0418C2.43818 15.9832 5.48182 18 9 18Z"
                    fill="#34A853"
                  />
                  <path
                    d="M3.96409 10.71C3.78409 10.17 3.68182 9.59318 3.68182 9C3.68182 8.40682 3.78409 7.83 3.96409 7.29V4.95818H0.957273C0.347727 6.17318 0 7.54773 0 9C0 10.4523 0.347727 11.8268 0.957273 13.0418L3.96409 10.71Z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M9 3.57955C10.3214 3.57955 11.5077 4.03364 12.4405 4.92545L15.0218 2.34409C13.4632 0.891818 11.4259 0 9 0C5.48182 0 2.43818 2.01682 0.957275 4.95818L3.96409 7.29C4.67182 5.16273 6.65591 3.57955 9 3.57955Z"
                    fill="#EA4335"
                  />
                </svg>
                Continue with Google
              </button>
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
