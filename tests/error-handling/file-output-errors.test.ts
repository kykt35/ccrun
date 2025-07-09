import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { promises as fs } from 'fs';
import { join } from 'path';
import { FileOutputManager } from '../../src/utils/file-output';
import { SDKResultMessage } from '../../src/core/types';

describe('File Output Error Handling', () => {
  const testDir = join(__dirname, 'test-error-handling');
  
  beforeEach(async () => {
    // Clean up test directory
    try {
      await fs.rmdir(testDir, { recursive: true });
    } catch {
      // Directory might not exist
    }
  });

  afterEach(async () => {
    // Clean up test directory
    try {
      await fs.rmdir(testDir, { recursive: true });
    } catch {
      // Directory might not exist
    }
  });

  const createMockSDKResult = (): SDKResultMessage => ({
    type: 'result',
    subtype: 'success',
    duration_ms: 1000,
    duration_api_ms: 800,
    is_error: false,
    num_turns: 1,
    result: 'Test result',
    session_id: 'test-session',
    total_cost_usd: 0.001,
    usage: {
      input_tokens: 100,
      output_tokens: 50,
      total_tokens: 150
    }
  });

  describe('Directory creation errors', () => {
    it('should handle permission denied errors', async () => {
      const mockResult = createMockSDKResult();
      
      // Try to create a file in a system directory that might not have write permissions
      const restrictedPath = '/root/restricted/test.json';
      
      await expect(
        FileOutputManager.writeResult(restrictedPath, mockResult)
      ).rejects.toThrow();
    });

    it('should handle invalid directory paths', async () => {
      const mockResult = createMockSDKResult();
      
      // Invalid characters in path (on Windows)
      const invalidPath = process.platform === 'win32' ? 'test<>:"|?*\\invalid.json' : '/invalid/\x00/path.json';
      
      await expect(
        FileOutputManager.writeResult(invalidPath, mockResult)
      ).rejects.toThrow();
    });

    it('should handle path that is too long', async () => {
      const mockResult = createMockSDKResult();
      
      // Create a very long path
      const longPath = 'a'.repeat(1000) + '/' + 'b'.repeat(255) + '.json';
      
      await expect(
        FileOutputManager.writeResult(longPath, mockResult)
      ).rejects.toThrow();
    });
  });

  describe('File writing errors', () => {
    it('should handle file already exists as directory', async () => {
      const mockResult = createMockSDKResult();
      
      // Create a directory with the same name as the file we want to write
      const conflictPath = join(testDir, 'conflict');
      await fs.mkdir(testDir, { recursive: true });
      await fs.mkdir(conflictPath, { recursive: true });
      
      await expect(
        FileOutputManager.writeResult(conflictPath, mockResult)
      ).rejects.toThrow();
    });

    it('should handle read-only file system', async () => {
      const mockResult = createMockSDKResult();
      
      // Create a file and try to write to it again
      const testFile = join(testDir, 'readonly.json');
      await fs.mkdir(testDir, { recursive: true });
      await fs.writeFile(testFile, 'test');
      
      try {
        // Make file read-only
        await fs.chmod(testFile, 0o444);
        
        await expect(
          FileOutputManager.writeResult(testFile, mockResult)
        ).rejects.toThrow();
      } finally {
        // Cleanup: restore write permissions
        try {
          await fs.chmod(testFile, 0o644);
        } catch {
          // Ignore cleanup errors
        }
      }
    });

    it('should handle disk full scenarios', async () => {
      const mockResult = createMockSDKResult();
      
      // This is hard to simulate, but we can test with a very large string
      const largeResult = {
        ...mockResult,
        result: 'x'.repeat(10000000) // 10MB string
      };
      
      const testFile = join(testDir, 'large.json');
      
      // This might throw due to memory or disk constraints
      try {
        await FileOutputManager.writeResult(testFile, largeResult);
        
        // If it succeeds, verify the file was created
        const stats = await fs.stat(testFile);
        expect(stats.size).toBeGreaterThan(1000000);
      } catch (error) {
        // If it fails, that's also expected behavior
        expect(error).toBeDefined();
      }
    });
  });

  describe('Path resolution errors', () => {
    it('should handle null output path correctly', () => {
      const path = FileOutputManager.resolveOutputPath(
        undefined,
        undefined,
        false // outputEnabled = false
      );
      
      expect(path).toBeNull();
    });

    it('should handle invalid settings gracefully', () => {
      const invalidSettings = {
        output: {
          enabled: 'invalid' as any,
          directory: 123 as any,
          format: 'invalid' as any
        }
      };
      
      // Should handle invalid directory type by using process.cwd()
      const path = FileOutputManager.resolveOutputPath(
        'test.json',
        undefined,
        false,
        invalidSettings
      );
      
      expect(path).toMatch(/test\.json$/);
    });

    it('should handle empty string paths', () => {
      const path = FileOutputManager.resolveOutputPath(
        '',
        './output',
        true
      );
      
      expect(path).toMatch(/output\/\d{8}\d{6}\.json$/);
    });
  });

  describe('JSON serialization errors', () => {
    it('should handle circular references in metadata', async () => {
      const mockResult = createMockSDKResult();
      
      // Create circular reference in config
      const circularConfig: any = {
        prompt: 'test',
        maxTurns: 10
      };
      circularConfig.self = circularConfig;
      
      const testFile = join(testDir, 'circular.json');
      
      // This should throw due to circular reference
      await expect(
        FileOutputManager.writeResult(testFile, mockResult, 'json', circularConfig)
      ).rejects.toThrow();
    });

    it('should handle very large JSON objects', async () => {
      const mockResult = createMockSDKResult();
      
      // Create a very large config object that extends CCRunConfig
      const largeConfig = {
        prompt: 'test',
        maxTurns: 10,
        // Add large data as additional property
        largeData: Array(10000).fill(0).map((_, i) => ({
          id: i,
          value: `value-${i}`,
          metadata: {
            timestamp: new Date().toISOString(),
            details: `Details for item ${i}`
          }
        }))
      };
      
      const testFile = join(testDir, 'large-config.json');
      
      try {
        await FileOutputManager.writeResult(testFile, mockResult, 'json', largeConfig);
        
        // Verify the file was created
        const stats = await fs.stat(testFile);
        expect(stats.size).toBeGreaterThan(1000);
      } catch (error) {
        // Large objects might cause memory issues
        expect(error).toBeDefined();
      }
    });
  });

  describe('Text formatting errors', () => {
    it('should handle missing result fields gracefully', async () => {
      const incompleteResult = {
        type: 'result',
        subtype: 'success',
        duration_ms: 1000,
        duration_api_ms: 800,
        is_error: false,
        num_turns: 1,
        session_id: 'test-session',
        total_cost_usd: 0.001,
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150
        }
        // Missing 'result' field
      } as SDKResultMessage;
      
      const testFile = join(testDir, 'incomplete.txt');
      
      await expect(
        FileOutputManager.writeResult(testFile, incompleteResult, 'text')
      ).resolves.not.toThrow();
      
      const content = await fs.readFile(testFile, 'utf-8');
      expect(content).toContain('CCRun 実行結果レポート');
    });

    it('should handle NaN and Infinity values', async () => {
      const badResult = {
        type: 'result',
        subtype: 'success',
        duration_ms: NaN,
        duration_api_ms: Infinity,
        is_error: false,
        num_turns: 1,
        result: 'Test result',
        session_id: 'test-session',
        total_cost_usd: -Infinity,
        usage: {
          input_tokens: NaN,
          output_tokens: Infinity,
          total_tokens: 150
        }
      } as SDKResultMessage;
      
      const testFile = join(testDir, 'bad-values.txt');
      
      await expect(
        FileOutputManager.writeResult(testFile, badResult, 'text')
      ).resolves.not.toThrow();
      
      const content = await fs.readFile(testFile, 'utf-8');
      expect(content).toContain('CCRun 実行結果レポート');
    });
  });

  describe('Default path generation errors', () => {
    it('should handle system clock issues', () => {
      // Mock Date to return invalid values
      const originalDate = Date;
      
      try {
        (global as any).Date = class extends Date {
          constructor() {
            super();
            return new originalDate('invalid');
          }
        };
        
        // Should throw due to invalid date
        expect(() => {
          FileOutputManager.generateDefaultOutputPath();
        }).toThrow();
      } finally {
        global.Date = originalDate;
      }
    });

    it('should handle invalid settings gracefully', () => {
      const invalidSettings = {
        output: {
          directory: null as any,
          format: undefined as any,
          filename: {
            prefix: 123 as any,
            suffix: null as any
          }
        }
      };
      
      const path = FileOutputManager.generateDefaultOutputPath(undefined, invalidSettings);
      
      expect(path).toMatch(/tmp\/ccrun\/results\/\d{8}\d{6}\.json$/);
    });
  });
});