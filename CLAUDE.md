# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

`ccrun` is a Node.js CLI tool that provides a wrapper around the Claude Code API to make interactions more user-friendly by:
- Supporting direct prompts via the `-i` option
- Supporting file input for prompts via the `-f` option
- Providing session continuation with `--continue` and `--resume` flags
- Supporting tool filtering with `--allowedTools` and `--disallowedTools`
- Built with TypeScript and uses the official `@anthropic-ai/claude-code` package

## Architecture

- `src/index.ts` - Main CLI executable with TypeScript and argument parsing
- `package.json` - Node.js project configuration with CLI binary definition pointing to compiled output
- `dist/src/index.js` - Compiled JavaScript output (binary entry point)
- `tsconfig.json` - TypeScript configuration
- Uses the official `@anthropic-ai/claude-code` package for Claude API interactions

## Development Commands

- `npm install` - Install dependencies
- `npm run build` - Compile TypeScript to JavaScript
- `npm run dev` - Run the CLI tool in development mode with tsx
- `npm start` - Run the CLI tool using node (requires build first)

## Usage

Install dependencies and build:
```bash
npm install
npm run build
```

Using the tool:
```bash
# Direct prompt
ccrun -i "Your prompt here"

# File input
ccrun -f path/to/prompt.txt

# Continue previous session
ccrun --continue -i "Follow up question"

# Resume specific session
ccrun --resume SESSION_ID -i "Continue from session"

# With tool filtering
ccrun -i "prompt" --allowedTools "Read,Write" --disallowedTools "Bash"

# Max turns limit
ccrun -i "prompt" --max-turns 5
```

## CLI Options

- `-i, --input` - Direct prompt text
- `-f, --file` - Input file containing prompt
- `-c, --continue` - Continue from previous session
- `--resume SESSION_ID` - Resume specific session
- `--max-turns NUMBER` - Maximum conversation turns
- `--allowedTools` - Comma-separated list of allowed tools
- `--disallowedTools` - Comma-separated list of disallowed tools
- `-h, --help` - Show help message

## Technology Stack

- TypeScript for type safety and modern JavaScript features
- `@anthropic-ai/claude-code` package for Claude API integration
- `tsx` for development-time TypeScript execution
- Node.js built-in modules for file operations and path handling

## Notes

- Uses the official Claude Code API package rather than spawning CLI processes
- Supports session management for continued conversations
- Provides flexible tool filtering capabilities
- Compiled to JavaScript for distribution via npm binary