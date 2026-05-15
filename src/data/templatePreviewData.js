export const fakePreviewData = {
  fullName: "Peter Parker",
  jobTitle: "Senior Software Engineer",
  summary: "Highly skilled and innovative Software Engineer with over 6 years of experience in full-stack development, specializing in React, Node.js, and cloud architecture. Proven track record of leading development teams to deliver scalable enterprise solutions. Passionate about clean code, continuous integration, and mentoring junior developers.",
  
  contact: {
    phone: "+94 77 123 4567",
    email: "peter.parker@example.com",
    address: "123/A, Galle Road, Colombo 03, Sri Lanka",
    website: "linkedin.com/in/peter-parker",
  },
  
  personalDetails: {
    nic: "961234567V",
    dateOfBirth: "15 May 1996"
  },

  education: [
    {
      years: "2015 - 2019",
      university: "University of Moratuwa",
      degree: "B.Sc. (Hons) in Computer Science and Engineering",
      details: "Graduated with First Class Honors. Specialized in Software Engineering and Artificial Intelligence. Final year project focused on Machine Learning for healthcare.",
    },
    {
      years: "2013 - 2015",
      university: "Visakha Vidyalaya, Colombo",
      degree: "G.C.E. Advanced Level (Physical Science)",
      details: "Achieved 3 'A' passes. Active member of the Science Society and the Coding Club.",
    }
  ],

  languages: ["English (Fluent)", "Sinhala (Native)", "Tamil (Basic)"],

  references: [
    {
      name: "Dr. Asela Perera",
      role: "Senior Lecturer",
      company: "University of Moratuwa",
      phone: "+94 71 987 6543",
      email: "asela.p@uom.lk",
    },
    {
      name: "Kasun Silva",
      role: "Tech Lead",
      company: "WSO2",
      phone: "+94 77 555 4444",
      email: "kasun.s@example.com",
    }
  ],

  photoDataUrl: "", // Handled separately or can be a placeholder
  photoDataUrlHd: "",
  themeMode: "auto",
  
  skills: ["JavaScript (ES6+)", "React & Redux", "Node.js & Express", "TypeScript", "MongoDB & PostgreSQL", "AWS & Docker", "Agile & Scrum"],
  
  experience: [
    {
      role: "Senior Software Engineer",
      company: "Sysco LABS Sri Lanka",
      start: "Jan 2021",
      end: "Present",
      description: "• Lead a team of 5 developers in building a cloud-native inventory management system.\n• Improved application performance by 40% through code splitting and lazy loading.\n• Implemented robust CI/CD pipelines using GitHub Actions and AWS CodePipeline.\n• Conducted technical interviews and mentored junior engineering staff."
    },
    {
      role: "Software Engineer",
      company: "WSO2",
      start: "Jun 2019",
      end: "Dec 2020",
      description: "• Developed and maintained enterprise integration solutions using Java and Ballerina.\n• Reduced average response time of core APIs by 25% through query optimization.\n• Collaborated with cross-functional teams to design microservices architecture.\n• Authored comprehensive technical documentation for external clients."
    }
  ],

  extracurricular: [
    "President of the University Computer Society (2018-2019)",
    "Volunteer Instructor at 'Code for Sri Lanka' initiative",
    "First Runner-up at IEEEXtreme Programming Competition"
  ],

  /* -- Template 6 (Sri Lankan Academic) specific data -- */
  olResults: {
    school: "Visakha Vidyalaya, Colombo",
    year: "2012",
    subjects: [
      { subject: "Mathematics", grade: "A" },
      { subject: "Science", grade: "A" },
      { subject: "English", grade: "A" },
      { subject: "Sinhala", grade: "A" },
      { subject: "History", grade: "A" },
      { subject: "Buddhism", grade: "A" },
      { subject: "Information Technology", grade: "A" },
      { subject: "Business & Accounting", grade: "A" },
      { subject: "Geography", grade: "A" }
    ]
  },
  alResults: {
    school: "Visakha Vidyalaya, Colombo",
    year: "2015",
    stream: "Physical Science",
    subjects: [
      { subject: "Combined Mathematics", grade: "A" },
      { subject: "Physics", grade: "A" },
      { subject: "Chemistry", grade: "A" },
      { subject: "General English", grade: "A" }
    ],
    zScore: "2.451",
    districtRank: "12",
    islandRank: "45"
  },
  extraQualifications: [
    {
      title: "AWS Certified Solutions Architect – Associate",
      provider: "Amazon Web Services",
      year: "2022",
      details: "Validation of expertise in designing distributed systems on AWS."
    },
    {
      title: "Diploma in Information Technology",
      provider: "University of Colombo School of Computing (UCSC)",
      year: "2014",
      details: "Completed with Distinction. Covered programming fundamentals and database systems."
    }
  ],

  coreCompetencies: [
    "Software Architecture",
    "Cloud Computing",
    "Agile Methodologies",
    "Team Leadership"
  ],

  customSections: []
};

