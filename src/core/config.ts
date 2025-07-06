import { readFile } from 'fs/promises';
import { join } from 'path';
import { homedir } from 'os';
import { existsSync } from 'fs';
import { CCRunConfig, Settings, ToolPermissions } from './types';

export class ConfigManager {
  private static readonly SETTINGS_PATHS = [
    ".claude/settings.local.json",
    ".claude/settings.json"
  ];

  static async loadSettings(): Promise<Settings | null> {
    const baseDir = process.cwd();
    
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

    return {
      allowedTools: mergedAllowed.length > 0 ? mergedAllowed : undefined,
      disallowedTools: mergedDenied.length > 0 ? mergedDenied : undefined
    };
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
      prompt,
      inputFile,
      maxTurns: options.maxTurns || settings?.maxTurns || 50,
      sessionId: options.sessionId,
      continue: options.continue || false,
      resume: options.resume,
      ...toolPermissions
    };

    if (!this.validateConfig(config)) {
      throw new Error('Invalid configuration provided');
    }

    return config;
  }
}