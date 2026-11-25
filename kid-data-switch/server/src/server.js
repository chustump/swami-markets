// Small HTTP server the phone app talks to.
//   GET  /status          -> last known state per provider
//   POST /data {"on":bool} -> turn the kid's data on or off everywhere
const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { listRecipes, runRecipe } = require('./engine');

const PORT = Number(process.env.KDS_PORT || 8787);
const TOKEN = process.env.KDS_TOKEN || '';
const STATE_FILE = process.env.KDS_STATE_FILE || path.join(__dirname, '..', 'state.json');

if (TOKEN.length < 16) {
  console.error('Set KDS_TOKEN in server/.env to a secret of at least 16 characters.');
  process.exit(1);
}

function readState() {
  try {
    return JSON.parse(fs.readFileSync(STATE_FILE, 'utf8'));
  } catch {
    return {};
  }
}

function writeState(state) {
  fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
}

function authorized(req) {
  const given = Buffer.from((req.headers.authorization || '').replace(/^Bearer\s+/i, ''));
  const want = Buffer.from(TOKEN);
  return given.length === want.length && crypto.timingSafeEqual(given, want);
}

function status() {
  const state = readState();
  return {
    busy,
    providers: listRecipes().map((r) => ({
      id: r.id,
      name: r.name || r.id,
      // "on" / "off" = what we last successfully set; "unknown" = never set
      data: (state[r.id] && state[r.id].data) || 'unknown',
      changedAt: (state[r.id] && state[r.id].changedAt) || null,
      error: (state[r.id] && state[r.id].error) || null,
    })),
  };
}

let busy = false;

async function setData(on) {
  const action = on ? 'on' : 'off';
  const recipes = listRecipes();
  const results = await Promise.allSettled(recipes.map((r) => runRecipe(r.id, action)));
  const state = readState();
  results.forEach((res, i) => {
    const id = recipes[i].id;
    const prev = state[id] || {};
    if (res.status === 'fulfilled') {
      state[id] = { data: action, changedAt: new Date().toISOString(), error: null };
    } else {
      console.error(`[${id}] ${res.reason.message}`, res.reason.screenshot || '');
      state[id] = { ...prev, error: res.reason.message };
    }
  });
  writeState(state);
  return results.every((r) => r.status === 'fulfilled');
}

function send(res, code, body) {
  res.writeHead(code, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let data = '';
    req.on('data', (c) => {
      data += c;
      if (data.length > 10000) reject(new Error('Body too large'));
    });
    req.on('end', () => resolve(data));
    req.on('error', reject);
  });
}

const server = http.createServer(async (req, res) => {
  try {
    if (!authorized(req)) return send(res, 401, { error: 'Wrong or missing access code' });
    const url = req.url.split('?')[0];

    if (req.method === 'GET' && url === '/status') return send(res, 200, status());

    if (req.method === 'POST' && url === '/data') {
      let body;
      try {
        body = JSON.parse(await readBody(req));
      } catch {
        return send(res, 400, { error: 'Body must be JSON' });
      }
      if (typeof body.on !== 'boolean') return send(res, 400, { error: 'Send {"on": true} or {"on": false}' });
      if (busy) return send(res, 409, { error: 'A change is already in progress' });
      busy = true;
      let ok;
      try {
        ok = await setData(body.on);
      } finally {
        busy = false;
      }
      return send(res, ok ? 200 : 502, { ok, ...status() });
    }

    send(res, 404, { error: 'Not found' });
  } catch (err) {
    console.error(err);
    send(res, 500, { error: 'Server error' });
  }
});

server.listen(PORT, () => console.log(`Kid Data Switch server listening on port ${PORT}`));
