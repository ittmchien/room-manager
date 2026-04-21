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

function makeMaskableSvg(size) {
  // Safe zone: 20% padding on each side → content occupies center 60% of canvas
  // (W3C maskable icon safe zone requires center 80%; this is intentionally conservative)
  const padding = Math.round(size * 0.2);
  const innerSize = size - padding * 2;
  return Buffer.from(`
<svg width="${size}" height="${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" fill="#2563EB"/>
  <rect x="${padding}" y="${padding}" width="${innerSize}" height="${innerSize}" rx="${Math.round(innerSize * 0.12)}" fill="white"/>
</svg>`);
}

const sizes = [
  { name: 'icon-192.png', size: 192, maskable: false },
  { name: 'icon-512.png', size: 512, maskable: false },
  { name: 'icon-512-maskable.png', size: 512, maskable: true },
  { name: 'apple-touch-icon.png', size: 180, maskable: false },
];

for (const { name, size, maskable } of sizes) {
  const svg = maskable ? makeMaskableSvg(size) : makeSvg(size);
  await sharp(svg)
    .png()
    .toFile(join(outDir, name));
  console.log(`Generated ${name}`);
}
