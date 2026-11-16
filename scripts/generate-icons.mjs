// Regenerates the favicons, app icons and the Open Graph image from the brand logo.
// Usage: node scripts/generate-icons.mjs
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const pub = (name) => fileURLToPath(new URL(`public/${name}`, root));
const src = (name) => fileURLToPath(new URL(name, root));

const LOGO = src("src/assets/brand/logo-dzair.png");

/**
 * Square icon cut from the brand logo, on a white rounded square.
 * - "full": map of Algeria + « Dzaïr » + flags (large icons: home screen, PWA);
 * - "word": « Dzaïr » + flags only, readable at browser-tab size.
 * The tagline is left out: unreadable at icon sizes.
 */
const CROPS = {
  full: { left: 140, top: 0, width: 815, height: 412 },
  word: { left: 295, top: 125, width: 655, height: 285 },
};

async function squareIcon(crop, size) {
  const pad = Math.round(size * 0.078);
  const radius = Math.round(size * 0.22);
  const inner = await sharp(await sharp(LOGO).extract(crop).trim().toBuffer())
    .resize(size - 2 * pad, size - 2 * pad, { fit: "inside" })
    .toBuffer();
  const { width = 0, height = 0 } = await sharp(inner).metadata();
  return sharp({
    create: {
      width: size,
      height: size,
      channels: 4,
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    },
  })
    .composite([
      {
        input: Buffer.from(
          `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}"><rect width="${size}" height="${size}" rx="${radius}" fill="#ffffff"/></svg>`,
        ),
      },
      {
        input: inner,
        left: Math.round((size - width) / 2),
        top: Math.round((size - height) / 2),
      },
    ])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

for (const [name, size, crop] of [
  ["favicon-32.png", 32, "word"],
  ["favicon.png", 48, "word"],
  ["apple-touch-icon.png", 180, "full"],
  ["icon-192.png", 192, "full"],
  ["icon-512.png", 512, "full"],
]) {
  // Draw large, then downscale: sharper small icons.
  const big = await squareIcon(CROPS[crop], Math.max(size, 512));
  await sharp(big)
    .resize(size, size)
    .png({ compressionLevel: 9 })
    .toFile(pub(name));
  console.log(`✓ public/${name}`);
}

// Open Graph image: brand logo centered on the warm off-white background.
const logo = await sharp(src("src/assets/brand/logo-dzair.png"))
  .trim()
  .resize({ width: 900, height: 470, fit: "inside" })
  .toBuffer();
const meta = await sharp(logo).metadata();
await sharp({
  create: { width: 1200, height: 630, channels: 3, background: "#FAF7F0" },
})
  .composite([
    {
      input: logo,
      left: Math.round((1200 - (meta.width ?? 0)) / 2),
      top: Math.round((630 - (meta.height ?? 0)) / 2) - 10,
    },
    {
      input: Buffer.from(
        '<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="14"><rect width="1200" height="14" fill="#0B4D3A"/><rect width="140" height="14" fill="#D21034"/></svg>',
      ),
      left: 0,
      top: 616,
    },
  ])
  .png({ compressionLevel: 9, palette: true, quality: 90 })
  .toFile(pub("og-image.png"));
console.log("✓ public/og-image.png");
