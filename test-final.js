const { match } = require('path-to-regexp');

function test(p) {
  process.stdout.write(`Testing: ${p}\n`);
  try {
    const m = match(p);
    ['/', '/a', '/a/b'].forEach((u) => {
      try {
        const r = !!m(u);
        process.stdout.write(`  ${u}: ${r}\n`);
      } catch (e) {
        process.stdout.write(`  ${u}: MATCH ERROR ${e.message}\n`);
      }
    });
  } catch (e) {
    process.stdout.write(`  PARSE ERROR: ${e.message}\n`);
  }
}

test('(.*)');
test('/:path*');
test('{:path}*');
test('/*any');
test('/*');
