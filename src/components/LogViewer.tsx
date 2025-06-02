import React from "react";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
	Accordion,
	AccordionContent,
	AccordionItem,
	AccordionTrigger,
} from "@/components/ui/accordion";
import type {
	ClaudeLogEntry,
	AssistantContent,
	ToolUseContent,
	TextContent,
} from "../types";
import { cn } from "@/lib/utils";
import {
	FileText,
	Terminal,
	Search,
	Edit,
	FileEdit,
	Code,
	ListTodo,
	Globe,
	AlertCircle,
	Clock,
	Coins,
	Bot,
	User,
	Settings,
} from "lucide-react";

interface LogViewerProps {
	entries: ClaudeLogEntry[];
}

const toolIcons: Record<string, React.ReactNode> = {
	Read: <FileText className="h-4 w-4" />,
	Bash: <Terminal className="h-4 w-4" />,
	Grep: <Search className="h-4 w-4" />,
	Edit: <Edit className="h-4 w-4" />,
	MultiEdit: <FileEdit className="h-4 w-4" />,
	Write: <FileText className="h-4 w-4" />,
	TodoWrite: <ListTodo className="h-4 w-4" />,
	TodoRead: <ListTodo className="h-4 w-4" />,
	WebFetch: <Globe className="h-4 w-4" />,
	Task: <Code className="h-4 w-4" />,
};