// Helper function to safely merge real user data with fake preview data
export function getPreviewData(cvData) {
  if (!cvData) return fakePreviewData;

  const hasSkills = cvData.skills?.some(skill => skill?.trim());
  const hasLanguages = cvData.languages?.some(lang => lang?.trim());
  const hasExperience = cvData.experience?.some(exp => exp.role?.trim() || exp.company?.trim());
  const hasEducation = cvData.education?.some(edu => edu.degree?.trim() || edu.university?.trim());
  const hasReferences = cvData.references?.some(ref => ref.name?.trim() || ref.company?.trim());
  const hasExtra = cvData.extracurricular?.some(ext => ext.activity?.trim());
  
  const hasOl = cvData.olResults?.school?.trim() || cvData.olResults?.subjects?.some(s => s.subject?.trim());
  const hasAl = cvData.alResults?.school?.trim() || cvData.alResults?.subjects?.some(s => s.subject?.trim());
  const hasExtraQuals = cvData.extraQualifications?.some(q => q.title?.trim());

  return {
    ...fakePreviewData,
    // Basic Info
    fullName: cvData.fullName || fakePreviewData.fullName,
    jobTitle: cvData.jobTitle || fakePreviewData.jobTitle,
    summary: cvData.summary || fakePreviewData.summary,
    
    // Contact
    contact: {
      phone: cvData.contact?.phone || fakePreviewData.contact.phone,
      email: cvData.contact?.email || fakePreviewData.contact.email,
      address: cvData.contact?.address || fakePreviewData.contact.address,
      website: cvData.contact?.website || fakePreviewData.contact.website,
    },
    
    // Arrays - if user has added anything, use their array, otherwise use fake
    skills: hasSkills ? cvData.skills : fakePreviewData.skills,
    languages: hasLanguages ? cvData.languages : fakePreviewData.languages,
    experience: hasExperience ? cvData.experience : fakePreviewData.experience,
    education: hasEducation ? cvData.education : fakePreviewData.education,
    references: hasReferences ? cvData.references : fakePreviewData.references,
    extracurricular: hasExtra ? cvData.extracurricular : fakePreviewData.extracurricular,
    
    // Template 6 specific
    olResults: hasOl ? cvData.olResults : fakePreviewData.olResults,
    alResults: hasAl ? cvData.alResults : fakePreviewData.alResults,
    extraQualifications: hasExtraQuals ? cvData.extraQualifications : fakePreviewData.extraQualifications,
    coreCompetencies: cvData.coreCompetencies?.some(c => c?.trim()) ? cvData.coreCompetencies : fakePreviewData.coreCompetencies,

    // Keep user's photo and theme preferences
    photoDataUrl: cvData.photoDataUrl || fakePreviewData.photoDataUrl,
    photoDataUrlHd: cvData.photoDataUrlHd || fakePreviewData.photoDataUrlHd,
    themeAutoGenerated: cvData.themeAutoGenerated,
    themeMode: cvData.themeMode,
    themeManual: cvData.themeManual,
    photoZoom: cvData.photoZoom,
    photoYBias: cvData.photoYBias,
    
    // Custom Sections
    customSections: (cvData.customSections?.some(s => s.title?.trim() || s.content?.trim())) 
      ? cvData.customSections 
      : fakePreviewData.customSections
  };
}
