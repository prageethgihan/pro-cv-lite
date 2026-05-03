// src/utils/themeFromPhoto.js
import tinycolor from "tinycolor2";

/**
 * Pure browser canvas palette extractor (no external ColorThief)
 * - Does NOT append images to DOM
 * - Stable in Vite/React
 */

function clamp(n, min, max) {
  return Math.max(min, Math.min(max, n));
}

function rgbToHex(r, g, b) {
  return tinycolor({ r, g, b }).toHexString();
}

function pickReadableText(bgHex) {
  const t = tinycolor(bgHex);
  return t.isLight() ? "#111827" : "#F9FAFB";
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Failed to load image for palette"));
    img.src = src;
  });
}

/**
 * Extract palette using simple quantized histogram.
 * We quantize RGB to 4 bits per channel (0..15) -> 4096 bins.
 */
function extractPaletteFromCanvas(canvas, paletteSize = 6) {
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  const { width, height } = canvas;
  const imgData = ctx.getImageData(0, 0, width, height);
  const data = imgData.data;

  const counts = new Map(); // key -> count
  const sums = new Map(); // key -> {r,g,b,count}

  // Sample pixels (skip some for speed)
  const step = 8; // bigger = faster (8 is good)
  for (let i = 0; i < data.length; i += 4 * step) {
    const r = data[i];
    const g = data[i + 1];
    const b = data[i + 2];
    const a = data[i + 3];

    if (a < 200) continue; // ignore transparent-ish
    // ignore near-white and near-black pixels (usually background)
    if (r > 245 && g > 245 && b > 245) continue;
    if (r < 12 && g < 12 && b < 12) continue;

    // Quantize to 4 bits
    const rq = r >> 4;
    const gq = g >> 4;
    const bq = b >> 4;
    const key = (rq << 8) | (gq << 4) | bq;

    counts.set(key, (counts.get(key) || 0) + 1);

    const prev = sums.get(key) || { r: 0, g: 0, b: 0, c: 0 };
    prev.r += r;
    prev.g += g;
    prev.b += b;
    prev.c += 1;
    sums.set(key, prev);
  }

  const topKeys = [...counts.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, Math.max(paletteSize * 4, 24)) // take more then filter
    .map(([k]) => k);

  // Build distinct colors (avoid too-similar)
  const picked = [];
  const dist = (c1, c2) => {
    const dr = c1.r - c2.r;
    const dg = c1.g - c2.g;
    const db = c1.b - c2.b;
    return Math.sqrt(dr * dr + dg * dg + db * db);
  };

  for (const key of topKeys) {
    const s = sums.get(key);
    if (!s || !s.c) continue;

    const r = Math.round(s.r / s.c);
    const g = Math.round(s.g / s.c);
    const b = Math.round(s.b / s.c);

    // skip dull colors sometimes
    const t = tinycolor({ r, g, b });
    const { s: sat, l: lum } = t.toHsl();
    if (sat < 0.12 && lum > 0.85) continue;

    const candidate = { r, g, b, hex: rgbToHex(r, g, b), sat, lum };

    let tooClose = false;
    for (const p of picked) {
      if (dist(candidate, p) < 32) {
        tooClose = true;
        break;
      }
    }
    if (!tooClose) picked.push(candidate);

    if (picked.length >= paletteSize) break;
  }

  // Fallback if we couldn't pick enough
  while (picked.length < paletteSize) {
    picked.push({
      r: 37,
      g: 99,
      b: 235,
      hex: "#2563EB",
      sat: 0.7,
      lum: 0.5,
    });
  }

  return picked.map((p) => p.hex);
}

/**
 * Create a clean CV theme from a profile photo dataUrl.
 */
export async function createThemeFromPhoto(dataUrl, opts = {}) {
  const { paletteSize = 6 } = opts;

  if (!dataUrl) throw new Error("No photo dataUrl provided");

  const img = await loadImage(dataUrl);

  // draw to small canvas for speed
  const maxSide = 220;
  const scale = Math.min(maxSide / img.width, maxSide / img.height, 1);
  const w = Math.max(1, Math.round(img.width * scale));
  const h = Math.max(1, Math.round(img.height * scale));

  const canvas = document.createElement("canvas");
  canvas.width = w;
  canvas.height = h;

  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");

  ctx.drawImage(img, 0, 0, w, h);

  const hexes = extractPaletteFromCanvas(canvas, paletteSize);

  // pick primary as most saturated color
  const scored = hexes
    .map((h) => {
      const t = tinycolor(h).toHsl();
      return { h, sat: t.s, lum: t.l };
    })
    .sort((a, b) => b.sat - a.sat);

  const primary = scored[0]?.h || "#2563EB";
  const accent =
    scored[1]?.h || tinycolor(primary).darken(12).toHexString();

  const bg = tinycolor(primary).isLight()
    ? tinycolor(primary).desaturate(40).lighten(40).toHexString()
    : tinycolor(primary).desaturate(30).lighten(55).toHexString();

  const card = tinycolor(bg).lighten(4).toHexString();
  const secondary = tinycolor(primary).desaturate(15).toHexString();
  const text = pickReadableText(card);

  return {
    primary,
    secondary,
    accent,
    bg,
    card,
    text,
    palette: hexes,
  };
}