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

- `-i, --input <prompt>`: Specify prompt directly(optional)
- `-f, --file <file>`: Read prompt from file
- `--max-turns <number>`: Specify maximum number of turns
- `-c, --continue`: Continue session
- `--resume <session-id>`: Resume from session ID
- `--allowedTools <tools>`: Specify allowed tools (comma-separated)
- `--disallowedTools <tools>`: Specify disallowed tools (comma-separated)
- `--settingFile <filePath>`, `-s <filePath>`: Specify settings file
- `-o, --output`: Enable output with auto-generated filename
- `--output-file <file>`: Specify output file path (explicit)
- `--output-enabled`: Enable output (same as `--output`)
- `--output-dir <directory>`: Specify output directory (default: ./tmp/ccrun/results)
- `--output-format <format>`: Output format (json|text, default: json)
- `-h, --help`: Show help

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
npx ccrun -i "Read the file" --allowedTools "Read,Write"

# Disallow specific tools
npx ccrun -i "Execute the code" --disallowedTools "Bash"

# Combine multiple tools
npx ccrun -i "Analyze the project" --allowedTools "Read,Grep,Glob" --disallowedTools "Write,Edit"
```

#### Using Settings Files

```bash
# Specify custom settings file
npx ccrun -i "Read the file" --settingFile ./my-settings.json

# Short form also available
npx ccrun -i "Analyze the project" -s ../shared-settings.json
```

#### File Output Feature

Save execution results to file. **Output is disabled by default** and must be explicitly enabled.

```bash
# Enable output (auto-generated filename: ./tmp/ccrun/results/yyyyMMddHHmmss.json)
npx ccrun -i "Analyze the code" --output

# Short form works too
npx ccrun -i "Analyze the code" -o

# Save to specific file
npx ccrun -i "Analyze the code" --output-file results.json

# Explicit output file specification
npx ccrun -i "Analyze the code" --output-file results.json

# Save to custom directory
npx ccrun -i "Analyze the code" --output --output-dir ./output

# Save in text format
npx ccrun -i "Fix the bug" -o results.txt --output-format text

# Disable output (default behavior, console output only)
npx ccrun -i "Analyze the code"

# Combine multiple options
npx ccrun -f input.txt --output --output-dir ./results --output-format json
```

#### Other Options

```bash
# Limit maximum turns
npx ccrun -i "Let's have a long discussion" --max-turns 10

# Combine multiple options
npx ccrun -f input.txt --continue --max-turns 5 --allowedTools "Read,Write"
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
  "outputFile": "./results/output.json",
  "outputFormat": "json",
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

You can specify any settings file with the `--settingFile` option:

```bash
npx ccrun -i "prompt" --settingFile ./custom-settings.json
```

### Settings File Priority

1. **Highest**: File specified with `--settingFile`
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
  "outputFormat": "json",
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
  "outputFile": "./tmp/output.json",
  "outputFormat": "json",
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
npx ccrun -i "Analyze the code" --settingFile .ccrun/settings.example.json

# Copy example settings to create your own
cp .ccrun/settings.example.json .ccrun/settings.local.json
npx ccrun -i "prompt" --settingFile .ccrun/settings.local.json
```

---


## File Output Feature

You can output execution results to files.

### Output Formats

ccrun supports two output formats:

#### JSON Format (Default)
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

#### Text Format

Human-readable report format.

```text
==========================================
CCRun Execution Result Report
==========================================

Execution Time: 2025-07-09 12:34:56
Session ID: session-abc123
Status: Success (success)

Performance Information:
  Execution Time: 2500ms
  API Time: 2100ms
  Number of Turns: 3
  Estimated Cost: $0.0042

Token Usage:
  Input Tokens: 1250
  Output Tokens: 380
  Total Tokens: 1630

Result:
Execution result content

==========================================
```

### Output Settings

#### Configuration Items

- **outputFile**: Output file path (automatically enables output when set)
- **outputFormat**: Output format (`json` or `text`)
- **output.enabled**: Enable/disable file output
- **output.directory**: Output directory for auto-generation
- **output.filename.prefix**: Filename prefix for auto-generation
- **output.filename.suffix**: Filename suffix for auto-generation

#### Priority Order

1. **Highest**: CLI arguments (`--output-file`, `-o`, `--output`, `--output-enabled`)
2. **Next**: `outputFile` in settings file
3. **Then**: `output.enabled: true` in settings file (auto-generation)
4. **Last**: Default value (output disabled)

### Default Behavior

- **Output Enabled**: Disabled by default (must be explicitly enabled)
- **Output Location**: `./tmp/ccrun/results/`
- **Filename**: `yyyyMMddHHmmss.json` format (execution start time)
- **Output Format**: JSON
- **Directory Creation**: Automatically creates output directory if it doesn't exist

---

## Notes

- Node.js v18 or higher recommended
- Requires @anthropic-ai/claude-code package

---

## License

MIT