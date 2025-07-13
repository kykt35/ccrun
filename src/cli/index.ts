import { ArgumentParser, CLIArgs } from './args';
import { HelpManager } from './help';
import { DisplayManager } from './display';
import { CCRunService } from '../core';
import { CCRunConfig, CCRunResult, SDKResultMessage } from '../core/types';
import { ConfigManager } from '../core/config';
import { FileOutputManager } from '../utils/file-output';
import { FileManager } from '../utils/file';

export class CLIManager {
  private ccrunService: CCRunService;

  constructor() {
    this.ccrunService = new CCRunService();
  }

  async run(argv?: string[]): Promise<void> {
    try {
      const args = ArgumentParser.parseArgs(argv);

      // Handle help command
      if (args.help) {
        console.log(HelpManager.generateHelp());
        return;
      }

      // Validate arguments
      const validationError = ArgumentParser.getValidationError(args);
      if (validationError) {
        console.error(DisplayManager.formatError(new Error(validationError)));
        console.log('\nUse --help for usage information');
        process.exit(1);
      }

      // Show startup message
      console.log('🚀 CCRun starting...\n');

      // Load settings and merge with CLI args
      const settings = await ConfigManager.loadSettings(args.settingsFile);
      const cliAllowed = args.allowedTools || [];
      const cliDenied = args.disallowedTools || [];
      const toolPermissions = ConfigManager.mergeToolPermissions(cliAllowed, cliDenied, settings);

      // Override customSystemPrompt from settings if not provided via CLI
      if (!args.customSystemPrompt && settings?.customSystemPrompt) {
        args.customSystemPrompt = settings.customSystemPrompt;
      }

      // Load system prompt from file if specified (customSystemPrompt takes priority)
      if (!args.customSystemPrompt && args.systemPromptFile) {
        try {
          args.customSystemPrompt = await FileManager.readFile(args.systemPromptFile);
        } catch (error) {
          console.error(DisplayManager.formatError(new Error(`Failed to load system prompt from file: ${error instanceof Error ? error.message : 'Unknown error'}`)));
          process.exit(1);
        }
      }

      // Process output settings
      const outputSettings = await this.processOutputSettings(args, settings);

      // Display permission mode
      console.log(`permissionMode: ${args.permissionMode || 'default'}\n`);

      // Display tool permissions like the original implementation
      const allowedTools = toolPermissions.allowedTools || [];
      const disallowedTools = toolPermissions.disallowedTools || [];
      console.log(`allowedTools: ${allowedTools.join(', ') || '(none specified)'}`);
      console.log(`disallowedTools: ${disallowedTools.join(', ') || '(none specified)'}`);

      // Display custom system prompt if provided
      if (args.customSystemPrompt) {
        const truncatedPrompt = args.customSystemPrompt.length > 50
          ? args.customSystemPrompt.substring(0, 50) + '...'
          : args.customSystemPrompt;
        console.log(`customSystemPrompt: "${truncatedPrompt}"`);
      }

      // Display output settings
      if (outputSettings.outputFile) {
        console.log(`output: ${outputSettings.outputFile === 'auto-generate' ? 'auto-generated' : outputSettings.outputFile} (${outputSettings.outputFormat})`);
      } else {
        console.log('output: disabled');
      }

      // Convert CLI args to core config with merged tool permissions
      const config = { ...this.argsToConfig(args), ...toolPermissions };
      // Check for bypassPermissions mode and ask for confirmation
      if (config.permissionMode === 'bypassPermissions') {
        const confirmed = await this.confirmBypassPermissions();
        if (!confirmed) {
          console.log('Operation cancelled by user.');
          process.exit(0);
        }
      }

      // Execute the request
      const startTime = Date.now();
      const generator = this.ccrunService.execute(
        args.prompt,
        args.inputFile,
        config
      );

      // Process streaming results
      let sessionId: string | undefined;
      let finalResult: SDKResultMessage | undefined;
      const usedTools: string[] = [];

      for await (const chunk of generator) {
        if (chunk && typeof chunk === 'object') {
          // Check if this is the final result

          if (chunk.type === 'result') {
            const result = chunk as SDKResultMessage;
            this.displayResult(result);
            sessionId = result.session_id;
            finalResult = result;
            break;
          }

          // Handle streaming messages
          this.handleStreamChunk(chunk, usedTools);

          // Extract session ID from system messages
          if (chunk.type === 'system' && chunk.session_id) {
            sessionId = chunk.session_id;
          }
        }
      }

      // Handle file output if enabled and result is available
      if (outputSettings.outputFile && finalResult) {
        try {
          await this.handleFileOutput(finalResult, outputSettings, config, args, settings, startTime);
        } catch (error) {
          console.error(`\n⚠️  File output failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
      }

      // Show final session info
      if (sessionId) {
        console.log(DisplayManager.formatSessionInfo(sessionId));
      }

      // Show used tools summary
      if (usedTools.length > 0) {
        console.log(`🔧 Tools used: ${usedTools.join(', ')}`);
      }

    } catch (error) {
      this.displayError(error instanceof Error ? error : new Error(String(error)));
      process.exit(1);
    }
  }

  displayResult(result: SDKResultMessage): void {
    console.log(DisplayManager.formatResult(result));
  }

  displayError(error: Error): void {
    console.error(DisplayManager.formatError(error));
  }

  private argsToConfig(args: CLIArgs): Partial<CCRunConfig> {
    const config: Partial<CCRunConfig> = {};

    if (args.maxTurns !== undefined) {
      config.maxTurns = args.maxTurns;
    }

    if (args.allowedTools) {
      config.allowedTools = args.allowedTools;
    }

    if (args.disallowedTools) {
      config.disallowedTools = args.disallowedTools;
    }

    if (args.continue) {
      config.continue = true;
    }

    if (args.sessionId) {
      config.resume = args.sessionId;
    }

    if (args.permissionMode) {
      config.permissionMode = args.permissionMode;
    }

    if (args.customSystemPrompt) {
      config.customSystemPrompt = args.customSystemPrompt;
    }

    return config;
  }

  private async processOutputSettings(args: CLIArgs, settings: any): Promise<{
    outputFile: string | null;
    outputFormat: 'json' | 'text';
  }> {
    return ConfigManager.mergeOutputSettings(
      args.outputFile,
      args.outputDir,
      args.outputFormat,
      args.outputEnabled,
      settings
    );
  }

  private async handleFileOutput(
    result: SDKResultMessage,
    outputSettings: { outputFile: string | null; outputFormat: 'json' | 'text' },
    config: CCRunConfig,
    args: CLIArgs,
    settings: any,
    startTime: number
  ): Promise<void> {
    if (!outputSettings.outputFile) {
      return;
    }

    // Convert to SDK format
    const sdkResult = result;

    // Resolve the actual output path
    const resolvedPath = outputSettings.outputFile === 'auto-generate'
      ? FileOutputManager.resolveOutputPath(args.outputFile, args.outputDir, args.outputEnabled, settings)
      : outputSettings.outputFile;

    if (!resolvedPath) {
      return;
    }

    // Write the result to file
    await FileOutputManager.writeResult(
      resolvedPath,
      sdkResult,
      outputSettings.outputFormat,
      config
    );

    console.log(`\n📄 Result saved to: ${resolvedPath}`);
  }

  private handleStreamChunk(chunk: any, usedTools: string[]): void {
    // Display the message
    const formatted = DisplayManager.formatMessage(chunk);
    if (formatted.trim()) {
      console.log(formatted);
    }

    // Track tool usage
    if (chunk.type === 'assistant' && chunk.message?.content) {
      for (const content of chunk.message.content) {
        if (content.type === 'tool_use' && content.name) {
          if (!usedTools.includes(content.name)) {
            usedTools.push(content.name);
          }
        }
      }
    }
  }

  private async confirmBypassPermissions(): Promise<boolean> {
    const readline = require('readline').createInterface({
      input: process.stdin,
      output: process.stdout
    });

    return new Promise((resolve) => {
      console.log('⚠️  WARNING: You are about to use bypassPermissions mode.');
      console.log('This mode will bypass all permission checks and may perform actions without confirmation.');
      readline.question('Are you sure you want to continue? (y/N): ', (answer: string) => {
        readline.close();
        resolve(answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes');
      });
    });
  }

  async cleanup(): Promise<void> {
    await this.ccrunService.cleanup();
  }
}

// Export for use in main entry point
export async function runCLI(argv?: string[]): Promise<void> {
  const cli = new CLIManager();

  // Handle graceful shutdown
  process.on('SIGINT', async () => {
    console.log('\n\n🛑 Interrupted by user');
    await cli.cleanup();
    process.exit(0);
  });

  process.on('SIGTERM', async () => {
    console.log('\n\n🛑 Terminated');
    await cli.cleanup();
    process.exit(0);
  });

  await cli.run(argv);
}