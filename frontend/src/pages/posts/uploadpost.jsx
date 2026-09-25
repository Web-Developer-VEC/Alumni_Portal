import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import {
  ArrowLeft,
  CheckCircle2,
  Pencil,
  FileText,
  Tag,
  Bold,
  Italic,
  Underline,
  List,
  ListOrdered,
  Link2,
  Image as ImageIcon,
  Building2,
  User,
  MapPin,
  IndianRupee,
  GraduationCap,
  Code2,
  Calendar,
  UploadCloud,
  Send,
  Save,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  File as FileIcon,
} from "lucide-react";
import styles from "./uploadpost.module.css";

const DRAFT_KEY = "alumniPortal.createPost.draft.v1";
const AUTOSAVE_DELAY_MS = 800;

const pad2 = (n) => String(n).padStart(2, "0");

const formatDisplayDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
};

const formatRelativeTime = (date) => {
  if (!date) return "";
  const seconds = Math.round((Date.now() - date.getTime()) / 1000);
  if (seconds < 5) return "just now";
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.round(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.round(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return date.toLocaleDateString();
};

/* -------------------------------------------------------------------------- */
/*  CustomDateTimePicker — ported from Outpass.jsx                            */
/* -------------------------------------------------------------------------- */
function CustomDateTimePicker({ value, onChange, onClose, minDateTime }) {
  const initial = value ? new Date(value) : new Date();

  const [pickerStep, setPickerStep] = useState("date");
  const [selectedDate, setSelectedDate] = useState(initial);
  const [currentMonth, setCurrentMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));
  const [hour, setHour] = useState(initial.getHours() % 12 || 12);
  const [minute, setMinute] = useState(initial.getMinutes());
  const [period, setPeriod] = useState(initial.getHours() >= 12 ? "PM" : "AM");
  const [clockMode, setClockMode] = useState("hour");

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthName = currentMonth.toLocaleString("default", { month: "long" });

  const floor = minDateTime ? new Date(minDateTime) : new Date();
  floor.setHours(0, 0, 0, 0);

  const isDateDisabled = (day) => {
    const candidate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    candidate.setHours(0, 0, 0, 0);
    return candidate < floor;
  };

  const selectDate = (day) => {
    if (isDateDisabled(day)) return;
    setSelectedDate(new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day));
    setPickerStep("time");
    setClockMode("hour");
  };

  const selectHour = (h) => { setHour(h); setClockMode("minute"); };
  const selectMinute = (m) => setMinute(m);

  const confirm = () => {
    let h = hour % 12;
    if (period === "PM") h += 12;
    const finalDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), selectedDate.getDate(), h, minute);
    const formatted = `${finalDate.getFullYear()}-${pad2(finalDate.getMonth() + 1)}-${pad2(finalDate.getDate())}T${pad2(finalDate.getHours())}:${pad2(finalDate.getMinutes())}`;
    onChange(formatted);
    onClose();
  };

  const getClockStyle = (index, total) => {
    const angle = (index / total) * 360 - 90;
    const radius = 40;
    const x = 50 + radius * Math.cos((angle * Math.PI) / 180);
    const y = 50 + radius * Math.sin((angle * Math.PI) / 180);
    return { left: `${x}%`, top: `${y}%` };
  };

  return createPortal(
    <div className={styles.pickerBackdrop} onClick={onClose}>
      <div className={styles.datetimePicker} onClick={(e) => e.stopPropagation()}>
        <div className={styles.pickerLeft}>
          <div className={styles.pickerWeekday}>{selectedDate.toLocaleString("default", { weekday: "long" })}</div>
          <div className={styles.pickerMonth}>{selectedDate.toLocaleString("default", { month: "short" })}</div>
          <div className={styles.pickerDay}>{selectedDate.getDate()}</div>
          <div className={styles.pickerYear}>{selectedDate.getFullYear()}</div>
          <div className={styles.pickerLeftTime}>
            Time
            <strong>{pad2(hour)}:{pad2(minute)} {period}</strong>
          </div>
        </div>

        <div className={styles.pickerRight}>
          {pickerStep === "date" && (
            <>
              <div className={styles.calendarHeader}>
                <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
                  <ChevronLeft size={18} />
                </button>
                <span>{monthName} {currentMonth.getFullYear()}</span>
                <button type="button" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
                  <ChevronRight size={18} />
                </button>
              </div>

              <div className={styles.calendarWeekdays}>
                {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => <span key={i}>{d}</span>)}
              </div>

              <div className={styles.calendarDays}>
                {Array.from({ length: firstDay }).map((_, i) => <span key={`empty-${i}`} />)}
                {Array.from({ length: daysInMonth }, (_, i) => {
                  const day = i + 1;
                  const disabled = isDateDisabled(day);
                  const isSelected = selectedDate.getDate() === day && selectedDate.getMonth() === currentMonth.getMonth() && selectedDate.getFullYear() === currentMonth.getFullYear();
                  const isToday = new Date().toDateString() === new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day).toDateString();
                  return (
                    <button
                      type="button"
                      key={day}
                      disabled={disabled}
                      className={`${styles.calendarDay} ${isSelected ? styles.calendarSelected : ""} ${isToday && !isSelected ? styles.calendarToday : ""}`}
                      onClick={() => selectDate(day)}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </>
          )}

          {pickerStep === "time" && (
            <div className={styles.clockContainer}>
              <div className={styles.timeTitle}>Select Time</div>
              <div className={styles.timeDisplay}>
                <button type="button" className={clockMode === "hour" ? styles.timeActive : ""} onClick={() => setClockMode("hour")}>{pad2(hour)}</button>
                <span className={styles.timeColon}>:</span>
                <button type="button" className={clockMode === "minute" ? styles.timeActive : ""} onClick={() => setClockMode("minute")}>{pad2(minute)}</button>
                <div className={styles.period}>
                  <button type="button" className={period === "AM" ? styles.periodActive : ""} onClick={() => setPeriod("AM")}>AM</button>
                  <button type="button" className={period === "PM" ? styles.periodActive : ""} onClick={() => setPeriod("PM")}>PM</button>
                </div>
              </div>

              <div className={styles.clock}>
                <div className={styles.clockCenter} />
                {clockMode === "hour" && Array.from({ length: 12 }, (_, i) => {
                  const number = i + 1;
                  return (
                    <button type="button" key={number} className={`${styles.clockNumber} ${hour === number ? styles.clockSelected : ""}`}
                      style={getClockStyle(number, 12)} onClick={() => selectHour(number)}>
                      {number}
                    </button>
                  );
                })}
                {clockMode === "minute" && Array.from({ length: 12 }, (_, i) => {
                  const number = i * 5;
                  return (
                    <button type="button" key={number} className={`${styles.clockNumber} ${minute === number ? styles.clockSelected : ""}`}
                      style={getClockStyle(i, 12)} onClick={() => selectMinute(number)}>
                      {pad2(number)}
                    </button>
                  );
                })}
              </div>

              <div className={styles.timeActionsRow}>
                <button type="button" className={styles.timeBack} onClick={() => setPickerStep("date")}>Back</button>
                <div className={styles.timeActionsRight}>
                  <button type="button" onClick={onClose}>Cancel</button>
                  <button type="button" className={styles.timeOk} onClick={confirm}>OK</button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>,
    document.body
  );
}

/* -------------------------------------------------------------------------- */
/*  Field primitives                                                          */
/* -------------------------------------------------------------------------- */
function Field({ label, required, children, error }) {
  return (
    <div className={styles.field}>
      <span className={styles.label}>{label}{required && <span className={styles.required}>*</span>}</span>
      {children}
      {error && <span className={styles.errorText}>{error}</span>}
    </div>
  );
}

function IconInput({ icon: IconCmp, counter, ...props }) {
  return (
    <div>
      <div className={styles.inputWrap}>
        <span className={styles.inputIcon}><IconCmp size={15} /></span>
        <input {...props} className={styles.input} />
      </div>
      {counter && <div className={styles.counterRow}><span className={styles.counter}>{counter}</span></div>}
    </div>
  );
}

function IconSelect({ icon: IconCmp, children, ...props }) {
  return (
    <div className={styles.inputWrap}>
      <span className={styles.inputIcon}><IconCmp size={15} /></span>
      <select {...props} className={styles.select}>{children}</select>
      <span className={styles.selectChevron}><ChevronDown size={15} /></span>
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <label className={styles.checkboxItem}>
      <span
        className={`${styles.checkboxBox} ${checked ? styles.checkboxBoxChecked : ""}`}
        onClick={() => onChange(!checked)}
      >
        {checked && <Check size={12} />}
      </span>
      <span className={styles.checkboxLabel} onClick={() => onChange(!checked)}>{label}</span>
    </label>
  );
}

function ChipInput({ values, onChange, placeholder, limit = 24, max = 10 }) {
  const [draft, setDraft] = useState("");
  const commit = () => {
    const v = draft.trim().slice(0, limit);
    if (v && !values.includes(v) && values.length < max) onChange([...values, v]);
    setDraft("");
  };
  return (
    <div className={styles.chipBox}>
      <div className={styles.chipList}>
        {values.map((v) => (
          <span key={v} className={styles.chip}>
            {v}
            <button type="button" onClick={() => onChange(values.filter((x) => x !== v))} className={styles.chipRemove} aria-label={`Remove ${v}`}>
              <X size={12} />
            </button>
          </span>
        ))}
        {values.length < max && (
          <input value={draft} maxLength={limit} onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter" || e.key === ",") { e.preventDefault(); commit(); } }}
            onBlur={commit} placeholder={placeholder} className={styles.chipInput} />
        )}
      </div>
    </div>
  );
}

function DateTimeField({ label, value, onOpen }) {
  return (
    <Field label={label}>
      <div className={styles.datetimeDisplay} onClick={onOpen}>
        <span className={styles.inputIcon}><Calendar size={15} /></span>
        <span className={value ? styles.datetimeValue : styles.datetimePlaceholder}>
          {value ? formatDisplayDateTime(value) : `Select ${label.toLowerCase()}`}
        </span>
      </div>
    </Field>
  );
}

function Section({ number, title, desc, children }) {
  return (
    <>
      <div className={styles.sectionHead}>
        <div className={styles.sectionNumber}>{number}</div>
        <div>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <p className={styles.sectionDesc}>{desc}</p>
        </div>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </>
  );
}

/* -------------------------------------------------------------------------- */
/*  Rich-text-lite toolbar — wraps selection in the content textarea with     */
/*  markdown-style markers. Not a full WYSIWYG editor.                        */
/* -------------------------------------------------------------------------- */
function wrapSelection(textareaRef, before, after = before) {
  const el = textareaRef.current;
  if (!el) return null;
  const { selectionStart: s, selectionEnd: e, value } = el;
  const selected = value.slice(s, e) || "text";
  const next = value.slice(0, s) + before + selected + after + value.slice(e);
  requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + before.length, s + before.length + selected.length); });
  return next;
}
function insertLinePrefix(textareaRef, prefix) {
  const el = textareaRef.current;
  if (!el) return null;
  const { selectionStart: s, value } = el;
  const lineStart = value.lastIndexOf("\n", s - 1) + 1;
  const next = value.slice(0, lineStart) + prefix + value.slice(lineStart);
  requestAnimationFrame(() => { el.focus(); el.setSelectionRange(s + prefix.length, s + prefix.length); });
  return next;
}

