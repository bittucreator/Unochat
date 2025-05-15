"use client"

import type React from "react"

import type { User } from "@supabase/supabase-js"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { getSupabaseClient } from "@/lib/supabase/client"
import type { Tables } from "@/lib/supabase/database.types"
import { Loader2, Upload } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

interface ProfileSettingsProps {
  user: User
  userMetadata: Tables<"users_metadata"> | null
}

export function ProfileSettings({ user, userMetadata }: ProfileSettingsProps) {
  const [fullName, setFullName] = useState(userMetadata?.full_name || user.user_metadata.full_name || "")
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const supabase = getSupabaseClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      // Update user metadata in Supabase Auth
      const { error: authError } = await supabase.auth.updateUser({
        data: {
          full_name: fullName,
        },
      })

      if (authError) {
        throw new Error(authError.message)
      }

      // Update user metadata in our custom table
      const { error: dbError } = await supabase.from("users_metadata").upsert({
        id: user.id,
        full_name: fullName,
        updated_at: new Date().toISOString(),
      })

      if (dbError) {
        throw new Error(dbError.message)
      }

      toast({
        title: "Profile updated",
        description: "Your profile has been updated successfully.",
      })
    } catch (error) {
      console.error("Error updating profile:", error)
      toast({
        variant: "destructive",
        title: "Error",
        description: (error as Error).message || "Failed to update profile. Please try again.",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-2xl font-bold mb-6">Profile Information</h2>
        <p className="text-muted-foreground mb-6">
          Update your profile information and how others see you on the platform.
        </p>
      </div>

      <div className="flex items-center gap-6">
        <Avatar className="h-24 w-24">
          <AvatarImage
            src={user.user_metadata.avatar_url || "/placeholder.svg"}
            alt={user.user_metadata.full_name || user.email || ""}
          />
          <AvatarFallback className="text-2xl">
            {fullName
              .split(" ")
              .map((name) => name[0])
              .join("")
              .toUpperCase() || user.email?.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
        <div>
          <h3 className="font-medium mb-2">Profile Photo</h3>
          <p className="text-sm text-muted-foreground mb-3">
            This will be displayed on your profile and in your conversions.
          </p>
          <Button variant="outline" size="sm" className="amie-button">
            <Upload className="h-4 w-4 mr-2" />
            Change Photo
          </Button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" value={user.email || ""} disabled className="bg-muted/50" />
          <p className="text-sm text-muted-foreground">Your email address cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Your full name"
            className="amie-button"
          />
        </div>

        <Button type="submit" disabled={isLoading} className="amie-button">
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save Changes"
          )}
        </Button>
      </form>
    </div>
  )
}
