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
  customSystemPrompt?: string; // @deprecated Use systemPrompt instead
  systemPromptFile?: string;
}

interface ArgDefinition {
  aliases: string[];
  hasValue: boolean;
  handler: (value: string | undefined, args: CLIArgs) => void;
  validator?: (value: string) => boolean;
  errorName?: string; // For maintaining original error message format
  expectedDescription?: string; // Description of expected value format
}

export class ArgumentParser {
  private static readonly ARG_DEFINITIONS: ArgDefinition[] = [
    {
      aliases: ['-i', '--input'],
      hasValue: true,
      handler: (value, args) => { if (value !== undefined) args.prompt = value; },
      errorName: '-i/--input'
    },
    {
      aliases: ['-f', '--file'],
      hasValue: true,
      handler: (value, args) => { if (value !== undefined) args.inputFile = value; },
      errorName: '-f/--file'
    },
    {
      aliases: ['--max-turns', '--maxTurns'],
      hasValue: true,
      handler: (value, args) => {
        if (value) {
          const maxTurns = parseInt(value, 10);
          if (!isNaN(maxTurns)) args.maxTurns = maxTurns;
        }
      },
      validator: (value) => !isNaN(parseInt(value, 10)),
      errorName: '--max-turns/--maxTurns',
      expectedDescription: 'Expected a positive integer'
    },
    {
      aliases: ['-c', '--continue'],
      hasValue: false,
      handler: (_, args) => { args.continue = true; }
    },
    {
      aliases: ['--resume'],
      hasValue: true,
      handler: (value, args) => { if (value !== undefined) args.sessionId = value; },
      validator: (value) => ValidationUtils.validateSessionId(value),
      errorName: '--resume',
      expectedDescription: 'Expected a valid session ID (alphanumeric, underscore, hyphen, max 100 chars)'
    },
    {
      aliases: ['--allowedTools', '--allowed-tools'],
      hasValue: true,
      handler: (value, args) => {
        if (value !== undefined) {
          args.allowedTools = value.replace(/\s/g, '').split(',').filter(t => t.length > 0);
        }
      },
      validator: (value) => {
        const tools = value.replace(/\s/g, '').split(',').filter(t => t.length > 0);
        return ValidationUtils.validateToolList(tools);
      },
      errorName: '--allowedTools/--allowed-tools',
      expectedDescription: 'Expected comma-separated list of valid tool names (e.g., "Read,Write,Bash")'
    },
    {
      aliases: ['--disallowedTools', '--disallowed-tools'],
      hasValue: true,
      handler: (value, args) => {
        if (value !== undefined) {
          args.disallowedTools = value.replace(/\s/g, '').split(',').filter(t => t.length > 0);
        }
      },
      validator: (value) => {
        const tools = value.replace(/\s/g, '').split(',').filter(t => t.length > 0);
        return ValidationUtils.validateToolList(tools);
      },
      errorName: '--disallowedTools/--disallowed-tools',
      expectedDescription: 'Expected comma-separated list of valid tool names (e.g., "Read,Write,Bash")'
    },
    {
      aliases: ['--permission-mode', '--permissionMode'],
      hasValue: true,
      handler: (value, args) => {
        if (value !== undefined && ValidationUtils.validatePermissionMode(value)) {
          args.permissionMode = value as 'default' | 'acceptEdits' | 'bypassPermissions' | 'plan';
        }
      },
      validator: (value) => ValidationUtils.validatePermissionMode(value),
      errorName: '--permission-mode/--permissionMode',
      expectedDescription: 'Expected "default", "acceptEdits", "bypassPermissions", or "plan"'
    },
    {
      aliases: ['--settingsFile', '--settings-file', '-s'],
      hasValue: true,
      handler: (value, args) => { if (value !== undefined) args.settingsFile = value; },
      errorName: '--settingsFile/--settings-file/-s'
    },
    {
      aliases: ['-o', '--output'],
      hasValue: false,
      handler: (_, args) => { args.outputEnabled = true; }
    },
    {
      aliases: ['--output-file', '--outputFile'],
      hasValue: true,
      handler: (value, args) => { if (value !== undefined) args.outputFile = value; },
      errorName: '--output-file/--outputFile'
    },
    {
      aliases: ['--output-dir', '--outputDir'],
      hasValue: true,
      handler: (value, args) => { if (value !== undefined) args.outputDir = value; },
      errorName: '--output-dir/--outputDir'
    },
    {
      aliases: ['--output-format', '--outputFormat'],
      hasValue: true,
      handler: (value, args) => {
        if (value !== undefined && (value === 'json' || value === 'text')) {
          args.outputFormat = value;
        }
      },
      validator: (value) => value === 'json' || value === 'text',
      errorName: '--output-format/--outputFormat',
      expectedDescription: 'Expected "json" or "text"'
    },
    {
      aliases: ['--output-enabled', '--outputEnabled'],
      hasValue: false,
      handler: (_, args) => { args.outputEnabled = true; }
    },
    {
      aliases: ['-h', '--help'],
      hasValue: false,
      handler: (_, args) => { args.help = true; }
    },
    {
      aliases: ['--custom-system-prompt', '--customSystemPrompt', '-csp', '--system-prompt', '-sp'],
      hasValue: true,
      handler: (value, args) => { if (value !== undefined) args.customSystemPrompt = value; },
      errorName: '--custom-system-prompt/--customSystemPrompt/-csp/--system-prompt/-sp'
    },
    {
      aliases: ['--system-prompt-file', '--systemPromptFile', '-sp-f'],
      hasValue: true,
      handler: (value, args) => { if (value !== undefined) args.systemPromptFile = value; },
      errorName: '--system-prompt-file/--systemPromptFile/-sp-f'
    }
  ];

