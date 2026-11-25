// End-to-end test against a local fake carrier site (no real accounts involved).
// Checks: auth, automatic login, switch + confirm dialog, pause button,
// both providers changed by one request, and error reporting.
const http = require('http');
const fs = require('fs');
const path = require('path');
const assert = require('assert');
const { spawn } = require('child_process');

const TMP = path.join(__dirname, '.tmp');
fs.rmSync(TMP, { recursive: true, force: true });
fs.mkdirSync(path.join(TMP, 'recipes'), { recursive: true });

const site = { blocker: false, paused: false, logins: 0 };

const page = (body) => `<!doctype html><html><body>${body}</body></html>`;

const mock = http.createServer((req, res) => {
  const url = new URL(req.url, 'http://x');
  const authed = /sid=ok/.test(req.headers.cookie || '');
  const html = (b) => {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(page(b));
  };
  if (url.pathname === '/login' && req.method === 'POST') {
    site.logins++;
    res.writeHead(302, { 'Set-Cookie': 'sid=ok; Path=/; Max-Age=3600', Location: '/' + url.searchParams.get('to') });
    return res.end();
  }
  if (!authed) {
    const to = url.pathname.slice(1);
    return html(`<form method="post" action="/login?to=${to}">
      <input type="email" name="e"><input type="password" name="p">
      <button type="submit">Sign in</button></form>`);
  }
  if (url.pathname === '/api/blocker') {
    site.blocker = url.searchParams.get('v') === '1';
    return html('ok');
  }
  if (url.pathname === '/api/pause') {
    site.paused = url.searchParams.get('v') === '1';
    return html('ok');
  }
  if (url.pathname === '/mobile') return html('<h1>Lines</h1><a href="/mobile/line">Kid Phone</a>');
  if (url.pathname === '/mobile/line') {
    return html(`<h1>Usage Management</h1>
      <button role="switch" aria-checked="${site.blocker}" aria-label="Data Blocker" id="sw">Data Blocker</button>
      <div id="dlg" hidden><button id="ok">Confirm</button></div>
      <script>
        const sw = document.getElementById('sw');
        sw.onclick = () => { document.getElementById('dlg').hidden = false; };
        document.getElementById('ok').onclick = async () => {
          const v = sw.getAttribute('aria-checked') === 'true' ? 0 : 1;
          await fetch('/api/blocker?v=' + v);
          sw.setAttribute('aria-checked', String(v === 1));
          document.getElementById('dlg').hidden = true;
        };
      </script>`);
  }
  if (url.pathname === '/wifi') return html('<h1>Devices</h1><a href="/wifi/device">Kid iPhone</a>');
  if (url.pathname === '/wifi/device') {
    return html(`<h1>Kid iPhone</h1><button id="b">${site.paused ? 'Unpause' : 'Pause Device'}</button>
      <script>
        const b = document.getElementById('b');
        b.onclick = async () => {
          const v = b.textContent === 'Pause Device' ? 1 : 0;
          await fetch('/api/pause?v=' + v);
          b.textContent = v ? 'Unpause' : 'Pause Device';
        };
      </script>`);
  }
  res.writeHead(404);
  res.end();
});

function writeRecipes(base, breakWifi) {
  const login = {
    when: { selector: 'input[type=password]' },
    needs: ['MOCK_EMAIL', 'MOCK_PASSWORD'],
    steps: [
      { do: 'fill', selector: 'input[type=email]', value: '${MOCK_EMAIL}' },
      { do: 'fill', selector: 'input[type=password]', value: '${MOCK_PASSWORD}' },
      { do: 'click', selector: 'button[type=submit]' },
    ],
  };
  const sw = (checked) => [
    { do: 'click', text: '${KID_LINE_NAME}' },
    { do: 'setSwitch', role: 'switch', name: 'Data Blocker', checked },
    { do: 'click', role: 'button', name: 'Confirm', optional: true },
    { do: 'verifySwitch', role: 'switch', name: 'Data Blocker', checked },
  ];
  fs.writeFileSync(
    path.join(TMP, 'recipes', 'mobile.json'),
    JSON.stringify({ name: 'Mock Mobile', start: `${base}/mobile`, ready: { text: 'Lines' }, login, off: sw(true), on: sw(false) })
  );
  fs.writeFileSync(
    path.join(TMP, 'recipes', 'wifi.json'),
    JSON.stringify({
      name: 'Mock WiFi',
      start: `${base}/wifi`,
      ready: { text: 'Devices' },
      login,
      off: [
        { do: 'click', text: '${KID_DEVICE_NAME}' },
        { do: 'stopIf', role: 'button', name: 'Unpause', otherwise: { role: 'button', name: 'Pause Device' } },
        { do: 'click', role: 'button', name: breakWifi ? 'No Such Button' : 'Pause Device', timeout: 3000 },
        { do: 'waitFor', role: 'button', name: 'Unpause' },
      ],
      on: [
        { do: 'click', text: '${KID_DEVICE_NAME}' },
        { do: 'stopIf', role: 'button', name: 'Pause Device', otherwise: { role: 'button', name: 'Unpause' } },
        { do: 'click', role: 'button', name: 'Unpause' },
        { do: 'waitFor', role: 'button', name: 'Pause Device' },
      ],
    })
  );
}

