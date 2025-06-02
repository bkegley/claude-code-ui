import type { ToolResultContent } from "../../types";

interface ToolResultMessageProps {
  content: ToolResultContent[];
}

export function ToolResultMessage({ content }: ToolResultMessageProps) {
  return (
    <div className="space-y-2">
      {content.map(
        (item, idx) =>
          item.type === "tool_result" && (
            <div
              key={idx}
              className="bg-orange-50 dark:bg-orange-950/20 rounded p-3 space-y-2"
            >
              <pre className="text-xs bg-background rounded p-2 overflow-x-auto max-h-60">
                {item.content}
              </pre>
            </div>
          ),
      )}
    </div>
  );
}