/* -------------------------------------------------------------------------- */
/*  Constraints & schema-shaped state                                         */
/* -------------------------------------------------------------------------- */
const LIMITS = { title: 150, content: 1000, chip: 24, maxChips: 10, maxFiles: 6 };

const EMPTY_POST = {
  title: "", type: "Full-time", content: "", link: "",
  company: "", role: "", location: "", package: "", eligibility: "", skills: [],
  freshers: false, remote: false, referralAvailable: false,
  startTime: "", endTime: "", deadline: "",
};

// Merge a persisted draft onto EMPTY_POST so an older/partial shape in
// localStorage never crashes the form if the schema changes later.
function sanitizeDraft(raw) {
  if (!raw || typeof raw !== "object") return null;
  const merged = { ...EMPTY_POST };
  for (const key of Object.keys(EMPTY_POST)) {
    if (key === "skills") {
      merged.skills = Array.isArray(raw.skills) ? raw.skills.filter((s) => typeof s === "string") : [];
    } else if (typeof raw[key] === typeof EMPTY_POST[key]) {
      merged[key] = raw[key];
    }
  }
  return merged;
}

function isPostEmpty(post) {
  return Object.entries(post).every(([key, value]) => {
    if (key === "type") return true; // default select value doesn't count as "content"
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "boolean") return value === false;
    return !value;
  });
}

