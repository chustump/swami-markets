#!/usr/bin/env node
/**
 * Grok MCP server - stdio transport.
 *
 * For local clients (Claude Code, Claude Desktop) that launch the server as a
 * subprocess. Speaks newline-delimited JSON-RPC on stdin/stdout, per the MCP
 * stdio spec, and shares its dispatcher with the HTTP route so both transports
 * expose exactly the same tools.
 *
 * Usage:  XAI_API_KEY=xai-... node mcp/grok-stdio.mjs
 *
 * NOTE: stdout is reserved for protocol messages. All logging goes to stderr.
 */

import { createInterface } from 'node:readline';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, resolve } from 'node:path';

import { handlePayload, jsonRpcError, PARSE_ERROR, SERVER_INFO } from '../src/lib/grok/mcp.mjs';

/**
 * Load KEY=VALUE pairs from a local env file so `node mcp/grok-stdio.mjs` works
 * without extra setup. Existing environment variables always win.
 */
function loadEnvFile(path) {
  let contents;
  try {
    contents = readFileSync(path, 'utf8');
  } catch {
    return; // No env file is fine - the key may come from the environment.
  }
  for (const line of contents.split('\n')) {
    const match = line.match(/^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_]*)\s*=\s*(.*)$/);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (process.env[key] !== undefined) continue;
    process.env[key] = rawValue.trim().replace(/^(['"])(.*)\1$/s, '$2');
  }
}

const projectRoot = resolve(dirname(fileURLToPath(import.meta.url)), '..');
loadEnvFile(resolve(projectRoot, '.env.local'));

if (!process.env.XAI_API_KEY) {
  // A warning, not a fatal error: the client still gets a clean tool-level
  // error explaining what to set, which is more useful than a dead process.
  process.stderr.write('[grok-mcp] Warning: XAI_API_KEY is not set. Tool calls will fail until it is.\n');
}

function send(message) {
  // Messages are newline-delimited and must not contain embedded newlines.
  process.stdout.write(`${JSON.stringify(message)}\n`);
}

const rl = createInterface({ input: process.stdin, crlfDelay: Infinity });

rl.on('line', async (line) => {
  const trimmed = line.trim();
  if (!trimmed) return;

  let payload;
  try {
    payload = JSON.parse(trimmed);
  } catch {
    send(jsonRpcError(null, PARSE_ERROR, 'Invalid JSON received.'));
    return;
  }

  try {
    const response = await handlePayload(payload);
    if (response) send(response);
  } catch (error) {
    process.stderr.write(`[grok-mcp] Unhandled error: ${error?.stack || error}\n`);
  }
});

rl.on('close', () => process.exit(0));

process.stderr.write(`[grok-mcp] ${SERVER_INFO.name} v${SERVER_INFO.version} ready on stdio.\n`);
