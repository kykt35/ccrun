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

    it('should parse output file with -o flag', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '-o', 'output.json']);
      
      expect(args.output).toBe('output.json');
    });

    it('should parse output file with --output flag', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--output', 'result.json']);
      
      expect(args.output).toBe('result.json');
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

    it('should parse no-output flag', () => {
      const args = ArgumentParser.parseArgs(['-i', 'test', '--no-output']);
      
      expect(args.noOutput).toBe(true);
    });

    it('should parse all output options together', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '-o', 'output.txt',
        '--output-dir', './results',
        '--output-format', 'text'
      ]);
      
      expect(args.output).toBe('output.txt');
      expect(args.outputDir).toBe('./results');
      expect(args.outputFormat).toBe('text');
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
      const args: CLIArgs = { prompt: 'test', output: 'output.json' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should reject empty output file path', () => {
      const args: CLIArgs = { prompt: 'test', output: '' };
      
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

    it('should validate args with noOutput flag', () => {
      const args: CLIArgs = { prompt: 'test', noOutput: true };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should reject conflicting noOutput and output options', () => {
      const args: CLIArgs = { prompt: 'test', noOutput: true, output: 'output.json' };
      
      expect(ArgumentParser.validateArgs(args)).toBe(false);
    });

    it('should validate all output options together (without conflict)', () => {
      const args: CLIArgs = { 
        prompt: 'test',
        output: 'output.json',
        outputDir: './results',
        outputFormat: 'json'
      };
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
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
      const args: CLIArgs = { prompt: 'test', output: '   ' };
      
      const error = ArgumentParser.getValidationError(args);
      expect(error).toBe('Output file path must be a non-empty string');
    });

    it('should return error for empty output directory path', () => {
      const args: CLIArgs = { prompt: 'test', outputDir: '' };
      
      const error = ArgumentParser.getValidationError(args);
      expect(error).toBe('Output directory path must be a non-empty string');
    });

    it('should return error for conflicting noOutput and output options', () => {
      const args: CLIArgs = { prompt: 'test', noOutput: true, output: 'output.json' };
      
      const error = ArgumentParser.getValidationError(args);
      expect(error).toBe('Cannot use both --no-output and --output options');
    });

    it('should return null for valid output options', () => {
      const args: CLIArgs = { 
        prompt: 'test',
        output: 'output.json',
        outputDir: './results',
        outputFormat: 'json'
      };
      
      expect(ArgumentParser.getValidationError(args)).toBeNull();
    });

    it('should return null for noOutput flag without conflicts', () => {
      const args: CLIArgs = { prompt: 'test', noOutput: true };
      
      expect(ArgumentParser.getValidationError(args)).toBeNull();
    });
  });
});