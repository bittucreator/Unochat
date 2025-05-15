"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"
import { Menu, X, User, Settings, CreditCard } from "lucide-react"
import { useAuth } from "./auth/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SearchButton } from "./search/search-button"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user, signOut, isLoading } = useAuth()

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-screen-2xl mx-auto px-4 flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-xl">
            Tool<span className="text-primary">iQ</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <Link
              href="/pricing"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="/documentation"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              Documentation
            </Link>
            {!user && (
              <Link
                href="/login"
                className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Login
              </Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-2">
          <SearchButton />
          <ThemeToggle />

          {!isLoading && (
            <>
              {user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-full">
                      <Avatar className="h-8 w-8">
                        <AvatarImage
                          src={user.user_metadata.avatar_url || "/placeholder.svg"}
                          alt={user.user_metadata.full_name || user.email || ""}
                        />
                        <AvatarFallback>
                          <User className="h-4 w-4" />
                        </AvatarFallback>
                      </Avatar>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>My Account</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard" className="flex items-center">
                        <User className="mr-2 h-4 w-4" />
                        Dashboard
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/settings" className="flex items-center">
                        <Settings className="mr-2 h-4 w-4" />
                        Settings
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuItem asChild>
                      <Link href="/billing" className="flex items-center">
                        <CreditCard className="mr-2 h-4 w-4" />
                        Billing
                      </Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={() => signOut()}>Log out</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button asChild className="hidden md:inline-flex rounded-full">
                  <Link href="/login">Sign In</Link>
                </Button>
              )}
            </>
          )}

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="max-w-screen-2xl mx-auto px-4 md:hidden py-4 border-t">
          <nav className="flex flex-col space-y-4">
            <Link href="/pricing" className="text-foreground hover:text-primary" onClick={() => setIsMenuOpen(false)}>
              Pricing
            </Link>
            <Link
              href="/documentation"
              className="text-foreground hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Documentation
            </Link>
            {user ? (
              <>
                <Link
                  href="/dashboard"
                  className="text-foreground hover:text-primary"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Dashboard
                </Link>
                <button
                  className="text-foreground hover:text-primary text-left"
                  onClick={() => {
                    signOut()
                    setIsMenuOpen(false)
                  }}
                >
                  Log out
                </button>
              </>
            ) : (
              <Link href="/login" className="text-foreground hover:text-primary" onClick={() => setIsMenuOpen(false)}>
                Sign In
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  )
}
