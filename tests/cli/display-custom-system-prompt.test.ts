import { CLIManager } from '../../src/cli';

describe('CLIManager - Custom System Prompt Display', () => {
  let originalExit: typeof process.exit;
  let consoleSpy: jest.SpyInstance;
  let consoleErrorSpy: jest.SpyInstance;
  let cli: CLIManager;

  beforeEach(() => {
    originalExit = process.exit;
    process.exit = jest.fn() as any;
    consoleSpy = jest.spyOn(console, 'log').mockImplementation();
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
    cli = new CLIManager();

    // Mock the core service execution to prevent actual API calls
    const mockExecute = jest.fn().mockImplementation(async function* () {
      yield { 
        type: 'system', 
        subtype: 'init',
        session_id: 'test-session',
        tools: [],
        mcp_servers: [],
        model: 'claude-3-opus-20240229',
        permissionMode: 'default'
      };
      yield {
        type: 'result',
        subtype: 'success',
        duration_ms: 1000,
        duration_api_ms: 800,
        is_error: false,
        num_turns: 1,
        result: 'Test completed',
        session_id: 'test-session',
        total_cost_usd: 0.001,
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150
        }
      };
    });
    (cli as any).ccrunService.execute = mockExecute;
  });

  afterEach(() => {
    process.exit = originalExit;
    consoleSpy.mockRestore();
    consoleErrorSpy.mockRestore();
    jest.clearAllMocks();
  });

  it('should display custom system prompt when provided', async () => {
    await cli.run(['-i', 'test prompt', '--custom-system-prompt', 'You are an expert']);

    expect(consoleSpy).toHaveBeenCalledWith('customSystemPrompt: "You are an expert"');
  });

  it('should display truncated custom system prompt when longer than 50 characters', async () => {
    const longPrompt = 'You are a highly skilled TypeScript developer with expertise in modern web frameworks and best practices';
    await cli.run(['-i', 'test prompt', '--custom-system-prompt', longPrompt]);

    expect(consoleSpy).toHaveBeenCalledWith('customSystemPrompt: "You are a highly skilled TypeScript developer with..."');
  });

  it('should display custom system prompt with short form flag', async () => {
    await cli.run(['-i', 'test prompt', '-csp', 'Focus on security']);

    expect(consoleSpy).toHaveBeenCalledWith('customSystemPrompt: "Focus on security"');
  });

  it('should not display custom system prompt when not provided', async () => {
    await cli.run(['-i', 'test prompt']);

    const calls = consoleSpy.mock.calls.map(call => call[0]);
    const hasCustomSystemPromptCall = calls.some(call => 
      typeof call === 'string' && call.includes('customSystemPrompt:')
    );
    expect(hasCustomSystemPromptCall).toBe(false);
  });

  it('should pass custom system prompt to the core service', async () => {
    const mockExecute = (cli as any).ccrunService.execute;
    
    await cli.run(['-i', 'test prompt', '--custom-system-prompt', 'Custom prompt']);

    expect(mockExecute).toHaveBeenCalledWith('test prompt', undefined, 
      expect.objectContaining({
        customSystemPrompt: 'Custom prompt'
      })
    );
  });

  it('should display custom system prompt with other options', async () => {
    await cli.run([
      '-i', 'test prompt',
      '--custom-system-prompt', 'You are an expert',
      '--max-turns', '10',
      '--allowedTools', 'Read,Write'
    ]);

    expect(consoleSpy).toHaveBeenCalledWith('customSystemPrompt: "You are an expert"');
    expect(consoleSpy).toHaveBeenCalledWith('allowedTools: Read, Write');
  });
});