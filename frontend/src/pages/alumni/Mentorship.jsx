import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ChevronDown, X, Send, CheckCircle2, Trash2 } from "lucide-react";
import styles from "./Mentorship.module.css";

/* ========================================================================== */
/*  Content (mentor only)                                                     */
/* ========================================================================== */

const COPY = {
  registerTitle: "Register as a mentor",
  registerBody:
    "This is an initiative by Velammal Engineering College, managed by the Alumni team. " +
    "Share your experience with students and fellow alumni, and help them move forward in their career, skills, or life in general.",
  keywordQuestion: "Which areas can you offer mentorship in",
  keywordHint: "Press Enter or comma to add. Example: Higher Studies, Entrepreneurship, Civil Services, Finance.",
  q1: "Why do you want to be an alumni mentor?",
  q2: "Describe in detail the field(s) you can guide mentees in. E.g : Start-ups, research etc.",
  q3: "What is your relevant experience / past work in this/these field(s)?",
  emptyText: "No mentor applications yet",
};

const FAQS = [
  { q: "What is the Alumni Mentorship Program?", a: "It's an initiative by Velammal Engineering College, managed by the Alumni team, that connects alumni with specific skills and expertise to students and fellow alumni who want to move up in work, skill level, or life in general." },
  { q: "Who can register as a mentor?", a: "Any verified Velammal Engineering College alumnus with at least two years of post-graduation experience can register as a mentor." },
  { q: "How important is filling the form?", a: "Very. Your answers are how the Alumni team matches you with the right mentee. The more specific you are about your areas and experience, the better the match." },
  { q: "Who decides which mentee I get matched with?", a: "The Alumni team reviews applications and matches mentors with mentees based on areas of interest, experience, and availability stated in the form." },
  { q: "How much time will mentoring take?", a: "That depends on you and your mentee. Most mentors have a short conversation every few weeks. You agree on the schedule together." },
  { q: "Can I list more than one area?", a: "Yes. You can add up to 6 areas in a single application, and you can submit another application later if your focus changes." },
  { q: "Can I withdraw my application?", a: "Yes. Use the Withdraw button next to your application on this page." },
  { q: "How long does matching usually take?", a: "It varies with mentee requests in your chosen area, but most applicants hear back within a couple of weeks." },
];

const SAMPLE_APPLICATION = {
  keywords: ["Entrepreneurship", "Product"],
  why: "I've built and sold one startup and want to give back to students thinking about founding something of their own.",
  fields: "Early-stage product-market fit, fundraising basics, and how to validate an idea before quitting a day job.",
  progress: "Founded and exited a B2B SaaS company (2019–2024), currently advising two early-stage startups.",
};

const STORAGE_KEY = "velammalAlumni.mentorship.mentors.v1";
const LEGACY_STORAGE_KEY = "velammalAlumni.mentorship.applications.v1"; // old shape: { mentee: [], mentor: [] }
const MAX_KEYWORDS = 6;
const MAX_KEYWORD_LEN = 30;
const MIN_ANSWER_LEN = 20;
const MAX_ANSWER_LEN = 800;

/* ========================================================================== */
/*  Storage helpers                                                           */
/* ========================================================================== */
function loadApplications() {
  try {
    if (typeof window === "undefined") return [];
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    }
    // One-time migration: keep any mentor applications saved by the old two-role page.
    const legacy = window.localStorage.getItem(LEGACY_STORAGE_KEY);
    if (legacy) {
      const parsed = JSON.parse(legacy);
      return Array.isArray(parsed?.mentor) ? parsed.mentor : [];
    }
    return [];
  } catch {
    return [];
  }
}

function saveApplications(apps) {
  try {
    if (typeof window !== "undefined") window.localStorage.setItem(STORAGE_KEY, JSON.stringify(apps));
  } catch {
    /* storage may be full or blocked; the page still works for this session */
  }
}

