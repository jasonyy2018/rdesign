const { match } = require('path-to-regexp');
const fs = require('fs');

let out = '';
function test(p) {
  out += `Testing: ${p}\n`;
  try {
    const m = match(p);
    ['/', '/a', '/a/b'].forEach((u) => {
      try {
        const r = !!m(u);
        out += `  ${u}: ${r}\n`;
      } catch (e) {
        out += `  ${u}: MATCH ERROR ${e.message}\n`;
      }
    });
  } catch (e) {
    out += `  PARSE ERROR: ${e.message}\n`;
  }
}

['(.*)', '/:path*', '{:path}*', '/*any', '/*', '*path', '/*path'].forEach(test);

fs.writeFileSync('test-results.txt', out);
