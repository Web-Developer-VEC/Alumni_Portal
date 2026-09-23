import { useState, useRef, useEffect, useMemo } from "react";
import { createPortal } from "react-dom";

/* -------------------------------------------------------------------------- */
/*  Self-contained: no index.html edits needed.                              */
/*  - Icons are inline SVG (no icon font to fail to load).                   */
/*  - Fonts (Plus Jakarta Sans / Inter) are pulled in via the <FontStyles/>  */
/*    block below and fall back to your system sans-serif if the network    */
/*    request is ever blocked, so it never reverts to a serif font.         */
/* -------------------------------------------------------------------------- */
function FontStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600&family=Plus+Jakarta+Sans:wght@600;700&display=swap');
      .font-head { font-family: 'Plus Jakarta Sans', ui-sans-serif, system-ui, -apple-system, sans-serif; }
      .font-body { font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif; }
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
    eligibility: "B.E / B.Tech (CSE, IT, AI&DS) · 2025 & 2026 batch · CGPA 7.0+",
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
function Icon({ name, className = "h-5 w-5", filled = false }) {
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
        <svg {...base} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={3} strokeLinecap="round" strokeLinejoin="round">
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
        <svg {...base} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
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
        <svg {...base} fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round">
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
const formatCount = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".0", "")}k` : `${n}`;

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
  if (job.referralAvailable || job.directReferral || job.highVolumeReferrals || job.pledge)
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
    timerRef.current = setTimeout(() => setToast({ show: false, message }), 2600);
  };

  const Toast = () => (
    <div
      className={`fixed bottom-8 right-8 z-50 flex items-center gap-3 rounded-xl bg-[#283044] px-5 py-3.5 text-[#eef0ff] shadow-2xl transition-all duration-300 pointer-events-none ${
        toast.show ? "translate-y-0 opacity-100" : "translate-y-24 opacity-0"
      }`}
    >
      <Icon name="check_circle" className="h-5 w-5 text-[#7bd8b1]" />
      <span className="font-body text-[15px]">{toast.message}</span>
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
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#131b2e]/40 backdrop-blur-sm p-4"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Report opportunity"
    >
      <div
        className={`w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl transition-all duration-200 ${
          visible ? "scale-100 opacity-100" : "scale-95 opacity-0"
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between pb-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#ffdad6] text-[#93000a]">
              <Icon name="flag" className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-head text-[18px] font-semibold leading-tight text-[#131b2e]">
                Report Opportunity
              </h3>
              <p className="font-body text-[13px] text-[#3e4943]">
                Flag inappropriate, expired, or fraudulent postings
              </p>
            </div>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[#3e4943] transition-colors hover:bg-[#eaedff]"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

          <div className="space-y-3 py-4">
          {REPORT_REASONS.map((r) => (
            <label
              key={r}
              className="flex cursor-pointer items-center gap-3 rounded-xl bg-[#faf8ff] p-3.5 transition-colors hover:bg-[#f2f3ff]"
            >
              <input
                type="radio"
                name="report-reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="h-4 w-4 accent-[#005d42]"
              />
              <span className="font-head text-[13px] font-semibold text-[#131b2e]">{r}</span>
            </label>
          ))}

          {reason === "Other" && (
            <textarea
              value={otherNote}
              onChange={(e) => setOtherNote(e.target.value)}
              rows={2}
              placeholder="Tell us more about the issue..."
              autoFocus
              className="w-full resize-none rounded-xl bg-[#faf8ff] px-3.5 py-2.5 font-body text-[13px] text-[#131b2e] outline-none placeholder:text-[#6e7a73] focus:ring-1 focus:ring-[#047857]"
            />
          )}
        </div>

        <div className="flex items-center justify-end gap-3 pt-4">
          <button
            onClick={close}
            className="rounded-xl px-5 py-2.5 font-head text-[13px] font-semibold text-[#3e4943] transition-colors hover:bg-[#eaedff]"
          >
            Cancel
          </button>
            <button
            disabled={reason === "Other" && !otherNote.trim()}
            onClick={() => onSubmit(reason === "Other" ? { reason, note: otherNote } : { reason })}
            className="rounded-xl bg-[#ba1a1a] px-6 py-2.5 font-head text-[13px] font-semibold text-white shadow-sm transition-opacity hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
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
  { id: 1, name: "Varun Kumar", tag: "Batch '25", avatar: null, lastMessageAt: now - 2 * 60 * 1000 },
  { id: 2, name: "Priya Raghavan", tag: "Batch '26", avatar: null, lastMessageAt: now - 18 * 60 * 1000 },
  { id: 3, name: "Sanjay Kumar", tag: "Batch '24", avatar: null, lastMessageAt: now - 60 * 60 * 1000 },
  {
    id: 4,
    name: "AI & DS Placement Group",
    tag: "Group · 42 members",
    avatar: null,
    isGroup: true,
    lastMessageAt: now - 3 * 60 * 60 * 1000,
  },
  { id: 5, name: "Meera Iyer", tag: "Batch '25", avatar: null, lastMessageAt: now - 22 * 60 * 60 * 1000 },
  { id: 6, name: "Karthik R", tag: "Batch '23", avatar: null, lastMessageAt: now - 2 * 24 * 60 * 60 * 1000 },
];

function timeAgo(ts) {
  const mins = Math.round((Date.now() - ts) / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.round(hrs / 24)}d ago`;
}

function ShareModal({ job, conversations = MOCK_CONVERSATIONS, onClose, onSend, showToast }) {
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
    [conversations]
  );
  const filtered = sorted.filter((c) => c.name.toLowerCase().includes(query.toLowerCase().trim()));

  const shareUrl = `${window.location.origin}${window.location.pathname}#job-${job.id}`;
  const shareText = `${job.alumni.name} shared a job opening: ${job.role} at ${job.company}`;

  // Tapping a person only selects/deselects them — nothing sends until Share is pressed.
  const toggleSelect = (contact) => {
    setSelectedIds((ids) =>
      ids.includes(contact.id) ? ids.filter((id) => id !== contact.id) : [...ids, contact.id]
    );
  };

  const handleShareSelected = () => {
    if (selectedIds.length === 0) return;
    const chosen = conversations.filter((c) => selectedIds.includes(c.id));
    chosen.forEach((c) => onSend?.(c, job));
    showToast(
      chosen.length === 1 ? `Sent to ${chosen[0].name}` : `Sent to ${chosen.length} people`
    );
    close();
  };

  // "More" — hands off to whatever the OS/browser offers (native share sheet),
  // falling back to a clipboard copy when navigator.share isn't available.
  const openMore = async () => {
    try {
      if (navigator.share) {
        await navigator.share({ title: `${job.role} at ${job.company}`, text: shareText, url: shareUrl });
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
      className="fixed inset-0 z-50 flex items-end justify-center bg-[#131b2e]/40 backdrop-blur-sm sm:items-center"
      onClick={close}
      role="dialog"
      aria-modal="true"
      aria-label="Share opportunity"
    >
      <div
        className={`flex w-full max-w-md flex-col rounded-t-3xl bg-white shadow-2xl transition-all duration-200 sm:mx-4 sm:rounded-3xl ${
          visible ? "translate-y-0 opacity-100 sm:scale-100" : "translate-y-6 opacity-0 sm:scale-95"
        }`}
        style={{
          maxHeight: "min(85dvh, 640px)",
          paddingBottom: "env(safe-area-inset-bottom, 0px)",
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Drag handle — mobile-only affordance that this is a sheet, not a dialog */}
        <div className="flex justify-center pb-1 pt-2.5 sm:hidden">
          <span className="h-1 w-10 rounded-full bg-[#e2e7ff]" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e2e7ff] px-4 py-3 sm:px-5 sm:py-4">
          <div className="min-w-0">
            <h3 className="font-head text-[16px] font-semibold text-[#131b2e]">Share</h3>
            <p className="font-body text-[12px] text-[#6e7a73] truncate max-w-[60vw] sm:max-w-[260px]">
              {job.role} · {job.company}
            </p>
          </div>
          <button
            onClick={close}
            aria-label="Close"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#3e4943] transition-colors hover:bg-[#eaedff] active:bg-[#eaedff]"
          >
            <Icon name="close" className="h-5 w-5" />
          </button>
        </div>

        {/* Search */}
        <div className="px-4 pt-3 sm:px-5 sm:pt-4">
          <div className="flex items-center gap-2 rounded-xl bg-[#f2f3ff] px-3.5 py-3 sm:py-2.5">
            <Icon name="search" className="h-[18px] w-[18px] shrink-0 text-[#6e7a73]" />
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search people..."
              className="w-full min-w-0 bg-transparent font-body text-[13px] text-[#131b2e] outline-none placeholder:text-[#6e7a73]"
            />
          </div>
        </div>

        {/* Contacts — fluid auto-fill grid, so it self-adjusts to any screen
            width instead of jumping between fixed 3/4-column breakpoints. */}
        <div
          className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3.5 sm:px-5 sm:py-4"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {!query && (
            <p className="mb-3 font-head text-[11px] font-bold uppercase tracking-wider text-[#6e7a73]">
              Recent
            </p>
          )}
          {filtered.length === 0 ? (
            <p className="py-6 text-center font-body text-[13px] text-[#6e7a73]">No one found.</p>
          ) : (
            <div
              className="grid justify-items-center gap-y-5 gap-x-1"
              style={{ gridTemplateColumns: "repeat(auto-fill, minmax(68px, 1fr))" }}
            >
              {filtered.map((c) => {
                const selected = selectedIds.includes(c.id);
                return (
                  <button
                    key={c.id}
                    onClick={() => toggleSelect(c)}
                    className="flex w-full flex-col items-center gap-1.5 rounded-xl py-1 text-center"
                  >
                    <div
                      className={`relative flex h-14 w-14 items-center justify-center rounded-full font-head text-[14px] font-semibold text-white ring-offset-2 transition-all ${
                        c.isGroup ? "bg-[#4e45d5]" : "bg-[#005d42]"
                      } ${selected ? "ring-2 ring-[#800000]" : ""}`}
                    >
                      {c.isGroup ? <Icon name="forum" className="h-6 w-6" /> : initials(c.name)}
                      {selected && (
                        <span className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#800000] text-white ring-2 ring-white">
                          <Icon name="verified" className="h-3 w-3" />
                        </span>
                      )}
                    </div>
                    <span className="line-clamp-1 w-full font-body text-[11px] font-medium text-[#131b2e]">
                      {c.name.split(" ")[0]}
                    </span>
                    <span className="font-body text-[10px] text-[#6e7a73]">
                      {selected ? "Selected" : timeAgo(c.lastMessageAt)}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer actions */}
        <div className="flex items-center gap-2.5 border-t border-[#e2e7ff] px-4 py-3 sm:gap-3 sm:px-5 sm:py-4">
          <button
            onClick={handleShareSelected}
            disabled={selectedIds.length === 0}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#f2f3ff] px-3 py-3 font-head text-[12px] font-semibold text-[#131b2e] transition-colors hover:bg-[#eaedff] disabled:opacity-40 disabled:hover:bg-[#f2f3ff] sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[13px]"
          >
            <Icon name="share" className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" />
            {selectedIds.length > 0 ? `Share (${selectedIds.length})` : "Share"}
          </button>
          <button
            onClick={openMore}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-[#FDCC03] px-3 py-3 font-head text-[12px] font-semibold text-black transition-colors duration-200 hover:bg-[#800000] hover:text-white sm:gap-2 sm:px-4 sm:py-2.5 sm:text-[13px]"
          >
            <Icon name="more_vert" className="h-[16px] w-[16px] sm:h-[18px] sm:w-[18px]" /> More
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* -------------------------------------------------------------------------- */
/*  Metadata pill                                                             */
/* -------------------------------------------------------------------------- */
function MetaPill({ icon, label, value }) {
  if (!value) return null;
  return (
    <div className="flex items-center gap-2.5 rounded-xl bg-[#f2f3ff] p-3">
      <Icon name={icon} className="h-5 w-5 shrink-0 text-[#6e7a73]" />
      <div className="flex min-w-0 flex-col">
        <span className="font-body text-[11px] text-[#3e4943]">{label}</span>
        <span className="truncate font-head text-[13px] font-semibold text-[#131b2e]">
          {value}
        </span>
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
      showToast(v ? "Removed from saved opportunities" : "Opportunity bookmarked successfully");
      return !v;
    });
    setMenuOpen(false);
  };

  const addComment = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setComments((c) => [...c, { id: Date.now(), user: "You", tag: "You", text: draft.trim() }]);
    setDraft("");
    showToast("Comment published to alumni thread");
  };

  return (
    <article
      ref={cardRef}
      id={`job-${job.id}`}
      className="job-card flex flex-col rounded-3xl bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl sm:p-6 lg:p-8"
    >
      {/* ---------- Alumni header ---------- */}
      <div className="flex items-start justify-between gap-4 pb-5">
        <div className="flex items-center gap-3.5">
          <div className="relative">
            {job.alumni.avatar ? (
              <img
                src={job.alumni.avatar}
                alt={job.alumni.name}
                className="h-12 w-12 shrink-0 rounded-2xl object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-[#e2e7ff] font-head text-[18px] font-semibold text-[#005d42]">
                {initials(job.alumni.name)}
              </div>
            )}
            {job.alumni.verified && (
              <span
                className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-[#047857] text-white shadow-sm"
                title="Verified Alumni"
              >
                <Icon name="verified" className="h-3 w-3" />
              </span>
            )}
          </div>
          <div className="flex flex-col">
            <div className="flex flex-wrap items-center gap-2">
              <span className="font-head text-[16px] font-semibold leading-tight text-[#131b2e]">
                {job.alumni.name}
              </span>
              <span className="rounded-full bg-[#e3dfff] px-2 py-0.5 font-head text-[10px] font-bold uppercase tracking-wider text-[#372abf]">
                {job.alumni.batch}
              </span>
              <span className="font-body text-[13px] text-[#6e7a73]">· {job.postedAgo}</span>
            </div>
            <span className="font-body text-[13px] text-[#3e4943]">
              {job.alumni.designation} at {job.company}
            </span>
          </div>
        </div>

        {/* Context menu */}
        <div className="relative" ref={menuRef}>
          <button
            aria-label="Card options"
            onClick={() => setMenuOpen((v) => !v)}
            className="flex h-9 w-9 items-center justify-center rounded-xl text-[#3e4943] transition-colors hover:bg-[#eaedff] hover:text-[#131b2e]"
          >
            <Icon name="more_vert" className="h-5 w-5" />
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-10 z-30 w-48 rounded-xl bg-white py-1.5 shadow-xl">
              <button
                onClick={copyLink}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left font-head text-[13px] font-semibold text-[#131b2e] hover:bg-[#f2f3ff]"
              >
                <Icon name="link" className="h-[18px] w-[18px]" /> Copy Link
              </button>
              <button
                onClick={toggleBookmark}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left font-head text-[13px] font-semibold text-[#131b2e] hover:bg-[#f2f3ff]"
              >
                <Icon
                  name="bookmark"
                  className={`h-[18px] w-[18px] ${saved ? "text-[#800000]" : ""}`}
                  filled={saved}
                />{" "}
                Bookmark
              </button>
              <button
                onClick={() => {
                  setMenuOpen(false);
                  setReportOpen(true);
                }}
                className="flex w-full items-center gap-2.5 px-4 py-2 text-left font-head text-[13px] font-semibold text-[#ba1a1a] hover:bg-[#ffdad6]/20"
              >
                <Icon name="flag" className="h-[18px] w-[18px]" /> Report Post
              </button>
            </div>
          )}
        </div>
      </div>

      {/* ---------- Hero banner ---------- */}
      <div className="group relative mb-6 h-52 w-full overflow-hidden rounded-2xl sm:h-64">
        {job.image ? (
          <img
            src={job.image}
            alt={`${job.company} workplace`}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-between bg-gradient-to-tr from-[#6860ef] via-[#047857] to-[#00766c] px-8">
            <div className="flex flex-col text-white">
              <span className="font-head text-[10px] font-bold uppercase tracking-widest text-[#6bd8cb]">
                {job.type ? `${job.type} Program` : "Opportunity"}
              </span>
              <h2 className="font-head text-[22px] font-semibold leading-tight">{job.role}</h2>
            </div>
            <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-2xl border border-white/20 bg-white/15 font-head text-[36px] font-bold text-white backdrop-blur-xl">
              {initials(job.company)}
            </div>
          </div>
        )}
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-[#131b2e]/75 via-transparent to-transparent" />

        <div className="absolute left-4 top-4 flex flex-wrap gap-2">
          {job.type && (
            <span className="rounded-full bg-white/90 px-3 py-1 font-head text-[10px] font-bold uppercase tracking-wider text-[#800000] backdrop-blur-md">
              {job.type}
            </span>
          )}
          {job.freshers && (
            <span className="rounded-full bg-white/90 px-3 py-1 font-head text-[10px] font-bold uppercase tracking-wider text-[#4e45d5] backdrop-blur-md">
              Freshers Welcome
            </span>
          )}
          {job.remote && (
            <span className="rounded-full bg-white/90 px-3 py-1 font-head text-[10px] font-bold uppercase tracking-wider text-[#005d42] backdrop-blur-md">
              Remote Eligible
            </span>
          )}
          {job.referralAvailable && (
            <span className="rounded-full bg-white/90 px-3 py-1 font-head text-[10px] font-bold uppercase tracking-wider text-[#4e45d5] backdrop-blur-md">
              Referral Available
            </span>
          )}
          {job.highVolumeReferrals && (
            <span className="rounded-full bg-white/90 px-3 py-1 font-head text-[10px] font-bold uppercase tracking-wider text-[#005b53] backdrop-blur-md">
              High Volume Referrals
            </span>
          )}
        </div>

        {job.image && (
          <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3">
            <div className="text-white">
              <div className="mb-0.5 font-head text-[10px] font-bold uppercase tracking-wider text-[#97f5cc]">
                {job.company}
              </div>
              <h2 className="font-head text-[20px] font-semibold leading-tight sm:text-[22px]">
                {job.role}
              </h2>
            </div>
            {(job.directReferral || job.highVolumeReferrals) && (
              <div className="hidden shrink-0 items-center gap-1.5 rounded-xl bg-white/90 px-3 py-1.5 font-head text-[11px] font-semibold text-[#131b2e] backdrop-blur-md sm:flex">
                <Icon name="verified_user" className="h-4 w-4 text-[#005d42]" />
                {job.directReferral || "Velammal Exclusive Priority"}
              </div>
            )}
          </div>
        )}
      </div>

      {/* ---------- Body ---------- */}
      <div className="space-y-4">
        {job.pledge && (
          <div className="flex items-start gap-3 rounded-xl bg-[#f2f3ff] p-4">
            <Icon name="school" className="mt-0.5 h-[22px] w-[22px] shrink-0 text-[#047857]" />
            <p className="font-body text-[13px] text-[#131b2e]">
              <strong className="font-head font-semibold">Alumni Referral Pledge: </strong>
              {job.pledge}
            </p>
          </div>
        )}

        {job.description && (
          <p className="font-body text-[15px] leading-relaxed text-[#3e4943]">{job.description}</p>
        )}

        {job.tags?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 font-head text-[13px] font-semibold text-[#005d42]">
            {job.tags.map((t) => (
              <span key={t}>#{t}</span>
            ))}
          </div>
        )}

        {/* Metadata pills */}
        <div className="grid grid-cols-2 gap-3 pt-2 md:grid-cols-4">
          <MetaPill icon="payments" label="Package" value={job.type !== "Internship" ? job.package : null} />
          <MetaPill icon="account_balance_wallet" label="Stipend" value={job.type === "Internship" ? job.package : null} />
          <MetaPill icon="location_on" label="Location" value={job.location} />
          <MetaPill icon="event_available" label="Deadline" value={job.deadline} />
          <MetaPill icon="school" label="Eligibility" value={job.eligibility} />
          <MetaPill icon="workspace_premium" label="PPO Conversion" value={job.ppo} />
          <MetaPill icon="code" label="Hiring Loop" value={job.hiringLoop} />
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="mr-1 font-body text-[13px] text-[#3e4943]">Skills:</span>
            {job.skills.map((s) => (
              <span key={s} className="rounded-lg bg-[#eaedff] px-3 py-1 font-body text-[13px] text-[#131b2e]">
                {s}
              </span>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="pt-2">
          <a
            href={job.applyLink}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex w-full items-center justify-center gap-2.5 rounded-xl bg-[#FDCC03] px-6 py-3.5 font-head text-[16px] font-semibold text-black shadow-sm transition-colors duration-200 hover:bg-[#800000] hover:text-white"
          >
            <span>{job.applyLabel || "Apply on company portal"}</span>
            <Icon name="arrow_forward" className="h-5 w-5 transition-transform group-hover:translate-x-1" />
          </a>
        </div>
      </div>

      {/* ---------- Social footer ---------- */}
      <div className="mt-6 flex items-center justify-between border-t border-[#e2e7ff] pt-6">
        <div className="flex items-center gap-4">
          <button
            onClick={toggleLike}
            className="group flex items-center gap-1.5 text-[#3e4943] transition-colors hover:text-[#ba1a1a]"
          >
            <Icon
              name="favorite"
              className={`h-5 w-5 transition-transform group-hover:scale-110 ${liked ? "text-[#ba1a1a]" : ""}`}
              filled={liked}
            />
            <span className="font-head text-[13px] font-semibold">{likes}</span>
          </button>
          <button
            onClick={() => setShowComments((v) => !v)}
            className="flex items-center gap-1.5 text-[#3e4943] transition-colors hover:text-[#005d42]"
          >
            <Icon name="chat_bubble" className="h-5 w-5" />
            <span className="font-head text-[13px] font-semibold">{comments.length}</span>
          </button>
          <button
            onClick={handleShare}
            className="flex items-center gap-1.5 text-[#3e4943] transition-colors hover:text-[#131b2e]"
          >
            <Icon name="share" className="h-5 w-5" />
            <span className="hidden font-head text-[13px] font-semibold sm:inline">Share</span>
          </button>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 font-head text-[11px] font-semibold text-[#6e7a73]">
            <Icon name="visibility" className="h-[18px] w-[18px]" />
            <span>{formatCount(job.views)} views</span>
          </div>
          <button onClick={toggleBookmark} title="Save Role" className="text-[#3e4943] transition-colors hover:text-[#800000]">
            <Icon name="bookmark" className={`h-[22px] w-[22px] ${saved ? "text-[#800000]" : ""}`} filled={saved} />
          </button>
        </div>
      </div>

      {/* ---------- Comments drawer ---------- */}
      {showComments && (
        <div className="-mx-4 mt-5 flex flex-col gap-4 rounded-b-3xl bg-[#f2f3ff]/50 px-4 pb-4 pt-5 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
          {comments.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-6 text-center">
              <Icon name="forum" className="mb-2 h-8 w-8 text-[#6e7a73]" />
              <p className="font-head text-[16px] font-semibold text-[#131b2e]">No queries posted yet</p>
              <p className="font-body text-[13px] text-[#3e4943]">
                Be the first to ask {job.alumni.name.split(" ")[0]} about this opportunity.
              </p>
            </div>
          ) : (
            <>
              <h4 className="font-head text-[18px] font-semibold text-[#131b2e]">
                Discussion ({comments.length})
              </h4>
              <div className="space-y-3">
                {comments.map((c) => (
                  <div key={c.id} className="flex gap-3 rounded-xl bg-white p-3.5">
                    <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#4e45d5] font-head text-[11px] font-bold text-white">
                      {initials(c.user)}
                    </div>
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        <span className="font-head text-[13px] font-semibold text-[#131b2e]">{c.user}</span>
                        <span className="font-body text-[11px] text-[#6e7a73]">{c.tag}</span>
                      </div>
                      <p className="mt-0.5 font-body text-[13px] text-[#3e4943]">{c.text}</p>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          <form onSubmit={addComment} className="flex gap-2 pt-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a comment or query..."
              className="flex-1 rounded-xl bg-white px-4 py-2.5 font-body text-[13px] text-[#131b2e] outline-none placeholder:text-[#6e7a73] focus:ring-1 focus:ring-[#047857]"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="rounded-xl bg-[#FDCC03] px-5 py-2.5 font-head text-[13px] font-semibold text-black transition-colors duration-200 hover:bg-[#800000] hover:text-white disabled:opacity-40"
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
    <header className="fixed left-0 right-0 top-0 z-50 bg-white/90 shadow-[0_1px_8px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-6 lg:px-12">
        <div className="flex items-center gap-8">
          <a href="#" className="group flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#047857] shadow-sm transition-transform group-hover:scale-105">
              <Icon name="school" className="h-[22px] w-[22px] text-white" />
            </div>
            <div className="flex flex-col">
              <span className="font-head text-[18px] font-semibold leading-none tracking-tight text-[#131b2e]">
                Alumni Connect
              </span>
              <span className="mt-1 font-head text-[10px] font-bold uppercase tracking-wider text-[#047857]">
                Career Hub
              </span>
            </div>
          </a>
          <div className="hidden w-72 items-center gap-2 rounded-lg bg-[#f2f3ff] px-3 py-1.5 shadow-[inset_0_1px_2px_rgba(0,0,0,0.04)] xl:flex">
            <Icon name="search" className="h-[18px] w-[18px] text-[#6e7a73]" />
            <input
              placeholder="Search roles, alumni, companies..."
              className="w-full bg-transparent font-body text-[13px] text-[#131b2e] outline-none placeholder:text-[#6e7a73]"
            />
            <span className="rounded bg-[#e2e7ff] px-1.5 py-0.5 font-head text-[10px] font-bold uppercase tracking-wider text-[#6e7a73]">
              ⌘K
            </span>
          </div>
        </div>

        <nav className="hidden items-center gap-1.5 rounded-xl bg-[#f2f3ff] p-1 md:flex">
          {NAV.map((n) => (
            <button
              key={n}
              onClick={() => setActive(n)}
              className={`rounded-lg px-4 py-2 font-head text-[13px] font-semibold transition-colors ${
                active === n ? "bg-[#047857] text-white shadow-sm" : "text-[#3e4943] hover:text-[#131b2e]"
              }`}
            >
              {n}
            </button>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <button
            aria-label="Notifications"
            className="relative rounded-lg p-2 text-[#3e4943] transition-colors hover:bg-[#eaedff] hover:text-[#131b2e]"
          >
            <Icon name="notifications" className="h-[22px] w-[22px]" />
            <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-[#047857] ring-2 ring-white" />
          </button>
          <div className="hidden h-6 w-px bg-[#dae2fd] sm:block" />
          <div className="flex items-center gap-3 pl-1">
            <div className="relative">
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#005d42]">
                <Icon name="person" className="h-[18px] w-[18px] text-white" />
              </div>
              <span className="absolute -bottom-1 -right-1 rounded-full bg-[#6860ef] px-1 py-0.2 font-head text-[9px] font-bold leading-none text-white ring-2 ring-white">
                '19
              </span>
            </div>
            <div className="hidden flex-col lg:flex">
              <span className="font-head text-[13px] font-semibold leading-tight text-[#131b2e]">
                Elena Rostova
              </span>
              <span className="font-body text-[11px] text-[#3e4943]">Engineering Alumni</span>
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
    <div className="relative overflow-hidden rounded-2xl bg-white p-6 shadow-sm">
      <div className="pointer-events-none absolute -top-16 -right-16 h-64 w-64 rounded-full bg-[#047857]/5 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-16 h-64 w-64 rounded-full bg-[#6860ef]/5 blur-3xl" />
      <div className="relative z-10 flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
        <div>
          <div className="mb-1.5 flex items-center gap-2">
            <span className="h-2 w-2 animate-pulse rounded-full bg-[#047857]" />
            <span className="font-head text-[10px] font-bold uppercase tracking-wider text-[#047857]">
              Verified Collegiate Pipeline
            </span>
          </div>
          <h1 className="font-head text-[28px] font-semibold leading-tight text-[#131b2e]">
            Alumni Referral Feed
          </h1>
          <p className="mt-1 font-body text-[15px] text-[#3e4943]">
            High-impact engineering, data, and leadership opportunities curated directly by graduates.
          </p>
        </div>
        <div className="grid shrink-0 grid-cols-3 gap-2 sm:gap-3 md:gap-4">
          <div className="flex flex-col rounded-xl bg-[#f2f3ff] px-2.5 py-2.5 sm:px-4 sm:py-3">
            <span className="font-head text-[20px] font-semibold leading-none text-[#005d42] sm:text-[28px]">{jobCount}</span>
            <span className="mt-1 font-body text-[10px] text-[#3e4943] sm:text-[11px]">Active Openings</span>
          </div>
          <div className="flex flex-col rounded-xl bg-[#f2f3ff] px-2.5 py-2.5 sm:px-4 sm:py-3">
            <span className="font-head text-[20px] font-semibold leading-none text-[#4e45d5] sm:text-[28px]">{referrerCount}</span>
            <span className="mt-1 font-body text-[10px] text-[#3e4943] sm:text-[11px]">Active Referrers</span>
          </div>
          <div className="flex flex-col rounded-xl bg-[#f2f3ff] px-2.5 py-2.5 sm:px-4 sm:py-3">
            <span className="font-head text-[20px] font-semibold leading-none text-[#005b53] sm:text-[28px]">&lt;24h</span>
            <span className="mt-1 font-body text-[10px] text-[#3e4943] sm:text-[11px]">Latest Referral</span>
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
    <div className="flex flex-col items-stretch justify-between gap-4 lg:flex-row lg:items-center">
      <div className="flex flex-1 flex-col items-stretch gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Icon name="search" className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-[#6e7a73]" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by role, company, or target tech stack..."
            className="w-full rounded-xl bg-white py-3 pl-11 pr-4 font-body text-[13px] text-[#131b2e] shadow-sm outline-none placeholder:text-[#6e7a73] transition-shadow focus:shadow-md"
          />
        </div>
        <div className="relative shrink-0">
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="cursor-pointer appearance-none rounded-xl bg-white py-3 pl-4 pr-10 font-head text-[13px] font-semibold text-[#131b2e] shadow-sm outline-none"
          >
            <option value="recent">Sort: Most Recent</option>
            <option value="likes">Sort: Most Popular</option>
            <option value="deadline">Sort: Application Deadline</option>
          </select>
          <Icon name="unfold_more" className="pointer-events-none absolute right-3 top-1/2 h-[18px] w-[18px] -translate-y-1/2 text-[#6e7a73]" />
        </div>
      </div>

      <div className="scrollbar-none flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
        {FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => setFilter(f.value)}
              className={`shrink-0 whitespace-nowrap rounded-lg px-4 py-2 font-head text-[13px] font-semibold shadow-sm transition-all ${
              filter === f.value ? "bg-[#FDCC03] text-black" : "bg-white text-[#3e4943] hover:bg-[#eaedff] hover:text-[#131b2e]"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
       {/* Fade hint — signals there's more to scroll to on the right */}
        <div className="pointer-events-none absolute right-0 top-0 h-full w-10 bg-gradient-to-l from-[#faf8ff] to-transparent sm:hidden" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Empty state                                                               */
/* -------------------------------------------------------------------------- */
function EmptyState({ onReset }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-3xl bg-white p-12 text-center">
      <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#f2f3ff] text-[#6e7a73]">
        <Icon name="manage_search" className="h-8 w-8" />
      </div>
      <h3 className="font-head text-[22px] font-semibold text-[#131b2e]">No alumni postings found</h3>
      <p className="mt-1 max-w-md font-body text-[15px] text-[#3e4943]">
        Try adjusting your filters, clearing your search query, or checking back soon as new cohorts share
        vacancies.
      </p>
      <button
        onClick={onReset}
        className="mt-5 rounded-xl bg-[#047857] px-6 py-2.5 font-head text-[13px] font-semibold text-white transition-opacity hover:opacity-95"
      >
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
      const matchesFilter = filter === "all" || jobTypeTags(job).includes(filter);
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q || job.company.toLowerCase().includes(q) || job.role.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });

    if (sort === "likes") list = [...list].sort((a, b) => b.likes - a.likes);
    if (sort === "deadline") list = [...list].sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""));

    return list;
  }, [jobs, search, sort, filter]);

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] font-body">
      <FontStyles />
      <TopHeader />

      <main className="w-full pt-20">
        <div className="mx-auto w-full max-w-7xl space-y-6 px-4 py-6 sm:space-y-8 sm:px-6 sm:py-8 lg:px-12">
          <StatsBanner jobCount={jobs.length} />

          <Controls search={search} setSearch={setSearch} sort={sort} setSort={setSort} filter={filter} setFilter={setFilter} />

          {visibleJobs.length === 0 ? (
            <EmptyState onReset={resetFilters} />
          ) : (
            <div className="flex flex-col gap-6 sm:gap-8">
              {visibleJobs.map((job) => (
                <JobCard key={job.id} job={job} onReport={onReport} showToast={showToast} />
              ))}
            </div>
          )}
        </div>
      </main>

      <footer className="mt-8 w-full bg-white shadow-[0_-1px_8px_rgba(0,0,0,0.02)]">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 px-6 py-12 lg:flex-row lg:px-12">
          <div className="flex items-center gap-3">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#047857]">
              <Icon name="school" className="h-4 w-4 text-white" />
            </div>
            <span className="font-head text-[16px] font-semibold text-[#131b2e]">Alumni Connect</span>
            <span className="font-body text-[13px] text-[#6e7a73]">· Distinguished Career Network</span>
          </div>
          <div className="flex items-center gap-6">
            {["Honor Code", "Network Directory", "Privacy Policy", "Support"].map((l) => (
              <a key={l} href="#" className="font-body text-[13px] text-[#3e4943] transition-colors hover:text-[#131b2e]">
                {l}
              </a>
            ))}
          </div>
          <div className="font-body text-[11px] text-[#3e4943]">© 2026 Alumni Association. All rights reserved.</div>
        </div>
      </footer>

      <Toast />
    </div>
  );
}