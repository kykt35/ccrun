import { promises as fs } from 'fs';
import { join, dirname, isAbsolute } from 'path';
import { Settings } from '../core/types';

export interface SDKResultMessage {
  type: 'result';
  subtype: 'success' | 'error_max_turns' | 'error_during_execution';
  duration_ms: number;
  duration_api_ms: number;
  is_error: boolean;
  num_turns: number;
  result?: string;
  session_id: string;
  total_cost_usd: number;
  usage: {
    input_tokens: number;
    output_tokens: number;
    total_tokens: number;
  };
}

export interface ExtendedOutputData {
  result: SDKResultMessage;
  metadata: {
    timestamp: string;
    version: string;
    config: Record<string, any>;
  };
}

export class FileOutputManager {
  static async writeResult(
    filePath: string,
    result: SDKResultMessage,
    format: 'json' | 'text' = 'json',
    metadata?: any
  ): Promise<void> {
    await this.ensureDirectoryExists(filePath);
    
    if (format === 'json') {
      const outputData: ExtendedOutputData = {
        result,
        metadata: {
          timestamp: new Date().toISOString(),
          version: '1.0.0',
          config: metadata || {}
        }
      };
      await this.writeJSON(filePath, outputData);
    } else {
      await this.writeText(filePath, result);
    }
  }

  static async writeJSON(filePath: string, data: ExtendedOutputData): Promise<void> {
    const jsonContent = JSON.stringify(data, null, 2);
    await fs.writeFile(filePath, jsonContent, 'utf-8');
  }

  static async writeText(filePath: string, result: SDKResultMessage): Promise<void> {
    const textContent = this.formatSDKResultAsText(result);
    await fs.writeFile(filePath, textContent, 'utf-8');
  }

  static generateDefaultOutputPath(outputDir?: string, settings?: Settings): string {
    const now = new Date();
    const timestamp = now.toISOString()
      .replace(/[-:]/g, '')
      .replace(/\..+/, '')
      .replace('T', '');
    
    const dir = outputDir || this.getDefaultOutputDirectory();
    const format = settings?.output?.format || 'json';
    const prefix = settings?.output?.filename?.prefix || '';
    const suffix = settings?.output?.filename?.suffix || '';
    
    let filename = timestamp;
    if (prefix) filename = prefix + filename;
    if (suffix) filename = filename + suffix;
    
    return join(dir, `${filename}.${format}`);
  }

  static getDefaultOutputDirectory(): string {
    return join(process.cwd(), 'tmp', 'ccrun', 'results');
  }

  static resolveOutputPath(
    outputFile?: string,
    outputDir?: string,
    noOutput?: boolean,
    settings?: Settings
  ): string | null {
    // Check if output is disabled
    if (noOutput || (settings?.output?.enabled === false)) {
      return null;
    }
    
    if (outputFile) {
      // -o option specified
      if (isAbsolute(outputFile)) {
        return outputFile;
      }
      // Relative path specified - consider output-dir
      const dir = outputDir || settings?.output?.directory || process.cwd();
      return join(dir, outputFile);
    }
    
    // -o option omitted - use default name
    return this.generateDefaultOutputPath(outputDir, settings);
  }

  private static validateOutputPath(filePath: string): boolean {
    try {
      // Basic validation - check if path is not empty and doesn't contain invalid characters
      if (!filePath || filePath.trim().length === 0) {
        return false;
      }
      
      // Check for invalid characters (basic check)
      const invalidChars = /[<>:"|?*]/;
      if (invalidChars.test(filePath)) {
        return false;
      }
      
      return true;
    } catch {
      return false;
    }
  }

  private static async ensureDirectoryExists(filePath: string): Promise<void> {
    const dir = dirname(filePath);
    try {
      await fs.mkdir(dir, { recursive: true });
    } catch (error) {
      throw new Error(`Failed to create directory ${dir}: ${(error as Error).message}`);
    }
  }

  private static formatSDKResultAsText(result: SDKResultMessage): string {
    const timestamp = new Date().toLocaleString();
    const status = result.is_error ? 'エラー' : '成功';
    const subtype = result.subtype === 'success' ? 'success' : 
                   result.subtype === 'error_max_turns' ? 'error_max_turns' : 
                   'error_during_execution';
    
    return `==========================================
CCRun 実行結果レポート
==========================================

実行時刻: ${timestamp}
セッションID: ${result.session_id}
ステータス: ${status} (${subtype})

パフォーマンス情報:
  実行時間: ${result.duration_ms.toLocaleString()}ms
  API時間: ${result.duration_api_ms.toLocaleString()}ms
  ターン数: ${result.num_turns}
  推定コスト: $${result.total_cost_usd.toFixed(4)}

トークン使用量:
  入力トークン: ${result.usage.input_tokens.toLocaleString()}
  出力トークン: ${result.usage.output_tokens.toLocaleString()}
  合計トークン: ${result.usage.total_tokens.toLocaleString()}

結果:
${result.result || 'No result content'}

==========================================`;
  }
}