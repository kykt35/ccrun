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
});