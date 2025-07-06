import { query } from '@anthropic-ai/claude-code';
import { CCRunConfig, CCRunResult } from './types';

export class ClaudeWrapper {
  constructor() {}

  async *executeQuery(
    prompt: string,
    config: CCRunConfig
  ): AsyncGenerator<any, CCRunResult> {
    const messages: any[] = [];
    let error: string | undefined;
    let sessionId: string | undefined;

    try {
      const stream = query({
        prompt,
        abortController: new AbortController(),
        options: {
          allowedTools: config.allowedTools?.length ? config.allowedTools : undefined,
          disallowedTools: config.disallowedTools?.length ? config.disallowedTools : undefined,
          maxTurns: config.maxTurns,
          continue: config.continue,
          resume: config.resume
        }
      });

      for await (const chunk of stream) {
        // Extract session ID from system messages
        if (chunk.type === 'system' && chunk.session_id) {
          sessionId = chunk.session_id;
        }
        
        yield chunk;
        messages.push(chunk);
      }

    } catch (err) {
      error = err instanceof Error ? err.message : 'Unknown error occurred';
    }

    return {
      success: !error,
      messages,
      sessionId: sessionId || 'unknown',
      error,
      metadata: {
        timestamp: new Date(),
        sessionId: sessionId || 'unknown'
      }
    };
  }

  async cleanup(): Promise<void> {
    // Claude Code API doesn't require explicit cleanup
  }
}