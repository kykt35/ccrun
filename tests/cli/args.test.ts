import { ArgumentParser, CLIArgs } from '../../src/cli/args';

describe('ArgumentParser', () => {
  describe('parseArgs', () => {
    it('should parse prompt argument with -i flag', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test prompt']);
      
      expect(args.prompt).toBe('test prompt');
      expect(args.inputFile).toBeUndefined();
    });

    it('should parse input file argument with -f flag', () => {
      const args = ArgumentParser.parseArgs(['-f', 'test.txt']);
      
      expect(args.inputFile).toBe('test.txt');
      expect(args.prompt).toBeUndefined();
    });

    it('should parse max turns argument', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--max-turns', '10']);
      
      expect(args.maxTurns).toBe(10);
    });

    it('should parse continue flag', () => {
      const args = ArgumentParser.parseArgs(['-c', '-i', 'test']);
      
      expect(args.continue).toBe(true);
    });

    it('should parse resume with session ID', () => {
      const args = ArgumentParser.parseArgs(['--resume', 'session123', '-i', 'test']);
      
      expect(args.sessionId).toBe('session123');
    });

    it('should parse allowed tools', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--allowedTools', 'Read,Write,Edit']);
      
      expect(args.allowedTools).toEqual(['Read', 'Write', 'Edit']);
    });

    it('should parse disallowed tools', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--disallowedTools', 'Bash,WebFetch']);
      
      expect(args.disallowedTools).toEqual(['Bash', 'WebFetch']);
    });

    it('should parse help flag', () => {
      const args = ArgumentParser.parseArgs(['-h']);
      
      expect(args.help).toBe(true);
    });

    it('should handle tools with spaces', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--allowedTools', 'Read, Write, Edit']);
      
      expect(args.allowedTools).toEqual(['Read', 'Write', 'Edit']);
    });

    it('should treat first unconsumed argument as prompt', () => {
      const args = ArgumentParser.parseArgs(['hello world', '--max-turns', '5']);
      
      expect(args.prompt).toBe('hello world');
      expect(args.maxTurns).toBe(5);
    });

    it('should handle multiple arguments correctly', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test prompt',
        '--max-turns', '15',
        '--allowedTools', 'Read,Write',
        '--disallowedTools', 'Bash',
        '--permission-mode', 'acceptEdits'
      ]);
      
      expect(args.prompt).toBe('test prompt');
      expect(args.maxTurns).toBe(15);
      expect(args.allowedTools).toEqual(['Read', 'Write']);
      expect(args.disallowedTools).toEqual(['Bash']);
      expect(args.permissionMode).toBe('acceptEdits');
    });

    it('should handle invalid max turns gracefully', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--max-turns', 'invalid']);
      
      expect(args.maxTurns).toBeUndefined();
    });

    it('should handle empty tool lists', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--allowedTools', '']);
      
      expect(args.allowedTools).toEqual([]);
    });

    it('should parse permission mode', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--permission-mode', 'plan']);
      
      expect(args.permissionMode).toBe('plan');
    });

    it('should parse all permission modes', () => {
      const modes = ['default', 'acceptEdits', 'bypassPermissions', 'plan'];
      
      modes.forEach(mode => {
        const args = ArgumentParser.parseArgs(['-i', 'test', '--permission-mode', mode]);
        expect(args.permissionMode).toBe(mode);
      });
    });

    it('should ignore invalid permission modes', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--permission-mode', 'invalid']);
      
      expect(args.permissionMode).toBeUndefined();
    });

    it('should parse settings file with --settingFile flag', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--settingFile', 'custom-settings.json']);
      
      expect(args.settingsFile).toBe('custom-settings.json');
    });

    it('should parse settings file with -s flag', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '-s', './config/settings.json']);
      
      expect(args.settingsFile).toBe('./config/settings.json');
    });

    it('should parse -o flag as auto-output (no file path accepted)', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '-o']);
      
      expect(args.outputEnabled).toBe(true);
      expect(args.outputFile).toBeUndefined();
    });

    it('should parse output file with --output-file flag', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--output-file', 'output.json']);
      
      expect(args.outputFile).toBe('output.json');
    });

    it('should parse -o without file path as auto-output', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '-o']);
      
      expect(args.outputEnabled).toBe(true);
      expect(args.outputFile).toBeUndefined();
    });

    it('should parse -o followed by another flag as auto-output', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '-o', '--output-format', 'text']);
      
      expect(args.outputEnabled).toBe(true);
      expect(args.outputFile).toBeUndefined();
      expect(args.outputFormat).toBe('text');
    });

    it('should parse output directory', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--output-dir', './results']);
      
      expect(args.outputDir).toBe('./results');
    });

    it('should parse output format json', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--output-format', 'json']);
      
      expect(args.outputFormat).toBe('json');
    });

    it('should parse output format text', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--output-format', 'text']);
      
      expect(args.outputFormat).toBe('text');
    });

    it('should ignore invalid output format', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--output-format', 'invalid']);
      
      expect(args.outputFormat).toBeUndefined();
    });

    it('should parse --output flag without file path as auto-output', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--output']);
      
      expect(args.outputEnabled).toBe(true);
      expect(args.outputFile).toBeUndefined();
    });

    it('should parse --output flag as auto-output (no file path accepted)', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--output']);
      
      expect(args.outputEnabled).toBe(true);
      expect(args.outputFile).toBeUndefined();
    });

    it('should parse --output-enabled flag', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--output-enabled']);
      
      expect(args.outputEnabled).toBe(true);
      expect(args.outputFile).toBeUndefined();
    });

    it('should parse all output options together', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '--output-file', 'output.txt',
        '--output-dir', './results',
        '--output-format', 'text'
      ]);
      
      expect(args.outputFile).toBe('output.txt');
      expect(args.outputDir).toBe('./results');
      expect(args.outputFormat).toBe('text');
    });

    it('should parse --output-enabled with other output options', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '--output-enabled',
        '--output-dir', './results',
        '--output-format', 'json'
      ]);
      
      expect(args.outputEnabled).toBe(true);
      expect(args.outputDir).toBe('./results');
      expect(args.outputFormat).toBe('json');
      expect(args.outputFile).toBeUndefined();
    });

    it('should parse custom system prompt with --custom-system-prompt flag', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--custom-system-prompt', 'You are an expert']);
      
      expect(args.customSystemPrompt).toBe('You are an expert');
    });

    it('should parse custom system prompt with -csp flag', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '-csp', 'Focus on security']);
      
      expect(args.customSystemPrompt).toBe('Focus on security');
    });

    it('should parse custom system prompt with spaces', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--custom-system-prompt', 'You are a TypeScript expert developer']);
      
      expect(args.customSystemPrompt).toBe('You are a TypeScript expert developer');
    });

    it('should parse custom system prompt with other options', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test prompt',
        '--custom-system-prompt', 'Custom prompt here',
        '--max-turns', '10',
        '--allowedTools', 'Read,Write'
      ]);
      
      expect(args.prompt).toBe('test prompt');
      expect(args.customSystemPrompt).toBe('Custom prompt here');
      expect(args.maxTurns).toBe(10);
      expect(args.allowedTools).toEqual(['Read', 'Write']);
    });
  });

  describe('validateArgs', () => {
    it('should validate valid args with prompt', () => {
      const args: CLIArgs = { prompt: 'test prompt' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should validate valid args with input file', () => {
      const args: CLIArgs = { inputFile: 'test.txt' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should validate help command', () => {
      const args: CLIArgs = { help: true };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should reject args without prompt or file', () => {
      const args: CLIArgs = { maxTurns: 10 };
      
      expect(ArgumentParser.validateArgs(args)).toBe(false);
    });

    it('should reject invalid max turns (zero)', () => {
      const args: CLIArgs = { prompt: 'test', maxTurns: 0 };
      
      expect(ArgumentParser.validateArgs(args)).toBe(false);
    });

    it('should reject invalid max turns (over 100)', () => {
      const args: CLIArgs = { prompt: 'test', maxTurns: 101 };
      
      expect(ArgumentParser.validateArgs(args)).toBe(false);
    });

    it('should reject empty session ID', () => {
      const args: CLIArgs = { prompt: 'test', sessionId: '' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(false);
    });

    it('should reject both continue and resume', () => {
      const args: CLIArgs = { prompt: 'test', continue: true, sessionId: 'session123' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(false);
    });

    it('should accept valid max turns', () => {
      const args: CLIArgs = { prompt: 'test', maxTurns: 50 };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should validate valid permission modes', () => {
      const modes = ['default', 'acceptEdits', 'bypassPermissions', 'plan'];
      
      modes.forEach(mode => {
        const args: CLIArgs = { prompt: 'test', permissionMode: mode as any };
        expect(ArgumentParser.validateArgs(args)).toBe(true);
      });
    });

    it('should validate args without permission mode', () => {
      const args: CLIArgs = { prompt: 'test' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should validate args with valid settings file', () => {
      const args: CLIArgs = { prompt: 'test', settingsFile: 'custom-settings.json' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should reject empty settings file path', () => {
      const args: CLIArgs = { prompt: 'test', settingsFile: '' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(false);
    });

    it('should reject whitespace-only settings file path', () => {
      const args: CLIArgs = { prompt: 'test', settingsFile: '   ' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(false);
    });

    it('should validate args with valid output file', () => {
      const args: CLIArgs = { prompt: 'test', outputFile: 'output.json' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should reject empty output file path', () => {
      const args: CLIArgs = { prompt: 'test', outputFile: '' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(false);
    });

    it('should validate args with valid output directory', () => {
      const args: CLIArgs = { prompt: 'test', outputDir: './results' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should reject empty output directory path', () => {
      const args: CLIArgs = { prompt: 'test', outputDir: '   ' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(false);
    });

    it('should validate valid output format json', () => {
      const args: CLIArgs = { prompt: 'test', outputFormat: 'json' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should validate valid output format text', () => {
      const args: CLIArgs = { prompt: 'test', outputFormat: 'text' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should reject invalid output format', () => {
      const args: CLIArgs = { prompt: 'test', outputFormat: 'invalid' as any };
      
      expect(ArgumentParser.validateArgs(args)).toBe(false);
    });

    it('should validate args with outputEnabled flag', () => {
      const args: CLIArgs = { prompt: 'test', outputEnabled: true };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should validate outputEnabled with output options', () => {
      const args: CLIArgs = { prompt: 'test', outputEnabled: true, outputFile: 'output.json' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should validate --output-enabled flag alone', () => {
      const args: CLIArgs = { prompt: 'test', outputEnabled: true };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should validate all output options together (without conflict)', () => {
      const args: CLIArgs = { 
        prompt: 'test',
        outputFile: 'output.json',
        outputDir: './results',
        outputFormat: 'json'
      };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should validate args with custom system prompt', () => {
      const args: CLIArgs = { prompt: 'test', customSystemPrompt: 'You are an expert' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should reject empty custom system prompt', () => {
      const args: CLIArgs = { prompt: 'test', customSystemPrompt: '' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(false);
    });

    it('should reject whitespace-only custom system prompt', () => {
      const args: CLIArgs = { prompt: 'test', customSystemPrompt: '   ' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(false);
    });
  });

  describe('getValidationError', () => {
    it('should return null for valid args', () => {
      const args: CLIArgs = { prompt: 'test' };
      
      expect(ArgumentParser.getValidationError(args)).toBeNull();
    });

    it('should return null for help command', () => {
      const args: CLIArgs = { help: true };
      
      expect(ArgumentParser.getValidationError(args)).toBeNull();
    });

    it('should return error for missing prompt and file', () => {
      const args: CLIArgs = {};
      
      const error = ArgumentParser.getValidationError(args);
      expect(error).toBe('Please provide either -i <prompt> or -f <file>');
    });

    it('should return error for invalid max turns', () => {
      const args: CLIArgs = { prompt: 'test', maxTurns: 0 };
      
      const error = ArgumentParser.getValidationError(args);
      expect(error).toBe('Max turns must be between 1 and 100');
    });

    it('should return error for empty session ID', () => {
      const args: CLIArgs = { prompt: 'test', sessionId: '   ' };
      
      const error = ArgumentParser.getValidationError(args);
      expect(error).toBe('Session ID must be a non-empty string');
    });

    it('should return error for conflicting options', () => {
      const args: CLIArgs = { prompt: 'test', continue: true, sessionId: 'session123' };
      
      const error = ArgumentParser.getValidationError(args);
      expect(error).toBe('Cannot use both --continue and --resume options');
    });

    it('should return error for invalid settings file path', () => {
      const args: CLIArgs = { prompt: 'test', settingsFile: '   ' };
      
      const error = ArgumentParser.getValidationError(args);
      expect(error).toBe('Settings file path must be a non-empty string');
    });

    it('should return null for valid settings file path', () => {
      const args: CLIArgs = { prompt: 'test', settingsFile: 'custom-settings.json' };
      
      expect(ArgumentParser.getValidationError(args)).toBeNull();
    });

    it('should return error for invalid output format', () => {
      const args: CLIArgs = { prompt: 'test', outputFormat: 'invalid' as any };
      
      const error = ArgumentParser.getValidationError(args);
      expect(error).toBe('Output format must be either "json" or "text"');
    });

    it('should return error for empty output file path', () => {
      const args: CLIArgs = { prompt: 'test', outputFile: '   ' };
      
      const error = ArgumentParser.getValidationError(args);
      expect(error).toBe('Output file path must be a non-empty string');
    });

    it('should return error for empty output directory path', () => {
      const args: CLIArgs = { prompt: 'test', outputDir: '' };
      
      const error = ArgumentParser.getValidationError(args);
      expect(error).toBe('Output directory path must be a non-empty string');
    });

    it('should return null for outputEnabled with output options', () => {
      const args: CLIArgs = { prompt: 'test', outputEnabled: true, outputFile: 'output.json' };
      
      const error = ArgumentParser.getValidationError(args);
      expect(error).toBeNull();
    });

    it('should return null for valid output options', () => {
      const args: CLIArgs = { 
        prompt: 'test',
        outputFile: 'output.json',
        outputDir: './results',
        outputFormat: 'json'
      };
      
      expect(ArgumentParser.getValidationError(args)).toBeNull();
    });

    it('should return null for outputEnabled flag', () => {
      const args: CLIArgs = { prompt: 'test', outputEnabled: true };
      
      expect(ArgumentParser.getValidationError(args)).toBeNull();
    });

    it('should return null for valid custom system prompt', () => {
      const args: CLIArgs = { prompt: 'test', customSystemPrompt: 'You are an expert' };
      
      expect(ArgumentParser.getValidationError(args)).toBeNull();
    });

    it('should return error for empty custom system prompt', () => {
      const args: CLIArgs = { prompt: 'test', customSystemPrompt: '' };
      
      const error = ArgumentParser.getValidationError(args);
      expect(error).toBe('Custom system prompt must be a non-empty string');
    });

    it('should return error for whitespace-only custom system prompt', () => {
      const args: CLIArgs = { prompt: 'test', customSystemPrompt: '   ' };
      
      const error = ArgumentParser.getValidationError(args);
      expect(error).toBe('Custom system prompt must be a non-empty string');
    });
  });
});