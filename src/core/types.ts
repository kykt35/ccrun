export interface CCRunConfig {
  prompt?: string;
  inputFile?: string;
  maxTurns?: number;
  sessionId?: string;
  allowedTools?: string[];
  disallowedTools?: string[];
  continue?: boolean;
  resume?: string;
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';
  customSystemPrompt?: string;
}

export interface ToolPermissions {
  allowedTools?: string[];
  disallowedTools?: string[];
}

export interface Settings {
  permissions?: {
    allow?: string[];
    deny?: string[];
  };
  maxTurns?: number;
  outputFile?: string;
  outputFormat?: 'json' | 'text';
  output?: {
    enabled?: boolean;
    directory?: string;
    filename?: {
      prefix?: string;
      suffix?: string;
    };
  };
  customSystemPrompt?: string; // @deprecated Use systemPrompt instead
  systemPrompt?: string;
  [key: string]: any;
}

export interface Session {
  id: string;
  created: Date;
  lastUsed: Date;
  messages: Message[];
  config: CCRunConfig;
  status: 'active' | 'completed' | 'error';
}

export interface Message {
  id: string;
  timestamp: Date;
  type: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: Record<string, any>;
}

export interface CCRunResult {
  success: boolean;
  messages: Message[];
  sessionId?: string;
  error?: string;
  metadata?: Record<string, any>;
}

export interface StreamChunk {
  type: 'message' | 'error' | 'completion';
  content: string;
  metadata?: Record<string, any>;
}

export interface NonNullableUsage {
  input_tokens: number;
  output_tokens: number;
  total_tokens: number;
}

export type SDKResultMessage =
  | {
      type: 'result';
      subtype: 'success';
      duration_ms: number;
      duration_api_ms: number;
      is_error: boolean;
      num_turns: number;
      result: string;
      session_id: string;
      total_cost_usd: number;
      usage: NonNullableUsage;
    }
  | {
      type: 'result';
      subtype: 'error_max_turns' | 'error_during_execution';
      duration_ms: number;
      duration_api_ms: number;
      is_error: boolean;
      num_turns: number;
      session_id: string;
      total_cost_usd: number;
      usage: NonNullableUsage;
    };

export interface ExtendedOutputData {
  result: SDKResultMessage;
  metadata: {
    timestamp: string;
    config: CCRunConfig;
  };
}
