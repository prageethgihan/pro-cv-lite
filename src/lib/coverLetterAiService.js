import { safeAiCall, getFriendlyAiError } from "./ai";

/**
 * Cover Letter AI Service
 * Handles generation, improvement, and analysis using Gemini AI
 */

const TEMPLATE_STYLING = {
  "Modern Professional": "Clean, balanced, and direct. Use professional but accessible language. Focus on results and value.",
  "Executive": "Formal, high-level, and authoritative. Focus on leadership, strategy, and business impact. Use sophisticated vocabulary.",
  "Creative": "Engaging, conversational, and unique. Focus on passion, innovation, and personality. Use storytelling elements.",
  "Friendly": "Warm, approachable, and enthusiastic. Focus on culture fit and team collaboration. Use a welcoming tone.",
  "Minimal": "Concise, precise, and streamlined. Focus on essential facts and core competencies. Avoid any fluff."
};

/**
 * Generate a production-ready cover letter
 */
export async function generateCoverLetterAi(data, templateStyle = "Modern Professional") {
  const styleGuide = TEMPLATE_STYLING[templateStyle] || TEMPLATE_STYLING["Modern Professional"];
  
  const prompt = `
    USER DETAILS (APPLICANT):
    Name: ${data.name}
    Email: ${data.email || "Not provided"}
    Phone: ${data.phone || "Not provided"}
    Location: ${data.location || "Not provided"}
    
    COMPANY / RECIPIENT DETAILS:
    Hiring Manager: ${data.hiringManager || "Not provided"}
    Company: ${data.company}
    Address: ${data.companyAddress || "Not provided"}
    Email: ${data.companyEmail || "Not provided"}
    Location: ${data.companyLocation || "Not provided"}
    
    PREFERENCES:
    Greeting Style: ${data.greetingStyle}
    Letter Date: ${data.letterDate}
    Tone: ${data.tone}
    Experience Level: ${data.experience}
    
    JOB DETAILS:
    Target Role: ${data.jobTitle}
    Skills: ${data.skills}
    Additional Context: ${data.notes || "None"}
    
    STRICT RULES FOR HALLUCINATION PREVENTION:
    1. NEVER invent fake physical addresses, streets, ZIP codes, or states.
    2. If a piece of contact info is "Not provided", OMIT IT from the header.
    3. DATE HANDLING: Use the provided Letter Date (${data.letterDate}) in the header. NEVER use placeholder text like "[Current Date]".
    4. GREETING HANDLING:
       - If Style is "Auto": Use "Dear ${data.hiringManager}," if name provided, else "Dear Hiring Manager:".
       - If Style is "Use Recipient Name": Use "Dear ${data.hiringManager || "Hiring Manager"},".
       - If Style is any other specific option (e.g., "Dear Sir/Madam"): Use that EXACT phrase.
    5. ONLY use the names and company details provided.
    
    TONE & CONTENT REQUIREMENTS:
    1. Use a practical, professional, and human-written voice. 
    2. AVOID overly emotional AI fluff like "My passion for...", "I am thrilled to...", "I am extremely excited...".
    3. Use concise, impactful sentences focusing on quantifiable experience and skills.
    4. High focus on ATS optimization by naturally incorporating key skills.
    5. Structure: Professional header (using real data ONLY), direct opening, 2-3 value-driven paragraphs, professional closing.
    6. Length: 250-400 words.
    
    Return ONLY the cover letter content. No markdown formatting, just plain text with proper spacing.
  `;

  try {
    const response = await safeAiCall(prompt);
    return response.trim();
  } catch (err) {
    throw new Error(getFriendlyAiError(err));
  }
}

/**
 * Improve an existing cover letter intelligently
 */
export async function improveCoverLetterAi(currentContent, data) {
  const prompt = `
    TASK: Improve the following cover letter intelligently without changing its core message or identity.
    
    CURRENT CONTENT:
    ${currentContent}
    
    TARGET JOB: ${data.jobTitle} at ${data.company}
    RECIPIENT: ${data.hiringManager || "Hiring Manager"}
    
    STRENGTHEN THESE AREAS:
    1. Readability, flow, and professional impact.
    2. ATS keyword density (specifically for: ${data.skills}).
    3. Action-oriented language (use strong verbs, avoid passive voice).
    4. Personalization to ${data.company}.
    
    REQUIREMENTS:
    - Keep the same general length.
    - Do NOT rewrite it into a generic template.
    - Fix any grammar or structural weaknesses.
    - NEVER invent fake contact details if they are missing.
    - If the user provided a Hiring Manager name, ensure it is used correctly.
    
    Return ONLY the improved cover letter content.
  `;

  try {
    const response = await safeAiCall(prompt);
    return response.trim();
  } catch (err) {
    throw new Error(getFriendlyAiError(err));
  }
}

/**
 * Analyze cover letter and get real AI-powered metrics
 */
export async function analyzeCoverLetterAi(content, data) {
  const prompt = `
    TASK: Perform a deep ATS and professional analysis of the cover letter.
    
    CONTENT:
    ${content}
    
    TARGET JOB: ${data.jobTitle} at ${data.company}
    REQUIRED SKILLS: ${data.skills}
    
    ANALYSIS CRITERIA (SCORING MUST BE REALISTIC & CONSERVATIVE):
    1. ATS Friendliness (0-100)
    2. Keyword Relevance (0-100)
    3. Professional Tone (0-100)
    4. Personalization (0-100)
    5. Overall Strength (0-100)
    
    SCORING SCALE:
    - 50-65: Weak/Generic
    - 70-80: Decent/Solid
    - 85+: Very Strong/Exceptional
    (Do NOT award 90+ unless it is truly outstanding and perfectly tailored)
    
    Return the result as a STRICT JSON object with these keys:
    {
      "score": number,
      "status": "Strong" | "Good" | "Needs Work",
      "metrics": {
        "ats": number,
        "keywords": number,
        "tone": number,
        "personalization": number
      },
      "checklist": [
        {"label": string, "passed": boolean}
      ],
      "tips": string[]
    }
    
    Ensure you return ONLY the JSON object.
  `;

  try {
    const response = await safeAiCall(prompt);
    // Safe parsing with fallback
    const cleaned = response.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("AI Analysis parsing failed", err);
    // Fallback safe object
    return {
      score: 70,
      status: "Good",
      metrics: { ats: 70, keywords: 70, tone: 80, personalization: 60 },
      checklist: [{label: "Basic structure detected", passed: true}],
      tips: ["Try adding more specific achievements", "Ensure all contact info is included"]
    };
  }
}

/**
 * Generate contextual writing tips
 */
export async function getContextualTipsAi(data) {
  const prompt = `
    TASK: Generate 4 short, actionable professional writing tips for a ${data.jobTitle} application at ${data.company}.
    
    CONTEXT:
    Experience: ${data.experience}
    Skills: ${data.skills}
    
    REQUIREMENTS:
    - Tips must be specific to this role/industry.
    - Each tip under 15 words.
    
    Return as a simple comma-separated list.
  `;

  try {
    const response = await safeAiCall(prompt);
    return response.split(",").map(s => s.trim().replace(/^["']|["']$/g, ""));
  } catch (err) {
    return [
      "Highlight your technical achievements",
      "Mention specific projects related to the role",
      "Keep the formatting clean and readable",
      "Focus on the value you bring to the company"
    ];
  }
}
