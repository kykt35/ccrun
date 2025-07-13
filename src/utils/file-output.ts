import { promises as fs } from 'fs';
import path, { join, dirname, isAbsolute } from 'path';
import { Settings, SDKResultMessage, ExtendedOutputData, CCRunConfig } from '../core/types';

export class FileOutputManager {
  static async writeResult(
    filePath: string,
    result: SDKResultMessage,
    format: 'json' | 'text' = 'text',
    config?: CCRunConfig
  ): Promise<void> {
    await this.ensureDirectoryExists(filePath);

    if (format === 'json') {
      const outputData: ExtendedOutputData = {
        result,
        metadata: {
          timestamp: new Date().toISOString(),
          config: config || {}
        }
      };
      const ext = path.extname(filePath);
      const jsonFilePath = ext === '.json' ? filePath : filePath.replace(ext, '.json');
      await this.writeJSON(jsonFilePath, outputData);
    } else {
      const ext = path.extname(filePath);
      const textFilePath = ext === '.txt' ? filePath : filePath.replace(ext, '.txt');
      await this.writeText(textFilePath, result);
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

    const dir = outputDir ||
      (typeof settings?.output?.directory === 'string' ? settings.output.directory : null) ||
      this.getDefaultOutputDirectory();
    const format = (settings?.outputFormat === 'json' || settings?.outputFormat === 'text') ?
      settings.outputFormat : 'text';
    const prefix = (typeof settings?.output?.filename?.prefix === 'string') ?
      settings.output.filename.prefix : '';
    const suffix = (typeof settings?.output?.filename?.suffix === 'string') ?
      settings.output.filename.suffix : '';

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
    outputEnabled?: boolean,
    settings?: Settings
  ): string | null {
    // Check if output is disabled by default unless enabled
    const isOutputEnabled = !!(outputFile || outputEnabled || settings?.output?.enabled);
    if (!isOutputEnabled) {
      return null;
    }

    if (outputFile) {
      // -o option specified
      if (isAbsolute(outputFile)) {
        return outputFile;
      }
      // Relative path specified - consider output-dir
      const dir = outputDir ||
        (typeof settings?.output?.directory === 'string' ? settings.output.directory : null) ||
        process.cwd();
      return join(dir, outputFile);
    }

    // -o option omitted - use default name
    return this.generateDefaultOutputPath(outputDir, settings);
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
    const status = result.is_error ? 'Error' : 'Success';
    const subtype = result.subtype === 'success' ? 'success' :
                   result.subtype === 'error_max_turns' ? 'error_max_turns' :
                   'error_during_execution';

    // Get result content based on subtype
    const resultContent = result.subtype === 'success' && 'result' in result
      ? result.result
      : result.subtype === 'error_max_turns'
        ? 'Maximum number of turns exceeded'
        : 'Error occurred during execution';

    const sections = [
      '--- Execution Summary ---',
      `Session ID     : ${result.session_id}`,
      `Status         : ${status} (${subtype})`,
      `Timestamp      : ${timestamp}`,
      `Execution Time : ${result.duration_ms ?? 0}ms`,
      `API Time       : ${result.duration_api_ms ?? 0}ms`,
      `Turn Count     : ${result.num_turns ?? 0}`,
      `Estimated Cost : $${(result.total_cost_usd ?? 0).toFixed(4)}`,
      '',
      '--- Token Usage ---',
      `Input Tokens   : ${(result.usage?.input_tokens ?? 0).toLocaleString()}`,
      `Output Tokens  : ${(result.usage?.output_tokens ?? 0).toLocaleString()}`,
      `Total Tokens   : ${(result.usage?.total_tokens ?? (result.usage?.input_tokens ?? 0) + (result.usage?.output_tokens ?? 0)).toLocaleString()}`,
      '',
      '--- Result ---',
      resultContent,
      '',
    ];

    return sections.join('\n');
  }
}