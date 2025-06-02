export interface ClaudeLogEntry {
  parentUuid: string | null;
  isSidechain: boolean;
  userType: string;
  cwd: string;
  sessionId: string;
  version: string;
  type: 'user' | 'assistant';
  message: UserMessage | AssistantMessage;
  uuid: string;
  timestamp: string;
  costUSD?: number;
  durationMs?: number;
  requestId?: string;
  toolUseResult?: ToolUseResult;
}

export interface UserMessage {
  role: 'user';
  content: string | ToolResultContent[];
}

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