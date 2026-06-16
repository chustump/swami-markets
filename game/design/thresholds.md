# Numeric thresholds (frozen before code)

## Performance budget (weakest platform: mid mobile)
- Target 60 fps. Draw calls: arena ~24 boxes + ≤8 fighters×3 + skybox ≈ <60 draws.
- DPR capped at 1.5. No per-frame allocations in the render/sim hot path.
- Single cube VBO reused for every box (scaled per draw). One shader program.

## Simulation
- Tick: 30 Hz fixed (dt = 1/30 s) on server; client predicts at same step.
- Snapshot broadcast: 30 Hz. Client renders remote players 100 ms interpolated.

## Combat / movement (agency metrics — frozen)
- Move speed 8 u/s; gravity 26 u/s²; jump velocity 9 u/s (apex ≈ 1.55 u).
- Player capsule: radius 0.4, height 1.7, eye 1.55.
- Blaster: damage 18, cooldown 0.16 s, range 120 u, hitscan.
- Health 100; respawn delay 2.5 s; fall-out guard at y < -20.

## Input tolerances
- Mouse sensitivity adjustable; pitch clamped ±88°.
- Fire is auto while held; server rate-limits to the cooldown (no client trust).
