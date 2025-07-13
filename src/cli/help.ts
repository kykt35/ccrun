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
  --allowed-tools <tools>     Comma-separated list of allowed tools
  --disallowed-tools <tools>  Comma-separated list of disallowed tools
  --permission-mode <mode>    Set permission mode (default|plan|acceptEdits|bypassPermissions)
  -s, --settings-file <file>  Specify custom settings file path
  --custom-system-prompt <p>  Custom system prompt for Claude (deprecated)
  --system-prompt, -sp <p>    System prompt for Claude
  -csp <prompt>               Short form of --custom-system-prompt (deprecated)
  --system-prompt-file <file> Load system prompt from file
  -sp-f <file>                Short form of --system-prompt-file
  -o [file]                   Output file path (with file) or enable auto-output (without file)
  --output-file <file>        Output file path for results (enables output)
  --output-dir <directory>    Output directory for results (default: ./tmp/ccrun/results)
  --output-format <format>    Output format: json or text (default: json)
  --output                    Enable file output with auto-generated filename
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
  ccrun -i "Analyze this codebase" --allowed-tools "Read,Grep,LS"
  ccrun -i "Write documentation" --disallowed-tools "Bash,WebFetch"

  # Permission mode
  ccrun -i "Help me refactor this code" --permission-mode acceptEdits
  ccrun -i "Plan out the implementation" --permission-mode plan

  # Output options (output disabled by default)
  ccrun -i "Analyze the code" -o analysis.json
  ccrun -i "Debug this issue" -o --output-dir ./results --output-format text
  ccrun -i "Quick check"  # No output (default behavior)

  # Custom settings file
  ccrun -i "Analyze the code" --settings-file ./my-settings.json
  ccrun -i "Write tests" -s ../shared-settings.json

  # System prompt
  ccrun -i "Review this code" --system-prompt "You are a security expert"
  ccrun -i "Explain this" -sp "Focus on performance optimizations"
  ccrun -i "Debug this issue" --system-prompt "You are a debugging expert"
  ccrun -i "Code review" --system-prompt-file ./prompts/security-prompt.txt
  ccrun -i "Refactor code" -sp-f ./prompts/refactor-prompt.txt
  ccrun -i "Legacy example" --custom-system-prompt "Old syntax (deprecated)"

  # Multiple options
  ccrun -f requirements.txt --max-turns 10 --allowed-tools "Read,Write,Edit" -o results.json`;
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
  --allowed-tools "Read,Write,Edit"     # Only allow these tools
  --disallowed-tools "Bash,WebFetch"    # Block these tools

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