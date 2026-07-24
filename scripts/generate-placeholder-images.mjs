/**
 * Generates abstract warm-toned placeholder JPEGs for the homepage.
 * Run: node scripts/generate-placeholder-images.mjs
 * Replace the generated files in public/images/ with real photography later.
 */
import sharp from "sharp";
import { mkdir } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), "..", "public", "images");

// [file, width, height, gradientFrom, gradientTo, highlight]
const images = [
  ["hero/hero.jpg", 1200, 1500, "#d8bfa4", "#8a6647", "#f2e8da"],

  ["categories/women.jpg", 900, 1200, "#d3b99e", "#a3784f", "#f0e6d8"],
  ["categories/men.jpg", 900, 1200, "#b6a18a", "#6f5137", "#e5d9c8"],
  ["categories/accessories.jpg", 900, 1200, "#cbb094", "#966b42", "#f4ead9"],
  ["categories/fragrance.jpg", 900, 1200, "#c2a284", "#7d5a38", "#ecdfcd"],

  ["products/p1.jpg", 800, 1000, "#d9c3a9", "#a97e54", "#f4ecdf"],
  ["products/p2.jpg", 800, 1000, "#c7ab8c", "#8a6240", "#efe3d1"],
  ["products/p3.jpg", 800, 1000, "#ceb193", "#9c7146", "#f2e7d6"],
  ["products/p4.jpg", 800, 1000, "#bfa385", "#77563a", "#e9dcc9"],
  ["products/p5.jpg", 800, 1000, "#d5bda1", "#a1774e", "#f3ead9"],
  ["products/p6.jpg", 800, 1000, "#c3a689", "#815e3d", "#ecdfcd"],
  ["products/p7.jpg", 800, 1000, "#d0b697", "#966c44", "#f1e6d4"],
  ["products/p8.jpg", 800, 1000, "#c9ad8e", "#8d6543", "#eee1cf"],

  // Still referenced by the "summer-capsule" and "atelier" collections.
  ["instagram/i4.jpg", 800, 800, "#c8ab8b", "#87603e", "#eee1cf"],
  ["instagram/i5.jpg", 800, 800, "#dbc4a9", "#ab8055", "#f5eddf"],
];

function svgFor(width, height, from, to, highlight) {
  const r = Math.min(width, height);
  return `<svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="${from}"/>
      <stop offset="1" stop-color="${to}"/>
    </linearGradient>
    <radialGradient id="glow" cx="0.3" cy="0.22" r="0.9">
      <stop offset="0" stop-color="${highlight}" stop-opacity="0.6"/>
      <stop offset="1" stop-color="${highlight}" stop-opacity="0"/>
    </radialGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#g)"/>
  <rect width="100%" height="100%" fill="url(#glow)"/>
  <circle cx="${width * 0.78}" cy="${height * 0.74}" r="${r * 0.42}" fill="${highlight}" opacity="0.14"/>
  <circle cx="${width * 0.16}" cy="${height * 0.88}" r="${r * 0.3}" fill="#000000" opacity="0.07"/>
  <circle cx="${width * 0.62}" cy="${height * 0.3}" r="${r * 0.16}" fill="${highlight}" opacity="0.18"/>
</svg>`;
}

for (const [file, width, height, from, to, highlight] of images) {
  const out = path.join(root, file);
  await mkdir(path.dirname(out), { recursive: true });
  await sharp(Buffer.from(svgFor(width, height, from, to, highlight)))
    .jpeg({ quality: 80, mozjpeg: true })
    .toFile(out);
  console.log("wrote", path.relative(process.cwd(), out));
}
