/**
 * Grok MCP server - streamable HTTP transport (stateless JSON mode).
 *
 * Deployed alongside the app, this endpoint can be registered at claude.ai as a
 * Custom Connector, making the Grok tools available from Claude web, desktop,
 * and mobile. It shares its dispatcher with mcp/grok-stdio.mjs, so the local and
 * remote servers always expose identical tools.
 *
 * The server is stateless: no sessions are issued, so every POST is self-contained
 * and any serverless instance can serve it.
 */

import { timingSafeEqual } from 'node:crypto';

import {
  handlePayload,
  jsonRpcError,
  PARSE_ERROR,
  INVALID_REQUEST,
  LATEST_PROTOCOL_VERSION,
} from '../../../lib/grok/mcp.mjs';

// node runtime: needed for crypto.timingSafeEqual and outbound calls to xAI.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const CORS_HEADERS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, GET, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, Mcp-Session-Id, MCP-Protocol-Version',
  'Access-Control-Expose-Headers': 'Mcp-Session-Id, MCP-Protocol-Version',
  'Access-Control-Max-Age': '86400',
};

function json(body, { status = 200, headers = {} } = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'MCP-Protocol-Version': LATEST_PROTOCOL_VERSION,
      ...CORS_HEADERS,
      ...headers,
    },
  });
}

/** Constant-time string comparison that does not leak length via early return. */
function secureEquals(a, b) {
  const bufA = Buffer.from(String(a));
  const bufB = Buffer.from(String(b));
  if (bufA.length !== bufB.length) {
    // Still burn a comparison so the timing profile does not depend on length.
    timingSafeEqual(bufA, bufA);
    return false;
  }
  return timingSafeEqual(bufA, bufB);
}

/**
 * Authorize a request.
 *
 * This endpoint fronts a paid API, so it fails closed: without MCP_AUTH_TOKEN
 * configured it refuses to serve rather than becoming an open Grok proxy.
 *
 * @returns {Response|null} An error response, or null when the caller is authorized.
 */
function authorize(request) {
  const expected = process.env.MCP_AUTH_TOKEN;
  if (!expected) {
    return json(
      {
        error: 'server_not_configured',
        message:
          'MCP_AUTH_TOKEN is not set. This endpoint refuses to serve unauthenticated traffic because it spends xAI credits. ' +
          'Set MCP_AUTH_TOKEN in the deployment environment and pass it as a bearer token.',
      },
      { status: 503 }
    );
  }

  const header = request.headers.get('authorization') || '';
  const bearer = header.toLowerCase().startsWith('bearer ') ? header.slice(7).trim() : null;
  // A query parameter is supported because some connector UIs only accept a URL.
  const queryKey = new URL(request.url).searchParams.get('key');
  const presented = bearer || queryKey;

  if (!presented || !secureEquals(presented, expected)) {
    return json(
      { error: 'unauthorized', message: 'Provide the server token via `Authorization: Bearer <token>` or `?key=<token>`.' },
      { status: 401, headers: { 'WWW-Authenticate': 'Bearer' } }
    );
  }
  return null;
}

export async function POST(request) {
  const denied = authorize(request);
  if (denied) return denied;

  let payload;
  try {
    payload = await request.json();
  } catch {
    return json(jsonRpcError(null, PARSE_ERROR, 'Request body is not valid JSON.'), { status: 400 });
  }

  const response = await handlePayload(payload);

  // A payload made up entirely of notifications gets no body.
  if (response === null) {
    return new Response(null, { status: 202, headers: CORS_HEADERS });
  }

  const isProtocolError = !Array.isArray(response) && response.error?.code === INVALID_REQUEST;
  return json(response, { status: isProtocolError ? 400 : 200 });
}

/**
 * GET would open a server-to-client SSE stream. This server is stateless and
 * never initiates messages, so it declines - which the spec allows.
 */
export async function GET(request) {
  const denied = authorize(request);
  if (denied) return denied;
  return json(
    { error: 'method_not_allowed', message: 'This server is stateless and does not provide an SSE stream. Send JSON-RPC via POST.' },
    { status: 405, headers: { Allow: 'POST, OPTIONS' } }
  );
}

/** DELETE terminates a session; this server issues none, so there is nothing to end. */
export async function DELETE(request) {
  const denied = authorize(request);
  if (denied) return denied;
  return json(
    { error: 'method_not_allowed', message: 'This server is stateless and issues no session to terminate.' },
    { status: 405, headers: { Allow: 'POST, OPTIONS' } }
  );
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: CORS_HEADERS });
}
