import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

const svg = `
<svg width="512" height="512" viewBox="0 0 512 512" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#18181B" />
      <stop offset="100%" stop-color="#09090B" />
    </linearGradient>
    <linearGradient id="goldGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#D97706" />
    </linearGradient>
  </defs>

  <!-- Background base -->
  <rect width="512" height="512" rx="112" fill="url(#bgGrad)" />
  
  <!-- Subtle border outline -->
  <rect x="16" y="16" width="480" height="480" rx="96" fill="none" stroke="#27272A" stroke-width="6" opacity="0.8" />

  <!-- Monogram 'L' in pristine bold geometric architecture -->
  <g transform="translate(146, 126)">
    <!-- Vertical stem -->
    <rect x="0" y="0" width="56" height="260" rx="14" fill="#FAFAFA" />
    <!-- Horizontal base -->
    <rect x="0" y="204" width="220" height="56" rx="14" fill="#FAFAFA" />
    <!-- Gold Balance Accent Dot at top-right -->
    <circle cx="204" cy="56" r="22" fill="url(#goldGrad)" />
  </g>
</svg>
`;

async function generate() {
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

  // Save SVG
  fs.writeFileSync(path.join(publicDir, 'icon.svg'), svg);
  fs.writeFileSync(path.join(publicDir, 'favicon.svg'), svg);

  const svgBuffer = Buffer.from(svg);

  // Generate PNGs
  await sharp(svgBuffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));

  await sharp(svgBuffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));

  await sharp(svgBuffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));

  console.log('App icons generated successfully in /public!');
}

generate().catch(err => {
  console.error(err);
  process.exit(1);
});
