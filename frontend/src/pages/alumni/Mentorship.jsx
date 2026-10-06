import { useState, useEffect, useMemo, useRef } from "react";
import { ArrowLeft, ChevronDown, X, Send, CheckCircle2 } from "lucide-react";
import styles from "./Mentorship.module.css";

/* ========================================================================== */
/*  Content — copy for both roles, plus the FAQ list from the brief           */
/* ========================================================================== */

const ROLE_COPY = {
  mentee: {
    tabName: "Mentee",
    tabSub: "Mentee Profiles",
    registerLede: "Register as a mentee",
    registerBody:
      "This is an initiative by Velammal Engineering College and is managed by the Alumni team. " +
      "The goal is to encourage alumni and students to seek out mentors amongst the alumni community for their overall development in a professional and personal sense.",
    keywordQuestion: "Which areas are you looking for mentorship",
    keywordHint: "Higher Studies, Entrepreneurship, Civil Services, Finance, etc.",
    q1: "Why do you want an alumni mentor?",
    q2: "Describe in detail the field(s) that you require guidance in. E.g : Start-ups, research etc.",
    q3: "What is your progress/past work in this/these field(s)?",
    emptyText: "No Applications till yet !!",
  },
  mentor: {
    tabName: "Mentor",
    tabSub: "Mentor Profiles",
    registerLede: "Register as a mentor",
    registerBody:
      "Share your experience with the next generation of Velammal alumni. Sign up as a mentor and help " +
      "students and recent graduates move up in their career, skills, or life in general.",
    keywordQuestion: "Which areas can you offer mentorship in",
    keywordHint: "Higher Studies, Entrepreneurship, Civil Services, Finance, etc.",
    q1: "Why do you want to be an alumni mentor?",
    q2: "Describe in detail the field(s) you can guide mentees in. E.g : Start-ups, research etc.",
    q3: "What is your relevant experience / past work in this/these field(s)?",
    emptyText: "No mentors registered yet !!",
  },
};

const FAQS = [
  { q: "What is Alumni Mentorship Program?", a: "It's an initiative by Velammal Engineering College, managed by the Alumni team, to connect alumni with specific skills and expertise as mentors with mentees trying to move up in work, skill level, or life in general." },
  { q: "How important is filling the form?", a: "Very — your answers are how we match you with the right mentor or mentee. The more specific you are about the areas and your goals, the better the match." },
  { q: "Who will decide my mentor?", a: "The Alumni team reviews applications and matches mentees with mentors based on the areas of interest, experience, and availability stated in the form." },
  { q: "I don't have a particular career choice, should I still become a part of it?", a: "Yes. A mentor can help you explore options and figure out a direction — you don't need to have it all planned out first." },
  { q: "I know about my career path, should I still become a part of it?", a: "Yes. Even with a clear path, a mentor who has walked a similar road can help you move faster and avoid common pitfalls." },
  { q: "What is the eligibility criteria for participating in this program?", a: "Any verified Velammal Engineering College alumnus or current student can register as a mentee. Alumni with at least two years of post-graduation experience can register as a mentor." },
  { q: "Can I register as both a mentee and a mentor?", a: "Yes, you can submit applications under both tabs if you'd like to both receive and offer mentorship." },
  { q: "How long does matching usually take?", a: "It varies with mentor availability in your chosen area, but most applicants hear back within a couple of weeks." },
];

const SAMPLE_APPLICATIONS = {
  mentee: [
    {
      keywords: ["Higher Studies", "Research"],
      why: "I'm considering an MS abroad but don't know how to pick between a thesis-based and a coursework program, or how to approach professors for recommendation letters.",
      fields: "Guidance on shortlisting universities for MS in Computer Science, and understanding what makes a strong SOP and research statement.",
      progress: "Currently in my final year, GPA 8.6/10, one published poster at a student symposium, no research internship yet.",
    },
  ],
  mentor: [
    {
      keywords: ["Entrepreneurship", "Product"],
      why: "I've built and sold one startup and want to give back to students thinking about founding something of their own.",
      fields: "Early-stage product-market fit, fundraising basics, and how to validate an idea before quitting a day job.",
      progress: "Founded and exited a B2B SaaS company (2019–2024), currently advising two early-stage startups.",
    },
  ],
};

const STORAGE_KEY = "velammalAlumni.mentorship.applications.v1";
const MAX_KEYWORDS = 6;
const MAX_KEYWORD_LEN = 30;
const MAX_ANSWER_LEN = 800;

