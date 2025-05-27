"use client";

import dynamic from "next/dynamic";
import { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Pencil, Trash2, RefreshCw, Mail, ListTodo, Languages, FileText, Sparkles, UserCircle, CheckCircle2, PlusCircle, Copy } from 'lucide-react';
import { useSession, signOut } from "next-auth/react";

const RichTextEditor = dynamic(() => import("@/components/ui/rich-text-editor"), { ssr: false });

const EXAMPLES = [
  "Summarize this text...",
  "Write a short email to my team about project status.",
  "What are the top 3 news headlines today?",
  "Generate a todo list for moving to a new city.",
  "Explain quantum computing in simple terms.",
  "Translate 'Hello, how are you?' to French."
];

// Sidebar chat item type
interface ChatItem {
  id: string;
  title: string;
}

// Task item type
interface TaskItem {
  id: string;
  chatid: string;
  type: string;
  status: string;
  payload: string | null;
  createdat: string;
  updatedat: string;
}

// Message type now includes createdAt (optional)
type MessageItem = { role: 'user' | 'assistant'; content: string; createdAt?: string };

export default function Home() {
  const [messages, setMessages] = useState<MessageItem[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [conversations, setConversations] = useState<ChatItem[]>([]);
  const [selectedConversationId, setSelectedConversationId] = useState<string | null>(null);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState("");
  const [regenerating, setRegenerating] = useState(false);
  const { data: session, status } = useSession();
  const [tasks, setTasks] = useState<TaskItem[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const [showCopied, setShowCopied] = useState(false);

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

  // Only fetch tasks if authenticated
  useEffect(() => {
    if (session && session.user && selectedConversationId) {
      fetch(`/api/tasks?chatId=${selectedConversationId}`)
        .then(res => res.json())
        .then(data => setTasks(data || []));
    } else {
      setTasks([]);
    }
  }, [selectedConversationId, session]);

  function handleSelectConversation(id: string) {
    setSelectedConversationId(id);
    if (session && session.user) {
      fetch(`/api/messages?chatId=${id}`)
        .then(res => res.json())
        .then(data => setMessages((data || []).map((m: any) => ({ role: m.role, content: m.content, createdAt: m.createdat }))));
      fetch(`/api/tasks?chatId=${id}`)
        .then(res => res.json())
        .then(data => setTasks(data || []));
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
    setError("");
    let chatId = selectedConversationId;
    // If no chat selected, create a new chat first
    if (!chatId) {
      const res = await fetch("/api/chats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title: input.slice(0, 24) || "New Conversation" }),
      });
      if (!res.ok) {
        const error = await res.json().catch(() => ({}));
        setError(error?.error || "Failed to create chat.");
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
    let allMsgs = [];
    try {
      const allMsgsRes = await fetch(`/api/messages?chatId=${chatId}`);
      if (allMsgsRes.ok) {
        const text = await allMsgsRes.text();
        allMsgs = text ? JSON.parse(text) : [];
      } else {
        setError("Failed to load messages for this chat.");
        allMsgs = [];
      }
    } catch (e) {
      setError("Failed to parse messages response.");
      allMsgs = [];
    }
    setMessages((allMsgs || []).map((m: any) => ({ role: m.role, content: m.content, createdAt: m.createdat })));
    setInput("");
    try {
      // Add timeout for AI response
      const aiPromise = fetch("/api/ai", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: [...allMsgs, { role: 'user', content: input }] }),
      }).then(res => res.json());
      const timeoutPromise = new Promise<{ result?: string; error?: string }>((_, reject) =>
        setTimeout(() => reject(new Error("AI response timed out. Please try again.")), 20000)
      );
      const data = await Promise.race([aiPromise, timeoutPromise]);
      if ((data as any).result) {
        // Save assistant message
        const agentMsg = { chatId, role: 'assistant', content: (data as any).result };
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(agentMsg),
        });
        // Reload messages
        const updatedMsgsRes = await fetch(`/api/messages?chatId=${chatId}`);
        let updatedMsgs = await updatedMsgsRes.json();
        if (!Array.isArray(updatedMsgs)) updatedMsgs = [];
        setMessages((updatedMsgs || []).map((m: any) => ({ role: m.role, content: m.content, createdAt: m.createdat })));
      } else if ((data as any).error) {
        setError((data as any).error);
      }
    } catch (e: any) {
      setError(e.message || "Failed to connect to AI service.");
    } finally {
      setLoading(false);
    }
  }

  async function handleRegenerate() {
    if (messages.length === 0 || !selectedConversationId || !session || !session.user) return;
    setRegenerating(true);
    setError("");
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
      if ((data as any).result) {
        // Save regenerated assistant message
        const agentMsg = { chatId: selectedConversationId, role: 'assistant', content: (data as any).result };
        await fetch('/api/messages', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(agentMsg),
        });
        // Reload messages
        const updatedMsgsRes = await fetch(`/api/messages?chatId=${selectedConversationId}`);
        const updatedMsgs = await updatedMsgsRes.json();
        setMessages((updatedMsgs || []).map((m: any) => ({ role: m.role, content: m.content, createdAt: m.createdat })));
      } else if ((data as any).error) {
        setError((data as any).error);
      }
    } catch (e: any) {
      setError(e.message || "Failed to connect to AI service.");
    } finally {
      setRegenerating(false);
    }
  }

  function handleExampleClick(example: string) {
    setInput(example);
    inputRef.current?.focus();
  }

  function handleInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter" && !loading) {
      handleSend();
    }
  }

  async function handleAddTask() {
    if (!selectedConversationId || !session || !session.user) return;
    const res = await fetch('/api/tasks', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ chatId: selectedConversationId, userId: session.user.email, type: 'todo', status: 'pending', payload: 'New Task' }),
    });
    const task = await res.json();
    setTasks(prev => [task, ...prev]);
  }

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
            <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-6 h-6" />
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
                  onSubmit={e => { e.preventDefault(); handleRenameConversation(convo.id); }}
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
        {/* Tasks Section (hidden for now) */}
        {/*
        <div className="mt-4">
          <div className="flex items-center justify-between mb-1">
            <span className="font-semibold text-base">Tasks</span>
            <Button size="icon" variant="ghost" onClick={handleAddTask} title="Add Task"><PlusCircle className="w-5 h-5" /></Button>
          </div>
          <div className="space-y-2 max-h-40 overflow-y-auto">
            {tasks.length === 0 && <div className="text-xs text-muted-foreground">No tasks for this chat.</div>}
            {tasks.map(task => (
              <div key={task.id} className="flex items-center gap-2 p-2 rounded bg-gray-100 dark:bg-gray-800">
                <CheckCircle2 className={`w-4 h-4 ${task.status === 'completed' ? 'text-green-500' : 'text-gray-400'}`} />
                <span className="text-xs font-mono flex-1">{task.payload}</span>
                <span className="text-[10px] text-muted-foreground">{new Date(task.createdat).toLocaleDateString()}</span>
              </div>
            ))}
          </div>
        </div>
        */}
        <div className="mt-auto pt-4 border-t border-border flex flex-col items-center">
          {session && session.user ? (
            <div className="w-full flex flex-col items-center gap-2 mb-2">
              <img
                src={session.user.image || "https://ui-avatars.com/api/?name=" + encodeURIComponent(session.user.name || session.user.email || "User")}
                alt={session.user.name || session.user.email || "User"}
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
                <div className="text-center text-base mb-2">Try one of these examples:</div>
                <div className="flex flex-wrap gap-2 justify-center mb-8">
                  {EXAMPLES.map((ex, i) => (
                    <button key={i} className="px-3 py-1 rounded bg-gray-100 dark:bg-gray-800 text-sm font-geist-mono hover:bg-blue-100 dark:hover:bg-blue-900 transition-colors border border-border" onClick={() => handleExampleClick(ex)}>{ex}</button>
                  ))}
                </div>
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
                  {/* Action icons for assistant responses */}
                  {msg.role === 'assistant' && (
                    <div className="flex gap-2 items-center absolute right-2 bottom-[-2.2rem]">
                      <button
                        className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                        title="Copy response"
                        onClick={() => {
                          if (navigator && navigator.clipboard) {
                            navigator.clipboard.writeText(msg.content);
                            setShowCopied(true);
                            setTimeout(() => setShowCopied(false), 1200);
                          }
                        }}
                      >
                        <Copy className="h-4 w-4 text-gray-500" />
                      </button>
                      {i === messages.length - 1 && (
                        <button
                          className="p-1 rounded hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                          title="Regenerate response"
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
          <div className="flex gap-2 items-center mb-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleExampleClick('Summarize this text: ...')}
            >
              <FileText className="w-4 h-4 mr-1 inline" /> Summarize
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleExampleClick('Write a short email about ...')}
            >
              <Mail className="w-4 h-4 mr-1 inline" /> Email
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleExampleClick('Translate to French: ...')}
            >
              <Languages className="w-4 h-4 mr-1 inline" /> Translate
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => handleExampleClick('Create a todo list for ...')}
            >
              <ListTodo className="w-4 h-4 mr-1 inline" /> Todo List
            </Button>
            {messages.length > 1 && messages[messages.length - 1].role === 'assistant' && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs text-blue-600"
                onClick={handleRegenerate}
                disabled={regenerating || loading}
                title="Regenerate last response"
              >
                <RefreshCw className="w-4 h-4 mr-1 inline animate-spin-slow" /> Regenerate
              </Button>
            )}
          </div>
          <div className="flex gap-2 items-center">
            <Input
              ref={inputRef}
              className="flex-1 text-base font-geist-mono"
              placeholder="Ask me anything, or give me a task…"
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
      {error && (
        <div className="fixed bottom-24 right-8 bg-red-600 text-white px-4 py-2 rounded shadow z-50" role="alert" aria-live="assertive">
          <span className="font-semibold">Error:</span> {error}
          <button
            className="ml-4 text-white/80 hover:text-white underline text-sm"
            onClick={() => setError("")}
            aria-label="Dismiss error"
          >
            Dismiss
          </button>
        </div>
      )}
      {showCopied && (
        <div className="fixed bottom-8 right-8 bg-black text-white px-4 py-2 rounded shadow z-50 animate-fade-in" role="status">
          Copied!
        </div>
      )}
    </div>
  );
}
