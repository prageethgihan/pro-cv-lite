import { safeAiCall, getFriendlyAiError } from "./ai";
import jobsData from "../data/jobs.json";

/**
 * Clean and parse AI response for job matching
 */
function safeParseJobMatchResponse(rawResponse) {
  if (!rawResponse || typeof rawResponse !== "string") return null;
  
  let cleaned = rawResponse.trim();
  
  try {
    // 1. Extract the JSON block using a robust regex
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/);
    if (!jsonMatch) return null;
    cleaned = jsonMatch[0];

    // 2. Aggressive cleaning of common AI-generated JSON issues
    cleaned = cleaned
      .replace(/```json/gi, "")
      .replace(/```/g, "")
      .replace(/[\u0000-\u001F\u007F-\u009F]/g, "") // Remove control characters
      .replace(/,\s*([\]}])/g, "$1") // Remove trailing commas before ] or }
      .replace(/\n/g, " ") // Replace newlines with spaces for safer parsing
      .replace(/\r/g, "");

    const parsed = JSON.parse(cleaned);

    // 3. Validation: Ensure essential fields exist
    const required = ["overallMatchScore", "matchedJobs"];
    const hasAllFields = required.every(field => parsed[field] !== undefined);
    
    if (!hasAllFields) {
      console.warn("AI Job Match response missing required fields:", parsed);
      return null;
    }

    return parsed;
  } catch (e) {
    console.error("Job Match Parsing Failed:", e.message);
    try {
      const ultraCleaned = cleaned
        .replace(/\\"/g, '"') // Fix escaped quotes
        .replace(/\\n/g, " ") // Fix escaped newlines
        .replace(/\\t/g, " ");
      return JSON.parse(ultraCleaned);
    } catch (innerE) {
      return null;
    }
  }
}

/**
 * Refactored Job Match Analysis
 * Sends ONE optimized Gemini request to get all analysis data.
 * Includes production-level retry logic for 503/high-demand errors.
 */
export async function analyzeJobMatch(cvText, targetJob = "", location = "Any", experienceLevel = "Any", onRetry = null) {
  if (!cvText) throw new Error("CV text is required for analysis.");

  // Truncate CV text for efficiency
  const optimizedCvText = cvText.length > 5000 ? cvText.substring(0, 5000) + "..." : cvText;

  const prompt = `
Task: Comprehensive Job Match Analysis.
You are an expert career consultant and recruiter. Analyze the provided CV against a database of jobs and a target role.

Input Parameters:
- Target Job Title: ${targetJob || "Any suitable role"}
- Preferred Location: ${location}
- Experience Level: ${experienceLevel}
- Available Jobs Database: ${JSON.stringify(jobsData)}

CV Content:
${optimizedCvText}

Instructions:
1. Parse the CV to extract skills, experience, and education.
2. Compare the CV against the "Available Jobs Database" and the "Target Job Title".
3. Calculate match scores based on skill overlap, experience relevance, and location/level preferences.
4. Provide career recommendations and suggested roles.
5. Identify user's current skills and skills missing for the desired career path.

Output: Return ONLY a valid JSON object with the following structure (no markdown, no preamble):
{
  "overallMatchScore": <number 0-100>,
  "skillsMatch": <number 0-100>,
  "experienceMatch": <number 0-100>,
  "educationMatch": <number 0-100>,
  "keywordMatch": <number 0-100>,
  "userSkills": ["skill1", "skill2", ...],
  "missingSkills": ["missing1", "missing2", ...],
  "recommendations": ["rec1", "rec2", ...],
  "suggestedRoles": ["role1", "role2", ...],
  "topMatchedJob": {
    "jobId": "<id from database>",
    "title": "<job title>",
    "matchScore": <number>,
    "reasoning": "<short explanation>"
  },
  "matchedJobs": [
    {
      "jobId": "<id from database>",
      "matchScore": <number 0-100>,
      "keyMatches": ["skill/feat1", "skill/feat2", ...],
      "experienceRelevance": "<e.g. Highly Relevant, Good, etc.>"
    }
  ]
}
`;

  let retries = 0;
  const maxRetries = 3;
  const backoffSchedule = [2000, 4000, 8000];

  while (retries <= maxRetries) {
    try {
      const aiResponse = await safeAiCall(prompt, { model: "gemini-2.5-flash" });
      const parsedData = safeParseJobMatchResponse(aiResponse);

      if (!parsedData) {
        throw new Error("AI_FORMAT_ERROR");
      }

      // Post-process to merge database job details into matchedJobs
      const enrichedMatches = (parsedData.matchedJobs || [])
        .map(match => {
          const jobDetails = jobsData.find(j => j.id === match.jobId);
          return jobDetails ? { ...jobDetails, ...match } : null;
        })
        .filter(Boolean)
        .sort((a, b) => b.matchScore - a.matchScore);

      return {
        ...parsedData,
        matchedJobs: enrichedMatches
      };
    } catch (err) {
      const errorMsg = err.message || "";
      const is503 = errorMsg.includes("503") || err.status === 503 || errorMsg.toLowerCase().includes("high demand") || errorMsg.toLowerCase().includes("service unavailable");
      
      if (is503 && retries < maxRetries) {
        const waitTime = backoffSchedule[retries];
        console.warn(`[JobMatch] Gemini 503/High Demand detected. Retry ${retries + 1}/${maxRetries} in ${waitTime/1000}s. Error: ${errorMsg}`);
        
        if (onRetry) onRetry(retries + 1, waitTime);
        
        await new Promise(res => setTimeout(res, waitTime));
        retries++;
        continue;
      }

      // Final failure logging
      console.error(`[JobMatch] Analysis failed permanently. Attempts: ${retries + 1}. Reason: ${errorMsg}`);
      
      if (is503) {
        throw new Error("AI servers are currently busy. Please try again in a few moments.");
      }
      
      if (errorMsg === "AI_FORMAT_ERROR") {
        throw new Error("Unable to process AI response. Please retry.");
      }

      throw new Error(getFriendlyAiError(err));
    }
  }
}
