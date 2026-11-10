import React from "react";

function LinkedinIcon() {
  return (
    <svg style={{ width: "14px", height: "14px", minWidth: "14px", minHeight: "14px", flexShrink: 0 }} fill="#000000" viewBox="0 0 24 24">
      <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.46 10.9h2.79v8.37H6.46v-8.37M7.86 6.74a1.63 1.63 0 0 0-1.63 1.63 1.63 1.63 0 0 0 1.63 1.63 1.63 1.63 0 0 0 1.63-1.63c0-.9-.73-1.63-1.63-1.63Z" />
    </svg>
  );
}

function GithubIcon() {
  return (
    <svg style={{ width: "14px", height: "14px", minWidth: "14px", minHeight: "14px", flexShrink: 0 }} fill="#000000" viewBox="0 0 24 24">
      <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
    </svg>
  );
}

function PhoneIcon() {
  return (
    <svg style={{ width: "14px", height: "14px", minWidth: "14px", minHeight: "14px", flexShrink: 0 }} fill="#000000" viewBox="0 0 24 24">
      <path d="M6.62 10.79a15.053 15.053 0 006.59 6.59l2.2-2.2a1 1 0 011.02-.24 11.72 11.72 0 003.68.59 1 1 0 011 1V20a1 1 0 01-1 1A17 17 0 013 4a1 1 0 011-1h3.5a1 1 0 011 1 11.72 11.72 0 00.59 3.68 1 1 0 01-.24 1.02l-2.23 2.09z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg style={{ width: "14px", height: "14px", minWidth: "14px", minHeight: "14px", flexShrink: 0 }} fill="#000000" viewBox="0 0 24 24">
      <path d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z" />
    </svg>
  );
}

const SECTION_LINE = { borderTop: "1.5px solid #000000", margin: "16px 0 14px 0" };

