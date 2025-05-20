import { Sidebar } from "@/components/sidebar"
import { ChatInterface } from "@/components/chat-interface"

// Temporary user ID for demo purposes
const DEMO_USER_ID = "demo-user-123"

export default function ChatPage({ params }: { params: { id: string } }) {
  const conversationId = Number.parseInt(params.id)

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      <Sidebar userId={DEMO_USER_ID} currentConversationId={conversationId} />
      <ChatInterface userId={DEMO_USER_ID} initialConversationId={conversationId} />
    </div>
  )
}
