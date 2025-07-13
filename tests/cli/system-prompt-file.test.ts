import { CLIManager } from '../../src/cli';
import { FileManager } from '../../src/utils/file';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';

describe('System Prompt File Loading', () => {
  const testDir = '/tmp/ccrun-test-prompts';
  const testPromptFile = join(testDir, 'test-prompt.txt');
  const testPromptContent = 'You are an expert software engineer with deep knowledge of TypeScript and Node.js.';

  beforeAll(async () => {
    await mkdir(testDir, { recursive: true });
    await writeFile(testPromptFile, testPromptContent, 'utf-8');
  });

  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  describe('FileManager', () => {
    it('should read system prompt from file', async () => {
      const content = await FileManager.readFile(testPromptFile);
      expect(content).toBe(testPromptContent);
    });

    it('should validate existing file path', () => {
      const isValid = FileManager.validatePath(testPromptFile);
      expect(isValid).toBe(true);
    });

    it('should reject non-existent file path', () => {
      const isValid = FileManager.validatePath('/non/existent/file.txt');
      expect(isValid).toBe(false);
    });

    it('should handle relative file paths', async () => {
      // Create a test file in current directory
      const relativePath = './test-relative-prompt.txt';
      await writeFile(relativePath, 'Relative prompt content', 'utf-8');

      try {
        const content = await FileManager.readFile(relativePath);
        expect(content).toBe('Relative prompt content');
      } finally {
        await rm(relativePath, { force: true });
      }
    });

    it('should throw error for non-existent file', async () => {
      await expect(FileManager.readFile('/non/existent/file.txt'))
        .rejects
        .toThrow('Failed to read file /non/existent/file.txt');
    });

    it('should throw error for empty file path', async () => {
      await expect(FileManager.readFile(''))
        .rejects
        .toThrow();
    });
  });

  describe('System Prompt File Integration', () => {
    it('should read system prompt content from file', async () => {
      const content = await FileManager.readFile(testPromptFile);
      expect(content).toBe(testPromptContent);
      expect(content.length).toBeGreaterThan(0);
    });

    it('should handle different file formats', async () => {
      const mdFile = join(testDir, 'prompt.md');
      const mdContent = '# System Prompt\n\nYou are a helpful assistant specialized in code review.';
      await writeFile(mdFile, mdContent, 'utf-8');

      const content = await FileManager.readFile(mdFile);
      expect(content).toBe(mdContent);
    });

    it('should handle files with special characters', async () => {
      const specialFile = join(testDir, 'special-prompt.txt');
      const specialContent = 'You are an expert! Focus on: \n- Security\n- Performance\n- Best practices\n\nUse emojis: 🔒 🚀 ✨';
      await writeFile(specialFile, specialContent, 'utf-8');

      const content = await FileManager.readFile(specialFile);
      expect(content).toBe(specialContent);
    });

    it('should handle empty files', async () => {
      const emptyFile = join(testDir, 'empty-prompt.txt');
      await writeFile(emptyFile, '', 'utf-8');

      const content = await FileManager.readFile(emptyFile);
      expect(content).toBe('');
    });

    it('should handle large files', async () => {
      const largeFile = join(testDir, 'large-prompt.txt');
      const largeContent = 'A'.repeat(10000) + '\n\nYou are an expert with extensive knowledge.';
      await writeFile(largeFile, largeContent, 'utf-8');

      const content = await FileManager.readFile(largeFile);
      expect(content).toBe(largeContent);
      expect(content.length).toBe(largeContent.length);
    });
  });

  describe('Error Handling', () => {
    it('should provide helpful error messages for file read failures', async () => {
      const nonExistentFile = '/tmp/definitely/does/not/exist.txt';
      
      await expect(FileManager.readFile(nonExistentFile))
        .rejects
        .toThrow(/Failed to read file.*does\/not\/exist\.txt/);
    });

    it('should handle permission denied errors gracefully', async () => {
      // Note: This test might not work in all environments
      // It's more of a documentation of expected behavior
      const invalidPath = '/root/restricted-file.txt';
      
      await expect(FileManager.readFile(invalidPath))
        .rejects
        .toThrow(/Failed to read file/);
    });
  });

  describe('Path Resolution', () => {
    it('should resolve absolute paths correctly', () => {
      const absolutePath = '/absolute/path/to/file.txt';
      const resolved = FileManager.resolveInputPath(absolutePath);
      expect(resolved).toBe(absolutePath);
    });

    it('should resolve relative paths correctly', () => {
      const relativePath = './relative/path/to/file.txt';
      const resolved = FileManager.resolveInputPath(relativePath);
      expect(resolved).toContain('relative/path/to/file.txt');
      expect(resolved).not.toBe(relativePath); // Should be absolute now
    });

    it('should handle current directory references', () => {
      const currentDirPath = './file.txt';
      const resolved = FileManager.resolveInputPath(currentDirPath);
      expect(resolved).toContain('file.txt');
      expect(resolved.startsWith('/')).toBe(true); // Should be absolute
    });

    it('should handle parent directory references', () => {
      const parentDirPath = '../parent/file.txt';
      const resolved = FileManager.resolveInputPath(parentDirPath);
      expect(resolved).toContain('parent/file.txt');
      expect(resolved.startsWith('/')).toBe(true); // Should be absolute
    });
  });
});