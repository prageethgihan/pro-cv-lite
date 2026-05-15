/**
 * Cover Letter Analysis Utility
 */

export const analyzeCoverLetter = (content, formData) => {
  if (!content || !content.trim()) {
    return {
      score: 0,
      status: "Empty",
      checklist: []
    };
  }

  const checks = [];
  let score = 0;

  // 1. Length Check (Optimal is 200-400 words)
  const wordCount = content.trim().split(/\s+/).length;
  if (wordCount >= 200 && wordCount <= 500) {
    score += 20;
    checks.push({ label: "Optimal Length", passed: true });
  } else {
    checks.push({ label: "Optimal Length", passed: false });
  }

  // 2. Personalization (Company Name & Job Title)
  const hasCompany = content.toLowerCase().includes(formData.company.toLowerCase());
  const hasJobTitle = content.toLowerCase().includes(formData.jobTitle.toLowerCase());
  
  if (hasCompany && hasJobTitle) {
    score += 25;
    checks.push({ label: "Highly Personalized", passed: true });
  } else {
    checks.push({ label: "Highly Personalized", passed: false });
  }

  // 3. Contact Info
  const hasEmail = content.toLowerCase().includes(formData.email.toLowerCase());
  const hasPhone = content.includes(formData.phone);
  
  if (hasEmail || hasPhone) {
    score += 15;
    checks.push({ label: "Contact Info Included", passed: true });
  } else {
    checks.push({ label: "Contact Info Included", passed: false });
  }

  // 4. Skills Mentioned
  const mentionedSkills = formData.skills.filter(skill => 
    content.toLowerCase().includes(skill.toLowerCase())
  );
  
  if (mentionedSkills.length >= Math.min(2, formData.skills.length)) {
    score += 20;
    checks.push({ label: "Key Skills Highlighted", passed: true });
  } else {
    checks.push({ label: "Key Skills Highlighted", passed: false });
  }

  // 5. Structure (Paragraphs)
  const paragraphCount = content.split(/\n\s*\n/).length;
  if (paragraphCount >= 3) {
    score += 20;
    checks.push({ label: "Professional Structure", passed: true });
  } else {
    checks.push({ label: "Professional Structure", passed: false });
  }

  // Cap score at 100
  score = Math.min(score, 100);

  let status = "Weak";
  if (score >= 80) status = "Strong";
  else if (score >= 50) status = "Good";

  return {
    score,
    status,
    checklist: checks,
    wordCount
  };
};

export const calculateSuccessRate = (letters) => {
  if (!letters || letters.length === 0) return 0;
  const totalScore = letters.reduce((sum, l) => sum + (l.score || 0), 0);
  return Math.round(totalScore / letters.length);
};

export const estimateTimeSaved = (lettersCount) => {
  // Assume 45 minutes saved per letter
  const minutes = lettersCount * 45;
  const hours = minutes / 60;
  return hours.toFixed(1);
};
