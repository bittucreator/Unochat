"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useAuth } from "@/components/auth-provider"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardShell } from "@/components/dashboard-shell"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { supabase } from "@/lib/supabase-client"
import { AlertCircle, CheckCircle2 } from "lucide-react"

export default function ProfilePage() {
  const { user } = useAuth()
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [avatarUrl, setAvatarUrl] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    if (user) {
      // Load user profile data
      const loadProfile = async () => {
        setIsLoading(true)
        try {
          const { data: profile, error } = await supabase
            .from("user_profiles")
            .select("*")
            .eq("user_id", user.id)
            .single()

          if (error) {
            console.error("Error loading profile:", error)
          } else if (profile) {
            setFullName(profile.full_name)
            setAvatarUrl(profile.avatar_url || "")
          }

          setEmail(user.email || "")
        } catch (err) {
          console.error("Error:", err)
        } finally {
          setIsLoading(false)
        }
      }

      loadProfile()
    }
  }, [user])

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setIsSaving(true)
    setError(null)
    setSuccess(false)

    try {
      // Update user metadata
      const { error: updateError } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      })

      if (updateError) {
        throw updateError
      }

      // Update profile in database
      const { error: profileError } = await supabase
        .from("user_profiles")
        .update({
          full_name: fullName,
          avatar_url: avatarUrl,
          updated_at: new Date().toISOString(),
        })
        .eq("user_id", user.id)

      if (profileError) {
        throw profileError
      }

      setSuccess(true)
    } catch (err: any) {
      console.error("Error updating profile:", err)
      setError(err.message || "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
  }

  const userInitials = getInitials(fullName || "User")

  return (
    <DashboardShell>
      <DashboardHeader heading="Profile" text="Manage your account settings and preferences." />

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your account profile information and email address.</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <div className="mb-4 flex items-center rounded-lg border border-destructive/50 bg-destructive/10 p-3 text-sm text-destructive">
                <AlertCircle className="mr-2 h-4 w-4" />
                {error}
              </div>
            )}

            {success && (
              <div className="mb-4 flex items-center rounded-lg border border-green-500/50 bg-green-500/10 p-3 text-sm text-green-500">
                <CheckCircle2 className="mr-2 h-4 w-4" />
                Profile updated successfully
              </div>
            )}

            <form onSubmit={handleUpdateProfile} className="space-y-6">
              <div className="flex flex-col space-y-4 md:flex-row md:space-x-4 md:space-y-0">
                <div className="flex items-center justify-center md:w-1/3">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={avatarUrl || "/placeholder.svg"} alt={fullName} />
                    <AvatarFallback className="text-lg">{userInitials}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="space-y-4 md:w-2/3">
                  <div className="space-y-2">
                    <Label htmlFor="name">Full Name</Label>
                    <Input
                      id="name"
                      value={fullName}
                      onChange={(e) => setFullName(e.target.value)}
                      disabled={isLoading}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" value={email} disabled />
                    <p className="text-xs text-muted-foreground">
                      Your email address is associated with your account and cannot be changed.
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="avatar">Avatar URL</Label>
                    <Input
                      id="avatar"
                      value={avatarUrl}
                      onChange={(e) => setAvatarUrl(e.target.value)}
                      placeholder="https://example.com/avatar.jpg"
                      disabled={isLoading}
                    />
                    <p className="text-xs text-muted-foreground">
                      Enter a URL for your profile picture. Leave empty to use your initials.
                    </p>
                  </div>
                </div>
              </div>
              <div className="flex justify-end">
                <Button type="submit" disabled={isSaving || isLoading}>
                  {isSaving ? "Saving..." : "Save changes"}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Password</CardTitle>
            <CardDescription>Change your password or enable two-factor authentication.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Password</Label>
              <div className="flex items-center justify-between rounded-md border p-3">
                <div className="text-sm">••••••••</div>
                <Button variant="outline" size="sm" asChild>
                  <a href="/auth/reset-password">Change password</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
