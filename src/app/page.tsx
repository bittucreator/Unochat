"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Pencil, Trash2, RefreshCw, ExternalLink, Edit2, BadgeCheck, UserCircle, Copy, Settings } from 'lucide-react';
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import Image from 'next/image';

// Add generic SVGs for Notion/Linear badges (move to top)
const NotionIcon = () => (
  <svg aria-hidden="true" style={{ width: 18, height: 18, display: 'block', fill: '#32302c', flexShrink: 0 }} viewBox="0 0 120 126"><path d="M20.693 21.932c3.89 3.16 5.35 2.92 12.656 2.432l68.879-4.136c1.461 0 .246-1.458-.241-1.7l-11.44-8.27c-2.191-1.701-5.111-3.65-10.708-3.162L13.143 11.96c-2.432.241-2.918 1.457-1.95 2.432zm4.135 16.052v72.472c0 3.895 1.947 5.352 6.327 5.111l75.698-4.38c4.383-.241 4.871-2.92 4.871-6.084V33.117c0-3.159-1.215-4.863-3.898-4.62l-79.105 4.62c-2.92.245-3.893 1.706-3.893 4.867m74.729 3.887c.485 2.191 0 4.38-2.195 4.626l-3.648.727v53.504c-3.166 1.702-6.087 2.675-8.52 2.675-3.896 0-4.871-1.217-7.79-4.863L53.547 61.087v36.237l7.55 1.704s0 4.375-6.091 4.375l-16.791.974c-.488-.974 0-3.404 1.703-3.891l4.382-1.214V51.36l-6.084-.487c-.488-2.191.727-5.35 4.137-5.596l18.013-1.214 24.828 37.94V48.44l-6.33-.726c-.486-2.679 1.459-4.624 3.893-4.865zM7.543 5.394 76.918.285c8.519-.73 10.71-.241 16.065 3.649l22.145 15.564c3.654 2.677 4.872 3.405 4.872 6.323v85.366c0 5.35-1.949 8.514-8.763 8.998l-80.564 4.865c-5.115.244-7.549-.485-10.228-3.892L4.137 99.999C1.215 96.105 0 93.191 0 89.782V13.903c0-4.375 1.95-8.025 7.543-8.509"/></svg>
);
const LinearIcon = () => (
  <svg width="20" height="20" fill="currentColor" aria-label="Linear" color="currentColor" viewBox="0 0 100 100"><path d="M1.225 61.523c-.222-.949.908-1.546 1.597-.857l36.512 36.512c.69.69.092 1.82-.857 1.597-18.425-4.323-32.93-18.827-37.252-37.252M.002 46.889a1 1 0 0 0 .29.76L52.35 99.71c.201.2.478.307.76.29 2.37-.149 4.695-.46 6.963-.927.765-.157 1.03-1.096.478-1.648L2.576 39.448c-.552-.551-1.491-.286-1.648.479a50 50 0 0 0-.926 6.962M4.21 29.705a.99.99 0 0 0 .208 1.1l64.776 64.776c.289.29.726.375 1.1.208a50 50 0 0 0 5.185-2.684.98.98 0 0 0 .183-1.54L8.436 24.336a.98.98 0 0 0-1.541.183 50 50 0 0 0-2.684 5.185m8.448-11.631a.986.986 0 0 1-.045-1.354C21.78 6.46 35.111 0 49.952 0 77.592 0 100 22.407 100 50.048c0 14.84-6.46 28.172-16.72 37.338a.986.986 0 0 1-1.354-.045z"/></svg>
);

// --- Types ---
interface ChatItem {
  id: string;
  title: string;
}
type MessageItem = { role: 'user' | 'assistant'; content: string; createdAt?: string };

type CreatedItem = {
  id: string;
  type: 'notion' | 'linear';
  url: string;
  title: string;
  content: string;
  createdAt: string;
  chatId: string;
};

