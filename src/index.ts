#!/usr/bin/env -S tsx
import { runCLI } from './cli';

/**
 * Main entry point for CCRun CLI application.
 * This is the simplified orchestration layer that delegates to the CLI layer.
 */
async function main(): Promise<void> {
  try {
    await runCLI();
  } catch (error) {
    console.error('Fatal error:', error instanceof Error ? error.message : String(error));
    process.exit(1);
  }
}

// Execute main function
main();