/* ========================================================================== */
/*  Storage helpers                                                           */
/* ========================================================================== */
function loadApplications() {
  try {
    if (typeof window === "undefined") return { mentee: [], mentor: [] };
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return {
      mentee: Array.isArray(parsed?.mentee) ? parsed.mentee : [],
      mentor: Array.isArray(parsed?.mentor) ? parsed.mentor : [],
    };
  } catch {
    return { mentee: [], mentor: [] };
  }
}
function saveApplications(apps) {
  try { if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(apps)); } catch { /* ignore */ }
}

/* ========================================================================== */
/*  Small building blocks                                                     */
/* ========================================================================== */
function KeywordInput({ values, onChange, placeholder }) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const v = draft.trim().slice(0, MAX_KEYWORD_LEN);
    const exists = values.some((x) => x.toLowerCase() === v.toLowerCase());
    if (v && !exists && values.length < MAX_KEYWORDS) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className={styles.keywordBox}>
      <div className={styles.keywordList}>
        {values.map((v) => (
          <span key={v} className={styles.keywordChip}>
            {v}
            <button type="button" className={styles.keywordRemove} aria-label={`Remove ${v}`} onClick={() => onChange(values.filter((x) => x !== v))}>
              <X size={12} />
            </button>
          </span>
        ))}
        {values.length < MAX_KEYWORDS && (
          <input
            value={draft}
            maxLength={MAX_KEYWORD_LEN}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(); } }}
            onBlur={commit}
            placeholder={values.length === 0 ? placeholder : ""}
            className={styles.keywordInput}
            aria-label="Add a keyword"
          />
        )}
      </div>
    </div>
  );
}

function FaqAccordion({ items, defaultCount = 6 }) {
  const [openIndex, setOpenIndex] = useState(null);
  const [showAll, setShowAll] = useState(false);
  const visible = showAll ? items : items.slice(0, defaultCount);
  return (
    <>
      <ol className={styles.faqList}>
        {visible.map((item, i) => {
          const open = openIndex === i;
          return (
            <li key={item.q} className={styles.faqItem}>
              <button
                type="button"
                className={styles.faqQuestion}
                aria-expanded={open}
                onClick={() => setOpenIndex(open ? null : i)}
              >
                <span className={styles.faqIndex}>{i + 1}.</span>
                <span>{item.q}</span>
                <ChevronDown size={15} className={`${styles.faqChevron} ${open ? styles.faqChevronOpen : ""}`} />
              </button>
              {open && <p className={styles.faqAnswer}>{item.a}</p>}
            </li>
          );
        })}
      </ol>
      {items.length > defaultCount && (
        <button type="button" className={styles.viewAllBtn} onClick={() => setShowAll((s) => !s)}>
          {showAll ? "Show less" : "View All"}
        </button>
      )}
    </>
  );
}

