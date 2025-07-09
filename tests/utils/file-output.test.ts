import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { promises as fs } from 'fs';
import { join } from 'path';
import { FileOutputManager } from '../../src/utils/file-output';
import { SDKResultMessage, Settings } from '../../src/core/types';

describe('FileOutputManager', () => {
  const testDir = join(__dirname, 'test-output');
  const testFile = join(testDir, 'test-output.json');
  const testTextFile = join(testDir, 'test-output.txt');

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

  const createMockSDKResult = (success: boolean = true): SDKResultMessage => {
    if (success) {
      return {
        type: 'result',
        subtype: 'success',
        duration_ms: 1000,
        duration_api_ms: 800,
        is_error: false,
        num_turns: 2,
        result: 'Test result content',
        session_id: 'test-session-123',
        total_cost_usd: 0.001,
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150
        }
      };
    } else {
      return {
        type: 'result',
        subtype: 'error_during_execution',
        duration_ms: 1000,
        duration_api_ms: 800,
        is_error: true,
        num_turns: 2,
        session_id: 'test-session-123',
        total_cost_usd: 0.001,
        usage: {
          input_tokens: 100,
          output_tokens: 50,
          total_tokens: 150
        }
      };
    }
  };

  describe('writeResult', () => {
    it('should write JSON format by default', async () => {
      const mockResult = createMockSDKResult();
      
      await FileOutputManager.writeResult(testFile, mockResult);
      
      const content = await fs.readFile(testFile, 'utf-8');
      const parsed = JSON.parse(content);
      
      expect(parsed.result).toEqual(mockResult);
      expect(parsed.metadata).toHaveProperty('timestamp');
      expect(parsed.metadata).toHaveProperty('config');
    });

    it('should write text format when specified', async () => {
      const mockResult = createMockSDKResult();
      
      await FileOutputManager.writeResult(testTextFile, mockResult, 'text');
      
      const content = await fs.readFile(testTextFile, 'utf-8');
      
      expect(content).toContain('CCRun 実行結果レポート');
      expect(content).toContain('test-session-123');
      expect(content).toContain('Test result content');
      expect(content).toContain('実行時間: 1000ms');
      expect(content).toContain('入力トークン: 100');
    });

    it('should handle error results in text format', async () => {
      const mockResult = createMockSDKResult(false);
      
      await FileOutputManager.writeResult(testTextFile, mockResult, 'text');
      
      const content = await fs.readFile(testTextFile, 'utf-8');
      
      expect(content).toContain('エラー (error_during_execution)');
      expect(content).toContain('Error occurred during execution');
    });

    it('should create directory if it does not exist', async () => {
      const nestedFile = join(testDir, 'nested', 'deep', 'test.json');
      const mockResult = createMockSDKResult();
      
      await FileOutputManager.writeResult(nestedFile, mockResult);
      
      const content = await fs.readFile(nestedFile, 'utf-8');
      expect(JSON.parse(content).result).toEqual(mockResult);
    });
  });

  describe('generateDefaultOutputPath', () => {
    it('should generate timestamp-based filename', () => {
      const path = FileOutputManager.generateDefaultOutputPath();
      
      expect(path).toMatch(/tmp\/ccrun\/results\/\d{8}\d{6}\.json$/);
    });

    it('should use custom output directory', () => {
      const customDir = './custom-output';
      const path = FileOutputManager.generateDefaultOutputPath(customDir);
      
      expect(path).toMatch(/custom-output\/\d{8}\d{6}\.json$/);
    });

    it('should use settings for format and directory', () => {
      const settings: Settings = {
        output: {
          directory: './settings-output',
          format: 'text'
        }
      };
      
      const path = FileOutputManager.generateDefaultOutputPath(undefined, settings);
      
      expect(path).toMatch(/settings-output\/\d{8}\d{6}\.text$/);
    });

    it('should use settings for filename prefix and suffix', () => {
      const settings: Settings = {
        output: {
          filename: {
            prefix: 'ccrun-',
            suffix: '-result'
          }
        }
      };
      
      const path = FileOutputManager.generateDefaultOutputPath(undefined, settings);
      
      expect(path).toMatch(/ccrun-\d{8}\d{6}-result\.json$/);
    });
  });

  describe('getDefaultOutputDirectory', () => {
    it('should return default directory path', () => {
      const dir = FileOutputManager.getDefaultOutputDirectory();
      
      expect(dir).toMatch(/tmp\/ccrun\/results$/);
    });
  });

  describe('resolveOutputPath', () => {
    it('should return null when noOutput is true', () => {
      const path = FileOutputManager.resolveOutputPath(
        'test.json',
        './output',
        true
      );
      
      expect(path).toBeNull();
    });

    it('should return null when settings disable output', () => {
      const settings: Settings = {
        output: { enabled: false }
      };
      
      const path = FileOutputManager.resolveOutputPath(
        'test.json',
        './output',
        false,
        settings
      );
      
      expect(path).toBeNull();
    });

    it('should return absolute path when outputFile is absolute', () => {
      const absolutePath = '/tmp/test.json';
      const path = FileOutputManager.resolveOutputPath(absolutePath);
      
      expect(path).toBe(absolutePath);
    });

    it('should join outputDir with relative outputFile', () => {
      const path = FileOutputManager.resolveOutputPath(
        'test.json',
        './custom-output'
      );
      
      expect(path).toMatch(/custom-output\/test\.json$/);
    });

    it('should generate default path when outputFile is not specified', () => {
      const path = FileOutputManager.resolveOutputPath(
        undefined,
        './custom-output'
      );
      
      expect(path).toMatch(/custom-output\/\d{8}\d{6}\.json$/);
    });

    it('should use settings directory when outputDir is not specified', () => {
      const settings: Settings = {
        output: { directory: './settings-dir' }
      };
      
      const path = FileOutputManager.resolveOutputPath(
        'test.json',
        undefined,
        false,
        settings
      );
      
      expect(path).toMatch(/settings-dir\/test\.json$/);
    });
  });

  describe('error handling', () => {
    it('should throw error when directory creation fails', async () => {
      // Create a file where directory should be
      const conflictFile = join(testDir, 'conflict');
      await fs.mkdir(testDir, { recursive: true });
      await fs.writeFile(conflictFile, 'test');
      
      const mockResult = createMockSDKResult();
      const badPath = join(conflictFile, 'test.json'); // This should fail
      
      await expect(
        FileOutputManager.writeResult(badPath, mockResult)
      ).rejects.toThrow();
    });
  });
});