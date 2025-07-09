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
        '-o', 'output.json',
        '--output-dir', './results',
        '--output-format', 'text',
        '--max-turns', '5'
      ]);

      expect(args.prompt).toBe('test prompt');
      expect(args.output).toBe('output.json');
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

    it('should reject conflicting output options', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '-o', 'output.json',
        '--no-output'
      ]);

      expect(ArgumentParser.validateArgs(args)).toBe(false);
      expect(ArgumentParser.getValidationError(args)).toBe('Cannot use both --no-output and --output options');
    });
  });

  describe('Output path resolution integration', () => {
    it('should handle relative paths correctly', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '-o', 'result.json',
        '--output-dir', testDir
      ]);

      expect(args.output).toBe('result.json');
      expect(args.outputDir).toBe(testDir);
    });

    it('should handle absolute paths correctly', () => {
      const absolutePath = join(testDir, 'absolute-output.json');
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '-o', absolutePath
      ]);

      expect(args.output).toBe(absolutePath);
    });
  });

  describe('Error handling integration', () => {
    it('should handle invalid output format gracefully', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '--output-format', 'invalid'
      ]);

      expect(args.outputFormat).toBeUndefined();
      expect(ArgumentParser.validateArgs(args)).toBe(true); // Should still be valid without format
    });

    it('should handle empty output paths', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '-o', ''
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
        '-o', 'analysis.json',
        '--output-dir', './results',
        '--output-format', 'json',
        '--max-turns', '10',
        '--allowedTools', 'Read,Write,Edit',
        '--permission-mode', 'acceptEdits',
        '-s', 'custom-settings.json'
      ]);

      expect(args.prompt).toBe('analyze the code');
      expect(args.output).toBe('analysis.json');
      expect(args.outputDir).toBe('./results');
      expect(args.outputFormat).toBe('json');
      expect(args.maxTurns).toBe(10);
      expect(args.allowedTools).toEqual(['Read', 'Write', 'Edit']);
      expect(args.permissionMode).toBe('acceptEdits');
      expect(args.settingsFile).toBe('custom-settings.json');
      
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

    it('should handle no-output flag properly', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'quick test',
        '--no-output',
        '--max-turns', '3'
      ]);

      expect(args.prompt).toBe('quick test');
      expect(args.noOutput).toBe(true);
      expect(args.maxTurns).toBe(3);
      
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('should handle empty string arguments', () => {
      const args = ArgumentParser.parseArgs([
        '-i', '',
        '-o', 'output.json'
      ]);

      expect(args.prompt).toBe('');
      expect(args.output).toBe('output.json');
      expect(ArgumentParser.validateArgs(args)).toBe(false);
    });

    it('should handle missing argument values', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '-o' // Missing value
      ]);

      expect(args.prompt).toBe('test');
      expect(args.output).toBeUndefined();
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should handle duplicate flags', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '-o', 'first.json',
        '-o', 'second.json'
      ]);

      expect(args.prompt).toBe('test');
      expect(args.output).toBe('second.json'); // Should take the last one
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should handle case sensitivity', () => {
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '--output-format', 'JSON' // Wrong case
      ]);

      expect(args.outputFormat).toBeUndefined(); // Should be ignored
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });

    it('should handle very long paths', () => {
      const longPath = 'a'.repeat(250) + '.json';
      const args = ArgumentParser.parseArgs([
        '-i', 'test',
        '-o', longPath
      ]);

      expect(args.output).toBe(longPath);
      expect(ArgumentParser.validateArgs(args)).toBe(true);
    });
  });
});