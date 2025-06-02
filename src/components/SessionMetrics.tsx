import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  BarChart3,
  Clock,
  Coins,
  MessageSquare,
  Settings,
  Zap,
} from "lucide-react";
import type { ClaudeLogEntry, AssistantContent, ToolUseContent } from "../types";

interface SessionMetricsProps {
  entries: ClaudeLogEntry[];
}

export function SessionMetrics({ entries }: SessionMetricsProps) {
  // Calculate metrics
  const metrics = {
    totalMessages: entries.length,
    userMessages: entries.filter((e) => e.type === "user").length,
    assistantMessages: entries.filter((e) => e.type === "assistant").length,
    totalTokens: {
      input: 0,
      output: 0,
      cache: 0,
    },
    totalCost: 0,
    totalDuration: 0,
    toolCalls: {} as Record<string, number>,
    totalToolCalls: 0,
  };

  // Calculate token usage, cost, duration, and tool calls
  entries.forEach((entry) => {
    if (entry.type === "assistant") {
      if (entry.message.usage) {
        metrics.totalTokens.input += entry.message.usage.input_tokens;
        metrics.totalTokens.output += entry.message.usage.output_tokens;
        metrics.totalTokens.cache += entry.message.usage.cache_read_input_tokens;
      }
      
      if (entry.costUSD) {
        metrics.totalCost += entry.costUSD;
      }
      
      if (entry.durationMs) {
        metrics.totalDuration += entry.durationMs;
      }

      // Count tool calls
      entry.message.content.forEach((content: AssistantContent) => {
        if (content.type === "tool_use") {
          const toolName = (content as ToolUseContent).name;
          metrics.toolCalls[toolName] = (metrics.toolCalls[toolName] || 0) + 1;
          metrics.totalToolCalls++;
        }
      });
    }
  });

  const formatDuration = (ms: number) => {
    if (ms < 1000) return `${ms}ms`;
    if (ms < 60000) return `${(ms / 1000).toFixed(1)}s`;
    return `${Math.floor(ms / 60000)}m ${Math.floor((ms % 60000) / 1000)}s`;
  };

  const formatCost = (cost: number) => `$${cost.toFixed(4)}`;

  const formatTokens = (tokens: number) => {
    if (tokens >= 1000) {
      return `${(tokens / 1000).toFixed(1)}k`;
    }
    return tokens.toString();
  };

  return (
    <div className="w-80 border-l bg-muted/20 p-4 space-y-4 overflow-y-auto">
      <div className="flex items-center gap-2">
        <BarChart3 className="h-5 w-5" />
        <h3 className="font-semibold">Session Metrics</h3>
      </div>

      {/* Message Overview */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            Messages
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total</span>
            <Badge variant="outline">{metrics.totalMessages}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">User</span>
            <Badge variant="outline" className="text-blue-600">
              {metrics.userMessages}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Assistant</span>
            <Badge variant="outline" className="text-green-600">
              {metrics.assistantMessages}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Token Usage */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Zap className="h-4 w-4" />
            Token Usage
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Input</span>
            <Badge variant="secondary">
              {formatTokens(metrics.totalTokens.input)}
            </Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Output</span>
            <Badge variant="secondary">
              {formatTokens(metrics.totalTokens.output)}
            </Badge>
          </div>
          {metrics.totalTokens.cache > 0 && (
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Cache</span>
              <Badge variant="secondary">
                {formatTokens(metrics.totalTokens.cache)}
              </Badge>
            </div>
          )}
          <Separator />
          <div className="flex justify-between font-medium">
            <span className="text-sm">Total</span>
            <Badge>
              {formatTokens(
                metrics.totalTokens.input + 
                metrics.totalTokens.output + 
                metrics.totalTokens.cache
              )}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Cost & Performance */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm flex items-center gap-2">
            <Coins className="h-4 w-4" />
            Cost & Performance
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Total Cost</span>
            <Badge variant="outline">{formatCost(metrics.totalCost)}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-muted-foreground">Duration</span>
            <Badge variant="outline" className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {formatDuration(metrics.totalDuration)}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Tool Usage */}
      {metrics.totalToolCalls > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm flex items-center gap-2">
              <Settings className="h-4 w-4" />
              Tool Usage
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex justify-between">
              <span className="text-sm text-muted-foreground">Total Calls</span>
              <Badge variant="outline">{metrics.totalToolCalls}</Badge>
            </div>
            <Separator />
            <div className="space-y-1">
              {Object.entries(metrics.toolCalls)
                .sort(([, a], [, b]) => b - a)
                .map(([tool, count]) => (
                  <div key={tool} className="flex justify-between">
                    <span className="text-xs text-muted-foreground truncate">
                      {tool}
                    </span>
                    <Badge variant="secondary" className="text-xs">
                      {count}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Session Info */}
      {entries.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm">Session Info</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-xs text-muted-foreground">
              <div>Started: {new Date(entries[0].timestamp).toLocaleString()}</div>
              <div>
                Ended: {new Date(entries[entries.length - 1].timestamp).toLocaleString()}
              </div>
              <div className="mt-2">
                Session ID: <code className="text-xs">{entries[0].sessionId.slice(0, 8)}...</code>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}