import { safeAiCall, getFriendlyAiError } from "./ai";

// Cache for ATS Analysis results
const analysisCache = new Map();

/**
 * Generates a simple hash for cache keys
 */
function getCacheKey(text, jobDesc) {
  const combined = `${text.substring(0, 1000)}_${jobDesc.substring(0, 500)}`;
  // Simple hash function
  let hash = 0;
  for (let i = 0; i < combined.length; i++) {
    const char = combined.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32bit integer
  }
  return hash.toString();
}

// ── PDF text & metadata extraction ──────────────────────────────────────────
export async function extractPdfData(file) {
  const pdfjsLib = await import("pdfjs-dist");
  pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.mjs",
    import.meta.url
  ).toString();

  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  
  let text = "";
  let imageCount = 0;
  let largeImages = 0;
  let hasProfilePhoto = false;

  for (let i = 1; i <= pdf.numPages; i++) {
    const page = await pdf.getPage(i);
    
    // Extract text
    const content = await page.getTextContent();
    text += content.items.map((item) => item.str).join(" ") + "\n";
    
    // Extract operators to find images
    const ops = await page.getOperatorList();
    const { fnArray, argsArray } = ops;
    
    // OPS codes for images
    const PAINT_IMAGE_XOBJECT = 85; // OPS.paintImageXObject
    const PAINT_INLINE_IMAGE_XOBJECT = 82; // OPS.paintInlineImageXObject
    
    for (let j = 0; j < fnArray.length; j++) {
      if (fnArray[j] === PAINT_IMAGE_XOBJECT || fnArray[j] === PAINT_INLINE_IMAGE_XOBJECT) {
        imageCount++;
        
        // Try to estimate size if possible
        // Note: argsArray for paintImageXObject usually contains the name of the XObject
        // Getting actual dimensions requires looking up the resource which is complex here.
        // As a heuristic, we can treat the first few images in a resume as potential profile photos
        // if they appear on the first page and are not tiny.
        // For simplicity, we'll count total images and use a heuristic in the UI or here.
        
        // If it's a large image covering significant area, we count it as a large image.
        // Since we don't have the resource dictionary easily accessible here without more code,
        // we'll rely on a combination of image count and text density for "image-heavy" detection.
        // But for "profile photo", usually it's one of the first few images.
      }
    }
  }

  const resultText = text.trim();
  
  // Heuristic: If there are multiple images on the first page, it might have icons.
  // If there's a large image-to-text ratio, it's suspicious.
  
  return {
    text: resultText,
    imageCount,
    isScanned: resultText.length < 100 && imageCount > 0,
    hasPotentialPhoto: imageCount > 5, // Simple heuristic for "image-heavy"
    // We will refine this in the UI based on text length vs image count
  };
}

// ── DOCX text extraction ─────────────────────────────────────────────────────
export async function extractDocxText(file) {
  const mammoth = await import("mammoth");
  const arrayBuffer = await file.arrayBuffer();
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value.trim();
}

// ── Main extract dispatcher ──────────────────────────────────────────────────
export async function extractCvText(file) {
  const name = file.name.toLowerCase();
  if (name.endsWith(".pdf")) {
    const data = await extractPdfData(file);
    return data.text;
  }
  if (name.endsWith(".docx")) return extractDocxText(file);
  throw new Error("Unsupported file type. Please upload a PDF or DOCX file.");
}

/**
 * Validates a CV for ATS friendliness.
 * Detects profile photos, heavy graphics, and scanned PDFs.
 */
