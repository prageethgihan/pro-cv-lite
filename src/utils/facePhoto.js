function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function loadImageFromFile(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(img.src);
      resolve(img);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function canvasToJpeg(canvas, quality = 0.9) {
  return canvas.toDataURL("image/jpeg", quality);
}

function createCanvas(size) {
  const canvas = document.createElement("canvas");
  canvas.width = size;
  canvas.height = size;
  return canvas;
}

function getShouldersUpCropRect(img, { padRatio = 1.5, yBias = 0.38 } = {}) {
  const imgW = img.width;
  const imgH = img.height;

  const normalizedPad = clamp(padRatio, 1.1, 2.4);
  const normalizedYBias = clamp(yBias, 0.18, 0.58);

  // slightly tighter crop
  const baseSideFromHeight = imgH * (0.30 + normalizedPad * 0.105);
  const baseSideFromWidth = imgW * 0.66;
  const cropSide = Math.min(baseSideFromHeight, baseSideFromWidth, imgW, imgH);

  const centerX = imgW / 2;

  // main fix: move crop center a bit lower for true visual centering
  const centerY = imgH * (0.29 + normalizedYBias * 0.20);

  let sx = centerX - cropSide / 2;
  let sy = centerY - cropSide / 2;

  sx = clamp(sx, 0, imgW - cropSide);
  sy = clamp(sy, 0, imgH - cropSide);

  return {
    sx,
    sy,
    sw: cropSide,
    sh: cropSide,
  };
}

function drawCropToCanvas(img, cropRect, outputSize, autoEnhance = true) {
  const canvas = createCanvas(outputSize);
  const ctx = canvas.getContext("2d");

  if (!ctx) {
    throw new Error("Canvas context not available.");
  }

  ctx.fillStyle = "#ffffff";
  ctx.fillRect(0, 0, outputSize, outputSize);

  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";

  if (autoEnhance) {
    ctx.filter = "contrast(1.03) saturate(1.02) brightness(1.01)";
  } else {
    ctx.filter = "none";
  }

  const { sx, sy, sw, sh } = cropRect;
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, outputSize, outputSize);
  ctx.filter = "none";

  return canvas;
}

export async function smartFaceCropToDataUrl(
  file,
  {
    outputSize = 650,
    jpegQuality = 0.9,
    padRatio = 1.5,
    yBias = 0.38,
    autoEnhance = true,
    fallbackCenterCrop = true,
    maxBytes = 650000,
  } = {}
) {
  const img = await loadImageFromFile(file);

  const cropRect = getShouldersUpCropRect(img, {
    padRatio,
    yBias,
  });

  const canvas = drawCropToCanvas(img, cropRect, outputSize, autoEnhance);

  let quality = clamp(jpegQuality, 0.72, 0.95);
  let dataUrl = canvasToJpeg(canvas, quality);

  while (dataUrl.length > maxBytes * 1.37 && quality > 0.74) {
    quality = Math.max(0.74, quality - 0.03);
    dataUrl = canvasToJpeg(canvas, quality);
  }

  return dataUrl;
}