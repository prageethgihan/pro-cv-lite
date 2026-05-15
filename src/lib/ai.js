import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Gemini API key is missing. Check your .env file.");
}

const genAI = new GoogleGenerativeAI(apiKey);

// Global cooldown tracker
let lastRequestTime = 0;
const MIN_COOLDOWN = 1500; // 1.5s between any AI calls

/**
 * Centralized stable AI request handler.
 * Optimized for gemini-2.5-flash with NO fallbacks and NO recursive retries.
 */
export async function safeAiCall(prompt, config = { model: "gemini-2.5-flash" }, signal = null) {
  const timeout = 60000;
  const modelName = "gemini-2.5-flash";
  const MAX_RETRIES = 3;
  
  const executeRequest = async (retryCount = 0) => {
    // 1. Cooldown protection
    const now = Date.now();
    const timeSinceLast = now - lastRequestTime;
    if (timeSinceLast < MIN_COOLDOWN) {
      await new Promise(res => setTimeout(res, MIN_COOLDOWN - timeSinceLast));
    }
    lastRequestTime = Date.now();

    const model = genAI.getGenerativeModel({ 
      model: modelName,
      generationConfig: {
        temperature: 0.1,
        topP: 0.8,
        topK: 40,
      }
    });

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);
    const startTime = Date.now();

    try {
      const result = await Promise.race([
        model.generateContent(prompt),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error("AI_TIMEOUT")), timeout)
        ),
        ...(signal ? [new Promise((_, reject) => {
          if (signal.aborted) reject(new Error("AI_CANCELLED"));
          signal.addEventListener('abort', () => reject(new Error("AI_CANCELLED")));
        })] : [])
      ]);
      
      clearTimeout(timeoutId);

      if (!result || !result.response) {
        throw new Error("EMPTY_RESPONSE");
      }

      return result.response.text();
    } catch (err) {
      clearTimeout(timeoutId);
      const msg = err?.message?.toLowerCase() || "";
      
      // Handle 503 Service Unavailable (Overload)
      if ((msg.includes("503") || msg.includes("service_unavailable") || msg.includes("overloaded")) && retryCount < MAX_RETRIES) {
        const waitTime = Math.pow(2, retryCount + 1) * 1000; // 2s, 4s, 8s
        console.warn(`[AI] Server overloaded (503). Retrying in ${waitTime}ms... (Attempt ${retryCount + 1}/${MAX_RETRIES})`);
        
        // Notify via a custom error that can be caught for UI updates if needed, 
        // but here we just wait and retry internally.
        await new Promise(res => setTimeout(res, waitTime));
        return executeRequest(retryCount + 1);
      }
      
      throw err;
    }
  };

  return executeRequest();
}

/**
 * Maps raw API errors to clean user-friendly messages.
 */
export function getFriendlyAiError(error) {
  const msg = error?.message?.toLowerCase() || "";
  
  if (msg.includes("503") || msg.includes("overloaded") || msg.includes("service_unavailable")) {
    return "AI servers are currently experiencing high demand. Please wait a moment and try again.";
  }
  if (msg.includes("429") || msg.includes("quota") || msg.includes("limit")) {
    return "Daily AI limit reached. Please try again later.";
  }
  if (msg.includes("timeout") || msg.includes("ai_timeout")) {
    return "AI analysis is taking longer than expected. Please wait a moment and try again.";
  }
  if (msg.includes("fetch") || msg.includes("network")) {
    return "Network error. Please check your connection and try again.";
  }
  
  return "Analysis failed temporarily. Please try again.";
}

function cleanAiText(text) {
  if (!text) return "";
  return text.trim().replace(/^["'`]+|["'`]+$/g, "");
}

/* ── AI Features ── */

export async function fixGrammar(text) {
  if (!text || !text.trim()) return "";
  try {
    const prompt = `Fix grammar and spelling, return ONLY the corrected text: ${text}`;
    const response = await safeAiCall(prompt);
    return cleanAiText(response);
  } catch (err) {
    throw new Error(getFriendlyAiError(err));
  }
}

export async function improveCvText(text) {
  if (!text || !text.trim()) return "";
  try {
    const prompt = `Improve this text for a professional CV, return ONLY the improved text: ${text}`;
    const response = await safeAiCall(prompt);
    return cleanAiText(response);
  } catch (err) {
    throw new Error(getFriendlyAiError(err));
  }
}

export async function generateAiSummary(cv, templateId) {
  try {
    const prompt = `Generate a 2-3 sentence professional CV summary based on this data: ${JSON.stringify(cv)}`;
    const response = await safeAiCall(prompt);
    return cleanAiText(response);
  } catch (err) {
    throw new Error(getFriendlyAiError(err));
  }
}

export async function generateAiWriterContent(type, data) {
  try {
    const prompt = `Generate ${type} for a CV using these details: ${JSON.stringify(data)}. Return ONLY the result.`;
    const response = await safeAiCall(prompt);
    return cleanAiText(response);
  } catch (err) {
    throw new Error(getFriendlyAiError(err));
  }
}

export async function generateCoverLetter(data) {
  try {
    const prompt = `Generate a professional cover letter based on the following details:
    Name: ${data.name}
    Target Role: ${data.jobTitle}
    Company: ${data.company}
    Skills: ${data.skills}
    Tone: ${data.tone}
    Experience: ${data.experience}
    Additional Info: ${data.notes}
    
    Return ONLY the cover letter content. Be professional and persuasive.`;
    const response = await safeAiCall(prompt);
    return cleanAiText(response);
  } catch (err) {
    throw new Error(getFriendlyAiError(err));
  }
}

export async function improveCoverLetter(content, data) {
  try {
    const prompt = `Improve the following cover letter for ${data.jobTitle} at ${data.company}. 
    Make it more professional, persuasive, and ensure it highlights these skills: ${data.skills}.
    
    Current Content:
    ${content}
    
    Return ONLY the improved cover letter content.`;
    const response = await safeAiCall(prompt);
    return cleanAiText(response);
  } catch (err) {
    throw new Error(getFriendlyAiError(err));
  }
}
