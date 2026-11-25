// Runs a "recipe" (a list of browser steps) against a carrier website
// using a saved browser profile, so logins and 2FA survive between runs.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');

const ROOT = path.join(__dirname, '..');
const RECIPE_DIR = process.env.KDS_RECIPE_DIR || path.join(ROOT, 'recipes');
const PROFILE_DIR = process.env.KDS_PROFILE_DIR || path.join(ROOT, 'profiles');
const DEBUG_DIR = process.env.KDS_DEBUG_DIR || path.join(ROOT, 'debug');
const STEP_TIMEOUT = Number(process.env.KDS_STEP_TIMEOUT_MS || 20000);

function listRecipes() {
  return fs
    .readdirSync(RECIPE_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => loadRecipe(path.basename(f, '.json')));
}

function loadRecipe(id) {
  if (!/^[a-z0-9-]+$/.test(id)) throw new Error(`Bad provider id: ${id}`);
  const recipe = JSON.parse(fs.readFileSync(path.join(RECIPE_DIR, `${id}.json`), 'utf8'));
  return { id, ...recipe };
}

function profileDir(id) {
  return path.join(PROFILE_DIR, id);
}

// Replace ${NAME} with the environment variable NAME.
function subst(value, env) {
  if (typeof value !== 'string') return value;
  return value.replace(/\$\{([A-Z0-9_]+)\}/g, (_, name) => {
    if (!env[name]) throw new Error(`Missing setting ${name} (add it to server/.env)`);
    return env[name];
  });
}

function escapeRe(s) {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// A step or condition names its target one of four ways.
function locate(page, spec, env) {
  let loc;
  if (spec.selector) loc = page.locator(subst(spec.selector, env));
  else if (spec.role) {
    const name = spec.name ? new RegExp(escapeRe(subst(spec.name, env)), 'i') : undefined;
    loc = page.getByRole(spec.role, { name });
  } else if (spec.label) loc = page.getByLabel(subst(spec.label, env));
  else if (spec.text) loc = page.getByText(subst(spec.text, env), { exact: !!spec.exact });
  else throw new Error(`Step has no selector/role/label/text: ${JSON.stringify(spec)}`);
  return loc.first();
}

async function isOn(loc) {
  const aria = await loc.getAttribute('aria-checked');
  if (aria !== null) return aria === 'true';
  const pressed = await loc.getAttribute('aria-pressed');
  if (pressed !== null) return pressed === 'true';
  return loc.isChecked();
}

async function runStep(page, step, env) {
  const timeout = step.timeout || STEP_TIMEOUT;
  switch (step.do) {
    case 'goto':
      await page.goto(subst(step.url, env), { waitUntil: 'domcontentloaded', timeout: 60000 });
      return;
    case 'click': {
      const loc = locate(page, step, env);
      if (step.optional) {
        // e.g. a confirmation dialog that only sometimes appears
        try {
          await loc.waitFor({ state: 'visible', timeout: step.timeout || 4000 });
        } catch {
          return;
        }
      }
      await loc.click({ timeout });
      return;
    }
    case 'fill':
      await locate(page, step, env).fill(subst(step.value, env), { timeout });
      return;
    case 'waitFor':
      await locate(page, step, env).waitFor({ state: 'visible', timeout });
      return;
    case 'setSwitch': {
      // Only clicks when the switch is not already in the wanted position.
      const loc = locate(page, step, env);
      await loc.waitFor({ state: 'visible', timeout });
      // A confirm dialog may be needed before the switch moves; recipes handle
      // that with a following optional click and a verifySwitch step.
      if ((await isOn(loc)) !== step.checked) await loc.click({ timeout });
      return;
    }
    case 'verifySwitch': {
      const loc = locate(page, step, env);
      const deadline = Date.now() + timeout;
      while ((await isOn(loc)) !== step.checked) {
        if (Date.now() > deadline) throw new Error('Switch did not change to the wanted position');
        await page.waitForTimeout(500);
      }
      return;
    }
    case 'stopIf': {
      // Already in the wanted state (e.g. device is already paused): finish early.
      // Waits until either this target or the "otherwise" target shows up.
      const done = locate(page, step, env);
      const notDone = locate(page, step.otherwise, env);
      const winner = await Promise.race([
        done.waitFor({ state: 'visible', timeout }).then(() => 'done'),
        notDone.waitFor({ state: 'visible', timeout }).then(() => 'notDone'),
      ]);
      if (winner === 'done') throw STOP;
      return;
    }
    case 'wait':
      await page.waitForTimeout(step.ms || 1000);
      return;
    default:
      throw new Error(`Unknown step type: ${step.do}`);
  }
}

const STOP = Symbol('stop');

async function runSteps(page, steps, env, label) {
  for (let i = 0; i < steps.length; i++) {
    try {
      await runStep(page, steps[i], env);
    } catch (err) {
      if (err === STOP) return;
      const first = String(err.message).split('\n')[0];
      throw new Error(`${label} step ${i + 1} (${steps[i].do}) failed: ${first}`);
    }
  }
}

// Open the start page, then wait until we can tell whether we are logged in.
async function ensureLoggedIn(page, recipe, env) {
  await page.goto(subst(recipe.start, env), { waitUntil: 'domcontentloaded', timeout: 60000 });
  if (!recipe.ready) return;
  const ready = locate(page, recipe.ready, env);
  const loggedOut = recipe.login && recipe.login.when ? locate(page, recipe.login.when, env) : null;

  const winner = await Promise.race([
    ready.waitFor({ state: 'visible', timeout: 45000 }).then(() => 'ready'),
    loggedOut
      ? loggedOut.waitFor({ state: 'visible', timeout: 45000 }).then(() => 'loggedOut')
      : new Promise(() => {}),
  ]).catch(() => 'unknown');

  if (winner === 'ready') return;
  if (winner === 'unknown') {
    throw new Error('Start page did not show the logged-in view or the login form');
  }
  const steps = recipe.login.steps || [];
  const needs = recipe.login.needs || [];
  if (!steps.length || needs.some((n) => !env[n])) {
    throw new Error(`Not logged in. Run "npm run login ${recipe.id}" on the server computer`);
  }
  await runSteps(page, steps, env, 'login');
  try {
    await ready.waitFor({ state: 'visible', timeout: 45000 });
  } catch {
    throw new Error(
      `Automatic login did not finish (a code or captcha may be needed). Run "npm run login ${recipe.id}"`
    );
  }
}

// action is "off" (block the kid's data) or "on" (restore it).
async function runRecipe(id, action, opts = {}) {
  const env = opts.env || process.env;
  const recipe = loadRecipe(id);
  const steps = recipe[action];
  if (!Array.isArray(steps)) throw new Error(`Recipe ${id} has no "${action}" steps`);

  fs.mkdirSync(profileDir(id), { recursive: true });
  const context = await chromium.launchPersistentContext(profileDir(id), {
    headless: !opts.headed,
    viewport: { width: 1280, height: 900 },
  });
  const page = context.pages()[0] || (await context.newPage());
  try {
    await ensureLoggedIn(page, recipe, env);
    await runSteps(page, steps, env, action);
  } catch (err) {
    try {
      fs.mkdirSync(DEBUG_DIR, { recursive: true });
      const shot = path.join(DEBUG_DIR, `${id}-${action}-${Date.now()}.png`);
      await page.screenshot({ path: shot, fullPage: true });
      err.screenshot = shot;
    } catch {}
    throw err;
  } finally {
    await context.close();
  }
}

module.exports = { listRecipes, loadRecipe, runRecipe, profileDir };
