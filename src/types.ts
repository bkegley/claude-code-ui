// Base interface for common properties
interface BaseLogEntry {
  parentUuid: string | null;
  isSidechain: boolean;
  userType: string;
  cwd: string;
  sessionId: string;
  version: string;
  uuid: string;
  timestamp: string;
  toolUseResult?: ToolUseResult;
}

// User log entry with UserMessage
export interface UserLogEntry extends BaseLogEntry {
  type: 'user';
  message: UserMessage;
}

// Assistant log entry with AssistantMessage
export interface AssistantLogEntry extends BaseLogEntry {
  type: 'assistant';
  message: AssistantMessage;
  costUSD?: number;
  durationMs?: number;
  requestId?: string;
}

// Discriminated union of all log entry types
export type ClaudeLogEntry = UserLogEntry | AssistantLogEntry;

// User message with text content
export interface TextUserMessage {
  role: 'user';
  content: string;
}

// User message with tool result content
export interface ToolResultUserMessage {
  role: 'user';
  content: ToolResultContent[];
}

// Discriminated union for user messages
export type UserMessage = TextUserMessage | ToolResultUserMessage;

export interface AssistantMessage {
  id: string;
  type: 'message';
  role: 'assistant';
  model: string;
  content: AssistantContent[];
  stop_reason: 'tool_use' | 'stop_sequence' | null;
  stop_sequence: string | null;
  usage: Usage;
  ttftMs: number;
  service_tier: string;
}

export type AssistantContent = TextContent | ToolUseContent;

export interface TextContent {
  type: 'text';
  text: string;
}

export interface ToolUseContent {
  type: 'tool_use';
  id: string;
  name: string;
  input: Record<string, any>;
}

export interface ToolResultContent {
  tool_use_id: string;
  type: 'tool_result';
  content: string;
}

export interface Usage {
  input_tokens: number;
  cache_creation_input_tokens: number;
  cache_read_input_tokens: number;
  output_tokens: number;
  service_tier: string;
}

export interface ToolUseResult {
  oldTodos?: Todo[];
  newTodos?: Todo[];
  filenames?: string[];
  numFiles?: number;
  type?: string;
  file?: FileInfo;
  filePath?: string;
  oldString?: string;
  newString?: string;
  originalFile?: string;
  structuredPatch?: StructuredPatch[];
}

export interface Todo {
  id: string;
  content: string;
  status: 'pending' | 'in_progress' | 'completed';
  priority: 'high' | 'medium' | 'low';
}

export interface FileInfo {
  filePath: string;
  content: string;
  numLines: number;
  startLine: number;
  totalLines: number;
}

export interface StructuredPatch {
  oldStart: number;
  oldLines: number;
  newStart: number;
  newLines: number;
  lines: string[];
}