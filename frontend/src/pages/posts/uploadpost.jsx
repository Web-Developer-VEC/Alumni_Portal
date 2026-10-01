import { useState, useRef, useMemo, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import api from "../../api/api";
import {
  ArrowLeft,
  CheckCircle2,
  NotebookPen,
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
  Calendar,
  CalendarDays,
  Briefcase,
  Paperclip,
  UploadCloud,
  Send,
  Save,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Check,
  X,
  AlertTriangle,
  Info,
  File as FileIcon,
} from "lucide-react";
import styles from "./uploadpost.module.css";
import { getUser } from "../../api/session";

const DRAFT_KEY = "alumniPortal.createPost.draft.v2";
const AUTOSAVE_DELAY_MS = 800;
const MAX_FILE_BYTES = 10 * 1024 * 1024;

// Images can be uploaded multiple times
const IMAGE_EXT = [".jpg", ".jpeg", ".png", ".webp"];

// Documents: only ONE document is allowed
const DOC_EXT = [".pdf", ".doc", ".docx"];

const hasExtension = (name = "", extensions = []) =>
  extensions.some((ext) => name.toLowerCase().endsWith(ext));

const getFileCategory = (file) => {
  if (hasExtension(file.name, IMAGE_EXT)) {
    return "image";
  }

  if (hasExtension(file.name, DOC_EXT)) {
    return "document";
  }

  return null;
};

const pad2 = (n) => String(n).padStart(2, "0");

// "YYYY-MM-DD" -> local Date (new Date("YYYY-MM-DD") is parsed as UTC and can
// show the previous day in timezones behind UTC).
const parseLocalDate = (value) => {
  if (!value) return null;
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
  if (m) return new Date(Number(m[1]), Number(m[2]) - 1, Number(m[3]));
  const d = new Date(value);
  return Number.isNaN(d.getTime()) ? null : d;
};

const formatDisplayDate = (value) => {
  const d = parseLocalDate(value);
  if (!d) return "";
  return d.toLocaleDateString(undefined, { day: "2-digit", month: "short", year: "numeric" });
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

// Strip an HTML string down to plain text — used for the character counter,
// the "is this field actually empty" check, and the required-field validator.
function htmlToText(html) {
  if (!html) return "";
  if (typeof document === "undefined") return html.replace(/<[^>]*>/g, "");
  const tmp = document.createElement("div");
  tmp.innerHTML = html;
  return tmp.innerText || tmp.textContent || "";
}

const isValidUrl = (v) => {
  try {
    const u = new URL(v);
    return u.protocol === "http:" || u.protocol === "https:";
  } catch {
    return false;
  }
};

const escapeAttr = (s) => s.replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

/* -------------------------------------------------------------------------- */
/*  Dialog — centered popup used for every alert / confirm / prompt           */
/* -------------------------------------------------------------------------- */
function Dialog({
  kind = "alert", // "alert" | "confirm" | "prompt"
  tone = "warning", // "warning" | "info"
  title,
  message,
  inputLabel,
  placeholder,
  confirmLabel,
  cancelLabel = "Cancel",
  validate,
  onConfirm,
  onClose,
}) {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const inputRef = useRef(null);
  const confirmRef = useRef(null);
  const closeRef = useRef(onClose);
  closeRef.current = onClose; // always call the latest onClose without re-running the effect

  useEffect(() => {
    (kind === "prompt" ? inputRef : confirmRef).current?.focus();
    const onKey = (e) => { if (e.key === "Escape") closeRef.current?.(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [kind]);

  const submit = (e) => {
    e?.preventDefault();
    // This dialog is portalled, but React still bubbles its events up the *component* tree.
    // Without this, submitting a prompt inside the post form would also submit the post.
    e?.stopPropagation();
    if (kind === "prompt") {
      const v = value.trim();
      const err = validate ? validate(v) : "";
      if (err) { setError(err); return; }
      onClose();
      onConfirm?.(v);
      return;
    }
    onClose();
    onConfirm?.();
  };

  const Icon = tone === "info" ? Info : AlertTriangle;
  const okText = confirmLabel || (kind === "alert" ? "Got it" : "OK");

  return createPortal(
    <div className={styles.dialogBackdrop} onClick={onClose}>
      <form className={styles.dialog} role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <div className={`${styles.dialogIcon} ${tone === "info" ? styles.dialogIconInfo : styles.dialogIconWarning}`}>
          <Icon size={26} />
        </div>
        <h3 className={styles.dialogTitle}>{title}</h3>
        {message && <p className={styles.dialogMessage}>{message}</p>}

        {kind === "prompt" && (
          <div className={styles.dialogInputWrap}>
            {inputLabel && <label className={styles.dialogInputLabel}>{inputLabel}</label>}
            <input
              ref={inputRef}
              className={styles.dialogInput}
              value={value}
              placeholder={placeholder}
              onChange={(e) => { setValue(e.target.value); setError(""); }}
            />
            {error && <span className={styles.dialogError}>{error}</span>}
          </div>
        )}

        <div className={styles.dialogActions}>
          {kind !== "alert" && (
            <button type="button" className={styles.dialogBtn} onClick={onClose}>{cancelLabel}</button>
          )}
          <button ref={confirmRef} type="submit" className={`${styles.dialogBtn} ${styles.dialogBtnPrimary}`}>{okText}</button>
        </div>
      </form>
    </div>,
    document.body
  );
}

/* -------------------------------------------------------------------------- */
/*  CustomDatePicker — calendar only, no time-of-day step                     */
/* -------------------------------------------------------------------------- */
function CustomDatePicker({ value, onChange, onClose, minDateTime }) {
  const initial = parseLocalDate(value) || new Date();

  const [selectedDate, setSelectedDate] = useState(initial);
  const [currentMonth, setCurrentMonth] = useState(new Date(initial.getFullYear(), initial.getMonth(), 1));

  useEffect(() => {
    const onKey = (e) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [onClose]);

  const daysInMonth = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0).getDate();
  const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1).getDay();
  const monthName = currentMonth.toLocaleString("default", { month: "long" });

  const floor = (minDateTime && parseLocalDate(minDateTime)) || new Date();
  floor.setHours(0, 0, 0, 0);

  const isDateDisabled = (day) => {
    const candidate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    candidate.setHours(0, 0, 0, 0);
    return candidate < floor;
  };

  const selectDate = (day) => {
    if (isDateDisabled(day)) return;
    const finalDate = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), day);
    setSelectedDate(finalDate);
    const formatted = `${finalDate.getFullYear()}-${pad2(finalDate.getMonth() + 1)}-${pad2(finalDate.getDate())}`;
    onChange(formatted);
    onClose();
  };

  return createPortal(
    <div className={styles.pickerBackdrop} onClick={onClose}>
      <div className={styles.datetimePicker} onClick={(e) => e.stopPropagation()}>
        <div className={styles.pickerLeft}>
          <div className={styles.pickerWeekday}>{selectedDate.toLocaleString("default", { weekday: "long" })}</div>
          <div className={styles.pickerMonth}>{selectedDate.toLocaleString("default", { month: "short" })}</div>
          <div className={styles.pickerDay}>{selectedDate.getDate()}</div>
          <div className={styles.pickerYear}>{selectedDate.getFullYear()}</div>
        </div>

        <div className={styles.pickerRight}>
          <div className={styles.calendarHeader}>
            <button type="button" aria-label="Previous month" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))}>
              <ChevronLeft size={18} />
            </button>
            <span>{monthName} {currentMonth.getFullYear()}</span>
            <button type="button" aria-label="Next month" onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))}>
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

          <div className={styles.pickerActionsRow}>
            <button type="button" onClick={onClose}>Cancel</button>
          </div>
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
        <span className={styles.inputIcon}><IconCmp size={16} /></span>
        <input {...props} className={styles.input} />
      </div>
      {counter && <div className={styles.counterRow}><span className={styles.counter}>{counter}</span></div>}
    </div>
  );
}

