import sharp from 'sharp';
import { mkdirSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = join(__dirname, '../public/icons');
mkdirSync(outDir, { recursive: true });

function makeSvg(size) {
  return Buffer.from(`
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${Math.round(size * 0.18)}" fill="#2563EB"/>
  <rect x="${Math.round(size*0.25)}" y="${Math.round(size*0.25)}" width="${Math.round(size*0.5)}" height="${Math.round(size*0.5)}" rx="${Math.round(size*0.06)}" fill="white"/>
</svg>`);
}

const sizes = [
  { name: 'icon-192.png', size: 192 },
  { name: 'icon-512.png', size: 512 },
  { name: 'apple-touch-icon.png', size: 180 },
];

for (const { name, size } of sizes) {
  await sharp(makeSvg(size), { density: 300 })
    .png()
    .toFile(join(outDir, name));
  console.log(`Generated ${name}`);
}
