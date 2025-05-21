"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Script from "next/script"

type User = {
  id: string
  email: string
  name?: string
  picture?: string
}

type AuthContextType = {
  user: User | null
  isLoading: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: () => {},
  logout: () => {},
})

export const useAuth = () => useContext(AuthContext)

export function StackAuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Check if Stack Auth is loaded
    if (typeof window !== "undefined" && window.StackAuth) {
      // Initialize Stack Auth
      const stackAuth = window.StackAuth

      // Set up auth state change listener
      stackAuth.onAuthStateChanged((user: any) => {
        if (user) {
          setUser({
            id: user.id,
            email: user.email,
            name: user.name,
            picture: user.picture,
          })
        } else {
          setUser(null)
        }
        setIsLoading(false)
      })
    } else {
      // Stack Auth not loaded yet
      const checkStackAuth = setInterval(() => {
        if (typeof window !== "undefined" && window.StackAuth) {
          clearInterval(checkStackAuth)

          // Initialize Stack Auth
          const stackAuth = window.StackAuth

          // Set up auth state change listener
          stackAuth.onAuthStateChanged((user: any) => {
            if (user) {
              setUser({
                id: user.id,
                email: user.email,
                name: user.name,
                picture: user.picture,
              })
            } else {
              setUser(null)
            }
            setIsLoading(false)
          })
        }
      }, 100)

      return () => clearInterval(checkStackAuth)
    }
  }, [])

  const login = () => {
    router.push("/auth/login")
  }

  const logout = () => {
    if (typeof window !== "undefined" && window.StackAuth) {
      window.StackAuth.signOut().then(() => {
        router.push("/")
      })
    }
  }

  return (
    <>
      <Script src="https://cdn.stackauth.net/auth.js" strategy="afterInteractive" />
      <AuthContext.Provider value={{ user, isLoading, login, logout }}>{children}</AuthContext.Provider>
    </>
  )
}
