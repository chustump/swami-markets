// NEON ARENA — authoritative realtime server (Tier 2 custom server).
// Cloudflare Durable Object: one instance per shard (= one arena room).
// The server is the referee: all movement, collision, shooting, damage, scoring
// run here at a fixed 30 Hz timestep. Clients send inputs and draw snapshots.
import { DurableObject } from "cloudflare:workers";

// ---- shared world constants (MUST match index.html) ----
const TICK = 1 / 30;
const SPEED = 8;
const GRAVITY = 26;
const JUMP_V = 9;
const PR = 0.4;            // player radius
const PH = 1.7;            // player height
const EYE = 1.55;          // eye height above feet
const DMG = 18;
const COOLDOWN = 0.16;     // seconds between shots
const RANGE = 120;
const MAX_HP = 100;
const RESPAWN = 2.5;       // seconds
const MAX_PLAYERS = 8;

// Arena geometry — identical list lives in index.html for rendering.
// Each box: center [x,y,z] + half-extents [sx,sy,sz]. (tex is render-only, omitted here.)
function buildArena() {
  const H = 7;
  const boxes = [
    [0, -0.5, 0, 28, 0.5, 28],     // floor
    [0, H, 28, 28, H, 1],          // wall N
    [0, H, -28, 28, H, 1],         // wall S
    [28, H, 0, 1, H, 28],          // wall E
    [-28, H, 0, 1, H, 28],         // wall W
    [0, 0.75, 0, 5, 0.75, 5],      // central platform (jumpable)
    [12, 1, 12, 2, 1, 2], [-12, 1, 12, 2, 1, 2],
    [12, 1, -12, 2, 1, 2], [-12, 1, -12, 2, 1, 2],
    [0, 0.6, 16, 2, 0.6, 2], [0, 0.6, -16, 2, 0.6, 2],
    [16, 0.6, 0, 2, 0.6, 2], [-16, 0.6, 0, 2, 0.6, 2],
    [20, 5, 20, 1.5, 5, 1.5], [-20, 5, 20, 1.5, 5, 1.5],
    [20, 5, -20, 1.5, 5, 1.5], [-20, 5, -20, 1.5, 5, 1.5],
    [8, 1.2, 0, 0.8, 1.2, 6], [-8, 1.2, 0, 0.8, 1.2, 6],
  ];
  return boxes;
}
const ARENA = buildArena();
const SPAWNS = [
  [22, 0, 22], [-22, 0, 22], [22, 0, -22], [-22, 0, -22],
  [22, 0, 0], [-22, 0, 0], [0, 0, 22], [0, 0, -22],
];

function clamp(v, lo, hi) { return v < lo ? lo : v > hi ? hi : v; }

// AABB (player feet at y, half radius PR, height PH) vs box overlap test
function overlaps(px, py, pz, b) {
  return (
    px - PR < b[0] + b[3] && px + PR > b[0] - b[3] &&
    py < b[1] + b[4] && py + PH > b[1] - b[4] &&
    pz - PR < b[2] + b[5] && pz + PR > b[2] - b[5]
  );
}

// Ray vs AABB slab test → entry distance t (or Infinity)
function rayBox(ox, oy, oz, dx, dy, dz, b) {
  const minx = b[0] - b[3], maxx = b[0] + b[3];
  const miny = b[1] - b[4], maxy = b[1] + b[4];
  const minz = b[2] - b[5], maxz = b[2] + b[5];
  let tmin = -Infinity, tmax = Infinity;
  for (const [o, d, lo, hi] of [[ox, dx, minx, maxx], [oy, dy, miny, maxy], [oz, dz, minz, maxz]]) {
    if (Math.abs(d) < 1e-8) { if (o < lo || o > hi) return Infinity; }
    else {
      let t1 = (lo - o) / d, t2 = (hi - o) / d;
      if (t1 > t2) { const t = t1; t1 = t2; t2 = t; }
      if (t1 > tmin) tmin = t1;
      if (t2 < tmax) tmax = t2;
      if (tmin > tmax) return Infinity;
    }
  }
  return tmin >= 0 ? tmin : (tmax >= 0 ? 0 : Infinity);
}

