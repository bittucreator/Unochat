import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"

export default function Home() {
  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar />
      <ChatInterface />
    </div>
  )
}
