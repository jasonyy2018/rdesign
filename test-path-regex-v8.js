const { match } = require('path-to-regexp');

const paths = ['*path', '/*path', '/:path*', '(.*)'];
const testUrls = ['/', '/dashboard', '/api/user', '/huajian/test'];

paths.forEach((path) => {
  console.log(`Testing path pattern: ${path}`);
  try {
    const matcher = match(path);
    testUrls.forEach((url) => {
      const result = matcher(url);
      console.log(`  URL: ${url} -> ${result ? 'MATCH' : 'NO MATCH'}`);
    });
  } catch (e) {
    console.error(`  Error parsing path "${path}": ${e.message}`);
  }
});
