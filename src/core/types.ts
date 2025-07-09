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
  output?: {
    enabled?: boolean;
    directory?: string;
    format?: 'json' | 'text';
    filename?: {
      useTimestamp?: boolean;
      prefix?: string;
      suffix?: string;
    };
  };
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

