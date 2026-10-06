import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import styles from "./LandingPage.module.css";

const s = (...classes) => {
  const result = new Set();
  for (const c of classes) {
    if (!c) continue;
    const str = typeof c === "string" ? c : String(c);
    const parts = str.trim().split(/\s+/);
    for (const part of parts) {
      if (!part) continue;
      if (styles[part]) {
        result.add(styles[part]);
      }
      result.add(part);
    }
  }
  return Array.from(result).join(" ");
};
import vecLogo from "../../assets/VEC_Logo.png";
import { getLandingData } from "../../api/landing";
import {
  Users,
  GraduationCap,
  Calendar,
  Landmark,
  Trophy,
  Rocket,
  Star,
  Target,
  Heart,
  Laptop,
  Microscope,
  Medal,
  MapPin,
  MessageCircle,
  PlayCircle,
  Apple,
  Briefcase,
  ArrowRight,
} from "lucide-react";

/* =========================================================
   INLINE SOCIAL ICONS
   (lucide-react no longer ships brand/logo icons)
========================================================= */

function InstagramIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="5"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <circle cx="12" cy="12" r="4" stroke="currentColor" strokeWidth="1.8" />
      <circle cx="17.5" cy="6.5" r="1.2" fill="currentColor" />
    </svg>
  );
}

function LinkedinIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <rect
        x="3"
        y="3"
        width="18"
        height="18"
        rx="3"
        stroke="currentColor"
        strokeWidth="1.8"
      />
      <path
        d="M7 10v7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
      <circle cx="7" cy="7" r="1.1" fill="currentColor" />
      <path
        d="M11 17v-4.5c0-1.5 1-2.5 2.3-2.5 1.2 0 1.7 1 1.7 2.5V17"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M11 10v7"
        stroke="currentColor"
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TwitterIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <path
        d="M4 4l7.5 9.6L4.3 20H6.9l5.8-5.6 4.6 5.6H20l-8-9.9L18.9 4h-2.6l-5.3 5.2L6.8 4H4z"
        fill="currentColor"
      />
    </svg>
  );
}

function FacebookIcon(props) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      {...props}
    >
      <circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.8" />
      <path
        d="M13.5 21v-6.5H15.5L15.8 12H13.5V10.3c0-.7.2-1.2 1.2-1.2H16V6.6c-.2 0-1-.1-1.9-.1-1.9 0-3.1 1.1-3.1 3.2V12H9v2.5h2V21"
        fill="currentColor"
      />
    </svg>
  );
}

/* =========================================================
   HOOK: useReveal
========================================================= */

function useReveal(threshold = 0.18) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;

    if (!node) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      setVisible(true);
      return;
    }

    const isMobile =
      typeof window !== "undefined" && window.innerWidth <= 768;
    const effectiveThreshold = isMobile ? 0.05 : threshold;
    const effectiveRootMargin = isMobile
      ? "0px 0px 20px 0px"
      : "0px 0px -60px 0px";

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      {
        threshold: effectiveThreshold,
        rootMargin: effectiveRootMargin,
      },
    );

    observer.observe(node);

    return () => observer.disconnect();
  }, [threshold]);

  return [ref, visible];
}

/* =========================================================
   HOOK: useCountUp
========================================================= */

function useCountUp(target, visible, duration = 1600) {
  const [value, setValue] = useState(0);
  const rafRef = useRef(null);

  useEffect(() => {
    if (!visible) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) {
      setValue(target);
      return;
    }

    const start = performance.now();

    const tick = (now) => {
      const elapsed = now - start;

      const progress = Math.min(elapsed / duration, 1);

      const eased = 1 - Math.pow(1 - progress, 3);

      setValue(Math.floor(eased * target));

      if (progress < 1) {
        rafRef.current = requestAnimationFrame(tick);
      } else {
        setValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafRef.current);
    };
  }, [visible, target, duration]);

  return value;
}

/* =========================================================
   HOOK: useTilt
========================================================= */

function useTilt(strength = 6) {
  const ref = useRef(null);

  const handleMove = useCallback(
    (e) => {
      const node = ref.current;

      if (!node) return;

      const rect = node.getBoundingClientRect();

      const x = e.clientX - rect.left;

      const y = e.clientY - rect.top;

      const px = x / rect.width - 0.5;

      const py = y / rect.height - 0.5;

      node.style.setProperty("--tiltX", `${(-py * strength).toFixed(2)}deg`);

      node.style.setProperty("--tiltY", `${(px * strength).toFixed(2)}deg`);

      node.style.setProperty("--glowX", `${x}px`);

      node.style.setProperty("--glowY", `${y}px`);
    },
    [strength],
  );

  const handleLeave = useCallback(() => {
    const node = ref.current;

    if (!node) return;

    node.style.setProperty("--tiltX", "0deg");

    node.style.setProperty("--tiltY", "0deg");
  }, []);

  return {
    ref,
    handleMove,
    handleLeave,
  };
}

/* =========================================================
   COMPONENT: Reveal
========================================================= */

