const fs = require('fs');

let page = fs.readFileSync('src/app/page.jsx', 'utf8');

// The file has literal `\` followed by `` ` ``. We need to un-escape backticks and dollar signs.
page = page.replace(/\\`/g, '`').replace(/\\\$/g, '$');

// Wait, the new line \n inside the string was `\\\\n` which translated to `\\n`
page = page.replace(/\\\\n/g, '\\n');

fs.writeFileSync('src/app/page.jsx', page);
console.log('Fixed escaping in src/app/page.jsx');
