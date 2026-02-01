const { match } = require('path-to-regexp');

const patterns = [
  '*',
  '/*',
  ':path*',
  '/:path*',
  '{:path}*',
  '/:{path}*',
  '{path}*',
  '/:any(.*)',
  '/(.*)',
  '*any'
];

const testUrls = ['/', '/dashboard', '/api/user', '/huajian/test'];

patterns.forEach((pattern) => {
  console.log(`Pattern: "${pattern}"`);
  try {
    const matcher = match(pattern);
    testUrls.forEach((url) => {
      try {
        const result = matcher(url);
        console.log(`  URL: ${url} -> ${result ? 'MATCH' : 'NO MATCH'}`);
      } catch (e) {
        console.log(`  URL: ${url} -> MATCH ERROR: ${e.message}`);
      }
    });
  } catch (e) {
    console.log(`  PARSE ERROR: ${e.message}`);
  }
});
