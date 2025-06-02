import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { cn } from "@/lib/utils";
import type { ClaudeLogEntry, ToolResultContent } from "../types";

// Import extracted components
import { MessageHeader } from "./log-viewer/MessageHeader";
import { UserMessage } from "./log-viewer/UserMessage";
import { ToolResultMessage } from "./log-viewer/ToolResultMessage";
import { AssistantMessage } from "./log-viewer/AssistantMessage";
import { ToolResultDetails } from "./log-viewer/ToolResultDetails";

// Import utilities
import {
  toolIcons,
  formatTimestamp,
  formatDuration,
  formatCost,
  getEntryPreview,
  getToolsUsed,
  getMessageType,
  getMessageTypeDisplay,
} from "./log-viewer/utils";

interface LogViewerProps {
  entries: ClaudeLogEntry[];
}

export function LogViewer({ entries }: LogViewerProps) {
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
                  <MessageHeader
                    entry={entry}
                    messageType={messageType}
                    getMessageTypeDisplay={getMessageTypeDisplay}
                    getToolsUsed={getToolsUsed}
                    getEntryPreview={getEntryPreview}
                    formatTimestamp={formatTimestamp}
                    formatDuration={formatDuration}
                    formatCost={formatCost}
                    toolIcons={toolIcons}
                  />
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-3">
                    {/* User Message */}
                    {messageType === "user" &&
                      typeof entry.message.content === "string" && (
                        <UserMessage content={entry.message.content} />
                      )}

                    {/* Tool Result Message */}
                    {messageType === "tool_result" &&
                      Array.isArray(entry.message.content) && (
                        <ToolResultMessage content={entry.message.content as ToolResultContent[]} />
                      )}

                    {/* Assistant Message */}
                    {entry.type === "assistant" && (
                        <AssistantMessage
                          message={entry.message}
                          toolIcons={toolIcons}
                        />
                      )}

                    {/* Tool Result Details (legacy format) */}
                    <ToolResultDetails entry={entry} />
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