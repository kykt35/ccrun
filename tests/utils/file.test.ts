import { FileManager } from '../../src/utils/file';
import { readFile, writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { existsSync, rmSync } from 'fs';

describe('FileManager', () => {
  const testDir = join(__dirname, 'test-files');
  const testFile = join(testDir, 'test.txt');
  const testContent = 'This is a test file content';

  beforeAll(async () => {
    // Create test directory and file
    if (!existsSync(testDir)) {
      await mkdir(testDir, { recursive: true });
    }
    await writeFile(testFile, testContent);
  });

  afterAll(() => {
    // Clean up test files
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe('readFile', () => {
    it('should read file content correctly', async () => {
      const content = await FileManager.readFile(testFile);
      expect(content).toBe(testContent);
    });

    it('should handle relative paths', async () => {
      const relativePath = './tests/utils/test-files/test.txt';
      const content = await FileManager.readFile(relativePath);
      expect(content).toBe(testContent);
    });

    it('should throw error for non-existent file', async () => {
      const nonExistentFile = join(testDir, 'non-existent.txt');
      await expect(FileManager.readFile(nonExistentFile)).rejects.toThrow();
    });

    it('should throw error for invalid file path', async () => {
      await expect(FileManager.readFile('')).rejects.toThrow();
    });
  });

  describe('validatePath', () => {
    it('should return true for valid existing file', () => {
      expect(FileManager.validatePath(testFile)).toBe(true);
    });

    it('should return false for non-existent file', () => {
      const nonExistentFile = join(testDir, 'non-existent.txt');
      expect(FileManager.validatePath(nonExistentFile)).toBe(false);
    });

    it('should return false for directory path', () => {
      expect(FileManager.validatePath(testDir)).toBe(false);
    });

    it('should return false for empty string', () => {
      expect(FileManager.validatePath('')).toBe(false);
    });

    it('should return false for null or undefined', () => {
      expect(FileManager.validatePath(null as any)).toBe(false);
      expect(FileManager.validatePath(undefined as any)).toBe(false);
    });

    it('should return false for non-string input', () => {
      expect(FileManager.validatePath(123 as any)).toBe(false);
      expect(FileManager.validatePath({} as any)).toBe(false);
    });
  });

  describe('resolveInputPath', () => {
    it('should return absolute path as-is', () => {
      const absolutePath = '/absolute/path/to/file.txt';
      expect(FileManager.resolveInputPath(absolutePath)).toBe(absolutePath);
    });

    it('should resolve relative path to absolute', () => {
      const relativePath = './relative/path.txt';
      const resolved = FileManager.resolveInputPath(relativePath);
      expect(resolved).toContain(process.cwd());
      expect(resolved).toContain('relative/path.txt');
    });

    it('should handle path with ../ segments', () => {
      const relativePath = '../parent/file.txt';
      const resolved = FileManager.resolveInputPath(relativePath);
      expect(resolved).toContain('parent/file.txt');
    });

    it('should handle current directory reference', () => {
      const currentPath = './file.txt';
      const resolved = FileManager.resolveInputPath(currentPath);
      expect(resolved).toBe(join(process.cwd(), 'file.txt'));
    });
  });
});