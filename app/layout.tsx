import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { initializeDatabase } from "@/lib/db-init"
import { StackAuthProvider } from "@/components/stack-auth-provider"

export const metadata = {
  title: "unochat - The Ultimate AI Chat Platform",
  description: "Access powerful AI models in one place with unochat",
    generator: 'v0.dev'
}

// Initialize database on server startup
initializeDatabase()
  .then((result) => {
    if (result.success) {
      console.log("Database initialization completed")
    } else {
      console.error("Database initialization failed:", result.error)
    }
  })
  .catch((error) => {
    console.error("Unexpected error during database initialization:", error)
  })

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <body className={GeistSans.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          <StackAuthProvider>{children}</StackAuthProvider>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
