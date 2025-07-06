import { readFile } from 'fs/promises';
import { resolve, isAbsolute } from 'path';
import { existsSync, statSync } from 'fs';

export class FileManager {
  static async readFile(filepath: string): Promise<string> {
    try {
      const resolvedPath = this.resolveInputPath(filepath);
      const content = await readFile(resolvedPath, 'utf-8');
      return content;
    } catch (error) {
      throw new Error(`Failed to read file ${filepath}: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static validatePath(filepath: string): boolean {
    if (!filepath || typeof filepath !== 'string') {
      return false;
    }

    try {
      const resolvedPath = this.resolveInputPath(filepath);
      
      if (!existsSync(resolvedPath)) {
        return false;
      }

      const stats = statSync(resolvedPath);
      return stats.isFile();
    } catch {
      return false;
    }
  }

  static resolveInputPath(filepath: string): string {
    if (isAbsolute(filepath)) {
      return filepath;
    }
    return resolve(process.cwd(), filepath);
  }
}