function IconSelect({ icon: IconCmp, children, ...props }) {
  return (
    <div className={styles.inputWrap}>
      <span className={styles.inputIcon}><IconCmp size={16} /></span>
      <select {...props} className={styles.select}>{children}</select>
      <span className={styles.selectChevron}><ChevronDown size={16} /></span>
    </div>
  );
}

function Checkbox({ checked, onChange, label }) {
  return (
    <div
      role="checkbox"
      aria-checked={checked}
      tabIndex={0}
      className={`${styles.checkboxItem} ${checked ? styles.checkboxItemChecked : ""}`}
      onClick={() => onChange(!checked)}
      onKeyDown={(e) => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); onChange(!checked); } }}
    >
      <span className={`${styles.checkboxBox} ${checked ? styles.checkboxBoxChecked : ""}`}>
        {checked && <Check size={12} />}
      </span>
      <span className={styles.checkboxLabel}>{label}</span>
    </div>
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
              <X size={11} />
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

function DateField({ label, value, onOpen }) {
  return (
    <Field label={label}>
      <div
        className={styles.datetimeDisplay}
        role="button"
        tabIndex={0}
        onClick={onOpen}
        onKeyDown={(e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onOpen(); } }}
      >
        <span className={styles.inputIcon}><Calendar size={16} /></span>
        <span className={value ? styles.datetimeValue : styles.datetimePlaceholder}>
          {value ? formatDisplayDate(value) : `Select ${label.toLowerCase()}`}
        </span>
      </div>
    </Field>
  );
}