export function LogViewer({ entries }: LogViewerProps) {
	const formatTimestamp = (timestamp: string) => {
		const date = new Date(timestamp);
		return date.toLocaleTimeString("en-US", {
			hour: "2-digit",
			minute: "2-digit",
			second: "2-digit",
		});
	};

	const formatDuration = (ms?: number) => {
		if (!ms) return null;
		if (ms < 1000) return `${ms}ms`;
		return `${(ms / 1000).toFixed(1)}s`;
	};

	const formatCost = (cost?: number) => {
		if (!cost) return null;
		return `$${cost.toFixed(4)}`;
	};

	const renderToolUse = (tool: ToolUseContent) => {
		return (
			<div className="bg-muted/50 rounded-lg p-3 space-y-2">
				<div className="flex items-center gap-2">
					{toolIcons[tool.name] || <Code className="h-4 w-4" />}
					<span className="font-semibold">{tool.name}</span>
					<Badge variant="outline" className="text-xs">
						Tool Use
					</Badge>
				</div>
				{tool.input && Object.keys(tool.input).length > 0 && (
					<pre className="text-xs bg-background rounded p-2 overflow-x-auto">
						{JSON.stringify(tool.input, null, 2)}
					</pre>
				)}
			</div>
		);
	};

	const renderContent = (content: AssistantContent[]) => {
		return content.map((item, index) => {
			if (item.type === "text") {
				return (
					<div key={index} className="whitespace-pre-wrap">
						{item.text}
					</div>
				);
			}
			if (item.type === "tool_use") {
				return <div key={index}>{renderToolUse(item)}</div>;
			}
			return null;
		});
	};

	const renderToolResult = (entry: ClaudeLogEntry) => {
		if (!entry.toolUseResult) return null;

		return (
			<div className="bg-muted/30 rounded-lg p-3 space-y-2 text-sm">
				<Badge variant="outline" className="text-xs">
					Tool Result
				</Badge>
				<pre className="text-xs bg-background rounded p-2 overflow-x-auto max-h-40">
					{JSON.stringify(entry.toolUseResult, null, 2)}
				</pre>
			</div>
		);
	};

	const getEntryPreview = (entry: ClaudeLogEntry) => {
		if (entry.type === "user") {
			const content = entry.message.content;
			if (typeof content === "string") {
				return content.slice(0, 100) + (content.length > 100 ? "..." : "");
			}
			return "Tool result content";
		}

		if (entry.type === "assistant" && "content" in entry.message) {
			const textContent = entry.message.content.find(
				(item) => item.type === "text",
			) as TextContent;
			const toolUses = entry.message.content.filter(
				(item) => item.type === "tool_use",
			);

			if (textContent && toolUses.length === 0) {
				return (
					textContent.text.slice(0, 100) +
					(textContent.text.length > 100 ? "..." : "")
				);
			}

			if (textContent && toolUses.length > 0) {
				const preview = textContent.text.slice(0, 60);
				return preview + (textContent.text.length > 60 ? "..." : "");
			}

			if (toolUses.length > 0) {
				return `Used ${toolUses.length} tool${toolUses.length > 1 ? "s" : ""}: ${toolUses
					.map((t) => t.name)
					.join(", ")}`;
			}
		}

		return "Message content";
	};

	const getToolsUsed = (entry: ClaudeLogEntry) => {
		if (entry.type === "assistant" && "content" in entry.message) {
			return entry.message.content.filter(
				(item) => item.type === "tool_use",
			) as ToolUseContent[];
		}
		return [];
	};

	const getMessageType = (
		entry: ClaudeLogEntry,
	): "user" | "assistant" | "tool_result" => {
		if (entry.type === "user") {
			// Check if this is a tool result (user message with tool_result content)
			if (
				Array.isArray(entry.message.content) &&
				entry.message.content.some((content) => content.type === "tool_result")
			) {
				return "tool_result";
			}
			return "user";
		}
		return "assistant";
	};

	const getMessageTypeDisplay = (
		type: "user" | "assistant" | "tool_result",
	) => {
		switch (type) {
			case "user":
				return {
					label: "User",
					icon: User,
					color: "text-blue-600 dark:text-blue-400",
				};
			case "assistant":
				return {
					label: "Assistant",
					icon: Bot,
					color: "text-green-600 dark:text-green-400",
				};
			case "tool_result":
				return {
					label: "Tool Result",
					icon: Settings,
					color: "text-orange-600 dark:text-orange-400",
				};
		}
	};

	return (
		<ScrollArea className="h-full">
			<div className="p-4">
				<Accordion type="multiple" className="space-y-2">
					{entries.map((entry) => {
						const messageType = getMessageType(entry);
						const borderColor =
							messageType === "user"
								? "border-blue-200 dark:border-blue-800"
								: messageType === "assistant"
									? "border-green-200 dark:border-green-800"
									: "border-orange-200 dark:border-orange-800";

						return (
							<AccordionItem
								key={entry.uuid}
								value={entry.uuid}
								className={cn("border rounded-lg", borderColor)}
							>
								<AccordionTrigger className="px-4 py-3 hover:no-underline">
									<div className="flex items-center justify-between w-full mr-4">
										<div className="flex items-center gap-3 min-w-0 flex-1">
											{(() => {
												const { icon: Icon, color } =
													getMessageTypeDisplay(messageType);
												return (
													<Icon
														className={cn("h-5 w-5 flex-shrink-0", color)}
													/>
												);
											})()}
											<div className="text-left min-w-0 flex-1">
												<div className="flex items-center gap-2 mb-1">
													<span className="font-semibold text-sm">
														{getMessageTypeDisplay(messageType).label}
													</span>
													{getToolsUsed(entry).length > 0 && (
														<div className="flex gap-1">
															{getToolsUsed(entry)
																.slice(0, 3)
																.map((tool, idx) => (
																	<Badge
																		key={idx}
																		variant="outline"
																		className="text-xs h-5 px-1.5 flex items-center gap-1"
																	>
																		{toolIcons[tool.name] || (
																			<Code className="h-3 w-3" />
																		)}
																		{tool.name}
																	</Badge>
																))}
															{getToolsUsed(entry).length > 3 && (
																<Badge
																	variant="outline"
																	className="text-xs h-5 px-1.5"
																>
																	+{getToolsUsed(entry).length - 3}
																</Badge>
															)}
														</div>
													)}
												</div>
												<div className="text-xs text-muted-foreground line-clamp-2">
													{getEntryPreview(entry)}
												</div>
											</div>
										</div>
										<div className="flex items-center gap-3 text-xs text-muted-foreground flex-shrink-0">
											<span>{formatTimestamp(entry.timestamp)}</span>
											{entry.durationMs && (
												<div className="flex items-center gap-1">
													<Clock className="h-3 w-3" />
													{formatDuration(entry.durationMs)}
												</div>
											)}
											{entry.costUSD && (
												<div className="flex items-center gap-1">
													<Coins className="h-3 w-3" />
													{formatCost(entry.costUSD)}
												</div>
											)}
										</div>
									</div>
								</AccordionTrigger>
								<AccordionContent className="px-4 pb-4">
									<div className="space-y-3">
										{messageType === "user" &&
											typeof entry.message.content === "string" && (
												<div className="whitespace-pre-wrap bg-muted/30 rounded p-3">
													{entry.message.content}
												</div>
											)}
										{messageType === "tool_result" &&
											Array.isArray(entry.message.content) && (
												<div className="space-y-2">
													{entry.message.content.map(
														(content, idx) =>
															content.type === "tool_result" && (
																<div
																	key={idx}
																	className="bg-orange-50 dark:bg-orange-950/20 rounded p-3 space-y-2"
																>
																	<pre className="text-xs bg-background rounded p-2 overflow-x-auto max-h-60">
																		{content.content}
																	</pre>
																</div>
															),
													)}
												</div>
											)}
										{messageType === "assistant" &&
											"content" in entry.message && (
												<div className="space-y-3">
													{renderContent(entry.message.content)}
													{entry.message.usage && (
														<div className="flex flex-wrap gap-2 text-xs text-muted-foreground pt-2">
															<Badge variant="secondary">
																Input: {entry.message.usage.input_tokens} tokens
															</Badge>
															<Badge variant="secondary">
																Output: {entry.message.usage.output_tokens}{" "}
																tokens
															</Badge>
															{entry.message.usage.cache_read_input_tokens >
																0 && (
																<Badge variant="secondary">
																	Cache:{" "}
																	{entry.message.usage.cache_read_input_tokens}{" "}
																	tokens
																</Badge>
															)}
														</div>
													)}
												</div>
											)}
										{renderToolResult(entry)}
									</div>
								</AccordionContent>
							</AccordionItem>
						);
					})}
				</Accordion>
			</div>
		</ScrollArea>
	);
}