/* ========================================================================== */
/*  Small building blocks                                                     */
/* ========================================================================== */
function KeywordInput({ id, values, onChange, placeholder, invalid }) {
  const [draft, setDraft] = useState("");

  const commit = () => {
    const v = draft.trim().slice(0, MAX_KEYWORD_LEN);
    const exists = values.some((x) => x.toLowerCase() === v.toLowerCase());
    if (v && !exists && values.length < MAX_KEYWORDS) onChange([...values, v]);
    setDraft("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" || e.key === ",") {
      e.preventDefault();
      commit();
    } else if (e.key === "Backspace" && draft === "" && values.length > 0) {
      onChange(values.slice(0, -1));
    }
  };

  return (
    <div className={`${styles.keywordBox} ${invalid ? styles.keywordBoxInvalid : ""}`}>
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
            id={id}
            value={draft}
            maxLength={MAX_KEYWORD_LEN}
            onChange={(e) => setDraft(e.target.value.replace(/,/g, ""))}
            onKeyDown={handleKeyDown}
            onBlur={commit}
            placeholder={values.length === 0 ? placeholder : ""}
            className={styles.keywordInput}
            aria-invalid={invalid || undefined}
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
              <button type="button" className={styles.faqQuestion} aria-expanded={open} onClick={() => setOpenIndex(open ? null : i)}>
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
        <button
          type="button"
          className={styles.viewAllBtn}
          onClick={() => {
            setShowAll((s) => !s);
            setOpenIndex(null);
          }}
        >
          {showAll ? "Show less" : "View all"}
        </button>
      )}
    </>
  );
}

