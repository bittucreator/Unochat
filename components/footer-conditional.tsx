"use client"

import { usePathname } from "next/navigation"
import { Footer } from "@/components/footer"

export function FooterConditional() {
  const pathname = usePathname()

  // Don't show footer in app sections
  const appPaths = ["/dashboard", "/nextjs-generator", "/figma-converter", "/settings", "/billing", "/profile"]

  const isAppPath = appPaths.some((path) => pathname?.startsWith(path))

  if (!isAppPath) {
    return <Footer />
  }

  return null
}
