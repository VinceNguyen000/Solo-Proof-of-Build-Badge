// scripts/probe-siwe.js
const fetch = global.fetch;

const BASES = [
  'https://api.didlab.org',
  'https://blockchain.didlab.org',
];
const CANDIDATES = [
  ['/v1/siwe/nonce', 'GET'],
  ['/v1/siwe/nonce', 'POST'],
  ['/siwe/nonce',    'GET'],
  ['/siwe/nonce',    'POST'],
  ['/v1/auth/siwe/nonce', 'GET'],
  ['/v1/auth/siwe/nonce', 'POST'],
  ['/v1/nonce', 'GET'],
  ['/v1/nonce', 'POST'],
  ['/api/siwe/nonce', 'GET'],
  ['/api/siwe/nonce', 'POST'],
  ['/api/auth/siwe/nonce', 'GET'],
  ['/api/auth/siwe/nonce', 'POST'],
];

(async () => {
  for (const base of BASES) {
    console.log(`\n>>> Probing base ${base}`);
    for (const [path, method] of CANDIDATES) {
      const url = base + path;
      try {
        const res = await fetch(url, {
          method,
          headers: {'content-type':'application/json'},
          body: method === 'POST' ? JSON.stringify({}) : undefined,
        });
        console.log(method.padEnd(6), res.status, url);
      } catch (e) {
        console.log(method.padEnd(6), 'ERR', url, String(e.message||e));
      }
    }
  }

  // also try common docs to see if there’s an OpenAPI
  const DOCS = ['/openapi.json', '/swagger.json', '/docs', '/v1/docs'];
  for (const base of BASES) {
    console.log(`\n>>> Checking docs on ${base}`);
    for (const d of DOCS) {
      try {
        const res = await fetch(base + d);
        console.log('GET   ', res.status, base + d);
      } catch (e) { console.log('GET   ', 'ERR', base + d); }
    }
  }
})();
