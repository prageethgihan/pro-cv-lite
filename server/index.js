import express from "express";
import multer from "multer";
import admin from "firebase-admin";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const upload = multer({ storage: multer.memoryStorage() });

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ✅ Load service account JSON safely
const serviceAccountPath = path.join(__dirname, "serviceAccountKey.json");
const serviceAccount = JSON.parse(fs.readFileSync(serviceAccountPath, "utf-8"));

// ✅ Build default bucket name from project_id
const PROJECT_ID = serviceAccount.project_id; // e.g. "procv-lite"
const DEFAULT_BUCKET = `${PROJECT_ID}.appspot.com`; // ✅ standard default bucket

// ✅ Firebase Admin init (explicit bucket)
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: DEFAULT_BUCKET,
});

const bucket = admin.storage().bucket();

// ✅ Verify bucket exists on startup (gives clear errors)
async function verifyBucket() {
  try {
    const [exists] = await bucket.exists();
    if (!exists) {
      console.error(
        `❌ Storage bucket not found: ${DEFAULT_BUCKET}\n` +
          `➡️ Fix: Firebase Console → Storage → Get started (create default bucket)\n`
      );
    } else {
      console.log(`✅ Storage bucket OK: ${DEFAULT_BUCKET}`);
    }
  } catch (err) {
    console.error(
      "❌ Bucket check failed. Possible permission/IAM issue.\n",
      err?.message || err
    );
  }
}
verifyBucket();

app.get("/api/health", async (req, res) => {
  try {
    const [exists] = await bucket.exists();
    res.json({ ok: true, bucket: DEFAULT_BUCKET, bucketExists: exists });
  } catch (e) {
    res.status(500).json({
      ok: false,
      bucket: DEFAULT_BUCKET,
      error: e?.message || String(e),
    });
  }
});

app.post("/api/upload", upload.single("file"), async (req, res) => {
  try {
    const { uid, cvId } = req.body;

    if (!uid || !cvId) {
      return res.status(400).json({ error: "Missing uid/cvId" });
    }
    if (!req.file) {
      return res.status(400).json({ error: "No file" });
    }

    const allowed = ["image/png", "image/jpeg", "image/webp"];
    if (!allowed.includes(req.file.mimetype)) {
      return res.status(400).json({ error: "Only PNG/JPG/WEBP allowed" });
    }

    if (req.file.size > 3 * 1024 * 1024) {
      return res.status(400).json({ error: "Max file size is 3MB" });
    }

    // ✅ Ensure bucket exists before upload
    const [exists] = await bucket.exists();
    if (!exists) {
      return res.status(500).json({
        error:
          `Storage bucket "${DEFAULT_BUCKET}" does not exist.\n` +
          `Fix: Firebase Console → Storage → Get started (create bucket).`,
      });
    }

    const ext =
      req.file.mimetype === "image/png"
        ? "png"
        : req.file.mimetype === "image/webp"
        ? "webp"
        : "jpg";

    const storagePath = `users/${uid}/cvs/${cvId}/profile.${ext}`;
    const file = bucket.file(storagePath);

    await file.save(req.file.buffer, {
      contentType: req.file.mimetype,
      resumable: false,
      metadata: { cacheControl: "public, max-age=3600" },
    });

    // ✅ Signed URL (7 days)
    const [signedUrl] = await file.getSignedUrl({
      action: "read",
      expires: Date.now() + 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ photoURL: signedUrl, path: storagePath, bucket: DEFAULT_BUCKET });
  } catch (err) {
    console.error("UPLOAD ERROR:", err);

    // Friendly error message
    const msg = err?.message || String(err);

    // Common hints
    let hint = "";
    if (msg.toLowerCase().includes("permission")) {
      hint =
        "\nFix: Google Cloud Console → IAM → service account (firebase-adminsdk-...) " +
        "add role: Storage Admin (or Storage Object Admin).";
    }
    if (msg.toLowerCase().includes("bucket") && msg.toLowerCase().includes("exist")) {
      hint =
        "\nFix: Firebase Console → Storage → Get started (create default bucket).";
    }

    res.status(500).json({ error: msg + hint });
  }
});

const PORT = 5174;
app.listen(PORT, () => {
  console.log(`✅ Upload server running: http://localhost:${PORT}`);
  console.log(`✅ Using bucket: ${DEFAULT_BUCKET}`);
});