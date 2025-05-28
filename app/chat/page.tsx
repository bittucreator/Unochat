"use client";
import { useEffect, useRef, useState, Fragment } from "react";
import { Send, Settings, Trash2, Edit2, Check, X } from "lucide-react";
import { Dialog, Transition } from "@headlessui/react";
import { useSession, signIn, signOut } from "next-auth/react";
import { SparklesCore } from "../../components/SparklesCore";

const MODELS = [
	{ label: "GPT-4.1", value: "gpt-4.1" },
	{ label: "Grok-3", value: "grok-3" },
	{ label: "GPT-4o", value: "gpt-4o" },
];

interface Message {
	id?: number;
	user: string;
	content: string;
	created_at?: string;
	session_id?: string; // Add session_id for chat history support
}

export default function ChatPage() {
	const { data: session, status } = useSession();
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState("");
	const [loading, setLoading] = useState(false);
	const [model, setModel] = useState(MODELS[0].value);
	const [showSettings, setShowSettings] = useState(false);
	const [systemPrompt, setSystemPrompt] = useState("");
	const [editingIdx, setEditingIdx] = useState<number | null>(null);
	const [editInput, setEditInput] = useState("");
	const [sessions, setSessions] = useState<any[]>([]); // Chat sessions
	const [activeSession, setActiveSession] = useState<string | null>(null);
	const [renameId, setRenameId] = useState<string | null>(null);
	const [renameValue, setRenameValue] = useState("");
	const messagesEndRef = useRef<HTMLDivElement>(null);

	// Fetch chat sessions for the user
	useEffect(() => {
		if (status === "authenticated") {
			fetch("/api/messages?sessions=1")
				.then((res) => res.json())
				.then((data) => setSessions(data.sessions || []));
		}
	}, [status]);

	// Fetch messages for the active session
	useEffect(() => {
		if (activeSession) {
			fetch(`/api/messages?session_id=${activeSession}`)
				.then((res) => res.json())
				.then((data) => setMessages(data.messages || []));
		}
	}, [activeSession]);

	useEffect(() => {
		messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
	}, [messages]);

	// Create a new chat session
	async function createNewSession() {
		if (!session?.user?.email) return;
		const res = await fetch("/api/messages", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ createSession: true, user_id: session.user.email, title: null }),
		});
		const data = await res.json();
		if (data.session) {
			setSessions((prev) => [data.session, ...prev]);
			setActiveSession(data.session.id);
			setMessages([]);
		}
	}

	// Streaming response implementation
	async function sendMessage() {
		if (!input.trim()) return;
		setLoading(true);
		const userMsg: Message = { user: session?.user?.email || "user", content: input, session_id: activeSession || undefined };
		let chatHistory = [...messages, userMsg];
		setMessages((msgs) => [...msgs, userMsg]);
		setInput("");
		await fetch("/api/messages", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(userMsg),
		});
		let chatToSend = chatHistory.map((msg) => ({
			role: msg.user === "user" ? "user" : "assistant",
			content: msg.content,
		}));
		if (systemPrompt && !chatToSend.some((m) => m.role === "system")) {
			chatToSend = [{ role: "system", content: systemPrompt }, ...chatToSend];
		}
		// Streaming fetch
		const res = await fetch("/api/ai", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ messages: chatToSend, model, stream: true }),
		});
		if (!res.body) {
			setMessages((msgs) => [...msgs, { user: "ai", content: "(No response)", session_id: activeSession || undefined }]);
			setLoading(false);
			return;
		}
		const reader = res.body.getReader();
		let aiContent = "";
		const decoder = new TextDecoder();
		let buffer = "";
		let aiMessageIndex: number | null = null;
		while (true) {
			const { value, done } = await reader.read();
			if (done) break;
			buffer += decoder.decode(value);
			const events = buffer.split("\n\n");
			buffer = events.pop()!;
			for (const event of events) {
				const line = event.trim();
				if (line.startsWith("data: ")) {
					const data = line.replace("data: ", "").trim();
					if (data && data !== "[DONE]") {
						try {
							const delta = JSON.parse(data);
							const token = delta.choices?.[0]?.delta?.content || "";
							aiContent += token;
							setMessages((msgs) => {
								let newMsgs = [...msgs];
								if (aiMessageIndex === null) {
									aiMessageIndex = newMsgs.length;
									newMsgs.push({ user: "ai", content: aiContent, session_id: activeSession || undefined });
								} else {
									newMsgs[aiMessageIndex] = { ...newMsgs[aiMessageIndex], content: aiContent };
								}
								return newMsgs;
							});
						} catch {}
					}
				}
			}
		}
		// Save final AI message
		await fetch("/api/messages", {
			method: "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ user: "ai", content: aiContent, session_id: activeSession || undefined }),
		});
		setLoading(false);
	}

	async function clearChat() {
		await fetch("/api/messages", { method: "DELETE" });
		setMessages([]);
	}

	async function startEdit(idx: number) {
		setEditingIdx(idx);
		setEditInput(messages[idx].content);
	}

	async function saveEdit(idx: number) {
		const msg = messages[idx];
		const updated = { ...msg, content: editInput };
		await fetch("/api/messages", {
			method: "PUT",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(updated),
		});
		const newMsgs = [...messages];
		newMsgs[idx] = updated;
		setMessages(newMsgs);
		setEditingIdx(null);
	}

	function cancelEdit() {
		setEditingIdx(null);
	}

	// Rename a chat session
	async function renameSession(sessionId: string, newTitle: string) {
		await fetch("/api/messages", {
			method: "PATCH",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ session_id: sessionId, title: newTitle }),
		});
		setSessions((prev) => prev.map((s) => (s.id === sessionId ? { ...s, title: newTitle } : s)));
	}

	// Delete a chat session
	async function deleteSession(sessionId: string) {
		await fetch("/api/messages", {
			method: "DELETE",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify({ session_id: sessionId }),
		});
		setSessions((prev) => prev.filter((s) => s.id !== sessionId));
		if (activeSession === sessionId) {
			setActiveSession(sessions.length > 1 ? sessions.find((s) => s.id !== sessionId)?.id || null : null);
			setMessages([]);
		}
	}

	if (status === "loading") return <div>Loading...</div>;
	if (status === "unauthenticated")
		return (
			<div className="flex flex-col items-center justify-center min-h-screen">
				<p className="mb-4">Please sign in to use the chat.</p>
				<button className="bg-blue-700 px-4 py-2 rounded" onClick={() => signIn()}>Sign In</button>
			</div>
		);

	return (
		<div className="relative min-h-screen flex bg-gradient-to-br from-[#0f2027] via-[#2c5364] to-[#232526] text-white overflow-hidden">
			{/* Sci-fi animated background */}
			<div className="absolute inset-0 z-0 pointer-events-none">
				<SparklesCore color="#00fff7" />
				<div className="absolute inset-0 bg-gradient-to-br from-transparent via-[#0fffc3]/10 to-[#1a2980]/30" />
			</div>

			{/* Sidebar for chat sessions and user info */}
			<aside className="relative z-10 w-64 bg-gradient-to-b from-cyan-900/80 via-[#0f2027]/90 to-[#232526]/90 p-4 flex flex-col gap-4 border-r-2 border-cyan-400/40 shadow-2xl backdrop-blur-xl rounded-tr-2xl rounded-br-3xl ring-1 ring-cyan-400/10">
				<div className="flex items-center gap-3 mb-6 px-2 py-2 rounded-xl bg-gradient-to-r from-cyan-700/40 to-blue-900/30 border border-cyan-400/30 shadow-cyan-400/10 shadow-lg">
					{session?.user?.image && <img src={session.user.image} alt="avatar" className="w-10 h-10 rounded-full border-2 border-cyan-400 shadow-cyan-400/30 shadow" />}
					<span className="font-mono text-cyan-100 tracking-wide text-base drop-shadow-glow">{session?.user?.name || session?.user?.email}</span>
					<button className="ml-auto text-xs underline text-cyan-300 hover:text-cyan-100" onClick={() => signOut()}>Sign out</button>
				</div>
				<button className="bg-gradient-to-r from-cyan-400 to-blue-600 rounded-xl px-4 py-2 mb-4 text-black font-bold shadow-lg hover:from-cyan-300 hover:to-blue-500 transition-all border-2 border-cyan-400/40" onClick={createNewSession}>+ New Chat</button>
				<div className="flex-1 overflow-y-auto custom-scrollbar space-y-2">
					{sessions.map((s) => (
						<div key={s.id} className="relative group">
							{renameId === s.id ? (
								<input
									type="text"
									className="w-full px-3 py-2 rounded-xl font-mono text-cyan-900 text-base border-2 border-cyan-400/80 bg-cyan-100 focus:outline-none focus:ring-2 focus:ring-cyan-400"
									value={renameValue}
									onChange={e => setRenameValue(e.target.value)}
									onBlur={() => { renameSession(s.id, renameValue); setRenameId(null); }}
									onKeyDown={e => { if (e.key === 'Enter') { renameSession(s.id, renameValue); setRenameId(null); } if (e.key === 'Escape') setRenameId(null); }}
									autoFocus
								/>
							) : (
								<button
									className={`block w-full text-left px-4 py-3 rounded-xl font-mono text-cyan-100/90 text-base border-2 transition-all duration-200 shadow-md shadow-cyan-400/10 ${activeSession === s.id ? "bg-cyan-900/80 border-cyan-400/80 ring-2 ring-cyan-300/60 scale-105" : "bg-cyan-950/40 border-cyan-700/40 hover:bg-cyan-800/40 hover:border-cyan-400/40"}`}
									onClick={() => setActiveSession(s.id)}
									onContextMenu={e => { e.preventDefault(); setRenameId(s.id); setRenameValue(s.title || ''); }}
								>
									<span className="truncate block sci-fi-text-glow">{s.title || `Chat ${s.id.slice(0, 6)}`}</span>
								</button>
							)}
							<button
								className="absolute top-2 right-2 p-1 opacity-0 group-hover:opacity-100 transition-opacity text-cyan-300 hover:text-red-400"
								onClick={() => deleteSession(s.id)}
								title="Delete chat"
							>
								🗑️
							</button>
						</div>
					))}
				</div>
			</aside>
			<main className="relative z-10 flex-1 flex flex-col items-center justify-center p-4">
				<div className="w-full max-w-2xl bg-black/70 rounded-2xl shadow-2xl p-8 flex flex-col h-[80vh] border border-cyan-400/20 backdrop-blur-md">
					<div className="flex justify-between items-center mb-2">
						<span className="text-xl font-mono font-bold text-cyan-300 tracking-widest drop-shadow-glow">UNOCHAT AI</span>
						<div className="flex gap-2 items-center">
							<select
								className="bg-cyan-950/80 text-cyan-300 border border-cyan-700 rounded px-2 py-1 ml-2 font-mono"
								value={model}
								onChange={(e) => setModel(e.target.value)}
								disabled={loading}
								aria-label="Select AI Model"
							>
								{MODELS.map((m) => (
									<option key={m.value} value={m.value}>
										{m.label}
									</option>
								))}
							</select>
							<button
								className="ml-2 p-2 rounded hover:bg-cyan-900/60"
								onClick={() => setShowSettings(true)}
								aria-label="Settings"
							>
								<Settings size={18} className="text-cyan-300" />
							</button>
							<button
								className="ml-2 p-2 rounded hover:bg-cyan-900/60"
								onClick={clearChat}
								disabled={loading}
								aria-label="Clear Chat"
							>
								<Trash2 size={18} className="text-cyan-300" />
							</button>
						</div>
					</div>
					<div className="flex-1 overflow-y-auto space-y-4 mb-4 custom-scrollbar">
						{messages.map((msg, i) => (
							<div key={i} className={`flex ${msg.user === "user" ? "justify-end" : "justify-start"}`}>
								<div
									className={`relative group rounded-xl px-5 py-3 max-w-[70%] font-mono text-base shadow-lg transition-all duration-300 ${
										msg.user === "user"
											? "bg-gradient-to-br from-cyan-500/80 to-blue-700/80 text-black border-2 border-cyan-400/60"
											: "bg-gradient-to-br from-[#232526]/80 to-[#0f2027]/80 text-cyan-200 border border-cyan-700/40"
									}`}
								>
									<span className="block text-xs opacity-60 mb-1 tracking-widest">
										{msg.user === "user" ? "YOU" : "AI"}
									</span>
									{editingIdx === i ? (
										<div className="flex gap-2 items-center">
											<input
												className="flex-1 rounded px-2 py-1 text-black"
												value={editInput}
												onChange={(e) => setEditInput(e.target.value)}
												autoFocus
											/>
											<button className="p-1" onClick={() => saveEdit(i)} aria-label="Save"><Check size={16} /></button>
											<button className="p-1" onClick={cancelEdit} aria-label="Cancel"><X size={16} /></button>
										</div>
									) : (
										<span className="whitespace-pre-line sci-fi-text-glow">{msg.content}</span>
									)}
									{msg.user === "user" && editingIdx !== i && (
										<button
											className="ml-2 p-1 rounded hover:bg-cyan-700/40"
											onClick={() => startEdit(i)}
											aria-label="Edit Message"
										>
											<Edit2 size={14} className="text-cyan-400" />
										</button>
									)}
								</div>
							</div>
						))}
						<div ref={messagesEndRef} />
					</div>
					<div className="flex gap-2 items-center mt-2">
						<input
							className="flex-1 rounded-lg px-4 py-2 bg-cyan-950/80 text-cyan-100 border border-cyan-700 focus:outline-none focus:ring-2 focus:ring-cyan-400 font-mono placeholder-cyan-400/60"
							type="text"
							placeholder="Type your message..."
							value={input}
							onChange={(e) => setInput(e.target.value)}
							onKeyDown={(e) => e.key === "Enter" && sendMessage()}
							disabled={loading}
						/>
						<button
							className="bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 rounded-lg p-2 disabled:opacity-50 shadow"
							onClick={sendMessage}
							disabled={loading || !input.trim()}
							aria-label="Send"
						>
							<Send size={20} className="text-black" />
						</button>
					</div>
				</div>

				{/* Settings Modal using Headless UI Dialog */}
				<Transition.Root show={showSettings} as={Fragment}>
					<Dialog as="div" className="relative z-50" onClose={setShowSettings}>
						<Transition.Child
							as={Fragment}
							enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100"
							leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0"
						>
							<div className="fixed inset-0 bg-black/80 transition-opacity" />
						</Transition.Child>
						<div className="fixed inset-0 z-50 flex items-center justify-center p-4">
							<Transition.Child
								as={Fragment}
								enter="ease-out duration-300" enterFrom="opacity-0 scale-95" enterTo="opacity-100 scale-100"
								leave="ease-in duration-200" leaveFrom="opacity-100 scale-100" leaveTo="opacity-0 scale-95"
							>
								<Dialog.Panel className="bg-gradient-to-br from-[#232526] to-[#0f2027] rounded-xl p-6 w-full max-w-md shadow-2xl border border-cyan-400/30 relative">
									<button
										className="absolute top-2 right-2 p-1"
										onClick={() => setShowSettings(false)}
										aria-label="Close"
									>
										<X size={20} className="text-cyan-300" />
									</button>
									<Dialog.Title className="text-lg font-bold mb-4 text-cyan-300 font-mono tracking-widest">Settings</Dialog.Title>
									<label className="block mb-2 text-sm text-cyan-200">System Prompt</label>
									<textarea
										className="w-full rounded p-2 bg-cyan-950/80 text-cyan-100 border border-cyan-700 mb-4 font-mono"
										value={systemPrompt}
										onChange={(e) => setSystemPrompt(e.target.value)}
										rows={3}
										placeholder="e.g. You are a helpful sci-fi AI assistant."
									/>
									<button
										className="bg-gradient-to-r from-cyan-400 to-blue-600 hover:from-cyan-300 hover:to-blue-500 rounded px-4 py-2 text-black font-bold shadow"
										onClick={() => setShowSettings(false)}
									>
										Save
									</button>
								</Dialog.Panel>
							</Transition.Child>
						</div>
					</Dialog>
				</Transition.Root>
			</main>
		</div>
	);
}

// Add this to your styles (e.g. globals.css):
// .custom-scrollbar::-webkit-scrollbar { width: 8px; background: transparent; }
// .custom-scrollbar::-webkit-scrollbar-thumb { background: #00fff7; border-radius: 8px; }
// .sci-fi-text-glow { text-shadow: 0 0 8px #00fff7, 0 0 2px #fff; }
// .drop-shadow-glow { filter: drop-shadow(0 0 8px #00fff7); }
