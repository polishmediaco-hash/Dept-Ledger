const fs = require('fs');
const path = require('path');
const sharp = require('sharp');

// Create the clean, sharp monochrome geometric LEDGER mark
const svgContent = `
<svg width="512" height="512" viewBox="0 0 512 512" fill="none" xmlns="http://www.w3.org/2000/svg">
  <!-- Minimalist dark background card -->
  <rect width="512" height="512" rx="128" fill="#09090B" />
  <rect x="10" y="10" width="492" height="492" rx="120" stroke="#27272A" stroke-width="12" />

  <!-- Sharp geometric monogram ledger mark -->
  <g fill="#FAFAFA">
    <!-- Precision vertical stem -->
    <rect x="112" y="96" width="72" height="320" rx="16" />
    <!-- Precision horizontal baseline -->
    <rect x="112" y="344" width="288" height="72" rx="16" />
    <!-- Top credit balance rule -->
    <rect x="232" y="96" width="168" height="56" rx="16" />
    <!-- Mid debit ledger mark -->
    <rect x="232" y="200" width="104" height="48" rx="12" />
  </g>
</svg>
`;

async function generate() {
  const publicDir = path.join(__dirname, 'public');
  const buffer = Buffer.from(svgContent);

  // 1. icon-512.png
  await sharp(buffer)
    .resize(512, 512)
    .png()
    .toFile(path.join(publicDir, 'icon-512.png'));
  console.log('Generated icon-512.png');

  // 2. icon-192.png
  await sharp(buffer)
    .resize(192, 192)
    .png()
    .toFile(path.join(publicDir, 'icon-192.png'));
  console.log('Generated icon-192.png');

  // 3. apple-touch-icon.png (180x180)
  await sharp(buffer)
    .resize(180, 180)
    .png()
    .toFile(path.join(publicDir, 'apple-touch-icon.png'));
  console.log('Generated apple-touch-icon.png');
}

generate().catch(err => {
  console.error('Error generating icons:', err);
  process.exit(1);
});
