/**
 * Stateless MCP (JSON-RPC 2.0) dispatcher shared by both transports.
 *
 * Kept deliberately dependency-free: the server holds no session state, so a
 * request can be served identically by a long-lived stdio process or by a
 * cold-started serverless function.
 */

import { TOOLS, callTool } from './tools.mjs';

export const SERVER_INFO = {
  name: 'grok-mcp-server',
  title: 'Grok (xAI)',
  version: '1.0.0',
};

/** Protocol versions this server speaks, newest first. */
export const SUPPORTED_PROTOCOL_VERSIONS = ['2025-06-18', '2025-03-26', '2024-11-05'];
export const LATEST_PROTOCOL_VERSION = SUPPORTED_PROTOCOL_VERSIONS[0];

const INSTRUCTIONS =
  'Tools for querying xAI\'s Grok. Use grok_ask for plain model responses, and grok_live_search when the answer ' +
  'depends on real-time information from X (Twitter), news, or the web - it returns source citations alongside the answer.';

// Standard JSON-RPC error codes.
const PARSE_ERROR = -32700;
const INVALID_REQUEST = -32600;
const METHOD_NOT_FOUND = -32601;
const INTERNAL_ERROR = -32603;

const ok = (id, result) => ({ jsonrpc: '2.0', id, result });
const fail = (id, code, message) => ({ jsonrpc: '2.0', id, error: { code, message } });

function handleInitialize(params) {
  const requested = params?.protocolVersion;
  // Echo the client's version when we speak it, otherwise offer our newest.
  const protocolVersion = SUPPORTED_PROTOCOL_VERSIONS.includes(requested) ? requested : LATEST_PROTOCOL_VERSION;
  return {
    protocolVersion,
    capabilities: { tools: { listChanged: false } },
    serverInfo: SERVER_INFO,
    instructions: INSTRUCTIONS,
  };
}

/**
 * Handle one JSON-RPC message.
 *
 * @param {object} message A parsed JSON-RPC request or notification.
 * @returns {Promise<object|null>} The response, or null for notifications (which get no reply).
 */
export async function handleMessage(message) {
  if (!message || typeof message !== 'object' || Array.isArray(message)) {
    return fail(null, INVALID_REQUEST, 'Request must be a JSON-RPC 2.0 object.');
  }

  const { id, method, params } = message;
  const isNotification = id === undefined || id === null;

  if (typeof method !== 'string') {
    return isNotification ? null : fail(id, INVALID_REQUEST, 'Request is missing a string `method`.');
  }

  // Notifications never get a response, whatever they are.
  if (method.startsWith('notifications/')) return null;

  try {
    switch (method) {
      case 'initialize':
        return ok(id, handleInitialize(params));

      case 'ping':
        return ok(id, {});

      case 'tools/list':
        return ok(id, { tools: TOOLS });

      case 'tools/call': {
        const name = params?.name;
        if (typeof name !== 'string') {
          return fail(id, INVALID_REQUEST, 'tools/call requires a string `name` parameter.');
        }
        const result = await callTool(name, params?.arguments ?? {});
        return ok(id, result);
      }

      default:
        return isNotification ? null : fail(id, METHOD_NOT_FOUND, `Method not found: ${method}`);
    }
  } catch (error) {
    // Don't leak internals; the tool layer already turns expected failures into tool errors.
    return fail(id ?? null, INTERNAL_ERROR, `Internal server error handling ${method}.`);
  }
}

/**
 * Handle a full JSON-RPC payload, which may be a single message or a batch array.
 *
 * @returns {Promise<object|object[]|null>} null when nothing needs a reply
 *   (e.g. a payload of notifications only), which the caller should turn into
 *   an empty 202 response.
 */
export async function handlePayload(payload) {
  if (Array.isArray(payload)) {
    if (!payload.length) return fail(null, INVALID_REQUEST, 'Batch request must not be empty.');
    const responses = (await Promise.all(payload.map(handleMessage))).filter(Boolean);
    return responses.length ? responses : null;
  }
  return handleMessage(payload);
}

export { PARSE_ERROR, INVALID_REQUEST, fail as jsonRpcError };