export default function UploadPost({ onPublish, onCancel }) {
  const [post, setPost] = useState(EMPTY_POST);
  const [files, setFiles] = useState([]); // becomes fileUrls after the server uploads them
  const [activePicker, setActivePicker] = useState(null); // null | "start" | "end" | "deadline"
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);

  // ---- Draft persistence (localStorage) ----------------------------------
  const [draftStatus, setDraftStatus] = useState("idle"); // idle | saving | saved | error
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const hasLoadedDraft = useRef(false);
  const isFirstRender = useRef(true);
  const autosaveTimer = useRef(null);

  const writeDraft = useCallback((data) => {
    try {
      if (typeof window === "undefined") return false;
      if (isPostEmpty(data)) {
        window.localStorage.removeItem(DRAFT_KEY);
        return true;
      }
      window.localStorage.setItem(DRAFT_KEY, JSON.stringify({ post: data, savedAt: new Date().toISOString() }));
      return true;
    } catch {
      return false;
    }
  }, []);

  // Load any saved draft once, on mount.
  useEffect(() => {
    try {
      if (typeof window === "undefined") { hasLoadedDraft.current = true; return; }
      const raw = window.localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        const restored = sanitizeDraft(parsed?.post);
        if (restored && !isPostEmpty(restored)) {
          setPost(restored);
          const savedAt = parsed?.savedAt ? new Date(parsed.savedAt) : new Date();
          setLastSavedAt(Number.isNaN(savedAt.getTime()) ? new Date() : savedAt);
          setDraftStatus("saved");
        }
      }
    } catch {
      // Corrupt/unavailable storage — start with a clean form.
    } finally {
      hasLoadedDraft.current = true;
    }
  }, []);

  // Debounced autosave whenever the post changes (after the initial load).
  useEffect(() => {
    if (!hasLoadedDraft.current) return;
    if (isFirstRender.current) { isFirstRender.current = false; return; }

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);

    if (isPostEmpty(post)) {
      writeDraft(post);
      setDraftStatus("idle");
      setLastSavedAt(null);
      return;
    }

    setDraftStatus("saving");
    autosaveTimer.current = setTimeout(() => {
      const ok = writeDraft(post);
      setDraftStatus(ok ? "saved" : "error");
      setLastSavedAt(ok ? new Date() : null);
    }, AUTOSAVE_DELAY_MS);

    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post, writeDraft]);

  const saveDraftNow = () => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    setDraftStatus("saving");
    const ok = writeDraft(post);
    setDraftStatus(ok ? "saved" : "error");
    setLastSavedAt(ok ? new Date() : null);
  };

  const clearDraft = useCallback(() => {
    try { if (typeof window !== "undefined") window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    setDraftStatus("idle");
    setLastSavedAt(null);
  }, []);

  // ---- Form state helpers --------------------------------------------------
  const set = (key, value) => setPost((p) => ({ ...p, [key]: value }));

  const isValidUrl = (v) => { try { const u = new URL(v); return u.protocol === "http:" || u.protocol === "https:"; } catch { return false; } };

  const applyToolbar = (fn) => {
    const next = fn(contentRef);
    if (next !== null) set("content", next.slice(0, LIMITS.content));
  };

  const handleFilesSelected = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (files.length + incoming.length > LIMITS.maxFiles) { window.alert(`Up to ${LIMITS.maxFiles} files.`); return; }
    const oversized = incoming.find((f) => f.size > 10 * 1024 * 1024);
    if (oversized) { window.alert("File size exceeds 10MB limit."); return; }
    const withPreviews = incoming.map((file) => ({
      file, id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      url: file.type.startsWith("image/") ? URL.createObjectURL(file) : null,
    }));
    setFiles((prev) => [...prev, ...withPreviews]);
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((f) => f.id !== id);
    });
  };

  const handleStartChange = (val) => {
    if (post.endTime && new Date(val) > new Date(post.endTime)) {
      window.alert("Start time cannot be after the end time.");
      set("endTime", "");
    }
    set("startTime", val);
  };

  const handleEndChange = (val) => {
    if (post.startTime && new Date(val) < new Date(post.startTime)) {
      window.alert("End time cannot be before the start time.");
      return;
    }
    set("endTime", val);
  };

  const validate = () => {
    const e = {};
    if (!post.title.trim()) e.title = "Title is required";
    if (!post.content.trim()) e.content = "Content is required";
    if (post.link.trim() && !isValidUrl(post.link.trim())) e.link = "Enter a valid link starting with http:// or https://";
    if (post.startTime && post.endTime && new Date(post.endTime) < new Date(post.startTime)) e.endTime = "End time cannot be before start time";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;
    if (!validate()) return;
    setIsSubmitting(true);

    const formData = new FormData();
    formData.append("title", post.title.trim());
    formData.append("content", post.content.trim());
    if (post.link.trim()) formData.append("link", post.link.trim());
    if (post.startTime) formData.append("startTime", new Date(post.startTime).toISOString());
    if (post.endTime) formData.append("endTime", new Date(post.endTime).toISOString());
    if (post.deadline) formData.append("deadline", new Date(post.deadline).toISOString());
    if (post.company) formData.append("company", post.company);
    if (post.role) formData.append("role", post.role);
    if (post.eligibility) formData.append("eligibility", post.eligibility);
    if (post.location) formData.append("location", post.location);
    formData.append("type", post.type);
    formData.append("freshers", post.freshers);
    formData.append("remote", post.remote);
    formData.append("referralAvailable", post.referralAvailable);
    if (post.package) formData.append("package", post.package);
    post.skills.forEach((s) => formData.append("skills", s));
    files.forEach((f) => formData.append("files", f.file)); // server converts these to fileUrls

    try {
      await onPublish?.(formData);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2600);
      setPost(EMPTY_POST);
      setFiles([]);
      clearDraft();
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    onCancel?.();
  };

  const canSubmit = useMemo(() => post.title.trim() && post.content.trim(), [post]);

  const draftBadgeClass = draftStatus === "saving"
    ? `${styles.draftBadge} ${styles.draftBadgeSaving}`
    : draftStatus === "error"
      ? `${styles.draftBadge} ${styles.draftBadgeError}`
      : styles.draftBadge;

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.topBar}>
          <button type="button" className={styles.backLink} onClick={handleCancel}>
            <ArrowLeft size={16} /> All Posts
          </button>

          {draftStatus !== "idle" && (
            <div className={draftBadgeClass}>
              {draftStatus === "saving" && <><span className={styles.draftSpinner} />Saving draft…</>}
              {draftStatus === "saved" && <><CheckCircle2 size={13} /> Draft saved{lastSavedAt ? ` · ${formatRelativeTime(lastSavedAt)}` : ""}</>}
              {draftStatus === "error" && <>Couldn't save draft</>}
            </div>
          )}
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.headerIconBox}><Pencil size={18} /></div>
            <div>
              <h1 className={styles.headerTitle}>Create a Post</h1>
              <p className={styles.headerSubtitle}>Share job opportunities, events, updates and more with the alumni community.</p>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <Section number="01" title="Post Information" desc="Add a catchy title and write the details.">
              <div className={styles.grid2}>
                <Field label="Title" required error={errors.title}>
                  <IconInput icon={FileText} value={post.title} maxLength={LIMITS.title}
                    onChange={(e) => set("title", e.target.value)} placeholder="Enter post title"
                    counter={`${post.title.length}/${LIMITS.title}`} />
                </Field>
                <Field label="Post Type">
                  <IconSelect icon={Tag} value={post.type} onChange={(e) => set("type", e.target.value)}>
                    <option value="Full-time">Full-time</option>
                    <option value="Internship">Internship</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                  </IconSelect>
                </Field>
              </div>

              <Field label="Content" required error={errors.content}>
                <div className={styles.editorBox}>
                  <div className={styles.toolbar}>
                    <button type="button" className={styles.toolbarBtn} title="Bold" onClick={() => applyToolbar((r) => wrapSelection(r, "**"))}><Bold size={14} /></button>
                    <button type="button" className={styles.toolbarBtn} title="Italic" onClick={() => applyToolbar((r) => wrapSelection(r, "*"))}><Italic size={14} /></button>
                    <button type="button" className={styles.toolbarBtn} title="Underline" onClick={() => applyToolbar((r) => wrapSelection(r, "__"))}><Underline size={14} /></button>
                    <div className={styles.toolbarDivider} />
                    <button type="button" className={styles.toolbarBtn} title="Bullet list" onClick={() => applyToolbar((r) => insertLinePrefix(r, "- "))}><List size={14} /></button>
                    <button type="button" className={styles.toolbarBtn} title="Numbered list" onClick={() => applyToolbar((r) => insertLinePrefix(r, "1. "))}><ListOrdered size={14} /></button>
                    <div className={styles.toolbarDivider} />
                    <button type="button" className={styles.toolbarBtn} title="Insert link" onClick={() => {
                      const url = window.prompt("Link URL:");
                      if (url) applyToolbar((r) => wrapSelection(r, "[", `](${url})`));
                    }}><Link2 size={14} /></button>
                    <button type="button" className={styles.toolbarBtn} title="Insert image URL" onClick={() => {
                      const url = window.prompt("Image URL:");
                      if (url) applyToolbar((r) => wrapSelection(r, "![", `](${url})`));
                    }}><ImageIcon size={14} /></button>
                  </div>
                  <textarea
                    ref={contentRef}
                    className={styles.editorTextarea}
                    rows={5}
                    maxLength={LIMITS.content}
                    value={post.content}
                    onChange={(e) => set("content", e.target.value)}
                    placeholder="Write your post content here..."
                  />
                  <div className={styles.editorCounter}><span className={styles.counter}>{post.content.length}/{LIMITS.content}</span></div>
                </div>
              </Field>
            </Section>

            <Section number="02" title="Job / Opportunity Details" desc="Fill in the job or opportunity related information.">
              <div className={styles.grid3}>
                <Field label="Company"><IconInput icon={Building2} value={post.company} onChange={(e) => set("company", e.target.value)} placeholder="Enter company name" /></Field>
                <Field label="Role / Position"><IconInput icon={User} value={post.role} onChange={(e) => set("role", e.target.value)} placeholder="Enter role or position" /></Field>
                <Field label="Location"><IconInput icon={MapPin} value={post.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g., Chennai" /></Field>
              </div>
              <div className={styles.grid2}>
                <Field label="Package"><IconInput icon={IndianRupee} value={post.package} onChange={(e) => set("package", e.target.value)} placeholder="e.g., 6.5 LPA" /></Field>
                <Field label="Eligibility"><IconInput icon={GraduationCap} value={post.eligibility} onChange={(e) => set("eligibility", e.target.value)} placeholder="e.g., B.Tech, Any Graduate" /></Field>
              </div>
              <Field label="Skills">
                <ChipInput values={post.skills} onChange={(v) => set("skills", v)} placeholder="e.g. React, SQL, System Design" limit={LIMITS.chip} max={LIMITS.maxChips} />
              </Field>
              <div className={styles.checkboxRow}>
                <Checkbox checked={post.freshers} onChange={(v) => set("freshers", v)} label="Open for Freshers" />
                <Checkbox checked={post.remote} onChange={(v) => set("remote", v)} label="Remote Work" />
                <Checkbox checked={post.referralAvailable} onChange={(v) => set("referralAvailable", v)} label="Referral Available" />
              </div>
            </Section>

            <Section number="03" title="Important Dates" desc="Set the relevant dates and deadlines.">
              <div className={styles.grid3}>
                <DateTimeField label="Start Date & Time" value={post.startTime} onOpen={() => setActivePicker("start")} />
                <DateTimeField label="End Date & Time" value={post.endTime} onOpen={() => setActivePicker("end")} />
                <DateTimeField label="Application Deadline" value={post.deadline} onOpen={() => setActivePicker("deadline")} />
              </div>
              {errors.endTime && <span className={styles.errorText}>{errors.endTime}</span>}
            </Section>

            <Section number="04" title="Links & Attachments" desc="Add relevant links or files (optional).">
              <div className={styles.grid2}>
                <Field label="Link (Optional)" error={errors.link}>
                  <IconInput icon={Link2} type="url" value={post.link} onChange={(e) => set("link", e.target.value)} placeholder="Enter relevant link (e.g., apply link, website)" />
                </Field>
                <Field label="Attachments (Optional)">
                  <div
                    className={styles.uploadBox}
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => { e.preventDefault(); handleFilesSelected(e.dataTransfer.files); }}
                  >
                    <input ref={fileInputRef} type="file" multiple className={styles.fileInput}
                      accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx" onChange={(e) => handleFilesSelected(e.target.files)} />
                    <UploadCloud className={styles.uploadIcon} size={24} />
                    <p className={styles.uploadText}>Click to upload files or drag and drop</p>
                    <p className={styles.uploadHint}>PDF, Images, Docs (Max 10MB each) — attachments aren't saved in drafts</p>

                    {files.length > 0 && (
                      <div className={styles.attachmentGrid} onClick={(e) => e.stopPropagation()}>
                        {files.map((f) => (
                          <div key={f.id} className={styles.attachmentItem}>
                            <button type="button" className={styles.attachmentRemove} onClick={() => removeFile(f.id)} aria-label={`Remove ${f.file.name}`}>
                              <X size={11} />
                            </button>
                            {f.url ? <img src={f.url} alt={f.file.name} className={styles.attachmentThumb} /> : (
                              <div className={styles.attachmentFileIcon}><FileIcon size={20} /></div>
                            )}
                            <div className={styles.attachmentName}>{f.file.name}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </Field>
              </div>
            </Section>

            <div className={styles.footer}>
              <button
                type="button"
                className={styles.saveDraftBtn}
                onClick={saveDraftNow}
                disabled={isPostEmpty(post) || draftStatus === "saving"}
                title="Save your progress locally so you can come back to it later"
              >
                <Save size={14} /> Save Draft
              </button>
              <button type="button" className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
              <button type="submit" disabled={!canSubmit || isSubmitting} className={styles.submitBtn}>
                <Send size={14} /> {isSubmitting ? "Posting..." : "Post to Alumni Community"}
              </button>
            </div>
          </form>
        </div>
      </div>

      {activePicker === "start" && (
        <CustomDateTimePicker value={post.startTime} onChange={handleStartChange} onClose={() => setActivePicker(null)} />
      )}
      {activePicker === "end" && (
        <CustomDateTimePicker value={post.endTime || post.startTime} minDateTime={post.startTime || undefined}
          onChange={handleEndChange} onClose={() => setActivePicker(null)} />
      )}
      {activePicker === "deadline" && (
        <CustomDateTimePicker value={post.deadline} onChange={(v) => set("deadline", v)} onClose={() => setActivePicker(null)} />
      )}

      {submitted && (
        <div className={styles.toast}>
          <CheckCircle2 size={18} color="#4ade80" />
          <span>Post published successfully</span>
        </div>
      )}
    </div>
  );
}