// Integration-specific templates (fix icon usage)
const integrationTemplates: Record<string, { label: string; value: string; icon: React.ReactNode }[]> = {
  notion: [
    { label: 'Create a Notion meeting note', value: 'Create a Notion meeting note for our last team sync.', icon: <NotionIcon /> },
    { label: 'Create a Notion project plan', value: 'Draft a Notion project plan for the new feature.', icon: <NotionIcon /> },
  ],
  linear: [
    { label: 'Create a Linear bug report', value: 'Create a Linear bug report: The app crashes on login.', icon: <LinearIcon /> },
    { label: 'Create a Linear feature request', value: 'Create a Linear feature request: Add dark mode support.', icon: <LinearIcon /> },
  ],
};

// Place IntegrationStatus type at the top
interface IntegrationStatus {
  key: string;
  connected: boolean;
  database_id?: string;
}

const Home = () => {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [conversations, setConversations] = useState<ChatItem[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const { data: session, status } = useSession();
  const inputRef = useRef<HTMLInputElement>(null);

  // Add state for Notion sending
  const [notionLoading, setNotionLoading] = useState(false);

  // --- Integrations Dropdown State ---
  const [integrationsList, setIntegrationsList] = useState<{ key: string; name: string }[]>([]);
  const [selectedIntegration, setSelectedIntegration] = useState<string>("notion");
  const [notionConnected, setNotionConnected] = useState(false);
  const [linearConnected, setLinearConnected] = useState(false);
  const [linearLoading, setLinearLoading] = useState(false);
  const historyButtonRef = useRef<HTMLButtonElement>(null);
  const editModalRef = useRef<HTMLDivElement>(null);
  const historyModalRef = useRef<HTMLDivElement>(null);

  // Add state for created items and toasts
  const [showHistory, setShowHistory] = useState(false);
  const [createdItems, setCreatedItems] = useState<CreatedItem[]>([]);
  const [editItem, setEditItem] = useState<CreatedItem | null>(null);
  const [editContent, setEditContent] = useState('');
  const [editLoading, setEditLoading] = useState(false);
  const [statusToast, setStatusToast] = useState<null | { type: 'notion' | 'linear'; url: string; title: string }>(null);
  const [statusToastCopied, setStatusToastCopied] = useState(false);

  // --- Integration badge logic: only show badge for the message that created the item ---
  function getCreatedItemForMessage(msg: MessageItem) {
    return createdItems.find((ci: CreatedItem) => ci.chatId === (selectedConversationId || '') && (msg.content.includes(ci.url) || msg.content === ci.content));
  }

  // Only load conversations if authenticated
  useEffect(() => {
    if (session && session.user) {
      fetch("/api/chats")
        .then((res) => {
          if (!res.ok) return [];
          return res.json().catch(() => []);
        })
        .then((data) => setConversations(data));
    }
  }, [session]);

  // Fetch connected integrations for dropdown
  useEffect(() => {
    if (!session || !session.user) return;
    fetch("/api/integrations/status")
      .then(async (res) => {
        if (!res.ok) return [];
        try {
          return await res.json();
        } catch {
          return [];
        }
      })
      .then((data: IntegrationStatus[]) => {
        if (data && Array.isArray(data)) {
          setIntegrationsList(
            data.filter((d) => d.connected).map((d) => ({ key: d.key, name: d.key.charAt(0).toUpperCase() + d.key.slice(1) }))
          );
          setNotionConnected(!!data.find((d) => d.key === 'notion' && d.connected));
          setLinearConnected(!!data.find((d) => d.key === 'linear' && d.connected));
          // Default to first connected integration
          if (data.filter((d) => d.connected).length > 0) {
            setSelectedIntegration(data.filter((d) => d.connected)[0].key);
          }
        }
      });
  }, [session]);

  function handleSelectConversation(id: string) {
    setSelectedConversationId(id);
    if (session && session.user) {
      fetch(`/api/messages?chatId=${id}`)
        .then(res => res.json())
        .then(data => setMessages((data || []).map((m: { role: 'user' | 'assistant'; content: string; createdat?: string }) => ({ role: m.role, content: m.content, createdAt: m.createdat }))));
    }
  }

  function handleNewConversation() {
    setMessages([]);
    setSelectedConversationId(null);
  }

  async function handleDeleteConversation(id: string) {
    if (!session || !session.user) return;
    await fetch("/api/chats", {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });
    setConversations((prev) => prev.filter((c) => c.id !== id));
    if (selectedConversationId === id) {
      setMessages([]);
      setSelectedConversationId(null);
    }
  }

  async function handleRenameConversation(id: string) {
    if (!session || !session.user) return;
    await fetch("/api/chats", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, title: renameValue }),
    });
    setConversations((prev) => prev.map((c) => c.id === id ? { ...c, title: renameValue } : c));
    setRenamingId(null);
    setRenameValue("");
  }

  async function handleSend() {
    if (!input.trim() || !session || !session.user) return;
    setLoading(true);
    let chatId = selectedConversationId;
    // If no chat selected, create a new chat first
    if (!chatId) {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: input.slice(0, 24) || "New Conversation" }),
      });
      if (!res.ok) {
        setLoading(false);
        return;
      }
      const chat = await res.json();
      chatId = chat.id;
      setConversations((prev) => [chat, ...prev]);
      setSelectedConversationId(chatId);
    }
    // Add user message
    const userMsg = { chatId, userId: session.user.email, role: 'user', content: input };
    await fetch('/api/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userMsg),
    });
    // Call AI
    let allMsgs: MessageItem[] = [];
    try {
      const allMsgsRes = await fetch(`/api/messages?chatId=${chatId}`);
      if (allMsgsRes.ok) {
        const text = await allMsgsRes.text();
        allMsgs = text ? (JSON.parse(text) as MessageItem[]) : [];
      } else {
        allMsgs = [];
      }
    } catch {
      allMsgs = [];
    }
    setMessages((allMsgs || []).map((m) => ({ role: m.role, content: m.content, createdAt: m.createdAt })));
    setInput("");
    try {
      // Add timeout for AI response
      const aiPromise = fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...allMsgs, { role: 'user', content: input }], selectedIntegration }),
      }).then((res) => res.json());
      const timeoutPromise = new Promise((_, reject) =>
        setTimeout(() => reject(new Error("AI response timed out. Please try again.")), 20000)
      );
      const data = await Promise.race([aiPromise, timeoutPromise]);
      if (data.result) {
        // Save assistant message
        const cleaned = cleanAIResponse(data.result);
        let extraContent = null;
        let badgeType: 'notion' | 'linear' | null = null;
        let badgeUrl: string | null = null;
        let badgeLabel: string | null = null;
        if (selectedIntegration === 'notion' && data.notionPageCreated && data.notionPageUrl) {
          extraContent = `\n\n[View created Notion page](${data.notionPageUrl})`;
          badgeType = 'notion';
          badgeUrl = data.notionPageUrl;
          badgeLabel = 'Notion Page';
        } else if (selectedIntegration === 'linear' && data.linearIssueCreated && data.linearIssueUrl) {
          extraContent = `\n\n[View created Linear issue](${data.linearIssueUrl})`;
          badgeType = 'linear';
          badgeUrl = data.linearIssueUrl;
          badgeLabel = 'Linear Issue';
        }
        const agentMsg = { chatId, role: 'assistant', content: cleaned + (extraContent || "") };
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(agentMsg),
        });
        // Reload messages
        const updatedMsgsRes = await fetch(`/api/messages?chatId=${chatId}`);
        let updatedMsgs: MessageItem[] = await updatedMsgsRes.json();
        if (!Array.isArray(updatedMsgs)) updatedMsgs = [];
        setMessages((updatedMsgs || []).map((m) => ({ role: m.role, content: m.content, createdAt: m.createdAt })));
        // Show toast and add to history if created
        if (badgeType && badgeUrl) {
          setStatusToast({ type: badgeType, url: badgeUrl, title: badgeLabel! });
          setCreatedItems(prev => [{
            id: `${badgeType}-${Date.now()}`,
            type: badgeType as 'notion' | 'linear',
            url: badgeUrl!,
            title: badgeLabel || '',
            content: '',
            createdAt: new Date().toISOString(),
            chatId: chatId || '',
          }, ...prev]);
        }
      }
    } catch {
      // Ignore AI service errors
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate() {
    if (messages.length === 0 || !selectedConversationId || !session || !session.user) return;
    setRegenerating(true);
    // Remove last agent message
    const lastUserIdx = [...messages].reverse().findIndex(m => m.role === 'user');
    const lastUserIdxAbs = lastUserIdx === -1 ? messages.length - 1 : messages.length - 1 - lastUserIdx;
    const upToLastUser = messages.slice(0, lastUserIdxAbs + 1);
    try {
      // Add timeout for AI response
      const aiPromise = fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: upToLastUser }),
      }).then(res => res.json());
      const timeoutPromise = new Promise<{ result?: string; error?: string }>((_, reject) =>
        setTimeout(() => reject(new Error("AI response timed out. Please try again.")), 20000)
      );
      const data = await Promise.race([aiPromise, timeoutPromise]);
      if ((data as { result?: string; error?: string }).result) {
        // Save regenerated assistant message
        const agentMsg = { chatId: selectedConversationId, role: 'assistant', content: (data as { result?: string; error?: string }).result };
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(agentMsg),
        });
        // Reload messages
        const updatedMsgsRes = await fetch(`/api/messages?chatId=${selectedConversationId}`);
        const updatedMsgs = await updatedMsgsRes.json();
        setMessages((updatedMsgs || []).map((m: { role: 'user' | 'assistant'; content: string; createdat?: string }) => ({ role: m.role, content: m.content, createdAt: m.createdat })));
      }
    } catch {
      // Ignore AI service errors
    } finally {
      setRegenerating(false);
    }
  }

  function handleExampleClick(example: string) {
    setInput(example);
    inputRef.current?.focus();
  }

  function handleInputKeyDown(event: React.KeyboardEvent<HTMLInputElement>) {
    if (event.key === "Enter" && !loading) {
      handleSend();
    }
  }

  // --- Integration Handlers ---
  const handleSendToLinear = useCallback(async (target: { content: string }) => {
    try {
      const res = await fetch("/api/integrations/linear/issues", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: target.content })
      });
      if (!res.ok) throw new Error("Failed to send to Linear.");
      const data = await res.json();
      setStatusToast({ type: 'linear', url: data.url, title: data.title || 'Linear Issue' });
      setCreatedItems(prev => [{
        id: data.id,
        type: 'linear',
        url: data.url,
        title: data.title || 'Linear Issue',
        content: target.content,
        createdAt: new Date().toISOString(),
        chatId: selectedConversationId || '',
      }, ...prev]);
    } catch {
      // Ignore errors
    }
  }, [selectedConversationId]);

  const handleSendToNotion = useCallback(async (target: { content: string }) => {
    setNotionLoading(true);
    try {
      const res = await fetch("/api/integrations/notion/pages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: target.content })
      });
      if (!res.ok) {
        await res.json().catch(() => ({}));
      } else {
        const data = await res.json();
        setStatusToast({ type: 'notion', url: data.url, title: data.title || 'Notion Page' });
        setCreatedItems(prev => [{
          id: data.id,
          type: 'notion',
          url: data.url,
          title: data.title || 'Notion Page',
          content: target.content,
          createdAt: new Date().toISOString(),
          chatId: selectedConversationId || '',
        }, ...prev]);
        setTimeout(() => setNotionLoading(false), 1500);
      }
    } catch {
      // Ignore errors
    } finally {
      setNotionLoading(false);
    }
  }, [selectedConversationId]);

  function handleCopyLink(url: string) {
    if (navigator && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      setStatusToastCopied(true);
      setTimeout(() => setStatusToastCopied(false), 1200);
    }
  }

  function handleEditItem(item: CreatedItem) {
    setEditItem(item);
    setEditContent(item.content);
  }

  function handleCloseEdit() {
    setEditItem(null);
    setEditContent('');
  }

  async function handleSaveEdit() {
    if (!editItem) return;
    setEditLoading(true);
    try {
      if (editItem.type === 'notion') {
        await fetch(`/api/integrations/notion/pages`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editItem.id, content: editContent })
        });
      } else if (editItem.type === 'linear') {
        await fetch(`/api/integrations/linear/issues`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editItem.id, content: editContent })
        });
      }
      setCreatedItems(prev => prev.map(ci => ci.id === editItem.id ? { ...ci, content: editContent } : ci));
      handleCloseEdit();
    } catch {
      // Ignore errors
    } finally {
      setEditLoading(false);
    }
  }

  // Cleans AI responses to remove Notion access disclaimers and code/manual steps
  function cleanAIResponse(response: string): string {
    return response
      .replace(/If you want me to do it directly[\s\S]*?(Using Notion API|Manual steps):[\s\S]*/gi, '')
      .replace(/I don’t have access to your Notion workspace[\s\S]*?(Using Notion API|Manual steps):[\s\S]*/gi, '')
      .replace(/I don't have access to your Notion workspace[\s\S]*/gi, '')
      .replace(/If you want to automate it and have a Notion integration and token:[\s\S]*/gi, '')
      .replace(/Here is a Python example using the Notion API:[\s\S]*/gi, '')
      .replace(/Manual steps:[\s\S]*/gi, '')
      .replace(/Using Notion API:[\s\S]*/gi, '')
      .trim();
  }

  // --- Auto-sync chat summaries ---
  useEffect(() => {
    if (!messages.length || !selectedConversationId) return;
    // Only sync at end of conversation (last message is assistant)
    if (messages[messages.length - 1].role === 'assistant') {
      const summary = messages.map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
      if (selectedIntegration === 'notion') {
        handleSendToNotion({ content: `Chat summary:\n${summary}` });
      } else if (selectedIntegration === 'linear') {
        handleSendToLinear({ content: `Chat summary:\n${summary}` });
      }
    }
  }, [messages, selectedIntegration, selectedConversationId, handleSendToNotion, handleSendToLinear]);

  // Block UI for unauthenticated users
  if (status === "loading") {
    return <div className="flex items-center justify-center min-h-screen text-lg">Loading…</div>;
  }
  if (!session || !session.user) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-white dark:bg-black">
        <form method="post" action="/api/auth/signin/google">
          <input type="hidden" name="callbackUrl" value="/" />
          <Button type="submit" className="w-full flex items-center gap-2 justify-center bg-white text-black border border-gray-300 shadow hover:bg-gray-50 text-lg px-8 py-4">
            <Image src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" width={24} height={24} className="w-6 h-6" />
            Sign in with Google
          </Button>
        </form>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-white dark:bg-black transition-colors">
      {/* Sidebar */}
      <aside className="w-72 bg-muted border-r border-border flex flex-col p-4 gap-4">
        <div className="flex items-center justify-between mb-2">
          <span className="font-bold text-lg">Conversations</span>
          <Button size="sm" variant="outline" onClick={handleNewConversation}>
            + New
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-2 mb-4">
          {conversations.length === 0 && (
            <div className="text-muted-foreground text-sm text-center mt-8">
              No conversations yet
            </div>
          )}
          {conversations.map((convo) => (
            <div key={convo.id} className="flex items-center gap-2 group">
              {renamingId === convo.id ? (
                <form
                  onSubmit={event => { event.preventDefault(); handleRenameConversation(convo.id); }}
                  className="flex-1 flex gap-1"
                >
                  <Input
                    value={renameValue}
                    onChange={e => setRenameValue(e.target.value)}
                    className="h-8 text-sm"
                    autoFocus
                  />
                  <Button size="sm" type="submit">Save</Button>
                  <Button size="sm" variant="ghost" type="button" onClick={() => setRenamingId(null)}>Cancel</Button>
                </form>
              ) : (
                <>
                  <button
                    className={`flex-1 text-left px-3 py-2 rounded transition-colors ${selectedConversationId === convo.id ? "bg-blue-100 dark:bg-blue-900 font-semibold" : "hover:bg-muted"}`}
                    onClick={() => handleSelectConversation(convo.id)}
                  >
                    {convo.title}
                  </button>
                  <Button size="icon" variant="ghost" onClick={() => { setRenamingId(convo.id); setRenameValue(convo.title); }} title="Rename"><Pencil className="w-4 h-4" /></Button>
                  <Button size="icon" variant="ghost" onClick={() => handleDeleteConversation(convo.id)} title="Delete"><Trash2 className="w-4 h-4" /></Button>
                </>
              )}
            </div>
          ))}
        </div>
        {/* Settings link */}
        <Link href="/settings">
          <Button variant="outline" size="sm" className="w-full mb-4" asChild>
            <span>⚙️ Settings</span>
          </Button>
        </Link>
        <div className="mt-auto pt-4 border-t border-border flex flex-col items-center">
          {session && session.user ? (
            <div className="w-full flex flex-col items-center gap-2 mb-2">
              <Image
                src={session.user.image || `https://ui-avatars.com/api/?name=${encodeURIComponent(session.user.name || session.user.email || "User")}`}
                alt={session.user.name || session.user.email || "User"}
                width={40}
                height={40}
                className="w-10 h-10 rounded-full border border-gray-300 shadow"
              />
              <div className="text-sm font-semibold text-center truncate max-w-[90%]">{session.user.name || session.user.email}</div>
              <Button
                variant="outline"
                size="sm"
                className="w-full mt-1"
                onClick={() => signOut({ callbackUrl: "/" })}
              >
                Sign out
              </Button>
            </div>
          ) : null}
        </div>
      </aside>
      {/* Main Agent Chat */}
      <main className="flex-1 flex flex-col items-center justify-center">
        <div className="w-full max-w-2xl flex flex-col h-[80vh] bg-white dark:bg-black rounded-lg shadow-lg border border-border p-4">
          <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
            {messages.length === 0 && (
              <>
                <div className="text-muted-foreground text-center mt-12 mb-4 text-lg">👋 <b>Welcome to your AI Agent!</b></div>
              </>
            )}
            {messages.map((msg, i) => (
              <div key={i} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} items-end relative`}>
                {msg.role === 'assistant' && (
                  <UserCircle className="w-7 h-7 mr-2 text-blue-400 bg-white dark:bg-black rounded-full border border-blue-200" />
                )}
                <div
                  className={`max-w-[80%] px-4 py-2 rounded-lg shadow text-base whitespace-pre-line font-geist-mono ${msg.role === 'user' ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-black dark:text-white'}`}
                  aria-label={msg.role === 'user' ? 'User message' : 'Assistant response'}
                  style={{ position: 'relative' }}
                >
                  {msg.role === 'assistant' ? (
                    <div className="prose prose-neutral dark:prose-invert max-w-none">
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>
                        {msg.content}
                      </ReactMarkdown>
                    </div>
                  ) : (
                    msg.content
                  )}
                  <div className="text-[10px] text-right text-muted-foreground mt-1">
                    {msg.createdAt ? new Date(msg.createdAt).toLocaleTimeString() : ''}
                  </div>
                  {/* Integration badge if this message created a Notion/Linear item */}
                  {(() => { const ci = getCreatedItemForMessage(msg); return ci ? (
                    <span className="absolute left-2 top-2" aria-label={ci.type === 'notion' ? 'Notion badge' : 'Linear badge'}>
                      {ci.type === 'notion' ? <NotionIcon /> : <LinearIcon />}
                    </span>
                  ) : null; })()}
                  {/* Action icons for assistant responses */}
                  {msg.role === 'assistant' && (
                    <div className="flex gap-2 items-center absolute right-2 bottom-[-2.2rem]">
                      <button
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition flex items-center"
                        title="Copy response"
                        aria-label="Copy response"
                        onClick={() => {
                          if (navigator && navigator.clipboard) {
                            navigator.clipboard.writeText(msg.content);
                            setStatusToastCopied(true);
                            setTimeout(() => setStatusToastCopied(false), 1200);
                          }
                        }}
                      >
                        <Copy className="h-4 w-4 text-gray-500" />
                      </button>
                      {/* Notion icon button (before Linear) */}
                      {notionConnected && (
                        <button
                          className="p-1 rounded hover:bg-green-100 dark:hover:bg-green-900 transition flex items-center"
                          title="Send to Notion"
                          aria-label="Send to Notion"
                          onClick={() => handleSendToNotion({ content: msg.content })}
                          disabled={notionLoading}
                          style={notionLoading ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                          <NotionIcon />
                        </button>
                      )}
                      {/* Linear icon button (after Notion) */}
                      {linearConnected && (
                        <button
                          className="p-1 rounded hover:bg-purple-100 dark:hover:bg-purple-900 transition flex items-center"
                          title="Send to Linear"
                          aria-label="Send to Linear"
                          onClick={async () => {
                            setLinearLoading(true);
                            await handleSendToLinear({ content: msg.content });
                            setLinearLoading(false);
                          }}
                          disabled={linearLoading}
                          style={linearLoading ? { opacity: 0.5, cursor: 'not-allowed' } : {}}
                        >
                          {linearLoading ? <span className="inline-block w-4 h-4 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" /> : <LinearIcon />}
                        </button>
                      )}
                      {i === messages.length - 1 && (
                        <button
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                          title="Regenerate response"
                          aria-label="Regenerate response"
                          onClick={handleRegenerate}
                          disabled={regenerating || loading}
                        >
                          <RefreshCw className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''} text-blue-500`} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
                {msg.role === 'user' && (
                  <UserCircle className="w-7 h-7 ml-2 text-gray-400 bg-white dark:bg-black rounded-full border border-gray-200" />
                )}
              </div>
            ))}
            {(loading || regenerating) && (
              <div className="flex justify-start">
                <div className="max-w-[80%] px-4 py-2 rounded-lg shadow text-base font-geist-mono bg-gray-100 dark:bg-gray-800 text-black dark:text-white opacity-70 animate-pulse">
                  <span className="inline-block w-4 h-4 mr-2 align-middle animate-spin border-2 border-blue-400 border-t-transparent rounded-full"></span>
                  Thinking…
                </div>
              </div>
            )}
          </div>
          {/* Integrations Dropdown + Settings + Created Items History shortcut */}
          {integrationsList.length > 0 && (
            <div className="mb-4 flex items-center gap-2">
              <label htmlFor="integration-select" className="text-sm font-medium">Integration:</label>
              <select
                id="integration-select"
                className="border rounded px-2 py-1 text-sm"
                value={selectedIntegration}
                onChange={e => setSelectedIntegration(e.target.value)}
                aria-label="Select integration"
              >
                {integrationsList.map((intg) => (
                  <option key={intg.key} value={intg.key}>{intg.name}</option>
                ))}
              </select>
              <Button size="icon" variant="ghost" onClick={() => window.location.href = '/settings'} title="Integration Settings" aria-label="Integration Settings">
                <Settings className="w-4 h-4" />
              </Button>
              <button
                ref={historyButtonRef}
                className="p-2 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                title="Show created items history"
                aria-label="Show created items history"
                onClick={() => setShowHistory(true)}
                style={{ marginLeft: 4 }}
              >
                <BadgeCheck className="w-5 h-5 text-blue-500" />
              </button>
            </div>
          )}
          {/* Integration-specific templates */}
          {integrationTemplates[selectedIntegration] && (
            <div className="flex gap-2 mb-2">
              {integrationTemplates[selectedIntegration].map((tpl, idx) => (
                <Button key={idx} variant="outline" size="sm" className="text-xs flex items-center gap-1" onClick={() => handleExampleClick(tpl.value)}>
                  {tpl.icon}{tpl.label}
                </Button>
              ))}
            </div>
          )}
          <div className="flex gap-2 items-center">
            <Input
              ref={inputRef}
              className="flex-1 text-base font-geist-mono"
              placeholder={selectedIntegration === 'notion' ? "Ask me anything, or give me a Notion task…" : selectedIntegration === 'linear' ? "Ask me anything, or give me a Linear task…" : "Ask me anything, or give me a task…"}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleInputKeyDown}
              disabled={loading || regenerating}
              autoFocus
              aria-label="Message input"
            />
            <Button
              onClick={handleSend}
              disabled={loading || regenerating || !input.trim()}
              className="bg-blue-600 text-white font-semibold px-6 py-2 rounded-lg shadow hover:bg-blue-700 transition-colors"
              aria-label="Send message"
            >
              Send
            </Button>
          </div>
        </div>
      </main>
      {/* Status Toast for Notion/Linear creation */}
      {statusToast && (
        <div id="status-toast" className="fixed bottom-24 right-8 bg-blue-700 text-white px-4 py-2 rounded shadow z-50 flex items-center gap-2 animate-fade-in" role="status">
          {statusToast.type === 'notion' ? <NotionIcon /> : <LinearIcon />}
          <span className="font-semibold">{statusToast.type === 'notion' ? 'Notion Page' : 'Linear Issue'} Created:</span>
          <a href={statusToast.url} target="_blank" rel="noopener noreferrer" className="underline flex items-center gap-1"><ExternalLink className="w-4 h-4 inline" />Open</a>
          <Button size="sm" variant="ghost" onClick={() => handleCopyLink(statusToast.url)}><Copy className="w-4 h-4" />Copy Link</Button>
          <button className="ml-2 text-white/80 hover:text-white underline text-xs" onClick={() => setStatusToast(null)}>Dismiss</button>
        </div>
      )}
      {statusToastCopied && (
        <div className="fixed bottom-20 right-8 bg-black text-white px-4 py-2 rounded shadow z-50 animate-fade-in" role="status">
          Link copied!
        </div>
      )}
      {/* Created Items History Modal */}
      {showHistory && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
          <div ref={historyModalRef} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-[420px] max-h-[80vh] overflow-y-auto relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-black dark:hover:text-white" onClick={() => setShowHistory(false)} aria-label="Close history">&times;</button>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2"><BadgeCheck className="w-5 h-5" /> Created Items</h2>
            {createdItems.length === 0 ? (
              <div className="text-muted-foreground text-sm">No Notion pages or Linear issues created yet.</div>
            ) : (
              <ul className="space-y-3">
                {createdItems.map(item => (
                  <li key={item.id} className="flex items-center gap-2 border-b pb-2">
                    {item.type === 'notion' ? <NotionIcon /> : <LinearIcon />}
                    <a href={item.url} target="_blank" rel="noopener noreferrer" className="underline font-semibold flex-1 truncate">{item.title}</a>
                    <Button size="icon" variant="ghost" onClick={() => handleCopyLink(item.url)} title="Copy Link" aria-label="Copy Link"><Copy className="w-4 h-4" /></Button>
                    <Button size="icon" variant="ghost" onClick={() => handleEditItem(item)} title="Edit" aria-label="Edit"><Edit2 className="w-4 h-4" /></Button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
      {/* Edit Modal */}
      {editItem && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center" aria-modal="true" role="dialog">
          <div ref={editModalRef} className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-6 w-[420px] relative">
            <button className="absolute top-2 right-2 text-gray-500 hover:text-black dark:hover:text-white" onClick={handleCloseEdit} aria-label="Close edit">&times;</button>
            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">Edit {editItem.type === 'notion' ? 'Notion Page' : 'Linear Issue'}</h2>
            <div className="mb-2"><a href={editItem.url} target="_blank" rel="noopener noreferrer" className="underline">Open in {editItem.type === 'notion' ? 'Notion' : 'Linear'}</a></div>
            <textarea className="w-full border rounded p-2 mb-4 min-h-[100px]" value={editContent} onChange={e => setEditContent(e.target.value)} disabled={editLoading} aria-label="Edit content" />
            <div className="flex gap-2 justify-end">
              <Button variant="outline" onClick={handleCloseEdit} disabled={editLoading} aria-label="Cancel edit">Cancel</Button>
              <Button onClick={handleSaveEdit} disabled={editLoading} aria-label="Save edit">Save</Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;
