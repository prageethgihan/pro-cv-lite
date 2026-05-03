import { GoogleGenerativeAI } from "@google/generative-ai";

const apiKey = import.meta.env.VITE_GEMINI_API_KEY;

if (!apiKey) {
  console.warn("Gemini API key is missing. Check your .env file.");
}

const genAI = new GoogleGenerativeAI(apiKey);

const model = genAI.getGenerativeModel({
  model: "gemini-2.5-flash",
});

function cleanAiText(text) {
  if (!text) return "";
  return text.trim().replace(/^["'`]+|["'`]+$/g, "");
}

export async function fixGrammar(text) {
  if (!text || !text.trim()) return "";

  const prompt = `
You are a professional CV writing assistant.

Task:
Fix grammar, spelling, punctuation, and sentence clarity in the text below.

Rules:
- Keep the original meaning exactly the same.
- Do NOT add fake information.
- Do NOT remove important information.
- Do NOT convert the text into bullet points unless the input already uses bullet points.
- Keep the wording natural and professional.
- Return only the corrected text.
- Keep it suitable for a CV or resume.

Text:
${text}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return cleanAiText(response.text());
}

export async function improveCvText(text) {
  if (!text || !text.trim()) return "";

  const prompt = `
You are an expert CV and resume writing assistant.

Task:
Rewrite the text below so it sounds more professional, polished, concise, and suitable for a modern ATS-friendly CV.

Rules:
- Keep the original meaning.
- Do NOT invent fake achievements, fake numbers, fake tools, or fake responsibilities.
- Do NOT exaggerate beyond what is written.
- Make the wording stronger and more professional.
- Use clear, confident, action-oriented language.
- Keep the result concise and impactful.
- Keep it suitable for a student's or job seeker's CV.
- Return only the improved text.
- Do not use quotation marks around the answer.
- Do not add headings or bullet points unless the original text already uses them.

Text:
${text}
  `;

  const result = await model.generateContent(prompt);
  const response = await result.response;
  return cleanAiText(response.text());
}

export function buildSummaryPrompt(cv, templateId) {
  // Clean empty fields
  const cleanData = {};
  if (cv.fullName?.trim()) cleanData.fullName = cv.fullName.trim();
  if (cv.jobTitle?.trim()) cleanData.jobTitle = cv.jobTitle.trim();

  const skills = cv.skills?.filter((s) => s.trim() !== "") || [];
  if (skills.length > 0) cleanData.skills = skills;

  const experience = cv.experience
    ?.filter((e) => e.role?.trim() || e.company?.trim())
    ?.map((e) => ({
      role: e.role,
      company: e.company,
      years: `${e.start} - ${e.end}`,
    }));
  if (experience?.length > 0) cleanData.experience = experience;

  const education = cv.education
    ?.filter((e) => e.degree?.trim() || e.university?.trim())
    ?.map((e) => ({
      degree: e.degree,
      university: e.university,
    }));
  if (education?.length > 0) cleanData.education = education;

  const languages = cv.languages?.filter((l) => l.trim() !== "") || [];
  if (languages.length > 0) cleanData.languages = languages;

  /* -- Template 6 only: include O/L, A/L, and extra qualifications -- */
  if (templateId === "t6") {
    const alSubs = cv.alResults?.subjects?.filter((s) => s.subject?.trim()) || [];
    if (alSubs.length || cv.alResults?.stream || cv.alResults?.year) {
      cleanData.alResults = {
        stream:   cv.alResults?.stream || undefined,
        year:     cv.alResults?.year   || undefined,
        school:   cv.alResults?.school || undefined,
        subjects: alSubs.map((s) => ({ subject: s.subject, grade: s.grade })),
      };
    }

    const olSubs = cv.olResults?.subjects?.filter((s) => s.subject?.trim()) || [];
    if (olSubs.length || cv.olResults?.year) {
      cleanData.olResults = {
        year:     cv.olResults?.year   || undefined,
        school:   cv.olResults?.school || undefined,
        subjects: olSubs.map((s) => ({ subject: s.subject, grade: s.grade })),
      };
    }

    const extraQ = (cv.extraQualifications ?? []).filter(
      (q) => q.title?.trim() || q.provider?.trim()
    );
    if (extraQ.length > 0) {
      cleanData.extraQualifications = extraQ.map((q) => ({
        title:    q.title    || undefined,
        provider: q.provider || undefined,
        year:     q.year     || undefined,
      }));
    }

    const coreComp = (cv.coreCompetencies ?? []).filter((c) => c.trim());
    if (coreComp.length > 0) {
      cleanData.coreCompetencies = coreComp;
    }
  }

  const hasAcademic = templateId === "t6" && (cleanData.alResults || cleanData.olResults || cleanData.extraQualifications);
  const hasCoreComp = templateId === "t6" && (cleanData.coreCompetencies?.length > 0);

  return `
You are an expert CV and resume writing assistant.

Task:
Analyze the following CV details and generate a concise professional profile summary.

Rules:
- Professional tone.
- Concise (2 to 4 sentences).
- CV-friendly.
- No bullet points.
- No headings.
- No fake information or assumptions (do not invent achievements, years of experience, unknown certifications, or companies not provided).
- Write ONLY from the provided data.
${hasAcademic ? "- If O/L results, A/L results, or extra qualifications are provided, briefly and naturally mention the candidate's strong academic background and qualifications. Do not invent ranks, awards, or achievements not listed." : ""}
${hasCoreComp ? "- If core competencies are listed, you may naturally weave one or two of the most relevant soft strengths into the summary (e.g. Teamwork, Leadership). Do not list them as bullet points." : ""}
- Return ONLY the generated plain text. Do not use Markdown, quotation marks, or HTML formatting.

User CV Data:
${JSON.stringify(cleanData, null, 2)}
  `.trim();
}

export async function generateAiSummary(cv, templateId) {
  const prompt = buildSummaryPrompt(cv, templateId);
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return cleanAiText(response.text());
}