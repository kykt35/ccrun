export interface CLIArgs {
  prompt?: string;
  inputFile?: string;
  maxTurns?: number;
  sessionId?: string;
  allowedTools?: string[];
  disallowedTools?: string[];
  continue?: boolean;
  help?: boolean;
}

export class ArgumentParser {
  static parseArgs(argv: string[] = process.argv.slice(2)): CLIArgs {
    const args: CLIArgs = {};
    let consumed = new Set<number>();

    for (let i = 0; i < argv.length; i++) {
      const arg = argv[i];

      if (arg === '-i' || arg === '--input') {
        args.prompt = argv[++i];
        consumed.add(i - 1);
        consumed.add(i);
      } else if (arg === '-f' || arg === '--file') {
        args.inputFile = argv[++i];
        consumed.add(i - 1);
        consumed.add(i);
      } else if (arg === '--max-turns') {
        const maxTurns = parseInt(argv[++i], 10);
        if (!isNaN(maxTurns)) {
          args.maxTurns = maxTurns;
        }
        consumed.add(i - 1);
        consumed.add(i);
      } else if (arg === '-c' || arg === '--continue') {
        args.continue = true;
        consumed.add(i);
      } else if (arg === '--resume') {
        args.sessionId = argv[++i];
        consumed.add(i - 1);
        consumed.add(i);
      } else if (arg === '--allowedTools') {
        const tools = argv[++i];
        args.allowedTools = tools ? tools.replace(/\s/g, '').split(',').filter(t => t.length > 0) : [];
        consumed.add(i - 1);
        consumed.add(i);
      } else if (arg === '--disallowedTools') {
        const tools = argv[++i];
        args.disallowedTools = tools ? tools.replace(/\s/g, '').split(',').filter(t => t.length > 0) : [];
        consumed.add(i - 1);
        consumed.add(i);
      } else if (arg === '-h' || arg === '--help') {
        args.help = true;
        consumed.add(i);
      }
    }

    // If neither -i nor -f is specified, treat the first unconsumed argument as prompt
    if (!args.prompt && !args.inputFile && !args.help) {
      for (let i = 0; i < argv.length; i++) {
        if (!consumed.has(i)) {
          args.prompt = argv[i];
          break;
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

    // Cannot use both continue and resume
    if (args.continue && args.sessionId) {
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

    if (args.continue && args.sessionId) {
      return 'Cannot use both --continue and --resume options';
    }

    return null;
  }
}