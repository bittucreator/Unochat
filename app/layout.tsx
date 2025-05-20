import type React from "react"
import { Inter } from "next/font/google"
import "./globals.css"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import { initializeDatabase } from "@/lib/db-init"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "TooliQ - The Ultimate AI Chat Platform",
  description: "Access powerful AI models in one place with TooliQ",
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
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}
