const fs = require('fs');
const path = require('path');
const http = require('http');

const ROOT = path.resolve(__dirname, '..');
const DIST = path.join(ROOT, 'dist');

function checkHtmlFile(relPath, canonicalExpected, titleSnippet) {
  const filePath = path.join(DIST, relPath);
  if (!fs.existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  const html = fs.readFileSync(filePath, 'utf8');
  console.log(`\n========================================`);
  console.log(`Checking ${relPath}`);
  console.log(`========================================`);

  // Title
  const titleMatch = html.match(/<title>([^<]+)<\/title>/);
  if (!titleMatch) throw new Error(`Missing <title> in ${relPath}`);
  console.log(`Title: ${titleMatch[1]}`);
  if (!titleMatch[1].includes(titleSnippet)) {
    throw new Error(`Title snippet "${titleSnippet}" not in title: ${titleMatch[1]}`);
  }

  // Meta description
  const descMatch = html.match(/<meta\s+name=["']description["']\s+content=["']([^"']+)["']/i);
  if (!descMatch) throw new Error(`Missing meta description in ${relPath}`);
  console.log(`Description: ${descMatch[1]}`);

  // Canonical
  const canonMatch = html.match(/<link\s+rel=["']canonical["']\s+href=["']([^"']+)["']/i);
  if (!canonMatch) throw new Error(`Missing canonical in ${relPath}`);
  console.log(`Canonical: ${canonMatch[1]}`);
  if (canonMatch[1] !== canonicalExpected) {
    throw new Error(`Expected canonical ${canonicalExpected}, got ${canonMatch[1]}`);
  }

  // Open Graph
  const ogTitle = html.match(/<meta\s+property=["']og:title["']\s+content=["']([^"']+)["']/i);
  const ogDesc = html.match(/<meta\s+property=["']og:description["']\s+content=["']([^"']+)["']/i);
  const ogUrl = html.match(/<meta\s+property=["']og:url["']\s+content=["']([^"']+)["']/i);
  const ogImage = html.match(/<meta\s+property=["']og:image["']\s+content=["']([^"']+)["']/i);
  if (!ogTitle || !ogDesc || !ogUrl || !ogImage) {
    throw new Error(`Incomplete Open Graph tags in ${relPath}`);
  }
  console.log(`OG Title: ${ogTitle[1]}`);
  console.log(`OG URL: ${ogUrl[1]}`);
  console.log(`OG Image: ${ogImage[1]}`);

  // Twitter Cards
  const twitterCard = html.match(/<meta\s+name=["']twitter:card["']\s+content=["']([^"']+)["']/i);
  const twitterTitle = html.match(/<meta\s+name=["']twitter:title["']\s+content=["']([^"']+)["']/i);
  const twitterImage = html.match(/<meta\s+name=["']twitter:image["']\s+content=["']([^"']+)["']/i);
  if (!twitterCard || !twitterTitle || !twitterImage) {
    throw new Error(`Incomplete Twitter Card tags in ${relPath}`);
  }
  console.log(`Twitter Card: ${twitterCard[1]}`);
  console.log(`Twitter Image: ${twitterImage[1]}`);

  // Check robots / noindex
  if (html.toLowerCase().includes('noindex')) {
    throw new Error(`Accidental noindex found in ${relPath}`);
  }

  // Structured Data (JSON-LD)
  const jsonLdMatch = html.match(/<script\s+type=["']application\/ld\+json["']>([\s\S]*?)<\/script>/i);
  if (!jsonLdMatch) throw new Error(`Missing JSON-LD structured data in ${relPath}`);
  try {
    const parsed = JSON.parse(jsonLdMatch[1]);
    console.log(`JSON-LD valid JSON with @context: ${parsed['@context']}`);
  } catch (err) {
    throw new Error(`Invalid JSON-LD syntax in ${relPath}: ${err.message}`);
  }
}

// 1. Validate HTML files
checkHtmlFile('index.html', 'https://www.1voysy.tech/', '.1VOYSY');
checkHtmlFile('careers.html', 'https://www.1voysy.tech/careers', 'Career Archive');
checkHtmlFile('direction.html', 'https://www.1voysy.tech/direction', 'Directions');

// 2. Validate robots.txt
console.log(`\n========================================`);
console.log(`Checking robots.txt`);
console.log(`========================================`);
const robotsPath = path.join(DIST, 'robots.txt');
if (!fs.existsSync(robotsPath)) throw new Error('dist/robots.txt does not exist');
const robots = fs.readFileSync(robotsPath, 'utf8');
console.log(robots);
if (!robots.includes('User-agent: *')) throw new Error('robots.txt missing User-agent: *');
if (!robots.includes('Allow: /')) throw new Error('robots.txt missing Allow: /');
if (!robots.includes('https://www.1voysy.tech/sitemap.xml')) throw new Error('robots.txt missing sitemap reference');

// 3. Validate sitemap.xml
console.log(`\n========================================`);
console.log(`Checking sitemap.xml`);
console.log(`========================================`);
const sitemapPath = path.join(DIST, 'sitemap.xml');
if (!fs.existsSync(sitemapPath)) throw new Error('dist/sitemap.xml does not exist');
const sitemap = fs.readFileSync(sitemapPath, 'utf8');
console.log(sitemap);
const expectedUrls = [
  'https://www.1voysy.tech/',
  'https://www.1voysy.tech/careers',
  'https://www.1voysy.tech/direction'
];
for (const u of expectedUrls) {
  if (!sitemap.includes(`<loc>${u}</loc>`)) {
    throw new Error(`sitemap.xml missing <loc>${u}</loc>`);
  }
}

// 4. Validate preview server responses
console.log(`\n========================================`);
console.log(`Testing HTTP Responses via Vite Preview`);
console.log(`========================================`);

const { preview } = require('vite');

async function testHttp() {
  const server = await preview({
    root: ROOT,
    preview: { port: 4199 }
  });

  const routesToTest = [
    '/',
    '/careers',
    '/direction',
    '/robots.txt',
    '/sitemap.xml',
    '/assets/og-image.jpg'
  ];

  for (const route of routesToTest) {
    await new Promise((resolve, reject) => {
      http.get(`http://localhost:4199${route}`, (res) => {
        console.log(`GET ${route} -> Status: ${res.statusCode} (Content-Type: ${res.headers['content-type']})`);
        if (res.statusCode !== 200) {
          reject(new Error(`Failed GET ${route}: status ${res.statusCode}`));
        } else {
          resolve();
        }
      }).on('error', reject);
    });
  }

  server.httpServer.close();
  console.log(`\n>>> ALL SEO VERIFICATION CHECKS PASSED SUCCESSFULLY! <<<\n`);
}

testHttp().catch(err => {
  console.error('HTTP test failed:', err);
  process.exit(1);
});
