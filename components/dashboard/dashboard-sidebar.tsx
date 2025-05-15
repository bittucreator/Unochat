"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Code, CreditCard, History, LayoutDashboard, LogOut, Settings, User, Search } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarSeparator,
} from "@/components/ui/sidebar"
import { useSearch } from "@/components/search/search-provider"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { user, signOut } = useAuth()
  const { openSearch } = useSearch()

  const isActive = (path: string) => {
    if (path === "/dashboard" && pathname === "/dashboard") {
      return true
    }
    return pathname !== "/dashboard" && pathname.startsWith(path)
  }

  return (
    <Sidebar variant="floating" collapsible="icon">
      <SidebarHeader className="p-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">TQ</span>
          </div>
          <span className="font-semibold text-xl">
            Tool<span className="text-primary">iQ</span>
          </span>
        </Link>
      </SidebarHeader>

      <SidebarContent>
        {user && (
          <div className="px-4 py-2">
            <div className="flex items-center gap-3 mb-1">
              <Avatar className="h-10 w-10">
                <AvatarImage
                  src={user.user_metadata.avatar_url || "/placeholder.svg"}
                  alt={user.user_metadata.full_name || user.email || ""}
                />
                <AvatarFallback>
                  <User className="h-4 w-4" />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-medium text-sm">{user.user_metadata.full_name || user.email?.split("@")[0]}</span>
                <span className="text-xs text-muted-foreground">{user.email}</span>
              </div>
            </div>
          </div>
        )}

        <SidebarSeparator />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={openSearch} tooltip="Search">
              <Search className="h-5 w-5" />
              <span>Search</span>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={pathname === "/dashboard"} tooltip="Dashboard">
              <Link href="/dashboard">
                <LayoutDashboard className="h-5 w-5" />
                <span>Dashboard</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/nextjs-generator")} tooltip="Next.js Generator">
              <Link href="/nextjs-generator">
                <Code className="h-5 w-5" />
                <span>Next.js Generator</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/dashboard/history")} tooltip="History">
              <Link href="/dashboard/history">
                <History className="h-5 w-5" />
                <span>History</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarSeparator />

        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/settings")} tooltip="Settings">
              <Link href="/settings">
                <Settings className="h-5 w-5" />
                <span>Settings</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>

          <SidebarMenuItem>
            <SidebarMenuButton asChild isActive={isActive("/billing")} tooltip="Billing">
              <Link href="/billing">
                <CreditCard className="h-5 w-5" />
                <span>Billing</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton onClick={() => signOut()} tooltip="Log Out">
              <LogOut className="h-5 w-5" />
              <span>Log Out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
