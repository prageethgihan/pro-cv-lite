export default function Template3({ cv }) {
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
        r.name?.trim() ||
        r.role?.trim() ||
        r.company?.trim() ||
        r.phone?.trim() ||
        r.email?.trim()
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

  const contactItems = [
    contact.email,
    contact.phone,
    contact.address,
    contact.website,
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
    primary: theme.primary || "#193c72", // Deep classic blue
    secondary: theme.secondary || "#475569",
    accent: theme.accent || "#0f172a",
    bg: theme.bg || "#ffffff",
    card: theme.card || "#ffffff",
    text: theme.text || "#334155",
  };

  const pri = colors.primary;
  const sec = colors.secondary;
  const textCol = colors.text;

  return (
    <div
      style={{
        backgroundColor: colors.bg,
        minHeight: "980px",
        padding: "48px 52px",
        boxSizing: "border-box",
        fontFamily: "'Inter', sans-serif",
      }}
    >
      {/* ─── HEADER ─── */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          paddingBottom: "16px",
          borderBottom: `2.5px solid ${pri}`,
          marginBottom: "8px",
        }}
      >
        <div style={{ flex: 1 }}>
          <h1
            style={{
              margin: 0,
              fontSize: "38px",
              fontWeight: 800,
              color: pri,
              textTransform: "uppercase",
              letterSpacing: "-0.5px",
              lineHeight: 1.1,
            }}
          >
            {cv.fullName || "YOUR NAME"}
          </h1>
          {cv.jobTitle && (
            <div
              style={{
                fontSize: "14px",
                fontWeight: 600,
                color: sec,
                marginTop: "4px",
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              {cv.jobTitle}
            </div>
          )}
          {contactItems.length > 0 && (
            <div
              style={{
                marginTop: "10px",
                fontSize: "11px",
                color: sec,
                display: "flex",
                flexWrap: "wrap",
                alignItems: "center",
                gap: "6px",
                fontWeight: 500,
              }}
            >
              {contactItems.map((item, i) => (
                <span key={i} style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                  {item}
                  {i < contactItems.length - 1 && (
                    <span style={{ color: `${sec}50`, padding: "0 2px" }}>|</span>
                  )}
                </span>
              ))}
            </div>
          )}
        </div>

        {cv.photoDataUrl ? (
          <div style={{ paddingLeft: "24px" }}>
            <img
              src={cv.photoDataUrl}
              alt="profile"
              style={{
                width: "80px",
                height: "80px",
                borderRadius: "12px",
                objectFit: "cover",
                display: "block",
              }}
            />
          </div>
        ) : null}
      </div>

      {/* ─── BODY COMPONENTS ─── */}
      <div style={{ display: "flex", flexDirection: "column" }}>
        
        {/* SUMMARY */}
        {cv.summary && (
          <SectionRow title="SUMMARY" pri={pri}>
            <p
              style={{
                margin: 0,
                fontSize: "12px",
                lineHeight: 1.7,
                color: textCol,
                textAlign: "justify",
              }}
            >
              {cv.summary}
            </p>
          </SectionRow>
        )}

        {/* WORK EXPERIENCE */}
        {exp.length > 0 && (
          <SectionRow title="WORK EXPERIENCE" pri={pri}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {exp.map((j, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: textCol }}>
                      {j.role || "Role"}
                      {j.company && (
                        <span style={{ fontWeight: 400, color: sec }}>, {j.company}</span>
                      )}
                    </div>
                    <div style={{ fontSize: "11px", fontWeight: 600, color: pri, flexShrink: 0 }}>
                      {j.start || "Start"} - {j.end || "End"}
                    </div>
                  </div>
                  {j.description && (
                    <p
                      style={{
                        margin: "8px 0 0",
                        fontSize: "12px",
                        lineHeight: 1.6,
                        color: textCol,
                        textAlign: "justify",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      {/* Using ul/li style bullet visual without real HTML lists to match text format */}
                      <span style={{ paddingLeft: "10px", display: "block" }}>
                        {j.description}
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </SectionRow>
        )}

        {/* EXTRACURRICULAR ACTIVITIES */}
        {extracurricular.length > 0 && (
          <SectionRow title="ACTIVITIES" pri={pri}>
            <div style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
              {extracurricular.map((item, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: textCol }}>
                      {item.activity || "Activity"}
                      {item.role || item.organization ? (
                        <span style={{ fontWeight: 400, color: sec }}>
                          , {[item.role, item.organization].filter(Boolean).join(" at ")}
                        </span>
                      ) : null}
                    </div>
                    {item.year && (
                      <div style={{ fontSize: "11px", fontWeight: 600, color: pri, flexShrink: 0 }}>
                        {item.year}
                      </div>
                    )}
                  </div>
                  {item.description && (
                    <p
                      style={{
                        margin: "8px 0 0",
                        fontSize: "12px",
                        lineHeight: 1.6,
                        color: textCol,
                        textAlign: "justify",
                        whiteSpace: "pre-wrap",
                      }}
                    >
                      <span style={{ paddingLeft: "10px", display: "block" }}>
                        {item.description}
                      </span>
                    </p>
                  )}
                </div>
              ))}
            </div>
          </SectionRow>
        )}

        {/* EDUCATION */}
        {education.length > 0 && (
          <SectionRow title="EDUCATION" pri={pri}>
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              {education.map((item, i) => (
                <div key={i}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                    <div style={{ fontSize: "13px", fontWeight: 700, color: textCol }}>
                      {item.degree || "Degree"}
                    </div>
                    {item.years && (
                      <div style={{ fontSize: "11px", fontWeight: 600, color: pri, flexShrink: 0 }}>
                        {item.years}
                      </div>
                    )}
                  </div>
                  {item.university && (
                    <div style={{ fontSize: "12px", color: sec, marginTop: "2px" }}>
                      {item.university}
                    </div>
                  )}
                  {item.details && (
                    <p
                      style={{
                        margin: "6px 0 0",
                        fontSize: "12px",
                        lineHeight: 1.5,
                        color: textCol,
                        paddingLeft: "10px",
                        textAlign: "justify"
                      }}
                    >
                      {item.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </SectionRow>
        )}

        {/* SKILLS */}
        {skills.length > 0 && (
          <SectionRow title="KEY SKILLS" pri={pri}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px 24px",
              }}
            >
              {skills.map((s, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    fontSize: "12px",
                    color: textCol,
                  }}
                >
                  <span style={{ color: pri, fontSize: "14px", lineHeight: "12px" }}>•</span>
                  {s}
                </div>
              ))}
            </div>
          </SectionRow>
        )}

        {/* CORE COMPETENCIES */}
        {(cv.coreCompetencies ?? []).filter((c) => c.trim()).length > 0 && (
          <SectionRow title="CORE COMPETENCIES" pri={pri}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px 24px",
              }}
            >
              {(cv.coreCompetencies ?? []).filter((c) => c.trim()).map((comp, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    fontSize: "12px",
                    color: textCol,
                  }}
                >
                  <span style={{ color: pri, fontSize: "14px", lineHeight: "12px" }}>•</span>
                  {comp}
                </div>
              ))}
            </div>
          </SectionRow>
        )}

        {/* LANGUAGES */}
        {languages.length > 0 && (
          <SectionRow title="LANGUAGES" pri={pri}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "10px 24px",
              }}
            >
              {languages.map((l, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    alignItems: "flex-start",
                    gap: "8px",
                    fontSize: "12px",
                    color: textCol,
                  }}
                >
                  <span style={{ color: pri, fontSize: "14px", lineHeight: "12px" }}>•</span>
                  {l}
                </div>
              ))}
            </div>
          </SectionRow>
        )}

        {/* CUSTOM SECTIONS — array, rendered in insertion order */}
        {(cv.customSections ?? []).filter((s) => s.title?.trim()).map((s, i) => (
          <SectionRow key={i} title={s.title.toUpperCase()} pri={pri}>
            {s.content?.trim() && (
              <p
                style={{
                  margin: 0,
                  fontSize: "12px",
                  lineHeight: 1.7,
                  color: textCol,
                  textAlign: "justify",
                  whiteSpace: "pre-wrap",
                }}
              >
                {s.content}
              </p>
            )}
          </SectionRow>
        ))}

        {/* REFERENCES */}
        {references.length > 0 && (
          <SectionRow title="REFERENCES" pri={pri}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "20px",
              }}
            >
              {references.map((ref, i) => (
                <div key={i}>
                  <div style={{ fontSize: "13px", fontWeight: 700, color: textCol }}>
                    {ref.name || "Name"}
                  </div>
                  <div style={{ fontSize: "12px", color: sec, marginTop: "2px" }}>
                    {ref.role || "Role"}
                    {ref.company && `, ${ref.company}`}
                  </div>
                  <div style={{ fontSize: "12px", color: textCol, marginTop: "4px", display: "flex", flexDirection: "column", gap: "2px" }}>
                    {ref.phone && <div>{ref.phone}</div>}
                    {ref.email && <div>{ref.email}</div>}
                  </div>
                </div>
              ))}
            </div>
          </SectionRow>
        )}

      </div>
      
      {/* ─── BOTTOM LINE ─── */}
      <div style={{ borderTop: `1.5px solid ${pri}`, marginTop: "16px" }} />
      
    </div>
  );
}

/* ── Minimalist Editorial Section Row ── */
function SectionRow({ title, pri, children }) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "140px 1fr",
        gap: "32px",
        padding: "20px 0",
        borderBottom: `1px solid ${pri}30`,
      }}
    >
      <div
        style={{
          fontSize: "13px",
          fontWeight: 800,
          color: pri,
          textTransform: "uppercase",
          letterSpacing: "1px",
        }}
      >
        {title}
      </div>
      <div>{children}</div>
    </div>
  );
}