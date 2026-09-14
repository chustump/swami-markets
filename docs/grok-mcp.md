# Grok MCP Server

An MCP server that exposes xAI's Grok to any MCP client. It ships in two forms
that share one implementation:

| Form | Entry point | Use it for |
| --- | --- | --- |
| **Local (stdio)** | `mcp/grok-stdio.mjs` | Claude Code and Claude Desktop on your own machine |
| **Remote (HTTP)** | `src/app/api/mcp/route.js` | A Custom Connector at claude.ai, usable from web, desktop, and mobile |

Both transports import the same dispatcher (`src/lib/grok/mcp.mjs`) and the same
tool definitions (`src/lib/grok/tools.mjs`), so they can never expose different
tools or behave differently.

There are no new npm dependencies — the server is built on `fetch` and Node
built-ins.

## Tools

### `grok_ask`

A plain Grok completion, with no web or X access.

| Parameter | Type | Notes |
| --- | --- | --- |
| `prompt` | string | **Required.** The question or instruction. |
| `system` | string | System prompt setting Grok's role or output format. |
| `model` | string | Defaults to `XAI_MODEL`, else `grok-4.6`. |
| `max_tokens` | integer | 1–128000. |
| `temperature` | number | 0–2. |

Returns `{ answer, model, usage }`.

### `grok_live_search`

Grok's Live Search across X (Twitter), the web, news, and RSS — returning an
answer **plus source citations**. This is the capability Claude doesn't have:
first-party access to X posts.

| Parameter | Type | Notes |
| --- | --- | --- |
| `query` | string | **Required.** The question to research. |
| `sources` | array | `x`, `web`, `news`, `rss`. Default `["x","web","news"]`. |
| `mode` | string | `on` (force), `auto` (Grok decides), `off`. Default `on`. |
| `max_search_results` | integer | 1–50. Default 15. |
| `from_date` / `to_date` | string | `YYYY-MM-DD` date window. |
| `x_handles` | array | Search only these handles (no `@`). |
| `exclude_x_handles` | array | Skip these handles. Not combinable with `x_handles`. |
| `min_post_favorites` | integer | Drop X posts below this like count. |
| `min_post_views` | integer | Drop X posts below this view count. |
| `country` | string | Two-letter ISO code biasing web/news. |
| `allowed_websites` | array | Restrict web/news to these domains, max 5. |
| `excluded_websites` | array | Skip these domains, max 5. Ignored if `allowed_websites` is set. |
| `rss_links` | array | Feed URLs. Required when `rss` is in `sources`. |
| `model`, `max_tokens` | | As above. |

Returns `{ answer, model, citations, num_sources_used, search }`. The `search`
field echoes the exact `search_parameters` sent to xAI, so a result can be
audited or reproduced.

## Setup

### 1. Get an xAI API key

Create one at [console.x.ai](https://console.x.ai). Live Search is billed per
source consulted on top of normal token costs, so `max_search_results` is a
direct cost lever.

### 2. Local use (Claude Code / Claude Desktop)

Put the key in `.env.local` (already gitignored):

```bash
cp .env.example .env.local   # then fill in XAI_API_KEY
```

`.mcp.json` in the repo root already registers the server, so Claude Code picks
it up when you open this project. To check it by hand:

```bash
npm run mcp    # starts the stdio server; Ctrl-C to exit
```

For Claude Desktop, add this to its config file:

```json
{
  "mcpServers": {
    "grok": {
      "command": "node",
      "args": ["/absolute/path/to/swami-markets/mcp/grok-stdio.mjs"],
      "env": { "XAI_API_KEY": "xai-..." }
    }
  }
}
```

### 3. Remote connector (claude.ai)

Set two environment variables in the Netlify dashboard:

- `XAI_API_KEY` — your xAI key
- `MCP_AUTH_TOKEN` — a long random string, e.g. `openssl rand -hex 32`

Deploy, then add the connector at claude.ai → Settings → Connectors → Add custom
connector, pointing at:

```
https://<your-site>.netlify.app/api/mcp
```

Authenticate with either:

- header `Authorization: Bearer <MCP_AUTH_TOKEN>`, or
- the token in the URL: `https://<your-site>.netlify.app/api/mcp?key=<MCP_AUTH_TOKEN>`

**The endpoint fails closed.** With `MCP_AUTH_TOKEN` unset it returns `503` and
serves nothing, so a deploy can never accidentally publish an open, billable
proxy to your xAI account. Treat the token like the API key it protects — anyone
holding it can spend your xAI credits.

## Verifying it works

```bash
# stdio: full handshake
printf '%s\n' \
  '{"jsonrpc":"2.0","id":1,"method":"initialize","params":{"protocolVersion":"2025-06-18","capabilities":{},"clientInfo":{"name":"curl","version":"1"}}}' \
  '{"jsonrpc":"2.0","id":2,"method":"tools/list"}' \
  | node mcp/grok-stdio.mjs

# HTTP: against a local build
MCP_AUTH_TOKEN=dev-token npm run build && MCP_AUTH_TOKEN=dev-token npm start
curl -s -X POST http://localhost:3000/api/mcp \
  -H 'Authorization: Bearer dev-token' -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":1,"method":"tools/list"}'

# A real call (spends credits)
curl -s -X POST http://localhost:3000/api/mcp \
  -H 'Authorization: Bearer dev-token' -H 'Content-Type: application/json' \
  -d '{"jsonrpc":"2.0","id":2,"method":"tools/call","params":{"name":"grok_live_search",
       "arguments":{"query":"What is X saying about prediction markets today?","sources":["x"],"min_post_favorites":50}}}'
```

You can also point the official inspector at either transport:

```bash
npx @modelcontextprotocol/inspector node mcp/grok-stdio.mjs
```

## Design notes

**Stateless.** The server issues no session IDs, so any serverless instance can
serve any request — which is what makes the HTTP transport work on Netlify
without sticky routing. `GET` (SSE stream) and `DELETE` (session teardown)
correctly return `405`; the spec permits a server to decline both.

**Protocol versions.** `2025-06-18`, `2025-03-26`, and `2024-11-05` are accepted.
The server echoes the client's version when it speaks it, and otherwise offers
its newest.

**Model drift.** Grok model names change frequently, so no model id is hardcoded
into logic — `XAI_MODEL` sets the default and every tool takes a `model`
override. On an unknown model the error message lists what the key can actually
use, by calling xAI's models endpoint.

**Errors reach the model, not the log.** Bad input and upstream failures come
back as MCP tool errors (`isError: true`) with text that says what to do next —
so the calling model can correct itself instead of just failing.
