# ccrun

## Overview

`ccrun` is a CLI tool that provides a user-friendly wrapper around the Claude Code one shot mode. It simplifies interactions with Claude through command-line interfaces by supporting direct prompts, file inputs, and flexible permission control.

---

## Usage

### 1. Clone the Repository

```bash
git clone https://github.com/kykt35/ccrun.git
cd ccrun
```

### 2. Install Dependencies

``` bash
npm install
```

### 3. Build (First Time Only)

```bash
npm run build
```

### 4. Run Directly as CLI

To run the TypeScript file directly:

```bash
npx ccrun -i "Hello"
```

#### Main Options

- `-i, --input <prompt>`: Specify prompt directly (optional)
- `-f, --file <file>`: Read prompt from file
- `-c, --continue`: Continue session
- `-h, --help`: Show help
- `--max-turns <number>`: Specify maximum number of turns
- `--resume <session-id>`: Resume from session ID
- `--allowed-tools <tools>`: Specify allowed tools (comma-separated)
- `--disallowed-tools <tools>`: Specify disallowed tools (comma-separated)
- `--permission-mode <mode>`: Set permission mode (default|plan|acceptEdits|bypassPermissions)
- `-s, --settings-file <file>`: Specify settings file
- `--system-prompt, -sp <prompt>`: System prompt for Claude
- `--system-prompt-file, -sp-f <file>`: Load system prompt from file
- `-csp, --custom-system-prompt <prompt>`: Custom system prompt for Claude (deprecated)
- `-o, --output`: Enable output with auto-generated filename
- `--output-file <file>`: Specify output file path
- `--output-dir <directory>`: Specify output directory (default: ./tmp/ccrun/results)
- `--output-format <format>`: Output format (json|text, default: text)
- `--output-enabled`: Enable output (same as --output)

### Examples

#### Basic Usage

```bash
# Specify prompt directly
npx ccrun -i "Write TypeScript code"

# Read prompt from file
npx ccrun -f prompt.txt

# Show help
npx ccrun -h
```

#### System Prompts

```bash
# Use system prompt to define Claude's role
npx ccrun -i "Review this code" --system-prompt "You are a security expert focused on finding vulnerabilities"

# Short form for convenience
npx ccrun -i "Explain this algorithm" -sp "You are a computer science professor teaching algorithms"

# Load system prompt from file
npx ccrun -i "Optimize this function" --system-prompt-file ./prompts/typescript-expert.txt

# Short form for file loading
npx ccrun -i "Code review" -sp-f ./prompts/security-reviewer.txt

# Combine with other options
npx ccrun -f code.txt --system-prompt "You are a senior code reviewer" --max-turns 5

# Legacy syntax (deprecated but still works)
npx ccrun -i "Legacy example" --custom-system-prompt "You are a TypeScript expert"
```

#### Session Management

```bash
# Continue previous session
npx ccrun --continue -i "Please explain more"

# Resume specific session
npx ccrun --resume <session-id> -i "I have additional questions"

```

You can resume sessions with claude command.

```bash

# Continue previous session with claude interactive mode
claude --continue

# Resume specific session with claude interactive mode
claude --resume <session-id>

```


#### Tool Restrictions 

```bash
# Allow specific tools only
npx ccrun -i "Read the file" --allowed-tools "Read,Write"

# Disallow specific tools
npx ccrun -i "Execute the code" --disallowed-tools "Bash"

# Combine multiple tools
npx ccrun -i "Analyze the project" --allowed-tools "Read,Grep,Glob" --disallowed-tools "Write,Edit"
```

#### Using Settings Files

```bash
# Specify custom settings file
npx ccrun -i "Read the file" --settings-file ./my-settings.json

# Short form also available
npx ccrun -i "Analyze the project" -s ../shared-settings.json
```

#### File Output Feature

Save execution results to file. **Output is disabled by default** and must be explicitly enabled.

```bash
# Enable output (auto-generated filename: ./tmp/ccrun/results/yyyyMMddHHmmss.text)
npx ccrun -i "Analyze the code" --output

# Short form works too
npx ccrun -i "Analyze the code" -o

# Save to specific file
npx ccrun -i "Analyze the code" --output-file results.txt

# Explicit output file specification
npx ccrun -i "Analyze the code" --output-file results.txt

# Save to custom directory
npx ccrun -i "Analyze the code" --output --output-dir ./output

# Save in JSON format
npx ccrun -i "Fix the bug" -o results.json --output-format json

# Disable output (default behavior, console output only)
npx ccrun -i "Analyze the code"

# Combine multiple options
npx ccrun -f input.txt --output --output-dir ./results --output-format text
```

#### Other Options

```bash
# Limit maximum turns
npx ccrun -i "Let's have a long discussion" --max-turns 10

# Combine multiple options
npx ccrun -f input.txt --continue --max-turns 5 --allowedTools "Read,Write"

# Complex combination with system prompt
npx ccrun -i "Analyze this codebase" \
  --system-prompt "You are a senior software architect with expertise in code quality" \
  --allowedTools "Read,Grep,Glob,LS" \
  --max-turns 15 \
  --output-file analysis.json
```

---

## Using as a Global Command

Run the following in the project root:

```bash
npm run build
npm link
```

Now you can use the `ccrun` command from any directory.

Example:

```bash
ccrun -i "Hello"
```

---

## Settings Files

### Default Settings Files

You can create settings in `.ccrun/settings.json` or `.ccrun/settings.local.json`:

