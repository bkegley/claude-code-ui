import { Badge } from "@/components/ui/badge";
import type { ClaudeLogEntry } from "../../types";

interface ToolResultDetailsProps {
  entry: ClaudeLogEntry;
}

export function ToolResultDetails({ entry }: ToolResultDetailsProps) {
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
}