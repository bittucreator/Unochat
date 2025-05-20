import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"

// Temporary user ID for demo purposes
const DEMO_USER_ID = "demo-user-123"

export default function Home() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userId={DEMO_USER_ID} />
      <ChatInterface userId={DEMO_USER_ID} />
    </div>
  )
}
