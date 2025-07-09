export class HelpManager {
  static generateHelp(): string {
    return `${this.generateUsage()}

${this.generateDescription()}

${this.generateOptionsHelp()}

${this.generateExamples()}`;
  }

  static generateUsage(): string {
    return `Usage: ccrun [options]
       ccrun -i <prompt>
       ccrun -f <file>
       ccrun --continue -i <prompt>
       ccrun --resume <session-id> -i <prompt>`;
  }

  static generateDescription(): string {
    return `CCRun is a CLI tool that provides a user-friendly wrapper around the Claude Code API.
It supports direct prompts, file input, session continuation, and tool filtering.`;
  }

  static generateOptionsHelp(): string {
    return `Options:
  -i, --input <prompt>        Direct prompt text to send to Claude
  -f, --file <file>           Input file containing prompt text
  --max-turns <number>        Maximum number of conversation turns (1-100)
  -c, --continue              Continue from the previous session
  --resume <session-id>       Resume a specific session by ID
  --allowedTools <tools>      Comma-separated list of allowed tools
  --disallowedTools <tools>   Comma-separated list of disallowed tools
  --permission-mode <mode>    Set permission mode (default|plan|acceptEdits|bypassPermissions)
  -s, --settingFile <file>    Specify custom settings file path
  -h, --help                  Show this help message

Available Tools:
  Read, Write, Edit, MultiEdit, Bash, Glob, Grep, LS, WebFetch,
  WebSearch, TodoRead, TodoWrite, Task`;
  }

  static generateExamples(): string {
    return `Examples:
  # Direct prompt
  ccrun -i "Explain how React hooks work"
  ccrun "Explain how React hooks work"

  # File input
  ccrun -f prompt.txt

  # Continue previous session
  ccrun --continue -i "Can you elaborate on that?"

  # Resume specific session
  ccrun --resume session-abc123 -i "What was our previous discussion about?"

  # Limit conversation turns
  ccrun -i "Help me debug this code" --max-turns 5

  # Tool filtering
  ccrun -i "Analyze this codebase" --allowedTools "Read,Grep,LS"
  ccrun -i "Write documentation" --disallowedTools "Bash,WebFetch"

  # Permission mode
  ccrun -i "Help me refactor this code" --permission-mode acceptEdits
  ccrun -i "Plan out the implementation" --permission-mode plan

  # Custom settings file
  ccrun -i "Analyze the code" --settingFile ./my-settings.json
  ccrun -i "Write tests" -s ../shared-settings.json

  # Multiple options
  ccrun -f requirements.txt --max-turns 10 --allowedTools "Read,Write,Edit"`;
  }

  static generateToolsHelp(): string {
    return `Available Tools:

File Operations:
  Read      - Read file contents
  Write     - Write files to filesystem
  Edit      - Edit existing files
  MultiEdit - Make multiple edits to files
  LS        - List directory contents
  Glob      - Find files by pattern

System Operations:
  Bash      - Execute bash commands
  Grep      - Search file contents

Web Operations:
  WebFetch  - Fetch web content
  WebSearch - Search the web

Task Management:
  TodoRead  - Read todo lists
  TodoWrite - Manage todo items
  Task      - Launch sub-agents

Tool Usage:
  --allowedTools "Read,Write,Edit"     # Only allow these tools
  --disallowedTools "Bash,WebFetch"    # Block these tools

Note: Tool names are case-sensitive`;
  }

  static generateSessionHelp(): string {
    return `Session Management:

Continue Previous Session:
  ccrun --continue -i "Follow up question"

Resume Specific Session:
  ccrun --resume <session-id> -i "Continue our conversation"

Session Information:
  - Sessions are automatically saved and can be resumed later
  - Use --continue to continue the most recent session
  - Use --resume with a specific session ID for older sessions
  - Session IDs are displayed when a session ends

Examples:
  ccrun --continue -i "Can you explain that in more detail?"
  ccrun --resume sess-abc123 -i "Let's continue our discussion"`;
  }
}