export async function validateCvForAts(file) {
  const name = file.name.toLowerCase();
  
  if (name.endsWith(".docx")) {
    const text = await extractDocxText(file);
    return {
      isValid: text.length > 100,
      text,
      error: text.length <= 100 ? "DOCX file seems empty or contains only images." : null,
      warning: null
    };
  }

  if (name.endsWith(".pdf")) {
    const data = await extractPdfData(file);
    const textLength = data.text.length;
    const fileSizeKb = file.size / 1024;
    
    // Scanned PDF detection: large file, almost no text
    if (textLength < 100 && fileSizeKb > 50) {
      return {
        isValid: false,
        text: data.text,
        error: "Scanned or photo-based resume detected. Please upload a text-based CV.",
        warning: null
      };
    }

    // Profile photo detection:
    // ATS-friendly resumes rarely have images. 
    // Icons (phone, email) are usually 1-3 images.
    // A profile photo is often a single larger image.
    // If image count is low (1-3) but text density is high, it's likely icons.
    // If image count is 1-3 and density is low, it's likely a photo or heavy graphics.
    const density = textLength / fileSizeKb;
    
    // Requirement 22: If REAL profile image/photo detected -> disable Analyze button
    // Heuristic: One or two images in a small-ish text file is often a photo.
    if (data.imageCount > 0 && data.imageCount <= 2 && density < 1.5) {
      return {
        isValid: false,
        text: data.text,
        error: "Profile photo detected. Please remove profile images and upload a text-based CV for accurate ATS analysis.",
        warning: null
      };
    }

    if (data.imageCount > 10 && density < 2.5) {
      return {
        isValid: false,
        text: data.text,
        error: "Heavy graphics detected. Please use a simple text-based CV for accurate ATS analysis.",
        warning: null
      };
    }

    // Small icons warning (Requirement 21 & 24)
    let warning = null;
    if (data.imageCount > 3 && data.imageCount <= 10) {
      warning = "For best ATS analysis results, use a simple text-based CV without heavy graphics.";
    }

    return {
      isValid: true,
      text: data.text,
      error: null,
      warning
    };
  }

  return {
    isValid: false,
    text: "",
    error: "Unsupported file type.",
    warning: null
  };
}

/**
 * Safely cleans and extracts JSON from a string that might contain markdown or extra text.
 */
function cleanAtsJson(raw) {
  if (!raw) return "";
  
  let cleaned = raw.trim();
  
  // Remove markdown code block wrappers
  cleaned = cleaned.replace(/```json/gi, "");
  cleaned = cleaned.replace(/```/g, "");
  
  // Find the first '{' and last '}' to extract only the JSON object
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  
  if (start !== -1 && end !== -1) {
    cleaned = cleaned.substring(start, end + 1);
  }
  
  return cleaned.trim();
}

/**
 * Validates and parses the Gemini response.
 * Includes local cleanup and validation of essential fields.
 */
function safeParseATSResponse(aiResponse) {
  if (!aiResponse) throw new Error("EMPTY_RESPONSE");

  let parsedData = null;
  const cleaned = cleanAtsJson(aiResponse);

  try {
    parsedData = JSON.parse(cleaned);
  } catch (err) {
    console.warn("Initial JSON parse failed, attempting secondary cleanup...");
    // Fallback recovery: attempt a more aggressive cleanup (removing trailing commas, etc.)
    try {
      // Remove common JSON errors like trailing commas before closing braces/brackets
      const aggressiveClean = cleaned
        .replace(/,\s*([\]}])/g, '$1') 
        .replace(/[\n\r\t]/g, " ");   // Strip control characters
      parsedData = JSON.parse(aggressiveClean);
    } catch (innerErr) {
      throw new Error("AI_FORMAT_ERROR");
    }
  }

  // Strict Validation (Requirement 9-10)
  const requiredFields = ["atsScore", "suggestions", "matchedKeywords", "missingKeywords"];
  const missing = requiredFields.filter(f => parsedData[f] === undefined || parsedData[f] === null);
  
  if (missing.length > 0) {
    throw new Error("INCOMPLETE_RESPONSE");
  }

  return parsedData;
}