export default function OriginalUploadedTemplate({
  cv,
  lastUpdatedSection,
  pageToShow = "all", // "all" | 1 | 2
  isExport = false
}) {
  if (!cv) return null;

  const contact = cv.contact || {};
  const education = cv.education || [];
  const projects = cv.projects || [];
  const experience = cv.experience || [];
  const skills = Array.isArray(cv.skills) ? cv.skills : [];
  const technologies = cv.technologies || [];
  const certifications = cv.certifications || [];
  const references = cv.references || [];

  const isHighlighted = (sec) => {
    if (isExport || !lastUpdatedSection) return false;
    const l = lastUpdatedSection.toLowerCase();
    const s = sec.toLowerCase();
    return l.includes(s) || s.includes(l);
  };

  const hasPage2Content =
    projects.length > 2 ||
    (projects.length >= 2 && (technologies.length > 0 || references.length > 0)) ||
    experience.length > 2 ||
    (technologies.length > 0 && references.length > 0);

  const page1Projects = hasPage2Content ? projects.slice(0, 2) : projects;
  const page2Projects = hasPage2Content ? projects.slice(2) : [];

  const page1Experience = hasPage2Content ? experience.slice(0, 2) : experience;
  const page2Experience = hasPage2Content ? experience.slice(2) : [];

  const renderProjectItem = (proj, idx) => {
    let bullets = proj.bullets || [];
    if (!bullets.length && proj.description) {
      bullets = proj.description
        .split(/\n|•/)
        .map((b) => b.trim().replace(/^[-•*]\s*/, ""))
        .filter((b) => b.length > 0);
    }

    // Clean up subtitle if it duplicates job title
    let cleanSubtitle = proj.subtitle;
    if (cleanSubtitle && cv.jobTitle && cleanSubtitle.includes(cv.jobTitle)) {
      cleanSubtitle = cleanSubtitle.replace(cv.jobTitle, "").replace(/^[\s|•\-–—]+/, "").trim();
    }

    return (
      <div key={idx} className="mb-4" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        <div className="font-bold text-black text-[14.5px] leading-tight">
          {proj.title || "Project Title"}
        </div>
        {cleanSubtitle && (
          <div className="text-[#333333] text-[14px] mt-0.5 leading-tight">
            {cleanSubtitle}
          </div>
        )}
        {proj.technologies && (
          <div className="text-black text-[13.3px] mt-1 leading-snug">
            <span className="font-bold">Technologies: </span>
            <span className="font-normal">{proj.technologies.replace(/^Technologies:\s*/i, "")}</span>
          </div>
        )}
        {proj.github && (
          <div className="text-[13.3px] mt-1 leading-snug">
            <span className="text-black font-bold">GitHub: </span>
            <a
              href={proj.github.startsWith("http") ? proj.github : `https://${proj.github}`}
              target="_blank"
              rel="noreferrer"
              className="text-[#1d4ed8] hover:underline"
            >
              {proj.github}
            </a>
          </div>
        )}
        {bullets.length > 0 ? (
          <div className="mt-2 space-y-1">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-start text-[13px] leading-[1.55] text-black">
                <span className="inline-block mr-2.5 text-[14px] font-bold select-none text-black leading-[1.55]">•</span>
                <span className="flex-1">{b}</span>
              </div>
            ))}
          </div>
        ) : proj.description ? (
          <p className="text-[13px] leading-[1.55] text-black mt-1.5 m-0">
            {proj.description}
          </p>
        ) : null}
      </div>
    );
  };

  const renderExperienceItem = (exp, idx) => {
    let bullets = exp.bullets || [];
    if (!bullets.length && exp.description) {
      bullets = exp.description
        .split(/\n|•/)
        .map((b) => b.trim().replace(/^[-•*]\s*/, ""))
        .filter((b) => b.length > 0);
    }

    return (
      <div key={idx} className="mb-3.5" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
        <div className="flex items-baseline justify-between">
          <div>
            <span className="font-bold text-black text-[14.5px]">{exp.role || "Role"}</span>
            {exp.company && <span className="text-black text-[14px]"> | {exp.company}</span>}
          </div>
          <span className="text-black text-[13px] font-bold">
            {exp.start || ""}{exp.end ? ` - ${exp.end}` : ""}
          </span>
        </div>
        {bullets.length > 0 ? (
          <div className="mt-1.5 space-y-1">
            {bullets.map((b, i) => (
              <div key={i} className="flex items-start text-[13px] leading-[1.55] text-black">
                <span className="inline-block mr-2.5 text-[14px] font-bold select-none text-black leading-[1.55]">•</span>
                <span className="flex-1">{b}</span>
              </div>
            ))}
          </div>
        ) : exp.description ? (
          <p className="text-[13px] leading-[1.55] text-black mt-1 m-0">
            {exp.description}
          </p>
        ) : null}
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     PAGE 1 CONTENT (Exact A4 Dimensions: 794px x 1123px)
  ───────────────────────────────────────────────────────────── */
  const renderPage1 = () => (
    <div
      id="original-cv-page-1"
      className="original-cv-page bg-white text-black box-border text-left leading-normal relative select-text"
      style={{
        width: "794px",
        height: "1123px",
        minHeight: "1123px",
        maxHeight: "1123px",
        padding: "48px 75px 50px 75px",
        fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
        color: "#000000",
        backgroundColor: "#ffffff",
        boxSizing: "border-box",
        overflow: "hidden"
      }}
    >
      {/* ── HEADER ── */}
      <div className="pb-1">
        <h1
          className="text-[36px] font-bold tracking-normal uppercase leading-tight m-0"
          style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#000000" }}
        >
          {cv.fullName || "RASHINI JAYASEKARA"}
        </h1>

        {cv.jobTitle && (
          <div
            className="text-[15.5px] font-normal tracking-normal mt-1 mb-3"
            style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#111111" }}
          >
            {cv.jobTitle}
          </div>
        )}

        {/* Contacts 2x2 Grid: Direct grid items strictly enforce 100% horizontal and vertical alignment */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            rowGap: "7px",
            columnGap: "28px",
            alignItems: "center",
            fontFamily: "Arial, Helvetica, sans-serif",
            color: "#000000",
            fontSize: "14px",
            lineHeight: "1.2"
          }}
        >
          {/* Row 1, Col 1: LinkedIn */}
          <div style={{ display: "flex", alignItems: "center", minHeight: "22px" }}>
            <LinkedinIcon />
            <a
              href={contact.linkedin ? (contact.linkedin.startsWith("http") ? contact.linkedin : `https://${contact.linkedin}`) : "https://www.linkedin.com/in/rashini-jayasekara"}
              target="_blank"
              rel="noreferrer"
              style={{
                marginLeft: "8px",
                color: "#000000",
                textDecoration: "none",
                display: "inline-block",
                verticalAlign: "middle",
                lineHeight: "1.2"
              }}
              className="hover:underline"
            >
              {contact.linkedin || "https://www.linkedin.com/in/rashini-jayasekara"}
            </a>
          </div>

          {/* Row 1, Col 2: Phone */}
          <div style={{ display: "flex", alignItems: "center", minHeight: "22px" }}>
            <PhoneIcon />
            <span
              style={{
                marginLeft: "8px",
                color: "#000000",
                display: "inline-block",
                verticalAlign: "middle",
                lineHeight: "1.2"
              }}
            >
              {contact.phone || "+94704413086"}
            </span>
          </div>

          {/* Row 2, Col 1: GitHub */}
          <div style={{ display: "flex", alignItems: "center", minHeight: "22px" }}>
            <GithubIcon />
            <a
              href={contact.github ? (contact.github.startsWith("http") ? contact.github : `https://${contact.github}`) : "https://github.com/jprsavindya1"}
              target="_blank"
              rel="noreferrer"
              style={{
                marginLeft: "8px",
                color: "#000000",
                textDecoration: "none",
                display: "inline-block",
                verticalAlign: "middle",
                lineHeight: "1.2"
              }}
              className="hover:underline"
            >
              {contact.github || "https://github.com/jprsavindya1"}
            </a>
          </div>

          {/* Row 2, Col 2: Email */}
          <div style={{ display: "flex", alignItems: "center", minHeight: "22px" }}>
            <MailIcon />
            <a
              href={`mailto:${contact.email || "rashinijayasekarajp@gmail.com"}`}
              style={{
                marginLeft: "8px",
                color: "#000000",
                textDecoration: "none",
                display: "inline-block",
                verticalAlign: "middle",
                lineHeight: "1.2"
              }}
              className="hover:underline"
            >
              {contact.email || "rashinijayasekarajp@gmail.com"}
            </a>
          </div>
        </div>
      </div>

      {/* ── SUMMARY / ABOUT ME ── */}
      {cv.summary && (
        <div>
          <div style={SECTION_LINE} />
          <div
            className={`transition-all duration-500 rounded p-1 -m-1 ${
              isHighlighted("summary") ? "bg-emerald-50 ring-2 ring-emerald-500" : ""
            }`}
          >
            <h2
              className="text-[17.5px] font-bold uppercase tracking-[0.5px] mb-2 m-0"
              style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#000000" }}
            >
              {cv.summaryTitle || "ABOUT ME"}
            </h2>
            <p
              className="text-[13.3px] leading-[1.55] text-justify whitespace-pre-wrap m-0"
              style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#000000" }}
            >
              {cv.summary}
            </p>
          </div>
        </div>
      )}

      {/* ── EDUCATION ── */}
      {education.length > 0 && (
        <div>
          <div style={SECTION_LINE} />
          <div
            className={`transition-all duration-500 rounded p-1 -m-1 ${
              isHighlighted("education") ? "bg-emerald-50 ring-2 ring-emerald-500" : ""
            }`}
          >
            <h2
              className="text-[17.5px] font-bold uppercase tracking-[0.5px] mb-2 m-0"
              style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#000000" }}
            >
              EDUCATION
            </h2>
            <div className="space-y-1.5">
              {education.map((edu, idx) => (
                <div key={idx} className="text-[13.3px]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                  <div className="flex items-baseline justify-between">
                    <span className="font-bold text-black text-[14px]">
                      {edu.university || edu.school || "University"}
                    </span>
                    <span className="text-black text-[13.3px] font-bold">
                      {edu.years || edu.year || ""}
                    </span>
                  </div>
                  {edu.degree && <div className="text-[#111111] mt-0.5 font-normal text-[14px]">{edu.degree}</div>}
                  {edu.details && (
                    <div className="text-[#333333] text-[12px] mt-0.5 leading-snug">
                      {edu.details}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── WORK EXPERIENCE (If on Page 1) ── */}
      {page1Experience.length > 0 && (
        <div>
          <div style={SECTION_LINE} />
          <div
            className={`transition-all duration-500 rounded p-1 -m-1 ${
              isHighlighted("experience") ? "bg-emerald-50 ring-2 ring-emerald-500" : ""
            }`}
          >
            <h2
              className="text-[17.5px] font-bold uppercase tracking-[0.5px] mb-2 m-0"
              style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#000000" }}
            >
              WORK EXPERIENCE
            </h2>
            <div>{page1Experience.map(renderExperienceItem)}</div>
          </div>
        </div>
      )}

      {/* ── PROJECTS (Page 1 Projects) ── */}
      {page1Projects.length > 0 && (
        <div>
          <div style={SECTION_LINE} />
          <div
            className={`transition-all duration-500 rounded p-1 -m-1 ${
              isHighlighted("project") ? "bg-emerald-50 ring-2 ring-emerald-500" : ""
            }`}
          >
            <h2
              className="text-[17.5px] font-bold uppercase tracking-[0.5px] mb-2.5 m-0"
              style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#000000" }}
            >
              PROJECTS
            </h2>
            <div>{page1Projects.map(renderProjectItem)}</div>
          </div>
        </div>
      )}

      {/* If single-page CV, render the remaining sections here */}
      {!hasPage2Content && (
        <>
          {technologies.length > 0 && (
            <div>
              <div style={SECTION_LINE} />
              <div
                className={`transition-all duration-500 rounded p-1 -m-1 ${
                  isHighlighted("technologies") ? "bg-emerald-50 ring-2 ring-emerald-500" : ""
                }`}
              >
                <h2
                  className="text-[17.5px] font-bold uppercase tracking-[0.5px] mb-2 m-0"
                  style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#000000" }}
                >
                  TECHNOLOGIES
                </h2>
                <div className="space-y-1 text-[13.3px]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                  {technologies.map((tech, idx) => (
                    <div key={idx} className="text-black">
                      <span className="font-bold">{tech.category}: </span>
                      <span>{tech.items}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {skills.length > 0 && (
            <div>
              <div style={SECTION_LINE} />
              <div
                className={`transition-all duration-500 rounded p-1 -m-1 ${
                  isHighlighted("skill") ? "bg-emerald-50 ring-2 ring-emerald-500" : ""
                }`}
              >
                <h2
                  className="text-[17.5px] font-bold uppercase tracking-[0.5px] mb-2 m-0"
                  style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#000000" }}
                >
                  SKILLS
                </h2>
                <div className="space-y-1 text-[13px] leading-relaxed text-black">
                  {skills.map((s, idx) => (
                    <div key={idx} className="flex items-start">
                      <span className="mr-2 text-black font-bold">•</span>
                      <span>{typeof s === "string" ? s : s.name || ""}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {references.length > 0 && (
            <div>
              <div style={SECTION_LINE} />
              <div className="space-y-1 text-[13px]">
                <h2 className="text-[17.5px] font-bold uppercase tracking-[0.5px] mb-2 m-0">
                  REFERENCES
                </h2>
                {references.map((ref, idx) => (
                  <div key={idx} className="text-black">
                    <span className="font-bold">{ref.name}</span>
                    {ref.company && <span> — {ref.company}</span>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );

  /* ─────────────────────────────────────────────────────────────
     PAGE 2 CONTENT (Exact A4 Dimensions: 794px x 1123px)
  ───────────────────────────────────────────────────────────── */
  const renderPage2 = () => {
    if (!hasPage2Content) return null;

    return (
      <div
        id="original-cv-page-2"
        className="original-cv-page bg-white text-black box-border text-left leading-normal relative select-text"
        style={{
          width: "794px",
          height: "1123px",
          minHeight: "1123px",
          maxHeight: "1123px",
          padding: "50px 75px 50px 75px",
          fontFamily: "Arial, 'Helvetica Neue', Helvetica, sans-serif",
          color: "#000000",
          backgroundColor: "#ffffff",
          boxSizing: "border-box",
          overflow: "hidden"
        }}
      >
        {/* ── PROJECTS CONTINUED (Page 2 Projects) ── */}
        {page2Projects.length > 0 && (
          <div>
            <div
              className={`transition-all duration-500 rounded p-1 -m-1 ${
                isHighlighted("project") ? "bg-emerald-50 ring-2 ring-emerald-500" : ""
              }`}
            >
              {page2Projects.map(renderProjectItem)}
            </div>
          </div>
        )}

        {/* ── WORK EXPERIENCE CONTINUED (If any on Page 2) ── */}
        {page2Experience.length > 0 && (
          <div className="mt-2">
            <div
              className={`transition-all duration-500 rounded p-1 -m-1 ${
                isHighlighted("experience") ? "bg-emerald-50 ring-2 ring-emerald-500" : ""
              }`}
            >
              {page2Experience.map(renderExperienceItem)}
            </div>
          </div>
        )}

        {/* ── TECHNOLOGIES ── */}
        {technologies.length > 0 && (
          <div>
            <div style={SECTION_LINE} />
            <div
              className={`transition-all duration-500 rounded p-1 -m-1 ${
                isHighlighted("technologies") ? "bg-emerald-50 ring-2 ring-emerald-500" : ""
              }`}
            >
              <h2
                className="text-[17.5px] font-bold uppercase tracking-[0.5px] mb-2 m-0"
                style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#000000" }}
              >
                TECHNOLOGIES
              </h2>
              <div className="space-y-1.5 text-[13.3px]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
                {technologies.map((tech, idx) => (
                  <div key={idx} className="text-black">
                    <span className="font-bold">{tech.category}: </span>
                    <span className="font-normal">{tech.items}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── SKILLS & CERTIFICATIONS SIDE-BY-SIDE (Exact layout of original PDF) ── */}
        {(skills.length > 0 || certifications.length > 0) && (
          <div>
            <div style={SECTION_LINE} />
            <div className="grid grid-cols-2 gap-x-10 text-[13px]">
              {/* Left Column: SKILLS */}
              <div
                className={`transition-all duration-500 rounded p-1 -m-1 ${
                  isHighlighted("skill") ? "bg-emerald-50 ring-2 ring-emerald-500" : ""
                }`}
              >
                <h2
                  className="text-[17.5px] font-bold uppercase tracking-[0.5px] mb-2.5 m-0"
                  style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#000000" }}
                >
                  SKILLS
                </h2>
                <div className="space-y-1 text-black">
                  {skills.map((s, idx) => (
                    <div key={idx} className="flex items-start leading-[1.55]">
                      <span className="inline-block mr-2 text-[14px] font-bold select-none text-black">•</span>
                      <span>{typeof s === "string" ? s : s.name || ""}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Column: CERTIFICATIONS */}
              <div
                className={`transition-all duration-500 rounded p-1 -m-1 ${
                  isHighlighted("cert") ? "bg-emerald-50 ring-2 ring-emerald-500" : ""
                }`}
              >
                <h2
                  className="text-[17.5px] font-bold uppercase tracking-[0.5px] mb-2.5 m-0"
                  style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#000000" }}
                >
                  CERTIFICATIONS
                </h2>
                <div className="space-y-2.5 text-black">
                  {certifications.map((cert, idx) => {
                    const name = typeof cert === "string" ? cert : cert.name || "";
                    const issuer = typeof cert === "object" && cert.issuer ? cert.issuer : "";
                    const year = typeof cert === "object" && cert.year ? cert.year : "";
                    return (
                      <div key={idx} className="leading-snug text-[13.3px]">
                        <div className="font-normal">
                          {name}
                          {issuer ? ` | ${issuer}` : ""}
                          {year ? ` (${year})` : ""}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── REFERENCES ── */}
        {references.length > 0 && (
          <div>
            <div style={SECTION_LINE} />
            <div className="space-y-1 text-[13.3px]" style={{ fontFamily: "Arial, Helvetica, sans-serif" }}>
              <h2
                className="text-[17.5px] font-bold uppercase tracking-[0.5px] mb-2 m-0"
                style={{ fontFamily: "Arial, Helvetica, sans-serif", color: "#000000" }}
              >
                REFERENCES
              </h2>
              {references.map((ref, idx) => (
                <div key={idx} className="space-y-0.5 text-black">
                  <div className="font-bold">{ref.name}</div>
                  <div>
                    {ref.role ? `${ref.role}, ` : ""}
                    {ref.company || ""}
                  </div>
                  {ref.phone && <div>Phone: {ref.phone}</div>}
                  {ref.email && <div>Email : {ref.email}</div>}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  /* ─────────────────────────────────────────────────────────────
     RENDER DISPATCHER
  ───────────────────────────────────────────────────────────── */
  if (pageToShow === 1) {
    return renderPage1();
  }

  if (pageToShow === 2) {
    return hasPage2Content ? renderPage2() : null;
  }

  // When pageToShow === "all":
  return (
    <div className="flex flex-col items-center">
      {renderPage1()}
      {hasPage2Content && (
        <>
          {!isExport && (
            <div className="my-5 w-full flex items-center justify-center gap-3">
              <span className="h-px bg-white/20 flex-1" />
              <span className="bg-[#182030] border border-white/10 px-4 py-1.5 rounded-full text-[11px] font-bold text-gray-300 shadow">
                📄 Page 1 of 2 Complete • Page 2 Below ⬇
              </span>
              <span className="h-px bg-white/20 flex-1" />
            </div>
          )}
          {renderPage2()}
        </>
      )}
    </div>
  );
}