export class GameServer extends DurableObject {
  constructor(ctx, env) {
    super(ctx, env);
    this.sessions = new Set();     // live WebSockets
    this.players = new Map();      // id -> player
    this.loop = null;
    this.colorSeq = 0;
    this.shots = [];               // tracer events accumulated since last broadcast
    this.kills = [];               // kill-feed events since last broadcast
  }

  async fetch(request) {
    if (request.headers.get("Upgrade") !== "websocket")
      return new Response("NEON ARENA game server", { status: 200 });
    const pair = new WebSocketPair();
    const [client, server] = Object.values(pair);
    this.accept(server);
    return new Response(null, { status: 101, webSocket: client });
  }

  accept(ws) {
    ws.accept();
    this.sessions.add(ws);
    const p = this.spawnPlayer();
    ws.__pid = p.id;
    ws.__ack = 0;
    // queued until 'open' on the client side; server can send immediately here
    this.send(ws, { type: "welcome", id: p.id });
    ws.addEventListener("message", (e) => this.onMessage(ws, e.data));
    ws.addEventListener("close", () => this.drop(ws));
    ws.addEventListener("error", () => this.drop(ws));
    this.ensureLoop();
  }

  spawnPlayer() {
    let id;
    do { id = "p" + Math.random().toString(36).slice(2, 8); } while (this.players.has(id));
    const s = SPAWNS[(this.colorSeq) % SPAWNS.length];
    const p = {
      id, name: "Recruit", color: this.colorSeq % 8,
      x: s[0], y: s[1], z: s[2], vx: 0, vy: 0, vz: 0,
      yaw: 0, pitch: 0, hp: MAX_HP, score: 0, alive: true,
      grounded: false, respawnAt: 0, lastShot: -999,
      input: { mf: 0, ms: 0, yaw: 0, pitch: 0, jump: false, shoot: false, seq: 0 },
      ack: 0,
    };
    this.colorSeq++;
    this.players.set(id, p);
    return p;
  }

  respawn(p) {
    const s = SPAWNS[Math.floor(Math.random() * SPAWNS.length)];
    p.x = s[0]; p.y = s[1]; p.z = s[2];
    p.vx = p.vy = p.vz = 0;
    p.hp = MAX_HP; p.alive = true; p.respawnAt = 0;
  }

  drop(ws) {
    this.sessions.delete(ws);
    if (ws.__pid) this.players.delete(ws.__pid);
    if (this.sessions.size === 0 && this.loop) { clearInterval(this.loop); this.loop = null; }
  }

  onMessage(ws, raw) {
    let m; try { m = JSON.parse(raw); } catch { return; }
    const p = this.players.get(ws.__pid);
    if (!p) return;
    if (m.type === "join") {
      p.name = ("" + (m.name || "Recruit")).slice(0, 16).replace(/[<>&]/g, "") || "Recruit";
    } else if (m.type === "input") {
      p.input = {
        mf: clamp(+m.mf || 0, -1, 1),
        ms: clamp(+m.ms || 0, -1, 1),
        yaw: +m.yaw || 0,
        pitch: clamp(+m.pitch || 0, -1.535, 1.535),
        jump: !!m.jump,
        shoot: !!m.shoot,
        seq: m.seq | 0,
      };
      p.yaw = p.input.yaw; p.pitch = p.input.pitch;
      ws.__ack = p.input.seq; p.ack = p.input.seq;
    } else if (m.type === "reset") {
      this.respawn(p);
    }
  }

  ensureLoop() {
    if (this.loop) return;
    this.loop = setInterval(() => this.tick(), 1000 * TICK);
  }

  tick() {
    const now = Date.now() / 1000;
    for (const p of this.players.values()) {
      if (!p.alive) {
        if (now >= p.respawnAt) this.respawn(p);
        continue;
      }
      this.simPlayer(p, now);
    }
    this.broadcast(now);
    this.shots.length = 0;
    this.kills.length = 0;
  }

