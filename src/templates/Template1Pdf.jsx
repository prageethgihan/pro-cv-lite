export default function Template1Pdf({ cv }) {
  const skills = cv.skills?.filter((s) => s.trim()) ?? [];

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

  const contactItems = [
    cv.contact?.phone?.trim(),
    cv.contact?.email?.trim(),
    cv.contact?.address?.trim(),
    cv.contact?.website?.trim(),
  ].filter(Boolean);

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
    bg: "#f7f7f7",
    card: "#ffffff",
    text: theme.text || "#1f2937",
    sidebarText: "#ffffff",
    line: "#9bb2c3",
    headingDark: "#404040",
    bodyText: "#4b5563",
    subtleText: "#666666",
    border: "#d7dde2",
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

  const fallbackExperience = [
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

  const educationToRender = education.length ? education : fallbackEducation;
  const skillsToRender = skills.length
    ? skills
    : [
        "Project Management",
        "Public Relations",
        "Teamwork",
        "Time Management",
        "Leadership",
        "Effective Communication",
        "Critical Thinking",
      ];
  const languagesToRender = languages.length ? languages : fallbackLanguages;
  const referencesToRender = references.length ? references : fallbackReferences;
  const experienceToRender = exp.length ? exp : fallbackExperience;

  return (
    <div
      style={{
        width: "100%",
        background: colors.bg,
        color: colors.text,
        border: `1px solid ${colors.border}`,
        overflow: "hidden",
        boxSizing: "border-box",
        fontFamily:
          'Arial, Helvetica, ui-sans-serif, system-ui, -apple-system, "Segoe UI", sans-serif',
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "235px 1fr",
          minHeight: "0",
        }}
      >
        <aside
          style={{
            background: colors.primary,
            color: colors.sidebarText,
            padding: "24px 28px 8px 28px",
            boxSizing: "border-box",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "center",
            }}
          >
            {cv.photoDataUrl ? (
              <img
                src={cv.photoDataUrl}
                alt="profile"
                style={{
                  width: "112px",
                  height: "112px",
                  borderRadius: "9999px",
                  border: "5px solid #ffffff",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "112px",
                  height: "112px",
                  borderRadius: "9999px",
                  border: "5px solid #ffffff",
                  background: "rgba(255,255,255,0.08)",
                  color: "#ffffff",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "30px",
                  fontWeight: 700,
                  boxSizing: "border-box",
                }}
              >
                {initials || "YN"}
              </div>
            )}
          </div>

          <PdfSidebarSection title="CONTACT">
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {cv.contact?.phone?.trim() && (
                <PdfContactRow icon={<T1PhoneIcon />} text={cv.contact.phone.trim()} />
              )}
              {cv.contact?.email?.trim() && (
                <PdfContactRow icon={<T1MailIcon />} text={cv.contact.email.trim()} />
              )}
              {cv.contact?.address?.trim() && (
                <PdfContactRow icon={<T1LocationIcon />} text={cv.contact.address.trim()} />
              )}
              {cv.contact?.website?.trim() && (
                <PdfContactRow icon={<T1WebIcon />} text={cv.contact.website.trim()} />
              )}
              {!cv.contact?.phone?.trim() && !cv.contact?.email?.trim() && !cv.contact?.address?.trim() && !cv.contact?.website?.trim() && (
                <>
                  <PdfContactRow icon={<T1PhoneIcon />} text="+123-456-7890" />
                  <PdfContactRow icon={<T1MailIcon />} text="hello@reallygreatsite.com" />
                  <PdfContactRow icon={<T1LocationIcon />} text="123 Anywhere St, Any City" />
                  <PdfContactRow icon={<T1WebIcon />} text="www.reallygreatsite.com" />
                </>
              )}
            </div>
          </PdfSidebarSection>

          <PdfSidebarSection title="EDUCATION">
            <div>
              {educationToRender.map((item, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: i === educationToRender.length - 1 ? 0 : "12px",
                  }}
                >
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      lineHeight: 1.5,
                      textTransform: "uppercase",
                    }}
                  >
                    {item.years || "2025 - 2029"}
                  </div>

                  <div
                    style={{
                      marginTop: "4px",
                      fontSize: "12px",
                      fontWeight: 700,
                      lineHeight: 1.5,
                      textTransform: "uppercase",
                    }}
                  >
                    {item.university || "WARDIERE UNIVERSITY"}
                  </div>

                  <div style={{ marginTop: "8px" }}>
                    {[item.degree?.trim(), item.details?.trim()]
                      .filter(Boolean)
                      .map((d, idx) => (
                        <PdfBulletRow
                          key={idx}
                          text={d}
                          light
                          fontSize="12px"
                          lineHeight={1.4}
                          marginBottom="2px"
                        />
                      ))}
                  </div>
                </div>
              ))}
            </div>
          </PdfSidebarSection>

          <PdfSidebarSection title="SKILLS">
            <div>
              {skillsToRender.map((skill, i) => (
                <PdfBulletRow
                  key={i}
                  text={skill}
                  light
                  fontSize="12px"
                  lineHeight={1.4}
                  marginBottom="2px"
                />
              ))}
            </div>
          </PdfSidebarSection>

          <PdfSidebarSection title="LANGUAGES">
            <div>
              {languagesToRender.map((lang, i) => (
                <PdfBulletRow
                  key={i}
                  text={lang}
                  light
                  fontSize="12px"
                  lineHeight={1.4}
                  marginBottom="2px"
                />
              ))}
            </div>
          </PdfSidebarSection>

          {(cv.coreCompetencies ?? []).filter((c) => c.trim()).length > 0 && (
            <PdfSidebarSection title="CORE COMPETENCIES">
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {(cv.coreCompetencies ?? []).filter((c) => c.trim()).map((comp, i) => (
                  <PdfBulletRow
                    key={i}
                    text={comp}
                    light
                    fontSize="12px"
                    lineHeight={1.4}
                    marginBottom="2px"
                  />
                ))}
              </div>
            </PdfSidebarSection>
          )}
        </aside>

        <main
          style={{
            padding: "24px 40px 8px 40px",
            boxSizing: "border-box",
            background: "#ffffff",
          }}
        >
          <section style={{ paddingTop: "22px" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "27px",
                fontWeight: 800,
                lineHeight: 1.15,
                letterSpacing: "-0.5px",
              }}
            >
              <span style={{ color: "#404040" }}>{first}</span>{" "}
              <span style={{ color: colors.accent }}>{last || ""}</span>
            </h1>

            <div
              style={{
                marginTop: "8px",
                fontSize: "15px",
                textTransform: "uppercase",
                letterSpacing: "1px",
                color: "#666666",
              }}
            >
              {cv.jobTitle || "MARKETING MANAGER"}
            </div>

            <div
              style={{
                marginTop: "16px",
                width: "64px",
                height: "3px",
                background: colors.accent,
              }}
            />
          </section>

          <PdfMainSection title="PROFILE" colors={colors}>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                lineHeight: 1.55,
                color: colors.bodyText,
                textAlign: "justify",
              }}
            >
              {profileText}
            </p>
          </PdfMainSection>

          <PdfMainSection title="WORK EXPERIENCE" colors={colors}>
            <div
              style={{
                position: "relative",
                paddingLeft: "24px",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  left: "6px",
                  top: "8px",
                  bottom: "8px",
                  width: "2px",
                  background: colors.line,
                }}
              />

              {experienceToRender.map((job, i) => (
                <div
                  key={i}
                  style={{
                    position: "relative",
                    marginBottom:
                      i === experienceToRender.length - 1 ? 0 : "16px",
                  }}
                >
                  <div
                    style={{
                      position: "absolute",
                      left: "-17px",
                      top: "8px",
                      width: "10px",
                      height: "10px",
                      borderRadius: "9999px",
                      background: colors.accent,
                    }}
                  />

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "16px",
                    }}
                  >
                    <div style={{ minWidth: 0, flex: 1 }}>
                      <div
                        style={{
                          fontSize: "17px",
                          fontWeight: 600,
                          lineHeight: 1.2,
                          color: "#444444",
                        }}
                      >
                        {job.company || "Company"}
                      </div>

                      <div
                        style={{
                          marginTop: "4px",
                          fontSize: "14px",
                          lineHeight: 1.2,
                          color: colors.subtleText,
                        }}
                      >
                        {job.role || "Role"}
                      </div>
                    </div>

                    <div
                      style={{
                        flexShrink: 0,
                        paddingTop: "2px",
                        fontSize: "13px",
                        color: colors.subtleText,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {(job.start || "Start")} - {(job.end || "End")}
                    </div>
                  </div>

                  {job.description && (
                    <div style={{ marginTop: "4px" }}>
                      {normalizeLines(job.description).map((line, idx) => (
                        <PdfBulletRow
                          key={idx}
                          text={line}
                          light={false}
                          fontSize="13px"
                          lineHeight={1.45}
                          marginBottom="2px"
                          textColor={colors.bodyText}
                          bulletColor={colors.bodyText}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </PdfMainSection>

          {extracurricular.length > 0 && (
            <PdfMainSection title="EXTRACURRICULAR ACTIVITIES" colors={colors}>
              <div
                style={{
                  position: "relative",
                  paddingLeft: "24px",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    left: "6px",
                    top: "8px",
                    bottom: "8px",
                    width: "2px",
                    background: colors.line,
                  }}
                />

                {extracurricular.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      marginBottom: i === extracurricular.length - 1 ? 0 : "26px",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        left: "-17px",
                        top: "8px",
                        width: "10px",
                        height: "10px",
                        borderRadius: "9999px",
                        background: colors.accent,
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "16px",
                      }}
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div
                          style={{
                            fontSize: "17px",
                            fontWeight: 600,
                            lineHeight: 1.2,
                            color: "#444444",
                          }}
                        >
                          {item.activity}
                        </div>

                        <div
                          style={{
                            marginTop: "4px",
                            fontSize: "14px",
                            lineHeight: 1.2,
                            color: colors.subtleText,
                          }}
                        >
                          {[item.role, item.organization].filter(Boolean).join(" at ")}
                        </div>
                      </div>

                      {item.year && (
                        <div
                          style={{
                            flexShrink: 0,
                            paddingTop: "2px",
                            fontSize: "13px",
                            color: colors.subtleText,
                            whiteSpace: "nowrap",
                          }}
                        >
                          {item.year}
                        </div>
                      )}
                    </div>

                    {item.description && (
                      <div style={{ marginTop: "14px" }}>
                        {normalizeLines(item.description).map((line, idx) => (
                          <PdfBulletRow
                            key={idx}
                            text={line}
                            light={false}
                            fontSize="13px"
                            lineHeight={1.8}
                            marginBottom="6px"
                            textColor={colors.bodyText}
                            bulletColor={colors.bodyText}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </PdfMainSection>
          )}

          <PdfMainSection title="REFERENCE" colors={colors}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "12px",
              }}
            >
              {referencesToRender.map((ref, i) => (
                <div key={i}>
                  <div
                    style={{
                      fontSize: "17px",
                      fontWeight: 600,
                      lineHeight: 1.2,
                      color: "#444444",
                    }}
                  >
                    {ref.name || "Reference Name"}
                  </div>

                  <div
                    style={{
                      marginTop: "2px",
                      fontSize: "14px",
                      color: colors.subtleText,
                    }}
                  >
                    {ref.role || "Role"}
                  </div>

                  {ref.company && (
                    <div
                      style={{
                        marginTop: "2px",
                        fontSize: "13px",
                        color: "#888888",
                      }}
                    >
                      {ref.company}
                    </div>
                  )}

                  <div
                    style={{
                      marginTop: "2px",
                      fontSize: "13px",
                      lineHeight: 1.5,
                      color: colors.bodyText,
                    }}
                  >
                    <div>Phone: {ref.phone || "123-456-7890"}</div>
                    <div>Email: {ref.email || "hello@reallygreatsite.com"}</div>
                  </div>
                </div>
              ))}
            </div>
          </PdfMainSection>
        </main>
      </div>
    </div>
  );
}

function PdfSidebarSection({ title, children }) {
  return (
    <section style={{ marginTop: "18px" }}>
      <div
        style={{
          fontSize: "14px",
          fontWeight: 800,
          letterSpacing: "2.5px",
        }}
      >
        {title}
      </div>

      <div
        style={{
          width: "100%",
          height: "2px",
          marginTop: "4px",
          marginBottom: "6px",
          background: "rgba(255,255,255,0.45)",
        }}
      />

      <div style={{ color: "rgba(255,255,255,0.95)" }}>{children}</div>
    </section>
  );
}

function PdfContactRow({ icon, text }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "10px" }}>
      <span
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "rgba(255,255,255,0.85)",
          width: "14px",
          height: "14px",
          marginTop: "3px",
          flexShrink: 0,
        }}
      >
        {icon}
      </span>
      <span
        style={{
          fontSize: "12px",
          lineHeight: 1.55,
          color: "rgba(255,255,255,0.95)",
          wordBreak: "break-word",
        }}
      >
        {text}
      </span>
    </div>
  );
}

function T1PhoneIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20a1 1 0 0 1-1 1C10.3 21 3 13.7 3 4a1 1 0 0 1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z" />
    </svg>
  );
}

function T1MailIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm0 2v.51l9 6 9-6V7H3Zm18 2.49-8.43 5.62a1 1 0 0 1-1.14 0L3 9.49V18h18V9.49Z" />
    </svg>
  );
}

