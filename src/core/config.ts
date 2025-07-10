import { readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync } from 'fs';
import { CCRunConfig, Settings, ToolPermissions } from './types';

export class ConfigManager {
  private static readonly SETTINGS_PATHS = [
    ".ccrun/settings.local.json",
    ".ccrun/settings.json"
  ];

  static async loadSettings(customPath?: string): Promise<Settings | null> {
    const baseDir = process.cwd();

    // 1. 引数で指定されたファイルを最優先
    if (customPath) {
      const absPath = join(baseDir, customPath);
      if (existsSync(absPath)) {
        try {
          const content = await readFile(absPath, 'utf-8');
          const settings = JSON.parse(content);
          console.log(`${customPath} was loaded`);
          return settings;
        } catch (error) {
          console.error(`${customPath} failed to load or parse: ${(error as Error).message}`);
          process.exit(1);
        }
      } else {
        console.error(`Specified settings file not found: ${customPath}`);
        process.exit(1);
      }
    }

    // 2. デフォルトのファイルを順番にチェック
    for (const relPath of this.SETTINGS_PATHS) {
      const absPath = join(baseDir, relPath);
      if (existsSync(absPath)) {
        try {
          const content = await readFile(absPath, 'utf-8');
          const settings = JSON.parse(content);
          console.log(`${relPath} was loaded`);
          return settings;
        } catch (error) {
          console.error(`${relPath} failed to load or parse: ${(error as Error).message}`);
          process.exit(1);
        }
      }
    }
    return null;
  }

  static mergeToolPermissions(
    cliAllowed: string[] = [],
    cliDenied: string[] = [],
    settings: Settings | null = null
  ): ToolPermissions {
    const settingsAllowed = settings?.permissions?.allow || [];
    const settingsDenied = settings?.permissions?.deny || [];

    const mergedAllowed = [...new Set([...cliAllowed, ...settingsAllowed])];
    const mergedDenied = [...new Set([...cliDenied, ...settingsDenied])];

    const result: ToolPermissions = {};

    if (mergedAllowed.length > 0) {
      result.allowedTools = mergedAllowed;
    }

    if (mergedDenied.length > 0) {
      result.disallowedTools = mergedDenied;
    }

    return result;
  }

  static validateConfig(config: CCRunConfig): boolean {
    if (!config.prompt && !config.inputFile) {
      return false;
    }

    if (config.maxTurns !== undefined && (config.maxTurns <= 0 || config.maxTurns > 100)) {
      return false;
    }

    if (config.sessionId && typeof config.sessionId !== 'string') {
      return false;
    }

    if (config.allowedTools && !Array.isArray(config.allowedTools)) {
      return false;
    }

    if (config.disallowedTools && !Array.isArray(config.disallowedTools)) {
      return false;
    }

    return true;
  }

  static mergeOutputSettings(
    cliOutput?: string,
    _cliOutputDir?: string,
    cliOutputFormat?: 'json' | 'text',
    cliOutputEnabled?: boolean,
    settings?: Settings | null
  ): {
    outputFile: string | null;
    outputFormat: 'json' | 'text';
  } {
    // Determine output format (CLI takes precedence over settings root level)
    const outputFormat = cliOutputFormat || settings?.outputFormat || 'json';

    // Output is disabled by default. Only enable if:
    // 1. --output flag is provided (with file path)
    // 2. --output flag is provided (without file path)
    // 3. Settings file has output enabled
    // 4. Settings file has outputFile specified
    const outputEnabled = !!(cliOutput || cliOutputEnabled || settings?.output?.enabled || settings?.outputFile);

    if (!outputEnabled) {
      return {
        outputFile: null,
        outputFormat
      };
    }

    // If specific output file is provided via CLI
    if (cliOutput) {
      return {
        outputFile: cliOutput,
        outputFormat
      };
    }

    // If specific output file is provided via settings
    if (settings?.outputFile) {
      return {
        outputFile: settings.outputFile,
        outputFormat
      };
    }

    // Use default output path generation with output directory
    return {
      outputFile: 'auto-generate', // This will be handled by FileOutputManager
      outputFormat
    };
  }

  static async createConfig(
    prompt?: string,
    inputFile?: string,
    options: Partial<CCRunConfig> = {}
  ): Promise<CCRunConfig> {
    // If tool permissions are already provided (from CLI layer), don't reload settings
    const settings = (options.allowedTools !== undefined || options.disallowedTools !== undefined)
      ? null
      : await this.loadSettings();

    const toolPermissions = this.mergeToolPermissions(
      options.allowedTools,
      options.disallowedTools,
      settings
    );

    const config: CCRunConfig = {
      maxTurns: options.maxTurns || settings?.maxTurns || 50,
      continue: options.continue || false,
      ...toolPermissions
    };

    if (prompt !== undefined) {
      config.prompt = prompt;
    }

    if (inputFile !== undefined) {
      config.inputFile = inputFile;
    }

    if (options.sessionId !== undefined) {
      config.sessionId = options.sessionId;
    }

    if (options.resume !== undefined) {
      config.resume = options.resume;
    }

    if (options.customSystemPrompt !== undefined) {
      config.customSystemPrompt = options.customSystemPrompt;
    }

    if (!this.validateConfig(config)) {
      throw new Error('Invalid configuration provided');
    }

    return config;
  }
}