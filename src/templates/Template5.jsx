export default function Template5({ cv }) {
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

  const hasContact =
    contact.phone || contact.email || contact.address || contact.website;

  const name = (cv.fullName || "Your Name").trim();
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  const theme = cv.theme || {};

  const colors = {
    primary: theme.primary || "#0f172a", // Dark navy/black
    secondary: theme.secondary || "#64748b",
    accent: theme.accent || "#3b82f6", // Blue
    bg: theme.bg || "#ffffff",
    card: theme.card || "#f8fafc",
    text: theme.text || "#334155",
  };

  const pri = colors.primary;
  const sec = colors.secondary;
  const acc = colors.accent;
  const bg = colors.bg;
  const textCol = colors.text;

  // Tiny backgrounds
  const accLight = `${acc}15`; 
  const priLight = `${pri}08`;

  return (
    <div
      style={{
        backgroundColor: "#f4f6f8",
        minHeight: "980px",
        padding: "24px",
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          backgroundColor: bg,
          borderRadius: "24px",
          padding: "36px 40px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.05)",
        }}
      >
        {/* Soft upper gradient blob */}
        <div
          style={{
            position: "absolute",
            top: "-100px",
            right: "-50px",
            width: "300px",
            height: "300px",
            borderRadius: "50%",
            background: `radial-gradient(circle, ${acc}15 0%, rgba(255,255,255,0) 70%)`,
            zIndex: 0,
          }}
        />

        {/* ═══════════════ HEADER ═══════════════ */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            position: "relative",
            zIndex: 1,
            borderBottom: `2px solid ${priLight}`,
            paddingBottom: "24px",
            marginBottom: "28px",
          }}
        >
          <div style={{ flex: 1, paddingRight: "20px" }}>
            <h1
              style={{
                margin: 0,
                fontSize: "36px",
                fontWeight: 800,
                color: pri,
                letterSpacing: "-1px",
                lineHeight: 1.1,
              }}
            >
              {cv.fullName || "Your Name"}
            </h1>
            <div
              style={{
                display: "inline-block",
                marginTop: "12px",
                padding: "6px 14px",
                borderRadius: "12px",
                backgroundColor: accLight,
                color: acc,
                fontSize: "12px",
                fontWeight: 700,
                letterSpacing: "2px",
                textTransform: "uppercase",
              }}
            >
              {cv.jobTitle || "Job Title"}
            </div>
            
            {hasContact && (
              <div
                style={{
                  marginTop: "18px",
                  display: "flex",
                  flexWrap: "wrap",
                  gap: "10px 20px",
                  fontSize: "11px",
                  color: sec,
                  fontWeight: 500,
                }}
              >
                {contact.phone && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ color: acc }}><T5Ico d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20a1 1 0 0 1-1 1C10.3 21 3 13.7 3 4a1 1 0 0 1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z" /></div>
                    {contact.phone}
                  </span>
                )}
                {contact.email && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ color: acc }}><T5Ico d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm0 2v.51l9 6 9-6V7H3Zm18 2.49-8.43 5.62a1 1 0 0 1-1.14 0L3 9.49V18h18V9.49Z" /></div>
                    {contact.email}
                  </span>
                )}
                {contact.address && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ color: acc }}><T5Ico d="M12 2a7 7 0 0 1 7 7c0 4.97-5.05 11.17-6.27 12.6a1 1 0 0 1-1.46 0C10.05 20.17 5 13.97 5 9a7 7 0 0 1 7-7Zm0 9.5A2.5 2.5 0 1 0 12 6.5a2.5 2.5 0 0 0 0 5Z" /></div>
                    {contact.address}
                  </span>
                )}
                {contact.website && (
                  <span style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                    <div style={{ color: acc }}><T5Ico d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 9h-3.05a15.7 15.7 0 0 0-1.38-5.03A8.03 8.03 0 0 1 18.93 11ZM12 4.06c.8.97 1.9 3.2 2.36 6.94H9.64C10.1 7.26 11.2 5.03 12 4.06ZM9.5 5.97A15.7 15.7 0 0 0 8.12 11H5.07A8.03 8.03 0 0 1 9.5 5.97ZM5.07 13h3.05a15.7 15.7 0 0 0 1.38 5.03A8.03 8.03 0 0 1 5.07 13Zm4.57 0h4.72c-.46 3.74-1.56 5.97-2.36 6.94-.8-.97-1.9-3.2-2.36-6.94Zm4.86 5.03A15.7 15.7 0 0 0 15.88 13h3.05a8.03 8.03 0 0 1-4.43 5.03Z" /></div>
                    {contact.website}
                  </span>
                )}
              </div>
            )}
          </div>

          <div
            style={{
              padding: "4px",
              background: `linear-gradient(135deg, ${priLight}, ${accLight})`,
              borderRadius: "24px",
              flexShrink: 0,
            }}
          >
            {cv.photoDataUrl ? (
              <img
                src={cv.photoDataUrl}
                alt="profile"
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "20px",
                  objectFit: "cover",
                  display: "block",
                }}
              />
            ) : (
              <div
                style={{
                  width: "110px",
                  height: "110px",
                  borderRadius: "20px",
                  backgroundColor: colors.card,
                  color: pri,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "32px",
                  fontWeight: 800,
                  boxShadow: `inset 0 0 0 1px ${priLight}`,
                }}
              >
                {initials || "YN"}
              </div>
            )}
          </div>
        </div>

        {/* ═══════════════ CONTENT ═══════════════ */}
        <div style={{ position: "relative", zIndex: 1, display: "grid", gap: "28px" }}>
          
          {/* PROFILE SUMMARY */}
          <section>
            <p
              style={{
                margin: 0,
                fontSize: "13px",
                lineHeight: 1.85,
                color: textCol,
                textAlign: "justify",
                fontWeight: 400,
              }}
            >
              <span style={{ float: "left", fontSize: "32px", lineHeight: "24px", color: acc, marginRight: "8px", fontWeight: "900" }}>"</span>
              {cv.summary || "Write a short summary..."}
            </p>
          </section>

          {/* TWO COLUMN GRID FOR INFO -> CHANGED TO CONTINUOUS FLOW COMPOSITIONS */}
          <div style={{ display: "flex", flexDirection: "column", gap: "32px", marginTop: "12px" }}>
            
            {/* EXPERIENCE */}
            <section>
              <T5SectionTitle title="EXPERIENCE" color={pri} accent={acc} />
              {exp.length === 0 ? (
                <p style={{ fontSize: "12px", color: sec, marginTop: "12px" }}>
                  Add your experience.
                </p>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                  {exp.map((j, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: colors.card,
                        borderRadius: "16px",
                        padding: "20px",
                        border: `1px solid ${priLight}`,
                        display: "grid",
                        gridTemplateColumns: "1fr 2.2fr",
                        gap: "24px",
                        alignItems: "stretch",
                      }}
                    >
                      {/* Left Sidebar of the Card */}
                      <div style={{ borderRight: `1px solid ${priLight}`, paddingRight: "16px" }}>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: pri, lineHeight: 1.3 }}>
                          {j.role || "Role"}
                        </div>
                        <div style={{ fontSize: "12px", color: acc, fontWeight: 700, marginTop: "4px" }}>
                          {j.company || "Company"}
                        </div>
                        <div
                          style={{
                            display: "inline-block",
                            fontSize: "10px",
                            color: sec,
                            fontWeight: 700,
                            backgroundColor: bg,
                            padding: "4px 10px",
                            borderRadius: "6px",
                            border: `1px solid ${priLight}`,
                            marginTop: "12px",
                          }}
                        >
                          {j.start || "Start"} - {j.end || "End"}
                        </div>
                      </div>

                      {/* Right Content of the Card */}
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {j.description ? (
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
                            {j.description}
                          </p>
                        ) : (
                          <p style={{ margin: 0, fontSize: "12px", color: `${textCol}60`, fontStyle: "italic" }}>
                            No description provided.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>

            {/* EXTRACURRICULAR ACTIVITIES */}
            {extracurricular.length > 0 && (
              <section>
                <T5SectionTitle title="EXTRACURRICULAR ACTIVITIES" color={pri} accent={acc} />
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                  {extracurricular.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: colors.card,
                        borderRadius: "16px",
                        padding: "20px",
                        border: `1px solid ${priLight}`,
                        display: "grid",
                        gridTemplateColumns: "1fr 2.2fr",
                        gap: "24px",
                        alignItems: "stretch",
                      }}
                    >
                      {/* Left Sidebar of the Card */}
                      <div style={{ borderRight: `1px solid ${priLight}`, paddingRight: "16px" }}>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: pri, lineHeight: 1.3 }}>
                          {item.activity || "Activity"}
                        </div>
                        <div style={{ fontSize: "12px", color: acc, fontWeight: 700, marginTop: "4px" }}>
                          {[item.role, item.organization].filter(Boolean).join(" at ")}
                        </div>
                        {item.year && (
                          <div
                            style={{
                              display: "inline-block",
                              fontSize: "10px",
                              color: sec,
                              fontWeight: 700,
                              backgroundColor: bg,
                              padding: "4px 10px",
                              borderRadius: "6px",
                              border: `1px solid ${priLight}`,
                              marginTop: "12px",
                            }}
                          >
                            {item.year}
                          </div>
                        )}
                      </div>

                      {/* Right Content of the Card */}
                      <div style={{ display: "flex", alignItems: "center" }}>
                        {item.description ? (
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
                            {item.description}
                          </p>
                        ) : (
                          <p style={{ margin: 0, fontSize: "12px", color: `${textCol}60`, fontStyle: "italic" }}>
                            No description provided.
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* EDUCATION */}
            {education.length > 0 && (
              <section>
                <T5SectionTitle title="EDUCATION" color={pri} accent={acc} />
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", marginTop: "16px" }}>
                  {education.map((item, i) => (
                    <div
                      key={i}
                      style={{
                        backgroundColor: colors.card,
                        borderRadius: "16px",
                        padding: "18px 20px",
                        border: `1px solid ${priLight}`,
                        display: "grid",
                        gridTemplateColumns: "1fr 2.2fr",
                        gap: "24px",
                        alignItems: "center",
                      }}
                    >
                      <div style={{ borderRight: `1px solid ${priLight}`, paddingRight: "16px" }}>
                        <div style={{ fontSize: "14px", fontWeight: 800, color: pri, lineHeight: 1.3 }}>
                          {item.degree || "Degree"}
                        </div>
                        {item.years && (
                          <div style={{ fontSize: "11px", color: acc, fontWeight: 700, marginTop: "6px" }}>
                            {item.years}
                          </div>
                        )}
                      </div>
                      
                      <div>
                        {item.university && (
                          <div style={{ fontSize: "13px", color: pri, fontWeight: 600 }}>
                            {item.university}
                          </div>
                        )}
                        {item.details && (
                          <p style={{ margin: "4px 0 0", fontSize: "11px", color: textCol, lineHeight: 1.6, textAlign: "justify" }}>
                            {item.details}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* SPLIT GRID FOR BOTTOM ITEMS: SKILLS, LANGUAGES */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              {/* SKILLS */}
              {skills.length > 0 && (
                <section>
                  <T5SectionTitle title="SKILLS" color={pri} accent={acc} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
                    {skills.map((s, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "10px",
                          backgroundColor: pri,
                          color: bg,
                          fontSize: "11px",
                          fontWeight: 600,
                          letterSpacing: "0.5px"
                        }}
                      >
                        {s}
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {/* LANGUAGES */}
              {languages.length > 0 && (
                <section>
                  <T5SectionTitle title="LANGUAGES" color={pri} accent={acc} />
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
                    {languages.map((lang, i) => (
                      <div
                        key={i}
                        style={{
                          padding: "6px 14px",
                          borderRadius: "10px",
                          border: `1.5px solid ${acc}`,
                          color: acc,
                          fontSize: "11px",
                          fontWeight: 700,
                          backgroundColor: accLight
                        }}
                      >
                        {lang}
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </div>

            {/* CORE COMPETENCIES */}
            {(cv.coreCompetencies ?? []).filter((c) => c.trim()).length > 0 && (
              <section>
                <T5SectionTitle title="CORE COMPETENCIES" color={pri} accent={acc} />
                <div style={{ display: "flex", flexWrap: "wrap", gap: "8px", marginTop: "16px" }}>
                  {(cv.coreCompetencies ?? []).filter((c) => c.trim()).map((comp, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "6px 14px",
                        borderRadius: "10px",
                        backgroundColor: pri,
                        color: bg,
                        fontSize: "11px",
                        fontWeight: 600,
                        letterSpacing: "0.5px",
                      }}
                    >
                      {comp}
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* REFERENCES */}
            {references.length > 0 && (
              <section>
                <T5SectionTitle title="REFERENCES" color={pri} accent={acc} />
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "16px", marginTop: "16px" }}>
                  {references.map((ref, i) => (
                    <div
                      key={i}
                      style={{
                        padding: "16px",
                        borderRadius: "14px",
                        border: `1px solid ${priLight}`,
                        backgroundColor: bg,
                        display: "flex",
                        flexDirection: "column",
                        gap: "6px",
                        boxShadow: "0 2px 8px rgba(0,0,0,0.02)",
                      }}
                    >
                      <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                        <div style={{ width: "10px", height: "10px", borderRadius: "3px", backgroundColor: acc }} />
                        <span style={{ fontSize: "14px", fontWeight: 800, color: pri }}>{ref.name || "Name"}</span>
                      </div>
                      <div style={{ paddingLeft: "18px", fontSize: "12px", color: acc, fontWeight: 700 }}>
                        {ref.role || "Role"} {ref.company && <span style={{ color: sec, fontWeight: 500 }}>• {ref.company}</span>}
                      </div>
                      <div style={{ paddingLeft: "18px", marginTop: "4px", fontSize: "11px", color: textCol, display: "flex", flexDirection: "column", gap: "4px" }}>
                        {ref.phone && <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>📞 {ref.phone}</div>}
                        {ref.email && <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>✉️ {ref.email}</div>}
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Minimalist Section Title ── */
function T5SectionTitle({ title, color, accent }) {
  return (
    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
      <div style={{ fontSize: "14px", fontWeight: 900, color: color, letterSpacing: "1.5px" }}>
        {title}
      </div>
      <div style={{ flex: 1, height: "2px", backgroundColor: `${color}15`, borderRadius: "1px" }} />
    </div>
  );
}

/* ── Tiny SVG Icon ── */
function T5Ico({ d }) {
  return (
    <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
      <path d={d} />
    </svg>
  );
}