function T1LocationIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M12 2a7 7 0 0 1 7 7c0 4.97-5.05 11.17-6.27 12.6a1 1 0 0 1-1.46 0C10.05 20.17 5 13.97 5 9a7 7 0 0 1 7-7Zm0 9.5A2.5 2.5 0 1 0 12 6.5a2.5 2.5 0 0 0 0 5Z" />
    </svg>
  );
}

function T1WebIcon() {
  return (
    <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
      <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 9h-3.05a15.7 15.7 0 0 0-1.38-5.03A8.03 8.03 0 0 1 18.93 11ZM12 4.06c.8.97 1.9 3.2 2.36 6.94H9.64C10.1 7.26 11.2 5.03 12 4.06ZM9.5 5.97A15.7 15.7 0 0 0 8.12 11H5.07A8.03 8.03 0 0 1 9.5 5.97ZM5.07 13h3.05a15.7 15.7 0 0 0 1.38 5.03A8.03 8.03 0 0 1 5.07 13Zm4.57 0h4.72c-.46 3.74-1.56 5.97-2.36 6.94-.8-.97-1.9-3.2-2.36-6.94Zm4.86 5.03A15.7 15.7 0 0 0 15.88 13h3.05a8.03 8.03 0 0 1-4.43 5.03Z" />
    </svg>
  );
}

