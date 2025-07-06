export class ValidationUtils {
  static validateToolList(tools: string[]): boolean {
    if (!Array.isArray(tools)) {
      return false;
    }

    if (tools.length === 0) {
      return true;
    }

    const validTools = [
      'Read', 'Write', 'Edit', 'MultiEdit', 'Bash', 'Glob', 'Grep', 
      'LS', 'WebFetch', 'WebSearch', 'TodoRead', 'TodoWrite', 'Task'
    ];

    return tools.every(tool => 
      typeof tool === 'string' && 
      tool.trim().length > 0 && 
      validTools.includes(tool.trim())
    );
  }

  static validateMaxTurns(maxTurns: number): boolean {
    return typeof maxTurns === 'number' && 
           Number.isInteger(maxTurns) && 
           maxTurns > 0 && 
           maxTurns <= 100;
  }

  static validateSessionId(sessionId: string): boolean {
    if (!sessionId || typeof sessionId !== 'string') {
      return false;
    }

    const trimmed = sessionId.trim();
    
    if (trimmed.length === 0) {
      return false;
    }

    const sessionIdRegex = /^[a-zA-Z0-9_-]+$/;
    return sessionIdRegex.test(trimmed) && trimmed.length <= 100;
  }
}