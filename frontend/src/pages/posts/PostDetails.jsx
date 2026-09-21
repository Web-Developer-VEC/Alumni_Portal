import { useState, useRef, useEffect } from "react";

/* -------------------------------------------------------------------------- */
/*  Sample data – replace with your API response                              */
/*  Only `company`, `role`, `eligibility` and `applyLink` are required.       */
/*  Every other field (image, location, type, package, deadline, skills…)     */
/*  is optional and the card simply hides what is missing.                    */
/* -------------------------------------------------------------------------- */
const SAMPLE_JOBS = [
  {
    id: 1,
    alumni: {
      name: "Dwayne F. White",
      batch: "AI & DS · Batch of 2021",
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
    package: "₹6 – 8 LPA",
    deadline: "30 Sep 2026",
    skills: ["React", "JavaScript", "Tailwind"],
    description:
      "We're hiring freshers on my team! Solid JS fundamentals and one or two React projects are enough. Happy to guide anyone who applies from our college.",
    tags: ["Hiring", "Frontend", "Freshers"],
    image:
      "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=70",
    applyLink: "https://www.zoho.com/careers/",
    views: 5874,
    likes: 215,
    comments: [
      { id: 1, user: "Priya S.", text: "Applied! Thanks for sharing 🙌" },
      { id: 2, user: "Karthik R.", text: "Is there an off-campus test round?" },
    ],
  },
  {
    id: 2,
    alumni: {
      name: "Ananya Krishnan",
      batch: "AI & DS · Batch of 2019",
      designation: "Data Scientist",
      avatar: null,
      verified: true,
    },
    postedAgo: "2h ago",
    company: "Freshworks",
    role: "Data Analyst Intern",
    eligibility: "Pre-final year students · Basic SQL & Python",
    location: "Remote",
    type: "Internship",
    package: "₹25,000 / month",
    deadline: "15 Oct 2026",
    skills: ["Python", "SQL", "Power BI"],
    description: "",
    tags: ["Internship", "DataScience"],
    image: null, // no image → card stays compact
    applyLink: "https://www.freshworks.com/company/careers/",
    views: 1320,
    likes: 84,
    comments: [],
  },
  {
    id: 3,
    alumni: {
      name: "Ananya Krishnan",
      batch: "AI & DS · Batch of 2019",
      designation: "Data Scientist",
      avatar: null,
      verified: true,
    },
    postedAgo: "2h ago",
    company: "Freshworks",
    role: "Data Analyst Intern",
    eligibility: "Pre-final year students · Basic SQL & Python",
    location: "Remote",
    type: "Internship",
    package: "₹25,000 / month",
    deadline: "15 Oct 2026",
    skills: ["Python", "SQL", "Power BI"],
    description: "",
    tags: ["Internship", "DataScience"],
    image: null, // no image → card stays compact
    applyLink: "https://www.freshworks.com/company/careers/",
    views: 1320,
    likes: 84,
    comments: [],
  },
 
];

const REPORT_REASONS = [
  "Spam or misleading",
  "Fake or fraudulent job",
  "Asks for money / fees",
  "Inappropriate content",
  "Other",
];

/* -------------------------------------------------------------------------- */
/*  Tiny inline icons (no extra dependency needed)                            */
/* -------------------------------------------------------------------------- */
const Svg = ({ children, className = "w-5 h-5", fill = "none", ...rest }) => (
  <svg
    viewBox="0 0 24 24"
    fill={fill}
    stroke="currentColor"
    strokeWidth="1.8"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
    {...rest}
  >
    {children}
  </svg>
);

const EyeIcon = (p) => (
  <Svg {...p}>
    <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
    <circle cx="12" cy="12" r="3" />
  </Svg>
);
const HeartIcon = (p) => (
  <Svg {...p}>
    <path d="M20.8 5.6a5.2 5.2 0 0 0-7.4 0L12 7l-1.4-1.4a5.2 5.2 0 1 0-7.4 7.4L12 21.8l8.8-8.8a5.2 5.2 0 0 0 0-7.4Z" />
  </Svg>
);
const CommentIcon = (p) => (
  <Svg {...p}>
    <path d="M21 12a8 8 0 0 1-11.7 7.1L3 20.5l1.4-5.3A8 8 0 1 1 21 12Z" />
  </Svg>
);
const ShareIcon = (p) => (
  <Svg {...p}>
    <circle cx="18" cy="5" r="3" />
    <circle cx="6" cy="12" r="3" />
    <circle cx="18" cy="19" r="3" />
    <path d="m8.6 13.5 6.8 4M15.4 6.5l-6.8 4" />
  </Svg>
);
const BookmarkIcon = (p) => (
  <Svg {...p}>
    <path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4-7 4V4a1 1 0 0 1 1-1Z" />
  </Svg>
);
const DotsIcon = (p) => (
  <Svg {...p} fill="currentColor" stroke="none">
    <circle cx="12" cy="5" r="1.8" />
    <circle cx="12" cy="12" r="1.8" />
    <circle cx="12" cy="19" r="1.8" />
  </Svg>
);
const FlagIcon = (p) => (
  <Svg {...p}>
    <path d="M5 21V4M5 4h11l-2 4 2 4H5" />
  </Svg>
);
const BuildingIcon = (p) => (
  <Svg {...p}>
    <path d="M4 21V5a1 1 0 0 1 1-1h9a1 1 0 0 1 1 1v16M15 10h4a1 1 0 0 1 1 1v10M2 21h20M8 8h3M8 12h3M8 16h3" />
  </Svg>
);
const CapIcon = (p) => (
  <Svg {...p}>
    <path d="m22 9-10-5L2 9l10 5 10-5Z" />
    <path d="M6 11.5V16c0 1.5 2.7 3 6 3s6-1.5 6-3v-4.5" />
  </Svg>
);
const PinIcon = (p) => (
  <Svg {...p}>
    <path d="M12 21s7-6.2 7-11.5A7 7 0 0 0 5 9.5C5 14.8 12 21 12 21Z" />
    <circle cx="12" cy="9.5" r="2.5" />
  </Svg>
);
const WalletIcon = (p) => (
  <Svg {...p}>
    <path d="M3 7a2 2 0 0 1 2-2h13v4M3 7v11a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1V10a1 1 0 0 0-1-1H5a2 2 0 0 1-2-2Z" />
    <circle cx="16.5" cy="14.5" r="1" fill="currentColor" />
  </Svg>
);
const CalendarIcon = (p) => (
  <Svg {...p}>
    <rect x="3" y="5" width="18" height="16" rx="2" />
    <path d="M3 10h18M8 3v4M16 3v4" />
  </Svg>
);
const ExternalIcon = (p) => (
  <Svg {...p}>
    <path d="M14 4h6v6M20 4 10 14M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5" />
  </Svg>
);
const VerifiedBadge = ({ className = "w-5 h-5" }) => (
  <svg viewBox="0 0 24 24" className={className} aria-label="Verified alumni">
    <path
      fill="currentColor"
      d="M12 1.8l2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3 1 3-2.6 1.9-1 3-3.2-.1L12 22.2l-2.6-1.9-3.2.1-1-3L2.6 15.5l1-3-1-3 2.6-1.9 1-3 3.2.1L12 1.8Z"
    />
    <path
      d="m8.3 12.2 2.5 2.5 4.9-5"
      fill="none"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

/* -------------------------------------------------------------------------- */
/*  Helpers                                                                   */
/* -------------------------------------------------------------------------- */
const formatCount = (n) =>
  n >= 1000 ? `${(n / 1000).toFixed(n >= 10000 ? 0 : 1).replace(".0", "")}k` : n;

const initials = (name) =>
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

/* -------------------------------------------------------------------------- */
/*  Small pieces                                                              */
/* -------------------------------------------------------------------------- */
function Avatar({ alumni }) {
  return alumni.avatar ? (
    <img
      src={alumni.avatar}
      alt={alumni.name}
      className="h-12 w-12 shrink-0 rounded-full object-cover"
    />
  ) : (
    <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-semibold text-green-700">
      {initials(alumni.name)}
    </div>
  );
}

const PLACEHOLDER_GRADIENTS = [
  ["#16a34a", "#065f46"],
  ["#0ea5e9", "#4338ca"],
  ["#f59e0b", "#c2410c"],
  ["#d946ef", "#6b21a8"],
  ["#14b8a6", "#155e75"],
  ["#fb7185", "#b91c1c"],
];

const gradientFor = (name = "") => {
  const sum = [...name].reduce((a, c) => a + c.charCodeAt(0), 0);
  const [from, to] = PLACEHOLDER_GRADIENTS[sum % PLACEHOLDER_GRADIENTS.length];
  return `linear-gradient(135deg, ${from}, ${to})`;
};

/* Same height whether or not the alumni uploaded an image */
function Banner({ job }) {
  return (
    <div className="relative h-44 w-full shrink-0 overflow-hidden bg-gray-100">
      {job.image ? (
        <img
          src={job.image}
          alt={`${job.company} workplace`}
          loading="lazy"
          className="h-full w-full object-cover"
        />
      ) : (
        <div
          className="flex h-full w-full flex-col items-center justify-center text-white"
          style={{ backgroundImage: gradientFor(job.company) }}
        >
          <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-white/20 text-2xl font-bold">
            {initials(job.company)}
          </span>
          <span className="mt-2 px-4 text-center text-sm font-semibold tracking-wide opacity-90">
            {job.company}
          </span>
        </div>
      )}
      {job.type && (
        <span className="absolute left-4 top-3 rounded-full bg-white/95 px-2.5 py-1 text-xs font-semibold text-green-700 shadow-sm">
          {job.type}
        </span>
      )}
    </div>
  );
}

function Detail({ icon: Icon, label, value, className = "" }) {
  if (!value) return null;
  return (
    <div className={`flex items-start gap-2.5 ${className}`}>
      <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-gray-100 text-gray-500">
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0">
        <p className="text-[11px] font-medium uppercase tracking-wide text-gray-400">
          {label}
        </p>
        <p className="text-sm font-medium leading-snug text-gray-800">{value}</p>
      </div>
    </div>
  );
}

function ActionButton({ icon: Icon, label, active, activeClass = "", onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`group flex items-center gap-1.5 rounded-full px-2.5 py-1.5 text-sm transition hover:bg-gray-100 ${
        active ? activeClass : "text-gray-500"
      }`}
    >
      <Icon
        className="h-5 w-5 transition group-active:scale-90"
        fill={active ? "currentColor" : "none"}
      />
      {label !== undefined && <span>{label}</span>}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/*  Report modal                                                              */
/* -------------------------------------------------------------------------- */
function ReportModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState("");
  const [note, setNote] = useState("");

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-0 sm:items-center sm:p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Report post"
    >
      <div
        className="w-full max-w-md rounded-t-3xl bg-white p-5 shadow-xl sm:rounded-3xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h3 className="text-lg font-semibold text-gray-900">Report this post</h3>
        <p className="mt-1 text-sm text-gray-500">
          Tell us what's wrong. Our moderators will review it.
        </p>

        <div className="mt-4 space-y-2">
          {REPORT_REASONS.map((r) => (
            <label
              key={r}
              className={`flex cursor-pointer items-center gap-3 rounded-xl border px-3 py-2.5 text-sm transition ${
                reason === r
                  ? "border-green-600 bg-green-50 text-green-800"
                  : "border-gray-200 text-gray-700 hover:bg-gray-50"
              }`}
            >
              <input
                type="radio"
                name="report-reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="accent-green-600"
              />
              {r}
            </label>
          ))}
        </div>

        <textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          rows={2}
          placeholder="Add details (optional)"
          className="mt-3 w-full resize-none rounded-xl border border-gray-200 px-3 py-2 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
        />

        <div className="mt-4 flex justify-end gap-2">
          <button
            type="button"
            onClick={onClose}
            className="rounded-full px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={!reason}
            onClick={() => onSubmit({ reason, note })}
            className="rounded-full bg-red-600 px-5 py-2 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Submit report
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/*  Job card                                                                  */
/* -------------------------------------------------------------------------- */
function JobCard({ job, onReport }) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(job.likes);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState(job.comments || []);
  const [showComments, setShowComments] = useState(false);
  const [draft, setDraft] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [reported, setReported] = useState(false);

  const menuRef = useRef(null);
  useOutsideClick(menuRef, () => setMenuOpen(false));
    // "View more": only shown when the description is actually cut off
  const [expanded, setExpanded] = useState(false);
  const [isLong, setIsLong] = useState(false);
  const descRef = useRef(null);

  useEffect(() => {
    const el = descRef.current;
    if (!el) return;
    const check = () => {
      if (!expanded) setIsLong(el.scrollHeight > el.clientHeight + 1);
    };
    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [job.description, expanded]);

  const toggleLike = () => {
    setLiked((v) => !v);
    setLikes((n) => (liked ? n - 1 : n + 1));
  };

  const handleShare = async () => {
    const url = `${window.location.origin}${window.location.pathname}#job-${job.id}`;
    const data = {
      title: `${job.role} at ${job.company}`,
      text: `${job.alumni.name} shared a job opening: ${job.role} at ${job.company}`,
      url,
    };
    try {
      if (navigator.share) {
        await navigator.share(data);
      } else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 1800);
      }
    } catch {
      /* user cancelled share sheet */
    }
  };

  const addComment = (e) => {
    e.preventDefault();
    if (!draft.trim()) return;
    setComments((c) => [...c, { id: Date.now(), user: "You", text: draft.trim() }]);
    setDraft("");
  };

  if (reported) {
    return (
      <article className="flex h-full items-center justify-center rounded-3xl bg-white p-5 text-center text-sm text-gray-500 shadow-sm">
        Thanks for reporting. We'll review this post.
      </article>
    );
  }

  return (
    <article
      id={`job-${job.id}`}
      className="flex h-full flex-col overflow-hidden rounded-3xl bg-white shadow-[0_8px_30px_rgba(0,0,0,0.06)]"
    >
      <div className="px-5 pt-5 pb-4">
        {/* ---------- Header ---------- */}
        <header className="flex items-start gap-3">
          <Avatar alumni={job.alumni} />

          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-1.5">
              <h3 className="truncate text-base font-semibold text-gray-900">
                {job.alumni.name}
              </h3>
              {job.alumni.verified && (
                <VerifiedBadge className="h-5 w-5 shrink-0 text-green-600" />
              )}
            </div>
            <p className="truncate text-xs text-gray-500">
              {job.alumni.designation} · {job.alumni.batch}
            </p>
            <p className="text-xs text-gray-400">Posted {job.postedAgo}</p>
          </div>

          {/* 3-dot menu */}
          <div className="relative" ref={menuRef}>
            <button
              type="button"
              onClick={() => setMenuOpen((v) => !v)}
              aria-label="More options"
              aria-haspopup="menu"
              aria-expanded={menuOpen}
              className="rounded-full p-1.5 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
            >
              <DotsIcon className="h-5 w-5" />
            </button>

            {menuOpen && (
              <div
                role="menu"
                className="absolute right-0 top-9 z-20 w-40 overflow-hidden rounded-xl border border-gray-100 bg-white py-1 shadow-lg"
              >
                <button
                  type="button"
                  role="menuitem"
                  onClick={() => {
                    setMenuOpen(false);
                    setReportOpen(true);
                  }}
                  className="flex w-full items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <FlagIcon className="h-4 w-4" />
                  Report
                </button>
              </div>
            )}
          </div>
        </header>

      </div>

      {/* ---------- Banner: image, or a generated placeholder (same height always) ---------- */}
      <Banner job={job} />

      <div className="flex flex-1 flex-col px-5 pb-2 pt-4">
        {/* ---------- Job title ---------- */}
        <h2 className="line-clamp-2 text-xl font-bold leading-tight text-gray-900">
          {job.role}
        </h2>
        <p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-gray-500">
          <BuildingIcon className="h-4 w-4 shrink-0" />
          <span className="truncate">{job.company}</span>
        </p>

        {/* ---------- Optional description ---------- */}
                {job.description && (
          <div className="mt-3">
            <p
              ref={descRef}
              className={`whitespace-pre-line text-[15px] leading-relaxed text-gray-700 ${
                expanded ? "" : "line-clamp-3"
              }`}
            >
              {job.description}
            </p>
            {(isLong || expanded) && (
              <button
                type="button"
                onClick={() => setExpanded((v) => !v)}
                aria-expanded={expanded}
                className="mt-1 text-sm font-semibold text-green-600 hover:underline"
              >
                {expanded ? "View less" : "View more"}
              </button>
            )}
          </div>
        )}

        {/* ---------- Details ---------- */}
        <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Detail icon={PinIcon} label="Location" value={job.location} />
          <Detail icon={WalletIcon} label="Package" value={job.package} />
          <Detail icon={CalendarIcon} label="Apply before" value={job.deadline} />
          <Detail
            icon={CapIcon}
            label="Eligibility"
            value={job.eligibility}
            className="sm:col-span-2"
          />
        </div>

        {/* Skills */}
        {job.skills?.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {job.skills.map((s) => (
              <span
                key={s}
                className="rounded-full bg-gray-100 px-2.5 py-1 text-xs font-medium text-gray-600"
              >
                {s}
              </span>
            ))}
          </div>
        )}

        {/* Hashtags */}
        {job.tags?.length > 0 && (
          <p className="mt-3 text-sm font-medium text-green-600">
            {job.tags.map((t) => `#${t}`).join(" ")}
          </p>
        )}

        {/* Apply link (pinned to the bottom so all cards line up) */}
        <div className="mt-auto pt-4">
        <a
          href={job.applyLink}
          target="_blank"
          rel="noopener noreferrer"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-green-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-green-700 active:scale-[0.99]"
        >
          Apply on company portal
          <ExternalIcon className="h-4 w-4" />
        </a>
        </div>
      </div>

      {/* ---------- Action bar ---------- */}
      <footer className="mt-2 flex items-center justify-between border-t border-gray-100 px-3 py-2">
        <div className="flex items-center">
          <ActionButton
            icon={HeartIcon}
            label={likes}
            active={liked}
            activeClass="text-rose-500"
            onClick={toggleLike}
          />
          <ActionButton
            icon={CommentIcon}
            label={comments.length}
            active={showComments}
            activeClass="text-green-600"
            onClick={() => setShowComments((v) => !v)}
          />
          <div className="relative">
            <ActionButton icon={ShareIcon} onClick={handleShare} />
            {copied && (
              <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-md bg-gray-900 px-2 py-1 text-xs text-white">
                Link copied
              </span>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <span className="hidden items-center gap-1 pr-1 text-xs text-gray-400 min-[380px]:flex">
            <EyeIcon className="h-4 w-4" />
            {formatCount(job.views)}
          </span>
          <ActionButton
            icon={BookmarkIcon}
            active={saved}
            activeClass="text-green-600"
            onClick={() => setSaved((v) => !v)}
          />
        </div>
      </footer>

      {/* ---------- Comments ---------- */}
      {showComments && (
        <section className="border-t border-gray-100 bg-gray-50 px-5 py-4">
          {comments.length === 0 ? (
            <p className="text-sm text-gray-400">No comments yet. Be the first!</p>
          ) : (
            <ul className="space-y-3">
              {comments.map((c) => (
                <li key={c.id} className="flex gap-2.5">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-200 text-xs font-semibold text-gray-600">
                    {initials(c.user)}
                  </div>
                  <div className="rounded-2xl rounded-tl-sm bg-white px-3 py-2 shadow-sm">
                    <p className="text-xs font-semibold text-gray-800">{c.user}</p>
                    <p className="text-sm text-gray-700">{c.text}</p>
                  </div>
                </li>
              ))}
            </ul>
          )}

          <form onSubmit={addComment} className="mt-3 flex gap-2">
            <input
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              placeholder="Write a comment…"
              className="min-w-0 flex-1 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm outline-none focus:border-green-600 focus:ring-1 focus:ring-green-600"
            />
            <button
              type="submit"
              disabled={!draft.trim()}
              className="rounded-full bg-green-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-green-700 disabled:opacity-40"
            >
              Post
            </button>
          </form>
        </section>
      )}

      {reportOpen && (
        <ReportModal
          onClose={() => setReportOpen(false)}
          onSubmit={(payload) => {
            onReport?.(job.id, payload); // send to your API here
            setReportOpen(false);
            setReported(true);
          }}
        />
      )}
    </article>
  );
}

/* -------------------------------------------------------------------------- */
/*  Page                                                                      */
/* -------------------------------------------------------------------------- */
export default function AlumniJobFeed({ jobs = SAMPLE_JOBS, onReport }) {
  return (
    <main className="min-h-screen bg-gray-200/70">
      {/* Top bar */}
      <div className="sticky top-0 z-30 border-b border-gray-200 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div>
            <h1 className="text-lg font-bold text-gray-900 sm:text-xl">
              Alumni Job Board
            </h1>
            <p className="hidden text-xs text-gray-500 sm:block">
              Opportunities shared by our alumni
            </p>
          </div>
        </div>
      </div>

      {/* Feed:
          mobile  → 1 column (like the reference card)
          tablet  → 2 columns
          desktop → 3 columns
          CSS grid + equal-height cards, so every row lines up */}
      <div className="mx-auto max-w-md px-4 py-6 sm:max-w-7xl sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 items-stretch gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {jobs.map((job) => (
            <JobCard key={job.id} job={job} onReport={onReport} />
          ))}
        </div>
      </div>
    </main>
  );
}