function SampleApplicationsModal({ role, onClose }) {
  const samples = SAMPLE_APPLICATIONS[role];
  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);
  const copy = ROLE_COPY[role];
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Sample applications" onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Sample Application</h3>
          <button type="button" className={styles.modalClose} aria-label="Close" onClick={onClose}><X size={16} /></button>
        </div>
        <div className={styles.modalBody}>
          {samples.map((s, i) => (
            <div key={i} className={styles.sampleEntry}>
              <p className={styles.sampleLabel}>{copy.keywordQuestion}</p>
              <div className={styles.applicationKeywords} style={{ marginBottom: 12 }}>
                {s.keywords.map((k) => <span key={k} className={styles.miniChip}>{k}</span>)}
              </div>
              <p className={styles.sampleLabel}>{copy.q1}</p>
              <p className={styles.sampleAnswer}>{s.why}</p>
              <p className={styles.sampleLabel}>{copy.q2}</p>
              <p className={styles.sampleAnswer}>{s.fields}</p>
              <p className={styles.sampleLabel}>{copy.q3}</p>
              <p className={styles.sampleAnswer}>{s.progress}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const EMPTY_FORM = { keywords: [], why: "", fields: "", progress: "" };

/* ========================================================================== */
/*  Page                                                                      */
/* ========================================================================== */
export default function Mentorship({ onBack }) {
  const [role, setRole] = useState("mentee"); // "mentee" | "mentor"
  const [view, setView] = useState("landing"); // "landing" | "form"
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [applications, setApplications] = useState(() => loadApplications());
  const [showSamples, setShowSamples] = useState(false);
  const [toast, setToast] = useState("");
  const whyRef = useRef(null);
  const copy = ROLE_COPY[role];
  const roleApplications = applications[role];

  useEffect(() => { if (toast) { const t = setTimeout(() => setToast(""), 2600); return () => clearTimeout(t); } return undefined; }, [toast]);

  const openForm = (forRole) => {
    if (forRole) setRole(forRole);
    setForm(EMPTY_FORM);
    setErrors({});
    setView("form");
  };

  const closeForm = () => { setView("landing"); setErrors({}); };

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  const validate = () => {
    const e = {};
    if (form.keywords.length === 0) e.keywords = "Add at least one area of interest";
    if (!form.why.trim()) e.why = "This field is required";
    else if (form.why.length > MAX_ANSWER_LEN) e.why = `Keep this under ${MAX_ANSWER_LEN} characters`;
    if (!form.fields.trim()) e.fields = "This field is required";
    else if (form.fields.length > MAX_ANSWER_LEN) e.fields = `Keep this under ${MAX_ANSWER_LEN} characters`;
    if (form.progress.length > MAX_ANSWER_LEN) e.progress = `Keep this under ${MAX_ANSWER_LEN} characters`;
    setErrors(e);
    if (Object.keys(e).length > 0) {
      // Focus the first field with an error so keyboard/screen-reader users land on it.
      if (e.why) whyRef.current?.focus();
    }
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const entry = {
      id: `${role}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role,
      keywords: form.keywords,
      why: form.why.trim(),
      fields: form.fields.trim(),
      progress: form.progress.trim(),
      submittedAt: new Date().toISOString(),
    };
    setApplications((prev) => {
      const next = { ...prev, [role]: [entry, ...prev[role]] };
      saveApplications(next);
      return next;
    });
    setForm(EMPTY_FORM);
    setView("landing");
    setToast(`Your ${role} application has been submitted!`);
  };

  const canSubmit = useMemo(() => form.keywords.length > 0 && form.why.trim() && form.fields.trim(), [form]);

  /* ---------------- Questionnaire form view ---------------- */
  if (view === "form") {
    return (
      <div className={styles.page}>
        <div className={styles.wrap}>
          <div className={styles.header}>
            <button type="button" className={styles.backBtn} aria-label="Back to Mentorship Program" onClick={closeForm}>
              <ArrowLeft size={18} />
            </button>
            <h1 className={styles.headerTitle}>Mentorship Program</h1>
          </div>

          <div className={styles.formTabsRow}>
            <span className={styles.formTab}>Questionnaire Form</span>
            <button type="button" className={styles.sampleLink} onClick={() => setShowSamples(true)}>View Sample Applications</button>
          </div>

          <div className={styles.formCard}>
            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="mt-keywords">{copy.keywordQuestion}<span className={styles.required}>*</span></label>
                <KeywordInput values={form.keywords} onChange={(v) => set("keywords", v)} placeholder="keyword" />
                <p className={styles.fieldHint}>{copy.keywordHint}</p>
                {errors.keywords && <p className={styles.errorText}>{errors.keywords}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="mt-why">{copy.q1}<span className={styles.required}>*</span></label>
                <textarea
                  id="mt-why" ref={whyRef} className={styles.textarea} value={form.why} maxLength={MAX_ANSWER_LEN}
                  onChange={(e) => set("why", e.target.value)} placeholder="Share a little about your motivation..."
                />
                <div className={styles.charCount}>
                  <span className={form.why.length >= MAX_ANSWER_LEN ? styles.charCountOver : ""}>{form.why.length}/{MAX_ANSWER_LEN}</span>
                </div>
                {errors.why && <p className={styles.errorText}>{errors.why}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="mt-fields">{copy.q2}<span className={styles.required}>*</span></label>
                <textarea
                  id="mt-fields" className={styles.textarea} value={form.fields} maxLength={MAX_ANSWER_LEN}
                  onChange={(e) => set("fields", e.target.value)} placeholder="Be as specific as you can..."
                />
                <div className={styles.charCount}>
                  <span className={form.fields.length >= MAX_ANSWER_LEN ? styles.charCountOver : ""}>{form.fields.length}/{MAX_ANSWER_LEN}</span>
                </div>
                {errors.fields && <p className={styles.errorText}>{errors.fields}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="mt-progress">{copy.q3}</label>
                <textarea
                  id="mt-progress" className={styles.textarea} value={form.progress} maxLength={MAX_ANSWER_LEN}
                  onChange={(e) => set("progress", e.target.value)} placeholder="Optional — it's fine if you're just starting out."
                />
                <div className={styles.charCount}>
                  <span className={form.progress.length >= MAX_ANSWER_LEN ? styles.charCountOver : ""}>{form.progress.length}/{MAX_ANSWER_LEN}</span>
                </div>
                {errors.progress && <p className={styles.errorText}>{errors.progress}</p>}
              </div>

              <div className={styles.formFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeForm}>Cancel</button>
                <button type="submit" className={styles.submitBtn} disabled={!canSubmit}>
                  <Send size={14} /> Submit Application
                </button>
              </div>
            </form>
          </div>
        </div>

        {showSamples && <SampleApplicationsModal role={role} onClose={() => setShowSamples(false)} />}
        {toast && (
          <div className={styles.toast} role="status">
            <CheckCircle2 size={18} color="#4ade80" />
            <span>{toast}</span>
          </div>
        )}
      </div>
    );
  }

  /* ---------------- Landing view ---------------- */
  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.header}>
          {onBack && (
            <button type="button" className={styles.backBtn} aria-label="Back" onClick={onBack}>
              <ArrowLeft size={18} />
            </button>
          )}
          <h1 className={styles.headerTitle}>Mentorship Program</h1>
        </div>

        <div className={styles.layout}>
          <div className={styles.main}>
            <div className={styles.tabs} role="tablist" aria-label="Mentorship role">
              {["mentee", "mentor"].map((r) => (
                <button
                  key={r}
                  type="button"
                  role="tab"
                  aria-selected={role === r}
                  data-testid={`tab-${r}`}
                  className={`${styles.tab} ${role === r ? styles.tabActive : ""}`}
                  onClick={() => setRole(r)}
                >
                  <span className={styles.tabName}>{ROLE_COPY[r].tabName}</span>
                  <span className={styles.tabSub}>{ROLE_COPY[r].tabSub}</span>
                </button>
              ))}
            </div>

            <div className={`${styles.card} ${styles.registerCard}`}>
              <h2 className={styles.cardTitle}>{copy.registerLede}</h2>
              <p className={styles.cardText}>{copy.registerBody}</p>
              <button type="button" data-testid="register-btn" className={styles.registerBtn} onClick={() => openForm()}>Register</button>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Mentorship Program</h2>
              <p className={styles.cardText}>
                Mentoring is one of the oldest forms of teaching. We, at Velammal Engineering College, would like to
                connect people with specific skills and expertise as mentors with their proteges who are trying to
                move up in work, skill level, or life, in general.
              </p>
              <p className={styles.cardText}>
                Register for this mentorship program by answering a few questions that will help our mentors
                understand your requirements and get in touch with you. This is an excellent opportunity to connect
                with someone who can offer you insight and help you move up the ladder in your career.
              </p>
              <p className={styles.cardText}>Looking forward to matching you with your guru!</p>
            </div>

            <div className={`${styles.card} ${roleApplications.length === 0 ? styles.statusCard : ""}`}>
              {roleApplications.length === 0 ? (
                <>
                  <p className={styles.statusText}>{copy.emptyText}</p>
                  <button type="button" data-testid="status-register-btn" className={styles.statusLink} onClick={() => openForm()}>
                    Register as a {role === "mentee" ? "Mentee" : "Mentor"}
                  </button>
                </>
              ) : (
                <>
                  <h2 className={styles.cardTitle}>Your {role === "mentee" ? "Mentee" : "Mentor"} Application{roleApplications.length > 1 ? "s" : ""}</h2>
                  {roleApplications.map((app) => (
                    <div key={app.id} className={styles.applicationItem}>
                      <div className={styles.applicationHead}>
                        <span className={styles.applicationRole}>{app.role}</span>
                        <span className={styles.applicationDate}>{new Date(app.submittedAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}</span>
                      </div>
                      <div className={styles.applicationKeywords}>
                        {app.keywords.map((k) => <span key={k} className={styles.miniChip}>{k}</span>)}
                      </div>
                      <p className={styles.applicationSnippet}>{app.why}</p>
                    </div>
                  ))}
                  <button type="button" className={styles.registerBtn} onClick={() => openForm()}>
                    Submit another application
                  </button>
                </>
              )}
            </div>
          </div>

          <aside>
            <div className={styles.faqCard}>
              <h2 className={styles.faqTitle}>FAQs</h2>
              <div className={styles.faqDivider} />
              <FaqAccordion items={FAQS} defaultCount={6} />
            </div>
          </aside>
        </div>
      </div>

      {toast && (
        <div className={styles.toast} role="status">
          <CheckCircle2 size={18} color="#4ade80" />
          <span>{toast}</span>
        </div>
      )}
    </div>
  );
}