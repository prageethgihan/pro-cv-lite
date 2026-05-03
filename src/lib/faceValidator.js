import { FilesetResolver, FaceDetector } from "@mediapipe/tasks-vision";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";
import "@tensorflow/tfjs-backend-cpu";
import * as cocoSsd from "@tensorflow-models/coco-ssd";

let faceDetector = null;
let objectDetector = null;
let tfInitPromise = null;

const ANIMAL_CLASSES = [
  "dog",
  "cat",
  "bird",
  "horse",
  "sheep",
  "cow",
  "elephant",
  "bear",
  "zebra",
  "giraffe",
];

function isMobileDevice() {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod|Mobile|Opera Mini|IEMobile/i.test(
    navigator.userAgent || ""
  );
}

async function ensureTfReady() {
  if (!tfInitPromise) {
    tfInitPromise = (async () => {
      await tf.ready();

      const preferredBackend = isMobileDevice() ? "cpu" : "webgl";

      try {
        await tf.setBackend(preferredBackend);
      } catch {
        try {
          await tf.setBackend("webgl");
        } catch {
          await tf.setBackend("cpu");
        }
      }

      await tf.ready();
    })();
  }

  await tfInitPromise;
}

async function getFaceDetector() {
  if (faceDetector) return faceDetector;

  const vision = await FilesetResolver.forVisionTasks(
    "https://cdn.jsdelivr.net/npm/@mediapipe/tasks-vision@latest/wasm"
  );

  faceDetector = await FaceDetector.createFromOptions(vision, {
    baseOptions: {
      modelAssetPath:
        "https://storage.googleapis.com/mediapipe-models/face_detector/blaze_face_short_range/float16/1/blaze_face_short_range.tflite",
    },
    runningMode: "IMAGE",
    minDetectionConfidence: 0.3,
  });

  return faceDetector;
}

async function getObjectDetector() {
  if (objectDetector) return objectDetector;

  await ensureTfReady();
  objectDetector = await cocoSsd.load({ base: "mobilenet_v2" });
  return objectDetector;
}

function fail(reason, code, extra = {}) {
  return { ok: false, reason, code, ...extra };
}

function pass(extra = {}) {
  return {
    ok: true,
    reason: "Valid human face photo detected.",
    code: "OK",
    ...extra,
  };
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

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function createCanvas(width, height) {
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(width));
  canvas.height = Math.max(1, Math.round(height));
  return canvas;
}

function normalizeImageToCanvas(img, maxSide = 1280) {
  const scale = Math.min(1, maxSide / Math.max(img.width, img.height));
  const width = Math.max(1, Math.round(img.width * scale));
  const height = Math.max(1, Math.round(img.height * scale));

  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(img, 0, 0, width, height);
  return canvas;
}

function cropImageToCanvas(img, box, paddingRatio = 0.22) {
  const x = Number(box?.originX ?? 0);
  const y = Number(box?.originY ?? 0);
  const w = Number(box?.width ?? img.width);
  const h = Number(box?.height ?? img.height);

  const padX = w * paddingRatio;
  const padY = h * paddingRatio;

  const sx = clamp(x - padX, 0, img.width - 1);
  const sy = clamp(y - padY, 0, img.height - 1);
  const sw = clamp(w + padX * 2, 1, img.width - sx);
  const sh = clamp(h + padY * 2, 1, img.height - sy);

  const canvas = createCanvas(sw, sh);
  const ctx = canvas.getContext("2d");
  ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  return canvas;
}

function resizeCanvas(sourceCanvas, width = 160, height = 160) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(sourceCanvas, 0, 0, width, height);
  return canvas;
}

function variance(values) {
  if (!values.length) return 0;
  const mean = values.reduce((a, b) => a + b, 0) / values.length;
  return values.reduce((sum, v) => sum + (v - mean) ** 2, 0) / values.length;
}

function getBlurScoreFromCanvas(canvas) {
  const ctx = canvas.getContext("2d", { willReadFrequently: true });
  const { width, height } = canvas;
  const imgData = ctx.getImageData(0, 0, width, height).data;

  const gray = new Float32Array(width * height);

  for (let i = 0; i < width * height; i++) {
    const r = imgData[i * 4];
    const g = imgData[i * 4 + 1];
    const b = imgData[i * 4 + 2];
    gray[i] = 0.299 * r + 0.587 * g + 0.114 * b;
  }

  const laplacianValues = [];

  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      const idx = y * width + x;

      const center = gray[idx];
      const top = gray[idx - width];
      const bottom = gray[idx + width];
      const left = gray[idx - 1];
      const right = gray[idx + 1];

      const laplacian = 4 * center - top - bottom - left - right;
      laplacianValues.push(laplacian);
    }
  }

  return variance(laplacianValues);
}

function getFaceAreaRatio(box, imgWidth, imgHeight) {
  if (!box || !imgWidth || !imgHeight) return 0;
  const faceArea = Math.max(0, box.width) * Math.max(0, box.height);
  const imageArea = imgWidth * imgHeight;
  return imageArea > 0 ? faceArea / imageArea : 0;
}

function getTopPredictionScore(predictions, className) {
  return predictions
    .filter((p) => p.class === className)
    .reduce((max, p) => Math.max(max, Number(p.score || 0)), 0);
}

function getTopAnimalPrediction(predictions) {
  let best = null;

  for (const p of predictions) {
    if (!ANIMAL_CLASSES.includes(p.class)) continue;
    if (!best || Number(p.score || 0) > Number(best.score || 0)) {
      best = p;
    }
  }

  return best;
}