function PdfSidebarList({ items }) {
  return (
    <div>
      {items.map((item, i) => (
        <div
          key={i}
          style={{
            marginBottom: i === items.length - 1 ? 0 : "12px",
            fontSize: "12px",
            lineHeight: 1.6,
            wordBreak: "break-word",
          }}
        >
          {item}
        </div>
      ))}
    </div>
  );
}

function PdfMainSection({ title, colors, children }) {
  return (
    <section style={{ marginTop: "16px" }}>
      <div
        style={{
          fontSize: "15px",
          fontWeight: 800,
          letterSpacing: "3px",
          color: colors.primary,
        }}
      >
        {title}
      </div>

      <div
        style={{
          width: "100%",
          height: "1.5px",
          marginTop: "6px",
          marginBottom: "8px",
          background: "#8ca3b8",
        }}
      />

      {children}
    </section>
  );
}

function PdfBulletRow({
  text,
  light = false,
  fontSize = "12px",
  lineHeight = 1.6,
  marginBottom = "6px",
  textColor,
  bulletColor,
}) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: "10px",
        marginBottom,
      }}
    >
      <span
        style={{
          width: "4px",
          height: "4px",
          marginTop: "9px",
          borderRadius: "9999px",
          flexShrink: 0,
          background:
            bulletColor || (light ? "rgba(255,255,255,0.95)" : "#374151"),
        }}
      />

      <span
        style={{
          fontSize,
          lineHeight,
          color: textColor || (light ? "rgba(255,255,255,0.95)" : "#374151"),
          wordBreak: "break-word",
          textAlign: "justify",
        }}
      >
        {text}
      </span>
    </div>
  );
}