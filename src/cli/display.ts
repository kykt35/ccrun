import { CCRunResult, Message } from '../core/types';

export class DisplayManager {
  static formatMessage(message: any): string {
    if (!message) return '';

    switch (message.type) {
      case 'system':
        return this.formatSystemMessage(message);
      case 'assistant':
      case 'user':
        return this.formatChatMessage(message);
      case 'result':
        return this.formatResultMessage(message);
      default:
        return this.formatGenericMessage(message);
    }
  }

  static formatError(error: Error): string {
    const errorLines = [
      '❌ Error occurred:',
      `   ${error.message}`,
      ''
    ];

    if (error.stack && process.env.DEBUG) {
      errorLines.push('Stack trace:');
      errorLines.push(error.stack);
      errorLines.push('');
    }

    return errorLines.join('\n');
  }

  static formatUsage(usage: any): string {
    if (!usage) return '';

    const lines = ['📊 Usage Summary:'];

    if (usage.input_tokens) {
      lines.push(`   Input tokens: ${usage.input_tokens.toLocaleString()}`);
    }
    if (usage.output_tokens) {
      lines.push(`   Output tokens: ${usage.output_tokens.toLocaleString()}`);
    }
    if (usage.total_tokens) {
      lines.push(`   Total tokens: ${usage.total_tokens.toLocaleString()}`);
    }
    if (usage.cost) {
      lines.push(`   Estimated cost: $${usage.cost.toFixed(4)}`);
    }

    lines.push('');
    return lines.join('\n');
  }

  static showProgress(progress: number): void {
    const width = 50;
    const filled = Math.round(width * (progress / 100));
    const empty = width - filled;

    const bar = '█'.repeat(filled) + '░'.repeat(empty);
    process.stdout.write(`\r🔄 Progress: [${bar}] ${progress.toFixed(1)}%`);

    if (progress >= 100) {
      process.stdout.write('\n');
    }
  }

  static formatSessionInfo(sessionId: string): string {
    return `🔗 Session ID: ${sessionId}\n💡 Continue with claude code: claude --continue or claude --resume ${sessionId}\n`;
  }

  static formatResult(result: CCRunResult): string {
    const lines: string[] = [];

    if (result.success) {
      lines.push('✅ Task completed successfully');
    } else {
      lines.push('❌ Task failed');
      if (result.error) {
        lines.push(`   Error: ${result.error}`);
      }
    }

    if (result.sessionId) {
      lines.push(`   Session: ${result.sessionId}`);
    }

    if (result.messages && result.messages.length > 0) {
      lines.push(`   Messages: ${result.messages.length} exchanged`);
    }

    lines.push('');
    return lines.join('\n');
  }

  private static formatSystemMessage(message: any): string {
    const lines = [`\n🔧 ${message.type.toUpperCase()}`];

    if (message.session_id) {
      lines.push(`Session ID: ${message.session_id}`);
    }

    if (message.tools) {
      lines.push(`Available tools: ${message.tools.join(', ')}`);
    }

    lines.push('');
    return lines.join('\n');
  }

  private static formatChatMessage(message: any): string {
    const icon = message.type === 'assistant' ? '🤖' : '👤';
    const lines = [`\n${icon} ${message.type.toUpperCase()}`];

    if (message.message?.content) {
      for (const content of message.message.content) {
        if (content.type === 'text') {
          lines.push(content.text);
        } else if (content.type === 'tool_use') {
          lines.push(this.formatToolUse(content));
        } else if (content.type === 'tool_result') {
          lines.push(this.formatToolResult(content));
        }
      }
    }

    lines.push('');
    return lines.join('\n');
  }

  private static formatResultMessage(message: any): string {
    const lines = ['\n📊 RESULT'];

    if (message.subtype === 'success') {
      lines.push('✅ Task completed successfully');
    } else if (message.subtype === 'error_max_turns') {
      lines.push('⚠️  Maximum turns reached');
    } else if (message.subtype === 'error_during_execution') {
      lines.push('❌ Error during execution');
    }

    if (message.result) {
      lines.push(`Result: ${message.result}`);
    }

    if (message.usage) {
      lines.push(this.formatUsage(message.usage).trim());
    }

    lines.push('');
    return lines.join('\n');
  }

  private static formatGenericMessage(message: any): string {
    const lines = [`\n📝 ${message.type?.toUpperCase() || 'MESSAGE'}`];

    if (typeof message === 'string') {
      lines.push(message);
    } else {
      lines.push(JSON.stringify(message, null, 2));
    }

    lines.push('');
    return lines.join('\n');
  }

  private static formatToolUse(tool: any): string {
    const lines = [`🔧 Tool: ${tool.name}`];

    if (tool.input && typeof tool.input === 'object') {
      if (tool.name === 'TodoWrite' && tool.input.todos) {
        lines.push('Todo items:');
        for (const todo of tool.input.todos) {
          lines.push(`  • ${todo.content} (${todo.status})`);
        }
      } else {
        const inputStr = JSON.stringify(tool.input, null, 2);
        if (inputStr.length > 200) {
          lines.push('Input: [Large object, truncated]');
        } else {
          lines.push(`Input: ${inputStr}`);
        }
      }
    }

    return lines.join('\n');
  }

  private static formatToolResult(result: any): string {
    const lines = ['🔧 Tool Result:'];

    if (typeof result.content === 'string') {
      const content = result.content.length > 500
        ? result.content.substring(0, 500) + '...\n[Content truncated]'
        : result.content;
      lines.push(content);
    } else {
      lines.push(JSON.stringify(result.content, null, 2));
    }

    return lines.join('\n');
  }

  static clearLine(): void {
    process.stdout.write('\r\x1b[K');
  }

  static showSpinner(message: string): NodeJS.Timeout {
    const frames = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏'];
    let i = 0;

    return setInterval(() => {
      process.stdout.write(`\r${frames[i]} ${message}`);
      i = (i + 1) % frames.length;
    }, 100);
  }

  static stopSpinner(spinner: NodeJS.Timeout): void {
    clearInterval(spinner);
    this.clearLine();
  }
}