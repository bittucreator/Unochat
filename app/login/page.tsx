"use client"

import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import { FcGoogle } from "react-icons/fc"
import { useRouter, useSearchParams } from "next/navigation"
import { useEffect } from "react"
import Link from "next/link"

export default function LoginPage() {
  const { signInWithGoogle, user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get("redirectTo") || "/dashboard"

  // If user is already logged in, redirect to dashboard or specified redirect
  useEffect(() => {
    if (user && !isLoading) {
      router.push(redirectTo)
    }
  }, [user, isLoading, router, redirectTo])

  const handleSignIn = async () => {
    try {
      await signInWithGoogle()
    } catch (error) {
      console.error("Failed to sign in:", error)
    }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center">
      <div className="max-w-md w-full mx-auto p-8">
        <div className="text-center mb-10">
          <h1 className="text-3xl font-bold mb-2">Welcome to TooliQ</h1>
          <p className="text-muted-foreground">Sign in to access your dashboard and tools</p>
        </div>

        <div className="space-y-4">
          <Button
            onClick={handleSignIn}
            className="w-full h-12 text-base flex items-center justify-center gap-3"
            disabled={isLoading}
          >
            <FcGoogle className="w-5 h-5" />
            Sign in with Google
          </Button>

          <div className="text-center mt-6">
            <p className="text-sm text-muted-foreground">
              By signing in, you agree to our{" "}
              <Link href="/terms" className="text-primary hover:underline">
                Terms of Service
              </Link>{" "}
              and{" "}
              <Link href="/privacy" className="text-primary hover:underline">
                Privacy Policy
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
