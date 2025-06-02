import { useMemo, useState } from "react";
import type { ClaudeLogEntry, AssistantContent, TextContent, ToolUseContent } from "../types";
import type { FilterState } from "../components/LogFilters";

const getMessageType = (entry: ClaudeLogEntry): "user" | "assistant" | "tool_result" => {
	if (entry.type === "user") {
		// Check if this is a tool result (user message with tool_result content)
		if (Array.isArray(entry.message.content) && 
			entry.message.content.some(content => content.type === "tool_result")) {
			return "tool_result";
		}
		return "user";
	}
	return "assistant";
};

export function useLogFilters(entries: ClaudeLogEntry[]) {
	const [filters, setFilters] = useState<FilterState>({
		searchTerm: "",
		messageType: "all",
		toolFilter: "",
		dateRange: "all",
	});

	const filteredEntries = useMemo(() => {
		return entries.filter((entry) => {
			// Search term filter
			if (filters.searchTerm) {
				const searchLower = filters.searchTerm.toLowerCase();
				let hasMatch = false;

				if (entry.type === "user" && typeof entry.message.content === "string") {
					hasMatch = entry.message.content.toLowerCase().includes(searchLower);
				} else if (entry.type === "assistant") {
					// Search in text content
					const textContent = entry.message.content.find(
						(item: AssistantContent) => item.type === "text"
					) as TextContent | undefined;
					if (textContent && textContent.text.toLowerCase().includes(searchLower)) {
						hasMatch = true;
					}

					// Search in tool names
					const toolUses = entry.message.content.filter(
						(item: AssistantContent) => item.type === "tool_use"
					) as ToolUseContent[];
					if (toolUses.some((tool) => tool.name.toLowerCase().includes(searchLower))) {
						hasMatch = true;
					}

					// Search in tool inputs (for file paths, commands, etc.)
					if (toolUses.some((tool) => 
						JSON.stringify(tool.input).toLowerCase().includes(searchLower)
					)) {
						hasMatch = true;
					}
				}

				// Search in tool results
				if (entry.toolUseResult && 
					JSON.stringify(entry.toolUseResult).toLowerCase().includes(searchLower)) {
					hasMatch = true;
				}

				if (!hasMatch) return false;
			}

			// Message type filter
			if (filters.messageType !== "all") {
				const entryType = getMessageType(entry);
				if (entryType !== filters.messageType) {
					return false;
				}
			}

			// Tool filter
			if (filters.toolFilter) {
				if (entry.type === "assistant") {
					const hasToolMatch = entry.message.content.some(
						(content: AssistantContent) =>
							content.type === "tool_use" && (content as ToolUseContent).name === filters.toolFilter
					);
					if (!hasToolMatch) return false;
				} else {
					return false; // User messages don't have tools
				}
			}

			// Date range filter
			if (filters.dateRange !== "all") {
				const entryDate = new Date(entry.timestamp);
				const now = new Date();
				const dayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());

				switch (filters.dateRange) {
					case "today":
						if (entryDate < dayStart) return false;
						break;
					case "week":
						const weekStart = new Date(dayStart);
						weekStart.setDate(dayStart.getDate() - 7);
						if (entryDate < weekStart) return false;
						break;
					case "month":
						const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
						if (entryDate < monthStart) return false;
						break;
				}
			}

			return true;
		});
	}, [entries, filters]);

	return {
		filters,
		setFilters,
		filteredEntries,
		totalEntries: entries.length,
		filteredCount: filteredEntries.length,
	};
}