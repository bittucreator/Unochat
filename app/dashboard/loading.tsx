import { Loader2 } from "lucide-react"

export default function DashboardLoading() {
  return (
    <div className="container flex h-[calc(100vh-4rem)] items-center justify-center">
      <div className="text-center">
        <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4" />
        <p>Loading your dashboard...</p>
      </div>
    </div>
  )
}