function Section({ icon: IconCmp, title, desc, children }) {
  return (
    <section className={styles.section}>
      <div className={styles.sectionHead}>
        <div className={styles.sectionIcon}><IconCmp size={18} /></div>
        <div>
          <h2 className={styles.sectionTitle}>{title}</h2>
          <p className={styles.sectionDesc}>{desc}</p>
        </div>
      </div>
      <div className={styles.sectionBody}>{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  ContentEditor — a real (small) rich-text box.                             */
/*  Bold/Italic/Underline/lists apply actual formatting via execCommand,      */
/*  Link wraps the selection in a real <a>, Image embeds a real <img>.        */
/* -------------------------------------------------------------------------- */
function ContentEditor({ contentRef, html, length, onChange, maxLength, placeholder }) {
  const savedRange = useRef(null);
  const [active, setActive] = useState({});
  const [prompt, setPrompt] = useState(null); // null | "link" | "image"

  // Push the `html` prop into the DOM only when it differs from what the editor
  // already shows (draft restored, form reset). While the user types, the editor's
  // own innerHTML is what we stored, so nothing is overwritten and the caret stays put.
  useEffect(() => {
    const el = contentRef.current;
    if (!el) return;
    if (el.innerHTML !== (html || "")) el.innerHTML = html || "";
  }, [html, contentRef]);

  // Highlight toolbar buttons (bold, italic, lists...) for the current selection.
  useEffect(() => {
    const update = () => {
      const el = contentRef.current;
      const sel = window.getSelection();
      if (!el || !sel || !sel.anchorNode || !el.contains(sel.anchorNode)) return;
      try {
        setActive({
          bold: document.queryCommandState("bold"),
          italic: document.queryCommandState("italic"),
          underline: document.queryCommandState("underline"),
          ul: document.queryCommandState("insertUnorderedList"),
          ol: document.queryCommandState("insertOrderedList"),
        });
      } catch { /* ignore */ }
    };
    document.addEventListener("selectionchange", update);
    return () => document.removeEventListener("selectionchange", update);
  }, [contentRef]);

  const emit = () => {
    const el = contentRef.current;
    if (!el) return;
    onChange(el.innerHTML, el.innerText || "");
  };

  const exec = (command, arg = null) => {
    contentRef.current?.focus();
    document.execCommand(command, false, arg);
    emit();
  };

  // Keep focus/selection inside the editor when a toolbar button is pressed.
  const preventBlur = (e) => e.preventDefault();

  const handleBeforeInput = (e) => {
    const el = contentRef.current;
    if (!el) return;
    const isDeletion = typeof e.inputType === "string" && e.inputType.startsWith("delete");
    if (isDeletion) return;
    if ((el.innerText || "").length >= maxLength) e.preventDefault();
  };

  // Paste as plain text so foreign styles/markup never leak into the post.
  const handlePaste = (e) => {
    e.preventDefault();
    const el = contentRef.current;
    const text = (e.clipboardData || window.clipboardData).getData("text/plain");
    const room = maxLength - (el?.innerText || "").length;
    if (room <= 0) return;
    document.execCommand("insertText", false, text.slice(0, room));
    emit();
  };

  // The dialog steals focus, so remember the selection and put it back afterwards.
  // (Used by the link / image toolbar buttons — currently commented out below.)
  // eslint-disable-next-line no-unused-vars
  const openPrompt = (kind) => {
    const sel = window.getSelection();
    const el = contentRef.current;
    savedRange.current = sel && sel.rangeCount && el?.contains(sel.anchorNode) ? sel.getRangeAt(0).cloneRange() : null;
    setPrompt(kind);
  };

  const restoreSelection = () => {
    const el = contentRef.current;
    el?.focus();
    const sel = window.getSelection();
    if (savedRange.current && sel) {
      sel.removeAllRanges();
      sel.addRange(savedRange.current);
    }
  };

  const applyLink = (url) => {
    restoreSelection();
    const safe = new URL(url).href;
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed) {
      document.execCommand("insertHTML", false, `<a href="${escapeAttr(safe)}" target="_blank" rel="noopener noreferrer">${escapeAttr(safe)}</a>`);
    } else {
      document.execCommand("createLink", false, safe);
    }
    emit();
  };

  const applyImage = (url) => {
    restoreSelection();
    document.execCommand("insertImage", false, new URL(url).href);
    emit();
  };

  const validateUrl = (v) => {
    if (!v) return "Please enter a URL";
    if (!isValidUrl(v)) return "Enter a valid link starting with http:// or https://";
    return "";
  };

  const isEmpty = !html || (!/<(img|li)/i.test(html) && !htmlToText(html).trim());
  const overLimit = length >= maxLength;

  const btn = (title, Icon, onClick, isActive) => (
    <button
      type="button"
      className={`${styles.toolbarBtn} ${isActive ? styles.toolbarBtnActive : ""}`}
      title={title}
      aria-label={title}
      aria-pressed={isActive || false}
      onMouseDown={preventBlur}
      onClick={onClick}
    >
      <Icon size={15} />
    </button>
  );

  return (
    <div className={styles.editorBox}>
      <div className={styles.toolbar}>
        {btn("Bold", Bold, () => exec("bold"), active.bold)}
        {btn("Italic", Italic, () => exec("italic"), active.italic)}
        {btn("Underline", Underline, () => exec("underline"), active.underline)}
        <div className={styles.toolbarDivider} />
        {btn("Bullet list", List, () => exec("insertUnorderedList"), active.ul)}
        {btn("Numbered list", ListOrdered, () => exec("insertOrderedList"), active.ol)}
        <div className={styles.toolbarDivider} />
        {/* {btn("Insert link", Link2, () => openPrompt("link"))}
        {btn("Insert image", ImageIcon, () => openPrompt("image"))} */}
      </div>

      <div className={styles.editorContentWrap}>
        <div
          ref={contentRef}
          className={styles.editorContentEditable}
          contentEditable
          suppressContentEditableWarning
          role="textbox"
          aria-multiline="true"
          aria-label="Post content"
          onInput={emit}
          onBlur={emit}
          onBeforeInput={handleBeforeInput}
          onPaste={handlePaste}
        />
        {isEmpty && <span className={styles.editorPlaceholder}>{placeholder}</span>}
      </div>

      <div className={styles.editorCounter}>
        <span className={`${styles.counter} ${overLimit ? styles.counterOverLimit : ""}`}>{length}/{maxLength}</span>
      </div>

      {prompt === "link" && (
        <Dialog
          kind="prompt"
          tone="info"
          title="Insert link"
          message="Select some text first to turn it into a link, or leave it unselected to add the URL itself."
          inputLabel="Link URL"
          placeholder="https://example.com"
          confirmLabel="Insert link"
          validate={validateUrl}
          onConfirm={applyLink}
          onClose={() => setPrompt(null)}
        />
      )}
      {prompt === "image" && (
        <Dialog
          kind="prompt"
          tone="info"
          title="Insert image"
          message="Paste the address of an image that is already online."
          inputLabel="Image URL"
          placeholder="https://example.com/photo.jpg"
          confirmLabel="Insert image"
          validate={validateUrl}
          onConfirm={applyImage}
          onClose={() => setPrompt(null)}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Constraints & schema-shaped state                                         */
/* -------------------------------------------------------------------------- */
const LIMITS = { title: 25, content: 500, chip: 24, maxChips: 10, maxFiles: 6 };

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

function isPostEmpty(post, contentText = "") {
  return Object.entries(post).every(([key, value]) => {
    if (key === "type") return true;
    if (key === "content") return !contentText.trim();
    if (Array.isArray(value)) return value.length === 0;
    if (typeof value === "boolean") return value === false;
    return !value;
  });
}

export default function UploadPost({ onPublish, onCancel }) {
  // Read the session inside the component so it is fresh on every mount
  // (a module-level call would be frozen at whatever it was when the app loaded).
  const user = getUser();

  const [post, setPost] = useState(EMPTY_POST);
  const [contentText, setContentText] = useState("");
  const [files, setFiles] = useState([]);
  const [activePicker, setActivePicker] = useState(null); // null | "start" | "end" | "deadline"
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [dialog, setDialog] = useState(null); // centered popup config
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);
  const filesRef = useRef([]);
  const toastTimer = useRef(null);

  const closeDialog = useCallback(() => setDialog(null), []);
  const closePicker = useCallback(() => setActivePicker(null), []);
  const showAlert = (message, title = "Please check", tone = "warning") =>
    setDialog({ kind: "alert", tone, title, message });
  const showConfirm = ({ title, message, confirmLabel, cancelLabel, onConfirm }) =>
    setDialog({ kind: "confirm", tone: "warning", title, message, confirmLabel, cancelLabel, onConfirm });

  // ---- Draft persistence (localStorage) ----------------------------------
  const [draftStatus, setDraftStatus] = useState("idle"); // idle | saving | saved | error
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const hasLoadedDraft = useRef(false);
  const isFirstRender = useRef(true);
  const justRestored = useRef(false);
  const autosaveTimer = useRef(null);


  if (!user) {
    alert("Please login to create a post.");
  }
  console.log("User:", user);
  const writeDraft = useCallback((data, text) => {
    try {
      if (typeof window === "undefined") return false;
      if (isPostEmpty(data, text)) {
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
        if (restored) {
          const restoredText = htmlToText(restored.content);
          if (!isPostEmpty(restored, restoredText)) {
            justRestored.current = true;
            setPost(restored);
            setContentText(restoredText);
            const savedAt = parsed?.savedAt ? new Date(parsed.savedAt) : new Date();
            setLastSavedAt(Number.isNaN(savedAt.getTime()) ? new Date() : savedAt);
            setDraftStatus("saved");
          }
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
    if (justRestored.current) { justRestored.current = false; return; }

    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);

    if (isPostEmpty(post, contentText)) {
      writeDraft(post, contentText);
      setDraftStatus("idle");
      setLastSavedAt(null);
      return;
    }

    setDraftStatus("saving");
    autosaveTimer.current = setTimeout(() => {
      const ok = writeDraft(post, contentText);
      setDraftStatus(ok ? "saved" : "error");
      setLastSavedAt(ok ? new Date() : null);
    }, AUTOSAVE_DELAY_MS);

    return () => { if (autosaveTimer.current) clearTimeout(autosaveTimer.current); };
  }, [post, contentText, writeDraft]);

  const saveDraftNow = () => {
    if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
    setDraftStatus("saving");
    autosaveTimer.current = setTimeout(() => {
      const ok = writeDraft(post, contentText);
      setDraftStatus(ok ? "saved" : "error");
      setLastSavedAt(ok ? new Date() : null);
    }, 250);
  };

  const clearDraft = useCallback(() => {
    try { if (typeof window !== "undefined") window.localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
    setDraftStatus("idle");
    setLastSavedAt(null);
  }, []);

  // ---- Form state helpers --------------------------------------------------
  // Setting a field also clears that field's validation error right away.
  const set = (key, value) => {
    setPost((p) => ({ ...p, [key]: value }));
    setErrors((prev) => {
      const drop = key === "startTime" ? ["startTime", "endTime"] : [key];
      if (!drop.some((k) => prev[k])) return prev;
      const next = { ...prev };
      drop.forEach((k) => delete next[k]);
      return next;
    });
  };

  const handleFilesSelected = (fileList) => {
    const incoming = Array.from(fileList || []);

    if (incoming.length === 0) return;

    /* 1. Check file types */
    const invalidFiles = incoming.filter((file) => getFileCategory(file) === null);

    if (invalidFiles.length > 0) {
      showAlert(
        `Unsupported file type. Allowed files are:\n\n` +
        `Images: JPG, JPEG, PNG, WEBP\n` +
        `Document: PDF, DOC, DOCX\n\n` +
        `Invalid files:\n${invalidFiles.map((file) => file.name).join("\n")}`,
        "Invalid file type"
      );
      return;
    }

    /* 2. Check file size */
    const tooBig = incoming.filter((file) => file.size > MAX_FILE_BYTES);

    if (tooBig.length > 0) {
      showAlert(
        `Each file must be 10MB or smaller.\n\n` +
        `These files are too large:\n${tooBig.map((file) => file.name).join("\n")}`,
        "File too large"
      );
      return;
    }

    /* 3. Determine incoming categories */
    const incomingCategories = incoming.map(getFileCategory);
    const incomingHasDocument = incomingCategories.includes("document");
    const incomingHasImage = incomingCategories.includes("image");

    /* 4. Prevent mixing document + image */
    if (incomingHasDocument && incomingHasImage) {
      showAlert(
        "You cannot upload documents and images together.\n\n" +
        "Please choose either:\n" +
        "• One document\n" +
        "OR\n" +
        "• Multiple images",
        "Mixed file types"
      );
      return;
    }

    /* 5. Check existing uploaded files */
    const existingCategories = files.map((item) => getFileCategory(item.file));
    const existingHasDocument = existingCategories.includes("document");
    const existingHasImage = existingCategories.includes("image");

    /* 6. Prevent adding images when a document exists */
    if (incomingHasImage && existingHasDocument) {
      showAlert(
        "A document is already attached.\n\n" +
        "You cannot add images while a document is attached.\n\n" +
        "Remove the document first if you want to upload images.",
        "Cannot add images"
      );
      return;
    }

    /* 7. Prevent adding documents when images exist */
    if (incomingHasDocument && existingHasImage) {
      showAlert(
        "Images are already attached.\n\n" +
        "You cannot add a document while images are attached.\n\n" +
        "Remove the images first if you want to upload a document.",
        "Cannot add document"
      );
      return;
    }

    /* 8. DOCUMENT RULE — only ONE document can be uploaded */
    if (incomingHasDocument) {
      if (existingHasDocument) {
        showAlert("Only one document can be uploaded.", "Document limit reached");
        return;
      }

      if (incoming.length > 1) {
        showAlert(
          "You can upload only one document.\n\n" +
          "Please select a single PDF, DOC or DOCX file.",
          "Document limit"
        );
        return;
      }

      const file = incoming[0];

      setFiles([
        {
          file,
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
          url: null,
        },
      ]);

      return;
    }

    /* 9. IMAGE RULE — multiple images are allowed */
    if (incomingHasImage) {
      const remainingSlots = LIMITS.maxFiles - files.length;

      if (remainingSlots <= 0) {
        showAlert(`You can attach up to ${LIMITS.maxFiles} images.`, "Image limit reached");
        return;
      }

      const accepted = incoming.slice(0, remainingSlots);
      const skippedForLimit = incoming.length - accepted.length;

      const withPreviews = accepted.map((file) => ({
        file,
        id: `${file.name}-${file.size}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
        url: URL.createObjectURL(file),
      }));

      setFiles((prev) => [...prev, ...withPreviews]);

      if (skippedForLimit > 0) {
        showAlert(
          `Only ${LIMITS.maxFiles} images are allowed in total.\n\n` +
          `${skippedForLimit} image${skippedForLimit === 1 ? "" : "s"} was not added.`,
          "Image limit reached"
        );
      }
    }
  };

  const removeFile = (id) => {
    setFiles((prev) => {
      const target = prev.find((f) => f.id === id);
      if (target?.url) URL.revokeObjectURL(target.url);
      return prev.filter((f) => f.id !== id);
    });
  };

  // Keep a live reference so the unmount cleanup sees the *current* files
  // (a plain closure would only ever see the empty list from first render).
  useEffect(() => { filesRef.current = files; }, [files]);
  useEffect(() => {
    return () => {
      filesRef.current.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); });
      clearTimeout(toastTimer.current);
    };
  }, []);

  const handleStartChange = (val) => {
    if (post.endTime && val > post.endTime) {
      showAlert("The start date is after your end date, so the end date has been cleared. Please pick it again.", "Start date changed");
      set("endTime", "");
    }
    set("startTime", val);
  };

  const handleEndChange = (val) => {
    if (post.startTime && val < post.startTime) {
      showAlert("End date cannot be before the start date.", "Invalid end date");
      return;
    }
    set("endTime", val);
  };

  const validate = () => {
    const e = {};
    if (!post.title.trim()) e.title = "Title is required";
    if (!contentText.trim()) e.content = "Content is required";
    if (post.link.trim() && !isValidUrl(post.link.trim())) e.link = "Enter a valid link starting with http:// or https://";
    if (post.startTime && post.endTime && post.endTime < post.startTime) e.endTime = "End date cannot be before start date";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (isSubmitting) return;
    if (!validate()) return;

    if (!user) {
      showAlert("Your session has expired. Please log in again.", "Not logged in");
      return;
    }

    setIsSubmitting(true);

    try {
      // ---- Payload (multipart/form-data) ----
      const formData = new FormData();

      const put = (key, value) => {
        const v = typeof value === "string" ? value.trim() : value;
        if (v) formData.append(key, v);
      };

      put("title", post.title);
      formData.append("content", post.content);
      put("link", post.link);
      put("startTime", post.startTime);
      put("endTime", post.endTime);
      put("deadline", post.deadline);
      put("company", post.company);
      put("role", post.role);
      put("eligibility", post.eligibility);
      put("location", post.location);
      put("package", post.package);

      formData.append("type", post.type);
      formData.append("freshers", String(post.freshers));
      formData.append("remote", String(post.remote));
      formData.append("referralAvailable", String(post.referralAvailable));
      formData.append("email", user.email);
      formData.append("Userrole", user.role);

      post.skills.forEach((s) => formData.append("skills", s));
      files.forEach((f) => formData.append("files", f.file));

      console.log(formData);
      await api.post("/posts", formData);

      setSubmitted(true);
      clearTimeout(toastTimer.current);
      toastTimer.current = setTimeout(() => setSubmitted(false), 2600);

      files.forEach((f) => { if (f.url) URL.revokeObjectURL(f.url); });

      setPost(EMPTY_POST);
      setContentText("");
      setFiles([]);
      setErrors({});
      clearDraft();

      onPublish?.();

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      showAlert(
        err?.response?.data?.message ||
        err?.message ||
        "Something went wrong while publishing. Please try again.",
        "Couldn't publish post"
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  // Falls back to browser-back when no onCancel prop is passed.
  const leavePage = () => (onCancel ? onCancel() : window.history.back());

  const handleCancel = () => {
    const hasUnsavedWork = !isPostEmpty(post, contentText) || files.length > 0;
    if (!hasUnsavedWork) { leavePage(); return; }
    showConfirm({
      title: "Leave this post?",
      message: draftStatus === "saved"
        ? "Your draft is saved, so you can pick it up again later."
        : "Any attached files will be lost, and unsaved text changes may not be kept.",
      confirmLabel: "Leave",
      cancelLabel: "Stay",
      onConfirm: leavePage,
    });
  };

  const canSubmit = useMemo(() => Boolean(post.title.trim() && contentText.trim()), [post.title, contentText]);

  const draftBadgeClass = draftStatus === "saving"
    ? `${styles.draftBadge} ${styles.draftBadgeSaving}`
    : draftStatus === "error"
      ? `${styles.draftBadge} ${styles.draftBadgeError}`
      : styles.draftBadge;

  return (
    <div className={styles.page}>
      <main className={styles.main}>
        <div className={styles.container}>
          {/* 2) Title container */}
          <div className={styles.titleCard}>
            <div className={styles.titleContent}>
              <div className={styles.titleLeft}>
                <div className={styles.headerIconBox}><NotebookPen size={22} /></div>
                <div>
                  <h2 className={styles.headerTitle}>Create Post</h2>
                  <p className={styles.headerSubtitle}>Share job opportunities, events, updates and more with the alumni community.</p>
                </div>
              </div>

              <div className={styles.titleActions}>
                {draftStatus !== "idle" && (
                  <div className={draftBadgeClass}>
                    {draftStatus === "saving" && <><span className={styles.draftSpinner} />Saving draft…</>}
                    {draftStatus === "saved" && <><CheckCircle2 size={13} /> Draft saved{lastSavedAt ? ` · ${formatRelativeTime(lastSavedAt)}` : ""}</>}
                    {draftStatus === "error" && <>Couldn't save draft</>}
                  </div>
                )}
                <button type="button" className={styles.backLink} onClick={handleCancel}>
                  <ArrowLeft size={16} /> All Posts
                </button>
              </div>
            </div>
          </div>

          {/* 3) Form box */}
          <div className={styles.formCard}>
            <form
              onSubmit={handleSubmit}
              noValidate
              // Enter inside a single-line input must not publish the post by accident.
              onKeyDown={(e) => { if (e.key === "Enter" && e.target.tagName === "INPUT") e.preventDefault(); }}
            >
              <div className={styles.formBody}>
                <Section icon={FileText} title="Post information" desc="Add a clear title and write the details.">
                  <div className={styles.grid2}>
                    <Field label="Title" required error={errors.title}>
                      <IconInput icon={FileText} value={post.title} maxLength={LIMITS.title}
                        onChange={(e) => set("title", e.target.value)} placeholder="Enter post title"
                        counter={`${post.title.length}/${LIMITS.title}`} />
                    </Field>
                    <Field label="Post type">
                      <IconSelect icon={Tag} value={post.type} onChange={(e) => set("type", e.target.value)}>
                        <option value="Full-time">Full-time</option>
                        <option value="Internship">Internship</option>
                        <option value="Part-time">Part-time</option>
                        <option value="Contract">Contract</option>
                      </IconSelect>
                    </Field>
                  </div>

                  <Field label="Content" required error={errors.content}>
                    <ContentEditor
                      contentRef={contentRef}
                      html={post.content}
                      length={contentText.length}
                      maxLength={LIMITS.content}
                      placeholder="Write your post content here..."
                      onChange={(html, text) => { set("content", html); setContentText(text); }}
                    />
                  </Field>
                </Section>

                <Section icon={Briefcase} title="Job / opportunity details" desc="Fill in the job or opportunity related information.">
                  <div className={styles.grid3}>
                    <Field label="Company"><IconInput icon={Building2} value={post.company} onChange={(e) => set("company", e.target.value)} placeholder="Enter company name" /></Field>
                    <Field label="Role / position"><IconInput icon={User} value={post.role} onChange={(e) => set("role", e.target.value)} placeholder="Enter role or position" /></Field>
                    <Field label="Location"><IconInput icon={MapPin} value={post.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g., Chennai" /></Field>
                  </div>
                  <div className={styles.grid2}>
                    <Field label="Package"><IconInput icon={IndianRupee} value={post.package} onChange={(e) => set("package", e.target.value)} placeholder="e.g., 6.5 LPA" /></Field>
                    <Field label="Eligibility"><IconInput icon={GraduationCap} value={post.eligibility} onChange={(e) => set("eligibility", e.target.value)} placeholder="e.g., B.Tech, Any Graduate" /></Field>
                  </div>
                  <Field label="Skills">
                    <ChipInput values={post.skills} onChange={(v) => set("skills", v)} placeholder="Type a skill and press Enter" limit={LIMITS.chip} max={LIMITS.maxChips} />
                  </Field>
                  <div className={styles.checkboxRow}>
                    <Checkbox checked={post.freshers} onChange={(v) => set("freshers", v)} label="Open for freshers" />
                    <Checkbox checked={post.remote} onChange={(v) => set("remote", v)} label="Remote work" />
                    <Checkbox checked={post.referralAvailable} onChange={(v) => set("referralAvailable", v)} label="Referral available" />
                  </div>
                </Section>

                <Section icon={CalendarDays} title="Important dates" desc="Set the relevant dates and deadlines.">
                  <div className={styles.grid3}>
                    <DateField label="Start Date" value={post.startTime} onOpen={() => setActivePicker("start")} />
                    <DateField label="End Date" value={post.endTime} onOpen={() => setActivePicker("end")} />
                    <DateField label="Application Deadline" value={post.deadline} onOpen={() => setActivePicker("deadline")} />
                  </div>
                  {errors.endTime && <span className={styles.errorText}>{errors.endTime}</span>}
                </Section>

                <Section icon={Paperclip} title="Links & attachments" desc="Add relevant links or files (optional).">
                  <Field label="Link (optional)" error={errors.link}>
                    <IconInput
                      icon={Link2}
                      type="url"
                      autoComplete="off"
                      value={post.link}
                      onChange={(e) => set("link", e.target.value)}
                      placeholder="Enter relevant link (e.g., apply link, website)"
                    />
                  </Field>

                  <Field label="Attachments (optional)">
                    <div
                      className={`${styles.uploadBox} ${isDragging ? styles.uploadBoxActive : ""}`}
                      onClick={() => fileInputRef.current?.click()}
                      onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
                      onDragLeave={() => setIsDragging(false)}
                      onDrop={(e) => { e.preventDefault(); setIsDragging(false); handleFilesSelected(e.dataTransfer.files); }}
                    >
                      <input ref={fileInputRef} type="file" multiple className={styles.fileInput}
                        accept=".pdf,.jpg,.jpeg,.png,.webp,.doc,.docx"
                        onChange={(e) => { handleFilesSelected(e.target.files); e.target.value = ""; }} />
                      <div className={styles.uploadIconWrap}><UploadCloud size={24} /></div>
                      <p className={styles.uploadText}>Click to upload files or drag and drop</p>
                      <p className={styles.uploadHint}>
                        Upload either one document or multiple images.
                        Documents and images cannot be combined.
                        Max 10MB per file, up to {LIMITS.maxFiles} images.
                      </p>

                      {files.length > 0 && (
                        <div className={styles.attachmentGrid} onClick={(e) => e.stopPropagation()}>
                          {files.map((f) => (
                            <div key={f.id} className={styles.attachmentItem}>
                              <button type="button" className={styles.attachmentRemove} onClick={() => removeFile(f.id)} aria-label={`Remove ${f.file.name}`}>
                                <X size={12} />
                              </button>
                              {f.url ? <img src={f.url} alt={f.file.name} className={styles.attachmentThumb} /> : (
                                <div className={styles.attachmentFileIcon}><FileIcon size={24} /></div>
                              )}
                              <div className={styles.attachmentName}>{f.file.name}</div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  </Field>
                </Section>
              </div>

              <div className={styles.footer}>
                <button
                  type="button"
                  className={styles.saveDraftBtn}
                  onClick={saveDraftNow}
                  disabled={isPostEmpty(post, contentText) || draftStatus === "saving"}
                  title="Save your progress locally so you can come back to it later"
                >
                  <Save size={15} /> Save draft
                </button>
                <button type="button" className={styles.cancelBtn} onClick={handleCancel}>Cancel</button>
                <button type="submit" disabled={!canSubmit || isSubmitting} className={styles.submitBtn}>
                  <Send size={15} /> {isSubmitting ? "Posting..." : "Post to alumni community"}
                </button>
              </div>
            </form>
          </div>
        </div>
      </main>

      {activePicker === "start" && (
        <CustomDatePicker value={post.startTime} onChange={handleStartChange} onClose={closePicker} />
      )}
      {activePicker === "end" && (
        <CustomDatePicker value={post.endTime || post.startTime} minDateTime={post.startTime || undefined}
          onChange={handleEndChange} onClose={closePicker} />
      )}
      {activePicker === "deadline" && (
        <CustomDatePicker value={post.deadline} onChange={(v) => set("deadline", v)} onClose={closePicker} />
      )}

      {dialog && <Dialog {...dialog} onClose={closeDialog} />}

      {submitted && (
        <div className={styles.toast}>
          <CheckCircle2 size={18} color="#4ade80" />
          <span>Post published successfully</span>
        </div>
      )}
    </div>
  );
}