// ── Gemini ATS Analysis & CV Parsing ──────────────────────────────────────────
export async function analyzeWithGemini(cvText, jobDescription = "") {
  // Check cache first
  const cacheKey = getCacheKey(cvText, jobDescription);
  if (analysisCache.has(cacheKey)) {
    return analysisCache.get(cacheKey);
  }

  const jobPart = jobDescription.trim()
    ? `\nJob Description to match against:\n${jobDescription.trim()}\n`
    : "\nAnalyze as a general software/professional CV.\n";

  // Truncate excessively long text to optimize prompt size (paid API stability)
  const optimizedCvText = cvText.length > 6000 ? cvText.substring(0, 6000) + "..." : cvText;

  const prompt = `
You are an expert ATS (Applicant Tracking System) analyzer and CV parser.
Task:
1. Analyze the CV for ATS compatibility.
2. Parse the CV into a structured JSON format.

${jobPart}
CV Content:
${optimizedCvText}

Respond ONLY with a valid JSON object (no markdown, no code fences) in this exact structure:
{
  "atsScore": <number 0-100>,
  "resumeMatch": <number 0-100>,
  "keywordMatch": <number 0-100>,
  "formattingScore": <number 0-100>,
  "readabilityScore": <number 0-100>,
  "overallVerdict": "<short label>",
  "summaryMessage": "<2-3 sentence summary>",
  "totalIssues": <number>,
  "strengthsFound": <number>,
  "optimizedSections": <number>,
  "totalSections": <number>,
  "matchedKeywords": ["kw1", "kw2"],
  "missingKeywords": ["kw1", "kw2"],
  "partialKeywords": ["kw1", "kw2"],
  "suggestions": [
    { "text": "...", "impact": "+X%" }
  ],
  "strengths": ["..."],
  "weaknesses": ["..."],
  "sections": {
    "summary": <number>,
    "experience": <number>,
    "skills": <number>,
    "education": <number>,
    "projects": <number>
  },
  "parsedCv": {
    "fullName": "...",
    "jobTitle": "...",
    "summary": "...",
    "contact": { "phone": "...", "email": "...", "address": "...", "website": "..." },
    "education": [{ "years": "...", "university": "...", "degree": "...", "details": "..." }],
    "skills": ["...", "..."],
    "experience": [{ "role": "...", "company": "...", "start": "...", "end": "...", "description": "..." }],
    "projects": [{ "title": "...", "description": "..." }],
    "certifications": [{ "name": "...", "issuer": "...", "year": "..." }],
    "achievements": ["...", "..."]
  }
}
`;

  try {
    const aiResponse = await safeAiCall(prompt);
    const data = safeParseATSResponse(aiResponse);

    // Ensure essential fields exist to prevent UI crashes
    const defaultData = {
      atsScore: 0, resumeMatch: 0, keywordMatch: 0, formattingScore: 0, readabilityScore: 0,
      overallVerdict: "Unknown", summaryMessage: "Analysis complete.",
      totalIssues: 0, strengthsFound: 0, optimizedSections: 0, totalSections: 5,
      matchedKeywords: [], missingKeywords: [], partialKeywords: [],
      suggestions: [], strengths: [], weaknesses: [],
      sections: { summary: 0, experience: 0, skills: 0, education: 0, projects: 0 },
      parsedCv: null
    };

    const finalData = { ...defaultData, ...data };
    
    // Save to cache
    analysisCache.set(cacheKey, finalData);
    
    return finalData;
  } catch (err) {
    // Console cleanup: only log necessary errors
    if (err.message === "AI_FORMAT_ERROR") {
      throw new Error("AI response formatting issue. Please try again.");
    }
    if (err.message === "INCOMPLETE_RESPONSE") {
      throw new Error("Incomplete AI response received. Please try again.");
    }

    console.error("ATS Analysis Process Error:", err.message);
    throw new Error(getFriendlyAiError(err));
  }
}

/**
 * Performs a focused AI improvement on a specific section of the CV.
 */
export async function improveSection(fullText, missingKeywords, sectionName) {
  const keywordsStr = missingKeywords.length > 0 
    ? `Naturally incorporate these keywords if relevant: ${missingKeywords.join(", ")}.`
    : "";

  const prompt = `
You are an expert CV writer. I will provide the full text of a CV.
Your task is to rewrite ONLY the "${sectionName}" section to be more professional, achievement-oriented, and ATS-friendly.

${keywordsStr}

Full CV Content:
${fullText.substring(0, 4000)} // Limit to 4k chars to stay safe

Requirements:
1. Return ONLY the improved content for the "${sectionName}" section.
2. Use strong action verbs and measurable results.
3. Keep the tone professional.
4. Do NOT include any preamble or notes.
`;

  try {
    const response = await safeAiCall(prompt);
    return response.trim();
  } catch (err) {
    console.error("Improvement Error:", err);
    throw new Error(getFriendlyAiError(err));
  }
}
