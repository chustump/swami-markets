# NEON ARENA — design plan

## Experience formula
The player feels *sharp, twitchy dominance* because the game constantly puts a readable enemy
in the crosshair and rewards the cleaner shot, then immediately respawns both fighters so the
duel never stops.

## Profile
- Time: real-time. Space: continuous 3D. Agency: one hero (first person).
- Conflict: vs players. Outcome: score-based (frag count) endless deathmatch.
- Players: **versus, online** (free-for-all, 2–8). Session: minutes. Engagement: execution.
- Delivery: desktop (mouse+kbd) + mobile (touch) + gamepad. Strings external. Physical key codes.

## Architecture (online → Tier 2 custom server)
- `server.js` — authoritative `GameServer extends DurableObject`. 30 Hz fixed-timestep sim:
  movement + AABB collision, gravity/jump, **hitscan** shooting, damage, death, respawn,
  scoring. Broadcasts world snapshots; clients send inputs only. Rules never live in the UI.
- `index.html` — raw-WebGL renderer (no third-party libs; egress is locked so nothing is
  vendored/hotlinked). Client-side prediction + reconciliation for own movement, entity
  interpolation for remote players. Renders arena, enemy fighters, tracers, HUD.

## Verbs
- **Move** (WASD / stick / touch joystick) — strong: traverses, dodges, takes cover, mounts low crates.
- **Look/aim** (mouse / right stick / touch drag) — the core skill expression.
- **Shoot** (hold fire) — rapid hitscan blaster; cover and range re-weight it.
- **Jump** — dodge + reach low cover tops.

## Information map
Server authoritative; clients see all players' positions (no hidden info in an arena FFA).
Enemy fighters render in hot-magenta glow so targets pop; pickups/health acid-green; own gun cyan.

## Loops & uncertainty
Negative loop: death costs only a short respawn, so a lead never snowballs out of reach.
Uncertainty: opponent skill (another mind), aim execution, positioning/cover.

## Freeze points
Agency metrics frozen: move 8 u/s, jump apex ~1.55 u, blaster 18 dmg @ 0.16 s, 100 hp,
respawn 2.5 s, hitscan range 120 u. Arena 56×56 with cover crates, pillars, low walls.
