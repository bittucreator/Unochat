import type { User } from "@supabase/supabase-js"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { UserIcon } from "lucide-react"

interface DashboardHeaderProps {
  user: User
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  return (
    <Card className="mb-8">
      <CardHeader className="flex flex-row items-center gap-4 pb-2">
        <Avatar className="h-12 w-12">
          <AvatarImage
            src={user.user_metadata.avatar_url || "/placeholder.svg"}
            alt={user.user_metadata.full_name || user.email || ""}
          />
          <AvatarFallback>
            <UserIcon className="h-6 w-6" />
          </AvatarFallback>
        </Avatar>
        <div>
          <CardTitle>Welcome, {user.user_metadata.full_name || user.email?.split("@")[0]}</CardTitle>
          <CardDescription>{user.email}</CardDescription>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground">
          Manage your website conversions and view your history. You can convert websites to Figma designs or Next.js
          code.
        </p>
      </CardContent>
    </Card>
  )
}