  simPlayer(p, now) {
    const inp = p.input;
    // horizontal velocity from yaw + intent (arcade: snap to desired speed)
    const fx = Math.sin(p.yaw), fz = -Math.cos(p.yaw);
    const rx = Math.cos(p.yaw), rz = Math.sin(p.yaw);
    let mx = fx * inp.mf + rx * inp.ms;
    let mz = fz * inp.mf + rz * inp.ms;
    const len = Math.hypot(mx, mz);
    if (len > 1e-4) { mx /= len; mz /= len; } else { mx = mz = 0; }
    p.vx = mx * SPEED; p.vz = mz * SPEED;
    p.vy -= GRAVITY * TICK;
    if (inp.jump && p.grounded) { p.vy = JUMP_V; p.grounded = false; }

    // integrate with per-axis AABB collision
    p.grounded = false;
    p.x += p.vx * TICK;
    for (const b of ARENA) if (overlaps(p.x, p.y, p.z, b)) {
      p.x = p.vx > 0 ? b[0] - b[3] - PR : b[0] + b[3] + PR; p.vx = 0;
    }
    p.z += p.vz * TICK;
    for (const b of ARENA) if (overlaps(p.x, p.y, p.z, b)) {
      p.z = p.vz > 0 ? b[2] - b[5] - PR : b[2] + b[5] + PR; p.vz = 0;
    }
    p.y += p.vy * TICK;
    for (const b of ARENA) if (overlaps(p.x, p.y, p.z, b)) {
      if (p.vy <= 0) { p.y = b[1] + b[4]; p.grounded = true; }
      else { p.y = b[1] - b[4] - PH; }
      p.vy = 0;
    }
    if (p.y < -20) this.respawn(p);     // fell out of the world

    // shooting (hitscan), rate-limited server-side
    if (inp.shoot && now - p.lastShot >= COOLDOWN) {
      p.lastShot = now;
      this.fire(p, now);
    }
  }

  fire(p, now) {
    const ox = p.x, oy = p.y + EYE, oz = p.z;
    const cp = Math.cos(p.pitch);
    const dx = Math.sin(p.yaw) * cp;
    const dy = Math.sin(p.pitch);
    const dz = -Math.cos(p.yaw) * cp;
    // nearest wall along the ray
    let tWall = RANGE;
    for (const b of ARENA) { const t = rayBox(ox, oy, oz, dx, dy, dz, b); if (t < tWall) tWall = t; }
    // nearest player along the ray (before the wall)
    let hit = null, tHit = tWall;
    for (const q of this.players.values()) {
      if (q === p || !q.alive) continue;
      const t = rayBox(ox, oy, oz, dx, dy, dz, [q.x, q.y + PH / 2, q.z, PR, PH / 2, PR]);
      if (t < tHit) { tHit = t; hit = q; }
    }
    const ex = ox + dx * tHit, ey = oy + dy * tHit, ez = oz + dz * tHit;
    this.shots.push({ s: p.id, x0: ox, y0: oy, z0: oz, x1: ex, y1: ey, z1: ez, h: hit ? 1 : 0 });
    if (hit) {
      hit.hp -= DMG;
      if (hit.hp <= 0) {
        hit.alive = false; hit.respawnAt = now + RESPAWN; hit.hp = 0;
        p.score++;
        this.kills.push({ killer: p.id, killerName: p.name, victim: hit.id, victimName: hit.name });
      }
    }
  }

  snapshot() {
    const players = [];
    for (const p of this.players.values())
      players.push({
        id: p.id, name: p.name, color: p.color,
        x: r3(p.x), y: r3(p.y), z: r3(p.z),
        yaw: r3(p.yaw), pitch: r3(p.pitch),
        hp: p.hp, score: p.score, alive: p.alive,
        rt: p.alive ? 0 : Math.max(0, +(p.respawnAt - Date.now() / 1000).toFixed(2)),
      });
    return players;
  }

  broadcast() {
    const players = this.snapshot();
    const shots = this.shots, kills = this.kills, t = Date.now();
    for (const ws of this.sessions) {
      this.send(ws, { type: "state", t, players, shots, kills, you: ws.__pid, ack: ws.__ack });
    }
  }

  send(ws, obj) { try { ws.send(JSON.stringify(obj)); } catch { } }
}

function r3(v) { return Math.round(v * 1000) / 1000; }