function Reveal({
  as: Tag = "div",
  className = "",
  delay = 0,
  children,
  ...rest
}) {
  const [ref, visible] = useReveal();

  return (
    <Tag
      ref={ref}
      className={s(`reveal ${visible ? "is-visible" : ""} ${className}`)}
      style={{
        "--reveal-delay": `${delay}ms`,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/* =========================================================
   COMPONENT: TiltCard
========================================================= */

function TiltCard({ className = "", children, ...rest }) {
  const { ref, handleMove, handleLeave } = useTilt(6);

  return (
    <article
      ref={ref}
      className={s(`tilt-card ${className}`)}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      <span className={s("tilt-glow")} aria-hidden="true" />

      {children}
    </article>
  );
}

/* =========================================================
   COMPONENT: Words
   Splits a string into individually-staggered <span> words.
========================================================= */

function Words({ text, visible, startIndex = 0, wordDelay = 55 }) {
  const words = text.split(" ").filter(Boolean);

  return (
    <>
      {words.map((word, i) => (
        <span
          key={i}
          className={s(`reveal-word ${visible ? "is-visible" : ""}`)}
          style={{
            transitionDelay: `${(startIndex + i) * wordDelay}ms`,
          }}
        >
          {word}
          {i < words.length - 1 ? "\u00A0" : ""}
        </span>
      ))}
    </>
  );
}

/* =========================================================
   COMPONENT: RevealHeading
   Wraps a heading tag, watches it with IntersectionObserver,
   and hands "visible" to a render-prop so words inside can
   fly in from a given direction (up / down / left / right).
========================================================= */

function RevealHeading({
  as: Tag = "h2",
  direction = "up",
  className = "",
  children,
}) {
  const [ref, visible] = useReveal(0.3);

  return (
    <Tag
      ref={ref}
      className={s(`word-stagger word-stagger-${direction} ${className}`)}
    >
      {children(visible)}
    </Tag>
  );
}

/* =========================================================
   COMPONENT: Stat
========================================================= */

function Stat({ target, suffix, label }) {
  const [ref, visible] = useReveal(0.4);

  const value = useCountUp(target, visible);

  return (
    <div
      ref={ref}
      className={s(`stat-item reveal ${visible ? "is-visible" : ""}`)}
    >
      <strong className={s("stat-number")}>
        {value}
        {suffix}
      </strong>

      <span>{label}</span>
    </div>
  );
}

/* =========================================================
   COMPONENT: HeroCardStack
========================================================= */

function HeroCardStack({ items = [], interval = 2600 }) {
  const [active, setActive] = useState(0);

  useEffect(() => {
    if (!items || items.length === 0) return;

    const prefersReduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    if (prefersReduced) return;

    const id = setInterval(() => {
      setActive((prev) => (prev + 1) % items.length);
    }, interval);

    return () => clearInterval(id);
  }, [items?.length, interval]);

  if (!items || items.length === 0) return null;

  const count = items.length;
  const front = items[active] || items[0] || {};

  return (
    <div className={s("hero-carousel")}>
      <div className={s("hero-carousel-stage")} aria-hidden="true">
        {items.map((person, i) => {
          // position relative to the active card, wrapped into shortest signed distance
          let rel = i - active;
          if (rel > count / 2) rel -= count;
          if (rel < -count / 2) rel += count;

          const isFront = rel === 0;
          const dist = Math.abs(rel);

          const cardStyle = {
            "--rel": rel,
            "--dist": dist,
          };

          return (
            <div
              className={s(`hero-carousel-card ${isFront ? "is-front" : ""}`)}
              style={cardStyle}
              key={person.id || i}
            >
              <img src={person.image} alt={person.name} loading="lazy" />
            </div>
          );
        })}
      </div>

      <div className={s("hero-carousel-label")}>
        <strong>{front.name}</strong>
        <div className={s("hero-carousel-label-meta")}>
          <span>{front.batch}</span>
          <span className={s("hero-carousel-dot")} />
          <span>{front.role}</span>
        </div>
      </div>
    </div>
  );
}

/* =================================================
   ALUMNI ROLLING CARD
================================================= */

function AlumniRollingCard({ image, name, role }) {
  return (
    <article className={s("alumni-rolling-card")}>
      <div className={s("alumni-photo-wrapper")}>
        <img src={image} alt={name} className={s("alumni-photo")} loading="lazy" />

        <span className={s("alumni-live-dot")}></span>
      </div>

      <div className={s("alumni-rolling-info")}>
        <h3>{name}</h3>

        <p>{role}</p>
      </div>

      <span className={s("alumni-card-arrow")}>↗</span>
    </article>
  );
}
/* =================================================
   EVENT CARD
================================================= */

function EventCard({ ev }) {
  const [imgFailed, setImgFailed] = useState(false);
  const showImage = ev.image && !imgFailed;

  return (
    <article className={s("event-card")}>
      <div className={s("event-media")}>
        {showImage ? (
          <img
            src={ev.image}
            alt={ev.title}
            loading="lazy"
            onError={() => setImgFailed(true)}
          />
        ) : (
          <div className={s("event-media-fallback")} aria-hidden="true">
            <Calendar size={40} />
          </div>
        )}

        <div className={s("event-date")}>
          <strong>{ev.day}</strong>
          <span>{ev.month}</span>
        </div>

        <span className={s("event-type")}>{ev.category || "EVENT"}</span>
      </div>

      <div className={s("event-info")}>
        <h3>{ev.title}</h3>
        <p>{ev.description}</p>
        <span className={s("event-location")}>
          <MapPin size={11} /> {ev.venue}
        </span>
      </div>
    </article>
  );
}

/* =================================================
   DISCUSSION CARD
================================================= */

function DiscussionCard({ initials, name, time, message, replies, likes }) {
  return (
    <Reveal as={TiltCard} className={s("discussion-card")}>
      <div className={s("discussion-avatar")}>{initials}</div>

      <div className={s("discussion-body")}>
        <div className={s("discussion-meta")}>
          <strong>{name}</strong>
          <span>{time}</span>
        </div>

        <p>{message}</p>

        <div className={s("discussion-actions")}>
          <span className={s("discussion-stat")}>
            <MessageCircle size={13} /> {replies} Replies
          </span>
          <span className={s("discussion-stat")}>
            <Heart size={13} /> {likes} Likes
          </span>
          <span className={s("discussion-cta")}>View Thread →</span>
        </div>
      </div>
    </Reveal>
  );
}

/* =========================================================
   FALLBACK DATASETS (used if backend is slow/offline)
========================================================= */

const heroAlumniStack = [
  {
    id: "s1",
    name: "Arun Kumar",
    batch: "Batch of 2019",
    role: "Software Engineer @ Zoho",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "s2",
    name: "Priya S",
    batch: "Batch of 2020",
    role: "Data Analyst @ TCS",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "s3",
    name: "Rahul V",
    batch: "Batch of 2018",
    role: "AI Engineer @ Presidio",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "s4",
    name: "Keerthana R",
    batch: "Batch of 2021",
    role: "Product Designer @ Freshworks",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "s5",
    name: "Vignesh M",
    batch: "Batch of 2017",
    role: "Cloud Engineer @ Infosys",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
  },
];

const fallbackShowcaseAlumni = [
  {
    id: "f1",
    name: "Arun Kumar",
    role: "Software Engineer @ Zoho",
    image:
      "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f2",
    name: "Priya S",
    role: "Data Analyst @ TCS",
    image:
      "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f3",
    name: "Rahul V",
    role: "AI Engineer @ Presidio",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f4",
    name: "Keerthana R",
    role: "Product Designer @ Freshworks",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f5",
    name: "Vignesh M",
    role: "Cloud Engineer @ Infosys",
    image:
      "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f6",
    name: "Harish Kumar",
    role: "Full Stack Developer @ Amazon",
    image:
      "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f7",
    name: "Divya S",
    role: "Business Analyst @ Deloitte",
    image:
      "https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f8",
    name: "Sanjay Kumar",
    role: "DevOps Engineer @ Microsoft",
    image:
      "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f9",
    name: "Nithya R",
    role: "HR Manager @ Google",
    image:
      "https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f10",
    name: "Karthik S",
    role: "Software Architect @ Cisco",
    image:
      "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f11",
    name: "Swetha P",
    role: "UX Designer",
    image:
      "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: "f12",
    name: "Adithya R",
    role: "Machine Learning Engineer",
    image:
      "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
  },
];

const fallbackEvents = [
  {
    id: "fe1",
    day: "15",
    month: "MAR",
    category: "REUNION",
    title: "VEC Alumni Meet 2026",
    description: "Reconnect with classmates and revisit your college memories.",
    venue: "Velammal Engineering College",
  },
  {
    id: "fe2",
    day: "22",
    month: "APR",
    category: "NETWORKING",
    title: "Alumni Industry Connect",
    description:
      "Meet professionals from different industries and build meaningful connections.",
    venue: "Chennai Trade Centre",
  },
  {
    id: "fe3",
    day: "10",
    month: "MAY",
    category: "MENTORSHIP",
    title: "Alumni Mentorship Session",
    description:
      "Experienced alumni share career insights with the next generation.",
    venue: "Online (Google Meet)",
  },
  {
    id: "fe4",
    day: "18",
    month: "JUN",
    category: "WORKSHOP",
    title: "Tech Skills Bootcamp",
    description:
      "Hands-on workshop covering the latest in AI, cloud and full-stack development.",
    venue: "VEC Auditorium, Chennai",
  },
  {
    id: "fe5",
    day: "05",
    month: "JUL",
    category: "REUNION",
    title: "Department Batch Meetup",
    description:
      "Celebrate your department's legacy and reconnect with batch mates.",
    venue: "Velammal Engineering College",
  },
  {
    id: "fe6",
    day: "20",
    month: "AUG",
    category: "NETWORKING",
    title: "Startup & Innovation Summit",
    description:
      "Alumni entrepreneurs pitch ideas and connect with investors and mentors.",
    venue: "Taj Coromandel, Bengaluru",
  },
];

/* =========================================================
   MAIN LANDING PAGE
========================================================= */

function LandingPage() {
  const navigate = useNavigate();

  const [isLoading, setIsLoading] = useState(true);

  // Dynamic Landing Page State from Backend
  const [stats, setStats] = useState({
    yearsOfExcellence: 25,
    alumniCount: 10,
    alumniSuffix: "K+",
    departmentsCount: 20,
    eventsCount: 50,
  });
  const [heroAlumni, setHeroAlumni] = useState(heroAlumniStack);
  const [showcaseAlumni, setShowcaseAlumni] = useState(fallbackShowcaseAlumni);
  const [events, setEvents] = useState(fallbackEvents);

  useEffect(() => {
    let isMounted = true;

    // Fetch dynamic landing page data from backend
    getLandingData()
      .then((res) => {
        if (!isMounted) return;
        const data = res?.data || res;
        if (data?.stats) {
          setStats(data.stats);
        }
        if (Array.isArray(data?.heroAlumni) && data.heroAlumni.length > 0) {
          setHeroAlumni(data.heroAlumni);
        }
        if (Array.isArray(data?.showcaseAlumni) && data.showcaseAlumni.length > 0) {
          setShowcaseAlumni(data.showcaseAlumni);
        }
        if (Array.isArray(data?.events) && data.events.length > 0) {
          setEvents(data.events);
        }
      })
      .catch((err) => {
        console.warn("Could not fetch landing page data from backend:", err);
      });

    const timer = setTimeout(() => {
      if (isMounted) setIsLoading(false);
    }, 800);

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, []);

  // Split showcase alumni evenly across 3 marquee rows
  const displayAlumni = showcaseAlumni || [];
  const row1 = [];
  const row2 = [];
  const row3 = [];
  displayAlumni.forEach((item, index) => {
    if (index % 3 === 0) row1.push(item);
    else if (index % 3 === 1) row2.push(item);
    else row3.push(item);
  });

  const fillRow = (row) => {
    if (!row || row.length === 0) return [];
    let filled = [...row];
    while (filled.length < 6 && filled.length > 0) {
      filled = filled.concat(row);
    }
    return filled;
  };
  const filledRow1 = fillRow(row1);
  const filledRow2 = fillRow(row2);
  const filledRow3 = fillRow(row3);

  // Prepare events for infinite marquee
  const fillEvents = (evList) => {
    if (!evList || evList.length === 0) return [];
    let filled = [...evList];
    while (filled.length < 6 && filled.length > 0) {
      filled = filled.concat(evList);
    }
    return filled;
  };
  const displayEvents = fillEvents(events);

  const scrollToSection = (id) => {
    const section = document.getElementById(id);

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const heroRef = useRef(null);
  const navRef = useRef(null);

  useLayoutEffect(() => {
    const node = navRef.current;
    if (!node) return;

    const setNavHeight = () => {
      document.documentElement.style.setProperty(
        "--nav-h",
        `${node.offsetHeight}px`,
      );
    };

    setNavHeight();

    const ro = new ResizeObserver(setNavHeight);
    ro.observe(node);
    window.addEventListener("resize", setNavHeight);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setNavHeight);
    };
  }, []);

  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    let ticking = false;

    const onScroll = () => {
      if (!ticking) {
        window.requestAnimationFrame(() => {
          setScrollY(window.scrollY);

          ticking = false;
        });

        ticking = true;
      }
    };

    window.addEventListener("scroll", onScroll, {
      passive: true,
    });

    return () => {
      window.removeEventListener("scroll", onScroll);
    };
  }, []);

  const getScrollProgress = () => {
    if (typeof document === "undefined" || typeof window === "undefined") {
      return 0;
    }

    const total = document.documentElement.scrollHeight - window.innerHeight;

    if (total <= 0) {
      return 0;
    }

    return Math.min(scrollY / total, 1);
  };

  return (
    <main className={s("landing-page")}>
      {/* =================================================
        NAVBAR
    ================================================= */}

      <header
        ref={navRef}
        className={s(`lp-navbar ${scrollY > 8 ? "lp-navbar--scrolled" : ""}`)}
      >
        {/* ---------- BRAND ---------- */}

        <div className={s("lp-navbar__brand")}>
          <img
            src={vecLogo}
            alt="Velammal Engineering College emblem"
            className={s("lp-navbar__logo")}
          />

          <div className={s("lp-navbar__college-domain")}>
            <span className={s("lp-navbar__college-name")}>VELAMMAL</span>
            <span className={s("lp-navbar__college-sub")}>ENGINEERING COLLEGE</span>
            <span className={s("lp-navbar__college-tagline")}>
              The Wheel of Knowledge rolls on!
            </span>
            <span className={s("lp-navbar__college-autonomous")}>
              (An Autonomous Institution)
            </span>
          </div>
        </div>

        {/* ---------- APP NAME (CENTERED) ---------- */}

        <span className={s("lp-navbar__app-name")}>
          VEC<span className={s("lp-navbar__app-name-accent")}>Connect</span>
        </span>

        {/* ---------- ACTION BUTTONS ---------- */}

        <div className={s("lp-navbar__actions")}>
          {/* LOGIN */}

          <button
            type="button"
            className={s("lp-navbar__login-btn")}
            onClick={() => navigate("/login")}
            aria-label="Log in"
          >
            <span className={s("lp-navbar__icon-solid")} aria-hidden="true">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M8 4H5.5C4.67 4 4 4.67 4 5.5V14.5C4 15.33 4.67 16 5.5 16H8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M12 13L16 10L12 7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                <path
                  d="M16 10H8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </span>

            <span className={s("lp-navbar__btn-label")}>Log in</span>
          </button>

          {/* REGISTER */}

          <button
            type="button"
            className={s("lp-navbar__register-btn")}
            onClick={() => navigate("/register")}
            aria-label="Register"
          >
            <span className={s("lp-navbar__icon-glass")} aria-hidden="true">
              <svg
                viewBox="0 0 20 20"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <circle
                  cx="8"
                  cy="7"
                  r="2.8"
                  stroke="currentColor"
                  strokeWidth="1.6"
                />

                <path
                  d="M3.5 16C3.5 13 5.6 11.3 8 11.3C10.4 11.3 12.5 13 12.5 16"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />

                <path
                  d="M15.5 6.5V11"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />

                <path
                  d="M13.3 8.75H17.7"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </span>

            <span className={s("lp-navbar__btn-label")}>Register</span>
          </button>
        </div>

        {/* ---------- SCROLL PROGRESS (ATTACHED DIRECTLY TO HEADER) ---------- */}
        <div
          className={s("scroll-progress")}
          style={{
            transform: `scaleX(${getScrollProgress()})`,
          }}
        />
      </header>

      {/* =================================================
        HERO
    ================================================= */}
      <section className={s("hero-section")} ref={heroRef}>
        <div
          className={s("hero-overlay")}
          style={{
            transform: `translateY(${scrollY * 0.25}px)`,
          }}
        />

        <div className={s("hero-particles")} aria-hidden="true">
          {Array.from({
            length: 14,
          }).map((_, i) => (
            <span
              key={i}
              className={s("particle")}
              style={{
                "--i": i,
              }}
            />
          ))}
        </div>

        <div
          className={s("landing-container hero-content")}
          style={{
            transform: `translateY(${scrollY * 0.12}px)`,
          }}
        >
          <div className={s("hero-label")}>
            <span></span>
            VEC ALUMNI NETWORK
          </div>

          <RevealHeading as="h1" direction="up">
            {(visible) => (
              <>
                <Words text="Connected by" visible={visible} startIndex={0} />
                <strong>
                  <Words text="Velammal." visible={visible} startIndex={2} />
                </strong>
              </>
            )}
          </RevealHeading>

          <p>
            A dedicated alumni community connecting graduates, students and the
            institution — building relationships that continue beyond college.
          </p>

          <div className={s("hero-buttons")}>
            <button
              className={s("hero-primary")}
              type="button"
              onClick={() => navigate("/register")}
            >
              JOIN THE ALUMNI NETWORK
              <span className={s("btn-arrow")}>
                <ArrowRight size={18} />
              </span>
            </button>
          </div>
        </div>

        <div className={s("hero-visual")} aria-hidden="true">
          <HeroCardStack items={heroAlumni} />
        </div>
      </section>

      {/* =================================================
          ABOUT
      ================================================= */}

      <section className={s("intro-section")} id="about">
        <div className={s("landing-container intro-grid")}>
          <Reveal className={s("section-heading")} as="div">
            <span className={s("section-tag")}>ABOUT THE NETWORK</span>

            <RevealHeading as="h2" direction="right">
              {(visible) => (
                <>
                  <Words text="One College." visible={visible} startIndex={0} />
                  <br />
                  <span>
                    <Words
                      text="Thousands of Stories."
                      visible={visible}
                      startIndex={2}
                    />
                  </span>
                </>
              )}
            </RevealHeading>

            <div className={s("heading-line")}></div>
          </Reveal>

          <Reveal className={s("intro-content")} delay={150}>
            <p className={s("intro-large")}>
              The VEC Alumni Network brings together graduates from different
              batches, departments and generations under one connected
              community.
            </p>

            <p>
              Stay connected with your classmates, discover professional
              opportunities, participate in alumni events and continue
              contributing to the institution that shaped your journey.
            </p>

            <button
              className={s("text-button")}
              type="button"
              onClick={() => navigate("/register")}
            >
              BECOME A MEMBER
              <span className={s("btn-arrow")}>
                <ArrowRight size={18} />
              </span>
            </button>
          </Reveal>
        </div>
      </section>
      {/* =================================================
          AWARDS / NOMINATIONS
      ================================================= */}

      <section className={s("awards-section")} id="awards">
        <div className={s("landing-container")}>
          <Reveal className={s("center-heading")}>
            <span className={s("section-tag")}>NOMINATIONS OPEN — 2025</span>

            <RevealHeading as="h2" direction="up">
              {(visible) => (
                <>
                  <Words
                    text="Nominations are invited"
                    visible={visible}
                    startIndex={0}
                  />
                  <span>
                    {" "}
                    <Words
                      text="from alumni."
                      visible={visible}
                      startIndex={3}
                    />
                  </span>
                </>
              )}
            </RevealHeading>

            <p>
              We recognize our great minds cultivated by Velammal who leap above
              and beyond in their domain and inspire the young hearts to grow
              agile, by awarding them in the following categories.
            </p>
          </Reveal>

          <div className={s("awards-grid")}>
            <Reveal as={TiltCard} className={s("award-card")}>
              <div className={s("award-icon")}>
                <Trophy size={28} />
              </div>
              <h3>Placement Icon Award</h3>
              <p>Honoring outstanding placement achievements.</p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSeE7HuWIO8IKZCds9yWoczTmnEDj-BOCcwECAK0V163DY1CAw/viewform?vc=0&c=0&w=1&flr=0"
                target="_blank"
                rel="noopener noreferrer"
              >
                NOMINATE <ArrowRight size={13} />
              </a>
            </Reveal>

            <Reveal as={TiltCard} className={s("award-card")} delay={80}>
              <div className={s("award-icon")}>
                <Rocket size={28} />
              </div>
              <h3>Emerging Entrepreneur Award</h3>
              <p>Celebrating alumni building bold new ventures.</p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScHI8hXutr0Z-gAWd-PEEvk2cMDtpbhDwrfBXQ0oFNSYvCx5w/viewform?vc=0&c=0&w=1&flr=0"
                target="_blank"
                rel="noopener noreferrer"
              >
                NOMINATE <ArrowRight size={13} />
              </a>
            </Reveal>

            <Reveal as={TiltCard} className={s("award-card")} delay={160}>
              <div className={s("award-icon")}>
                <Star size={28} />
              </div>
              <h3>Path Breaker Award</h3>
              <p>Recognizing those who forged new paths in their field.</p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLScjLiVQJ-mf5nR4epofh7A4BoVvAUalt8zKivSM3bU66_i-VQ/viewform?vc=0&c=0&w=1&flr=0"
                target="_blank"
                rel="noopener noreferrer"
              >
                NOMINATE <ArrowRight size={13} />
              </a>
            </Reveal>

            <Reveal as={TiltCard} className={s("award-card")} delay={240}>
              <div className={s("award-icon")}>
                <Target size={28} />
              </div>
              <h3>Optimal Pursuer Award</h3>
              <p>For alumni pursuing excellence with focus and discipline.</p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSesrerOBVQa50iyDH19RTeNBkYud3MZJgWJscQvr0Oa-3ihUg/viewform?vc=0&c=0&w=1&flr=0"
                target="_blank"
                rel="noopener noreferrer"
              >
                NOMINATE <ArrowRight size={13} />
              </a>
            </Reveal>

            <Reveal as={TiltCard} className={s("award-card")} delay={320}>
              <div className={s("award-icon")}>
                <Heart size={28} />
              </div>
              <h3>Humanitarian Award</h3>
              <p>Honoring alumni giving back to society and community.</p>
              <a
                href="https://docs.google.com/forms/d/e/1FAIpQLSes17JYKJifNfQGsHxSyoIi7d5YrKm4NGZpN6rT_A_Pvxim7w/viewform?vc=0&c=0&w=1&flr=0"
                target="_blank"
                rel="noopener noreferrer"
              >
                NOMINATE <ArrowRight size={13} />
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =================================================
          ALUMNI CELL OVERVIEW + VISION
      ================================================= */}

      <section className={s("overview-section")} id="overview">
        <div className={s("landing-container overview-grid")}>
          <Reveal className={s("overview-block")}>
            <span className={s("section-tag")}>ALUMNI CELL OVERVIEW</span>

            <RevealHeading as="h2" direction="right">
              {(visible) => (
                <>
                  <Words
                    text="Building lifelong"
                    visible={visible}
                    startIndex={0}
                  />
                  <br />
                  <span>
                    <Words
                      text="connections."
                      visible={visible}
                      startIndex={2}
                    />
                  </span>
                </>
              )}
            </RevealHeading>

            <div className={s("heading-line")}></div>

            <p>
              The VEC Alumni Cell fosters relationships between alumni, students
              and the institution, nurturing lifelong connections and mutual
              growth. It plays a crucial role in engaging alumni, leveraging
              their expertise and strengthening institutional ties for the
              benefit of current students and the alma mater.
            </p>
          </Reveal>

          <Reveal className={s("vision-card")} delay={150}>
            <span className={s("vision-card-tag")}>OUR VISION</span>
            <p>
              To establish a strong, lifelong bond between the institution and
              its alumni, fostering a mutually beneficial relationship that
              enhances professional growth, knowledge sharing and institutional
              development.
            </p>
          </Reveal>
        </div>
      </section>

      {/* =================================================
          MISSION & OBJECTIVES
      ================================================= */}

      <section className={s("mission-section")}>
        <div className={s("landing-container")}>
          <Reveal className={s("center-heading")}>
            <span className={s("section-tag")}>WHAT DRIVES US</span>

            <RevealHeading as="h2" direction="up">
              {(visible) => (
                <>
                  <Words text="Mission &" visible={visible} startIndex={0} />
                  <span>
                    {" "}
                    <Words
                      text="Objectives."
                      visible={visible}
                      startIndex={2}
                    />
                  </span>
                </>
              )}
            </RevealHeading>
          </Reveal>

          <div className={s("mission-grid")}>
            <Reveal className={s("mission-panel")}>
              <h3>Mission</h3>
              <ul className={s("mission-list")}>
                <li>
                  To build a dynamic and engaged alumni network that contributes
                  to the academic and career growth of current students.
                </li>
                <li>
                  To facilitate mentorship programs, networking opportunities
                  and industry collaborations through alumni involvement.
                </li>
                <li>
                  To organize events and initiatives that strengthen
                  alumni-institution relationships.
                </li>
                <li>
                  To create a platform for alumni to contribute to institutional
                  growth through knowledge sharing, placements and corporate
                  connections.
                </li>
              </ul>
            </Reveal>

            <Reveal className={s("mission-panel")} delay={150}>
              <h3>Objectives of the Alumni Cell</h3>
              <ul className={s("mission-list")}>
                <li>
                  <strong>Strengthening Alumni Network</strong> — To create and
                  maintain a strong bond among alumni, faculty and current
                  students.
                </li>
                <li>
                  <strong>Mentorship &amp; Career Support</strong> — To provide
                  guidance, career counseling and professional mentorship to
                  students and recent graduates.
                </li>
                <li>
                  <strong>Industry Collaboration</strong> — To leverage alumni
                  expertise for guest lectures, workshops, internships and job
                  opportunities.
                </li>
                <li>
                  <strong>Institutional Growth &amp; Development</strong> — To
                  contribute to the institution's progress through feedback,
                  donations and infrastructure support.
                </li>
                <li>
                  <strong>Reunions &amp; Networking Events</strong> — To
                  organize meetups, reunions and networking sessions for alumni
                  to reconnect and collaborate.
                </li>
                <li>
                  <strong>Academic &amp; Research Contributions</strong> — To
                  support research, knowledge sharing and industry-academic
                  collaborations.
                </li>
              </ul>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <section className={s("stats-section")}>
        <div className={s("stats-glow")} aria-hidden="true" />

        <div className={s("landing-container stats-grid")}>
          <Stat
            target={stats.yearsOfExcellence || 25}
            suffix="+"
            label="YEARS OF EXCELLENCE"
          />

          <Stat
            target={stats.alumniCount || 10}
            suffix={stats.alumniSuffix || "K+"}
            label="ALUMNI COMMUNITY"
          />

          <Stat
            target={stats.departmentsCount || 20}
            suffix="+"
            label="DEPARTMENTS & PROGRAMMES"
          />

          <Stat
            target={stats.eventsCount || 50}
            suffix="+"
            label="ALUMNI EVENTS"
          />
        </div>
      </section>

      {/* =================================================
          ALUMNI SERVICES
      ================================================= */}

      <section className={s("features-section")}>
        <div className={s("landing-container")}>
          <Reveal className={s("center-heading")}>
            <span className={s("section-tag")}>ALUMNI SERVICES</span>
            <RevealHeading as="h2" direction="left">
              {(visible) => (
                <>
                  <Words
                    text="Everything you need,"
                    visible={visible}
                    startIndex={0}
                  />
                  <span>
                    {" "}
                    <Words
                      text="in one place."
                      visible={visible}
                      startIndex={3}
                    />
                  </span>
                </>
              )}
            </RevealHeading>
            <p>
              Stay informed, connected and involved with the VEC alumni
              community.
            </p>
          </Reveal>

          <div className={s("features-grid")}>
            <Reveal as={TiltCard} className={s("feature-card")}>
              <div className={s("feature-number")}>01</div>
              <div className={s("feature-icon-box")}>
                <span>
                  <Users size={24} />
                </span>
              </div>
              <h3>Alumni Directory</h3>
              <p>
                Discover and connect with alumni across different batches,
                departments and industries.
              </p>
              <button type="button" onClick={() => navigate("/register")}>
                EXPLORE DIRECTORY <ArrowRight size={14} />
              </button>
              <div className={s("feature-card-bar")} />
            </Reveal>

            <Reveal as={TiltCard} className={s("feature-card")} delay={100}>
              <div className={s("feature-number")}>02</div>
              <div className={s("feature-icon-box")}>
                <span>
                  <GraduationCap size={24} />
                </span>
              </div>
              <h3>Career & Mentorship</h3>
              <p>
                Connect students and alumni through mentorship, career guidance
                and opportunities.
              </p>
              <button
                type="button"
                onClick={() => scrollToSection("mentorship")}
              >
                FIND OPPORTUNITIES <ArrowRight size={14} />
              </button>
              <div className={s("feature-card-bar")} />
            </Reveal>

            <Reveal as={TiltCard} className={s("feature-card")} delay={200}>
              <div className={s("feature-number")}>03</div>
              <div className={s("feature-icon-box")}>
                <span>
                  <Calendar size={24} />
                </span>
              </div>
              <h3>Alumni Events</h3>
              <p>
                Participate in reunions, networking events, workshops and
                institutional activities.
              </p>
              <button type="button" onClick={() => scrollToSection("events")}>
                VIEW EVENTS <ArrowRight size={14} />
              </button>
              <div className={s("feature-card-bar")} />
            </Reveal>

            <Reveal as={TiltCard} className={s("feature-card")} delay={300}>
              <div className={s("feature-number")}>04</div>
              <div className={s("feature-icon-box")}>
                <span>
                  <Landmark size={24} />
                </span>
              </div>
              <h3>Give Back to VEC</h3>
              <p>
                Support students and contribute to the continued growth of the
                institution.
              </p>
              <button type="button" onClick={() => navigate("/register")}>
                GET INVOLVED <ArrowRight size={14} />
              </button>
              <div className={s("feature-card-bar")} />
            </Reveal>
          </div>
        </div>
      </section>

      {/* =================================================
          ALUMNI ROLLING SHOWCASE
      ================================================= */}

      <section className={s("directory-section alumni-showcase")} id="directory">
        <div className={s("landing-container")}>
          <Reveal className={s("alumni-showcase-heading")}>
            <span className={s("section-tag")}>OUR ALUMNI</span>

            <RevealHeading as="h2" direction="down">
              {(visible) => (
                <Words
                  text="From VEC to the world."
                  visible={visible}
                  startIndex={0}
                />
              )}
            </RevealHeading>

            <p>
              Meet the alumni building careers, companies and ideas across
              industries around the world.
            </p>
          </Reveal>

          <div className={s("alumni-rolling-wrapper")}>
            {/* ROW 1 */}
            <div className={s("alumni-marquee")}>
              <div className={s("alumni-marquee-track")}>
                {filledRow1.map((al, idx) => (
                  <AlumniRollingCard
                    key={`r1-${idx}-${al.id || idx}`}
                    image={al.image}
                    name={al.name}
                    role={al.role}
                  />
                ))}

                {/* DUPLICATE FOR INFINITE LOOP */}
                {filledRow1.map((al, idx) => (
                  <AlumniRollingCard
                    key={`r1-dup-${idx}-${al.id || idx}`}
                    image={al.image}
                    name={al.name}
                    role={al.role}
                  />
                ))}
              </div>
            </div>

            {/* ROW 2 */}
            <div className={s("alumni-marquee alumni-marquee-reverse")}>
              <div className={s("alumni-marquee-track")}>
                {filledRow2.map((al, idx) => (
                  <AlumniRollingCard
                    key={`r2-${idx}-${al.id || idx}`}
                    image={al.image}
                    name={al.name}
                    role={al.role}
                  />
                ))}

                {/* DUPLICATE FOR INFINITE LOOP */}
                {filledRow2.map((al, idx) => (
                  <AlumniRollingCard
                    key={`r2-dup-${idx}-${al.id || idx}`}
                    image={al.image}
                    name={al.name}
                    role={al.role}
                  />
                ))}
              </div>
            </div>

            {/* ROW 3 */}
            <div className={s("alumni-marquee")}>
              <div className={s("alumni-marquee-track alumni-marquee-slow")}>
                {filledRow3.map((al, idx) => (
                  <AlumniRollingCard
                    key={`r3-${idx}-${al.id || idx}`}
                    image={al.image}
                    name={al.name}
                    role={al.role}
                  />
                ))}

                {/* DUPLICATE FOR INFINITE LOOP */}
                {filledRow3.map((al, idx) => (
                  <AlumniRollingCard
                    key={`r3-dup-${idx}-${al.id || idx}`}
                    image={al.image}
                    name={al.name}
                    role={al.role}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className={s("alumni-showcase-footer")}>
            <span></span>

            <button type="button" onClick={() => navigate("/register")}>
              EXPLORE ALUMNI NETWORK
              <span className={s("btn-arrow")}>
                <ArrowRight size={18} />
              </span>
            </button>

            <span></span>
          </div>
        </div>
      </section>

      {/* =================================================
          EVENTS
      ================================================= */}

      <section className={s("events-section")} id="events">
        <div className={s("landing-container")}>
          <Reveal className={s("events-header")}>
            <div>
              <span className={s("section-tag")}>WHAT'S HAPPENING</span>
              <RevealHeading as="h2" direction="right">
                {(visible) => (
                  <>
                    <Words text="Alumni" visible={visible} startIndex={0} />{" "}
                    <span>
                      <Words text="Events" visible={visible} startIndex={1} />
                    </span>
                  </>
                )}
              </RevealHeading>
            </div>
            <button
              type="button"
              className={s("text-button")}
              onClick={() => navigate("/register")}
            >
              VIEW ALL EVENTS
              <span className={s("btn-arrow")}>
                <ArrowRight size={18} />
              </span>
            </button>
          </Reveal>
        </div>

        {/* Full-width scrolling track */}
        <div className={s("events-marquee-outer")}>
          <div className={s("events-marquee-track")}>
            {displayEvents.map((ev, i) => (
              <EventCard key={`ev-${i}-${ev.id || i}`} ev={ev} />
            ))}

            {/* duplicates for seamless infinite loop */}
            {displayEvents.map((ev, i) => (
              <EventCard key={`ev-dup-${i}-${ev.id || i}`} ev={ev} />
            ))}
          </div>

          {/* Right fade shadow */}
          <div className={s("events-marquee-shadow")} />
        </div>
      </section>

      {/* =================================================
          ACHIEVEMENTS
      ================================================= */}

      <section className={s("achievement-section")}>
        <div className={s("landing-container")}>
          <Reveal className={s("center-heading")}>
            <span className={s("section-tag")}>ALUMNI ACHIEVEMENTS</span>

            <RevealHeading as="h2" direction="up">
              {(visible) => (
                <>
                  <Words
                    text="Different journeys."
                    visible={visible}
                    startIndex={0}
                  />{" "}
                  <span>
                    <Words
                      text="One legacy."
                      visible={visible}
                      startIndex={2}
                    />
                  </span>
                </>
              )}
            </RevealHeading>
          </Reveal>

          <div className={s("achievement-grid")}>
            <Reveal className={s("achievement-card")}>
              <span>
                <Trophy size={30} />
              </span>
              <strong>Entrepreneurs</strong>
              <small>Building businesses</small>
            </Reveal>

            <Reveal className={s("achievement-card")} delay={80}>
              <span>
                <Rocket size={30} />
              </span>
              <strong>Startup Founders</strong>
              <small>Creating new ideas</small>
            </Reveal>

            <Reveal className={s("achievement-card")} delay={160}>
              <span>
                <Laptop size={30} />
              </span>
              <strong>Technology Leaders</strong>
              <small>Driving innovation</small>
            </Reveal>

            <Reveal className={s("achievement-card")} delay={240}>
              <span>
                <Microscope size={30} />
              </span>
              <strong>Researchers</strong>
              <small>Expanding knowledge</small>
            </Reveal>

            <Reveal className={s("achievement-card")} delay={320}>
              <span>
                <GraduationCap size={28} />
              </span>
              <strong>Higher Studies</strong>
              <small>Learning globally</small>
            </Reveal>

            <Reveal className={s("achievement-card")} delay={400}>
              <span>
                <Medal size={30} />
              </span>
              <strong>Public Service</strong>
              <small>Serving society</small>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =================================================
          MOBILE APP PROMOTION
      ================================================= */}

      <section className={s("app-section")}>
        <div className={s("landing-container app-grid")}>
          <Reveal className={s("app-content")}>
            <span className={s("section-tag")}>ALUMNI ON MOBILE</span>

            <RevealHeading as="h2" direction="left">
              {(visible) => (
                <>
                  <Words
                    text="Your alumni network,"
                    visible={visible}
                    startIndex={0}
                  />
                  <span>
                    {" "}
                    <Words text="anywhere." visible={visible} startIndex={3} />
                  </span>
                </>
              )}
            </RevealHeading>

            <p>
              Connect with classmates, discover opportunities, join events and
              stay connected directly from your phone.
            </p>

            <div className={s("app-buttons")}>
              <button type="button">
                <span>
                  <PlayCircle size={20} />
                </span>
                <div>
                  <small>COMING SOON ON</small>
                  <strong>Google Play</strong>
                </div>
              </button>

              <button type="button">
                <span>
                  <Apple size={20} />
                </span>
                <div>
                  <small>COMING SOON ON</small>
                  <strong>App Store</strong>
                </div>
              </button>
            </div>
          </Reveal>

          <Reveal className={s("phone-mockup")} delay={150}>
            <div className={s("phone-frame")}>
              <div className={s("phone-notch")}></div>

              <div className={s("phone-screen")}>
                <div className={s("phone-header")}>
                  VEC
                  <span>●</span>
                </div>

                <div className={s("phone-welcome")}>
                  <small>WELCOME BACK</small>

                  <strong>Alumni Network</strong>
                </div>

                <div className={s("phone-stat-row")}>
                  <div>
                    <strong>10K+</strong>
                    <small>Alumni</small>
                  </div>

                  <div>
                    <strong>50+</strong>
                    <small>Events</small>
                  </div>
                </div>

                <div className={s("phone-card")}>
                  <Users size={16} />
                  <span>Find Alumni</span>→
                </div>

                <div className={s("phone-card")}>
                  <Briefcase size={16} />
                  <span>Career Opportunities</span>→
                </div>

                <div className={s("phone-card")}>
                  <GraduationCap size={16} />
                  <span>Find a Mentor</span>→
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* =================================================
          FOOTER
      ================================================= */}

      <footer id="footer" className={s("lp-footer")}>
        {/* ---------- CONTACT DETAILS ---------- */}
        <div className={s("lp-footer-contact")}>
          <div className={s("lp-footer-contact-inner")}>
            <div className={s("lp-footer-address-block")}>
              <h3>Contact Address</h3>
              <p className={s("lp-footer-address")}>
                Velammal Engineering College (Autonomous)
                <br />
                (Unit of Velammal Educational Trust),
                <br />
                Ambattur Red-hills Road, Surapet,
                <br />
                Chennai – 600 066. Tamil Nadu, India.
              </p>
            </div>

            <div className={s("lp-footer-contact-info")}>
              <p>
                Contact: <a href="tel:04426590758">044 26590758</a>
              </p>
              <p>
                Student Affairs: <a href="tel:04426591771">044 26591771</a>
              </p>
              <p>
                For Admissions: <a href="tel:9123547550">9123547550</a>,{" "}
                <a href="tel:8939221120">8939221120</a>
              </p>

              <div>
                <a
                  href="/Term_and_Conditions"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s("lp-footer-privacy")}
                >
                  Privacy, Terms and Conditions
                </a>
              </div>

              <div className={s("lp-footer-socials")}>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                >
                  <InstagramIcon width={26} height={26} />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                >
                  <LinkedinIcon width={26} height={26} />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Twitter"
                >
                  <TwitterIcon width={26} height={26} />
                </a>
                <a
                  href="#"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                >
                  <FacebookIcon width={26} height={26} />
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* ---------- QUICK LINKS ---------- */}
        <div className={s("lp-footer-quick")}>
          <h3>Quick Links</h3>

          <div className={s("lp-footer-quick-grid")}>
            {/* Profile */}
            <div>
              <h4 className={s("lp-quick-head")}>Profile</h4>
              <ul>
                <li>
                  <Link to="/abt-us">About Us</Link>
                </li>
                <li>
                  <Link to="/abt-yr">AISHE</Link>
                </li>
                <li>
                  <Link to="/Accredation" state={{ section: "NBA" }}>
                    NBA
                  </Link>
                </li>
                <li>
                  <Link to="/Accredation" state={{ section: "NAAC" }}>
                    NAAC
                  </Link>
                </li>
                <li>
                  <Link to="/Accredation" state={{ section: "NIRF" }}>
                    NIRF
                  </Link>
                </li>
                <li>
                  <Link to="/Accredation" state={{ section: "QS Rating" }}>
                    QS Rating
                  </Link>
                </li>
                <li>
                  <Link to="/iic">IIC</Link>
                </li>
              </ul>
            </div>

            {/* Academics */}
            <div>
              <h4 className={s("lp-quick-head")}>Academics</h4>
              <ul>
                <li>
                  <a href="/departments">Departments</a>
                </li>
                <li>
                  <a href="/programs">Programmes</a>
                </li>
                <li>
                  <a href="/library">Library</a>
                </li>
                <li>
                  <a href="/nss">NSS</a>
                </li>
                <li>
                  <a href="/ncc">NCC</a>
                </li>
                <li>
                  <a href="/yrc">YRC</a>
                </li>
                <li>
                  <a href="/sports">Sports</a>
                </li>
              </ul>
            </div>

            {/* Important */}
            <div>
              <h4 className={s("lp-quick-head")}>Important</h4>
              <ul>
                <li>
                  <a
                    href="https://vecchennai.org/studentlogin/login.php?done=/studentlogin/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Student Login
                  </a>
                </li>
                <li>
                  <a
                    href="https://vecchennai.org/stafflogin/login.php?done=/stafflogin/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Faculty Login
                  </a>
                </li>
                <li>
                  <a
                    href="https://easycollege.in/vecengg/college/webpayindex.aspx"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Fees Payment
                  </a>
                </li>
                <li>
                  <a href="/grievances">Grievances</a>
                </li>
                <li>
                  <a href="/admin_auth">Login</a>
                </li>
                <li>
                  <a href="/careers">Careers</a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* ---------- MAP ---------- */}
        <div className={s("lp-footer-map")}>
          <div className={s("lp-footer-map-header")}>
            <h3>Campus Location</h3>
            <a
              href="https://maps.google.com/?cid=12408375836417538687"
              target="_blank"
              rel="noopener noreferrer"
              className={s("lp-footer-map-link")}
            >
              View Full Map ↗
            </a>
          </div>
          <iframe
            title="Google Maps"
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1757.9530530830932!2d80.19081618175407!3d13.149609328912868!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5264a10c856599%3A0xac3348f41097ba7f!2sVelammal%20Engineering%20College!5e1!3m2!1sen!2sin!4v1723700873764!5m2!1sen!2sin"
            width="100%"
            height="290"
            style={{ border: 0, width: "100%" }}
            allowFullScreen
            loading="lazy"
          />
        </div>

        {/* ---------- COPYRIGHT ---------- */}
        <div className={s("lp-footer-bottom")}>
          <p>
            <a href="https://velammal.edu.in/webteam" rel="noopener noreferrer">
              © WebOps VEC
            </a>
            , Velammal Engineering College, Chennai
          </p>
        </div>
      </footer>
    </main>
  );
}

export default LandingPage;
