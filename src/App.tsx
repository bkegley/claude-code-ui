import { useState, useMemo } from "react";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { FileUpload } from "./components/FileUpload";
import { SessionSidebar } from "./components/SessionSidebar";
import { LogViewer } from "./components/LogViewer";
import { LogFilters } from "./components/LogFilters";
import { SessionMetrics } from "./components/SessionMetrics";
import { useLogFilters } from "./hooks/useLogFilters";
import type { ClaudeLogEntry } from "./types";

function App() {
	const [logEntries, setLogEntries] = useState<ClaudeLogEntry[]>([]);
	const [selectedSessionId, setSelectedSessionId] = useState<string | null>(
		null,
	);

	const handleFileLoad = (entries: ClaudeLogEntry[]) => {
		setLogEntries(entries);
		// Auto-select the first session
		const sessions = [...new Set(entries.map((e) => e.sessionId))];
		if (sessions.length > 0) {
			setSelectedSessionId(sessions[0]);
		}
	};

	const sessionEntries = useMemo(() => {
		if (!selectedSessionId) return [];
		return logEntries.filter((entry) => entry.sessionId === selectedSessionId);
	}, [logEntries, selectedSessionId]);

	const { filters, setFilters, filteredEntries, totalEntries, filteredCount } =
		useLogFilters(sessionEntries);

	return (
		<div className="h-screen w-full">
			{logEntries.length === 0 ? (
				<div className="flex min-h-screen flex-col items-center justify-center p-24">
					<h1 className="text-4xl font-bold mb-8">Claude Log Viewer</h1>
					<p className="text-muted-foreground mb-8">
						Load a Claude Code `jsonl` file to view your Claude conversation
						history
					</p>
					<FileUpload onFileLoad={handleFileLoad} />
				</div>
			) : (
				<SidebarProvider>
					<SessionSidebar
						entries={logEntries}
						selectedSessionId={selectedSessionId}
						onSessionSelect={setSelectedSessionId}
					/>
					<SidebarInset>
						<div className="flex h-full">
							<div className="flex flex-col flex-1">
								<div className="border-b p-4">
									<div className="flex items-center justify-between">
										<div>
											<h2 className="text-lg font-semibold">
												Session: {selectedSessionId?.slice(0, 8)}...
											</h2>
											<p className="text-xs text-muted-foreground">
												{filteredCount} of {totalEntries} messages
												{filteredCount !== totalEntries && " (filtered)"}
											</p>
										</div>
										<FileUpload onFileLoad={handleFileLoad} />
									</div>
								</div>
								<LogFilters
									entries={sessionEntries}
									filters={filters}
									onFiltersChange={setFilters}
								/>
								<div className="flex-1 overflow-hidden">
									<LogViewer entries={filteredEntries} />
								</div>
							</div>
							<SessionMetrics entries={sessionEntries} />
						</div>
					</SidebarInset>
				</SidebarProvider>
			)}
		</div>
	);
}

export default App;
