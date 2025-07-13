import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { promises as fs } from 'fs';
import { join } from 'path';
import { CLIManager } from '../../src/cli';
import { ArgumentParser } from '../../src/cli/args';

describe('File Output Integration Tests', () => {
  const testDir = join(__dirname, 'test-integration-output');
  const testOutputFile = join(testDir, 'test-output.json');

  beforeEach(async () => {
    // Clean up test directory
    try {
      await fs.rmdir(testDir, { recursive: true });
    } catch {
      // Directory might not exist
    }
    await fs.mkdir(testDir, { recursive: true });
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rmdir(testDir, { recursive: true });
    } catch {
      // Directory might not exist
    }
  });

  describe('CLI argument parsing integration', () => {
    it('should parse all output options correctly', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test prompt',
        '--output-file', 'output.json',
        '--output-dir', './results',
        '--output-format', 'text',
        '--max-turns', '5'
      ]);

      expect(args.prompt).toBe('test prompt');
      expect(args.outputFile).toBe('output.json');
      expect(args.outputDir).toBe('./results');
      expect(args.outputFormat).toBe('text');
      expect(args.maxTurns).toBe(5);
    });

    it('should validate output options correctly', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '-o', 'output.json',
        '--output-format', 'json'
      ]);

      expect(ArgumentParser.validateArgs(args)).toBe(true);
      expect(ArgumentParser.getValidationError(args)).toBeNull();
    });

    it('should validate output-file and output flags together', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '-o', 'output.json',
        '--output'
      ]);

      expect(ArgumentParser.validateArgs(args)).toBe(true);
      expect(ArgumentParser.getValidationError(args)).toBeNull();
    });
  });

  describe('Output path resolution integration', () => {
    it('should handle relative paths correctly', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '--output-file', 'result.json',
        '--output-dir', testDir
      ]);

      expect(args.outputFile).toBe('result.json');
      expect(args.outputDir).toBe(testDir);
    });

    it('should handle absolute paths correctly', () => {
      const absolutePath = join(testDir, 'absolute-output.json');
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '--output-file', absolutePath
      ]);

      expect(args.outputFile).toBe(absolutePath);
    });
  });

  describe('Error handling integration', () => {
    it('should throw error for invalid output format', () => {
      expect(() => ArgumentParser.parseArgs([
        '-i', 'test',
        '--output-format', 'invalid'
      ])).toThrow('Invalid value for --output-format/--outputFormat: "invalid". Expected "json" or "text"');
    });

    it('should handle empty output paths', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '--output-file', ''
      ]);

      expect(ArgumentParser.validateArgs(args)).toBe(false);
      expect(ArgumentParser.getValidationError(args)).toBe('Output file path must be a non-empty string');
    });

    it('should handle whitespace-only output paths', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '--output-dir', '   '
      ]);

      expect(ArgumentParser.validateArgs(args)).toBe(false);
      expect(ArgumentParser.getValidationError(args)).toBe('Output directory path must be a non-empty string');
    });
  });

  describe('Complex scenarios', () => {
    it('should handle all options together correctly', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'analyze the code',
        '--output-file', 'analysis.json',
        '--output-dir', './results',
        '--output-format', 'json',
        '--max-turns', '10',
        '--allowedTools', 'Read,Write,Edit',
        '--permission-mode', 'acceptEdits',
        '-s', 'custom-settings.json'
      ]);

      expect(args.prompt).toBe('analyze the code');
      expect(args.outputFile).toBe('analysis.json');
      expect(args.outputDir).toBe('./results');
      expect(args.outputFormat).toBe('json');
      expect(args.maxTurns).toBe(10);
      expect(args.allowedTools).toEqual(['Read', 'Write', 'Edit']);
      expect(args.permissionMode).toBe('acceptEdits');
      expect(args.settingsFile).toBe('custom-settings.json');
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
      expect(ArgumentParser.getValidationError(args)).toBeNull();
    });

    it('should handle --output-enabled with other options', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'quick analysis',
        '--output-enabled',
        '--output-dir', './temp',
        '--output-format', 'text',
        '--max-turns', '5'
      ]);

      expect(args.prompt).toBe('quick analysis');
      expect(args.outputEnabled).toBe(true);
      expect(args.outputFile).toBeUndefined();
      expect(args.outputDir).toBe('./temp');
      expect(args.outputFormat).toBe('text');
      expect(args.maxTurns).toBe(5);
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
      expect(ArgumentParser.getValidationError(args)).toBeNull();
    });

    it('should handle mixed output options with validation', () => {
      const args = ArgumentParser.parseArgs([
        '-f', 'input.txt',
        '--output-dir', './custom-output',
        '--output-format', 'text',
        '--continue',
        '--disallowedTools', 'Bash,WebFetch'
      ]);

      expect(args.inputFile).toBe('input.txt');
      expect(args.outputDir).toBe('./custom-output');
      expect(args.outputFormat).toBe('text');
      expect(args.continue).toBe(true);
      expect(args.disallowedTools).toEqual(['Bash', 'WebFetch']);
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should handle --output flag properly', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'quick test',
        '--output',
        '--max-turns', '3'
      ]);

      expect(args.prompt).toBe('quick test');
      expect(args.outputEnabled).toBe(true);
      expect(args.maxTurns).toBe(3);
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should handle --output-enabled flag properly', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'quick test',
        '--output-enabled',
        '--max-turns', '5'
      ]);

      expect(args.prompt).toBe('quick test');
      expect(args.outputEnabled).toBe(true);
      expect(args.maxTurns).toBe(5);
      expect(args.outputFile).toBeUndefined();
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should handle --output flag for auto-generation', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '--output'
      ]);

      expect(args.outputEnabled).toBe(true);
      expect(args.outputFile).toBeUndefined();
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should handle -o as auto-output when followed by flag', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '-o', '--output-format', 'text'
      ]);

      expect(args.outputEnabled).toBe(true);
      expect(args.outputFile).toBeUndefined();
      expect(args.outputFormat).toBe('text');
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should handle --output as auto-output when followed by flag', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '--output', '--output-format', 'json'
      ]);

      expect(args.outputEnabled).toBe(true);
      expect(args.outputFile).toBeUndefined();
      expect(args.outputFormat).toBe('json');
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should handle -o flag for auto-generation', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '-o'
      ]);

      expect(args.outputEnabled).toBe(true);
      expect(args.outputFile).toBeUndefined();
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string arguments', () => {
      const args = ArgumentParser.parseArgs([
        '-i', '',
        '--output-file', 'output.json'
      ]);

      expect(args.prompt).toBe('');
      expect(args.outputFile).toBe('output.json');
      expect(ArgumentParser.validateArgs(args)).toBe(false);
    });

    it('should handle missing argument values', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '-o' // Missing value - should act as --output
      ]);

      expect(args.prompt).toBe('test');
      expect(args.outputFile).toBeUndefined();
      expect(args.outputEnabled).toBe(true);
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should handle duplicate flags', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '--output-file', 'first.json',
        '--output-file', 'second.json'
      ]);

      expect(args.prompt).toBe('test');
      expect(args.outputFile).toBe('second.json'); // Should take the last one
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should throw error for wrong case in output format', () => {
      expect(() => ArgumentParser.parseArgs([
        '-i', 'test',
        '--output-format', 'JSON' // Wrong case
      ])).toThrow('Invalid value for --output-format/--outputFormat: "JSON". Expected "json" or "text"');
    });

    it('should handle very long paths', () => {
      const longPath = 'a'.repeat(250) + '.json';
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '--output-file', longPath
      ]);

      expect(args.outputFile).toBe(longPath);
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });
  });
});