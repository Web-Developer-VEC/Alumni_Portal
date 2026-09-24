import { useState, useRef, useMemo } from "react";
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
  Briefcase,
  GraduationCap,
  Calendar,
  UploadCloud,
  Send,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Check,
  X,
  File as FileIcon,
} from "lucide-react";
import styles from "./uploadpost.module.css";

/* ==========================================================================
   uploadpost.jsx — "Create a Post"

   NOTE ON FIELDS NOT IN YOUR SCHEMA YET:
   - "Experience (Min / Max yrs)" is in this mockup but wasn't in the
     Mongoose schema you shared. It's collected here as experienceMin /
     experienceMax and sent in the FormData — add matching fields to the
     schema (e.g. experienceMin: Number, experienceMax: Number) if you
     want it persisted, otherwise your backend will just ignore those keys.
   - "Post Type" maps directly to your existing `type` enum
     (Full-time / Internship / Part-time / Contract).

   The date/time picker is the same calendar+clock ported from Outpass.jsx.
   No external alert library is used here (sweetalert2 wasn't installed in
   this project) — validation messages are shown inline / via a plain
   window.alert for the one date-order check.
   ========================================================================== */

const pad2 = (n) => String(n).padStart(2, "0");

const formatDisplayDateTime = (value) => {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString(undefined, {
    day: "2-digit", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit",
  });
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
    <label className={styles.checkboxItem}>
      <span
        className={`${styles.checkboxBox} ${checked ? styles.checkboxBoxChecked : ""}`}
        onClick={() => onChange(!checked)}
      >
        {checked && <Check size={13} />}
      </span>
      <span className={styles.checkboxLabel} onClick={() => onChange(!checked)}>{label}</span>
    </label>
  );
}

