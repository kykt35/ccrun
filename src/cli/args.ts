import { ValidationUtils } from '../utils/validation';

export interface CLIArgs {
  prompt?: string;
  inputFile?: string;
  maxTurns?: number;
  sessionId?: string;
  allowedTools?: string[];
  disallowedTools?: string[];
  continue?: boolean;
  help?: boolean;
  permissionMode?: 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';
  settingsFile?: string;
  outputFile?: string;
  outputDir?: string;
  outputFormat?: 'json' | 'text';
  outputEnabled?: boolean;
  customSystemPrompt?: string;
}

export class ArgumentParser {
  static parseArgs(argv: string[] = process.argv.slice(2)): CLIArgs {
    const args: CLIArgs = {};
    let consumed = new Set<number>();

    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];

      if (arg === '-i' || arg === '--input') {
        const nextArg = argv[++i];
        if (nextArg !== undefined) {
          args.prompt = nextArg;
        }
        consumed.add(i - 1);
        consumed.add(i);
      } else if (arg === '-f' || arg === '--file') {
        const nextArg = argv[++i];
        if (nextArg !== undefined) {
          args.inputFile = nextArg;
        }
        consumed.add(i - 1);
        consumed.add(i);
      } else if (arg === '--max-turns') {
        const nextArg = argv[++i];
        if (nextArg !== undefined) {
          const maxTurns = parseInt(nextArg, 10);
          if (!isNaN(maxTurns)) {
            args.maxTurns = maxTurns;
          }
        }
        consumed.add(i - 1);
        consumed.add(i);
      } else if (arg === '-c' || arg === '--continue') {
        args.continue = true;
        consumed.add(i);
      } else if (arg === '--resume') {
        const nextArg = argv[++i];
        if (nextArg !== undefined) {
          args.sessionId = nextArg;
        }
        consumed.add(i - 1);
        consumed.add(i);
      } else if (arg === '--allowedTools') {
        const tools = argv[++i];
        if (tools !== undefined) {
          args.allowedTools = tools.replace(/\s/g, '').split(',').filter(t => t.length > 0);
        }
        consumed.add(i - 1);
        consumed.add(i);
      } else if (arg === '--disallowedTools') {
        const tools = argv[++i];
        if (tools !== undefined) {
          args.disallowedTools = tools.replace(/\s/g, '').split(',').filter(t => t.length > 0);
        }
        consumed.add(i - 1);
        consumed.add(i);
      } else if (arg === '--permission-mode') {
        const nextArg = argv[++i];
        if (nextArg !== undefined && ValidationUtils.validatePermissionMode(nextArg)) {
          args.permissionMode = nextArg as 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';
        }
        consumed.add(i - 1);
        consumed.add(i);
      } else if (arg === '--settingFile' || arg === '-s') {
        const nextArg = argv[++i];
        if (nextArg !== undefined) {
          args.settingsFile = nextArg;
        }
        consumed.add(i - 1);
        consumed.add(i);
      } else if (arg === '-o' || arg === '--output') {
        // -o always acts as --output (enable output with auto-generated filename)
        args.outputEnabled = true;
        consumed.add(i);
      } else if (arg === '--output-file') {
        const nextArg = argv[++i];
        if (nextArg !== undefined) {
          args.outputFile = nextArg;
        }
        consumed.add(i - 1);
        consumed.add(i);
      } else if (arg === '--output-dir') {
        const nextArg = argv[++i];
        if (nextArg !== undefined) {
          args.outputDir = nextArg;
        }
        consumed.add(i - 1);
        consumed.add(i);
      } else if (arg === '--output-format') {
        const nextArg = argv[++i];
        if (nextArg !== undefined && (nextArg === 'json' || nextArg === 'text')) {
          args.outputFormat = nextArg;
        }
        consumed.add(i - 1);
        consumed.add(i);
      } else if (arg === '--output-enabled') {
        args.outputEnabled = true;
        consumed.add(i);
      } else if (arg === '-h' || arg === '--help') {
        args.help = true;
        consumed.add(i);
      } else if (arg === '--custom-system-prompt' || arg === '-csp') {
        const nextArg = argv[++i];
        if (nextArg !== undefined) {
          args.customSystemPrompt = nextArg;
        }
        consumed.add(i - 1);
        consumed.add(i);
      }
    }

    // If neither -i nor -f is specified, treat the first unconsumed argument as prompt
    if (!args.prompt && !args.inputFile && !args.help) {
      for (let i = 0; i < argv.length; i++) {
        if (!consumed.has(i)) {
          const unconsumedArg = argv[i];
          if (unconsumedArg !== undefined) {
            args.prompt = unconsumedArg;
            break;
          }
        }
      }
    }

    return args;
  }

  static validateArgs(args: CLIArgs): boolean {
    // Help command is always valid
    if (args.help) {
      return true;
    }

    // Must have either prompt or input file
    if (!args.prompt && !args.inputFile) {
      return false;
    }

    // Validate maxTurns if provided
    if (args.maxTurns !== undefined && (args.maxTurns <= 0 || args.maxTurns > 100)) {
      return false;
    }

    // Validate sessionId if provided
    if (args.sessionId !== undefined && (typeof args.sessionId !== 'string' || args.sessionId.trim().length === 0)) {
      return false;
    }

    // Validate settingsFile if provided
    if (args.settingsFile !== undefined && (typeof args.settingsFile !== 'string' || args.settingsFile.trim().length === 0)) {
      return false;
    }

    // Cannot use both continue and resume
    if (args.continue && args.sessionId) {
      return false;
    }

    // Validate output format if provided
    if (args.outputFormat !== undefined && args.outputFormat !== 'json' && args.outputFormat !== 'text') {
      return false;
    }

    // Validate output-related arguments
    if (args.outputFile !== undefined && (typeof args.outputFile !== 'string' || args.outputFile.trim().length === 0)) {
      return false;
    }

    if (args.outputDir !== undefined && (typeof args.outputDir !== 'string' || args.outputDir.trim().length === 0)) {
      return false;
    }

    // No conflicting options to check for output

    // Validate customSystemPrompt if provided
    if (args.customSystemPrompt !== undefined && (typeof args.customSystemPrompt !== 'string' || args.customSystemPrompt.trim().length === 0)) {
      return false;
    }

    return true;
  }

  static getValidationError(args: CLIArgs): string | null {
    if (args.help) {
      return null;
    }

    if (!args.prompt && !args.inputFile) {
      return 'Please provide either -i <prompt> or -f <file>';
    }

    if (args.maxTurns !== undefined && (args.maxTurns <= 0 || args.maxTurns > 100)) {
      return 'Max turns must be between 1 and 100';
    }

    if (args.sessionId !== undefined && (typeof args.sessionId !== 'string' || args.sessionId.trim().length === 0)) {
      return 'Session ID must be a non-empty string';
    }

    if (args.settingsFile !== undefined && (typeof args.settingsFile !== 'string' || args.settingsFile.trim().length === 0)) {
      return 'Settings file path must be a non-empty string';
    }

    if (args.continue && args.sessionId) {
      return 'Cannot use both --continue and --resume options';
    }

    if (args.outputFormat !== undefined && args.outputFormat !== 'json' && args.outputFormat !== 'text') {
      return 'Output format must be either "json" or "text"';
    }

    if (args.outputFile !== undefined && (typeof args.outputFile !== 'string' || args.outputFile.trim().length === 0)) {
      return 'Output file path must be a non-empty string';
    }

    if (args.outputDir !== undefined && (typeof args.outputDir !== 'string' || args.outputDir.trim().length === 0)) {
      return 'Output directory path must be a non-empty string';
    }

    if (args.customSystemPrompt !== undefined && (typeof args.customSystemPrompt !== 'string' || args.customSystemPrompt.trim().length === 0)) {
      return 'Custom system prompt must be a non-empty string';
    }

    return null;
  }
}