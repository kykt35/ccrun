import { ConfigManager } from '../../src/core/config';
import { CCRunConfig, Settings } from '../../src/core/types';

describe('ConfigManager', () => {
  describe('mergeToolPermissions', () => {
    it('should merge CLI and settings tool permissions', () => {
      const cliAllowed = ['Read', 'Write'];
      const cliDenied = ['Bash'];
      const settings: Settings = {
        permissions: {
          allow: ['Edit', 'Grep'],
          deny: ['WebFetch']
        }
      };

      const result = ConfigManager.mergeToolPermissions(cliAllowed, cliDenied, settings);

      expect(result.allowedTools).toEqual(expect.arrayContaining(['Read', 'Write', 'Edit', 'Grep']));
      expect(result.allowedTools).toHaveLength(4);
      expect(result.disallowedTools).toEqual(expect.arrayContaining(['Bash', 'WebFetch']));
      expect(result.disallowedTools).toHaveLength(2);
    });

    it('should handle empty CLI parameters', () => {
      const settings: Settings = {
        permissions: {
          allow: ['Read', 'Write'],
          deny: ['Bash']
        }
      };

      const result = ConfigManager.mergeToolPermissions([], [], settings);

      expect(result.allowedTools).toEqual(['Read', 'Write']);
      expect(result.disallowedTools).toEqual(['Bash']);
    });

    it('should handle null settings', () => {
      const cliAllowed = ['Read', 'Write'];
      const cliDenied = ['Bash'];

      const result = ConfigManager.mergeToolPermissions(cliAllowed, cliDenied, null);

      expect(result.allowedTools).toEqual(['Read', 'Write']);
      expect(result.disallowedTools).toEqual(['Bash']);
    });

    it('should return undefined for empty arrays', () => {
      const result = ConfigManager.mergeToolPermissions([], [], null);

      expect(result.allowedTools).toBeUndefined();
      expect(result.disallowedTools).toBeUndefined();
    });
  });

  describe('validateConfig', () => {
    it('should validate valid config', () => {
      const config: CCRunConfig = {
        prompt: 'test prompt',
        maxTurns: 10,
        allowedTools: ['Read', 'Write'],
        disallowedTools: ['Bash']
      };

      const result = ConfigManager.validateConfig(config);

      expect(result).toBe(true);
    });

    it('should validate config with input file', () => {
      const config: CCRunConfig = {
        inputFile: 'test.txt',
        maxTurns: 5
      };

      const result = ConfigManager.validateConfig(config);

      expect(result).toBe(true);
    });

    it('should reject config without prompt or input file', () => {
      const config: CCRunConfig = {
        maxTurns: 10
      };

      const result = ConfigManager.validateConfig(config);

      expect(result).toBe(false);
    });

    it('should reject config with maxTurns over 100', () => {
      const config: CCRunConfig = {
        prompt: 'test',
        maxTurns: 101
      };

      const result = ConfigManager.validateConfig(config);

      expect(result).toBe(false);
    });

    it('should reject config with non-string sessionId', () => {
      const config: CCRunConfig = {
        prompt: 'test',
        sessionId: 123 as any
      };

      const result = ConfigManager.validateConfig(config);

      expect(result).toBe(false);
    });

    it('should reject config with non-array allowedTools', () => {
      const config: CCRunConfig = {
        prompt: 'test',
        allowedTools: 'Read,Write' as any
      };

      const result = ConfigManager.validateConfig(config);

      expect(result).toBe(false);
    });

    it('should reject config with non-array disallowedTools', () => {
      const config: CCRunConfig = {
        prompt: 'test',
        disallowedTools: 'Bash' as any
      };

      const result = ConfigManager.validateConfig(config);

      expect(result).toBe(false);
    });
  });

  describe('mergeOutputSettings', () => {
    it('should return null when output is disabled by default', () => {
      const result = ConfigManager.mergeOutputSettings(
        undefined,
        './results',
        'json',
        false,
        null
      );

      expect(result.outputFile).toBeNull();
      expect(result.outputFormat).toBe('json');
    });

    it('should return null when settings disable output', () => {
      const settings: Settings = {
        output: { enabled: false }
      };

      const result = ConfigManager.mergeOutputSettings(
        undefined,
        './results',
        'json',
        false,
        settings
      );

      expect(result.outputFile).toBeNull();
      expect(result.outputFormat).toBe('json');
    });

    it('should use CLI output file path when provided', () => {
      const result = ConfigManager.mergeOutputSettings(
        'output.json',
        './results',
        'text',
        false,
        null
      );

      expect(result.outputFile).toBe('output.json');
      expect(result.outputFormat).toBe('text');
    });

    it('should use auto-generate when outputEnabled is true', () => {
      const result = ConfigManager.mergeOutputSettings(
        undefined,
        './results',
        'json',
        true,
        null
      );

      expect(result.outputFile).toBe('auto-generate');
      expect(result.outputFormat).toBe('json');
    });

    it('should enable output when settings enable it', () => {
      const settings: Settings = {
        output: { enabled: true }
      };

      const result = ConfigManager.mergeOutputSettings(
        undefined,
        './results',
        'json',
        false,
        settings
      );

      expect(result.outputFile).toBe('auto-generate');
      expect(result.outputFormat).toBe('json');
    });

    it('should prioritize CLI format over settings format', () => {
      const settings: Settings = {
        outputFormat: 'text',
        output: { enabled: true }
      };

      const result = ConfigManager.mergeOutputSettings(
        'output.json',
        './results',
        'json',
        false,
        settings
      );

      expect(result.outputFormat).toBe('json');
    });

    it('should use settings format when CLI format is not provided', () => {
      const settings: Settings = {
        outputFormat: 'text',
        output: { enabled: true }
      };

      const result = ConfigManager.mergeOutputSettings(
        undefined,
        './results',
        undefined,
        true,
        settings
      );

      expect(result.outputFormat).toBe('text');
    });

    it('should default to json format when no format is specified', () => {
      const result = ConfigManager.mergeOutputSettings(
        'output.json',
        './results',
        undefined,
        false,
        null
      );

      expect(result.outputFormat).toBe('json');
    });

    it('should enable output when CLI output file is provided', () => {
      const result = ConfigManager.mergeOutputSettings(
        'output.json',
        './results',
        'text',
        false,
        null
      );

      expect(result.outputFile).toBe('output.json');
      expect(result.outputFormat).toBe('text');
    });

    it('should enable output when outputEnabled is true with settings', () => {
      const settings: Settings = {
        outputFormat: 'text'
      };

      const result = ConfigManager.mergeOutputSettings(
        undefined,
        './results',
        undefined,
        true,
        settings
      );

      expect(result.outputFile).toBe('auto-generate');
      expect(result.outputFormat).toBe('text');
    });

    it('should use settings outputFile when provided', () => {
      const settings: Settings = {
        outputFile: './custom/output.json',
        outputFormat: 'json'
      };

      const result = ConfigManager.mergeOutputSettings(
        undefined,
        './results',
        undefined,
        false,
        settings
      );

      expect(result.outputFile).toBe('./custom/output.json');
      expect(result.outputFormat).toBe('json');
    });

    it('should enable output when settings outputFile is provided', () => {
      const settings: Settings = {
        outputFile: './auto/output.json'
      };

      const result = ConfigManager.mergeOutputSettings(
        undefined,
        './results',
        undefined,
        false,
        settings
      );

      expect(result.outputFile).toBe('./auto/output.json');
      expect(result.outputFormat).toBe('json');
    });

    it('should prioritize outputFile over output.enabled when both are provided', () => {
      const settings: Settings = {
        outputFile: './specific/file.json',
        output: {
          enabled: true,
          directory: './different/dir'
        }
      };

      const result = ConfigManager.mergeOutputSettings(
        undefined,
        './results',
        undefined,
        false,
        settings
      );

      expect(result.outputFile).toBe('./specific/file.json');
      expect(result.outputFormat).toBe('json');
    });
  });

  describe('Custom System Prompt Support', () => {
    it('should accept customSystemPrompt in Settings type', () => {
      const settings: Settings = {
        customSystemPrompt: 'You are an expert TypeScript developer',
        maxTurns: 10,
        permissions: {
          allow: ['Read', 'Write'],
          deny: ['Bash']
        }
      };

      expect(settings.customSystemPrompt).toBe('You are an expert TypeScript developer');
      expect(settings.maxTurns).toBe(10);
    });

    it('should validate config with customSystemPrompt', () => {
      const config: CCRunConfig = {
        prompt: 'test prompt',
        customSystemPrompt: 'You are a helpful assistant',
        maxTurns: 5
      };

      const result = ConfigManager.validateConfig(config);

      expect(result).toBe(true);
    });

    it('should validate config without customSystemPrompt', () => {
      const config: CCRunConfig = {
        prompt: 'test prompt',
        maxTurns: 5
      };

      const result = ConfigManager.validateConfig(config);

      expect(result).toBe(true);
    });
  });
});