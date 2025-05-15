"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import type { Session, User } from "@supabase/supabase-js"
import { getSupabaseClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

type AuthContextType = {
  user: User | null
  session: Session | null
  isLoading: boolean
  signInWithGoogle: () => Promise<void>
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// Routes that don't require authentication
const publicRoutes = ["/", "/login", "/pricing", "/documentation", "/terms", "/privacy"]

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()
  const pathname = usePathname()
  const supabase = getSupabaseClient()
  const { toast } = useToast()

  // Function to check if current route is public
  const isPublicRoute = (path: string) => {
    return publicRoutes.some((route) => {
      if (route === "/") return path === "/"
      return path.startsWith(route)
    })
  }

  // Initialize auth state and set up listener
  useEffect(() => {
    const initializeAuth = async () => {
      setIsLoading(true)

      try {
        // Get initial session
        const {
          data: { session },
          error,
        } = await supabase.auth.getSession()

        if (error) {
          console.error("Error getting session:", error)
          throw error
        }

        setSession(session)
        setUser(session?.user || null)

        // If user is logged in and on a public route (except homepage), redirect to dashboard
        if (session?.user && pathname !== "/" && isPublicRoute(pathname)) {
          router.push("/dashboard")
        }

        // If user is not logged in and on a protected route, redirect to login
        if (!session?.user && !isPublicRoute(pathname)) {
          router.push(`/login?redirectTo=${encodeURIComponent(pathname)}`)
        }
      } catch (error) {
        console.error("Auth initialization error:", error)
        // Clear potentially corrupted session data
        supabase.auth.signOut().catch((e) => console.error("Error signing out:", e))
      } finally {
        setIsLoading(false)
      }
    }

    initializeAuth()

    // Set up auth state change listener
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event)

      setSession(session)
      setUser(session?.user || null)

      if (event === "SIGNED_IN") {
        // User just signed in, redirect to dashboard if on public route
        if (isPublicRoute(pathname)) {
          router.push("/dashboard")
        }
        toast({
          title: "Signed in successfully",
          description: `Welcome${session?.user?.user_metadata?.full_name ? `, ${session.user.user_metadata.full_name.split(" ")[0]}` : ""}!`,
        })
      } else if (event === "SIGNED_OUT") {
        // User just signed out, redirect to home
        router.push("/")
        toast({
          title: "Signed out successfully",
          description: "You have been signed out of your account.",
        })
      } else if (event === "TOKEN_REFRESHED") {
        console.log("Token refreshed successfully")
      } else if (event === "USER_UPDATED") {
        console.log("User updated")
      }

      router.refresh()
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router, pathname, toast])

  const signInWithGoogle = async () => {
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=/dashboard`,
          queryParams: {
            access_type: "offline",
            prompt: "consent",
          },
        },
      })

      if (error) {
        throw error
      }
    } catch (error) {
      console.error("Error signing in with Google:", error)
      toast({
        variant: "destructive",
        title: "Authentication Error",
        description: "Failed to sign in with Google. Please try again.",
      })
      throw error
    }
  }

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()

      if (error) {
        throw error
      }
    } catch (error) {
      console.error("Error signing out:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      })
      throw error
    }
  }

  const value = {
    user,
    session,
    isLoading,
    signInWithGoogle,
    signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export const useAuth = () => {
  const context = useContext(AuthContext)

  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }

  return context
}
