/* ============================================================
   Template 6 — Sri Lankan Academic CV  (v3 – Forest Green)
   Layout: dark forest-green sidebar + clean white main column
   All data bindings identical — visual redesign only
   ============================================================ */

export default function Template6({ cv }) {
  /* ── data ───────────────────────────────────────────────── */
  const skills          = (cv.skills        ?? []).filter(s => s.trim());
  const languages       = (cv.languages     ?? []).filter(l => l.trim());
  const education       = (cv.education     ?? []).filter(e => e.years?.trim() || e.university?.trim() || e.degree?.trim());
  const experience      = (cv.experience    ?? []).filter(j => j.role?.trim() || j.company?.trim());
  const extracurricular = (cv.extracurricular ?? []).filter(i => i.activity?.trim());
  const olSubjects      = (cv.olResults?.subjects ?? []).filter(s => s.subject?.trim());
  const alSubjects      = (cv.alResults?.subjects ?? []).filter(s => s.subject?.trim());
  const extraQuals      = (cv.extraQualifications ?? []).filter(q => q.title?.trim() || q.provider?.trim());
  const references      = (cv.references    ?? []).filter(r => r.name?.trim() || r.role?.trim() || r.company?.trim());

  const hasOl    = olSubjects.length > 0 || cv.olResults?.school || cv.olResults?.year;
  const hasAl    = alSubjects.length > 0 || cv.alResults?.school || cv.alResults?.year || cv.alResults?.stream;
  const hasExtra = extraQuals.length > 0;

  const phone   = cv.contact?.phone?.trim()   || "";
  const email   = cv.contact?.email?.trim()   || "";
  const address = cv.contact?.address?.trim() || "";
  const website = cv.contact?.website?.trim() || "";
  const hasContact = phone || email || address || website;

  const name = (cv.fullName || "YOUR NAME").trim();
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join("");

  /* ── theme ──────────────────────────────────────────────── */
  const theme      = cv.theme || {};
  const SIDEBAR_BG = theme.primary   || "#1c3d2e";   /* deep forest green */
  const ACCENT     = SIDEBAR_BG;
  const PILL_BG    = darkenHex(SIDEBAR_BG, 0.20);    /* slightly darker for pills */
  const TABLE_HDR  = SIDEBAR_BG;
  const BODY_TEXT  = "#1e293b";
  const META_TEXT  = "#6b7a8d";
  const DIVIDER    = "#d1d5db";
  const ROW_ALT    = "#f2f9f5";
  const CHECK      = "#4ade80";                        /* checkmark green */

  const FONT = "'Segoe UI', Arial, sans-serif";

  return (
    <div
      style={{
        display: "flex",
        minHeight: "100%",
        fontFamily: FONT,
        backgroundColor: "#fff",
        boxSizing: "border-box",
        fontSize: "11px",
        color: BODY_TEXT,
      }}
    >
      {/* ═══════════════════════ LEFT SIDEBAR ═══════════════════════ */}
      <div
        style={{
          width: "215px",
          flexShrink: 0,
          backgroundColor: SIDEBAR_BG,
          boxSizing: "border-box",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {/* ── Profile photo ── */}
        <div style={{ padding: "18px 14px 10px" }}>
          {cv.photoDataUrl ? (
            <img
              src={cv.photoDataUrl}
              alt="profile"
              style={{
                width: "120px",
                height: "120px",
                objectFit: "cover",
                display: "block",
                margin: "0 auto",
                border: "3px solid rgba(255,255,255,0.22)",
              }}
            />
          ) : (
            <div
              style={{
                width: "120px",
                height: "120px",
                margin: "0 auto",
                background: "rgba(255,255,255,0.08)",
                border: "2px solid rgba(255,255,255,0.16)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "36px",
                fontWeight: "bold",
                color: "rgba(255,255,255,0.8)",
              }}
            >
              {initials || "YN"}
            </div>
          )}
        </div>

        {/* ── CONTACT ── */}
        {hasContact && (
          <SideBlock title="CONTACT">
            <div style={{ display: "flex", flexDirection: "column", gap: "9px" }}>
              {phone   && <ContactRow icon="📞" label="PHONE"   value={phone}   />}
              {email   && <ContactRow icon="✉"  label="EMAIL"   value={email}   />}
              {address && <ContactRow icon="📍" label="ADDRESS" value={address} />}
              {website && <ContactRow icon="🌐" label="WEB"     value={website} />}
            </div>
          </SideBlock>
        )}

        {/* ── LANGUAGES ── */}
        {languages.length > 0 && (
          <SideBlock title="LANGUAGES">
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {languages.map((l, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: CHECK, fontSize: "9px", lineHeight: 1 }}>◆</span>
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.9)" }}>{l}</span>
                </div>
              ))}
            </div>
          </SideBlock>
        )}

        {/* ── SKILLS as pill badges ── */}
        {skills.length > 0 && (
          <SideBlock title="SKILLS">
            <div style={{ display: "flex", flexWrap: "wrap", gap: "5px" }}>
              {skills.map((s, i) => (
                <span
                  key={i}
                  style={{
                    background: PILL_BG,
                    color: "#fff",
                    borderRadius: "3px",
                    padding: "3px 8px",
                    fontSize: "9px",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "4px",
                    lineHeight: 1.3,
                  }}
                >
                  <span style={{ color: CHECK, fontWeight: 700, fontSize: "9px" }}>✓</span>
                  {s}
                </span>
              ))}
            </div>
          </SideBlock>
        )}

        {/* ── CORE COMPETENCIES (from coreCompetencies field) ── */}
        {(cv.coreCompetencies ?? []).filter(c => c.trim()).length > 0 && (
          <SideBlock title="CORE COMPETENCIES">
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {(cv.coreCompetencies ?? []).filter(c => c.trim()).map((comp, i) => (
                <div key={i} style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                  <span style={{ color: CHECK, fontWeight: 700, fontSize: "10px", flexShrink: 0 }}>✓</span>
                  <span style={{ fontSize: "10px", color: "rgba(255,255,255,0.9)", lineHeight: 1.35 }}>
                    {comp}
                  </span>
                </div>
              ))}
            </div>
          </SideBlock>
        )}

        {/* ── REFERENCES (compact, in sidebar) ── */}
        {references.length > 0 && (
          <SideBlock title="REFERENCES">
            <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
              {references.map((r, i) => (
                <div key={i}>
                  {r.name?.trim() && (
                    <div style={{ fontSize: "10.5px", fontWeight: 700, color: "#fff" }}>
                      {r.name}
                    </div>
                  )}
                  {(r.role?.trim() || r.company?.trim()) && (
                    <div
                      style={{
                        fontSize: "9px",
                        color: "rgba(255,255,255,0.65)",
                        marginTop: "1px",
                        lineHeight: 1.4,
                      }}
                    >
                      {[r.role, r.company].filter(Boolean).join(": ")}
                    </div>
                  )}
                  {r.phone?.trim() && (
                    <div style={{ fontSize: "9px", color: "rgba(255,255,255,0.60)", marginTop: "2px" }}>
                      T: {r.phone}
                    </div>
                  )}
                  {r.email?.trim() && (
                    <div
                      style={{
                        fontSize: "9px",
                        color: "rgba(255,255,255,0.60)",
                        wordBreak: "break-all",
                        lineHeight: 1.35,
                        marginTop: "1px",
                      }}
                    >
                      E: {r.email}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </SideBlock>
        )}
      </div>

      {/* ═══════════════════════ RIGHT MAIN ═══════════════════════ */}
      <div
        style={{
          flex: 1,
          padding: "28px 26px 22px 26px",
          boxSizing: "border-box",
          backgroundColor: "#fff",
          overflow: "hidden",
        }}
      >
        {/* ── Name + Job Title ── */}
        <div style={{ marginBottom: "14px" }}>
          <h1
            style={{
              margin: 0,
              fontSize: "26px",
              fontWeight: 800,
              color: ACCENT,
              letterSpacing: "1px",
              textTransform: "uppercase",
              lineHeight: 1.1,
            }}
          >
            {(cv.fullName || "YOUR NAME").trim()}
          </h1>

          {cv.jobTitle?.trim() && (
            <div
              style={{
                marginTop: "5px",
                fontSize: "9.5px",
                fontWeight: 600,
                color: META_TEXT,
                letterSpacing: "2.5px",
                textTransform: "uppercase",
              }}
            >
              {cv.jobTitle}
            </div>
          )}

          <div
            style={{
              marginTop: "10px",
              height: "1.5px",
              background: `linear-gradient(to right, ${ACCENT}, ${DIVIDER})`,
              borderRadius: "1px",
            }}
          />
        </div>

        {/* ── Profile Summary ── */}
        {cv.summary?.trim() && (
          <MainSection title="PROFILE" accent={ACCENT} divider={DIVIDER}>
            <p
              style={{
                margin: 0,
                fontSize: "10.5px",
                lineHeight: 1.82,
                color: BODY_TEXT,
                textAlign: "justify",
              }}
            >
              {cv.summary}
            </p>
          </MainSection>
        )}

        {/* ── Work Experience ── */}
        {experience.length > 0 && (
          <MainSection title="WORK EXPERIENCE" accent={ACCENT} divider={DIVIDER}>
            <div style={{ display: "flex", flexDirection: "column", gap: "13px" }}>
              {experience.map((j, i) => (
                <div key={i}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: "8px",
                    }}
                  >
                    <div>
                      <span style={{ fontSize: "11.5px", fontWeight: 700, color: BODY_TEXT }}>
                        {j.role}
                      </span>
                      {j.company && (
                        <span style={{ fontSize: "10px", color: META_TEXT }}>
                          {" "}· {j.company}
                        </span>
                      )}
                    </div>
                    {(j.start || j.end) && (
                      <span
                        style={{
                          fontSize: "9.5px",
                          color: META_TEXT,
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {j.start}{j.end ? ` - ${j.end}` : ""}
                      </span>
                    )}
                  </div>
                  {j.description?.trim() && (
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "10px",
                        lineHeight: 1.65,
                        color: BODY_TEXT,
                        whiteSpace: "pre-wrap",
                        textAlign: "justify",
                      }}
                    >
                      {j.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {/* ── Education ── */}
        {education.length > 0 && (
          <MainSection title="EDUCATION" accent={ACCENT} divider={DIVIDER}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {education.map((e, i) => (
                <div key={i}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: "8px",
                    }}
                  >
                    <div style={{ fontSize: "11.5px", fontWeight: 700, color: BODY_TEXT }}>
                      {e.degree || "Degree"}
                    </div>
                    {e.years?.trim() && (
                      <span
                        style={{
                          fontSize: "9.5px",
                          color: META_TEXT,
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {e.years}
                      </span>
                    )}
                  </div>
                  {e.university?.trim() && (
                    <div style={{ fontSize: "10px", color: META_TEXT, marginTop: "2px" }}>
                      {e.university}
                    </div>
                  )}
                  {e.details?.trim() && (
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "9.5px",
                        color: META_TEXT,
                        paddingLeft: "8px",
                        lineHeight: 1.5,
                      }}
                    >
                      {e.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {/* ── Custom Sections (Moved below Education) ── */}
        {(cv.customSections ?? [])
          .filter((s) => s.title?.trim() || s.content?.trim())
          .map((s, i) => (
            <MainSection key={i} title={(s.title || "Section").toUpperCase()} accent={ACCENT} divider={DIVIDER}>
              <p
                style={{
                  margin: 0,
                  fontSize: "9.5px",
                  lineHeight: 1.6,
                  color: BODY_TEXT,
                  textAlign: "justify",
                  whiteSpace: "pre-wrap",
                }}
              >
                {s.content}
              </p>
            </MainSection>
          ))}

        {/* ── A/L Results ── */}
        {hasAl && (
          <MainSection title="G.C.E. ADVANCED LEVEL (A/L) RESULTS" accent={ACCENT} divider={DIVIDER}>
            <AcademicMeta
              items={[
                cv.alResults?.stream && { key: "STREAM", val: cv.alResults.stream },
                cv.alResults?.year   && { key: "YEAR",   val: cv.alResults.year   },
                cv.alResults?.school && { key: "SCHOOL", val: cv.alResults.school  },
              ].filter(Boolean)}
              accent={ACCENT}
              meta={META_TEXT}
            />
            {alSubjects.length > 0 && (
              <AcademicTable
                subjects={alSubjects}
                tableHdr={TABLE_HDR}
                rowAlt={ROW_ALT}
                body={BODY_TEXT}
                meta={META_TEXT}
                divider={DIVIDER}
              />
            )}
          </MainSection>
        )}

        {/* ── O/L Results ── */}
        {hasOl && (
          <MainSection title="G.C.E. ORDINARY LEVEL (O/L) RESULTS" accent={ACCENT} divider={DIVIDER}>
            <AcademicMeta
              items={[
                cv.olResults?.year   && { key: "YEAR",   val: cv.olResults.year   },
                cv.olResults?.school && { key: "SCHOOL", val: cv.olResults.school  },
              ].filter(Boolean)}
              accent={ACCENT}
              meta={META_TEXT}
            />
            {olSubjects.length > 0 && (
              <AcademicTable
                subjects={olSubjects}
                tableHdr={TABLE_HDR}
                rowAlt={ROW_ALT}
                body={BODY_TEXT}
                meta={META_TEXT}
                divider={DIVIDER}
              />
            )}
          </MainSection>
        )}

        {/* ── Extra Education Qualifications ── */}
        {hasExtra && (
          <MainSection title="EXTRA EDUCATION QUALIFICATIONS" accent={ACCENT} divider={DIVIDER}>
            <div style={{ display: "flex", flexDirection: "column", gap: "11px" }}>
              {extraQuals.map((q, i) => (
                <div key={i}>
                  {q.title && (
                    <div style={{ fontSize: "11px", fontWeight: 700, color: BODY_TEXT, lineHeight: 1.3 }}>
                      {q.title}
                    </div>
                  )}
                  {(q.provider || q.year) && (
                    <div
                      style={{
                        fontSize: "9.5px",
                        color: META_TEXT,
                        marginTop: "2px",
                        lineHeight: 1.4,
                      }}
                    >
                      {q.provider}
                      {q.provider && q.year && (
                        <span style={{ margin: "0 4px", opacity: 0.4 }}>-</span>
                      )}
                      {q.year && <span>{q.year}</span>}
                    </div>
                  )}
                  {q.details?.trim() && (
                    <p
                      style={{
                        margin: "3px 0 0",
                        fontSize: "9.5px",
                        lineHeight: 1.55,
                        color: META_TEXT,
                        textAlign: "justify",
                      }}
                    >
                      {q.details}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {/* ── Extracurricular Activities ── */}
        {extracurricular.length > 0 && (
          <MainSection title="EXTRACURRICULAR ACTIVITIES" accent={ACCENT} divider={DIVIDER}>
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              {extracurricular.map((item, i) => (
                <div key={i}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "baseline",
                      gap: "8px",
                    }}
                  >
                    <div style={{ fontSize: "11.5px", fontWeight: 700, color: BODY_TEXT }}>
                      {item.activity || "Activity"}
                    </div>
                    {item.year && (
                      <span
                        style={{
                          fontSize: "9.5px",
                          color: META_TEXT,
                          flexShrink: 0,
                          whiteSpace: "nowrap",
                        }}
                      >
                        {item.year}
                      </span>
                    )}
                  </div>
                  {(item.role || item.organization) && (
                    <div style={{ fontSize: "10px", color: META_TEXT, marginTop: "2px" }}>
                      {[item.role, item.organization].filter(Boolean).join(" at ")}
                    </div>
                  )}
                  {item.description?.trim() && (
                    <p
                      style={{
                        margin: "4px 0 0",
                        fontSize: "9.5px",
                        color: BODY_TEXT,
                        lineHeight: 1.5,
                        textAlign: "justify",
                      }}
                    >
                      {item.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </MainSection>
        )}

        {/* ── Footer rule ── */}
        <div
          style={{
            marginTop: "14px",
            height: "1.5px",
            background: `linear-gradient(to right, ${ACCENT}, ${DIVIDER})`,
            borderRadius: "1px",
          }}
        />
      </div>
    </div>
  );
}

/* ─── Sub-components ─────────────────────────────────────── */

/** Dark sidebar block with section title */
function SideBlock({ title, children }) {
  return (
    <section
      style={{
        padding: "10px 14px 6px",
        borderTop: "1px solid rgba(255,255,255,0.09)",
      }}
    >
      <div
        style={{
          fontSize: "8.5px",
          fontWeight: 800,
          color: "rgba(255,255,255,0.48)",
          textTransform: "uppercase",
          letterSpacing: "2px",
          marginBottom: "9px",
        }}
      >
        {title}
      </div>
      {children}
    </section>
  );
}

/** Contact item: circle icon + label + value */
function ContactRow({ icon, label, value }) {
  return (
    <div style={{ display: "flex", alignItems: "flex-start", gap: "9px" }}>
      <div
        style={{
          width: "22px",
          height: "22px",
          borderRadius: "50%",
          background: "rgba(255,255,255,0.13)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
          fontSize: "10px",
          lineHeight: 1,
        }}
      >
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div
          style={{
            fontSize: "7px",
            fontWeight: 800,
            color: "rgba(255,255,255,0.45)",
            textTransform: "uppercase",
            letterSpacing: "0.9px",
            lineHeight: 1.2,
          }}
        >
          {label}
        </div>
        <div
          style={{
            fontSize: "9.5px",
            color: "rgba(255,255,255,0.88)",
            lineHeight: 1.4,
            wordBreak: "break-all",
            marginTop: "1px",
          }}
        >
          {value}
        </div>
      </div>
    </div>
  );
}

/** Main section with accent bar + uppercase title + divider line */
function MainSection({ title, accent, divider, children }) {
  return (
    <section style={{ marginBottom: "16px" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          marginBottom: "9px",
        }}
      >
        <div
          style={{
            width: "3px",
            height: "14px",
            background: accent,
            borderRadius: "1.5px",
            flexShrink: 0,
          }}
        />
        <h2
          style={{
            margin: 0,
            fontSize: "9.5px",
            fontWeight: 800,
            color: accent,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
          }}
        >
          {title}
        </h2>
        <div style={{ flex: 1, height: "1px", background: divider }} />
      </div>
      {children}
    </section>
  );
}

/**
 * Inline meta strip: STREAM: Technology | YEAR: 2021 | SCHOOL: ...
 */
function AcademicMeta({ items, accent, meta }) {
  if (!items || items.length === 0) return null;
  return (
    <div
      style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "0",
        rowGap: "3px",
        marginBottom: "8px",
        fontSize: "9.5px",
        color: meta,
      }}
    >
      {items.map((item, i) => (
        <span key={i} style={{ display: "flex", alignItems: "center" }}>
          <span
            style={{
              fontWeight: 800,
              color: accent,
              textTransform: "uppercase",
              fontSize: "8px",
              letterSpacing: "0.5px",
              marginRight: "3px",
            }}
          >
            {item.key}:
          </span>
          <span style={{ fontWeight: 500 }}>{item.val}</span>
          {i < items.length - 1 && (
            <span style={{ margin: "0 9px", opacity: 0.3 }}>|</span>
          )}
        </span>
      ))}
    </div>
  );
}

/**
 * Academic results table — dark header matching sidebar, clean rows
 */
function AcademicTable({ subjects, tableHdr, rowAlt, body, meta, divider }) {
  return (
    <div
      style={{
        width: "100%",
        borderRadius: "3px",
        overflow: "hidden",
        border: `1px solid ${divider}`,
      }}
    >
      {/* Header */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 72px",
          background: tableHdr,
          padding: "5px 12px",
        }}
      >
        <span
          style={{
            fontSize: "8.5px",
            fontWeight: 800,
            color: "rgba(255,255,255,0.82)",
            textTransform: "uppercase",
            letterSpacing: "1px",
          }}
        >
          Subject
        </span>
        <span
          style={{
            fontSize: "8.5px",
            fontWeight: 800,
            color: "rgba(255,255,255,0.82)",
            textTransform: "uppercase",
            letterSpacing: "1px",
            textAlign: "right",
          }}
        >
          Grade
        </span>
      </div>

      {/* Rows */}
      {subjects.map((s, i) => (
        <div
          key={i}
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 72px",
            padding: "5px 12px",
            background: i % 2 === 0 ? "#ffffff" : rowAlt,
            borderTop: `1px solid ${divider}40`,
          }}
        >
          <span style={{ fontSize: "10.5px", color: body, fontWeight: 400, lineHeight: 1.4 }}>
            {s.subject}
          </span>
          <span
            style={{
              fontSize: "10.5px",
              fontWeight: 700,
              color: s.grade ? body : meta,
              textAlign: "right",
              letterSpacing: "0.3px",
            }}
          >
            {s.grade || "—"}
          </span>
        </div>
      ))}
    </div>
  );
}

/* ── Colour utilities ────────────────────────────────────── */

function darkenHex(hex, factor) {
  try {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    const nr = Math.max(0, Math.round(r * (1 - factor)));
    const ng = Math.max(0, Math.round(g * (1 - factor)));
    const nb = Math.max(0, Math.round(b * (1 - factor)));
    return `#${nr.toString(16).padStart(2, "0")}${ng.toString(16).padStart(2, "0")}${nb.toString(16).padStart(2, "0")}`;
  } catch {
    return "#0f2419";
  }
}
