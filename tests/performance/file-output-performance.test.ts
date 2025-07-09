import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { promises as fs } from 'fs';
import { join } from 'path';
import { FileOutputManager } from '../../src/utils/file-output';
import { SDKResultMessage } from '../../src/core/types';

describe('File Output Performance Tests', () => {
  const testDir = join(__dirname, 'test-performance');
  
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

  const createLargeSDKResult = (size: number): SDKResultMessage => ({
    type: 'result',
    subtype: 'success',
    duration_ms: 5000,
    duration_api_ms: 4000,
    is_error: false,
    num_turns: 10,
    result: 'x'.repeat(size),
    session_id: 'perf-test-session',
    total_cost_usd: 0.01,
    usage: {
      input_tokens: 1000,
      output_tokens: 500,
      total_tokens: 1500
    }
  });

  describe('Large data handling', () => {
    it('should handle 1MB result data efficiently', async () => {
      const largeResult = createLargeSDKResult(1024 * 1024); // 1MB
      const testFile = join(testDir, 'large-1mb.json');
      
      const startTime = Date.now();
      await FileOutputManager.writeResult(testFile, largeResult);
      const duration = Date.now() - startTime;
      
      // Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
      
      const stats = await fs.stat(testFile);
      expect(stats.size).toBeGreaterThan(1024 * 1024);
    });

    it('should handle 10MB result data', async () => {
      const largeResult = createLargeSDKResult(10 * 1024 * 1024); // 10MB
      const testFile = join(testDir, 'large-10mb.json');
      
      const startTime = Date.now();
      await FileOutputManager.writeResult(testFile, largeResult);
      const duration = Date.now() - startTime;
      
      // Should complete within 10 seconds
      expect(duration).toBeLessThan(10000);
      
      const stats = await fs.stat(testFile);
      expect(stats.size).toBeGreaterThan(10 * 1024 * 1024);
    });

    it('should handle text format for large data', async () => {
      const largeResult = createLargeSDKResult(1024 * 1024); // 1MB
      const testFile = join(testDir, 'large-text.txt');
      
      const startTime = Date.now();
      await FileOutputManager.writeResult(testFile, largeResult, 'text');
      const duration = Date.now() - startTime;
      
      // Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
      
      const content = await fs.readFile(testFile, 'utf-8');
      expect(content).toContain('CCRun 実行結果レポート');
      expect(content.length).toBeGreaterThan(1024 * 1024);
    });
  });

  describe('Multiple concurrent writes', () => {
    it('should handle multiple concurrent writes', async () => {
      const results = Array(10).fill(0).map((_, i) => 
        createLargeSDKResult(1024 * 100) // 100KB each
      );
      
      const startTime = Date.now();
      
      const promises = results.map((result, i) => 
        FileOutputManager.writeResult(
          join(testDir, `concurrent-${i}.json`),
          result
        )
      );
      
      await Promise.all(promises);
      const duration = Date.now() - startTime;
      
      // Should complete within 10 seconds
      expect(duration).toBeLessThan(10000);
      
      // Verify all files were created
      const files = await fs.readdir(testDir);
      expect(files.length).toBe(10);
    });

    it('should handle rapid sequential writes', async () => {
      const result = createLargeSDKResult(1024 * 10); // 10KB
      
      const startTime = Date.now();
      
      for (let i = 0; i < 100; i++) {
        await FileOutputManager.writeResult(
          join(testDir, `sequential-${i}.json`),
          result
        );
      }
      
      const duration = Date.now() - startTime;
      
      // Should complete within 15 seconds
      expect(duration).toBeLessThan(15000);
      
      // Verify all files were created
      const files = await fs.readdir(testDir);
      expect(files.length).toBe(100);
    });
  });

  describe('Path resolution performance', () => {
    it('should resolve paths quickly', () => {
      const settings = {
        output: {
          directory: './custom-output',
          format: 'json' as const,
          filename: {
            prefix: 'ccrun-',
            suffix: '-result'
          }
        }
      };
      
      const startTime = Date.now();
      
      // Resolve 1000 paths
      for (let i = 0; i < 1000; i++) {
        FileOutputManager.resolveOutputPath(
          `output-${i}.json`,
          './results',
          false,
          settings
        );
      }
      
      const duration = Date.now() - startTime;
      
      // Should complete within 1 second
      expect(duration).toBeLessThan(1000);
    });

    it('should generate default paths quickly', () => {
      const settings = {
        output: {
          directory: './custom-output',
          format: 'json' as const,
          filename: {
            prefix: 'ccrun-',
            suffix: '-result'
          }
        }
      };
      
      const startTime = Date.now();
      
      // Generate 1000 default paths
      for (let i = 0; i < 1000; i++) {
        FileOutputManager.generateDefaultOutputPath('./output', settings);
      }
      
      const duration = Date.now() - startTime;
      
      // Should complete within 1 second
      expect(duration).toBeLessThan(1000);
    });
  });

  describe('Memory usage', () => {
    it('should not leak memory during large writes', async () => {
      const getMemoryUsage = () => process.memoryUsage();
      
      const initialMemory = getMemoryUsage();
      
      // Write multiple large files
      for (let i = 0; i < 10; i++) {
        const largeResult = createLargeSDKResult(1024 * 1024); // 1MB each
        const testFile = join(testDir, `memory-test-${i}.json`);
        
        await FileOutputManager.writeResult(testFile, largeResult);
        
        // Force garbage collection if available
        if (global.gc) {
          global.gc();
        }
      }
      
      const finalMemory = getMemoryUsage();
      
      // Memory usage should not have increased dramatically
      const memoryIncrease = finalMemory.heapUsed - initialMemory.heapUsed;
      const memoryIncreaseMB = memoryIncrease / (1024 * 1024);
      
      // Should not increase by more than 50MB
      expect(memoryIncreaseMB).toBeLessThan(50);
    });

    it('should handle memory pressure gracefully', async () => {
      // This test simulates memory pressure
      const largeArrays: string[] = [];
      
      try {
        // Create some memory pressure
        for (let i = 0; i < 100; i++) {
          largeArrays.push('x'.repeat(1024 * 1024)); // 1MB each
        }
        
        // Now try to write a file
        const result = createLargeSDKResult(1024 * 100); // 100KB
        const testFile = join(testDir, 'memory-pressure.json');
        
        await expect(
          FileOutputManager.writeResult(testFile, result)
        ).resolves.not.toThrow();
        
        const stats = await fs.stat(testFile);
        expect(stats.size).toBeGreaterThan(1000);
        
      } finally {
        // Clean up memory
        largeArrays.length = 0;
        if (global.gc) {
          global.gc();
        }
      }
    });
  });

  describe('Text formatting performance', () => {
    it('should format large text results efficiently', async () => {
      const largeResult = createLargeSDKResult(1024 * 1024); // 1MB
      const testFile = join(testDir, 'large-text-format.txt');
      
      const startTime = Date.now();
      await FileOutputManager.writeResult(testFile, largeResult, 'text');
      const duration = Date.now() - startTime;
      
      // Should complete within 5 seconds
      expect(duration).toBeLessThan(5000);
      
      const content = await fs.readFile(testFile, 'utf-8');
      expect(content).toContain('CCRun 実行結果レポート');
      expect(content).toContain('x'.repeat(100)); // Should contain part of the large result
    });

    it('should handle complex formatting without performance issues', async () => {
      const complexResult: SDKResultMessage = {
        type: 'result',
        subtype: 'success',
        duration_ms: 123456.789,
        duration_api_ms: 98765.432,
        is_error: false,
        num_turns: 999,
        result: 'Complex result with\nnewlines\tand\ttabs and special chars: 日本語テスト',
        session_id: 'complex-session-id-with-long-name',
        total_cost_usd: 9.876543,
        usage: {
          input_tokens: 999999,
          output_tokens: 888888,
          total_tokens: 1888887
        }
      };
      
      const testFile = join(testDir, 'complex-format.txt');
      
      const startTime = Date.now();
      await FileOutputManager.writeResult(testFile, complexResult, 'text');
      const duration = Date.now() - startTime;
      
      // Should complete within 1 second
      expect(duration).toBeLessThan(1000);
      
      const content = await fs.readFile(testFile, 'utf-8');
      expect(content).toContain('999999'); // Should format numbers without commas in text format
      expect(content).toContain('日本語テスト'); // Should handle unicode
    });
  });
});