  static parseArgs(argv: string[] = process.argv.slice(2)): CLIArgs {
    const args: CLIArgs = {};
    const processedIndices = new Set<number>();

    for (let i = 0; i < argv.length; i++) {
      if (processedIndices.has(i)) continue;
      
      const arg = argv[i];
      if (!arg) continue;
      
      const definition = this.ARG_DEFINITIONS.find(def => 
        def.aliases.includes(arg)
      );
      
      if (definition) {
        processedIndices.add(i);
        
        if (definition.hasValue) {
          const errorName = definition.errorName || arg;
          
          // Check if next argument exists and is valid
          if (i + 1 >= argv.length) {
            throw new Error(`Option ${errorName} requires a value`);
          }
          
          const nextArg = argv[i + 1];
          if (nextArg === undefined || nextArg.startsWith('-')) {
            throw new Error(`Option ${errorName} requires a value`);
          }
          
          // Validate value if validator exists
          if (definition.validator && !definition.validator(nextArg)) {
            throw new Error(`Invalid value for ${errorName}: "${nextArg}". ${this.getExpectedValueDescription(definition)}`);
          }
          
          definition.handler(nextArg, args);
          
          processedIndices.add(i + 1);
          i++; // Skip next argument as it's the value
        } else {
          definition.handler(undefined, args);
        }
      }
    }

    // If neither -i nor -f is specified, treat the first unprocessed argument as prompt
    if (!args.prompt && !args.inputFile && !args.help) {
      for (let i = 0; i < argv.length; i++) {
        if (!processedIndices.has(i)) {
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

  private static getExpectedValueDescription(definition: ArgDefinition): string {
    return definition.expectedDescription || 'Expected a valid value';
  }

  static validateArgs(args: CLIArgs): boolean {
    return this.getValidationError(args) === null;
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

    if (args.systemPromptFile !== undefined && (typeof args.systemPromptFile !== 'string' || args.systemPromptFile.trim().length === 0)) {
      return 'System prompt file path must be a non-empty string';
    }

    return null;
  }
}