import { CCRunConfig, CCRunResult } from './types';
import { ConfigManager } from './config';
import { ClaudeWrapper } from './claude';
import { FileManager } from '../utils/file';
import { ValidationUtils } from '../utils/validation';

export class CCRunService {
  private claudeWrapper: ClaudeWrapper;

  constructor() {
    this.claudeWrapper = new ClaudeWrapper();
  }

  async *execute(
    prompt?: string,
    inputFile?: string,
    options: Partial<CCRunConfig> = {}
  ): AsyncGenerator<any, CCRunResult> {
    try {
      const config = await this.prepareConfig(prompt, inputFile, options);
      const finalPrompt = await this.resolvePrompt(config);
      
      // Use the simplified ClaudeWrapper
      return yield* this.claudeWrapper.executeQuery(finalPrompt, config);
    } catch (error) {
      throw new Error(`CCRun execution failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  private async prepareConfig(
    prompt?: string,
    inputFile?: string,
    options: Partial<CCRunConfig> = {}
  ): Promise<CCRunConfig> {
    const config = await ConfigManager.createConfig(prompt, inputFile, options);

    if (!this.validateConfig(config)) {
      throw new Error('Invalid configuration provided');
    }

    return config;
  }

  private async resolvePrompt(config: CCRunConfig): Promise<string> {
    if (!config.prompt && !config.inputFile) {
      throw new Error('No prompt or input file provided');
    }

    let prompt = '';

    if (config.inputFile) {
      if (!FileManager.validatePath(config.inputFile)) {
        throw new Error(`Invalid or non-existent file: ${config.inputFile}`);
      }
      const fileContent = await FileManager.readFile(config.inputFile);
      prompt = `\n\n# Input File\n${fileContent}\n\n`;
    }

    if (config.prompt) {
      prompt = prompt + `\n\n# Prompt\n${config.prompt}\n\n`;
    }

    return prompt;
  }

  private validateConfig(config: CCRunConfig): boolean {
    if (!ConfigManager.validateConfig(config)) {
      return false;
    }

    if (config.allowedTools && !ValidationUtils.validateToolList(config.allowedTools)) {
      return false;
    }

    if (config.disallowedTools && !ValidationUtils.validateToolList(config.disallowedTools)) {
      return false;
    }

    if (config.maxTurns && !ValidationUtils.validateMaxTurns(config.maxTurns)) {
      return false;
    }

    if (config.sessionId && !ValidationUtils.validateSessionId(config.sessionId)) {
      return false;
    }

    return true;
  }

  async cleanup(): Promise<void> {
    await this.claudeWrapper.cleanup();
  }
}