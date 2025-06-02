import React from "react";
import { Badge } from "@/components/ui/badge";
import { Code } from "lucide-react";
import type { AssistantContent, AssistantMessage, ToolUseContent } from "../../types";

interface AssistantMessageProps {
  message: AssistantMessage;
  toolIcons: Record<string, React.ReactNode>;
}

export function AssistantMessage({ message, toolIcons }: AssistantMessageProps) {
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

  return (
    <div className="space-y-3">
      {renderContent(message.content)}
      {message.usage && (
        <div className="flex flex-wrap gap-2 text-xs text-muted-foreground pt-2">
          <Badge variant="secondary">
            Input: {message.usage.input_tokens} tokens
          </Badge>
          <Badge variant="secondary">
            Output: {message.usage.output_tokens} tokens
          </Badge>
          {message.usage.cache_read_input_tokens > 0 && (
            <Badge variant="secondary">
              Cache: {message.usage.cache_read_input_tokens} tokens
            </Badge>
          )}
        </div>
      )}
    </div>
  );
}