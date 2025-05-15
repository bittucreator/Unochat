"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu"
import { ThemeToggle } from "@/components/theme-toggle"
import { useState } from "react"
import { Menu, X } from "lucide-react"

export function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="font-semibold text-xl">
            Tool<span className="text-primary">iQ</span>
          </Link>

          {/* Desktop Navigation */}
          <NavigationMenu className="hidden md:flex">
            <NavigationMenuList>
              <NavigationMenuItem>
                <NavigationMenuTrigger>Tools</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <div className="grid gap-3 p-4 w-[400px] md:w-[500px]">
                    <div className="grid grid-cols-2 gap-3">
                      <Link
                        href="/figma-converter"
                        className="group flex h-auto w-full flex-col justify-between rounded-md border p-4 hover:bg-muted"
                      >
                        <div className="mb-2 mt-2 text-lg font-medium">Figma Converter</div>
                        <div className="text-sm text-muted-foreground">Convert websites to Figma designs</div>
                      </Link>
                      <Link
                        href="/nextjs-generator"
                        className="group flex h-auto w-full flex-col justify-between rounded-md border p-4 hover:bg-muted"
                      >
                        <div className="mb-2 mt-2 text-lg font-medium">Next.js Generator</div>
                        <div className="text-sm text-muted-foreground">Generate Next.js code from websites</div>
                      </Link>
                    </div>
                  </div>
                </NavigationMenuContent>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/pricing" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Pricing</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
              <NavigationMenuItem>
                <Link href="/documentation" legacyBehavior passHref>
                  <NavigationMenuLink className={navigationMenuTriggerStyle()}>Documentation</NavigationMenuLink>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        <div className="flex items-center gap-2">
          <ThemeToggle />
          <Button asChild className="hidden md:inline-flex">
            <Link href="/login">Sign In</Link>
          </Button>

          {/* Mobile Menu Button */}
          <Button variant="ghost" size="icon" className="md:hidden" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            {isMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="container md:hidden py-4 border-t">
          <nav className="flex flex-col space-y-4">
            <Link
              href="/figma-converter"
              className="text-foreground hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Figma Converter
            </Link>
            <Link
              href="/nextjs-generator"
              className="text-foreground hover:text-primary"
              onClick={() => setIsMenuOpen(false)}
            >
              Next.js Generator
            </Link>
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
            <Link href="/login" className="text-foreground hover:text-primary" onClick={() => setIsMenuOpen(false)}>
              Sign In
            </Link>
          </nav>
        </div>
      )}
    </header>
  )
}
