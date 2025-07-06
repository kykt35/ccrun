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
      const options: any = {};
      if (config.allowedTools?.length) {
        options.allowedTools = config.allowedTools;
      }
      if (config.disallowedTools?.length) {
        options.disallowedTools = config.disallowedTools;
      }
      if (config.maxTurns !== undefined) {
        options.maxTurns = config.maxTurns;
      }
      if (config.continue !== undefined) {
        options.continue = config.continue;
      }
      if (config.resume !== undefined) {
        options.resume = config.resume;
      }

      const stream = query({
        prompt,
        abortController: new AbortController(),
        options
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

    const result: CCRunResult = {
      success: !error,
      messages,
      sessionId: sessionId || 'unknown',
      metadata: {
        timestamp: new Date(),
        sessionId: sessionId || 'unknown'
      }
    };

    if (error) {
      result.error = error;
    }

    return result;
  }

  async cleanup(): Promise<void> {
    // Claude Code API doesn't require explicit cleanup
  }
}