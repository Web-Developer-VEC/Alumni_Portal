import { useState, useRef, useEffect, useMemo } from "react";

/* -------------------------------------------------------------------------- */
/*  useOutsideClick                                                           */
/*  Fires `handler` when a mousedown/touchstart happens outside `ref`.       */
/*  Used for dropdown menus, popovers, etc.                                  */
/* -------------------------------------------------------------------------- */
export function useOutsideClick(ref, handler) {
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
/*  useToast                                                                  */
/*  Simple auto-dismissing toast. Returns { toast, showToast }; render your  */
/*  own toast UI driven by `toast.show` / `toast.message`, or keep using the */
/*  <Toast /> component pattern from post.jsx if you prefer a ready element. */
/* -------------------------------------------------------------------------- */
export function useToast(duration = 2600) {
  const [toast, setToast] = useState({ show: false, message: "" });
  const timerRef = useRef(null);

  const showToast = (message) => {
    clearTimeout(timerRef.current);
    setToast({ show: true, message });
    timerRef.current = setTimeout(() => setToast({ show: false, message }), duration);
  };

  useEffect(() => () => clearTimeout(timerRef.current), []);

  return { toast, showToast };
}

/* -------------------------------------------------------------------------- */
/*  useJobFeed                                                                */
/*  Owns search / sort / filter state for a list of job postings and returns */
/*  the derived, filtered + sorted list. Pull this out of the page component */
/*  so the filtering logic can be tested or reused independently of the UI.  */
/*                                                                            */
/*  Role-agnostic by design: the hook only knows about `jobs`, not about who */
/*  is viewing them. A Student page, an Alumni page, and a Faculty page can  */
/*  all call this same hook on the same feed and get identical search/sort/  */
/*  filter behavior — nothing here checks or assumes a role.                 */
/*                                                                            */
/*  `viewerRole` is accepted and returned untouched. It has no effect on the */
/*  filtering logic today; it's a hook for later, so that if role-specific   */
/*  behavior (e.g. different default filters, or gating which jobs show up) */
/*  is ever needed, it can be added in one place without changing the       */
/*  signature every caller already uses.                                    */
/*                                                                            */
/*  `jobTypeTags` mirrors the helper in post.jsx — pass your own if your     */
/*  job shape differs.                                                       */
/* -------------------------------------------------------------------------- */
function defaultJobTypeTags(job) {
  const tags = [];
  if (job.type === "Internship") tags.push("internships");
  if (job.type === "Full-time") tags.push("full-time");
  if (job.referralAvailable || job.directReferral || job.highVolumeReferrals || job.pledge)
    tags.push("referrals");
  if (job.freshers) tags.push("freshers");
  return tags;
}

export function useJobFeed(jobs, { getTags = defaultJobTypeTags, viewerRole = null } = {}) {
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("recent"); // "recent" | "likes" | "deadline"
  const [filter, setFilter] = useState("all");

  const visibleJobs = useMemo(() => {
    let list = jobs.filter((job) => {
      const matchesFilter = filter === "all" || getTags(job).includes(filter);
      const q = search.toLowerCase().trim();
      const matchesSearch =
        !q || job.company.toLowerCase().includes(q) || job.role.toLowerCase().includes(q);
      return matchesFilter && matchesSearch;
    });

    if (sort === "likes") list = [...list].sort((a, b) => b.likes - a.likes);
    if (sort === "deadline")
      list = [...list].sort((a, b) => (a.deadline || "").localeCompare(b.deadline || ""));

    return list;
  }, [jobs, search, sort, filter, getTags]);

  const resetFilters = () => {
    setSearch("");
    setFilter("all");
  };

  return {
    search,
    setSearch,
    sort,
    setSort,
    filter,
    setFilter,
    visibleJobs,
    resetFilters,
    viewerRole, // unused today — passed through for any role-aware UI you build on top
  };
}

/* -------------------------------------------------------------------------- */
/*  useJobInteractions                                                        */
/*  Owns the per-card social state for a single job posting: like, bookmark, */
/*  comments, and report submission. Pulled out of JobCard so the same       */
/*  interactions work no matter which role's page is rendering the card.     */
/*                                                                            */
/*  Role-agnostic by design, same as useJobFeed: the hook doesn't check who  */
/*  "currentUser" is beyond using currentUser.name/tag to label a posted     */
/*  comment. A Student, Alumni, or Faculty page can all call this on the     */
/*  same job object and get identical like/comment/bookmark/report behavior.*/
/*  `viewerRole` is accepted and passed through for the same reason as in   */
/*  useJobFeed — nothing here branches on it today.                          */
/*                                                                            */
/*  Share is intentionally left out: the UI in post.jsx (ShareModal) needs   */
/*  its own contact-list state and is already fairly self-contained. If you  */
/*  want it as a hook too, say the word and I'll pull `shareUrl`/`shareText` */
/*  + the send/copy logic out of ShareModal the same way.                    */
/* -------------------------------------------------------------------------- */
export function useJobInteractions(job, { currentUser = { name: "You", tag: "You" }, viewerRole = null, onReport } = {}) {
  const [liked, setLiked] = useState(false);
  const [likes, setLikes] = useState(job.likes ?? 0);
  const [saved, setSaved] = useState(false);
  const [comments, setComments] = useState(job.comments || []);

  const toggleLike = () => {
    setLiked((v) => !v);
    setLikes((n) => (liked ? n - 1 : n + 1));
  };

  const toggleBookmark = () => {
    setSaved((v) => !v);
  };

  const addComment = (text) => {
    const trimmed = text.trim();
    if (!trimmed) return;
    setComments((c) => [...c, { id: Date.now(), user: currentUser.name, tag: currentUser.tag, text: trimmed }]);
  };

  const submitReport = (payload) => {
    onReport?.(job.id, payload);
  };

  return {
    liked,
    likes,
    toggleLike,
    saved,
    toggleBookmark,
    comments,
    addComment,
    submitReport,
    viewerRole, // unused today — passed through for any role-aware UI you build on top
  };
}