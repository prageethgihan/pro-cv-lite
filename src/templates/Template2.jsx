export default function Template2({ cv }) {
  const skills = cv.skills?.filter((s) => s?.trim()) ?? [];

  const exp =
    cv.experience?.filter(
      (j) => j.role?.trim() || j.company?.trim() || j.description?.trim()
    ) ?? [];

  const education =
    cv.education?.filter(
      (item) =>
        item.years?.trim() ||
        item.university?.trim() ||
        item.degree?.trim() ||
        item.details?.trim()
    ) ?? [];

  const languages = cv.languages?.filter((l) => l?.trim()) ?? [];

  const references =
    cv.references?.filter(
      (r) =>
        r.name?.trim() || r.role?.trim() || r.company?.trim() || r.phone?.trim() || r.email?.trim()
    ) ?? [];

  const extracurricular =
    cv.extracurricular?.filter(
      (item) =>
        item.activity?.trim() ||
        item.organization?.trim() ||
        item.role?.trim() ||
        item.year?.trim() ||
        item.description?.trim()
    ) ?? [];

  const contact = {
    phone: cv.contact?.phone?.trim(),
    email: cv.contact?.email?.trim(),
    address: cv.contact?.address?.trim(),
    website: cv.contact?.website?.trim(),
  };

  const name = (cv.fullName || "MICHAIL WILSON").trim();

  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const theme = cv.theme || {};

  // Derive colors from theme.primary so the template responds to both Auto and Manual theme changes.
  const buildColors = (primaryHex) => {
    // Parse the primary hex into r,g,b components
    const hex = (primaryHex || "#3f4a5f").replace("#", "");
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Convert to HSL
    const rn = r / 255, gn = g / 255, bn = b / 255;
    const max = Math.max(rn, gn, bn), min = Math.min(rn, gn, bn);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      if (max === rn) h = ((gn - bn) / d + (gn < bn ? 6 : 0)) / 6;
      else if (max === gn) h = ((bn - rn) / d + 2) / 6;
      else h = ((rn - gn) / d + 4) / 6;
    }
    const hDeg = Math.round(h * 360);
    const sPct = Math.round(s * 100);
    const lPct = Math.round(l * 100);

    // Helper: HSL → hex
    const hslToHex = (hh, ss, ll) => {
      const s2 = ss / 100, l2 = ll / 100;
      const a = s2 * Math.min(l2, 1 - l2);
      const f = (n) => {
        const k = (n + hh / 30) % 12;
        const color = l2 - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
        return Math.round(255 * color).toString(16).padStart(2, "0");
      };
      return `#${f(0)}${f(8)}${f(4)}`;
    };

    // The banner/header dark color — same hue, desaturated a bit, dark lightness
    const dark  = hslToHex(hDeg, Math.max(sPct - 10, 10), Math.min(lPct, 32));
    const dark2 = hslToHex(hDeg, Math.max(sPct - 12, 10), Math.min(lPct + 2, 34));

    // Sidebar — same hue, very light, low-saturation tint
    const sidebarL = Math.min(92, Math.max(86, 100 - lPct * 0.18));
    const sidebarS = Math.min(sPct * 0.35, 22);
    const sidebar  = hslToHex(hDeg, Math.round(sidebarS), Math.round(sidebarL));

    // Line / divider — midtone of sidebar and dark
    const lineL = Math.round((sidebarL + lPct) / 2);
    const line  = hslToHex(hDeg, Math.round(sidebarS + 10), lineL);

    // Bullet / dot-on — slightly darker than dark2
    const bullet = hslToHex(hDeg, Math.max(sPct - 8, 12), Math.min(lPct + 5, 38));

    return {
      dark,
      dark2,
      sidebar,
      page: "#f4f4f4",
      text: "#404654",
      muted: "#68707c",
      line,
      bullet,
      white: "#ffffff",
      dotOn: bullet,
      dotOff: "#8c8c8c",
      photoRing: dark,
    };
  };

  const colors = buildColors(theme.primary);

  const profileText =
    cv.summary ||
    "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation. Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam quis nostrud exercitation.";

  const fallbackEducation = [
    {
      years: "2029 - 2030",
      university: "WARDIERE UNIVERSITY",
      degree: "Master of Business Management",
      details: "",
    },
    {
      years: "2025 - 2029",
      university: "WARDIERE UNIVERSITY",
      degree: "Bachelor of Business",
      details: "GPA: 3.8 / 4.0",
    },
  ];

  const fallbackSkills = [
    "Project Management",
    "Public Relations",
    "Teamwork",
    "Time Management",
    "Leadership",
    "Effective Communication",
    "Critical Thinking",
  ];

  const fallbackLanguages = ["English", "French", "German", "Spanish"];

  const fallbackReferences = [
    {
      name: "Estelle Darcy",
      role: "CTO",
      company: "Wardiere Inc.",
      phone: "123-456-7890",
      email: "hello@reallygreatsite.com",
    },
    {
      name: "Harper Russo",
      role: "CEO",
      company: "Wardiere Inc.",
      phone: "123-456-7890",
      email: "hello@reallygreatsite.com",
    },
  ];

  const fallbackExperience = [
    {
      role: "UI and Product Designer",
      company: "Borcelle Studio",
      start: "2030",
      end: "PRESENT",
      description:
        "• Develop and execute comprehensive marketing strategies and campaigns that align with the company’s goals and objectives.\n• Lead, mentor, and manage a high-performing marketing team, fostering a collaborative and results-driven work environment.\n• Monitor brand consistency across marketing channels and materials.",
    },
    {
      role: "UX Design Lead",
      company: "Fauget Studio",
      start: "2025",
      end: "2029",
      description:
        "• Create and manage the marketing budget, ensuring efficient allocation of resources and optimizing ROI.\n• Oversee market research to identify emerging trends, customer needs, and competitor strategies.\n• Monitor brand consistency across marketing channels and materials.",
    },
    {
      role: "Marketing Designer",
      company: "Studio Shodwe",
      start: "2024",
      end: "2025",
      description:
        "• Develop and maintain strong relationships with partners, agencies, and vendors to support marketing initiatives.\n• Monitor and maintain brand consistency across all marketing channels and materials.",
    },
  ];

  const educationToRender = education.length ? education : fallbackEducation;
  const skillsToRender = skills.length ? skills : fallbackSkills;
  const languagesToRender = languages.length ? languages : fallbackLanguages;
  const referencesToRender = references.length ? references : fallbackReferences;
  const experienceToRender = exp.length ? exp : fallbackExperience;

  const splitName = (fullName) => {
    const parts = fullName.split(" ").filter(Boolean);
    if (parts.length === 0) return ["MICHAIL WILSON"];
    return [parts.join(" ").toUpperCase()];
  };

  const nameLines = splitName(name);

  const normalizeLines = (text) => {
    if (!text) return [];
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^•\s*/, ""));
  };

  const languageDots = (lang) => {
    const lower = (lang || "").toLowerCase();

    if (lower.includes("english")) return 5;
    if (lower.includes("french")) return 4;
    if (lower.includes("german")) return 3;
    if (lower.includes("spanish")) return 2;
    if (lower.includes("sinhala")) return 5;

    return 3;
  };

  return (
    <div
      className="border"
      style={{
        backgroundColor: colors.page,
        color: colors.text,
        borderColor: "#dfe3e8",
      }}
    >
      <div className="grid min-h-[980px] grid-cols-[230px_1fr]">
        {/* LEFT SIDEBAR */}
        <aside
          className="px-10 py-7"
          style={{ backgroundColor: colors.sidebar }}
        >
          <div className="flex justify-center">
            {cv.photoDataUrl ? (
              <div
                className="rounded-full"
                style={{
                  border: `2px solid ${colors.photoRing}`,
                  padding: "6px",
                  lineHeight: 0,
                }}
              >
                <img
                  src={cv.photoDataUrl}
                  alt="profile"
                  className="h-[120px] w-[120px] rounded-full object-cover"
                  style={{ display: "block" }}
                />
              </div>
            ) : (
              <div
                className="rounded-full"
                style={{
                  border: `2px solid ${colors.photoRing}`,
                  padding: "6px",
                  lineHeight: 0,
                }}
              >
                <div
                  className="flex h-[120px] w-[120px] items-center justify-center rounded-full text-4xl font-bold"
                  style={{
                    backgroundColor: colors.dark2,
                    color: colors.white,
                  }}
                >
                  {initials || "YN"}
                </div>
              </div>
            )}
          </div>

          <SidebarSection title="CONTACT" colors={colors}>
            <div className="space-y-3">
              {contact.phone && <ContactRow type="phone" text={contact.phone} colors={colors} />}
              {contact.email && <ContactRow type="email" text={contact.email} colors={colors} />}
              {contact.address && <ContactRow type="address" text={contact.address} colors={colors} />}
              {contact.website && <ContactRow type="website" text={contact.website} colors={colors} />}
              {!contact.phone && !contact.email && !contact.address && !contact.website && (
                <>
                  <ContactRow type="phone" text="+123-456-7890" colors={colors} />
                  <ContactRow type="email" text="hello@reallygreatsite.com" colors={colors} />
                  <ContactRow type="address" text="123 Anywhere St., Any City" colors={colors} />
                  <ContactRow type="website" text="www.reallygreatsite.com" colors={colors} />
                </>
              )}
            </div>
          </SidebarSection>

          <SidebarSection title="EDUCATION" colors={colors}>
            <div className="space-y-7">
              {educationToRender.map((item, i) => (
                <div key={i}>
                  <div className="text-[12px] font-extrabold tracking-[1px] text-[#56606e]">
                    {item.years || "2029 - 2030"}
                  </div>

                  <div className="mt-2 text-[12px] font-extrabold uppercase leading-[1.35] text-[#56606e]">
                    {item.university || "WARDIERE UNIVERSITY"}
                  </div>

                  <div className="mt-2 space-y-1.5">
                    {[item.degree?.trim(), item.details?.trim()]
                      .filter(Boolean)
                      .map((line, idx) => (
                        <BulletLine key={idx} text={line} />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection title="SKILLS" colors={colors}>
            <div className="space-y-2">
              {skillsToRender.map((skill, i) => (
                <BulletLine key={i} text={skill} />
              ))}
            </div>
          </SidebarSection>

          <SidebarSection title="LANGUAGES" colors={colors}>
            <div className="space-y-2.5">
              {languagesToRender.map((lang, i) => (
                <div
                  key={i}
                  className="grid grid-cols-[1fr_auto] items-center gap-3"
                >
                  <div className="flex items-start gap-2">
                    <span
                      className="mt-[7px] inline-block h-[4px] w-[4px] rounded-full"
                      style={{ backgroundColor: colors.bullet }}
                    />
                    <span className="text-[12px] leading-[1.45] text-[#56606e]">
                      {lang}
                    </span>
                  </div>

                  <div className="flex gap-[4px]">
                    {Array.from({ length: 5 }).map((_, idx) => (
                      <span
                        key={idx}
                        className="inline-block h-[8px] w-[8px] rounded-full"
                        style={{
                          backgroundColor:
                            idx < languageDots(lang)
                              ? colors.dotOn
                              : colors.dotOff,
                        }}
                      />
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </SidebarSection>

          {(cv.coreCompetencies ?? []).filter((c) => c.trim()).length > 0 && (
            <SidebarSection title="CORE COMPETENCIES" colors={colors}>
              <div className="space-y-2">
                {(cv.coreCompetencies ?? []).filter((c) => c.trim()).map((comp, i) => (
                  <BulletLine key={i} text={comp} />
                ))}
              </div>
            </SidebarSection>
          )}
        </aside>

        {/* RIGHT SIDE */}
        <main className="px-8 py-7 min-w-0">
          {/* TOP BANNER */}
          <div
            className="px-8 py-8"
            style={{ backgroundColor: colors.dark2 }}
          >
            <div
              className="mx-auto max-w-[510px] border px-6 py-8 text-center"
              style={{ borderColor: "rgba(255,255,255,0.72)" }}
            >
              <div className="text-[24px] font-extrabold tracking-[5px] text-white break-words">
                {nameLines.map((line, i) => (
                  <div key={i}>{line}</div>
                ))}
              </div>

              <div className="mt-6 flex items-center justify-center gap-4">
                <div
                  className="h-[2px] w-[40px] shrink-0 sm:w-[60px]"
                  style={{ backgroundColor: "rgba(255,255,255,0.72)" }}
                />
                <div className="text-[12px] font-bold uppercase tracking-[4px] text-white break-words text-center">
                  {cv.jobTitle || "UI/UX DESIGNER"}
                </div>
                <div
                  className="h-[2px] w-[40px] shrink-0 sm:w-[60px]"
                  style={{ backgroundColor: "rgba(255,255,255,0.72)" }}
                />
              </div>
            </div>
          </div>

          <RightSection title="PROFILE" colors={colors}>
            <p className="text-[13px] leading-[1.62] text-[#4f5763] text-justify">
              {profileText}
            </p>
          </RightSection>

          <RightSection title="WORK EXPERIENCE" colors={colors}>
            <div className="relative pl-6">
              <div
                className="absolute bottom-1 left-[6px] top-1 w-[1.5px]"
                style={{ backgroundColor: colors.line }}
              />

              <div className="space-y-7">
                {experienceToRender.map((job, i) => (
                  <div key={i} className="relative">
                    <div
                      className="absolute -left-[23px] top-[8px] h-[7px] w-[7px] border"
                      style={{
                        borderColor: colors.line,
                        backgroundColor: colors.page,
                      }}
                    />

                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div className="text-[13px] font-extrabold leading-tight text-[#374151]">
                          {job.company || "Borcelle Studio"}
                        </div>
                        <div className="mt-1 text-[12px] leading-tight text-[#5f6773]">
                          {job.role || "UI and Product Designer"}
                        </div>
                      </div>

                      <div className="shrink-0 pt-[1px] text-[12px] text-[#6f7681]">
                        {(job.start || "2030")} - {(job.end || "PRESENT")}
                      </div>
                    </div>

                    <div className="mt-3 space-y-1.5">
                      {normalizeLines(job.description).map((line, idx) => (
                        <BulletLine key={idx} text={line} main />
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </RightSection>

          {extracurricular.length > 0 && (
            <RightSection title="EXTRACURRICULAR ACTIVITIES" colors={colors}>
              <div className="relative pl-6">
                <div
                  className="absolute bottom-1 left-[6px] top-1 w-[1.5px]"
                  style={{ backgroundColor: colors.line }}
                />

                <div className="space-y-7">
                  {extracurricular.map((item, i) => (
                    <div key={i} className="relative">
                      <div
                        className="absolute -left-[23px] top-[8px] h-[7px] w-[7px] border"
                        style={{
                          borderColor: colors.line,
                          backgroundColor: colors.page,
                        }}
                      />

                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div className="text-[13px] font-extrabold leading-tight text-[#374151]">
                            {item.activity}
                          </div>
                          <div className="mt-1 text-[12px] leading-tight text-[#5f6773]">
                            {[item.role, item.organization].filter(Boolean).join(" at ")}
                          </div>
                        </div>

                        {item.year && (
                          <div className="shrink-0 pt-[1px] text-[12px] text-[#6f7681]">
                            {item.year}
                          </div>
                        )}
                      </div>

                      {item.description && (
                        <div className="mt-3 space-y-1.5">
                          {normalizeLines(item.description).map((line, idx) => (
                            <BulletLine key={idx} text={line} main />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </RightSection>
          )}

          <RightSection title="REFERENCE" colors={colors}>
            <div className="grid grid-cols-2 gap-10">
              {referencesToRender.map((ref, i) => (
                <div key={i}>
                  <div className="text-[12px] font-extrabold text-[#374151]">
                    {ref.name || "Reference Name"}
                  </div>

                  <div className="mt-1 text-[12px] text-[#5f6773]">
                    {ref.role || "Role"}
                  </div>

                  {ref.company && (
                    <div className="mt-0.5 text-[11px] text-[#8a8f96]">
                      {ref.company}
                    </div>
                  )}

                  <div className="mt-1 text-[12px] leading-[1.6] text-[#4f5763]">
                    <div>Phone: {ref.phone || "123-456-7890"}</div>
                    <div>Email: {ref.email || "hello@reallygreatsite.com"}</div>
                  </div>
                </div>
              ))}
            </div>
          </RightSection>
        </main>
      </div>
    </div>
  );
}

function SidebarSection({ title, colors, children }) {
  return (
    <section className="mt-12">
      <div
        className="text-[12px] font-semibold tracking-[6px]"
        style={{ color: colors.dark2 }}
      >
        {title}
      </div>
      <div
        className="mb-4 mt-2 h-[1.5px] w-full"
        style={{ backgroundColor: colors.line }}
      />
      {children}
    </section>
  );
}

function RightSection({ title, colors, children }) {
  return (
    <section className="mt-14">
      <div
        className="text-[12px] font-semibold tracking-[6px]"
        style={{ color: colors.dark2 }}
      >
        {title}
      </div>
      <div
        className="mb-4 mt-2 h-[1.5px] w-full"
        style={{ backgroundColor: colors.line }}
      />
      {children}
    </section>
  );
}

function ContactRow({ type, text, colors = {} }) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="flex shrink-0 items-center justify-center"
        style={{
          color: colors.dark || "#3f4a5f",
          width: "14px",
          height: "14px",
          marginTop: "3px",
        }}
      >
        {type === "phone" && <PhoneIcon />}
        {type === "email" && <MailIcon />}
        {type === "address" && <LocationIcon />}
        {type === "website" && <WebIcon />}
      </span>

      <span
        className="min-w-0 break-words text-[#56606e]"
        style={{
          fontSize: "11px",
          lineHeight: 1.45,
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {text}
      </span>
    </div>
  );
}

function BulletLine({ text, main = false }) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="inline-block rounded-full"
        style={{
          width: "4px",
          height: "4px",
          marginTop: main ? "8px" : "7px",
          backgroundColor: "#4b5563",
          flexShrink: 0,
        }}
      />
      <span
        className="break-words"
        style={{
          fontSize: main ? "13px" : "12px",
          lineHeight: main ? 1.58 : 1.52,
          color: main ? "#4f5763" : "#56606e",
          textAlign: "justify",
        }}
      >
        {text}
      </span>
    </div>
  );
}

function PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20a1 1 0 0 1-1 1C10.3 21 3 13.7 3 4a1 1 0 0 1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z" />
    </svg>
  );
}

function MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm0 2v.51l9 6 9-6V7H3Zm18 2.49-8.43 5.62a1 1 0 0 1-1.14 0L3 9.49V18h18V9.49Z" />
    </svg>
  );
}

function LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M12 2a7 7 0 0 1 7 7c0 4.97-5.05 11.17-6.27 12.6a1 1 0 0 1-1.46 0C10.05 20.17 5 13.97 5 9a7 7 0 0 1 7-7Zm0 9.5A2.5 2.5 0 1 0 12 6.5a2.5 2.5 0 0 0 0 5Z" />
    </svg>
  );
}

function WebIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 9h-3.05a15.7 15.7 0 0 0-1.38-5.03A8.03 8.03 0 0 1 18.93 11ZM12 4.06c.8.97 1.9 3.2 2.36 6.94H9.64C10.1 7.26 11.2 5.03 12 4.06ZM9.5 5.97A15.7 15.7 0 0 0 8.12 11H5.07A8.03 8.03 0 0 1 9.5 5.97ZM5.07 13h3.05a15.7 15.7 0 0 0 1.38 5.03A8.03 8.03 0 0 1 5.07 13Zm4.57 0h4.72c-.46 3.74-1.56 5.97-2.36 6.94-.8-.97-1.9-3.2-2.36-6.94Zm4.86 5.03A15.7 15.7 0 0 0 15.88 13h3.05a8.03 8.03 0 0 1-4.43 5.03Z" />
    </svg>
  );
}