function DateTimeField({ label, value, onOpen }) {
  return (
    <Field label={label}>
      <div className={styles.datetimeDisplay} onClick={onOpen}>
        <span className={styles.inputIcon}><Calendar size={16} /></span>
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
/*  Rich-text-lite toolbar — wraps the selected text in the content textarea  */
/*  with markdown-style markers. Not a full WYSIWYG editor.                  */
/* -------------------------------------------------------------------------- */
function wrapSelection(textareaRef, before, after = before) {
  const el = textareaRef.current;
  if (!el) return null;
  const { selectionStart: s, selectionEnd: e, value } = el;
  const selected = value.slice(s, e) || "text";
  const next = value.slice(0, s) + before + selected + after + value.slice(e);
  requestAnimationFrame(() => {
    el.focus();
    el.setSelectionRange(s + before.length, s + before.length + selected.length);
  });
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
const LIMITS = { title: 150, content: 1000, maxFiles: 6 };

const EMPTY_POST = {
  title: "", postType: "Full-time", content: "", link: "",
  company: "", role: "", location: "", package: "", experienceMin: "", experienceMax: "", eligibility: "",
  freshers: true, remote: false, referralAvailable: false,
  startTime: "", endTime: "", deadline: "",
};

export default function UploadPost({ onPublish, onCancel }) {
  const [post, setPost] = useState(EMPTY_POST);
  const [files, setFiles] = useState([]);
  const [activePicker, setActivePicker] = useState(null); // null | "start" | "end" | "deadline"
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const contentRef = useRef(null);
  const fileInputRef = useRef(null);

  const set = (key, value) => setPost((p) => ({ ...p, [key]: value }));

  const isValidUrl = (v) => { try { const u = new URL(v); return u.protocol === "http:" || u.protocol === "https:"; } catch { return false; } };

  const applyToolbar = (fn) => {
    const next = fn(contentRef);
    if (next !== null) set("content", next.slice(0, LIMITS.content));
  };

  const handleFilesSelected = (fileList) => {
    const incoming = Array.from(fileList || []);
    if (files.length + incoming.length > LIMITS.maxFiles) {
      window.alert(`You can attach up to ${LIMITS.maxFiles} files.`);
      return;
    }
    const oversized = incoming.find((f) => f.size > 10 * 1024 * 1024);
    if (oversized) {
      window.alert("File size exceeds 10MB limit.");
      return;
    }
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
    if (!post.postType) e.postType = "Select a post type";
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
    formData.append("type", post.postType);
    formData.append("content", post.content.trim());
    if (post.link.trim()) formData.append("link", post.link.trim());
    if (post.company) formData.append("company", post.company);
    if (post.role) formData.append("role", post.role);
    if (post.location) formData.append("location", post.location);
    if (post.package) formData.append("package", post.package);
    if (post.experienceMin) formData.append("experienceMin", post.experienceMin);
    if (post.experienceMax) formData.append("experienceMax", post.experienceMax);
    if (post.eligibility) formData.append("eligibility", post.eligibility);
    formData.append("freshers", post.freshers);
    formData.append("remote", post.remote);
    formData.append("referralAvailable", post.referralAvailable);
    if (post.startTime) formData.append("startTime", new Date(post.startTime).toISOString());
    if (post.endTime) formData.append("endTime", new Date(post.endTime).toISOString());
    if (post.deadline) formData.append("deadline", new Date(post.deadline).toISOString());
    files.forEach((f) => formData.append("files", f.file));

    try {
      await onPublish?.(formData);
      setSubmitted(true);
      setTimeout(() => setSubmitted(false), 2600);
      setPost(EMPTY_POST);
      setFiles([]);
    } finally {
      setIsSubmitting(false);
    }
  };

  const canSubmit = useMemo(() => post.title.trim() && post.content.trim() && post.postType, [post]);

  return (
    <div className={styles.page}>
      <div className={styles.wrap}>
        <div className={styles.topBar}>
          <button type="button" className={styles.backLink} onClick={onCancel}>
            <ArrowLeft size={17} /> All Posts
          </button>
          <div className={styles.draftBadge}><CheckCircle2 size={14} /> Draft Saved</div>
        </div>

        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={styles.headerIconBox}><Pencil size={20} /></div>
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
                <Field label="Post Type" required error={errors.postType}>
                  <IconSelect icon={Tag} value={post.postType} onChange={(e) => set("postType", e.target.value)}>
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
                    <button type="button" className={styles.toolbarBtn} title="Bold" onClick={() => applyToolbar((r) => wrapSelection(r, "**"))}><Bold size={15} /></button>
                    <button type="button" className={styles.toolbarBtn} title="Italic" onClick={() => applyToolbar((r) => wrapSelection(r, "*"))}><Italic size={15} /></button>
                    <button type="button" className={styles.toolbarBtn} title="Underline" onClick={() => applyToolbar((r) => wrapSelection(r, "__"))}><Underline size={15} /></button>
                    <div className={styles.toolbarDivider} />
                    <button type="button" className={styles.toolbarBtn} title="Bullet list" onClick={() => applyToolbar((r) => insertLinePrefix(r, "- "))}><List size={15} /></button>
                    <button type="button" className={styles.toolbarBtn} title="Numbered list" onClick={() => applyToolbar((r) => insertLinePrefix(r, "1. "))}><ListOrdered size={15} /></button>
                    <div className={styles.toolbarDivider} />
                    <button type="button" className={styles.toolbarBtn} title="Insert link" onClick={() => {
                      const url = window.prompt("Link URL:");
                      if (url) applyToolbar((r) => wrapSelection(r, "[", `](${url})`));
                    }}><Link2 size={15} /></button>
                    <button type="button" className={styles.toolbarBtn} title="Insert image URL" onClick={() => {
                      const url = window.prompt("Image URL:");
                      if (url) applyToolbar((r) => wrapSelection(r, "![", `](${url})`));
                    }}><ImageIcon size={15} /></button>
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
                <Field label="Location"><IconInput icon={MapPin} value={post.location} onChange={(e) => set("location", e.target.value)} placeholder="Enter location (e.g., Chennai)" /></Field>
              </div>
              <div className={styles.grid3}>
                <Field label="Package (LPA)"><IconInput icon={IndianRupee} value={post.package} onChange={(e) => set("package", e.target.value)} placeholder="e.g., 6.5" /></Field>
                <Field label="Experience">
                  <div className={styles.rangeRow}>
                    <div className={styles.rangeInputWrap}>
                      <span className={styles.inputIcon}><Briefcase size={16} /></span>
                      <input className={styles.input} type="number" min="0" value={post.experienceMin}
                        onChange={(e) => set("experienceMin", e.target.value)} placeholder="Min (yrs)" />
                    </div>
                    <span className={styles.rangeDash}>-</span>
                    <input className={styles.input} style={{ paddingLeft: 12 }} type="number" min="0" value={post.experienceMax}
                      onChange={(e) => set("experienceMax", e.target.value)} placeholder="Max (yrs)" />
                  </div>
                </Field>
                <Field label="Eligibility"><IconInput icon={GraduationCap} value={post.eligibility} onChange={(e) => set("eligibility", e.target.value)} placeholder="e.g., B.Tech, Any Graduate" /></Field>
              </div>
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
                    <UploadCloud className={styles.uploadIcon} size={26} />
                    <p className={styles.uploadText}>Click to upload files or drag and drop</p>
                    <p className={styles.uploadHint}>PDF, Images, Docs (Max 10MB each)</p>

                    {files.length > 0 && (
                      <div className={styles.attachmentGrid} onClick={(e) => e.stopPropagation()}>
                        {files.map((f) => (
                          <div key={f.id} className={styles.attachmentItem}>
                            <button type="button" className={styles.attachmentRemove} onClick={() => removeFile(f.id)} aria-label={`Remove ${f.file.name}`}>
                              <X size={12} />
                            </button>
                            {f.url ? <img src={f.url} alt={f.file.name} className={styles.attachmentThumb} /> : (
                              <div className={styles.attachmentFileIcon}><FileIcon size={22} /></div>
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
              <button type="button" className={styles.cancelBtn} onClick={onCancel}>Cancel</button>
              <button type="submit" disabled={!canSubmit || isSubmitting} className={styles.submitBtn}>
                <Send size={15} /> {isSubmitting ? "Posting..." : "Post to Alumni Community"}
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
          <CheckCircle2 size={20} color="#4ade80" />
          <span>Post published successfully</span>
        </div>
      )}
    </div>
  );
}