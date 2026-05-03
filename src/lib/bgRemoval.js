/**
 * bgRemoval.js
 *
 * High-quality, ML-based background removal & blur powered by
 * @imgly/background-removal (ONNX / WebAssembly, runs 100% in-browser).
 *
 * removeBackground(dataUrl)  → returns JPEG data-URL with white background
 * blurBackground(dataUrl)    → returns JPEG data-URL with blurred background
 *
 * Both functions return the processed image as a JPEG data-URL compatible
 * with the existing cv.photoDataUrl field.
 */

import { removeBackground as imglyRemoveBg } from "@imgly/background-removal";

/**
 * Convert a data-URL to a Blob.
 */
function dataUrlToBlob(dataUrl) {
  const [header, base64] = dataUrl.split(",");
  const mime = header.match(/:(.*?);/)[1];
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return new Blob([bytes], { type: mime });
}

/**
 * Load a Blob (or data-URL string) into an HTMLImageElement.
 * Resolves with the loaded image.
 */
function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      resolve(img);
      // Revoke object URL if we created one
      if (img.src.startsWith("blob:")) URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    if (typeof src === "string") {
      img.src = src;
    } else {
      img.src = URL.createObjectURL(src);
    }
  });
}

/**
 * Shared logic: run imgly background-removal and return a transparent PNG Blob.
 */
async function getTransparentBlob(dataUrl) {
  const inputBlob = dataUrlToBlob(dataUrl);

  const resultBlob = await imglyRemoveBg(inputBlob, {
    // "medium" gives significantly cleaner segmentation than "small" for portrait photos.
    model: "medium",
    output: {
      format: "image/png",
      quality: 1,
    },
    debug: false,
  });

  return resultBlob;
}

/**
 * removeBackground
 *
 * Removes the background and places a 100% pure white (#ffffff) backdrop.
 *
 * Uses pixel-level compositing instead of canvas drawImage so that every
 * background or semi-transparent edge pixel is blended against exact
 * white (255,255,255) — no off-white fringe or gray speckles.
 *
 * @param {string} dataUrl  - JPEG/PNG data-URL of the cropped CV photo
 * @returns {Promise<string>} - JPEG data-URL (pure white bg + sharp subject)
 */
export async function removeBackground(dataUrl) {
  // 1. Get transparent PNG from ML model
  const transparentBlob = await getTransparentBlob(dataUrl);
  const subjectObjUrl = URL.createObjectURL(transparentBlob);
  const img = await loadImage(subjectObjUrl);

  const w = img.naturalWidth;
  const h = img.naturalHeight;

  // 2. Extract subject pixel data (RGBA — alpha = subject mask)
  const srcCanvas = document.createElement("canvas");
  srcCanvas.width = w;
  srcCanvas.height = h;
  const srcCtx = srcCanvas.getContext("2d");
  srcCtx.drawImage(img, 0, 0, w, h);
  const srcData = srcCtx.getImageData(0, 0, w, h).data;

  // 3. Build output by compositing each pixel against pure white
  const outCanvas = document.createElement("canvas");
  outCanvas.width = w;
  outCanvas.height = h;
  const outCtx = outCanvas.getContext("2d");
  const outImageData = outCtx.createImageData(w, h);
  const od = outImageData.data;

  // Threshold: alpha < SPECKLE_THRESHOLD → treat as fully transparent background.
  // "medium" model still leaves some background pixels at partial alpha (20-80),
  // raising to 80 hard-removes these so the final background is 100% pure white.
  const SPECKLE_THRESHOLD = 80;

  for (let i = 0; i < od.length; i += 4) {
    const rawAlpha = srcData[i + 3];

    // Hard-remove near-transparent speckles left by ML model
    const alpha = rawAlpha < SPECKLE_THRESHOLD ? 0 : rawAlpha;
    const sa = alpha / 255; // 0.0 = background, 1.0 = subject

    // Composite: subject_color × sa  +  255 × (1 - sa)  =  pure white where sa=0
    od[i] = srcData[i] * sa + 255 * (1 - sa);
    od[i + 1] = srcData[i + 1] * sa + 255 * (1 - sa);
    od[i + 2] = srcData[i + 2] * sa + 255 * (1 - sa);
    od[i + 3] = 255; // always fully opaque
  }

  outCtx.putImageData(outImageData, 0, 0);
  return outCanvas.toDataURL("image/jpeg", 0.97);
}


