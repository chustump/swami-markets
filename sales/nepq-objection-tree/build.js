// Injects objection-tree.json into template.html -> objection-tree.html
// The JSON is the single source of truth; never hand-edit the generated HTML.
const fs = require('fs');
const path = require('path');

const dir = __dirname;
const tree = fs.readFileSync(path.join(dir, 'objection-tree.json'), 'utf8');
const template = fs.readFileSync(path.join(dir, 'template.html'), 'utf8');

JSON.parse(tree); // fail loudly on malformed data

const marker = '/*__TREE__*/null';
if (!template.includes(marker)) throw new Error('marker ' + marker + ' missing from template.html');

const out = template.replace(marker, tree.trim());
fs.writeFileSync(path.join(dir, 'objection-tree.html'), out);
console.log('wrote objection-tree.html (' + (out.length / 1024).toFixed(1) + ' KB)');
