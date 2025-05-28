"use client";

import { useEffect, useState } from "react";

const initialIntegrations = [
	{ name: "Linear", key: "linear", connected: false },
	{ name: "Notion", key: "notion", connected: false },
];

// Example type for integration status
interface IntegrationStatus {
  key: string;
  connected: boolean;
  notion_database_id?: string;
}

export default function SettingsPage() {
	const [showIntegrations, setShowIntegrations] = useState(false);
	const [integrations, setIntegrations] = useState(initialIntegrations);
	const [loadingIdx, setLoadingIdx] = useState<number | null>(null);
	const [integrationMsg, setIntegrationMsg] = useState<string>("");

	// Add state for Notion databases and selected database
	const [notionDatabases, setNotionDatabases] = useState<unknown[]>([]);
	const [selectedNotionDb, setSelectedNotionDb] = useState<string>("");

	// Fetch integration status from backend
	useEffect(() => {
		if (!showIntegrations) return;
		fetch("/api/integrations/status")
			.then(async (res) => {
				if (!res.ok) return [];
				try {
					return await res.json();
				} catch {
					return [];
				}
			})
			.then((data) => {
				if (data && Array.isArray(data)) {
					setIntegrations((prev) =>
						prev.map((intg) => {
							// Replace (d as any) with type guard
							const found = data.find((d: unknown): d is IntegrationStatus => typeof d === 'object' && d !== null && 'key' in d && 'connected' in d && typeof (d as IntegrationStatus).key === 'string' && (d as IntegrationStatus).key === intg.key);
							return found ? { ...intg, connected: found.connected } : intg;
						})
					);
				}
			});
	}, [showIntegrations]);

	// Fetch Notion databases after connecting
	useEffect(() => {
		if (showIntegrations) {
			fetch("/api/integrations/notion/databases")
				.then((res) => res.json())
				.then((data) => {
					if (data && data.results) setNotionDatabases(data.results);
				});
		}
	}, [showIntegrations]);

	// Fetch user's saved Notion database
	useEffect(() => {
		if (showIntegrations) {
			fetch("/api/integrations/status")
				.then((res) => res.json())
				.then((data) => {
					// Replace (d as any) with type guard for Notion
					const notion = data.find((d: unknown): d is IntegrationStatus => typeof d === 'object' && d !== null && 'key' in d && (d as IntegrationStatus).key === "notion");
					if (notion && notion.notion_database_id) {
						setSelectedNotionDb(notion.notion_database_id);
					}
				});
		}
	}, [showIntegrations]);

	// Save selected Notion database when changed
	useEffect(() => {
		if (selectedNotionDb) {
			fetch("/api/integrations/notion/database", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ databaseId: selectedNotionDb }),
			});
		}
	}, [selectedNotionDb]);

	// Real connect/disconnect logic
	const handleIntegrationConnect = (key: string) => {
		window.location.href = `/api/integrations/${key}/connect`;
	};
	const handleIntegrationDisconnect = async (idx: number, key: string) => {
		setLoadingIdx(idx);
		setIntegrationMsg("");
		await fetch(`/api/integrations/${key}/disconnect`, { method: "POST" });
		setIntegrations((prev) =>
			prev.map((item, i) => (i === idx ? { ...item, connected: false } : item))
		);
		setLoadingIdx(null);
		setIntegrationMsg(`${integrations[idx].name} disconnected.`);
	};

	// Add a refresh handler for integrations status
	const handleRefreshIntegrations = () => {
		fetch("/api/integrations/status")
			.then(async (res) => {
				if (!res.ok) return [];
				try {
					return await res.json();
				} catch {
					return [];
				}
			})
			.then((data) => {
				if (data && Array.isArray(data)) {
					setIntegrations((prev) =>
						prev.map((intg) => {
							const found = data.find(
								(d: unknown): d is IntegrationStatus =>
									typeof d === 'object' &&
									d !== null &&
									'key' in d &&
									typeof (d as IntegrationStatus).key === 'string' &&
									(d as IntegrationStatus).key === intg.key
							);
							return found ? { ...intg, connected: found.connected } : intg;
						})
					);
				}
			});
	};

	return (
		<div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black p-8">
			<div className="w-full max-w-md bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 border border-border">
				<h1 className="text-2xl font-bold mb-6">Settings</h1>
				<div className="space-y-6">
					{/* Integrations Button */}
					<button
						className="w-full bg-blue-600 text-white font-semibold px-4 py-2 rounded shadow hover:bg-blue-700 transition-colors mb-4"
						onClick={() => setShowIntegrations(true)}
					>
						Integrations
					</button>
					{/* Theme Setting */}
					<div>
						<label className="block text-sm font-medium mb-1">Theme</label>
						<select className="w-full border rounded px-2 py-1">
							<option value="system">System</option>
							<option value="light">Light</option>
							<option value="dark">Dark</option>
						</select>
					</div>
					{/* Language Setting */}
					<div>
						<label className="block text-sm font-medium mb-1">Language</label>
						<select className="w-full border rounded px-2 py-1">
							<option value="en">English</option>
							<option value="fr">French</option>
							<option value="es">Spanish</option>
						</select>
					</div>
				</div>
			</div>
			{/* Integrations Modal */}
			{showIntegrations && (
				<div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
					<div className="bg-white dark:bg-gray-900 rounded-lg shadow-lg p-8 max-w-lg w-full border border-border relative">
						<button
							className="absolute top-2 right-2 text-gray-500 hover:text-gray-800 dark:hover:text-white text-2xl"
							onClick={() => setShowIntegrations(false)}
							aria-label="Close"
						>
							&times;
						</button>
						<h2 className="text-xl font-bold mb-4">Integrations</h2>
						<button
							className="absolute top-2 left-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded hover:bg-blue-200"
							onClick={handleRefreshIntegrations}
							aria-label="Refresh integrations status"
						>
							Refresh
						</button>
						<p className="mb-4 text-gray-700 dark:text-gray-300">
							Connect your account to third-party services and tools. Once connected, you can create and manage issues, projects, and content directly from your messages.
						</p>
						<div className="space-y-4">
							{integrations.map((item, idx) => (
								<div key={item.key} className="flex items-center justify-between p-3 border rounded">
									<div>
										<span className="font-medium">{item.name}</span>
										<div className="text-xs text-muted-foreground mt-1">
											{item.key === "linear" && "Create issues and manage projects from chat messages."}
											{item.key === "notion" && "Sync and create Notion pages from chat messages."}
										</div>
									</div>
									<div className="flex items-center gap-2">
										<span className={`text-xs font-semibold px-2 py-1 rounded ${item.connected ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>{item.connected ? 'Connected' : 'Not Connected'}</span>
										{item.connected ? (
											<button
												className={`px-3 py-1 rounded transition text-white font-semibold bg-green-600 hover:bg-green-700 ${loadingIdx === idx ? 'opacity-60 cursor-wait' : ''}`}
												onClick={() => handleIntegrationDisconnect(idx, item.key)}
												disabled={loadingIdx === idx}
											>
												{loadingIdx === idx ? 'Disconnecting...' : 'Disconnect'}
											</button>
										) : (
											<button
												className={`px-3 py-1 rounded transition text-white font-semibold bg-blue-600 hover:bg-blue-700 ${loadingIdx === idx ? 'opacity-60 cursor-wait' : ''}`}
												onClick={() => handleIntegrationConnect(item.key)}
												disabled={loadingIdx === idx}
											>
												{loadingIdx === idx ? 'Connecting...' : 'Connect'}
											</button>
										)}
									</div>
									{/* In the Integrations Modal, after Notion connect button: */}
									{item.key === "notion" && item.connected && (
										<div className="mt-2">
											<label className="block text-xs font-medium mb-1">Select Notion Database</label>
											<select
												className="w-full border rounded px-2 py-1 text-xs"
												value={selectedNotionDb}
												onChange={(e) => setSelectedNotionDb(e.target.value)}
											>
												<option value="">-- Select a database --</option>
												{notionDatabases.map((db) => {
  if (typeof db === 'object' && db !== null && 'id' in db) {
    const dbId = (db as { id: string }).id;
    const dbTitle = (typeof db === 'object' && db !== null && 'title' in db && Array.isArray((db as { title?: { plain_text?: string }[] }).title) && (db as { title?: { plain_text?: string }[] }).title?.[0]?.plain_text)
      ? (db as { title: { plain_text: string }[] }).title[0].plain_text
      : dbId;
    return (
      <option key={dbId} value={dbId}>{dbTitle}</option>
    );
  }
  return null;
})}
											</select>
										</div>
									)}
								</div>
							))}
						</div>
						{integrationMsg && (
							<div className="mt-4 text-center text-blue-600 dark:text-blue-400 font-medium">{integrationMsg}</div>
						)}
					</div>
				</div>
			)}
		</div>
	);
}