```json
{
  "permissions": {
    "allow": ["Read", "Write"],
    "deny": ["Edit"]
  },
  "maxTurns": 25,
  "systemPrompt": "You are an expert TypeScript developer with extensive knowledge of modern web frameworks",
  "outputFile": "./results/output.txt",
  "outputFormat": "text",
  "output": {
    "enabled": true,
    "directory": "./results",
    "filename": {
      "prefix": "ccrun-",
      "suffix": "-result"
    }
  }
}
```

### Custom Settings Files

You can specify any settings file with the `--settingsFile` option:

```bash
npx ccrun -i "prompt" --settingsFile ./custom-settings.json
```

### Settings File Priority

1. **Highest**: File specified with `--settingsFile`
2. **Next**: `.ccrun/settings.local.json`
3. **Last**: `.ccrun/settings.json`

### Settings File Format

#### Example 1: Direct File Specification with outputFile

```json
{
  "permissions": {
    "allow": ["Read", "Write", "Edit"],
    "deny": ["Bash", "WebFetch"]
  },
  "maxTurns": 50,
  "systemPrompt": "You are a security expert focused on code analysis and vulnerability detection",
  "outputFile": "./project-results/analysis.txt",
  "outputFormat": "text"
}
```

#### Example 2: Auto-generation Settings with output

```json
{
  "permissions": {
    "allow": ["Read", "Write", "Edit"],
    "deny": ["Bash", "WebFetch"]
  },
  "maxTurns": 50,
  "systemPrompt": "You are a senior software architect specializing in performance optimization",
  "outputFormat": "text",
  "output": {
    "enabled": true,
    "directory": "./project-results",
    "filename": {
      "prefix": "analysis-",
      "suffix": "-report"
    }
  }
}
```

### Example Settings File

The project includes an example settings file:

#### Example Settings (`.ccrun/settings.example.json`)

```json
{
  "permissions": {
    "allow": ["Read", "Write", "Edit", "MultiEdit", "Glob", "Grep", "LS"],
    "deny": ["Bash", "WebFetch", "WebSearch"]
  },
  "maxTurns": 30,
  "systemPrompt": "You are an experienced software engineer with expertise in code analysis and refactoring",
  "outputFile": "./tmp/output.txt",
  "outputFormat": "text",
  "output": {
    "enabled": true,
    "directory": "./tmp/test",
    "filename": {
      "prefix": "test",
      "suffix": "suf"
    }
  }
}
```

#### Usage Examples

```bash
# Use example settings
npx ccrun -i "Analyze the code" --settingsFile .ccrun/settings.example.json

# Copy example settings to create your own
cp .ccrun/settings.example.json .ccrun/settings.local.json
npx ccrun -i "prompt" --settingsFile .ccrun/settings.local.json
```

---


## File Output Feature

You can output execution results to files.

### Output Formats

ccrun supports two output formats:

#### Text Format (Default)

Human-readable report format.

```text
--- Execution Summary ---
Session ID     : session-abc123
Status         : Success (success)
Timestamp      : 2025-07-09 12:34:56
Execution Time : 2,500ms
API Time       : 2,100ms
Turn Count     : 3
Estimated Cost : $0.0042

--- Token Usage ---
Input Tokens   : 1,250
Output Tokens  : 380
Total Tokens   : 1,630

--- Result ---
Execution result content
```

#### JSON Format
Structured data format compliant with Claude Code SDK's standard format (SDKResultMessage).

```json
{
  "result": {
    "type": "result",
    "subtype": "success",
    "duration_ms": 2500,
    "duration_api_ms": 2100,
    "is_error": false,
    "num_turns": 3,
    "result": "Execution result content",
    "session_id": "session-abc123",
    "total_cost_usd": 0.0042,
    "usage": {
      "input_tokens": 1250,
      "output_tokens": 380,
      "total_tokens": 1630
    }
  },
  "metadata": {
    "timestamp": "2025-07-09T12:34:56.789Z",
    "config": {
      "maxTurns": 10,
      "allowedTools": ["Read", "Write"]
    }
  }
}
```

### Output Settings

#### Configuration Items

- **permissions.allow**: List of allowed tools
- **permissions.deny**: List of disallowed tools
- **maxTurns**: Maximum number of conversation turns
- **systemPrompt**: System prompt to define Claude's role and behavior
- **customSystemPrompt**: (Deprecated) Legacy system prompt field - use `systemPrompt` instead
- **outputFile**: Output file path (automatically enables output when set)
- **outputFormat**: Output format (`json` or `text`)
- **output.enabled**: Enable/disable file output
- **output.directory**: Output directory for auto-generation
- **output.filename.prefix**: Filename prefix for auto-generation
- **output.filename.suffix**: Filename suffix for auto-generation

#### Priority Order

**For All Settings:**

1. **Highest**: CLI arguments (e.g., `--system-prompt`, `--max-turns`, `--allowedTools`)
2. **Lower**: Settings file values (systemPrompt takes priority over customSystemPrompt)

**For Output Settings:**

1. **Highest**: CLI arguments (`--output-file`, `-o`, `--output`, `--output-enabled`)
2. **Next**: `outputFile` in settings file
3. **Then**: `output.enabled: true` in settings file (auto-generation)
4. **Last**: Default value (output disabled)

**Note**: CLI arguments always override settings file values for the same option.

### Default Behavior

- **Output Enabled**: Disabled by default (must be explicitly enabled)
- **Output Location**: `./tmp/ccrun/results/`
- **Filename**: `yyyyMMddHHmmss.text` format (execution start time)
- **Output Format**: Text
- **Directory Creation**: Automatically creates output directory if it doesn't exist

---

## Notes

- Node.js v18 or higher recommended
- Requires @anthropic-ai/claude-code package

---

## License

MIT
