# Kid Data Switch

One button to turn a kid's phone data off, and one to turn it back on, at both:

- **US Mobile** — the line's *Data Blocker* (cellular data)
- **Cox** — *Pause Device* on the home WiFi

Neither company offers a public API, so this works by signing in to their
websites as you and clicking the same controls you would.

## Status: what is and is not tested

- The server and its step engine pass an end-to-end test against a local fake
  site (`cd server && npm test`).
- The phone app bundles for iOS and Android; it has not been run on a phone.
- **The US Mobile and Cox click paths in `server/recipes/` are untested
  guesses.** They were written from the companies' help pages without access
  to the live sites or an account. Expect to correct them (step 4 below).
  In particular, Cox documents *Pause Device* only for its phone app; if the
  Cox website has no pause control, the Cox half cannot work this way.

## Parts

- `server/` — runs on a computer at home that stays on (Mac, PC or Linux with
  a screen for the first sign-in). Drives a browser with Playwright.
- `app/` — the phone app (Expo / React Native). Talks only to your server.

## Setup

1. **Server**

   ```
   cd server
   npm install
   npx playwright install chromium
   cp .env.example .env      # then edit .env
   ```

   In `.env`, set a long random `KDS_TOKEN`, the kid's line name as shown in
   US Mobile, and the phone's device name as shown in Cox.

2. **Sign in once per site** (handles text-message codes; the session is saved
   in `server/profiles/`):

   ```
   npm run login usmobile
   npm run login cox
   ```

3. **Try each site in a visible browser:**

   ```
   npm run try usmobile off
   npm run try usmobile on
   npm run try cox off
   npm run try cox on
   ```

4. **Fix a recipe when a step fails.** The error names the step, and a
   screenshot is saved in `server/debug/`. Run `npm run record usmobile` (or
   `cox`), do the clicks by hand, and copy the recorded button names or
   selectors into `server/recipes/<site>.json`.

5. **Start the server:** `npm start` (port 8787).

6. **Phone app**

   ```
   cd app
   npm install
   npx expo start
   ```

   Open it with the Expo Go app, or build an installable app with
   `npx eas build`. On first launch enter the server address
   (`http://<computer's IP>:8787`) and the `KDS_TOKEN` value.

## Recipe steps

Each recipe has a `start` page, a `ready` target that is only visible when
signed in, optional `login` steps, and `off` / `on` step lists. A target is
one of `selector`, `role` + `name`, `label`, or `text`. `${NAME}` is replaced
by the setting `NAME` from `.env`.

| Step | What it does |
| --- | --- |
| `goto` | Opens `url` |
| `click` | Clicks the target; with `"optional": true`, skips it if it does not appear |
| `fill` | Types `value` into the target |
| `waitFor` | Waits until the target is visible |
| `setSwitch` | Clicks a switch only if it is not already `checked` true/false |
| `verifySwitch` | Waits until the switch reads `checked` true/false |
| `stopIf` | Finishes early if the target shows up before the `otherwise` target (already done) |
| `wait` | Pauses `ms` milliseconds |

## Things to know

- The app shows what the server **last set**, not a live reading from the
  carriers. A change made in the US Mobile or Cox app will not show here.
- Cox's pause blocks internet access only; and a paused phone can still use
  cellular data unless the US Mobile half also succeeded. The app reports
  each half separately.
- The phone reaches the server only on your home WiFi unless you add
  something like Tailscale. The connection is plain `http` protected by the
  access code, so do not expose the port to the internet.
- Saved sign-ins expire. If `.env` has the account passwords the server tries
  to sign back in; if the site asks for a code or captcha, run
  `npm run login <site>` again.
- Automating these sites may be against their terms of service, and they can
  change their pages at any time.
