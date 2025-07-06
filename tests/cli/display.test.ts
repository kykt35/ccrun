import { DisplayManager } from '../../src/cli/display';
import { CCRunResult } from '../../src/core/types';

describe('DisplayManager', () => {
  describe('formatMessage', () => {
    it('should format system messages', () => {
      const message = {
        type: 'system',
        session_id: 'test-session',
        tools: ['Read', 'Write']
      };

      const formatted = DisplayManager.formatMessage(message);

      expect(formatted).toContain('🔧 SYSTEM');
      expect(formatted).toContain('test-session');
      expect(formatted).toContain('Read, Write');
    });

    it('should format assistant messages', () => {
      const message = {
        type: 'assistant',
        message: {
          content: [
            { type: 'text', text: 'Hello, I can help you with that.' }
          ]
        }
      };

      const formatted = DisplayManager.formatMessage(message);

      expect(formatted).toContain('🤖 ASSISTANT');
      expect(formatted).toContain('Hello, I can help you with that.');
    });

    it('should format user messages', () => {
      const message = {
        type: 'user',
        message: {
          content: [
            { type: 'text', text: 'Can you help me?' }
          ]
        }
      };

      const formatted = DisplayManager.formatMessage(message);

      expect(formatted).toContain('👤 USER');
      expect(formatted).toContain('Can you help me?');
    });

    it('should format result messages', () => {
      const message = {
        type: 'result',
        subtype: 'success',
        result: 'Task completed',
        usage: {
          input_tokens: 100,
          output_tokens: 50
        }
      };

      const formatted = DisplayManager.formatMessage(message);

      expect(formatted).toContain('📊 RESULT');
      expect(formatted).toContain('✅ Task completed successfully');
      expect(formatted).toContain('Task completed');
    });

    it('should handle tool use content', () => {
      const message = {
        type: 'assistant',
        message: {
          content: [
            {
              type: 'tool_use',
              name: 'Read',
              input: { file: 'test.txt' }
            }
          ]
        }
      };

      const formatted = DisplayManager.formatMessage(message);

      expect(formatted).toContain('🔧 Tool: Read');
      expect(formatted).toContain('test.txt');
    });

    it('should handle TodoWrite tool specially', () => {
      const message = {
        type: 'assistant',
        message: {
          content: [
            {
              type: 'tool_use',
              name: 'TodoWrite',
              input: {
                todos: [
                  { content: 'Task 1', status: 'pending' },
                  { content: 'Task 2', status: 'completed' }
                ]
              }
            }
          ]
        }
      };

      const formatted = DisplayManager.formatMessage(message);

      expect(formatted).toContain('🔧 Tool: TodoWrite');
      expect(formatted).toContain('• Task 1 (pending)');
      expect(formatted).toContain('• Task 2 (completed)');
    });

    it('should return empty string for null message', () => {
      const formatted = DisplayManager.formatMessage(null);
      expect(formatted).toBe('');
    });
  });

  describe('formatError', () => {
    it('should format basic error', () => {
      const error = new Error('Test error message');
      const formatted = DisplayManager.formatError(error);

      expect(formatted).toContain('❌ Error occurred:');
      expect(formatted).toContain('Test error message');
    });

    it('should include stack trace in debug mode', () => {
      const originalDebug = process.env.DEBUG;
      process.env.DEBUG = 'true';

      const error = new Error('Test error');
      const formatted = DisplayManager.formatError(error);

      expect(formatted).toContain('Stack trace:');

      process.env.DEBUG = originalDebug;
    });
  });

  describe('formatUsage', () => {
    it('should format usage statistics', () => {
      const usage = {
        input_tokens: 1000,
        output_tokens: 500,
        total_tokens: 1500,
        cost: 0.0234
      };

      const formatted = DisplayManager.formatUsage(usage);

      expect(formatted).toContain('📊 Usage Summary:');
      expect(formatted).toContain('Input tokens: 1,000');
      expect(formatted).toContain('Output tokens: 500');
      expect(formatted).toContain('Total tokens: 1,500');
      expect(formatted).toContain('$0.0234');
    });

    it('should return empty string for null usage', () => {
      const formatted = DisplayManager.formatUsage(null);
      expect(formatted).toBe('');
    });

    it('should handle partial usage data', () => {
      const usage = {
        input_tokens: 100
      };

      const formatted = DisplayManager.formatUsage(usage);

      expect(formatted).toContain('Input tokens: 100');
      expect(formatted).not.toContain('Output tokens:');
    });
  });

  describe('formatSessionInfo', () => {
    it('should format session information', () => {
      const sessionId = 'test-session-123';
      const formatted = DisplayManager.formatSessionInfo(sessionId);

      expect(formatted).toContain('🔗 Session ID: test-session-123');
      expect(formatted).toContain('💡 Continue with:');
      expect(formatted).toContain('ccrun --continue');
      expect(formatted).toContain('ccrun --resume test-session-123');
    });
  });

  describe('formatResult', () => {
    it('should format successful result', () => {
      const result: CCRunResult = {
        success: true,
        messages: [
          {
            id: 'msg1',
            timestamp: new Date(),
            type: 'user',
            content: 'Hello'
          }
        ],
        sessionId: 'session-123'
      };

      const formatted = DisplayManager.formatResult(result);

      expect(formatted).toContain('✅ Task completed successfully');
      expect(formatted).toContain('Session: session-123');
      expect(formatted).toContain('Messages: 1 exchanged');
    });

    it('should format failed result', () => {
      const result: CCRunResult = {
        success: false,
        messages: [],
        error: 'Something went wrong'
      };

      const formatted = DisplayManager.formatResult(result);

      expect(formatted).toContain('❌ Task failed');
      expect(formatted).toContain('Error: Something went wrong');
    });
  });

  describe('clearLine', () => {
    it('should call process.stdout.write with clear sequence', () => {
      const writeSpy = jest.spyOn(process.stdout, 'write').mockImplementation();

      DisplayManager.clearLine();

      expect(writeSpy).toHaveBeenCalledWith('\r\x1b[K');

      writeSpy.mockRestore();
    });
  });

  describe('showSpinner and stopSpinner', () => {
    beforeEach(() => {
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.useRealTimers();
    });

    it('should start and stop spinner', () => {
      const writeSpy = jest.spyOn(process.stdout, 'write').mockImplementation();

      const spinner = DisplayManager.showSpinner('Loading...');

      // Fast forward time to trigger spinner animation
      jest.advanceTimersByTime(100);

      expect(writeSpy).toHaveBeenCalledWith(expect.stringContaining('Loading...'));

      DisplayManager.stopSpinner(spinner);

      writeSpy.mockRestore();
    });
  });
});