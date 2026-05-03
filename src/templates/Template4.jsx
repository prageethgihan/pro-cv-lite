export default function Template4({ cv }) {
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

  const pri = theme.primary || "#0f172a";
  const sec = "#64748b";
  const acc = theme.accent || "#3b82f6";
  const bg = "#ffffff";
  const textCol = "#334155";
  const lightBg = "#f8fafc";

  return (
    <div style={{ backgroundColor: bg, minHeight: "980px", overflow: "hidden" }}>
      {/* ═══════════════ HEADER ═══════════════ */}
      <div
        style={{
          padding: "36px 40px 28px",
          borderBottom: `2px solid ${acc}15`,
          position: "relative",
        }}
      >
        {/* Subtle accent top edge */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "4px",
            background: `linear-gradient(90deg, ${pri}, ${acc}, ${pri})`,
          }}
        />

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
          }}
        >
          {/* Photo with accent ring */}
          {cv.photoDataUrl ? (
            <div
              style={{
                flexShrink: 0,
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                padding: "3px",
                background: `linear-gradient(135deg, ${acc}, ${pri})`,
              }}
            >
              <img
                src={cv.photoDataUrl}
                alt="profile"
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: `3px solid ${bg}`,
                  display: "block",
                }}
              />
            </div>
          ) : (
            <div
              style={{
                flexShrink: 0,
                width: "90px",
                height: "90px",
                borderRadius: "50%",
                padding: "3px",
                background: `linear-gradient(135deg, ${acc}, ${pri})`,
              }}
            >
              <div
                style={{
                  width: "100%",
                  height: "100%",
                  borderRadius: "50%",
                  border: `3px solid ${bg}`,
                  backgroundColor: lightBg,
                  color: pri,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: "28px",
                  fontWeight: 800,
                  boxSizing: "border-box",
                }}
              >
                {initials || "YN"}
              </div>
            </div>
          )}

          {/* Name + Title */}
          <div style={{ flex: 1 }}>
            <h1
              style={{
                margin: 0,
                fontSize: "30px",
                fontWeight: 900,
                color: pri,
                letterSpacing: "-0.5px",
                lineHeight: 1.1,
              }}
            >
              {cv.fullName || "Your Name"}
            </h1>
            <div
              style={{
                marginTop: "8px",
                fontSize: "12px",
                fontWeight: 600,
                color: acc,
                letterSpacing: "4px",
                textTransform: "uppercase",
              }}
            >
              {cv.jobTitle || "Job Title"}
            </div>
          </div>
        </div>

        {/* Contact row */}
        {hasContact && (
          <div
            style={{
              marginTop: "18px",
              paddingTop: "14px",
              borderTop: `1px solid ${sec}15`,
              display: "flex",
              flexWrap: "wrap",
              gap: "4px 22px",
              fontSize: "10px",
              color: sec,
            }}
          >
            {contact.phone && (
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <T4Ico d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20a1 1 0 0 1-1 1C10.3 21 3 13.7 3 4a1 1 0 0 1 1-1h3.5c.55 0 1 .45 1 1 0 1.24.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2Z" />
                {contact.phone}
              </span>
            )}
            {contact.email && (
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <T4Ico d="M3 5h18a1 1 0 0 1 1 1v12a1 1 0 0 1-1 1H3a1 1 0 0 1-1-1V6a1 1 0 0 1 1-1Zm0 2v.51l9 6 9-6V7H3Zm18 2.49-8.43 5.62a1 1 0 0 1-1.14 0L3 9.49V18h18V9.49Z" />
                {contact.email}
              </span>
            )}
            {contact.address && (
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <T4Ico d="M12 2a7 7 0 0 1 7 7c0 4.97-5.05 11.17-6.27 12.6a1 1 0 0 1-1.46 0C10.05 20.17 5 13.97 5 9a7 7 0 0 1 7-7Zm0 9.5A2.5 2.5 0 1 0 12 6.5a2.5 2.5 0 0 0 0 5Z" />
                {contact.address}
              </span>
            )}
            {contact.website && (
              <span style={{ display: "flex", alignItems: "center", gap: "5px" }}>
                <T4Ico d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.93 9h-3.05a15.7 15.7 0 0 0-1.38-5.03A8.03 8.03 0 0 1 18.93 11ZM12 4.06c.8.97 1.9 3.2 2.36 6.94H9.64C10.1 7.26 11.2 5.03 12 4.06ZM9.5 5.97A15.7 15.7 0 0 0 8.12 11H5.07A8.03 8.03 0 0 1 9.5 5.97ZM5.07 13h3.05a15.7 15.7 0 0 0 1.38 5.03A8.03 8.03 0 0 1 5.07 13Zm4.57 0h4.72c-.46 3.74-1.56 5.97-2.36 6.94-.8-.97-1.9-3.2-2.36-6.94Zm4.86 5.03A15.7 15.7 0 0 0 15.88 13h3.05a8.03 8.03 0 0 1-4.43 5.03Z" />
                {contact.website}
              </span>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════ BODY ═══════════════ */}
      <div style={{ padding: "28px 36px 36px" }}>
        {/* ── PROFILE ── */}
        <Section title="PROFILE" accent={acc} pri={pri}>
          <p
            style={{
              margin: 0,
              fontSize: "12px",
              lineHeight: 1.85,
              color: textCol,
              textAlign: "justify",
            }}
          >
            {cv.summary || "Write a short summary..."}
          </p>
        </Section>

        {/* ── TWO COLUMN: Skills + Languages ── */}
        {(skills.length > 0 || languages.length > 0) && (
          <div
            style={{
              marginTop: "24px",
              display: "grid",
              gridTemplateColumns:
                skills.length > 0 && languages.length > 0 ? "1fr 1fr" : "1fr",
              gap: "28px",
            }}
          >
            {skills.length > 0 && (
              <Section title="SKILLS" accent={acc} pri={pri}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {skills.map((s, i) => (
                    <span
                      key={i}
                      style={{
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: 600,
                        backgroundColor: `${acc}0c`,
                        color: acc,
                        border: `1px solid ${acc}20`,
                      }}
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Section>
            )}

            {languages.length > 0 && (
              <Section title="LANGUAGES" accent={acc} pri={pri}>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {languages.map((lang, i) => (
                    <span
                      key={i}
                      style={{
                        padding: "4px 12px",
                        borderRadius: "6px",
                        fontSize: "10px",
                        fontWeight: 600,
                        backgroundColor: lightBg,
                        color: pri,
                        border: `1px solid ${sec}20`,
                      }}
                    >
                      {lang}
                    </span>
                  ))}
                </div>
              </Section>
            )}
          </div>
        )}

        {/* ── CORE COMPETENCIES ── */}
        {(cv.coreCompetencies ?? []).filter((c) => c.trim()).length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <Section title="CORE COMPETENCIES" accent={acc} pri={pri}>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {(cv.coreCompetencies ?? []).filter((c) => c.trim()).map((comp, i) => (
                  <span
                    key={i}
                    style={{
                      padding: "4px 12px",
                      borderRadius: "6px",
                      fontSize: "10px",
                      fontWeight: 600,
                      backgroundColor: `${acc}0c`,
                      color: acc,
                      border: `1px solid ${acc}20`,
                    }}
                  >
                    {comp}
                  </span>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* ── EXPERIENCE ── */}
        <div style={{ marginTop: "24px" }}>
          <Section title="EXPERIENCE" accent={acc} pri={pri}>
            {exp.length === 0 ? (
              <p style={{ fontSize: "12px", color: sec }}>
                Add your experience to see it here.
              </p>
            ) : (
              <div>
                {exp.map((j, i) => (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      paddingLeft: "20px",
                      paddingBottom: i !== exp.length - 1 ? "20px" : "0",
                      borderLeft: `2px solid ${acc}20`,
                      marginLeft: "5px",
                    }}
                  >
                    {/* Dot */}
                    <span
                      style={{
                        position: "absolute",
                        left: "-6px",
                        top: "4px",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: bg,
                        border: `2.5px solid ${acc}`,
                        boxSizing: "border-box",
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: pri }}>
                          {j.role || "Role"}
                        </div>
                        <div
                          style={{
                            marginTop: "2px",
                            fontSize: "11px",
                            color: sec,
                          }}
                        >
                          {j.company || "Company"}
                        </div>
                      </div>
                      <span
                        style={{
                          flexShrink: 0,
                          fontSize: "9px",
                          fontWeight: 700,
                          color: acc,
                          backgroundColor: `${acc}0a`,
                          border: `1px solid ${acc}18`,
                          padding: "3px 10px",
                          borderRadius: "20px",
                          letterSpacing: "0.5px",
                          whiteSpace: "nowrap",
                          marginTop: "2px",
                        }}
                      >
                        {j.start || "Start"} – {j.end || "End"}
                      </span>
                    </div>

                    {j.description && (
                      <p
                        style={{
                          marginTop: "8px",
                          fontSize: "11px",
                          lineHeight: 1.75,
                          color: textCol,
                          textAlign: "justify",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {j.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Section>
        </div>

        {/* ── EXTRACURRICULAR ACTIVITIES ── */}
        {extracurricular.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <Section title="ACTIVITIES" accent={acc} pri={pri}>
              <div>
                {extracurricular.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      position: "relative",
                      paddingLeft: "20px",
                      paddingBottom: i !== extracurricular.length - 1 ? "20px" : "0",
                      borderLeft: `2px solid ${acc}20`,
                      marginLeft: "5px",
                    }}
                  >
                    <span
                      style={{
                        position: "absolute",
                        left: "-6px",
                        top: "4px",
                        width: "10px",
                        height: "10px",
                        borderRadius: "50%",
                        backgroundColor: bg,
                        border: `2.5px solid ${acc}`,
                        boxSizing: "border-box",
                      }}
                    />

                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "flex-start",
                        gap: "8px",
                      }}
                    >
                      <div>
                        <div style={{ fontSize: "13px", fontWeight: 700, color: pri }}>
                          {item.activity || "Activity"}
                        </div>
                        <div
                          style={{
                            marginTop: "2px",
                            fontSize: "11px",
                            color: sec,
                          }}
                        >
                          {[item.role, item.organization].filter(Boolean).join(" at ")}
                        </div>
                      </div>
                      {item.year && (
                        <span
                          style={{
                            flexShrink: 0,
                            fontSize: "9px",
                            fontWeight: 700,
                            color: acc,
                            backgroundColor: `${acc}0a`,
                            border: `1px solid ${acc}18`,
                            padding: "3px 10px",
                            borderRadius: "20px",
                            letterSpacing: "0.5px",
                            whiteSpace: "nowrap",
                            marginTop: "2px",
                          }}
                        >
                          {item.year}
                        </span>
                      )}
                    </div>

                    {item.description && (
                      <p
                        style={{
                          marginTop: "8px",
                          fontSize: "11px",
                          lineHeight: 1.75,
                          color: textCol,
                          textAlign: "justify",
                          whiteSpace: "pre-wrap",
                        }}
                      >
                        {item.description}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* ── EDUCATION ── */}
        {education.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <Section title="EDUCATION" accent={acc} pri={pri}>
              <div>
                {education.map((item, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "flex-start",
                      gap: "12px",
                      paddingBottom: i !== education.length - 1 ? "14px" : "0",
                      marginBottom: i !== education.length - 1 ? "14px" : "0",
                      borderBottom:
                        i !== education.length - 1
                          ? `1px solid ${sec}15`
                          : "none",
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "13px", fontWeight: 700, color: pri }}>
                        {item.degree || "Degree"}
                      </div>
                      {item.university && (
                        <div
                          style={{
                            marginTop: "2px",
                            fontSize: "11px",
                            color: acc,
                            fontWeight: 500,
                          }}
                        >
                          {item.university}
                        </div>
                      )}
                      {item.details && (
                        <div
                          style={{
                            marginTop: "4px",
                            fontSize: "11px",
                            color: sec,
                            lineHeight: 1.5,
                          }}
                        >
                          {item.details}
                        </div>
                      )}
                    </div>
                    {item.years && (
                      <span
                        style={{
                          flexShrink: 0,
                          fontSize: "10px",
                          color: sec,
                          fontWeight: 600,
                          marginTop: "2px",
                        }}
                      >
                        {item.years}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}

        {/* ── REFERENCES ── */}
        {references.length > 0 && (
          <div style={{ marginTop: "24px" }}>
            <Section title="REFERENCES" accent={acc} pri={pri}>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "10px",
                }}
              >
                {references.map((ref, i) => (
                  <div
                    key={i}
                    style={{
                      padding: "14px 16px",
                      borderRadius: "10px",
                      backgroundColor: lightBg,
                      borderLeft: `3px solid ${acc}`,
                    }}
                  >
                    <div
                      style={{
                        fontSize: "12px",
                        fontWeight: 700,
                        color: pri,
                      }}
                    >
                      {ref.name || "Reference Name"}
                    </div>
                    <div
                      style={{
                        marginTop: "2px",
                        fontSize: "10px",
                        color: acc,
                        fontWeight: 600,
                      }}
                    >
                      {ref.role || "Role"}
                    </div>
                    {ref.company && (
                      <div style={{ fontSize: "10px", color: sec }}>
                        {ref.company}
                      </div>
                    )}
                    <div
                      style={{
                        marginTop: "6px",
                        fontSize: "10px",
                        color: textCol,
                        lineHeight: 1.7,
                      }}
                    >
                      {ref.phone && <div>📞 {ref.phone}</div>}
                      {ref.email && <div>✉️ {ref.email}</div>}
                    </div>
                  </div>
                ))}
              </div>
            </Section>
          </div>
        )}
      </div>
    </div>
  );
}

/* ── Section wrapper ── */
function Section({ title, accent, pri, children }) {
  return (
    <div>
      <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
        <div
          style={{
            width: "22px",
            height: "22px",
            borderRadius: "6px",
            backgroundColor: `${accent}10`,
            border: `1.5px solid ${accent}30`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <div
            style={{
              width: "6px",
              height: "6px",
              borderRadius: "50%",
              backgroundColor: accent,
            }}
          />
        </div>
        <div
          style={{
            fontSize: "11px",
            fontWeight: 800,
            letterSpacing: "3.5px",
            color: pri,
          }}
        >
          {title}
        </div>
        <div
          style={{
            flex: 1,
            height: "1px",
            background: `linear-gradient(to right, ${accent}25, transparent)`,
          }}
        />
      </div>
      {children}
    </div>
  );
}

/* ── Tiny icon component ── */
function T4Ico({ d }) {
  return (
    <svg viewBox="0 0 24 24" width="10" height="10" fill="currentColor" style={{ flexShrink: 0 }}>
      <path d={d} />
    </svg>
  );
}