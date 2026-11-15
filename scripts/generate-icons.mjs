// Regenerates the favicon PNGs and the Open Graph image from the brand sources.
// Usage: node scripts/generate-icons.mjs
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = new URL("../", import.meta.url);
const pub = (name) => fileURLToPath(new URL(`public/${name}`, root));
const src = (name) => fileURLToPath(new URL(name, root));

const svg = await readFile(pub("favicon.svg"));

for (const [name, size] of [
  ["favicon.png", 48],
  ["apple-touch-icon.png", 180],
  ["icon-192.png", 192],
  ["icon-512.png", 512],
]) {
  await sharp(svg, { density: 1200 })
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
