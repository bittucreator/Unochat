import type React from "react"

export default function HistoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <div className="max-w-full overflow-x-hidden">{children}</div>
}
