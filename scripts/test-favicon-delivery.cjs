const http = require('http');
const { preview } = require('vite');
const path = require('path');

async function testFavicons() {
  const server = await preview({
    root: path.resolve(__dirname, '..'),
    preview: { port: 4180 }
  });

  const check = (urlPath) => new Promise((resolve, reject) => {
    http.get(`http://localhost:4180${urlPath}`, (res) => {
      resolve({
        path: urlPath,
        status: res.statusCode,
        contentType: res.headers['content-type'],
        contentLength: res.headers['content-length']
      });
    }).on('error', reject);
  });

  const urls = [
    '/',
    '/favicon.ico',
    '/favicon.svg',
    '/favicon-48x48.png',
    '/favicon-32x32.png',
    '/favicon-16x16.png',
    '/apple-touch-icon.png',
    '/android-chrome-192x192.png',
    '/android-chrome-512x512.png',
    '/site.webmanifest'
  ];

  console.log('\n--- TESTING FAVICON & ICON ASSETS VIA PREVIEW SERVER ---');
  let allPass = true;
  for (const u of urls) {
    const res = await check(u);
    const pass = res.status === 200;
    if (!pass) allPass = false;
    console.log(`${pass ? '✓' : '✗'} ${res.path.padEnd(28)} Status: ${res.status} | Content-Type: ${res.contentType} | Length: ${res.contentLength}`);
  }

  await server.close();

  if (allPass) {
    console.log('\n✓ ALL LOCAL PREVIEW TESTS PASSED (0 ERRORS, 0 404s)\n');
    process.exit(0);
  } else {
    console.error('\n✗ SOME TESTS FAILED\n');
    process.exit(1);
  }
}

testFavicons().catch((e) => {
  console.error(e);
  process.exit(1);
});
