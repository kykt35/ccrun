import { ClaudeWrapper } from '../../src/core/claude';
import { CCRunConfig } from '../../src/core/types';

// Mock dependencies
jest.mock('@anthropic-ai/claude-code', () => ({
  query: jest.fn()
}));

describe('ClaudeWrapper', () => {
  let claudeWrapper: ClaudeWrapper;

  beforeEach(() => {
    jest.clearAllMocks();
    claudeWrapper = new ClaudeWrapper();
  });

  describe('executeQuery', () => {
    it('should execute query and yield messages', async () => {
      const config: CCRunConfig = {
        prompt: 'test prompt',
        maxTurns: 10,
        allowedTools: ['Read', 'Write']
      };

      const mockQuery = require('@anthropic-ai/claude-code').query;
      
      // Mock the async generator
      const mockMessages = [
        { type: 'system', session_id: 'session123' },
        { type: 'assistant', message: { content: 'Hello' } }
      ];

      mockQuery.mockImplementation(async function* () {
        for (const message of mockMessages) {
          yield message;
        }
      });

      const generator = claudeWrapper.executeQuery('test prompt', config);
      const results = [];
      
      for await (const chunk of generator) {
        if ('success' in chunk) {
          // This is the final result
          expect(chunk.success).toBe(true);
          expect(chunk.sessionId).toBe('session123');
          expect(chunk.messages).toEqual(mockMessages);
          break;
        } else {
          results.push(chunk);
        }
      }

      expect(results).toEqual(mockMessages);
      expect(mockQuery).toHaveBeenCalledWith({
        prompt: 'test prompt',
        abortController: expect.any(AbortController),
        options: {
          allowedTools: ['Read', 'Write'],
          disallowedTools: undefined,
          maxTurns: 10,
          continue: undefined,
          resume: undefined
        }
      });
    });

    it('should handle errors gracefully', async () => {
      const config: CCRunConfig = { prompt: 'test prompt' };
      const mockQuery = require('@anthropic-ai/claude-code').query;
      
      mockQuery.mockImplementation(async function* () {
        throw new Error('API Error');
      });

      const generator = claudeWrapper.executeQuery('test prompt', config);
      
      for await (const chunk of generator) {
        if ('success' in chunk) {
          expect(chunk.success).toBe(false);
          expect(chunk.error).toBe('API Error');
          break;
        }
      }
    });
  });

  describe('cleanup', () => {
    it('should cleanup gracefully', async () => {
      await expect(claudeWrapper.cleanup()).resolves.not.toThrow();
    });
  });
});