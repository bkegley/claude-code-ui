import React from "react";
import {
  FileText,
  Terminal,
  Search,
  Edit,
  FileEdit,
  Code,
  ListTodo,
  Globe,
  Bot,
  User,
  Settings,
} from "lucide-react";
import type { ClaudeLogEntry, ToolUseContent, TextContent, AssistantContent } from "../../types";

export const toolIcons: Record<string, React.ReactNode> = {
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

export const formatTimestamp = (timestamp: string) => {
  const date = new Date(timestamp);
  return date.toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

export const formatDuration = (ms?: number) => {
  if (!ms) return null;
  if (ms < 1000) return `${ms}ms`;
  return `${(ms / 1000).toFixed(1)}s`;
};

export const formatCost = (cost?: number) => {
  if (!cost) return null;
  return `$${cost.toFixed(4)}`;
};

export const getEntryPreview = (entry: ClaudeLogEntry) => {
  if (entry.type === "user") {
    const content = entry.message.content;
    if (typeof content === "string") {
      return content.slice(0, 100) + (content.length > 100 ? "..." : "");
    }
    return "Tool result content";
  }

  if (entry.type === "assistant") {
    const textContent = entry.message.content.find(
      (item: AssistantContent) => item.type === "text",
    ) as TextContent | undefined;
    const toolUses = entry.message.content.filter(
      (item: AssistantContent) => item.type === "tool_use",
    ) as ToolUseContent[];

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

export const getToolsUsed = (entry: ClaudeLogEntry) => {
  if (entry.type === "assistant") {
    return entry.message.content.filter(
      (item: AssistantContent) => item.type === "tool_use",
    ) as ToolUseContent[];
  }
  return [];
};

export const getMessageType = (
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

export const getMessageTypeDisplay = (
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