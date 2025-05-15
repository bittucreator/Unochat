import type React from "react"
import { AppHeader } from "./app-header"

export function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <AppHeader />
      <main className="flex-1 w-full max-w-full overflow-x-hidden">
        <div className="max-w-screen-2xl mx-auto px-4 py-6 w-full">{children}</div>
      </main>
    </div>
  )
}