async function main() {
  await new Promise((r) => mock.listen(0, '127.0.0.1', r));
  const base = `http://127.0.0.1:${mock.address().port}`;
  writeRecipes(base, false);

  const port = 18787;
  const token = 'test-token-0123456789';
  const srv = spawn(process.execPath, [path.join(__dirname, '..', 'src', 'server.js')], {
    env: {
      ...process.env,
      KDS_TOKEN: token,
      KDS_PORT: String(port),
      KDS_RECIPE_DIR: path.join(TMP, 'recipes'),
      KDS_PROFILE_DIR: path.join(TMP, 'profiles'),
      KDS_DEBUG_DIR: path.join(TMP, 'debug'),
      KDS_STATE_FILE: path.join(TMP, 'state.json'),
      KID_LINE_NAME: 'Kid Phone',
      KID_DEVICE_NAME: 'Kid iPhone',
      MOCK_EMAIL: 'parent@example.com',
      MOCK_PASSWORD: 'pw',
    },
    stdio: 'inherit',
  });
  const api = (method, p, body, tok = token) =>
    fetch(`http://127.0.0.1:${port}${p}`, {
      method,
      headers: { Authorization: `Bearer ${tok}`, 'Content-Type': 'application/json' },
      body: body ? JSON.stringify(body) : undefined,
    }).then(async (r) => ({ code: r.status, json: await r.json() }));

  try {
    await new Promise((r) => setTimeout(r, 800));
    const state = (r, id) => r.json.providers.find((p) => p.id === id);

    let r = await api('GET', '/status', null, 'wrong-token-wrong-token');
    assert.strictEqual(r.code, 401, 'wrong token is rejected');

    r = await api('GET', '/status');
    assert.strictEqual(state(r, 'mobile').data, 'unknown');

    r = await api('POST', '/data', { on: false });
    assert.strictEqual(r.code, 200, JSON.stringify(r.json));
    assert.deepStrictEqual([site.blocker, site.paused], [true, true], 'OFF blocks both');
    assert.strictEqual(state(r, 'wifi').data, 'off');
    assert.strictEqual(site.logins, 2, 'each provider logged in once');

    r = await api('POST', '/data', { on: false });
    assert.strictEqual(r.code, 200, 'OFF twice is harmless: ' + JSON.stringify(r.json));
    assert.deepStrictEqual([site.blocker, site.paused], [true, true]);
    assert.strictEqual(site.logins, 2, 'saved session reused, no second login');

    r = await api('POST', '/data', { on: true });
    assert.strictEqual(r.code, 200, JSON.stringify(r.json));
    assert.deepStrictEqual([site.blocker, site.paused], [false, false], 'ON restores both');

    writeRecipes(base, true);
    r = await api('POST', '/data', { on: false });
    assert.strictEqual(r.code, 502, 'a failing provider is reported');
    assert.strictEqual(state(r, 'mobile').data, 'off', 'the working provider still changed');
    assert.strictEqual(state(r, 'wifi').data, 'on', 'the failed provider keeps its old state');
    assert.match(state(r, 'wifi').error, /off step 3 \(click\) failed/);
    assert.strictEqual(fs.readdirSync(path.join(TMP, 'debug')).length, 1, 'screenshot saved');

    r = await api('POST', '/data', { on: 'yes' });
    assert.strictEqual(r.code, 400);

    console.log('All tests passed.');
  } finally {
    srv.kill();
    mock.close();
    fs.rmSync(TMP, { recursive: true, force: true });
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
