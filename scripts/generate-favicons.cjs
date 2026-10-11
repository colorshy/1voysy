const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public');

const asteriskPaths = `
<path d="M134.333 0H113.667C111.764 0 110.222 1.46676 110.222 3.27611V232.604C110.222 234.413 111.764 235.88 113.667 235.88H134.333C136.236 235.88 137.778 234.413 137.778 232.604V3.27611C137.778 1.46676 136.236 0 134.333 0Z" />
<path d="M244.556 104.836H3.44444C1.54213 104.836 0 106.302 0 108.112V127.768C0 129.578 1.54213 131.045 3.44444 131.045H244.556C246.458 131.045 248 129.578 248 127.768V108.112C248 106.302 246.458 104.836 244.556 104.836Z" />
<path d="M218.988 41.4938L204.375 27.5944C203.029 26.315 200.849 26.315 199.503 27.5944L29.0121 189.754C27.6669 191.033 27.6669 193.107 29.0121 194.387L43.6256 208.286C44.9707 209.565 47.1517 209.565 48.4968 208.286L218.988 46.1269C220.333 44.8475 220.333 42.7732 218.988 41.4938Z" />
<path d="M43.6255 27.5944L29.0119 41.4937C27.6668 42.7731 27.6668 44.8475 29.0119 46.1269L199.503 208.286C200.848 209.565 203.029 209.565 204.374 208.286L218.988 194.387C220.333 193.107 220.333 191.033 218.988 189.754L48.4967 27.5944C47.1515 26.315 44.9706 26.315 43.6255 27.5944Z" />
`;

function getMasterSvg(size = 512, bg = '#0E1116', fg = '#FFFFFF', radius = 112, scale = 0.62) {
  const cx = size / 2;
  const cy = size / 2;
  const s = (size / 248) * scale;
  return `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" width="${size}" height="${size}">
  <rect width="${size}" height="${size}" rx="${radius}" fill="${bg}"/>
  <g transform="translate(${cx}, ${cy}) scale(${s}) translate(-124, -117.94)" fill="${fg}">
    ${asteriskPaths}
  </g>
</svg>`;
}

function createIcoFromPngBuffers(pngBuffers) {
  const count = pngBuffers.length;
  const headerSize = 6 + count * 16;
  
  let currentOffset = headerSize;
  const entries = [];
  
  for (const img of pngBuffers) {
    entries.push({
      width: img.width >= 256 ? 0 : img.width,
      height: img.height >= 256 ? 0 : img.height,
      size: img.buffer.length,
      offset: currentOffset,
      buffer: img.buffer
    });
    currentOffset += img.buffer.length;
  }
  
  const totalSize = currentOffset;
  const out = Buffer.alloc(totalSize);
  
  // ICONDIR
  out.writeUInt16LE(0, 0); // reserved
  out.writeUInt16LE(1, 2); // type 1 = icon
  out.writeUInt16LE(count, 4); // count
  
  let entryOffset = 6;
  for (const entry of entries) {
    out.writeUInt8(entry.width, entryOffset);
    out.writeUInt8(entry.height, entryOffset + 1);
    out.writeUInt8(0, entryOffset + 2); // color count
    out.writeUInt8(0, entryOffset + 3); // reserved
    out.writeUInt16LE(1, entryOffset + 4); // color planes
    out.writeUInt16LE(32, entryOffset + 6); // bits per pixel
    out.writeUInt32LE(entry.size, entryOffset + 8); // size
    out.writeUInt32LE(entry.offset, entryOffset + 12); // offset
    entryOffset += 16;
    
    entry.buffer.copy(out, entry.offset);
  }
  
  return out;
}

async function run() {
  console.log('Generating favicon assets in public/...');
  const masterSvg = getMasterSvg(512);
  const masterBuffer = Buffer.from(masterSvg, 'utf8');

  // 1. favicon.svg
  const svgPath = path.join(PUBLIC_DIR, 'favicon.svg');
  fs.writeFileSync(svgPath, masterSvg);
  console.log('Saved:', svgPath);

  // 2. PNG sizes
  const sizes = [
    { name: 'favicon-16x16.png', size: 16 },
    { name: 'favicon-32x32.png', size: 32 },
    { name: 'favicon-48x48.png', size: 48 },
    { name: 'apple-touch-icon.png', size: 180 },
    { name: 'android-chrome-192x192.png', size: 192 },
    { name: 'android-chrome-512x512.png', size: 512 }
  ];

  const generatedPngs = {};
  for (const item of sizes) {
    const dest = path.join(PUBLIC_DIR, item.name);
    const buf = await sharp(masterBuffer)
      .resize(item.size, item.size)
      .png({ compressionLevel: 9 })
      .toBuffer();
    fs.writeFileSync(dest, buf);
    generatedPngs[item.size] = buf;
    console.log(`Saved: ${item.name} (${item.size}x${item.size}, ${buf.length} bytes)`);
  }

  // 3. favicon.ico (16, 32, 48)
  const icoBuffer = createIcoFromPngBuffers([
    { width: 16, height: 16, buffer: generatedPngs[16] },
    { width: 32, height: 32, buffer: generatedPngs[32] },
    { width: 48, height: 48, buffer: generatedPngs[48] }
  ]);
  const icoPath = path.join(PUBLIC_DIR, 'favicon.ico');
  fs.writeFileSync(icoPath, icoBuffer);
  console.log(`Saved: favicon.ico (${icoBuffer.length} bytes)`);

  // 4. site.webmanifest
  const manifest = {
    name: ".1VOYSY — Creative Developer",
    short_name: ".1VOYSY",
    description: "Portfolio of Askar Kaimekin (.1VOYSY). Creative Developer & Web Design.",
    icons: [
      {
        src: "/android-chrome-192x192.png",
        sizes: "192x192",
        type: "image/png"
      },
      {
        src: "/android-chrome-512x512.png",
        sizes: "512x512",
        type: "image/png"
      }
    ],
    theme_color: "#0E1116",
    background_color: "#0E1116",
    display: "standalone",
    start_url: "/"
  };
  const manifestPath = path.join(PUBLIC_DIR, 'site.webmanifest');
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2) + '\n');
  console.log('Saved:', manifestPath);

  console.log('All favicon assets generated successfully!');
}

run().catch((err) => {
  console.error('Error generating assets:', err);
  process.exit(1);
});