function buildDecisionSignals(predictions) {
  const personScore = getTopPredictionScore(predictions, "person");
  const topAnimal = getTopAnimalPrediction(predictions);
  const animalScore = Number(topAnimal?.score || 0);

  const veryStrongAnimal = animalScore >= 0.6;
  const strongAnimal = animalScore >= 0.45;
  const strongPerson = personScore >= 0.3;

  return {
    personScore,
    animalScore,
    topAnimal,
    veryStrongAnimal,
    strongAnimal,
    strongPerson,
  };
}

function shouldRejectAsAnimal(signals) {
  if (signals.veryStrongAnimal && !signals.strongPerson) return true;
  if (signals.strongAnimal && signals.personScore < 0.2) return true;
  return false;
}

export async function validateHumanPhoto(file) {
  try {
    if (!file) {
      return fail("No image selected.", "NO_FILE");
    }

    if (!file.type?.startsWith("image/")) {
      return fail("Please upload an image file only.", "INVALID_FILE_TYPE");
    }

    const maxSizeMb = 8;
    if (file.size > maxSizeMb * 1024 * 1024) {
      return fail(
        `Image is too large. Please upload an image smaller than ${maxSizeMb}MB.`,
        "FILE_TOO_LARGE"
      );
    }

    const img = await loadImageFromFile(file);

    if (img.width < 160 || img.height < 160) {
      return fail(
        "Image is too small. Please upload a clearer human face photo.",
        "IMAGE_TOO_SMALL"
      );
    }

    // Normalize image first for more stable results across mobile / desktop
    const normalizedCanvas = normalizeImageToCanvas(img, 1280);

    const od = await getObjectDetector();
    const predictions = await od.detect(normalizedCanvas);
    const signals = buildDecisionSignals(predictions);

    // Animal decision gets priority before face-count-based messages
    // to avoid dog/cat images randomly showing "multiple faces" etc.
    if (shouldRejectAsAnimal(signals)) {
      return fail(
        "Animal photo detected. Please upload a real single-person human face photo only.",
        "ANIMAL_DETECTED",
        {
          predictions,
          animalScore: signals.animalScore,
          personScore: signals.personScore,
          topAnimal: signals.topAnimal,
        }
      );
    }

    const fd = await getFaceDetector();
    const faceResult = fd.detect(normalizedCanvas);
    const detections = faceResult?.detections || [];

    // Fallback: Check if object detector (coco-ssd) found multiple people
    // Use a lower threshold (0.3) to catch couples where one person scores lower
    const personPredictions = predictions.filter(
      (p) => p.class === "person" && Number(p.score || 0) > 0.3
    );

    if (detections.length > 1 || personPredictions.length > 1) {
      return fail(
        "Multiple faces/people detected. Please upload a clear single-person photo.",
        "MULTIPLE_FACES",
        {
          predictions,
          animalScore: signals.animalScore,
          personScore: signals.personScore,
        }
      );
    }

    if (detections.length === 0) {
      return fail(
        "No clear human face detected. Please upload a clear front-facing single-person photo.",
        "NO_FACE",
        {
          predictions,
          animalScore: signals.animalScore,
          personScore: signals.personScore,
        }
      );
    }

    const detection = detections[0];
    const box = detection?.boundingBox || null;

    if (!box) {
      return fail(
        "Could not validate the face area. Please try another photo.",
        "NO_BOUNDING_BOX",
        {
          predictions,
        }
      );
    }

    const faceAreaRatio = getFaceAreaRatio(
      box,
      normalizedCanvas.width,
      normalizedCanvas.height
    );

    if (box.width < 60 || box.height < 60 || faceAreaRatio < 0.012) {
      return fail(
        "Your face appears too small in the image. Please use a closer single-person portrait.",
        "FACE_TOO_SMALL",
        {
          predictions,
          faceAreaRatio,
        }
      );
    }

    const faceCanvas = cropImageToCanvas(normalizedCanvas, box, 0.22);
    const faceCanvasSmall = resizeCanvas(faceCanvas, 160, 160);
    const blurScore = getBlurScoreFromCanvas(faceCanvasSmall);

    if (blurScore < 32) {
      return fail(
        "Blur photo detected. Please upload a clearer single-person human photo.",
        "BLUR_DETECTED",
        {
          blurScore,
          predictions,
        }
      );
    }

    // Final guard: if animal is still clearly stronger than person, reject.
    if (signals.animalScore >= 0.5 && signals.personScore < 0.2) {
      return fail(
        "Animal photo detected. Please upload a real single-person human face photo only.",
        "ANIMAL_DETECTED",
        {
          predictions,
          animalScore: signals.animalScore,
          personScore: signals.personScore,
          topAnimal: signals.topAnimal,
        }
      );
    }

    return pass({
      detection,
      boundingBox: box,
      imageWidth: normalizedCanvas.width,
      imageHeight: normalizedCanvas.height,
      blurScore,
      predictions,
      animalScore: signals.animalScore,
      personScore: signals.personScore,
      personDetected: signals.strongPerson,
      topAnimal: signals.topAnimal || null,
      backend: tf.getBackend(),
      deviceType: isMobileDevice() ? "mobile" : "desktop",
    });
  } catch (error) {
    console.error("validateHumanPhoto error:", error);
    return fail(
      error?.message ||
        "Photo validation failed. Please try another clear human face photo.",
      "VALIDATION_ERROR"
    );
  }
}