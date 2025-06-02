import React from "react";
import { Badge } from "@/components/ui/badge";
import { Clock, Coins, Code } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ClaudeLogEntry, ToolUseContent } from "../../types";

interface MessageHeaderProps {
  entry: ClaudeLogEntry;
  messageType: "user" | "assistant" | "tool_result";
  getMessageTypeDisplay: (type: "user" | "assistant" | "tool_result") => {
    label: string;
    icon: any;
    color: string;
  };
  getToolsUsed: (entry: ClaudeLogEntry) => ToolUseContent[];
  getEntryPreview: (entry: ClaudeLogEntry) => string;
  formatTimestamp: (timestamp: string) => string;
  formatDuration: (ms?: number) => string | null;
  formatCost: (cost?: number) => string | null;
  toolIcons: Record<string, React.ReactNode>;
}

export function MessageHeader({
  entry,
  messageType,
  getMessageTypeDisplay,
  getToolsUsed,
  getEntryPreview,
  formatTimestamp,
  formatDuration,
  formatCost,
  toolIcons,
}: MessageHeaderProps) {
  const { icon: Icon, color } = getMessageTypeDisplay(messageType);
  
  return (
    <div className="flex items-center justify-between w-full mr-4">
      <div className="flex items-center gap-3 min-w-0 flex-1">
        <Icon className={cn("h-5 w-5 flex-shrink-0", color)} />
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
                      {toolIcons[tool.name] || <Code className="h-3 w-3" />}
                      {tool.name}
                    </Badge>
                  ))}
                {getToolsUsed(entry).length > 3 && (
                  <Badge variant="outline" className="text-xs h-5 px-1.5">
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
        {entry.type === "assistant" && entry.durationMs && (
          <div className="flex items-center gap-1">
            <Clock className="h-3 w-3" />
            {formatDuration(entry.durationMs)}
          </div>
        )}
        {entry.type === "assistant" && entry.costUSD && (
          <div className="flex items-center gap-1">
            <Coins className="h-3 w-3" />
            {formatCost(entry.costUSD)}
          </div>
        )}
      </div>
    </div>
  );
}