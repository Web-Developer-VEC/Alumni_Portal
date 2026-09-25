import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";
import styles from "./post.module.css";
import Navbar from "../../components/common/DashboardNavbar"

/* -------------------------------------------------------------------------- */
/*  Self-contained: no index.html edits needed.                              */
/*  - Icons are inline SVG (no icon font to fail to load).                   */
/*  - Fonts (Plus Jakarta Sans / Inter) are pulled in via post.module.css,   */
/*    which falls back to your system sans-serif if the network request is  */
/*    ever blocked, so it never reverts to a serif font.                    */
/* -------------------------------------------------------------------------- */
function FontStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700&display=swap');
    `}</style>
  );
}

/* -------------------------------------------------------------------------- */
/*  Sample data – replace with your API response                              */
/*  Only `company`, `role`, `eligibility` and `applyLink` are required.       */
/*  Every other field is optional; the card hides what is missing.           */
/* -------------------------------------------------------------------------- */
const SAMPLE_JOBS = [
  {
    id: 1,
    alumni: {
      name: "Dwayne F. White",
      batch: "AI & DS '21",
      designation: "Software Engineer",
      avatar: null,
      verified: true,
    },
    postedAgo: "3m ago",
    company: "Zoho Corporation",
    role: "Frontend Developer",
    eligibility:
      "B.E / B.Tech (CSE, IT, AI&DS) · 2025 & 2026 batch · CGPA 7.0+",
    location: "Chennai, Tamil Nadu",
    type: "Full-time",
    freshers: true,
    package: "₹6 – 8 LPA",
    deadline: "30 Sep 2026",
    skills: ["React", "JavaScript (ES6+)", "Tailwind CSS", "REST APIs"],
    description:
      "Our Core Platform team is expanding to support next-generation enterprise workflows. Looking for ambitious engineering graduates skilled in component-driven UI architecture, predictable client state, and responsive web performance standards.",
    tags: ["Hiring", "Frontend", "Freshers"],
    directReferral: "Direct Team Referral",
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=70",
    applyLink: "https://www.zoho.com/careers/",
    applyLabel: "Apply on Zoho Careers Portal",
    views: 5874,
    likes: 215,
    comments: [
      {
        id: 1,
        user: "Varun Kumar",
        tag: "Batch '25",
        text: "Applied Dwayne! Sent you my referral ID via Alumni Connect direct message. Thank you so much!",
      },
      {
        id: 2,
        user: "Dwayne F. White",
        tag: "OP",
        text: "Noted Varun! Reviewing profiles and forwarding to the engineering hiring manager this evening.",
      },
    ],
  },
  {
    id: 2,
    alumni: {
      name: "Ananya Krishnan",
      batch: "AI & DS '19",
      designation: "Data Scientist",
      avatar: null,
      verified: true,
    },
    postedAgo: "2h ago",
    company: "Freshworks",
    role: "Data Analyst Intern",
    eligibility: "Pre-final year students · Basic SQL & Python",
    location: "Hybrid (Bengaluru)",
    type: "Internship",
    remote: true,
    referralAvailable: true,
    package: "₹25,000 / month",
    deadline: "15 Oct 2026",
    ppo: "Performance Based",
    skills: ["Python", "PostgreSQL", "Power BI", "ETL Pipelines"],
    description:
      "Excited to mentor a motivated junior engineer or data enthusiast! You will work closely with customer lifecycle datasets, configure executive dashboards, and translate behavioral funnels into actionable feature recommendations.",
    tags: [],
    image: null, // no image → gradient monogram banner
    applyLink: "https://www.freshworks.com/company/careers/",
    applyLabel: "Apply on Freshworks Internship Hub",
    views: 1320,
    likes: 84,
    comments: [],
  },
  {
    id: 3,
    alumni: {
      name: "Rahul Menon",
      batch: "AI & DS '18",
      designation: "Engineering Manager",
      avatar: null,
      verified: true,
    },
    postedAgo: "1d ago",
    company: "Amazon Web Services (AWS)",
    role: "Software Development Engineer (SDE – I)",
    eligibility: "2026 graduates · No active backlogs · Strong DSA",
    location: "Hyderabad / Bengaluru",
    type: "Full-time",
    highVolumeReferrals: true,
    package: "Competitive Industry Tier",
    deadline: "10 Oct 2026",
    hiringLoop: "OA + 3 Tech Interviews",
    skills: ["DSA", "Java / C++", "System Design", "Distributed Systems"],
    description:
      "AWS Cloud Storage & Fleet Orchestration is hiring talented engineers to architect planetary-scale distributed microservices. Requires high problem-solving velocity, clean modular coding practices, and concurrency rigor.",
    pledge:
      "Active internal referrals open specifically for Velammal Engineering College students with a strong foundation in core algorithms and object-oriented architectures. I will review and endorse the top candidates directly to the AWS hiring committee.",
    tags: [],
    image:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?auto=format&fit=crop&w=1200&q=70",
    applyLink: "https://www.amazon.jobs/",
    applyLabel: "Apply on Amazon Jobs Hub",
    views: 9410,
    likes: 502,
    comments: [
      {
        id: 1,
        user: "Sanjay Kumar",
        tag: "Batch '24",
        text: "Sir, does the internal referral require LeetCode contest rating verification or university project repositories?",
      },
    ],
  },
];

const REPORT_REASONS = [
  "Spam or misleading",
  "Fake or fraudulent job",
  "Asks for money / fees",
  "Inappropriate content",
  "Other",
];

const FILTERS = [
  { value: "all", label: "All" },
  { value: "internships", label: "Internships" },
  { value: "full-time", label: "Full-time" },
  { value: "referrals", label: "Referrals Available" },
  { value: "freshers", label: "Freshers 2025/2026" },
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
    case "notifications":
      return (
        <svg {...base} {...stroke}>
          <path d="M6 8a6 6 0 0 1 12 0c0 5.5 2 7.5 2 7.5H4S6 13.5 6 8Z" />
          <path d="M10.3 19a1.9 1.9 0 0 0 3.4 0" />
        </svg>
      );
    case "person":
      return (
        <svg {...base} {...stroke}>
          <circle cx="12" cy="8" r="4" />
          <path d="M4.5 20a7.5 7.5 0 0 1 15 0" />
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

function jobTypeTags(job) {
  const tags = [];
  if (job.type === "Internship") tags.push("internships");
  if (job.type === "Full-time") tags.push("full-time");
  if (
    job.referralAvailable ||
    job.directReferral ||
    job.highVolumeReferrals ||
    job.pledge
  )
    tags.push("referrals");
  if (job.freshers) tags.push("freshers");
  return tags;
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
    return () => clearTimeout(t);
  }, []);

  const close = () => {
    setVisible(false);
    setTimeout(onClose, 180);
  };

  return (
    <div
      className={styles.reportOverlay}
      onPointerDown={(e) => {
        // Only arm the close if the press itself started on the backdrop,
        // not inside the modal (prevents a mobile "ghost click" landing on
        // the backdrop from closing the sheet after a scroll/tap inside it).
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
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Share modal — Instagram-style: recently-messaged people first, then a    */
/*  "More" tile that falls back to the OS share sheet (navigator.share).     */
/*                                                                            */
/*  MOCK_CONVERSATIONS stands in for your real chat/DM data. Wire it up by   */
/*  replacing it with your actual conversation list, each with a             */
/*  `lastMessageAt` (timestamp, ms) — the list below is already sorted       */
/*  newest-first by that field, which is what makes "recent" people surface  */
/*  at the top, exactly like Instagram's share sheet.                        */
/* -------------------------------------------------------------------------- */
const now = Date.now();
const MOCK_CONVERSATIONS = [
  {
    id: 1,
    name: "Varun Kumar",
    tag: "Batch '25",
    avatar: null,
    lastMessageAt: now - 2 * 60 * 1000,
  },
  {
    id: 2,
    name: "Priya Raghavan",
    tag: "Batch '26",
    avatar: null,
    lastMessageAt: now - 18 * 60 * 1000,
  },
  {
    id: 3,
    name: "Sanjay Kumar",
    tag: "Batch '24",
    avatar: null,
    lastMessageAt: now - 60 * 60 * 1000,
  },
  {
    id: 4,
    name: "AI & DS Placement Group",
    tag: "Group · 42 members",
    avatar: null,
    isGroup: true,
    lastMessageAt: now - 3 * 60 * 60 * 1000,
  },
  {
    id: 5,
    name: "Meera Iyer",
    tag: "Batch '25",
    avatar: null,
    lastMessageAt: now - 22 * 60 * 60 * 1000,
  },
  {
    id: 6,
    name: "Karthik R",
    tag: "Batch '23",
    avatar: null,
    lastMessageAt: now - 2 * 24 * 60 * 60 * 1000,
  },
];

function timeAgo(ts) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function ShareModal({
  job,
  conversations = MOCK_CONVERSATIONS,
  onClose,
  onSend,
  showToast,
}) {
  const [visible, setVisible] = useState(false);
  const [query, setQuery] = useState("");
  const [selectedIds, setSelectedIds] = useState([]);
  const inputRef = useRef(null);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 10);
    // Lock the page behind the sheet from scrolling while it's open — matters
    // most on mobile, where a scrollable body under a bottom sheet fights the
    // sheet's own scroll for touch events.
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Don't autofocus the search field on touch devices — it pops the
    // keyboard immediately and eats most of the sheet's height on mobile.
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

  // Recently-messaged people first — this is just a sort by lastMessageAt,
  // so hooking this up to a real inbox is a matter of swapping the data source.
  const sorted = useMemo(
    () => [...conversations].sort((a, b) => b.lastMessageAt - a.lastMessageAt),
    [conversations],
  );
  const filtered = sorted.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase().trim()),
  );

  const shareUrl = `${window.location.origin}${window.location.pathname}#job-${job.id}`;
  const shareText = `${job.alumni.name} shared a job opening: ${job.role} at ${job.company}`;

  // Tapping a person only selects/deselects them — nothing sends until Share is pressed.
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

  // "More" — hands off to whatever the OS/browser offers (native share sheet),
  // falling back to a clipboard copy when navigator.share isn't available.
  const openMore = async () => {
    try {
      if (navigator.share) {
        await navigator.share({
          title: `${job.role} at ${job.company}`,
          text: shareText,
          url: shareUrl,
        });
      } else {
        await navigator.clipboard.writeText(shareUrl);
        showToast("Link copied to clipboard");
      }
    } catch {
      /* user cancelled the native share sheet */
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
        {/* Drag handle — mobile-only affordance that this is a sheet, not a dialog */}
        <div className={styles.shareDragHandle}>
          <span className={styles.shareDragHandleBar} />
        </div>

        {/* Header */}
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

        {/* Search */}
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

        {/* Contacts — fluid auto-fill grid, so it self-adjusts to any screen
            width instead of jumping between fixed 3/4-column breakpoints. */}
        <div className={styles.shareContactsWrap}>
          {!query && <p className={styles.shareRecentLabel}>Recent</p>}
          {filtered.length === 0 ? (
            <p className={styles.shareEmptyText}>No one found.</p>
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

        {/* Footer actions */}
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
/*  Job card                                                                  */
/* -------------------------------------------------------------------------- */
function JobCard({ job, onReport, showToast }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(job.likes);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState(job.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [shareOpen, setShareOpen] = useState(false);

  const menuRef = useRef(null);
  useOutsideClick(menuRef, () => setMenuOpen(false));

  // Clicking anywhere outside this card closes the comments drawer, if open.
  const cardRef = useRef(null);
  useEffect(() => {
    if (!showComments) return;
    const handler = (e) => {
      if (cardRef.current && !cardRef.current.contains(e.target)) {
        setShowComments(false);
      }
    };
    document.addEventListener("mousedown", handler);
    document.addEventListener("touchstart", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("touchstart", handler);
    };
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

  // Opens our own Instagram-style share sheet instead of the OS default.
  // The native picker is still reachable from inside it, via the "More" tile.
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
            {job.alumni.verified && (
              <span className={styles.verifiedBadge} title="Verified Alumni">
                <Icon name="verified" className={styles.icon12} />
              </span>
            )}
          </div>
          <div className={styles.alumniInfo}>
            <div className={styles.alumniNameRow}>
              <span className={styles.alumniName}>{job.alumni.name}</span>
              <span className={styles.batchTag}>{job.alumni.batch}</span>
              <span className={styles.postedAgo}>· {job.postedAgo}</span>
            </div>
            <span className={styles.designationText}>
              {job.alumni.designation} at {job.company}
            </span>
          </div>
        </div>

        {/* Context menu */}
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

      {/* ---------- Hero banner ---------- */}
      <div className={styles.heroBanner}>
        {job.image ? (
          <img
            src={job.image}
            alt={`${job.company} workplace`}
            loading="lazy"
            className={styles.heroImg}
          />
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
        <div className={styles.heroOverlay} />

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

        {job.image && (
          <div className={styles.heroBottomBar}>
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

      {/* ---------- Body ---------- */}
      <div className={styles.cardBody}>
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

        {/* Metadata pills */}
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

        {/* Skills */}
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

        {/* CTA */}
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
                        <span className={styles.commentTag}>{c.tag}</span>
                      </div>
                      <p className={styles.commentText}>{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <form onSubmit={addComment} className={styles.commentForm}>
            <input
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
          onClose={() => setShareOpen(false)}
          onSend={(contact, sharedJob) => {
            // Wire this into your real messaging/DM send call, e.g.
            // sendMessage({ toUserId: contact.id, jobId: sharedJob.id })
          }}
          showToast={showToast}
        />
      )}
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Header                                                                    */
/* -------------------------------------------------------------------------- */
function TopHeader() {
  const NAV = ["Feed", "Referrals", "My Applications", "Mentorship"];
  const [active, setActive] = useState("Feed");

  return (
    <header className={styles.header}>
      <div className={styles.headerInner}>
        <div className={styles.headerLeft}>
          <a href="#" className={styles.logoLink}>
            <div className={styles.logoIconWrap}>
              <Icon name="school" className={styles.logoIcon} />
            </div>
            <div className={styles.logoTextWrap}>
              <span className={styles.logoTitle}>Alumni Connect</span>
              <span className={styles.logoSubtitle}>Career Hub</span>
            </div>
          </a>
          <div className={styles.searchBox}>
            <Icon name="search" className={styles.searchIcon} />
            <input
              placeholder="Search roles, alumni, companies..."
              className={styles.searchInput}
            />
            <span className={styles.kbdHint}>⌘K</span>
          </div>
        </div>

        <nav className={styles.nav}>
          {NAV.map((n) => (
            <button
              key={n}
              onClick={() => setActive(n)}
              className={cx(styles.navBtn, active === n && styles.navBtnActive)}
            >
              {n}
            </button>
          ))}
        </nav>

        <div className={styles.headerRight}>
          <button aria-label="Notifications" className={styles.notifBtn}>
            <Icon name="notifications" className={styles.notifIcon} />
            <span className={styles.notifDot} />
          </button>
          <div className={styles.divider} />
          <div className={styles.profileWrap}>
            <div className={styles.profileAvatarWrap}>
              <div className={styles.profileAvatar}>
                <Icon name="person" className={styles.profileAvatarIcon} />
              </div>
              <span className={styles.profileBatchBadge}>'19</span>
            </div>
            <div className={styles.profileTextWrap}>
              <span className={styles.profileName}>Elena Rostova</span>
              <span className={styles.profileRole}>Engineering Alumni</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

/* -------------------------------------------------------------------------- */
/*  Stats banner                                                              */
/* -------------------------------------------------------------------------- */
function StatsBanner({ jobCount }) {
  const referrerCount = 89;
  return (
    <div className={styles.statsBanner}>
      <div className={styles.statsBgBlob1} />
      <div className={styles.statsBgBlob2} />
      <div className={styles.statsContent}>
        <div>
          {/* <div className={styles.statsLiveRow}>
            <span className={styles.statsLiveDot} />
            <span className={styles.statsLiveLabel}>
              Verified Collegiate Pipeline
            </span>
          </div> */}
          <h1 className={styles.statsTitle}>JOB POSTS</h1>
          <p className={styles.statsDesc}>
            High-impact engineering, data, and leadership opportunities curated
            directly by graduates.
          </p>
        </div>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{jobCount}</span>
            <span className={styles.statLabel}>Active Openings</span>
          </div>
          <div className={styles.statCard}>
            <span className={cx(styles.statValue, styles.statValuePurple)}>
              {referrerCount}
            </span>
            <span className={styles.statLabel}>Active Referrers</span>
          </div>
          <div className={styles.statCard}>
            <span className={cx(styles.statValue, styles.statValueTeal)}>
              &lt;24h
            </span>
            <span className={styles.statLabel}>Latest Referral</span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Search + filters                                                          */
/* -------------------------------------------------------------------------- */
function Controls({ search, setSearch, sort, setSort, filter, setFilter }) {
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
        <div className={styles.sortWrap}>
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className={styles.sortSelect}
          >
            <option value="recent">Most Recent</option>
            <option value="likes">Most Popular</option>
            <option value="deadline">Application Deadline</option>
          </select>
          <Icon name="unfold_more" className={styles.sortIcon} />
        </div>
      </div>

      <div className={styles.filtersRow}>
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
            className={cx(
              styles.filterBtn,
              filter === f.value && styles.filterBtnActive,
            )}
          >
            {f.label}
          </button>
        ))}
      </div>
      {/* Fade hint — signals there's more to scroll to on the right */}
      <div className={styles.fadeHint} />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty state                                                               */
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

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */
export default function AlumniJobFeed({ jobs = SAMPLE_JOBS, onReport }) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent");
  const [filter, setFilter] = useState("all");
  const { showToast, Toast } = useToast();

  const visibleJobs = useMemo(() => {
    let list = jobs.filter((job) => {
      const matchesFilter =
        filter === "all" || jobTypeTags(job).includes(filter);
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q ||
        job.company.toLowerCase().includes(q) ||
        job.role.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });

    if (sort === "likes") list = [...list].sort((a, b) => b.likes - a.likes);
    if (sort === "deadline")
      list = [...list].sort((a, b) =>
        (a.deadline || "").localeCompare(b.deadline || ""),
      );

    return list;
  }, [jobs, search, sort, filter]);

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
  };

  return (
    <div className={styles.page}>
      <FontStyles />
      {/* <TopHeader /> */}
      <Navbar />

      <main className={styles.main}>
        <div className={styles.container}>
          <StatsBanner jobCount={jobs.length} />

          <Controls
            search={search}
            setSearch={setSearch}
            sort={sort}
            setSort={setSort}
            filter={filter}
            setFilter={setFilter}
          />

          {visibleJobs.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <div className={styles.jobList}>
              {visibleJobs.map((job) => (
                <JobCard
                  key={job.id}
                  job={job}
                  onReport={onReport}
                  showToast={showToast}
                />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className={styles.footer}>
        <div className={styles.footerInner}>
          <div className={styles.footerLogo}>
            <div className={styles.footerLogoIconWrap}>
              <Icon name="school" className={styles.footerLogoIcon} />
            </div>
            <span className={styles.footerLogoTitle}>Alumni Connect</span>
            <span className={styles.footerLogoSub}>
              · Distinguished Career Network
            </span>
          </div>
          <div className={styles.footerLinks}>
            {[
              "Honor Code",
              "Network Directory",
              "Privacy Policy",
              "Support",
            ].map((l) => (
              <a key={l} href="#" className={styles.footerLink}>
                {l}
              </a>
            ))}
          </div>
          <div className={styles.footerCopyright}>
            © 2026 Alumni Association. All rights reserved.
          </div>
        </div>
      </footer>

      <Toast />
    </div>
  );
}
