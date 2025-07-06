import { HelpManager } from '../../src/cli/help';

describe('HelpManager', () => {
  describe('generateHelp', () => {
    it('should generate complete help text', () => {
      const help = HelpManager.generateHelp();
      
      expect(help).toContain('Usage: ccrun');
      expect(help).toContain('Options:');
      expect(help).toContain('Examples:');
      expect(help).toContain('CCRun is a CLI tool');
    });

    it('should include all main sections', () => {
      const help = HelpManager.generateHelp();
      
      expect(help).toContain('Usage:');
      expect(help).toContain('CCRun is a CLI tool');
      expect(help).toContain('-i, --input');
      expect(help).toContain('-f, --file');
      expect(help).toContain('Examples:');
    });
  });

  describe('generateUsage', () => {
    it('should generate usage examples', () => {
      const usage = HelpManager.generateUsage();
      
      expect(usage).toContain('Usage: ccrun [options]');
      expect(usage).toContain('ccrun -i <prompt>');
      expect(usage).toContain('ccrun -f <file>');
      expect(usage).toContain('ccrun --continue');
      expect(usage).toContain('ccrun --resume');
    });
  });

  describe('generateDescription', () => {
    it('should generate project description', () => {
      const description = HelpManager.generateDescription();
      
      expect(description).toContain('CCRun is a CLI tool');
      expect(description).toContain('Claude Code API');
      expect(description).toContain('direct prompts');
      expect(description).toContain('file input');
      expect(description).toContain('session continuation');
    });
  });

  describe('generateOptionsHelp', () => {
    it('should list all CLI options', () => {
      const options = HelpManager.generateOptionsHelp();
      
      expect(options).toContain('-i, --input');
      expect(options).toContain('-f, --file');
      expect(options).toContain('--max-turns');
      expect(options).toContain('-c, --continue');
      expect(options).toContain('--resume');
      expect(options).toContain('--allowedTools');
      expect(options).toContain('--disallowedTools');
      expect(options).toContain('-h, --help');
    });

    it('should include available tools list', () => {
      const options = HelpManager.generateOptionsHelp();
      
      expect(options).toContain('Available Tools:');
      expect(options).toContain('Read');
      expect(options).toContain('Write');
      expect(options).toContain('Bash');
      expect(options).toContain('TodoRead');
    });
  });

  describe('generateExamples', () => {
    it('should provide practical examples', () => {
      const examples = HelpManager.generateExamples();
      
      expect(examples).toContain('Examples:');
      expect(examples).toContain('ccrun -i "');
      expect(examples).toContain('ccrun -f prompt.txt');
      expect(examples).toContain('ccrun --continue');
      expect(examples).toContain('ccrun --resume');
      expect(examples).toContain('--allowedTools');
      expect(examples).toContain('--disallowedTools');
    });

    it('should show various use cases', () => {
      const examples = HelpManager.generateExamples();
      
      expect(examples).toContain('Direct prompt');
      expect(examples).toContain('File input');
      expect(examples).toContain('Continue previous session');
      expect(examples).toContain('Resume specific session');
      expect(examples).toContain('Tool filtering');
    });
  });

  describe('generateToolsHelp', () => {
    it('should categorize tools properly', () => {
      const toolsHelp = HelpManager.generateToolsHelp();
      
      expect(toolsHelp).toContain('File Operations:');
      expect(toolsHelp).toContain('System Operations:');
      expect(toolsHelp).toContain('Web Operations:');
      expect(toolsHelp).toContain('Task Management:');
    });

    it('should include tool usage examples', () => {
      const toolsHelp = HelpManager.generateToolsHelp();
      
      expect(toolsHelp).toContain('--allowedTools');
      expect(toolsHelp).toContain('--disallowedTools');
      expect(toolsHelp).toContain('case-sensitive');
    });
  });

  describe('generateSessionHelp', () => {
    it('should explain session management', () => {
      const sessionHelp = HelpManager.generateSessionHelp();
      
      expect(sessionHelp).toContain('Session Management:');
      expect(sessionHelp).toContain('Continue Previous Session:');
      expect(sessionHelp).toContain('Resume Specific Session:');
      expect(sessionHelp).toContain('--continue');
      expect(sessionHelp).toContain('--resume');
    });

    it('should provide session examples', () => {
      const sessionHelp = HelpManager.generateSessionHelp();
      
      expect(sessionHelp).toContain('Examples:');
      expect(sessionHelp).toContain('sess-abc123');
    });
  });
});