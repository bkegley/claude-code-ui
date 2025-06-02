import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import type { ClaudeLogEntry } from "../types";

export interface FilterState {
	searchTerm: string;
	messageType: "all" | "user" | "assistant" | "tool_result";
	toolFilter: string;
	dateRange: "all" | "today" | "week" | "month";
}

interface LogFiltersProps {
	entries: ClaudeLogEntry[];
	filters: FilterState;
	onFiltersChange: (filters: FilterState) => void;
}

export function LogFilters({ entries, filters, onFiltersChange }: LogFiltersProps) {
	// Extract unique tools from entries
	const availableTools = React.useMemo(() => {
		const toolSet = new Set<string>();
		entries.forEach((entry) => {
			if (entry.type === "assistant" && "content" in entry.message) {
				entry.message.content.forEach((content) => {
					if (content.type === "tool_use") {
						toolSet.add(content.name);
					}
				});
			}
		});
		return Array.from(toolSet).sort();
	}, [entries]);

	const updateFilter = (key: keyof FilterState, value: string) => {
		onFiltersChange({ ...filters, [key]: value });
	};

	const clearFilters = () => {
		onFiltersChange({
			searchTerm: "",
			messageType: "all",
			toolFilter: "",
			dateRange: "all",
		});
	};

	const hasActiveFilters = 
		filters.searchTerm !== "" ||
		filters.messageType !== "all" ||
		filters.toolFilter !== "" ||
		filters.dateRange !== "all";

	return (
		<div className="border-b p-4 space-y-4">
			<div className="flex items-center justify-between">
				<h3 className="font-medium">Filters</h3>
				{hasActiveFilters && (
					<button
						onClick={clearFilters}
						className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
					>
						<X className="h-3 w-3" />
						Clear all
					</button>
				)}
			</div>
			
			<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
				{/* Search */}
				<div className="space-y-2">
					<Label htmlFor="search" className="text-xs">Search messages</Label>
					<Input
						id="search"
						placeholder="Search content..."
						value={filters.searchTerm}
						onChange={(e) => updateFilter("searchTerm", e.target.value)}
						className="h-8"
					/>
				</div>

				{/* Message Type */}
				<div className="space-y-2">
					<Label className="text-xs">Message type</Label>
					<Select
						value={filters.messageType}
						onValueChange={(value) => updateFilter("messageType", value)}
					>
						<SelectTrigger className="h-8">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All messages</SelectItem>
							<SelectItem value="user">User only</SelectItem>
							<SelectItem value="assistant">Assistant only</SelectItem>
							<SelectItem value="tool_result">Tool results only</SelectItem>
						</SelectContent>
					</Select>
				</div>

				{/* Tool Filter */}
				<div className="space-y-2">
					<Label className="text-xs">Tool used</Label>
					<Select
						value={filters.toolFilter || "all"}
						onValueChange={(value) => updateFilter("toolFilter", value === "all" ? "" : value)}
					>
						<SelectTrigger className="h-8">
							<SelectValue placeholder="Any tool" />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">Any tool</SelectItem>
							{availableTools.map((tool) => (
								<SelectItem key={tool} value={tool}>
									{tool}
								</SelectItem>
							))}
						</SelectContent>
					</Select>
				</div>

				{/* Date Range */}
				<div className="space-y-2">
					<Label className="text-xs">Time period</Label>
					<Select
						value={filters.dateRange}
						onValueChange={(value) => updateFilter("dateRange", value)}
					>
						<SelectTrigger className="h-8">
							<SelectValue />
						</SelectTrigger>
						<SelectContent>
							<SelectItem value="all">All time</SelectItem>
							<SelectItem value="today">Today</SelectItem>
							<SelectItem value="week">This week</SelectItem>
							<SelectItem value="month">This month</SelectItem>
						</SelectContent>
					</Select>
				</div>
			</div>

			{/* Active filter badges */}
			{hasActiveFilters && (
				<div className="flex flex-wrap gap-2">
					{filters.searchTerm && (
						<Badge variant="secondary" className="text-xs">
							Search: "{filters.searchTerm}"
							<button
								onClick={() => updateFilter("searchTerm", "")}
								className="ml-1 hover:text-foreground"
							>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					)}
					{filters.messageType !== "all" && (
						<Badge variant="secondary" className="text-xs">
							Type: {filters.messageType}
							<button
								onClick={() => updateFilter("messageType", "all")}
								className="ml-1 hover:text-foreground"
							>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					)}
					{filters.toolFilter && (
						<Badge variant="secondary" className="text-xs">
							Tool: {filters.toolFilter}
							<button
								onClick={() => updateFilter("toolFilter", "")}
								className="ml-1 hover:text-foreground"
							>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					)}
					{filters.dateRange !== "all" && (
						<Badge variant="secondary" className="text-xs">
							Date: {filters.dateRange}
							<button
								onClick={() => updateFilter("dateRange", "all")}
								className="ml-1 hover:text-foreground"
							>
								<X className="h-3 w-3" />
							</button>
						</Badge>
					)}
				</div>
			)}
		</div>
	);
}