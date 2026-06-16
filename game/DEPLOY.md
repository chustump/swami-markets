# NEON ARENA — deploy info

- **Play URL:** https://sweet-cafe-826.higgsfield.gg/
- **Higgsfield game_id:** `8e866ea9-2c70-4b35-ae80-59664ed0a201` (pass this to `deploy_game` to update in place — keeps the same URL)
- **Mode:** custom-server (realtime `server.js`, Cloudflare Durable Object)

## Layout (zip root)
- `server.js` — authoritative 30 Hz realtime game server
- `index.html` — raw-WebGL client (renderer, netcode, input, HUD)
- `strings.js` — externalized UI strings

## Asset note
The generated art/audio (floor/wall/crate textures, skybox, blaster/impact SFX, music)
are served from the Higgsfield CDN because this build environment's network policy blocked
bundling the bytes locally. The client loads them at runtime and falls back to on-style
procedural textures if a browser blocks cross-origin texture use, so the game is always
coherent. The 16:9 cover and 1:1 favicon (generated) power the marketplace card.

## Updating
Re-zip `server.js index.html strings.js` at the archive root, host it where Higgsfield can
fetch it (e.g. this repo's raw URL), and call `deploy_game` again **with the game_id above**.
