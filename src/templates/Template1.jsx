export default function Template1({ cv }) {
  const skills = cv.skills?.filter((s) => s.trim()) ?? [];
  const exp =
    cv.experience?.filter(
      (j) => j.role.trim() || j.company.trim() || j.description.trim()
    ) ?? [];

  const education =
    cv.education?.filter(
      (item) =>
        item.years?.trim() ||
        item.university?.trim() ||
        item.degree?.trim() ||
        item.details?.trim()
    ) ?? [];

  const languages = cv.languages?.filter((l) => l.trim()) ?? [];

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

  const name = (cv.fullName || "Your Name").trim();
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const theme = cv.theme || {};

  const colors = {
    primary: theme.primary || "#183b5b",
    secondary: theme.secondary || "#6b7280",
    accent: theme.accent || "#214d74",
    bg: theme.bg || "#f4f4f4",
    card: theme.card || "#ffffff",
    text: theme.text || "#1f2937",
    sidebarText: "#ffffff",
    line: "#9bb2c3",
  };

  const profileText =
    cv.summary ||
    "Motivated professional with strong communication, leadership, and problem-solving abilities. Experienced in managing responsibilities efficiently and contributing effectively to team success.";

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

  const fallbackLanguages = [
    "English (Fluent)",
    "French (Fluent)",
    "German (Basics)",
    "Spanish (Intermediate)",
  ];

  const fallbackReferences = [
    {
      name: "Estelle Darcy",
      role: "CTO",
      company: "Wardiere Inc.",
      phone: "123-456-7890",
      email: "hello@reallygreatsite.com",
    },
    {
      name: "Harper Richard",
      role: "CEO",
      company: "Wardiere Inc.",
      phone: "123-456-7890",
      email: "hello@reallygreatsite.com",
    },
  ];

  const splitName = (fullName) => {
    const parts = fullName.split(" ").filter(Boolean);
    if (parts.length === 0) {
      return { first: "YOUR", last: "NAME" };
    }
    if (parts.length === 1) {
      return { first: parts[0].toUpperCase(), last: "" };
    }
    return {
      first: parts.slice(0, -1).join(" ").toUpperCase(),
      last: parts.slice(-1).join(" ").toUpperCase(),
    };
  };

  const normalizeLines = (text) => {
    if (!text) return [];
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter(Boolean)
      .map((line) => line.replace(/^•\s*/, ""));
  };

  const { first, last } = splitName(name);

  return (
    <div
      className="overflow-hidden border"
      style={{
        backgroundColor: colors.bg,
        color: colors.text,
        borderColor: "#d7dde2",
      }}
    >
      <div className="grid min-h-0 grid-cols-[235px_1fr]">
        <aside
          className="pb-2 pl-8 pr-8 pt-9"
          style={{
            backgroundColor: colors.primary,
            color: colors.sidebarText,
          }}
        >
          <div className="flex justify-center">
            {cv.photoDataUrl ? (
              <img
                src={cv.photoDataUrl}
                alt="profile"
                className="h-28 w-28 rounded-full border-[5px] object-cover"
                style={{ borderColor: "#ffffff" }}
              />
            ) : (
              <div
                className="flex h-28 w-28 items-center justify-center rounded-full border-[5px] text-3xl font-bold"
                style={{
                  borderColor: "#ffffff",
                  color: "#ffffff",
                  backgroundColor: "rgba(255,255,255,0.08)",
                }}
              >
                {initials || "YN"}
              </div>
            )}
          </div>

          <SidebarSection title="CONTACT">
            <div className="space-y-3">
              {contact.phone && <T1ContactRow type="phone" text={contact.phone} />}
              {contact.email && <T1ContactRow type="email" text={contact.email} />}
              {contact.address && <T1ContactRow type="address" text={contact.address} />}
              {contact.website && <T1ContactRow type="website" text={contact.website} />}
              {!contact.phone && !contact.email && !contact.address && !contact.website && (
                <>
                  <T1ContactRow type="phone" text="+123-456-7890" />
                  <T1ContactRow type="email" text="hello@reallygreatsite.com" />
                  <T1ContactRow type="address" text="123 Anywhere St, Any City" />
                  <T1ContactRow type="website" text="www.reallygreatsite.com" />
                </>
              )}
            </div>
          </SidebarSection>

          <SidebarSection title="EDUCATION">
            <div className="space-y-3.5">
              {(education.length ? education : fallbackEducation).map((item, i) => (
                <div key={i}>
                  <div className="text-[12px] font-bold uppercase leading-5">
                    {item.years || "2025 - 2029"}
                  </div>
                  <div className="mt-1 text-[12px] font-bold uppercase leading-5">
                    {item.university || "WARDIERE UNIVERSITY"}
                  </div>

                  <div className="mt-2 space-y-1.5">
                    {[item.degree?.trim(), item.details?.trim()]
                      .filter(Boolean)
                      .map((d, idx) => (
                        <BulletRow
                          key={idx}
                          text={d}
                          light
                          textClassName="text-[12px] leading-[1.55]"
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </SidebarSection>

          <SidebarSection title="SKILLS">
            <div className="space-y-1">
              {(skills.length
                ? skills
                : [
                    "Project Management",
                    "Public Relations",
                    "Teamwork",
                    "Time Management",
                    "Leadership",
                    "Effective Communication",
                    "Critical Thinking",
                  ]
              ).map((skill, i) => (
                <BulletRow
                  key={i}
                  text={skill}
                  light
                  textClassName="text-[12px] leading-[1.55]"
                />
              ))}
            </div>
          </SidebarSection>

          <SidebarSection title="LANGUAGES">
            <div className="space-y-1">
              {(languages.length ? languages : fallbackLanguages).map((lang, i) => (
                <BulletRow
                  key={i}
                  text={lang}
                  light
                  textClassName="text-[12px] leading-[1.55]"
                />
              ))}
            </div>
          </SidebarSection>

          {(cv.coreCompetencies ?? []).filter((c) => c.trim()).length > 0 && (
            <SidebarSection title="CORE COMPETENCIES">
              <div className="space-y-0.5">
                {(cv.coreCompetencies ?? []).filter((c) => c.trim()).map((comp, i) => (
                  <BulletRow
                    key={i}
                    text={comp}
                    light
                    textClassName="text-[12px] leading-[1.4]"
                  />
                ))}
              </div>
            </SidebarSection>
          )}
        </aside>

        <main className="pb-2 pl-10 pr-10 pt-8">
          <section className="pt-6">
            <h1 className="text-[27px] font-extrabold leading-tight tracking-tight">
              <span style={{ color: "#404040" }}>{first}</span>{" "}
              <span style={{ color: colors.accent }}>{last || ""}</span>
            </h1>

            <div
              className="mt-2 text-[15px] uppercase tracking-[1px]"
              style={{ color: "#666666" }}
            >
              {cv.jobTitle || "MARKETING MANAGER"}
            </div>

            <div
              className="mt-4 h-[3px] w-16"
              style={{ backgroundColor: colors.accent }}
            />
          </section>

          <MainSection title="PROFILE" colors={colors}>
            <p
              className="text-[13px] leading-[1.55] text-justify"
              style={{ color: "#4b5563" }}
            >
              {profileText}
            </p>
          </MainSection>

          <MainSection title="WORK EXPERIENCE" colors={colors}>
            <div className="relative pl-6">
              <div
                className="absolute bottom-2 left-[6px] top-2 w-[2px]"
                style={{ backgroundColor: colors.line }}
              />

              <div className="space-y-3">
                {(exp.length
                  ? exp
                  : [
                      {
                        role: "Marketing Manager & Specialist",
                        company: "Borcelle Studio",
                        start: "2030",
                        end: "PRESENT",
                        description:
                          "• Develop and execute comprehensive marketing strategies and campaigns that align with the company’s goals and objectives.\n• Lead, mentor, and manage a high-performing marketing team.\n• Monitor brand consistency across marketing channels and materials.",
                      },
                      {
                        role: "Marketing Manager & Specialist",
                        company: "Fauget Studio",
                        start: "2025",
                        end: "2029",
                        description:
                          "• Create and manage the marketing budget.\n• Oversee market research to identify trends and competitor strategies.\n• Monitor brand consistency across marketing channels and materials.",
                      },
                      {
                        role: "Marketing Manager & Specialist",
                        company: "Studio Shodwe",
                        start: "2024",
                        end: "2025",
                        description:
                          "• Develop and maintain strong relationships with partners and vendors.\n• Monitor and maintain brand consistency across all marketing channels and materials.",
                      },
                    ]
                ).map((job, i) => (
                  <div key={i} className="relative">
                    <div
                      className="absolute -left-[23px] top-[8px] h-[10px] w-[10px] rounded-full"
                      style={{ backgroundColor: colors.accent }}
                    />

                    <div className="flex items-start justify-between gap-4">
                      <div className="min-w-0">
                        <div
                          className="text-[17px] font-semibold leading-tight"
                          style={{ color: "#444444" }}
                        >
                          {job.company || "Company"}
                        </div>
                        <div
                          className="mt-1 text-[14px] leading-tight"
                          style={{ color: "#666666" }}
                        >
                          {job.role || "Role"}
                        </div>
                      </div>

                      <div
                        className="shrink-0 pt-[2px] text-[13px]"
                        style={{ color: "#666666" }}
                      >
                        {(job.start || "Start")} - {(job.end || "End")}
                      </div>
                    </div>

                    {job.description && (
                      <div className="mt-1 space-y-1">
                        {normalizeLines(job.description).map((line, idx) => (
                          <BulletRow
                            key={idx}
                            text={line}
                            light={false}
                            textClassName="text-[13px] leading-[1.45]"
                            textColor="#4b5563"
                            bulletColor="#4b5563"
                            bulletTop="9px"
                            bulletSize={4}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </MainSection>

          {extracurricular.length > 0 && (
            <MainSection title="EXTRACURRICULAR ACTIVITIES" colors={colors}>
              <div className="relative pl-6">
                <div
                  className="absolute bottom-2 left-[6px] top-2 w-[2px]"
                  style={{ backgroundColor: colors.line }}
                />

                <div className="space-y-4.5">
                  {extracurricular.map((item, i) => (
                    <div key={i} className="relative">
                      <div
                        className="absolute -left-[23px] top-[8px] h-[10px] w-[10px] rounded-full"
                        style={{ backgroundColor: colors.accent }}
                      />

                      <div className="flex items-start justify-between gap-4">
                        <div className="min-w-0">
                          <div
                            className="text-[17px] font-semibold leading-tight"
                            style={{ color: "#444444" }}
                          >
                            {item.activity}
                          </div>
                          <div
                            className="mt-1 text-[14px] leading-tight"
                            style={{ color: "#666666" }}
                          >
                            {[item.role, item.organization].filter(Boolean).join(" at ")}
                          </div>
                        </div>

                        {item.year && (
                          <div
                            className="shrink-0 pt-[2px] text-[13px]"
                            style={{ color: "#666666" }}
                          >
                            {item.year}
                          </div>
                        )}
                      </div>

                      {item.description && (
                        <div className="mt-4 space-y-1.5">
                          {normalizeLines(item.description).map((line, idx) => (
                            <BulletRow
                              key={idx}
                              text={line}
                              light={false}
                              textClassName="text-[13px] leading-[1.9]"
                              textColor="#4b5563"
                              bulletColor="#4b5563"
                              bulletTop="9px"
                              bulletSize={4}
                            />
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </MainSection>
          )}

          <MainSection title="REFERENCE" colors={colors}>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2">
              {(references.length ? references : fallbackReferences).map((ref, i) => (
                <div key={i}>
                  <div
                    className="text-[17px] font-semibold leading-tight"
                    style={{ color: "#444444" }}
                  >
                    {ref.name || "Reference Name"}
                  </div>
                  <div
                    className="mt-1 text-[14px]"
                    style={{ color: "#666666" }}
                  >
                    {ref.role || "Role"}
                  </div>
                  {(ref.company) && (
                    <div
                      className="mt-0.5 text-[13px]"
                      style={{ color: "#888888" }}
                    >
                      {ref.company}
                    </div>
                  )}

                  <div
                    className="mt-0.5 text-[13px] leading-[1.5]"
                    style={{ color: "#4b5563" }}
                  >
                    <div>Phone: {ref.phone || "123-456-7890"}</div>
                    <div>Email: {ref.email || "hello@reallygreatsite.com"}</div>
                  </div>
                </div>
              ))}
            </div>
          </MainSection>
        </main>
      </div>
    </div>
  );
}

function SidebarSection({ title, children }) {
  return (
    <section className="mt-6">
      <div className="text-[14px] font-extrabold tracking-[2.5px]">{title}</div>
      <div
        className="mb-2 mt-2 h-[2px] w-full"
        style={{ backgroundColor: "rgba(255,255,255,0.45)" }}
      />
      <div style={{ color: "rgba(255,255,255,0.95)" }}>{children}</div>
    </section>
  );
}

function SidebarList({ items }) {
  return (
    <ul className="space-y-3 text-[12px] leading-[1.6]">
      {items.map((item, i) => (
        <li key={i} className="break-words">
          {item}
        </li>
      ))}
    </ul>
  );
}

function MainSection({ title, colors, children }) {
  return (
    <section className="mt-5">
      <div
        className="text-[15px] font-extrabold tracking-[3px]"
        style={{ color: colors.primary }}
      >
        {title}
      </div>
      <div
        className="mb-2 mt-2 h-[1.5px] w-full"
        style={{ backgroundColor: "#8ca3b8" }}
      />
      {children}
    </section>
  );
}

function BulletRow({
  text,
  light = false,
  textClassName = "text-xs leading-5",
  textColor,
  bulletColor,
  bulletTop = "8px",
  bulletSize = 4,
}) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="inline-block shrink-0 rounded-full"
        style={{
          marginTop: bulletTop,
          width: `${bulletSize}px`,
          height: `${bulletSize}px`,
          backgroundColor:
            bulletColor || (light ? "rgba(255,255,255,0.95)" : "#374151"),
        }}
      />
      <span
        className={`break-words ${textClassName}`}
        style={{
          color: textColor || (light ? "rgba(255,255,255,0.95)" : "#374151"),
          textAlign: "justify",
        }}
      >
        {text}
      </span>
    </div>
  );
}

function T1ContactRow({ type, text }) {
  return (
    <div className="flex items-start gap-2.5">
      <span
        className="flex shrink-0 items-center justify-center"
        style={{
          color: "rgba(255,255,255,0.85)",
          width: "14px",
          height: "14px",
          marginTop: "3px",
        }}
      >
        {type === "phone" && <T1PhoneIcon />}
        {type === "email" && <T1MailIcon />}
        {type === "address" && <T1LocationIcon />}
        {type === "website" && <T1WebIcon />}
      </span>
      <span
        className="min-w-0 break-words"
        style={{
          fontSize: "12px",
          lineHeight: 1.55,
          color: "rgba(255,255,255,0.95)",
          wordBreak: "break-word",
          overflowWrap: "anywhere",
        }}
      >
        {text}
      </span>
    </div>
  );
}

function T1PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20a1 1 0 0 1-1 1C10.3 21 3 13.7 3 4a1 1 0 0 1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z" />
    </svg>
  );
}

function T1MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm0 2v.51l9 6 9-6V7H3Zm18 2.49-8.43 5.62a1 1 0 0 1-1.14 0L3 9.49V18h18V9.49Z" />
    </svg>
  );
}

function T1LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M12 2a7 7 0 0 1 7 7c0 4.97-5.05 11.17-6.27 12.6a1 1 0 0 1-1.46 0C10.05 20.17 5 13.97 5 9a7 7 0 0 1 7-7Zm0 9.5A2.5 2.5 0 1 0 12 6.5a2.5 2.5 0 0 0 0 5Z" />
    </svg>
  );
}

function T1WebIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" aria-hidden="true">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 9h-3.05a15.7 15.7 0 0 0-1.38-5.03A8.03 8.03 0 0 1 18.93 11ZM12 4.06c.8.97 1.9 3.2 2.36 6.94H9.64C10.1 7.26 11.2 5.03 12 4.06ZM9.5 5.97A15.7 15.7 0 0 0 8.12 11H5.07A8.03 8.03 0 0 1 9.5 5.97ZM5.07 13h3.05a15.7 15.7 0 0 0 1.38 5.03A8.03 8.03 0 0 1 5.07 13Zm4.57 0h4.72c-.46 3.74-1.56 5.97-2.36 6.94-.8-.97-1.9-3.2-2.36-6.94Zm4.86 5.03A15.7 15.7 0 0 0 15.88 13h3.05a8.03 8.03 0 0 1-4.43 5.03Z" />
    </svg>
  );
}