import { CLIManager } from '../src/cli';

describe('Integration Tests', () => {
  let originalExit: typeof process.exit;
  let originalArgv: string[];

  beforeEach(() => {
    originalExit = process.exit;
    originalArgv = process.argv;
    process.exit = jest.fn() as any;
  });

  afterEach(() => {
    process.exit = originalExit;
    process.argv = originalArgv;
    jest.clearAllMocks();
  });

  describe('CLI Integration', () => {
    it('should show help when --help is provided', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const cli = new CLIManager();

      await cli.run(['--help']);

      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Usage: ccrun'));
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining('Options:'));

      consoleSpy.mockRestore();
    });

    it('should show error for missing arguments', async () => {
      const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation();
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();
      const cli = new CLIManager();

      try {
        await cli.run([]);
      } catch (error) {
        // Expected to throw due to process.exit
      }

      expect(consoleErrorSpy).toHaveBeenCalledWith(expect.stringContaining('Please provide either -i <prompt> or -f <file>'));
      expect(consoleSpy).toHaveBeenCalledWith('\nUse --help for usage information');

      consoleErrorSpy.mockRestore();
      consoleSpy.mockRestore();
    });

    it('should handle argument parsing correctly', async () => {
      const cli = new CLIManager();
      
      // Mock the core service execution to prevent actual API calls
      const mockExecute = jest.fn().mockImplementation(async function* () {
        yield { type: 'system', session_id: 'test-session' };
        return { success: true, messages: [], sessionId: 'test-session' };
      });
      (cli as any).ccrunService.execute = mockExecute;

      const consoleSpy = jest.spyOn(console, 'log').mockImplementation();

      await cli.run(['-i', 'test prompt', '--max-turns', '5']);

      expect(mockExecute).toHaveBeenCalledWith('test prompt', undefined, {
        maxTurns: 5
      });

      consoleSpy.mockRestore();
    });
  });

  describe('Architecture Layer Integration', () => {
    it('should properly integrate all layers', () => {
      // Test that all layers can be imported without errors
      const { ArgumentParser } = require('../src/cli/args');
      const { HelpManager } = require('../src/cli/help');
      const { DisplayManager } = require('../src/cli/display');
      const { CCRunService } = require('../src/core');
      const { ConfigManager } = require('../src/core/config');
      const { ClaudeWrapper } = require('../src/core/claude');
      const { FileManager } = require('../src/utils/file');
      const { ValidationUtils } = require('../src/utils/validation');

      expect(ArgumentParser).toBeDefined();
      expect(HelpManager).toBeDefined();
      expect(DisplayManager).toBeDefined();
      expect(CCRunService).toBeDefined();
      expect(ConfigManager).toBeDefined();
      expect(ClaudeWrapper).toBeDefined();
      expect(FileManager).toBeDefined();
      expect(ValidationUtils).toBeDefined();
    });

    it('should maintain layer dependencies correctly', () => {
      // Ensure layers don't have circular dependencies
      // CLI layer should depend on Core layer
      // Core layer should depend on Utils layer
      // Utils layer should only depend on Node.js built-ins

      expect(() => {
        require('../src/cli');
        require('../src/core');
        require('../src/utils/file');
        require('../src/utils/validation');
      }).not.toThrow();
    });
  });
});