const fs = require('fs');
const path = require('path');

const files = [
  'public/assets/hero-textile-landscape.jpg',
  'public/assets/hero-textile-landscape-2k.jpg',
  'public/assets/about-knitted-portrait.png',
  'public/assets/contact-knitted-cityscape-bw.jpg',
  'public/assets/3d-black-object.png',
  'public/assets/3d-hero-render.png',
  'public/assets/manifesto-3d-sculpture.png',
  'public/assets/knitted-checkerboard.jpg'
];

for (const rel of files) {
  const p = path.join(__dirname, rel);
  if (fs.existsSync(p)) {
    const stat = fs.statSync(p);
    console.log(`${rel}: ${(stat.size / 1024 / 1024).toFixed(2)} MB (${stat.size} bytes)`);
  } else {
    console.log(`${rel}: NOT FOUND`);
  }
}
