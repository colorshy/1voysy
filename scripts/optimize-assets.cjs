const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

const ASSETS_DIR = path.resolve(__dirname, '../public/assets');
const BACKUP_DIR = path.join(ASSETS_DIR, '_raw_backup');

if (!fs.existsSync(BACKUP_DIR)) {
  fs.mkdirSync(BACKUP_DIR, { recursive: true });
}

async function optimizeImage(relPath, options = {}) {
  const fullPath = path.join(ASSETS_DIR, relPath);
  if (!fs.existsSync(fullPath)) {
    console.log(`[SKIP] File not found: ${relPath}`);
    return;
  }

  const backupPath = path.join(BACKUP_DIR, relPath);
  const backupDir = path.dirname(backupPath);
  if (!fs.existsSync(backupDir)) {
    fs.mkdirSync(backupDir, { recursive: true });
  }

  if (!fs.existsSync(backupPath)) {
    fs.copyFileSync(fullPath, backupPath);
    console.log(`[BACKUP] Saved copy of ${relPath}`);
  }

  const { maxWidth, maxHeight, quality = 85, webpQuality = 85 } = options;
  const originalSize = fs.statSync(fullPath).size;

  let pipeline = sharp(backupPath);
  const meta = await pipeline.metadata();

  if (maxWidth || maxHeight) {
    pipeline = pipeline.resize({
      width: maxWidth,
      height: maxHeight,
      fit: 'inside',
      withoutEnlargement: true
    });
  }

  // 1. Generate WebP version
  const ext = path.extname(relPath);
  const baseName = relPath.substring(0, relPath.length - ext.length);
  const webpPath = path.join(ASSETS_DIR, `${baseName}.webp`);

  await pipeline
    .clone()
    .webp({ quality: webpQuality, effort: 5 })
    .toFile(webpPath);
  
  const webpSize = fs.statSync(webpPath).size;
  console.log(`[WEBP] ${baseName}.webp: ${(originalSize / 1024).toFixed(1)}KB -> ${(webpSize / 1024).toFixed(1)}KB (-${Math.round((1 - webpSize / originalSize) * 100)}%)`);

  // 2. Overwrite / optimize original format with high visual fidelity
  const tempPath = path.join(ASSETS_DIR, `${baseName}_optimized_tmp${ext}`);
  if (ext.toLowerCase() === '.png') {
    await pipeline
      .clone()
      .png({ quality: Math.min(quality + 5, 95), compressionLevel: 8, palette: false })
      .toFile(tempPath);
  } else if (ext.toLowerCase() === '.jpg' || ext.toLowerCase() === '.jpeg') {
    await pipeline
      .clone()
      .jpeg({ quality, mozjpeg: true })
      .toFile(tempPath);
  }

  if (fs.existsSync(tempPath)) {
    const optSize = fs.statSync(tempPath).size;
    fs.renameSync(tempPath, fullPath);
    console.log(`[OPT] ${relPath}: ${(originalSize / 1024).toFixed(1)}KB -> ${(optSize / 1024).toFixed(1)}KB (-${Math.round((1 - optSize / originalSize) * 100)}%)`);
  }
}

async function run() {
  console.log('--- STARTING ASSET OPTIMIZATION ---');

  // Hero landscape (was 3.6 MB)
  await optimizeImage('hero-textile-landscape-2k.jpg', { maxWidth: 2200, quality: 86, webpQuality: 86 });
  await optimizeImage('hero-textile-landscape.jpg', { maxWidth: 1800, quality: 84, webpQuality: 84 });

  // About knitted portrait (was 3.37 MB PNG)
  await optimizeImage('about-knitted-portrait.png', { maxWidth: 1400, quality: 88, webpQuality: 88 });

  // Contact cityscape (was 3.03 MB JPG)
  await optimizeImage('contact-knitted-cityscape-bw.jpg', { maxWidth: 2000, quality: 82, webpQuality: 82 });

  // 3D black knot sculpture (was 1.23 MB PNG)
  await optimizeImage('3d-black-object.png', { maxWidth: 1200, quality: 90, webpQuality: 90 });

  // Knitted checkerboard (was 4.82 MB)
  await optimizeImage('knitted-checkerboard.jpg', { maxWidth: 1920, quality: 82, webpQuality: 82 });

  console.log('--- COMPLETED ASSET OPTIMIZATION ---');
}

run().catch(err => {
  console.error('Error during optimization:', err);
  process.exit(1);
});