function SampleApplicationModal({ onClose }) {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
    };
  }, [onClose]);

  const s = SAMPLE_APPLICATION;
  return (
    <div className={styles.modalBackdrop} onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-label="Sample application" onClick={(e) => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h3 className={styles.modalTitle}>Sample application</h3>
          <button type="button" className={styles.modalClose} aria-label="Close" onClick={onClose}>
            <X size={16} />
          </button>
        </div>
        <div className={styles.modalBody}>
          <div className={styles.sampleEntry}>
            <p className={styles.sampleLabel}>{COPY.keywordQuestion}</p>
            <div className={styles.applicationKeywords} style={{ marginBottom: 12 }}>
              {s.keywords.map((k) => (
                <span key={k} className={styles.miniChip}>{k}</span>
              ))}
            </div>
            <p className={styles.sampleLabel}>{COPY.q1}</p>
            <p className={styles.sampleAnswer}>{s.why}</p>
            <p className={styles.sampleLabel}>{COPY.q2}</p>
            <p className={styles.sampleAnswer}>{s.fields}</p>
            <p className={styles.sampleLabel}>{COPY.q3}</p>
            <p className={styles.sampleAnswer}>{s.progress}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Toast({ message }) {
  if (!message) return null;
  return (
    <div className={styles.toast} role="status">
      <CheckCircle2 size={18} color="#4ade80" />
      <span>{message}</span>
    </div>
  );
}

const EMPTY_FORM = { keywords: [], why: "", fields: "", progress: "" };

/* ========================================================================== */
/*  Page                                                                      */
/* ========================================================================== */
export default function Mentorship({ onBack }) {
  const [view, setView] = useState("landing"); // "landing" | "form"
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});
  const [applications, setApplications] = useState(() => loadApplications());
  const [showSamples, setShowSamples] = useState(false);
  const [toast, setToast] = useState("");
  const keywordsId = "mt-keywords";
  const whyRef = useRef(null);
  const fieldsRef = useRef(null);
  const progressRef = useRef(null);

  // Auto-hide the toast.
  useEffect(() => {
    if (!toast) return undefined;
    const t = setTimeout(() => setToast(""), 2600);
    return () => clearTimeout(t);
  }, [toast]);

  // Start every screen change at the top.
  useEffect(() => {
    if (typeof window !== "undefined") window.scrollTo({ top: 0 });
  }, [view]);

  const openForm = () => {
    setForm(EMPTY_FORM);
    setErrors({});
    setView("form");
  };

  const closeForm = () => {
    setView("landing");
    setErrors({});
  };

  const set = (key, value) => {
    setForm((f) => ({ ...f, [key]: value }));
    // Clear that field's error as soon as the person edits it.
    setErrors((prev) => (prev[key] ? { ...prev, [key]: undefined } : prev));
  };

  const validate = () => {
    const e = {};
    const why = form.why.trim();
    const fields = form.fields.trim();
    const progress = form.progress.trim();

    if (form.keywords.length === 0) e.keywords = "Add at least one area you can mentor in.";

    if (!why) e.why = "This field is required.";
    else if (why.length < MIN_ANSWER_LEN) e.why = `Write at least ${MIN_ANSWER_LEN} characters so we can understand your motivation.`;
    else if (why.length > MAX_ANSWER_LEN) e.why = `Keep this under ${MAX_ANSWER_LEN} characters.`;

    if (!fields) e.fields = "This field is required.";
    else if (fields.length < MIN_ANSWER_LEN) e.fields = `Write at least ${MIN_ANSWER_LEN} characters so we can match you well.`;
    else if (fields.length > MAX_ANSWER_LEN) e.fields = `Keep this under ${MAX_ANSWER_LEN} characters.`;

    if (progress.length > MAX_ANSWER_LEN) e.progress = `Keep this under ${MAX_ANSWER_LEN} characters.`;

    setErrors(e);

    // Move focus to the first field with an error.
    if (e.keywords) document.getElementById(keywordsId)?.focus();
    else if (e.why) whyRef.current?.focus();
    else if (e.fields) fieldsRef.current?.focus();
    else if (e.progress) progressRef.current?.focus();

    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;

    const entry = {
      id: `mentor-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      role: "mentor",
      keywords: form.keywords,
      why: form.why.trim(),
      fields: form.fields.trim(),
      progress: form.progress.trim(),
      submittedAt: new Date().toISOString(),
    };

    const next = [entry, ...applications];
    setApplications(next);
    saveApplications(next);

    setForm(EMPTY_FORM);
    setErrors({});
    setView("landing");
    setToast("Your mentor application has been submitted!");
  };

  const handleWithdraw = (id) => {
    if (typeof window !== "undefined" && !window.confirm("Withdraw this mentor application?")) return;
    const next = applications.filter((a) => a.id !== id);
    setApplications(next);
    saveApplications(next);
    setToast("Your application has been withdrawn.");
  };

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
            <span className={styles.formTab}>Mentor questionnaire</span>
            <button type="button" className={styles.sampleLink} onClick={() => setShowSamples(true)}>View sample application</button>
          </div>

          <div className={styles.formCard}>
            <form onSubmit={handleSubmit} noValidate>
              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor={keywordsId}>
                  {COPY.keywordQuestion}<span className={styles.required}>*</span>
                </label>
                <KeywordInput id={keywordsId} values={form.keywords} onChange={(v) => set("keywords", v)} placeholder="Type an area and press Enter" invalid={!!errors.keywords} />
                <p className={styles.fieldHint}>{COPY.keywordHint}</p>
                {errors.keywords && <p className={styles.errorText} role="alert">{errors.keywords}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="mt-why">
                  {COPY.q1}<span className={styles.required}>*</span>
                </label>
                <textarea
                  id="mt-why"
                  ref={whyRef}
                  className={`${styles.textarea} ${errors.why ? styles.textareaInvalid : ""}`}
                  value={form.why}
                  maxLength={MAX_ANSWER_LEN}
                  aria-invalid={!!errors.why}
                  onChange={(e) => set("why", e.target.value)}
                  placeholder="Share a little about your motivation..."
                />
                <div className={styles.charCount}>
                  <span className={form.why.length >= MAX_ANSWER_LEN ? styles.charCountOver : ""}>{form.why.length}/{MAX_ANSWER_LEN}</span>
                </div>
                {errors.why && <p className={styles.errorText} role="alert">{errors.why}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="mt-fields">
                  {COPY.q2}<span className={styles.required}>*</span>
                </label>
                <textarea
                  id="mt-fields"
                  ref={fieldsRef}
                  className={`${styles.textarea} ${errors.fields ? styles.textareaInvalid : ""}`}
                  value={form.fields}
                  maxLength={MAX_ANSWER_LEN}
                  aria-invalid={!!errors.fields}
                  onChange={(e) => set("fields", e.target.value)}
                  placeholder="Be as specific as you can..."
                />
                <div className={styles.charCount}>
                  <span className={form.fields.length >= MAX_ANSWER_LEN ? styles.charCountOver : ""}>{form.fields.length}/{MAX_ANSWER_LEN}</span>
                </div>
                {errors.fields && <p className={styles.errorText} role="alert">{errors.fields}</p>}
              </div>

              <div className={styles.field}>
                <label className={styles.fieldLabel} htmlFor="mt-progress">{COPY.q3}</label>
                <textarea
                  id="mt-progress"
                  ref={progressRef}
                  className={`${styles.textarea} ${errors.progress ? styles.textareaInvalid : ""}`}
                  value={form.progress}
                  maxLength={MAX_ANSWER_LEN}
                  aria-invalid={!!errors.progress}
                  onChange={(e) => set("progress", e.target.value)}
                  placeholder="Optional. Mention roles, companies, or projects."
                />
                <div className={styles.charCount}>
                  <span className={form.progress.length >= MAX_ANSWER_LEN ? styles.charCountOver : ""}>{form.progress.length}/{MAX_ANSWER_LEN}</span>
                </div>
                {errors.progress && <p className={styles.errorText} role="alert">{errors.progress}</p>}
              </div>

              <div className={styles.formFooter}>
                <button type="button" className={styles.cancelBtn} onClick={closeForm}>Cancel</button>
                <button type="submit" className={styles.submitBtn}>
                  <Send size={14} /> Submit application
                </button>
              </div>
            </form>
          </div>
        </div>

        {showSamples && <SampleApplicationModal onClose={() => setShowSamples(false)} />}
        <Toast message={toast} />
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
            {/* Register card */}
            <div className={`${styles.card} ${styles.registerCard}`}>
              <h2 className={styles.cardTitle}>{COPY.registerTitle}</h2>
              <p className={styles.cardText}>{COPY.registerBody}</p>
              <button type="button" data-testid="register-btn" className={styles.registerBtn} onClick={openForm}>Register</button>
            </div>

            <div className={styles.card}>
              <h2 className={styles.cardTitle}>About the program</h2>
              <p className={styles.cardText}>
                Mentoring is one of the oldest forms of teaching. We, at Velammal Engineering College, would like to connect
                people with specific skills and expertise as mentors with those who are trying to move up in work, skill
                level, or life in general.
              </p>
              <p className={styles.cardText}>
                Register by answering a few questions that help the Alumni team understand your experience and match you
                with the right mentee. It is an excellent opportunity to give back and help others move up the ladder in
                their careers.
              </p>
            </div>

            <div className={`${styles.card} ${applications.length === 0 ? styles.statusCard : ""}`}>
              {applications.length === 0 ? (
                <>
                  <p className={styles.statusText}>{COPY.emptyText}</p>
                  <button type="button" data-testid="status-register-btn" className={styles.statusLink} onClick={openForm}>
                    Register as a mentor
                  </button>
                </>
              ) : (
                <>
                  <h2 className={styles.cardTitle}>Your mentor application{applications.length > 1 ? "s" : ""}</h2>
                  {applications.map((app) => (
                    <div key={app.id} className={styles.applicationItem}>
                      <div className={styles.applicationHead}>
                        <span className={styles.applicationDate}>
                          Submitted {new Date(app.submittedAt).toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" })}
                        </span>
                        <button type="button" className={styles.withdrawBtn} aria-label="Withdraw this application" onClick={() => handleWithdraw(app.id)}>
                          <Trash2 size={13} /> Withdraw
                        </button>
                      </div>
                      <div className={styles.applicationKeywords}>
                        {app.keywords.map((k) => (
                          <span key={k} className={styles.miniChip}>{k}</span>
                        ))}
                      </div>
                      <p className={styles.applicationSnippet}>{app.why}</p>
                    </div>
                  ))}
                  <button type="button" className={styles.registerBtn} onClick={openForm}>
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

      <Toast message={toast} />
    </div>
  );
}