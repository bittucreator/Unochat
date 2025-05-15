"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth/auth-provider"
import { Code, CreditCard, Figma, History, Home, LogOut, PanelLeft, Settings, User } from "lucide-react"
import { cn } from "@/lib/utils"
import type { User as SupabaseUser } from "@supabase/supabase-js"

interface DashboardSidebarProps {
  user: SupabaseUser
}

export function DashboardSidebar({ user }: DashboardSidebarProps) {
  const [collapsed, setCollapsed] = useState(false)
  const pathname = usePathname()
  const { signOut } = useAuth()

  const firstName = user.user_metadata.full_name
    ? user.user_metadata.full_name.split(" ")[0]
    : user.email?.split("@")[0] || ""

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true
    }
    return pathname.startsWith(path) && path !== "/dashboard"
  }

  return (
    <div
      className={cn(
        "flex flex-col h-full border-r bg-background transition-all duration-300",
        collapsed ? "w-[70px]" : "w-[240px]",
      )}
    >
      {/* User Profile */}
      <div className="p-4 border-b">
        <div className="flex items-center space-x-3">
          <Avatar className="h-9 w-9">
            <AvatarImage
              src={user.user_metadata.avatar_url || "/placeholder.svg"}
              alt={user.user_metadata.full_name || user.email || ""}
            />
            <AvatarFallback>
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div className="flex-1 overflow-hidden">
              <p className="font-medium text-sm truncate">{user.user_metadata.full_name || user.email}</p>
              <p className="text-xs text-muted-foreground truncate">{user.email}</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex-1 overflow-auto py-4 px-3">
        <div className="space-y-1">
          <Button
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start font-normal h-11",
              isActive("/dashboard") ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-accent",
              collapsed && "justify-center px-0",
            )}
          >
            <Link href="/dashboard">
              <Home className="h-5 w-5 mr-3 shrink-0" />
              {!collapsed && "Dashboard"}
            </Link>
          </Button>

          <Button
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start font-normal h-11",
              isActive("/figma-converter") ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-accent",
              collapsed && "justify-center px-0",
            )}
          >
            <Link href="/figma-converter">
              <Figma className="h-5 w-5 mr-3 shrink-0" />
              {!collapsed && "Figma Converter"}
            </Link>
          </Button>

          <Button
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start font-normal h-11",
              isActive("/nextjs-generator") ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-accent",
              collapsed && "justify-center px-0",
            )}
          >
            <Link href="/nextjs-generator">
              <Code className="h-5 w-5 mr-3 shrink-0" />
              {!collapsed && "Next.js Generator"}
            </Link>
          </Button>

          <Button
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start font-normal h-11",
              isActive("/dashboard/history") ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-accent",
              collapsed && "justify-center px-0",
            )}
          >
            <Link href="/dashboard/history">
              <History className="h-5 w-5 mr-3 shrink-0" />
              {!collapsed && "History"}
            </Link>
          </Button>
        </div>

        <div className="mt-6 pt-6 border-t space-y-1">
          <Button
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start font-normal h-11",
              isActive("/settings") ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-accent",
              collapsed && "justify-center px-0",
            )}
          >
            <Link href="/settings">
              <Settings className="h-5 w-5 mr-3 shrink-0" />
              {!collapsed && "Settings"}
            </Link>
          </Button>

          <Button
            variant="ghost"
            asChild
            className={cn(
              "w-full justify-start font-normal h-11",
              isActive("/billing") ? "bg-primary/10 text-primary hover:bg-primary/20" : "hover:bg-accent",
              collapsed && "justify-center px-0",
            )}
          >
            <Link href="/billing">
              <CreditCard className="h-5 w-5 mr-3 shrink-0" />
              {!collapsed && "Billing"}
            </Link>
          </Button>
        </div>
      </div>

      {/* Footer */}
      <div className="p-3 border-t">
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="sm"
            className={cn("px-2", collapsed && "w-full justify-center")}
            onClick={() => setCollapsed(!collapsed)}
          >
            <PanelLeft className="h-5 w-5" />
            {!collapsed && <span className="ml-2">Collapse</span>}
          </Button>

          {!collapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="px-2 text-muted-foreground hover:text-foreground"
              onClick={() => signOut()}
            >
              <LogOut className="h-5 w-5 mr-2" />
              Sign out
            </Button>
          )}

          {collapsed && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full justify-center text-muted-foreground hover:text-foreground"
              onClick={() => signOut()}
            >
              <LogOut className="h-5 w-5" />
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
