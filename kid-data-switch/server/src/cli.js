// Helper commands, run on the computer that hosts the server:
//   npm run login  <provider>            open a browser to sign in (saves the session)
//   npm run record <provider>            same, with Playwright's recorder to capture clicks
//   npm run try    <provider> <on|off>   run a recipe in a visible browser
const { spawnSync } = require('child_process');
const fs = require('fs');
const { loadRecipe, runRecipe, profileDir } = require('./engine');

const [cmd, id, arg] = process.argv.slice(2);

function usage() {
  console.error('Usage: cli.js <login|record|try> <provider> [on|off]');
  process.exit(1);
}

async function main() {
  if (!cmd || !id) usage();
  const recipe = loadRecipe(id);

  if (cmd === 'login' || cmd === 'record') {
    fs.mkdirSync(profileDir(id), { recursive: true });
    const tool = cmd === 'login' ? 'open' : 'codegen';
    console.log(
      cmd === 'login'
        ? 'Sign in (including any text-message code), then close the browser window.'
        : 'Do the clicks by hand; copy the recorded selectors into recipes/' + id + '.json.'
    );
    const r = spawnSync('npx', ['playwright', tool, `--user-data-dir=${profileDir(id)}`, recipe.start], {
      stdio: 'inherit',
    });
    process.exit(r.status || 0);
  }

  if (cmd === 'try') {
    if (arg !== 'on' && arg !== 'off') usage();
    await runRecipe(id, arg, { headed: !process.env.KDS_HEADLESS });
    console.log(`${recipe.name || id}: data turned ${arg}.`);
    return;
  }
  usage();
}

main().catch((err) => {
  console.error(err.message);
  if (err.screenshot) console.error('Screenshot: ' + err.screenshot);
  process.exit(1);
});
