import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal, flushSync } from "react-dom";
// import * as pdfjsLib from "pdfjs-dist";
// import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import heroBg from "../../assets/jobpostheroimg.jpg"
import styles from "./post.module.css";

import api from "../../api/api";

// pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

function FontStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700&display=swap');
    `}</style>
  );
}

/* -------------------------------------------------------------------------- */
/*  API layer: GET /api/posts/  →  job objects used by the UI                 */
/* -------------------------------------------------------------------------- */
const FILE_BASE = (api.defaults.baseURL || "").replace(/\/api\/?$/, "");

// Normalises stored paths: Windows backslashes (multer on Windows), leading
// slashes, spaces, and prefixes relative paths with the API host.
const absUrl = (u) => {
  if (!u) return null;
  const clean = String(u).replace(/\\/g, "/");
  if (/^https?:\/\//i.test(clean)) return clean;
  return encodeURI(`${FILE_BASE}/${clean.replace(/^\/+/, "")}`);
};

const isPdfUrl = (u) => /\.pdf(\?.*)?$/i.test(u || "");

const formatDate = (d) => {
  if (!d) return null;
  const date = new Date(d);
  if (isNaN(date)) return null;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
};

function timeAgo(ts) {
  if (!ts) return "";
  const mins = Math.round((Date.now() - new Date(ts).getTime()) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return formatDate(ts);
}

/* Works whether `author` is a populated user object or a bare ObjectId. */
const mapAuthor = (author) => {
  const a = author && typeof author === "object" ? author : {};
  return {
    id: a._id || (typeof author === "string" ? author : undefined),
    name: a.name || a.fullName || a.username || "Alumni",
    batch:
      a.batch ||
      (a.graduationYear ? `Batch '${String(a.graduationYear).slice(-2)}` : ""),
    designation: a.designation || a.role || "Alumni",
    avatar: absUrl(a.avatar || a.profilePic || a.profileImage),
    verified: a.verified ?? true,
  };
};

function mapPostToJob(p) {
  const files = (p.fileUrls || []).map(absUrl).filter(Boolean);
  const pdf = files.find(isPdfUrl);
  const images = files.filter((f) => !isPdfUrl(f)); // all images, not just the first
  const role = p.role || p.title;
  const company = p.company || p.title;

  return {
    id: p._id,
    alumni: mapAuthor(p.author),
    postedAgo: timeAgo(p.createdAt),
    createdTs: p.createdAt ? new Date(p.createdAt).getTime() : 0,
    company,
    role,
    eligibility: p.eligibility,
    location: p.location,
    type: p.type,
    // Optional facet fields — only populated when the backend sends them.
    // The filter sidebar only shows a facet once real values appear here.
    domain: p.domain || p.category || p.specialization || null,
    batch: p.batch || p.graduationBatch || p.eligibleBatch || null,
    freshers: p.freshers,
    remote: p.remote,
    referralAvailable: p.referralAvailable,
    highVolumeReferrals: p.highVolumeReferrals,
    directReferral: p.directReferral,
    package: p.package,
    deadline: formatDate(p.deadline),
    deadlineTs: p.deadline ? new Date(p.deadline).getTime() : Infinity,
    ppo: p.ppo,
    hiringLoop: p.hiringLoop,
    skills: p.skills || [],
    description: p.content,
    pledge: p.pledge,
    tags: p.tags || [],
    images,
    pdf: pdf ? { url: pdf, title: `${role} · ${company}` } : undefined,
    applyLink: p.applyLink || p.link,
    applyLabel: p.applyLabel,
    views: p.views || 0,
    likes: p.likes || 0,
    comments: (p.comments || []).map((c) => {
      const u = c.user && typeof c.user === "object" ? c.user : {};
      return {
        id: c._id,
        user: u.name || u.fullName || u.username || "User",
        tag: u.batch || "",
        text: c.text,
      };
    }),
  };
}

function usePosts() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    const controller = new AbortController();
    (async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await api.get("/posts/", { signal: controller.signal });
        const data = res.data;
        const list = Array.isArray(data)
          ? data
          : data?.posts || data?.data || [];
        setJobs(list.map(mapPostToJob));
      } catch (err) {
        if (err.code === "ERR_CANCELED" || err.name === "CanceledError") return;
        setError(
          err.response?.data?.message || err.message || "Something went wrong",
        );
      } finally {
        if (!controller.signal.aborted) setLoading(false);
      }
    })();
    return () => controller.abort();
  }, [reloadKey]);

  return { jobs, loading, error, reload: () => setReloadKey((k) => k + 1) };
}

const REPORT_REASONS = [
  "Spam or misleading",
  "Fake or fraudulent job",
  "Asks for money / fees",
  "Inappropriate content",
  "Other",
];

