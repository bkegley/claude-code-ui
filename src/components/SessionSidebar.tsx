import React from "react";
import {
	Sidebar,
	SidebarContent,
	SidebarGroup,
	SidebarGroupContent,
	SidebarGroupLabel,
	SidebarMenu,
	SidebarMenuButton,
	SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Badge } from "@/components/ui/badge";
import type { ClaudeLogEntry } from "../types";
import { cn } from "@/lib/utils";

interface SessionSidebarProps {
	entries: ClaudeLogEntry[];
	selectedSessionId: string | null;
	onSessionSelect: (sessionId: string) => void;
}

export function SessionSidebar({
	entries,
	selectedSessionId,
	onSessionSelect,
}: SessionSidebarProps) {
	// Group entries by session
	const sessions = React.useMemo(() => {
		const sessionMap = new Map<
			string,
			{ entries: ClaudeLogEntry[]; firstEntry: ClaudeLogEntry }
		>();

		entries.forEach((entry) => {
			// Only process entries with valid sessionId, timestamp, and cwd
			if (!entry.sessionId || !entry.timestamp || !entry.cwd) {
				return;
			}

			const existing = sessionMap.get(entry.sessionId);
			if (existing) {
				existing.entries.push(entry);
			} else {
				sessionMap.set(entry.sessionId, {
					entries: [entry],
					firstEntry: entry,
				});
			}
		});

		return Array.from(sessionMap.entries())
			.map(([sessionId, data]) => ({
				sessionId,
				entryCount: data.entries.length,
				timestamp: data.firstEntry.timestamp,
				cwd: data.firstEntry.cwd,
			}))
			.filter(session => session.sessionId && session.timestamp && session.cwd)
			.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
	}, [entries]);

	const formatTimestamp = (timestamp: string) => {
		const date = new Date(timestamp);
		return date.toLocaleString("en-US", {
			month: "short",
			day: "numeric",
			hour: "2-digit",
			minute: "2-digit",
		});
	};

	const formatCwd = (cwd: string) => {
		const parts = cwd.split("/");
		return parts.slice(-2).join("/");
	};


	return (
		<Sidebar>
			<SidebarContent>
				<SidebarGroup>
					<SidebarGroupLabel>Sessions</SidebarGroupLabel>
					<SidebarGroupContent>
						<SidebarMenu>
							{sessions.map((session) => (
								<SidebarMenuItem key={session.sessionId}>
									<SidebarMenuButton
										onClick={() => onSessionSelect(session.sessionId)}
										className={cn(
											"w-full justify-start h-auto py-3",
											selectedSessionId === session.sessionId && "bg-accent",
										)}
									>
										<div className="flex flex-col items-start gap-1 w-full">
											<div className="text-sm font-mono truncate w-full">
												{session.sessionId?.slice(0, 8)}...
											</div>
											<div className="flex items-center gap-2 text-xs text-muted-foreground">
												<span>{formatTimestamp(session.timestamp)}</span>
												<Badge variant="secondary" className="text-xs">
													{session.entryCount} entries
												</Badge>
											</div>
											<div className="text-xs text-muted-foreground truncate w-full">
												{formatCwd(session.cwd)}
											</div>
										</div>
									</SidebarMenuButton>
								</SidebarMenuItem>
							))}
						</SidebarMenu>
					</SidebarGroupContent>
				</SidebarGroup>
			</SidebarContent>
		</Sidebar>
	);
}
