import { ArgumentParser, CLIArgs } from './args';
import { HelpManager } from './help';
import { DisplayManager } from './display';
import { CCRunService } from '../core';
import { CCRunConfig, CCRunResult } from '../core/types';
import { ConfigManager } from '../core/config';

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
      const settings = await ConfigManager.loadSettings();
      const cliAllowed = args.allowedTools || [];
      const cliDenied = args.disallowedTools || [];
      const toolPermissions = ConfigManager.mergeToolPermissions(cliAllowed, cliDenied, settings);
      
      // Display tool permissions like the original implementation
      const allowedTools = toolPermissions.allowedTools || [];
      const disallowedTools = toolPermissions.disallowedTools || [];
      console.log(`allowedTools: ${allowedTools.join(', ') || '(none specified)'}`);
      console.log(`disallowedTools: ${disallowedTools.join(', ') || '(none specified)'}\n`);

      // Convert CLI args to core config with merged tool permissions
      const config = { ...this.argsToConfig(args), ...toolPermissions };
      
      // Execute the request
      const generator = this.ccrunService.execute(
        args.prompt,
        args.inputFile,
        config
      );
      
      // Process streaming results
      let sessionId: string | undefined;
      const usedTools: string[] = [];

      for await (const chunk of generator) {
        if (chunk && typeof chunk === 'object') {
          // Check if this is the final result
          if ('success' in chunk) {
            const result = chunk as CCRunResult;
            this.displayResult(result);
            sessionId = result.sessionId;
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

  displayResult(result: CCRunResult): void {
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

    return config;
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