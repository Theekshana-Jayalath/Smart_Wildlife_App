const fs = require('fs');
let code = fs.readFileSync('src/app/(manager)/monitor.tsx', 'utf8');

// Update the injectJavaScript function to only plot SOS rangers
const oldJS = /rangersData\.forEach\(function\(r\)/;
const newJS = `var sosRangers = rangersData.filter(function(r) { return r.isSOS; });\n            sosRangers.forEach(function(r)`;

code = code.replace(oldJS, newJS);

fs.writeFileSync('src/app/(manager)/monitor.tsx', code, 'utf8');