/**
 * blurBackground
 *
 * Produces a realistic DSLR shallow depth-of-field (bokeh) effect:
 *  - Background is softly blurred (not extremely), matching real portrait lenses.
 *  - The subject→background transition is gradual (feathered mask), not a hard cut.
 *  - Pixel-level alpha blending ensures the person stays 100% sharp with natural edges.
 *
 * @param {string} dataUrl  - JPEG/PNG data-URL of the cropped CV photo
 * @returns {Promise<string>} - JPEG data-URL (natural bokeh bg + sharp subject)
 */
export async function blurBackground(dataUrl) {
  // 1. Get subject-only transparent PNG from ML model
  const transparentBlob = await getTransparentBlob(dataUrl);
  const subjectObjUrl = URL.createObjectURL(transparentBlob);

  // 2. Load original + subject images in parallel
  const [originalImg, subjectImg] = await Promise.all([
    loadImage(dataUrl),
    loadImage(subjectObjUrl),
  ]);

  const w = originalImg.naturalWidth;
  const h = originalImg.naturalHeight;

  // --- Extract original sharp pixel data ---
  const origCanvas = document.createElement("canvas");
  origCanvas.width = w;
  origCanvas.height = h;
  const origCtx = origCanvas.getContext("2d");
  origCtx.drawImage(originalImg, 0, 0, w, h);
  const origData = origCtx.getImageData(0, 0, w, h).data;

  // --- Build blurred pixel data (padded to prevent dark bleeding at edges) ---
  // DSLR bokeh uses strong blur — real portrait lenses create very soft backgrounds.
  const BLUR_RADIUS = 22; // px — strong bokeh (safe: pixel blending keeps subject sharp)
  const PAD = Math.ceil(BLUR_RADIUS * 3);

  const blurPadCanvas = document.createElement("canvas");
  blurPadCanvas.width = w + PAD * 2;
  blurPadCanvas.height = h + PAD * 2;
  const blurPadCtx = blurPadCanvas.getContext("2d");

  // Fill padding with stretched image so blur at edges samples real pixels, not black.
  blurPadCtx.drawImage(originalImg, 0, 0, w + PAD * 2, h + PAD * 2);
  blurPadCtx.drawImage(originalImg, PAD, PAD, w, h);
  blurPadCtx.filter = `blur(${BLUR_RADIUS}px)`;
  blurPadCtx.drawImage(blurPadCanvas, 0, 0);
  blurPadCtx.filter = "none";
  const blurData = blurPadCtx.getImageData(PAD, PAD, w, h).data;

  // --- Build FEATHERED mask (key to DSLR-like gradual transition) ---
  // In a real camera, the plane of focus fades gradually — there's no hard edge
  // between "sharp" and "blurred". Blurring the mask itself replicates this.
  const FEATHER_RADIUS = 6; // px — wider feather = more cinematic, gradual edge

  const featherCanvas = document.createElement("canvas");
  featherCanvas.width = w;
  featherCanvas.height = h;
  const featherCtx = featherCanvas.getContext("2d");
  featherCtx.filter = `blur(${FEATHER_RADIUS}px)`;
  featherCtx.drawImage(subjectImg, 0, 0, w, h);
  featherCtx.filter = "none";
  const maskData = featherCtx.getImageData(0, 0, w, h).data;

  // --- Per-pixel alpha blend using feathered mask ---
  const outCanvas = document.createElement("canvas");
  outCanvas.width = w;
  outCanvas.height = h;
  const outCtx = outCanvas.getContext("2d");
  const outImageData = outCtx.createImageData(w, h);
  const od = outImageData.data;

  for (let i = 0; i < od.length; i += 4) {
    // sa: 1.0 = fully sharp (subject center), 0.0 = fully blurred (background)
    // Feathered mask means edge pixels have sa values between 0 and 1 → gradual fade
    const sa = maskData[i + 3] / 255;

    od[i] = origData[i] * sa + blurData[i] * (1 - sa);
    od[i + 1] = origData[i + 1] * sa + blurData[i + 1] * (1 - sa);
    od[i + 2] = origData[i + 2] * sa + blurData[i + 2] * (1 - sa);
    od[i + 3] = 255;
  }

  outCtx.putImageData(outImageData, 0, 0);
  return outCanvas.toDataURL("image/jpeg", 0.95);
}