/* -------------------------------------------------------------------------- */
/*  Icons — plain inline SVG, no external font/network dependency             */
/* -------------------------------------------------------------------------- */
function Icon({ name, className = "", filled = false }) {
  const base = {
    viewBox: "0 0 24 24",
    className,
    "aria-hidden": true,
  };
  const stroke = {
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
  };

  switch (name) {
    case "search":
    case "manage_search":
      return (
        <svg {...base} {...stroke}>
          <circle cx="11" cy="11" r="7" />
          <path d="m21 21-4.3-4.3" />
        </svg>
      );
    case "tune":
      return (
        <svg {...base} {...stroke}>
          <path d="M4 6h10M18 6h2M4 12h2M10 12h10M4 18h12M20 18h0" />
          <circle cx="16" cy="6" r="2" />
          <circle cx="8" cy="12" r="2" />
          <circle cx="18" cy="18" r="2" />
        </svg>
      );
    case "verified":
      return (
        <svg
          {...base}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={3}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="m5 13 4 4 10-10" />
        </svg>
      );
    case "verified_user":
      return (
        <svg {...base} {...stroke}>
          <path d="M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6l-8-3Z" />
          <path d="m9 12 2 2 4-4" />
        </svg>
      );
    case "more_vert":
      return (
        <svg {...base} viewBox="0 0 24 24" fill="currentColor">
          <circle cx="12" cy="5.5" r="1.7" />
          <circle cx="12" cy="12" r="1.7" />
          <circle cx="12" cy="18.5" r="1.7" />
        </svg>
      );
    case "link":
      return (
        <svg {...base} {...stroke}>
          <path d="M9.5 17H7a5 5 0 0 1 0-10h2.5" />
          <path d="M14.5 7H17a5 5 0 0 1 0 10h-2.5" />
          <line x1="8" y1="12" x2="16" y2="12" />
        </svg>
      );
    case "bookmark":
      return (
        <svg
          {...base}
          fill={filled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M6 3.5h12a1 1 0 0 1 1 1V21l-7-4-7 4V4.5a1 1 0 0 1 1-1Z" />
        </svg>
      );
    case "flag":
      return (
        <svg {...base} {...stroke}>
          <path d="M5 21V4" />
          <path d="M5 4h11l-2 4 2 4H5" />
        </svg>
      );
    case "close":
      return (
        <svg {...base} {...stroke}>
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
      );
    case "school":
      return (
        <svg {...base} {...stroke}>
          <path d="m22 9-10-5L2 9l10 5 10-5Z" />
          <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
        </svg>
      );
    case "favorite":
      return (
        <svg
          {...base}
          fill={filled ? "currentColor" : "none"}
          stroke="currentColor"
          strokeWidth={1.8}
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 21.8l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z" />
        </svg>
      );
    case "chat_bubble":
    case "forum":
      return (
        <svg {...base} {...stroke}>
          <path d="M21 12a8 8 0 0 1-11.7 7.1L3 20.5l1.4-5.3A8 8 0 1 1 21 12Z" />
        </svg>
      );
    case "share":
      return (
        <svg {...base} {...stroke}>
          <circle cx="18" cy="5" r="3" />
          <circle cx="6" cy="12" r="3" />
          <circle cx="18" cy="19" r="3" />
          <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
        </svg>
      );
    case "visibility":
      return (
        <svg {...base} {...stroke}>
          <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </svg>
      );
    case "arrow_forward":
      return (
        <svg {...base} {...stroke}>
          <path d="M5 12h14" />
          <path d="m12 5 7 7-7 7" />
        </svg>
      );
    case "payments":
    case "account_balance_wallet":
      return (
        <svg {...base} {...stroke}>
          <path d="M3 7a2 2 0 0 1 2-2h13v4M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2Z" />
          <circle cx="16.5" cy="14.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      );
    case "location_on":
      return (
        <svg {...base} {...stroke}>
          <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
          <circle cx="12" cy="9.5" r="2.5" />
        </svg>
      );
    case "event_available":
      return (
        <svg {...base} {...stroke}>
          <rect x="3" y="5" width="18" height="16" rx="2" />
          <path d="M3 10h18M8 3v4M16 3v4" />
          <path d="m8.5 15.5 2 2 4-4" />
        </svg>
      );
    case "workspace_premium":
      return (
        <svg {...base} {...stroke}>
          <circle cx="12" cy="8" r="5" />
          <path d="m8.5 12.5-2 8 5.5-3 5.5 3-2-8" />
        </svg>
      );
    case "code":
      return (
        <svg {...base} {...stroke}>
          <path d="m9 18-6-6 6-6" />
          <path d="m15 6 6 6-6 6" />
        </svg>
      );
    case "unfold_more":
      return (
        <svg {...base} {...stroke}>
          <path d="m7 15 5 5 5-5" />
          <path d="m7 9 5-5 5 5" />
        </svg>
      );
    case "chevron_left":
      return (
        <svg {...base} {...stroke}>
          <path d="m15 18-6-6 6-6" />
        </svg>
      );
    case "chevron_right":
      return (
        <svg {...base} {...stroke}>
          <path d="m9 18 6-6-6-6" />
        </svg>
      );
    case "fullscreen":
      return (
        <svg {...base} {...stroke}>
          <path d="M8 3H5a2 2 0 0 0-2 2v3M21 8V5a2 2 0 0 0-2-2h-3M3 16v3a2 2 0 0 0 2 2h3M16 21h3a2 2 0 0 0 2-2v-3" />
        </svg>
      );
    case "download":
      return (
        <svg {...base} {...stroke}>
          <path d="M12 3v12" />
          <path d="m7 10 5 5 5-5" />
          <path d="M5 21h14" />
        </svg>
      );
    case "check_circle":
      return (
        <svg {...base} {...stroke}>
          <circle cx="12" cy="12" r="9" />
          <path d="m8.5 12.5 2.5 2.5 5-5" />
        </svg>
      );
    default:
      return null;
  }
}

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */
const cx = (...parts) => parts.filter(Boolean).join(" ");

const formatCount = (n) =>
  n >= 1000
    ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".0", "")}k`
    : `${n}`;

const initials = (name = "") =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

function useOutsideClick(ref, handler) {
  useEffect(() => {
    const listener = (e) => {
      if (ref.current && !ref.current.contains(e.target)) handler();
    };
    document.addEventListener("mousedown", listener);
    document.addEventListener("touchstart", listener);
    return () => {
      document.removeEventListener("mousedown", listener);
      document.removeEventListener("touchstart", listener);
    };
  }, [ref, handler]);
}

function useMediaQuery(query) {
  const [matches, setMatches] = useState(
    () => window.matchMedia?.(query).matches ?? false,
  );
  useEffect(() => {
    const mq = window.matchMedia(query);
    const onChange = () => setMatches(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, [query]);
  return matches;
}

function isReferralJob(job) {
  return Boolean(
    job.referralAvailable ||
      job.directReferral ||
      job.highVolumeReferrals ||
      job.pledge,
  );
}

/* -------------------------------------------------------------------------- */
/*  Sidebar filter facets — every option and count below is derived from the  */
/*  jobs actually returned by the API. Nothing here is a hardcoded list; a    */
/*  section simply doesn't render if no job in the current data has a value  */
/*  for that field.                                                          */
/* -------------------------------------------------------------------------- */

// Extracts a numeric LPA figure from a free-text package string
// ("₹10-15 LPA", "12 LPA", "₹12,00,000 per annum"). Commas are stripped first
// so "60,000" is read as 60000, not "60" and "000".
function parsePackageValue(pkg) {
  if (!pkg) return null;
  const s = String(pkg).toLowerCase().replace(/,/g, "");
  const matches = s.match(/\d+(\.\d+)?/g);
  if (!matches) return null;
  const nums = matches.map(Number).filter((n) => !Number.isNaN(n));
  if (!nums.length) return null;
  const avg = nums.reduce((a, b) => a + b, 0) / nums.length;
  if (/lpa|lakh|lac/.test(s)) return avg;
  if (avg >= 1000) return avg / 100000; // plain annual rupees → LPA
  return avg;
}

// Monthly / hourly / weekly pay is a stipend, never an LPA package.
const isStipend = (job) =>
  job.type === "Internship" ||
  /month|\/\s*mo\b|\bpm\b|p\.m|stipend|week|hour|\bday\b/i.test(
    String(job.package || ""),
  );

function compensationTier(job) {
  if (isStipend(job)) return null; // keeps internship stipends out of LPA tiers
  const val = parsePackageValue(job.package);
  if (val == null) return null;
  if (val < 10) return "6 – 10 LPA (Standard Tier)";
  if (val < 15) return "10 – 15 LPA (Dream Tier)";
  return "15+ LPA (Super Dream)";
}

// Falls back to pulling a 4-digit year out of the eligibility text when the
// post has no explicit batch/graduationBatch field.
function extractBatch(job) {
  if (job.batch) return String(job.batch);
  const match = String(job.eligibility || "").match(/20\d{2}/);
  return match ? match[0] : null;
}

function engagementLabel(job) {
  if (!job.type) return null;
  return job.ppo ? `${job.type} + PPO` : job.type;
}

/* Shared width for banner, search row and cards while the filter panel is closed */
const NARROW_STYLE = { width: "100%", maxWidth: "77rem", margin: "0 auto" };

/* Sort options (shown in the sort card) */
const SORT_OPTIONS = [
  {
    value: "relevant",
    label: "Most Relevant",
    // desc: "Best match for your search, referrals & fresh posts",
  },
  { value: "recent", label: "Most Recent", /*desc: "Newest posts first" */},
  { value: "likes", label: "Most Popular",/* desc: "Most liked by the community" */},
  {
    value: "deadline",
    label: "Application Deadline",
    /*desc: "Closing soonest first",*/
  },
];

// Higher score = more relevant. Combines search match, referral availability,
// freshers-friendly, community likes and how recent the post is.
function relevanceScore(job, q) {
  let s = 0;
  if (q) {
    if (job.role?.toLowerCase().includes(q)) s += 5;
    if (job.company?.toLowerCase().includes(q)) s += 4;
    if (job.skills?.some((x) => x.toLowerCase().includes(q))) s += 3;
  }
  if (isReferralJob(job)) s += 3;
  if (job.freshers) s += 1;
  s += Math.min(job.likes || 0, 20) / 10;
  const days = (Date.now() - job.createdTs) / 86400000;
  s += Math.max(0, 3 - days / 10);
  return s;
}

/* Filter state helpers */
const EMPTY_FILTERS = () => ({
  referralOnly: false,
  domains: new Set(),
  batch: null,
  comps: new Set(),
  location: null,
  engagement: null,
});

const countActive = (f) =>
  (f.referralOnly ? 1 : 0) +
  f.domains.size +
  (f.batch ? 1 : 0) +
  f.comps.size +
  (f.location ? 1 : 0) +
  (f.engagement ? 1 : 0);

const toggleInSet = (set, v) => {
  const next = new Set(set);
  if (next.has(v)) next.delete(v);
  else next.add(v);
  return next;
};

// Aggregates jobs into { value, count } facet options, most common first.
function useFacetCounts(jobs, getValue) {
  return useMemo(() => {
    const map = new Map();
    jobs.forEach((job) => {
      const v = getValue(job);
      if (!v) return;
      map.set(v, (map.get(v) || 0) + 1);
    });
    return [...map.entries()]
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count);
  }, [jobs, getValue]);
}

/* -------------------------------------------------------------------------- */
/*  Toast                                                                     */
/* -------------------------------------------------------------------------- */
function useToast() {
  const [toast, setToast] = useState({ show: false, message: "" });
  const timerRef = useRef(null);

  const showToast = (message) => {
    clearTimeout(timerRef.current);
    setToast({ show: true, message });
    timerRef.current = setTimeout(
      () => setToast({ show: false, message }),
      2600,
    );
  };

  const Toast = () => (
    <div className={cx(styles.toast, toast.show && styles.toastVisible)}>
      <Icon name="check_circle" className={styles.toastIcon} />
      <span className={styles.toastText}>{toast.message}</span>
    </div>
  );

  return { showToast, Toast };
}

/* -------------------------------------------------------------------------- */
/*  Report modal                                                              */
/* -------------------------------------------------------------------------- */
function ReportModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState(REPORT_REASONS[0]);
  const [otherNote, setOtherNote] = useState("");
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 180);
  };

  return createPortal(
    <div
      className={styles.reportOverlay}
      onPointerDown={(e) => {
        e.currentTarget.dataset.pressedBackdrop = e.target === e.currentTarget;
      }}
      onClick={(e) => {
        if (
          e.target === e.currentTarget &&
          e.currentTarget.dataset.pressedBackdrop === "true"
        ) {
          close();
        }
      }}
      role="dialog"
      aria-modal="true"
      aria-label="Report opportunity"
    >
      <div
        className={cx(styles.reportModal, visible && styles.reportModalVisible)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.reportHeader}>
          <div className={styles.reportHeaderLeft}>
            <div className={styles.reportIconWrap}>
              <Icon name="flag" className={styles.icon20} />
            </div>
            <div>
              <h3 className={styles.reportTitle}>Report Opportunity</h3>
              <p className={styles.reportSubtitle}>
                Flag inappropriate, expired, or fraudulent postings
              </p>
            </div>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className={styles.reportCloseBtn}
          >
            <Icon name="close" className={styles.icon20} />
          </button>
        </div>

        <div className={styles.reportReasons}>
          {REPORT_REASONS.map((r) => (
            <label key={r} className={styles.reportReasonLabel}>
              <input
                type="radio"
                name="report-reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className={styles.reportRadio}
              />
              <span className={styles.reportReasonText}>{r}</span>
            </label>
          ))}

          {reason === "Other" && (
            <textarea
              value={otherNote}
              onChange={(e) => setOtherNote(e.target.value)}
              rows={2}
              placeholder="Tell us more about the issue..."
              autoFocus
              className={styles.reportTextarea}
            />
          )}
        </div>

        <div className={styles.reportFooter}>
          <button onClick={close} className={styles.reportCancelBtn}>
            Cancel
          </button>
          <button
            disabled={reason === "Other" && !otherNote.trim()}
            onClick={() =>
              onSubmit(
                reason === "Other" ? { reason, note: otherNote } : { reason },
              )
            }
            className={styles.reportSubmitBtn}
          >
            Submit Report
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */
/*  Share modal                                                               */
/*  `conversations` should come from your chat/DM API:                        */
/*  [{ id, name, tag, avatar, isGroup, lastMessageAt (ms timestamp) }]        */
/*  Until that is wired up, the list is empty and "More" (native share /      */
/*  copy link) still works.                                                   */
/* -------------------------------------------------------------------------- */
function ShareModal({ job, conversations = [], onClose, onSend, showToast }) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    if (window.matchMedia?.("(pointer: fine)").matches) {
      inputRef.current?.focus();
    }
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 180);
  };

  const sorted = useMemo(
    () =>
      [...conversations].sort(
        (a, b) => (b.lastMessageAt || 0) - (a.lastMessageAt || 0),
      ),
    [conversations],
  );
  const filtered = sorted.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase().trim()),
  );

  const shareUrl = `${window.location.origin}${window.location.pathname}#job-${job.id}`;
  const shareText = `${job.alumni.name} shared a job opening: ${job.role} at ${job.company}`;

  const toggleSelect = (contact) => {
    setSelectedIds((ids) =>
      ids.includes(contact.id)
        ? ids.filter((id) => id !== contact.id)
        : [...ids, contact.id],
    );
  };

  const handleShareSelected = () => {
    if (selectedIds.length === 0) return;
    const chosen = conversations.filter((c) => selectedIds.includes(c.id));
    chosen.forEach((c) => onSend?.(c, job));
    showToast(
      chosen.length === 1
        ? `Sent to ${chosen[0].name}`
        : `Sent to ${chosen.length} people`,
    );
    close();
  };

  const openMore = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${job.role} at ${job.company}`,
          text: shareText,
          url: shareUrl,
        });
        close();
      } catch (err) {
        if (err?.name !== "AbortError") {
          console.error("Share failed:", err);
          showToast("Couldn't open the share sheet");
        }
      }
      return;
    }

    try {
      if (navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(shareUrl);
      } else {
        const ta = document.createElement("textarea");
        ta.value = shareUrl;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        document.execCommand("copy");
        document.body.removeChild(ta);
      }
      showToast("Link copied to clipboard");
    } catch {
      showToast("Sharing isn't supported on this browser");
    }
    close();
  };

  return createPortal(
    <div
      className={styles.shareOverlay}
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Share opportunity"
    >
      <div
        className={cx(styles.shareSheet, visible && styles.shareSheetVisible)}
        style={{
          maxHeight: "min(85dvh, 640px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.shareDragHandle}>
          <span className={styles.shareDragHandleBar} />
        </div>

        <div className={styles.shareHeader}>
          <div className={styles.shareHeaderInfo}>
            <h3 className={styles.shareTitle}>Share</h3>
            <p className={styles.shareSubtitle}>
              {job.role} · {job.company}
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className={styles.shareCloseBtn}
          >
            <Icon name="close" className={styles.icon20} />
          </button>
        </div>

        <div className={styles.shareSearchWrap}>
          <div className={styles.shareSearchBox}>
            <Icon name="search" className={styles.shareSearchIcon} />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people..."
              className={styles.shareSearchInput}
            />
          </div>
        </div>

        <div className={styles.shareContactsWrap}>
          {!query && filtered.length > 0 && (
            <p className={styles.shareRecentLabel}>Recent</p>
          )}
          {filtered.length === 0 ? (
            <p className={styles.shareEmptyText}>
              {conversations.length === 0
                ? "No recent chats. Use More to share elsewhere."
                : "No one found."}
            </p>
          ) : (
            <div className={styles.shareGrid}>
              {filtered.map((c) => {
                const selected = selectedIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleSelect(c)}
                    className={styles.shareContactBtn}
                  >
                    <div
                      className={cx(
                        styles.shareAvatar,
                        c.isGroup && styles.shareAvatarGroup,
                        selected && styles.shareAvatarSelected,
                      )}
                    >
                      {c.isGroup ? (
                        <Icon name="forum" className={styles.icon24} />
                      ) : (
                        initials(c.name)
                      )}
                      {selected && (
                        <span className={styles.shareSelectedBadge}>
                          <Icon name="verified" className={styles.icon12} />
                        </span>
                      )}
                    </div>
                    <span className={styles.shareContactName}>
                      {c.name.split(" ")[0]}
                    </span>
                    <span className={styles.shareContactMeta}>
                      {selected ? "Selected" : timeAgo(c.lastMessageAt)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className={styles.shareFooter}>
          <button
            onClick={handleShareSelected}
            disabled={selectedIds.length === 0}
            className={styles.shareBtn}
          >
            <Icon name="share" className={styles.icon16} />
            {selectedIds.length > 0 ? `Share (${selectedIds.length})` : "Share"}
          </button>
          <button onClick={openMore} className={styles.moreBtn}>
            <Icon name="more_vert" className={styles.icon16} /> More
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */
/*  Metadata pill                                                             */
/* -------------------------------------------------------------------------- */
function MetaPill({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className={styles.metaPill}>
      <Icon name={icon} className={styles.metaPillIcon} />
      <div className={styles.metaPillTextWrap}>
        <span className={styles.metaPillLabel}>{label}</span>
        <span className={styles.metaPillValue}>{value}</span>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  PDF document viewer                                                       */
/* -------------------------------------------------------------------------- */
function PdfPage({ pdf, pageNumber }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!pdf) return;
    let cancelled = false;
    let task = null;

    (async () => {
      const page = await pdf.getPage(pageNumber);
      if (cancelled || !canvasRef.current) return;

      const canvas = canvasRef.current;
      const base = page.getViewport({ scale: 1 });
      const cssWidth = canvas.parentElement.clientWidth || 800;
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      const scale = Math.min(cssWidth * dpr, 1600) / base.width;
      const viewport = page.getViewport({ scale });

      const off = document.createElement("canvas");
      off.width = viewport.width;
      off.height = viewport.height;
      task = page.render({
        canvasContext: off.getContext("2d"),
        viewport,
      });
      try {
        await task.promise;
      } catch {
        return;
      }
      if (cancelled) return;
      canvas.width = off.width;
      canvas.height = off.height;
      canvas.getContext("2d").drawImage(off, 0, 0);
    })();

    return () => {
      cancelled = true;
      task?.cancel();
    };
  }, [pdf, pageNumber]);

  return <canvas ref={canvasRef} className={styles.pdfCanvas} />;
}

function PdfStage({ pdf, error, page, numPages, onGo, className, style }) {
  const touchX = useRef(null);

  return (
    <div
      className={cx(styles.pdfStage, className)}
      style={style}
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === "ArrowRight") onGo(1);
        if (e.key === "ArrowLeft") onGo(-1);
      }}
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={(e) => {
        if (touchX.current == null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        touchX.current = null;
        if (Math.abs(dx) > 45) onGo(dx < 0 ? 1 : -1);
      }}
    >
      {error ? (
        <div className={styles.pdfState}>Couldn't load this document</div>
      ) : !pdf ? (
        <div className={styles.pdfState}>
          <span className={styles.pdfSpinner} />
        </div>
      ) : (
        <PdfPage pdf={pdf} pageNumber={page} />
      )}

      {pdf && page > 1 && (
        <button
          aria-label="Previous page"
          onClick={() => onGo(-1)}
          className={cx(styles.pdfNav, styles.pdfNavPrev)}
        >
          <Icon name="chevron_left" className={styles.icon20} />
        </button>
      )}
      {pdf && page < numPages && (
        <button
          aria-label="Next page"
          onClick={() => onGo(1)}
          className={cx(styles.pdfNav, styles.pdfNavNext)}
        >
          <Icon name="chevron_right" className={styles.icon20} />
        </button>
      )}
    </div>
  );
}

function PdfLightbox({
  title,
  src,
  pdf,
  error,
  page,
  numPages,
  onGo,
  onClose,
}) {
  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onGo(1);
      if (e.key === "ArrowLeft") onGo(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [onClose, onGo]);

  return createPortal(
    <div
      className={styles.pdfLightbox}
      style={{ zIndex: 2000 }}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.pdfLightboxBar}>
        <span className={styles.pdfLightboxTitle}>{title}</span>
        <span className={styles.pdfCount}>
          {page} / {numPages}
        </span>
        <a
          href={src}
          download
          className={styles.pdfIconBtn}
          aria-label="Download"
        >
          <Icon name="download" className={styles.icon20} />
        </a>
        <button
          onClick={onClose}
          aria-label="Close"
          className={styles.pdfIconBtn}
        >
          <Icon name="close" className={styles.icon20} />
        </button>
      </div>
      <div className={styles.pdfLightboxBody}>
        <PdfStage
          pdf={pdf}
          error={error}
          page={page}
          numPages={numPages}
          onGo={onGo}
          className={styles.pdfStageFull}
        />
      </div>
    </div>,
    document.body,
  );
}

function PdfViewer({ src, title }) {
  const [pdf, setPdf] = useState(null);
  const [numPages, setNumPages] = useState(0);
  const [page, setPage] = useState(1);
  const [ratio, setRatio] = useState(4 / 3);
  const [error, setError] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let task = null;
    const controller = new AbortController();

    (async () => {
      try {
        setError(false);
        // Plain cross-origin GET: no cookies, no Authorization header (the
        // axios instance adds a Bearer token, which S3 rejects and which also
        // forces a CORS preflight).
        const res = await fetch(src, {
          mode: "cors",
          credentials: "omit",
          signal: controller.signal,
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const buffer = await res.arrayBuffer();
        if (cancelled) return;

        task = pdfjsLib.getDocument({ data: new Uint8Array(buffer) });
        const doc = await task.promise;
        const first = await doc.getPage(1);
        if (cancelled) return;

        const vp = first.getViewport({ scale: 1 });
        setRatio(vp.width / vp.height);
        setNumPages(doc.numPages);
        setPdf(doc);
      } catch (err) {
        if (cancelled || err?.name === "AbortError") return;
        console.error(
          "PDF load failed:",
          src,
          err,
          "\nIf this says 'Failed to fetch', the S3 bucket is missing a CORS rule for this origin.",
        );
        setError(true);
      }
    })();

    return () => {
      cancelled = true;
      controller.abort();
      task?.destroy();
    };
  }, [src]);

  const go = (d) => setPage((p) => Math.min(numPages || 1, Math.max(1, p + d)));

  return (
    <div className={styles.pdfWrap}>
      <PdfStage
        pdf={pdf}
        error={error}
        page={page}
        numPages={numPages}
        onGo={go}
        style={{ aspectRatio: ratio }}
      />
      <div className={styles.pdfBar}>
        <span className={styles.pdfTitle}>{title}</span>
        {numPages > 0 && (
          <span className={styles.pdfCount}>
            {page} / {numPages}
          </span>
        )}
        <a
          href={src}
          download
          className={styles.pdfIconBtn}
          aria-label="Download PDF"
        >
          <Icon name="download" className={styles.icon18} />
        </a>
        <button
          onClick={() => setExpanded(true)}
          aria-label="Open fullscreen"
          className={styles.pdfIconBtn}
        >
          <Icon name="fullscreen" className={styles.icon18} />
        </button>
      </div>

      {expanded && (
        <PdfLightbox
          title={title}
          src={src}
          pdf={pdf}
          error={error}
          page={page}
          numPages={numPages}
          onGo={go}
          onClose={() => setExpanded(false)}
        />
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Image lightbox: fullscreen image, X at top, pinch / double-tap to zoom    */
/* -------------------------------------------------------------------------- */
function ImageLightbox({ images, index, onChange, onClose, alt }) {
  const [view, setView] = useState({ s: 1, x: 0, y: 0 });
  const [animate, setAnimate] = useState(false);
  const stageRef = useRef(null);
  const g = useRef({});
  const viewRef = useRef(view);
  viewRef.current = view;
  const multiple = images.length > 1;

  const go = (d) => onChange((index + d + images.length) % images.length);

  // reset zoom whenever the image changes
  useEffect(() => {
    setView({ s: 1, x: 0, y: 0 });
    g.current = {};
  }, [index]);

  useEffect(() => {
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
      if (multiple && e.key === "ArrowRight")
        onChange((index + 1) % images.length);
      if (multiple && e.key === "ArrowLeft")
        onChange((index - 1 + images.length) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener("keydown", onKey);
    };
  }, [index, images.length, multiple, onChange, onClose]);

  // keep the zoomed image from being dragged fully out of view
  const clamp = (s, x, y) => {
    const el = stageRef.current;
    const w = el?.clientWidth || 0;
    const h = el?.clientHeight || 0;
    const mx = (w * (s - 1)) / 2;
    const my = (h * (s - 1)) / 2;
    return {
      s,
      x: Math.max(-mx, Math.min(mx, x)),
      y: Math.max(-my, Math.min(my, y)),
    };
  };

  const dist = (t) =>
    Math.hypot(t[0].clientX - t[1].clientX, t[0].clientY - t[1].clientY);

  const onTouchStart = (e) => {
    setAnimate(false);
    const t = e.touches;
    const v = viewRef.current;
    if (t.length === 2) {
      g.current = { mode: "pinch", d0: dist(t), s0: v.s, x0: v.x, y0: v.y };
    } else if (t.length === 1) {
      g.current = {
        lastTap: g.current.lastTap,
        mode: v.s > 1 ? "pan" : "swipe",
        sx: t[0].clientX,
        sy: t[0].clientY,
        x0: v.x,
        y0: v.y,
        moved: false,
      };
    }
  };

  const onTouchMove = (e) => {
    const t = e.touches;
    const c = g.current;
    if (c.mode === "pinch" && t.length === 2) {
      const s = Math.min(5, Math.max(1, (c.s0 * dist(t)) / c.d0));
      setView(clamp(s, c.x0, c.y0));
    } else if (t.length === 1 && c.sx != null) {
      const dx = t[0].clientX - c.sx;
      const dy = t[0].clientY - c.sy;
      if (Math.abs(dx) + Math.abs(dy) > 8) c.moved = true;
      if (c.mode === "pan") {
        setView(clamp(viewRef.current.s, c.x0 + dx, c.y0 + dy));
      }
    }
  };

  const onTouchEnd = (e) => {
    const c = g.current;

    // one finger left after a pinch: carry on as a pan
    if (e.touches.length === 1) {
      const v = viewRef.current;
      g.current = {
        mode: v.s > 1 ? "pan" : "swipe",
        sx: e.touches[0].clientX,
        sy: e.touches[0].clientY,
        x0: v.x,
        y0: v.y,
        moved: true,
      };
      return;
    }
    if (e.touches.length > 0) return;

    const t = e.changedTouches[0];

    // swipe to change image (only when not zoomed)
    if (c.mode === "swipe" && multiple) {
      const dx = t.clientX - c.sx;
      const dy = t.clientY - c.sy;
      if (Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy)) {
        go(dx < 0 ? 1 : -1);
        g.current = {};
        return;
      }
    }

    // double tap: toggle zoom
    if ((c.mode === "swipe" || c.mode === "pan") && !c.moved) {
      const now = Date.now();
      if (now - (c.lastTap || 0) < 300) {
        setAnimate(true);
        setView(
          viewRef.current.s > 1 ? { s: 1, x: 0, y: 0 } : { s: 2.5, x: 0, y: 0 },
        );
        g.current = {};
      } else {
        g.current = { lastTap: now };
      }
      return;
    }

    // snap back to fit if pinched out to (almost) 1x
    if (viewRef.current.s < 1.02) setView({ s: 1, x: 0, y: 0 });
    g.current = {};
  };

  // desktop: mouse wheel zoom
  const onWheel = (e) => {
    setAnimate(false);
    const v = viewRef.current;
    const s = Math.min(5, Math.max(1, v.s * (e.deltaY < 0 ? 1.15 : 1 / 1.15)));
    setView(clamp(s, v.x, v.y));
  };

  return createPortal(
    <div
      className={styles.imgLightbox}
      style={{ zIndex: 2000 }}
      role="dialog"
      aria-modal="true"
    >
      <div className={styles.imgLightboxBar}>
        {multiple ? (
          <span className={styles.imgLightboxCount}>
            {index + 1} / {images.length}
          </span>
        ) : (
          <span />
        )}
        <button
          onClick={onClose}
          aria-label="Close"
          className={styles.imgLightboxClose}
        >
          <Icon name="close" className={styles.icon24} />
        </button>
      </div>

      <div
        ref={stageRef}
        className={styles.imgLightboxStage}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        onWheel={onWheel}
      >
        <img
          src={images[index]}
          alt={alt}
          draggable={false}
          className={styles.imgLightboxImg}
          style={{
            transform: `translate(${view.x}px, ${view.y}px) scale(${view.s})`,
            transition: animate ? "transform 0.2s ease" : "none",
          }}
        />
      </div>

      {multiple && (
        <>
          <button
            aria-label="Previous image"
            onClick={() => go(-1)}
            className={cx(styles.imgNav, styles.imgNavPrev)}
          >
            <Icon name="chevron_left" className={styles.icon20} />
          </button>
          <button
            aria-label="Next image"
            onClick={() => go(1)}
            className={cx(styles.imgNav, styles.imgNavNext)}
          >
            <Icon name="chevron_right" className={styles.icon20} />
          </button>
        </>
      )}
    </div>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */
/*  Job card                                                                  */
/* -------------------------------------------------------------------------- */
function CommentText({ text }) {
  const ref = useRef(null);
  const [expanded, setExpanded] = useState(false);
  const [overflowing, setOverflowing] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const check = () => {
      if (!expanded) setOverflowing(el.scrollHeight > el.clientHeight + 1);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [text, expanded]);

  return (
    <>
      <p
        ref={ref}
        className={cx(styles.commentText, !expanded && styles.commentTextClamped)}
      >
        {text}
      </p>
      {(overflowing || expanded) && (
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className={styles.commentMoreBtn}
        >
          {expanded ? "Show less" : "Show more"}
        </button>
      )}
    </>
  );
}

function JobCard({ job, conversations, onReport, showToast }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(job.likes);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState(job.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);
  const [portrait, setPortrait] = useState(false);

  // Image carousel (shown when a post has 2+ images)
  const images = job.images || [];
  const [imgIndex, setImgIndex] = useState(0);
  const currentImage = images[imgIndex] || null;
  const hasMultiple = images.length > 1;
  const imgTouchX = useRef(null);
  const swipedRef = useRef(false); // true when the last touch was a swipe, not a tap
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const goImage = (d) =>
    setImgIndex((i) => (i + d + images.length) % images.length);

  // Landscape/square images are shown at their natural size (no cropping).
  const fullImage = Boolean(currentImage) && !portrait;

  const menuRef = useRef(null);
  useOutsideClick(menuRef, () => setMenuOpen(false));

  const cardRef = useRef(null);
  const commentInputRef = useRef(null);
  useEffect(() => {
    if (!showComments) return;
    const handler = (e) => {
      const inputFocused =
        commentInputRef.current &&
        document.activeElement === commentInputRef.current;
      if (inputFocused) return;

      if (cardRef.current && !cardRef.current.contains(e.target)) {
        const anchor = e.target;
        const topBefore = anchor.getBoundingClientRect().top;

        flushSync(() => setShowComments(false));

        const delta = anchor.getBoundingClientRect().top - topBefore;
        if (delta) {
          window.scrollBy({ top: delta, left: 0, behavior: "instant" });
        }
      }
    };
    document.addEventListener("pointerdown", handler);
    return () => document.removeEventListener("pointerdown", handler);
  }, [showComments]);

  const toggleLike = () => {
    setLiked((v) => !v);
    setLikes((n) => (liked ? n - 1 : n + 1));
  };

  const copyLink = () => {
    const url = `${window.location.origin}${window.location.pathname}#job-${job.id}`;
    navigator.clipboard?.writeText(url);
    showToast(`Link copied for ${job.company} ${job.role}`);
    setMenuOpen(false);
  };

  const handleShare = () => setShareOpen(true);

  const toggleBookmark = () => {
    setSaved((v) => {
      showToast(
        v
          ? "Removed from saved opportunities"
          : "Opportunity bookmarked successfully",
      );
      return !v;
    });
    setMenuOpen(false);
  };

  const addComment = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setComments((c) => [
      ...c,
      { id: Date.now(), user: "You", tag: "You", text: draft.trim() },
    ]);
    setDraft("");
    showToast("Comment published to alumni thread");
  };

  return (
    <article ref={cardRef} id={`job-${job.id}`} className={styles.jobCard}>
      {/* ---------- Alumni header ---------- */}
      <div className={styles.cardHeader}>
        <div className={styles.cardHeaderLeft}>
          <div className={styles.avatarWrap}>
            {job.alumni.avatar ? (
              <img
                src={job.alumni.avatar}
                alt={job.alumni.name}
                className={styles.avatarImg}
              />
            ) : (
              <div className={styles.avatarFallback}>
                {initials(job.alumni.name)}
              </div>
            )}
          </div>
          <div className={styles.alumniInfo}>
            <div className={styles.alumniNameRow}>
              <span className={styles.alumniName}>{job.alumni.name}</span>
              {job.alumni.batch && (
                <span className={styles.batchTag}>{job.alumni.batch}</span>
              )}
              {job.postedAgo && (
                <span className={styles.postedAgo}>· {job.postedAgo}</span>
              )}
            </div>
            <span className={styles.designationText}>
              {job.alumni.designation}
              {job.company ? ` at ${job.company}` : ""}
            </span>
          </div>
        </div>

        <div className={styles.menuWrap} ref={menuRef}>
          <button
            aria-label="Card options"
            onClick={() => setMenuOpen((v) => !v)}
            className={styles.menuBtn}
          >
            <Icon name="more_vert" className={styles.icon20} />
          </button>
          {menuOpen && (
            <div className={styles.menuDropdown}>
              <button onClick={copyLink} className={styles.menuItem}>
                <Icon name="link" className={styles.icon18} /> Copy Link
              </button>
              <button onClick={toggleBookmark} className={styles.menuItem}>
                <Icon
                  name="bookmark"
                  className={cx(
                    "h-[18px] w-[18px]",
                    saved && styles.bookmarkActive,
                  )}
                  filled={saved}
                />{" "}
                Bookmark
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setReportOpen(true);
                }}
                className={cx(styles.menuItem, styles.menuItemDanger)}
              >
                <Icon name="flag" className={styles.icon18} /> Report Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Hero banner / PDF document ---------- */}
      {job.pdf ? (
        <PdfViewer
          src={job.pdf.url}
          title={job.pdf.title || `${job.role} · ${job.company}`}
        />
      ) : (
        <div
          className={cx(
            styles.heroBanner,
            portrait && styles.heroBannerPortrait,
          )}
          style={
            fullImage
              ? {
                  height: "auto",
                  minHeight: 0,
                  maxHeight: "none",
                  aspectRatio: "auto",
                }
              : undefined
          }
          onTouchStart={(e) => {
            imgTouchX.current = e.touches[0].clientX;
            swipedRef.current = false;
          }}
          onTouchEnd={(e) => {
            if (imgTouchX.current == null || !hasMultiple) return;
            const dx = e.changedTouches[0].clientX - imgTouchX.current;
            imgTouchX.current = null;
            if (Math.abs(dx) > 45) {
              swipedRef.current = true;
              goImage(dx < 0 ? 1 : -1);
            }
          }}
        >
          {currentImage ? (
            <>
              {portrait && (
                <img
                  src={currentImage}
                  alt=""
                  aria-hidden="true"
                  className={styles.heroBackdrop}
                />
              )}
              <img
                key={currentImage}
                src={currentImage}
                alt={`${job.company} workplace`}
                loading="lazy"
                onClick={() => {
                  if (swipedRef.current) {
                    swipedRef.current = false;
                    return;
                  }
                  setLightboxOpen(true);
                }}
                onLoad={(e) =>
                  setPortrait(
                    e.currentTarget.naturalHeight >
                      e.currentTarget.naturalWidth,
                  )
                }
                className={cx(
                  styles.heroImg,
                  portrait && styles.heroImgContain,
                )}
                style={
                  fullImage
                    ? {
                        position: "static",
                        display: "block",
                        width: "100%",
                        height: "auto",
                        maxHeight: "none",
                        objectFit: "contain",
                      }
                    : undefined
                }
              />
            </>
          ) : (
            <div className={styles.heroGradientBg}>
              <div className={styles.heroGradientTextWrap}>
                <span className={styles.heroTypeLabel}>
                  {job.type ? `${job.type} Program` : "Opportunity"}
                </span>
                <h2 className={styles.heroRoleTitle}>{job.role}</h2>
              </div>
              <div className={styles.heroMonogram}>{initials(job.company)}</div>
            </div>
          )}
          <div
            className={styles.heroOverlay}
            style={fullImage ? { display: "none" } : undefined}
          />

          {hasMultiple && (
            <>
              <span className={styles.imgCount}>
                {imgIndex + 1} / {images.length}
              </span>
              <button
                aria-label="Previous image"
                onClick={() => goImage(-1)}
                className={cx(styles.imgNav, styles.imgNavPrev)}
              >
                <Icon name="chevron_left" className={styles.icon20} />
              </button>
              <button
                aria-label="Next image"
                onClick={() => goImage(1)}
                className={cx(styles.imgNav, styles.imgNavNext)}
              >
                <Icon name="chevron_right" className={styles.icon20} />
              </button>
            </>
          )}

          {currentImage && (
            <div
              className={styles.heroBottomBar}
              style={
                fullImage
                  ? {
                      position: "static",
                      background: "#0f172a",
                      padding: "12px 16px",
                    }
                  : undefined
              }
            >
              <div>
                <div className={styles.heroCompanyLabel}>{job.company}</div>
                <h2 className={styles.heroRoleHeading}>{job.role}</h2>
              </div>
              {(job.directReferral || job.highVolumeReferrals) && (
                <div className={styles.heroReferralPill}>
                  <Icon
                    name="verified_user"
                    className={styles.heroReferralIcon}
                  />
                  {job.directReferral || "Velammal Exclusive Priority"}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ---------- Body ---------- */}
      <div className={styles.cardBody}>
        {(job.type ||
          job.freshers ||
          job.remote ||
          job.referralAvailable ||
          job.highVolumeReferrals) && (
          <div className={styles.heroBadges}>
            {job.type && <span className={styles.badge}>{job.type}</span>}
            {job.freshers && (
              <span className={cx(styles.badge, styles.badgeFreshers)}>
                Freshers Welcome
              </span>
            )}
            {job.remote && (
              <span className={cx(styles.badge, styles.badgeRemote)}>
                Remote Eligible
              </span>
            )}
            {job.referralAvailable && (
              <span className={cx(styles.badge, styles.badgeReferral)}>
                Referral Available
              </span>
            )}
            {job.highVolumeReferrals && (
              <span className={cx(styles.badge, styles.badgeHighVolume)}>
                High Volume Referrals
              </span>
            )}
          </div>
        )}
        {job.directReferral && (
          <div className={styles.pledgeBox}>
            <Icon name="verified_user" className={styles.pledgeIcon} />
            <p className={styles.pledgeText}>
              <strong className={styles.pledgeStrong}>
                Referral contact:{" "}
              </strong>
              {job.directReferral}
            </p>
          </div>
        )}
        {job.pledge && (
          <div className={styles.pledgeBox}>
            <Icon name="school" className={styles.pledgeIcon} />
            <p className={styles.pledgeText}>
              <strong className={styles.pledgeStrong}>
                Alumni Referral Pledge:{" "}
              </strong>
              {job.pledge}
            </p>
          </div>
        )}

        {job.description && (
          <p className={styles.descriptionText}>{job.description}</p>
        )}

        {job.tags?.length > 0 && (
          <div className={styles.tagsRow}>
            {job.tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </div>
        )}

        <div className={styles.metaGrid}>
          <MetaPill
            icon="payments"
            label="Package"
            value={job.type !== "Internship" ? job.package : null}
          />
          <MetaPill
            icon="account_balance_wallet"
            label="Stipend"
            value={job.type === "Internship" ? job.package : null}
          />
          <MetaPill icon="location_on" label="Location" value={job.location} />
          <MetaPill
            icon="event_available"
            label="Deadline"
            value={job.deadline}
          />
          <MetaPill icon="school" label="Eligibility" value={job.eligibility} />
          <MetaPill
            icon="workspace_premium"
            label="PPO Conversion"
            value={job.ppo}
          />
          <MetaPill icon="code" label="Hiring Loop" value={job.hiringLoop} />
        </div>

        {job.skills?.length > 0 && (
          <div className={styles.skillsRow}>
            <span className={styles.skillsLabel}>Skills:</span>
            {job.skills.map((s) => (
              <span key={s} className={styles.skillChip}>
                {s}
              </span>
            ))}
          </div>
        )}

        {job.applyLink && (
          <div className={styles.ctaWrap}>
            <a
              href={job.applyLink}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.ctaBtn}
            >
              <span>{job.applyLabel || "Apply on company portal"}</span>
              <Icon name="arrow_forward" className={styles.ctaIcon} />
            </a>
          </div>
        )}
      </div>

      {/* ---------- Social footer ---------- */}
      <div className={styles.socialFooter}>
        <div className={styles.socialLeft}>
          <button onClick={toggleLike} className={styles.likeBtn}>
            <Icon
              name="favorite"
              className={cx(styles.likeIcon, liked && styles.likeIconActive)}
              filled={liked}
            />
            <span className={styles.socialCount}>{likes}</span>
          </button>
          <button
            onClick={() => setShowComments((v) => !v)}
            className={styles.commentBtn}
          >
            <Icon name="chat_bubble" className={styles.icon20} />
            <span className={styles.socialCount}>{comments.length}</span>
          </button>
          <button onClick={handleShare} className={styles.shareCardBtn}>
            <Icon name="share" className={styles.icon20} />
            <span className={styles.shareLabel}>Share</span>
          </button>
        </div>
        <div className={styles.socialRight}>
          <div className={styles.viewsInfo}>
            <Icon name="visibility" className={styles.icon18} />
            <span>{formatCount(job.views)} views</span>
          </div>
          <button
            onClick={toggleBookmark}
            title="Save Role"
            className={styles.bookmarkBtn}
          >
            <Icon
              name="bookmark"
              className={cx(
                styles.bookmarkIconLarge,
                saved && styles.bookmarkActive,
              )}
              filled={saved}
            />
          </button>
        </div>
      </div>

      {/* ---------- Comments drawer ---------- */}
      {showComments && (
        <div className={styles.commentsDrawer}>
          {comments.length === 0 ? (
            <div className={styles.commentsEmpty}>
              <Icon name="forum" className={styles.commentsEmptyIcon} />
              <p className={styles.commentsEmptyTitle}>No queries posted yet</p>
              <p className={styles.commentsEmptyText}>
                Be the first to ask {job.alumni.name.split(" ")[0]} about this
                opportunity.
              </p>
            </div>
          ) : (
            <>
              <h4 className={styles.commentsHeading}>
                Discussion ({comments.length})
              </h4>
              <div className={styles.commentsList}>
                {comments.map((c) => (
                  <div key={c.id} className={styles.commentItem}>
                    <div className={styles.commentAvatar}>
                      {initials(c.user)}
                    </div>
                    <div className={styles.commentContent}>
                      <div className={styles.commentTop}>
                        <span className={styles.commentUser}>{c.user}</span>
                        {c.tag && (
                          <span className={styles.commentTag}>{c.tag}</span>
                        )}
                      </div>
                      <CommentText text={c.text} />
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <form onSubmit={addComment} className={styles.commentForm}>
            <input
              ref={commentInputRef}
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a comment or query..."
              className={styles.commentInput}
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className={styles.commentSendBtn}
            >
              Send
            </button>
          </form>
        </div>
      )}

      {lightboxOpen && images.length > 0 && (
        <ImageLightbox
          images={images}
          index={imgIndex}
          onChange={setImgIndex}
          onClose={() => setLightboxOpen(false)}
          alt={`${job.company} ${job.role}`}
        />
      )}

      {reportOpen && (
        <ReportModal
          onClose={() => setReportOpen(false)}
          onSubmit={(payload) => {
            onReport?.(job.id, payload);
            setReportOpen(false);
            showToast("Report submitted for moderator review.");
          }}
        />
      )}

      {shareOpen && (
        <ShareModal
          job={job}
          conversations={conversations}
          onClose={() => setShareOpen(false)}
          onSend={() => {
            // Wire into your DM send call, e.g.
            // api.post("/messages", { to: contact.id, postId: sharedJob.id })
          }}
          showToast={showToast}
        />
      )}
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stats banner (all values derived from the fetched posts)                  */
/* -------------------------------------------------------------------------- */
function StatsBanner({ jobs }) {
  const referrerCount = useMemo(() => {
    const ids = new Set();
    jobs.forEach((j) => {
      if (
        j.referralAvailable ||
        j.directReferral ||
        j.highVolumeReferrals ||
        j.pledge
      ) {
        ids.add(j.alumni.id || j.alumni.name);
      }
    });
    return ids.size;
  }, [jobs]);

  const latest = useMemo(
    () => jobs.reduce((max, j) => (j.createdTs > max ? j.createdTs : max), 0),
    [jobs],
  );

  return (
    <section
      className={styles.hero}
      style={{ backgroundImage: `url(${heroBg})` }}
    >
      <div className={styles.heroShade} />
      <div className={styles.heroInner}>
        <div className={styles.heroText}>
          <h1 className={styles.heroTitle}>JOB BOARD</h1>
          <p className={styles.heroDesc}>
            The exclusive gateway for Velammal Engineering College students to
            access premium career opportunities, referrals, and mentorship from
            our global alumni network.
          </p>
        </div>

        <div className={styles.heroStats}>
          <div className={styles.heroStatCard}>
            <span className={styles.heroStatLabel}>Active Openings</span>
            <span className={styles.heroStatValue}>{jobs.length}</span>
          </div>
          <div className={styles.heroStatCard}>
            <span className={styles.heroStatLabel}>Active Referrers</span>
            <span className={styles.heroStatValue}>{referrerCount}</span>
          </div>
          <div className={styles.heroStatCard}>
            <span className={styles.heroStatLabel}>Latest Post</span>
            <span className={styles.heroStatValue}>
              {latest ? timeAgo(latest) : "—"}
            </span>
          </div>
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sort card (dropdown)                                                      */
/* -------------------------------------------------------------------------- */
function SortMenu({ sort, setSort }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  useOutsideClick(ref, () => setOpen(false));
  const current = SORT_OPTIONS.find((o) => o.value === sort) || SORT_OPTIONS[0];

  return (
    <div className={styles.sortMenuWrap} ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="listbox"
        aria-expanded={open}
        className={styles.sortMenuBtn}
      >
        <span>{current.label}</span>
        <Icon name="unfold_more" className={styles.icon18} />
      </button>
      {open && (
        <div className={styles.sortCard} role="listbox">
          <p className={styles.sortCardTitle}>Sort by</p>
          {SORT_OPTIONS.map((o) => (
            <button
              key={o.value}
              type="button"
              role="option"
              aria-selected={sort === o.value}
              onClick={() => {
                setSort(o.value);
                setOpen(false);
              }}
              className={cx(
                styles.sortOption,
                sort === o.value && styles.sortOptionActive,
              )}
            >
              <span className={styles.sortOptionText}>
                <span className={styles.sortOptionLabel}>{o.label}</span>
                <span className={styles.sortOptionDesc}>{o.desc}</span>
              </span>
              {sort === o.value && (
                <Icon name="verified" className={styles.sortOptionCheck} />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Search + sort + Filters button                                            */
/* -------------------------------------------------------------------------- */
function Controls({
  search,
  setSearch,
  sort,
  setSort,
  onOpenFilters,
  activeCount,
}) {
  return (
    <div className={styles.controls}>
      <div className={styles.controlsLeft}>
        <div className={styles.searchWrap}>
          <Icon name="search" className={styles.searchInputIcon} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role, company, or tech stack..."
            className={styles.controlsSearchInput}
          />
        </div>
        <SortMenu sort={sort} setSort={setSort} />
        <button
          type="button"
          onClick={onOpenFilters}
          className={cx(
            styles.filterToggleBtn,
            activeCount > 0 && styles.filterToggleBtnActive,
          )}
        >
          <Icon name="tune" className={styles.icon18} />
          Filters
          {activeCount > 0 && (
            <span className={styles.filterToggleCount}>{activeCount}</span>
          )}
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty / loading / error states                                            */
/* -------------------------------------------------------------------------- */
function EmptyState({ onReset }) {
  return (
    <div className={styles.emptyState}>
      <div className={styles.emptyIconWrap}>
        <Icon name="manage_search" className={styles.emptyIcon} />
      </div>
      <h3 className={styles.emptyTitle}>No alumni postings found</h3>
      <p className={styles.emptyText}>
        Try adjusting your filters, clearing your search query, or checking back
        soon as new cohorts share vacancies.
      </p>
      <button onClick={onReset} className={styles.emptyResetBtn}>
        Reset All Filters
      </button>
    </div>
  );
}

function LoadingState() {
  return (
    <div className={styles.emptyState}>
      <span className={styles.pdfSpinner} />
      <p className={styles.emptyText}>Loading opportunities…</p>
    </div>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div className={styles.emptyState}>
      <h3 className={styles.emptyTitle}>Couldn't load opportunities</h3>
      <p className={styles.emptyText}>{message}</p>
      <button onClick={onRetry} className={styles.emptyResetBtn}>
        Try Again
      </button>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Filter panel ("Filter Roles" card)                                        */
/*  Desktop: sidebar card with an X to close. Filters apply live.             */
/*  Mobile: sheet sliding from the top; changes apply only on "Apply".        */
/* -------------------------------------------------------------------------- */
function FilterCheckbox({ checked, onChange, label, count }) {
  return (
    <label className={styles.filterCheckboxLabel}>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className={styles.filterCheckbox}
      />
      <span className={styles.filterCheckboxText}>{label}</span>
      {typeof count === "number" && (
        <span className={styles.filterCount}>{count}</span>
      )}
    </label>
  );
}

function FilterPillButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cx(styles.filterPillBtn, active && styles.filterPillBtnActive)}
    >
      {children}
    </button>
  );
}

function FilterSidebar({
  jobs,
  value,
  onChange,
  onReset,
  onClose,
  onApply,
  isMobile,
}) {
  const domainFacets = useFacetCounts(jobs, (j) => j.domain);
  const batchFacets = useFacetCounts(jobs, extractBatch);
  const compFacets = useFacetCounts(jobs, compensationTier);
  const locationFacets = useFacetCounts(jobs, (j) => j.location);
  const engagementFacets = useFacetCounts(jobs, engagementLabel);

  const set = (patch) => onChange({ ...value, ...patch });
  const hasActive = countActive(value) > 0;

  // mobile: slide-from-top animation + scroll lock
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!isMobile) return;
    const t = setTimeout(() => setVisible(true), 10);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      clearTimeout(t);
      document.body.style.overflow = prev;
    };
  }, [isMobile]);

  const closeAnimated = () => {
    if (!isMobile) return onClose();
    setVisible(false);
    setTimeout(onClose, 220);
  };
  const applyAnimated = () => {
    setVisible(false);
    setTimeout(onApply, 220);
  };

  const card = (
    <div className={styles.filterCard}>
      <div className={styles.filterCardHeader}>
        <h3 className={styles.filterCardTitle}>Filter Roles</h3>
        <div className={styles.filterHeaderActions}>
          {hasActive && (
            <button
              type="button"
              onClick={onReset}
              className={styles.filterResetBtn}
            >
              Reset
            </button>
          )}
          <button
            type="button"
            onClick={closeAnimated}
            aria-label="Close filters"
            className={styles.filterCloseBtn}
          >
            <Icon name="close" className={styles.icon20} />
          </button>
        </div>
      </div>

      <div className={cx(styles.filterSection, styles.filterToggleSection)}>
        <div className={styles.filterToggleRow}>
          <div>
            <p className={styles.filterToggleLabel}>Alumni Referral</p>
            <p className={styles.filterToggleSub}>
              Only jobs with verified alum referrals
            </p>
          </div>
          <label className={styles.toggleSwitch}>
            <input
              type="checkbox"
              checked={value.referralOnly}
              onChange={() => set({ referralOnly: !value.referralOnly })}
            />
            <span className={styles.toggleSlider} />
          </label>
        </div>
      </div>

      {domainFacets.length > 0 && (
        <div className={styles.filterSection}>
          <div className={styles.filterSectionHeader}>
            <span className={styles.filterSectionTitle}>
              Domain / Specialty
            </span>
            {value.domains.size > 0 && (
              <span className={styles.filterSelectedTag}>
                Selected {value.domains.size}
              </span>
            )}
          </div>
          <div className={styles.filterList}>
            {domainFacets.map(({ value: v, count }) => (
              <FilterCheckbox
                key={v}
                checked={value.domains.has(v)}
                onChange={() => set({ domains: toggleInSet(value.domains, v) })}
                label={v}
                count={count}
              />
            ))}
          </div>
        </div>
      )}

      {batchFacets.length > 0 && (
        <div className={styles.filterSection}>
          <span className={styles.filterSectionTitle}>Graduating Batch</span>
          <div className={styles.filterPillGrid}>
            {batchFacets.map(({ value: v }) => (
              <FilterPillButton
                key={v}
                active={value.batch === v}
                onClick={() => set({ batch: value.batch === v ? null : v })}
              >
                {v}
              </FilterPillButton>
            ))}
          </div>
        </div>
      )}

      {compFacets.length > 0 && (
        <div className={styles.filterSection}>
          <div className={styles.filterSectionHeader}>
            <span className={styles.filterSectionTitle}>
              Compensation Range
            </span>
            {value.comps.size > 0 && (
              <span className={styles.filterSelectedTag}>
                Selected {value.comps.size}
              </span>
            )}
          </div>
          <div className={styles.filterList}>
            {compFacets.map(({ value: v, count }) => (
              <FilterCheckbox
                key={v}
                checked={value.comps.has(v)}
                onChange={() => set({ comps: toggleInSet(value.comps, v) })}
                label={v}
                count={count}
              />
            ))}
          </div>
        </div>
      )}

      {locationFacets.length > 0 && (
        <div className={styles.filterSection}>
          <span className={styles.filterSectionTitle}>Primary Location</span>
          <div className={styles.filterPillGrid}>
            {locationFacets.map(({ value: v }) => (
              <FilterPillButton
                key={v}
                active={value.location === v}
                onClick={() =>
                  set({ location: value.location === v ? null : v })
                }
              >
                {v}
              </FilterPillButton>
            ))}
          </div>
        </div>
      )}

      {engagementFacets.length > 0 && (
        <div className={cx(styles.filterSection, styles.filterSectionLast)}>
          <span className={styles.filterSectionTitle}>Engagement Type</span>
          <div className={styles.filterPillGrid}>
            {engagementFacets.map(({ value: v }) => (
              <FilterPillButton
                key={v}
                active={value.engagement === v}
                onClick={() =>
                  set({ engagement: value.engagement === v ? null : v })
                }
              >
                {v}
              </FilterPillButton>
            ))}
          </div>
        </div>
      )}
    </div>
  );

  // Desktop: same sidebar card as before
  if (!isMobile) return <aside className={styles.filterSidebar}>{card}</aside>;

  // Mobile: sheet from the top + Apply button
  return createPortal(
    <div
      className={styles.filterSheetOverlay}
      onClick={closeAnimated}
      role="dialog"
      aria-modal="true"
      aria-label="Filter roles"
    >
      <div
        className={cx(styles.filterSheet, visible && styles.filterSheetVisible)}
        onClick={(e) => e.stopPropagation()}
      >
        <div className={styles.filterSheetBody}>{card}</div>
        <div className={styles.filterSheetFooter}>
          <button
            type="button"
            onClick={applyAnimated}
            className={styles.filterApplyBtn}
          >
            Apply{countActive(value) > 0 ? ` (${countActive(value)})` : ""}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */
export default function AlumniJobFeed({ onReport, conversations = [] }) {
  const { jobs, loading, error, reload } = usePosts();
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("relevant");

  const [filtersOpen, setFiltersOpen] = useState(false);
  const isMobile = useMediaQuery("(max-width: 1023px)");
  const [filters, setFilters] = useState(EMPTY_FILTERS); // applied
  const [draft, setDraft] = useState(EMPTY_FILTERS); // mobile, until Apply

  const { showToast, Toast } = useToast();

  const openFilters = () => {
    if (filtersOpen) {
      setFiltersOpen(false);
      return;
    }
    setDraft(filters);
    setFiltersOpen(true);
  };
  const applyFilters = () => {
    setFilters(draft);
    setFiltersOpen(false);
  };
  const resetPanel = () =>
    isMobile ? setDraft(EMPTY_FILTERS()) : setFilters(EMPTY_FILTERS());

  const visibleJobs = useMemo(() => {
    const q = search.toLowerCase().trim();
    let list = jobs.filter((job) => {
      const matchesSearch =
        !q ||
        job.company?.toLowerCase().includes(q) ||
        job.role?.toLowerCase().includes(q) ||
        job.skills?.some((s) => s.toLowerCase().includes(q));
      return (
        matchesSearch &&
        (!filters.referralOnly || isReferralJob(job)) &&
        (filters.domains.size === 0 ||
          (job.domain && filters.domains.has(job.domain))) &&
        (!filters.batch || extractBatch(job) === filters.batch) &&
        (filters.comps.size === 0 ||
          filters.comps.has(compensationTier(job))) &&
        (!filters.location || job.location === filters.location) &&
        (!filters.engagement || engagementLabel(job) === filters.engagement)
      );
    });

    if (sort === "relevant")
      list = [...list].sort(
        (a, b) => relevanceScore(b, q) - relevanceScore(a, q),
      );
    if (sort === "recent")
      list = [...list].sort((a, b) => b.createdTs - a.createdTs);
    if (sort === "likes") list = [...list].sort((a, b) => b.likes - a.likes);
    if (sort === "deadline")
      list = [...list].sort((a, b) => a.deadlineTs - b.deadlineTs);

    return list;
  }, [jobs, search, sort, filters]);

  const resetFilters = () => {
    setSearch("");
    setFilters(EMPTY_FILTERS());
    setDraft(EMPTY_FILTERS());
  };

  return (
    <div className={styles.page}>
      <FontStyles />
      {/* <TopHeader /> */}
      <main className={styles.main}>
  <StatsBanner jobs={jobs} />

  <div className={styles.container}>
    <div className={styles.contentGrid}>
            {filtersOpen && (
              <FilterSidebar
                jobs={jobs}
                value={isMobile ? draft : filters}
                onChange={isMobile ? setDraft : setFilters}
                onReset={resetPanel}
                onClose={() => setFiltersOpen(false)}
                onApply={applyFilters}
                isMobile={isMobile}
              />
            )}

            <div className={styles.mainCol}>
              <div style={!filtersOpen ? NARROW_STYLE : undefined}>
                <Controls
                  search={search}
                  setSearch={setSearch}
                  sort={sort}
                  setSort={setSort}
                  onOpenFilters={openFilters}
                  activeCount={countActive(filters)}
                />
              </div>

              {loading ? (
                <LoadingState />
              ) : error ? (
                <ErrorState message={error} onRetry={reload} />
              ) : visibleJobs.length === 0 ? (
                <EmptyState onReset={resetFilters} />
              ) : (
                <div
                  className={styles.jobList}
                  style={!filtersOpen ? NARROW_STYLE : undefined}
                >
                  {visibleJobs.map((job) => (
                    <JobCard
                      key={job.id}
                      job={job}
                      conversations={conversations}
                      onReport={onReport}
                      showToast={showToast}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      <footer className={styles.footer}></footer>

      <Toast />
    </div>
  );
}