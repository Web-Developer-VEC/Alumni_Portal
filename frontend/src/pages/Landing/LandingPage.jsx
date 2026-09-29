import React, {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  useCallback,
} from "react";
import { useNavigate, Link } from "react-router-dom";
import "./LandingPage.css";
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

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setVisible(true);
          observer.unobserve(node);
        }
      },
      {
        threshold,
        rootMargin: "0px 0px -60px 0px",
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
      className={`reveal ${visible ? "is-visible" : ""} ${className}`}
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
      className={`tilt-card ${className}`}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      <span className="tilt-glow" aria-hidden="true" />

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
          className={`reveal-word ${visible ? "is-visible" : ""}`}
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
      className={`word-stagger word-stagger-${direction} ${className}`}
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
      className={`stat-item reveal ${visible ? "is-visible" : ""}`}
    >
      <strong className="stat-number">
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
    <div className="hero-carousel">
      <div className="hero-carousel-stage" aria-hidden="true">
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
              className={`hero-carousel-card ${isFront ? "is-front" : ""}`}
              style={cardStyle}
              key={person.id || i}
            >
              <img src={person.image} alt={person.name} loading="lazy" />
            </div>
          );
        })}
      </div>

      <div className="hero-carousel-label">
        <strong>{front.name}</strong>
        <div className="hero-carousel-label-meta">
          <span>{front.batch}</span>
          <span className="hero-carousel-dot" />
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
    <article className="alumni-rolling-card">
      <div className="alumni-photo-wrapper">
        <img src={image} alt={name} className="alumni-photo" loading="lazy" />

        <span className="alumni-live-dot"></span>
      </div>

      <div className="alumni-rolling-info">
        <h3>{name}</h3>

        <p>{role}</p>
      </div>

      <span className="alumni-card-arrow">↗</span>
    </article>
  );
}

/* =================================================
   DISCUSSION CARD
================================================= */

function DiscussionCard({ initials, name, time, message, replies, likes }) {
  return (
    <Reveal as={TiltCard} className="discussion-card">
      <div className="discussion-avatar">{initials}</div>

      <div className="discussion-body">
        <div className="discussion-meta">
          <strong>{name}</strong>
          <span>{time}</span>
        </div>

        <p>{message}</p>

        <div className="discussion-actions">
          <span className="discussion-stat">
            <MessageCircle size={13} /> {replies} Replies
          </span>
          <span className="discussion-stat">
            <Heart size={13} /> {likes} Likes
          </span>
          <span className="discussion-cta">View Thread →</span>
        </div>
      </div>
    </Reveal>
  );
}

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
  const [heroAlumni, setHeroAlumni] = useState([]);
  const [showcaseAlumni, setShowcaseAlumni] = useState([]);
  const [events, setEvents] = useState([]);

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
        if (Array.isArray(data?.heroAlumni)) {
          setHeroAlumni(data.heroAlumni);
        }
        if (Array.isArray(data?.showcaseAlumni)) {
          setShowcaseAlumni(data.showcaseAlumni);
        }
        if (Array.isArray(data?.events)) {
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

    <main className="landing-page">
      {/* =================================================
        NAVBAR
    ================================================= */}

      <header
        ref={navRef}
        className={`lp-navbar ${scrollY > 8 ? "lp-navbar--scrolled" : ""}`}
      >
        {/* ---------- BRAND ---------- */}

        <div className="lp-navbar__brand">
          <img
            src={vecLogo}
            alt="Velammal Engineering College emblem"
            className="lp-navbar__logo"
          />

          <div className="lp-navbar__college-domain">
            <span className="lp-navbar__college-name">VELAMMAL</span>
            <span className="lp-navbar__college-sub">ENGINEERING COLLEGE</span>
            <span className="lp-navbar__college-tagline">
              The Wheel of Knowledge rolls on!
            </span>
            <span className="lp-navbar__college-autonomous">
              (An Autonomous Institution)
            </span>
          </div>
        </div>

        {/* ---------- APP NAME (CENTERED) ---------- */}

        <span className="lp-navbar__app-name">
          VEC<span className="lp-navbar__app-name-accent">Connect</span>
        </span>

        {/* ---------- ACTION BUTTONS ---------- */}

        <div className="lp-navbar__actions">
          {/* LOGIN */}

          <button
            type="button"
            className="lp-navbar__login-btn"
            onClick={() => navigate("/login")}
            aria-label="Log in"
          >
            <span className="lp-navbar__icon-solid" aria-hidden="true">
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

            <span className="lp-navbar__btn-label">Log in</span>
          </button>

          {/* REGISTER */}

          <button
            type="button"
            className="lp-navbar__register-btn"
            onClick={() => navigate("/register")}
            aria-label="Register"
          >
            <span className="lp-navbar__icon-glass" aria-hidden="true">
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

            <span className="lp-navbar__btn-label">Register</span>
          </button>
        </div>
      </header>

      {/* =================================================
        SCROLL PROGRESS
    ================================================= */}

      <div
        className="scroll-progress"
        style={{
          transform: `scaleX(${getScrollProgress()})`,
        }}
      />

      {/* =================================================
        HERO
    ================================================= */}
      <section className="hero-section" ref={heroRef}>
        <div
          className="hero-overlay"
          style={{
            transform: `translateY(${scrollY * 0.25}px)`,
          }}
        />

        <div className="hero-particles" aria-hidden="true">
          {Array.from({
            length: 14,
          }).map((_, i) => (
            <span
              key={i}
              className="particle"
              style={{
                "--i": i,
              }}
            />
          ))}
        </div>

        <div className="hero-visual" aria-hidden="true">
          <HeroCardStack items={heroAlumni} />
        </div>
        <div
          className="landing-container hero-content"
          style={{
            transform: `translateY(${scrollY * 0.12}px)`,
          }}
        >
          <div className="hero-label">
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

          <div className="hero-buttons">
            <button
              className="hero-primary"
              type="button"
              onClick={() => navigate("/register")}
            >
              JOIN THE ALUMNI NETWORK
              <span className="btn-arrow">
                <ArrowRight size={18} />
              </span>
            </button>

            <button
              className="hero-secondary"
              type="button"
              onClick={() => navigate("/register")}
            >
              EXPLORE NETWORK
            </button>
          </div>
        </div>
      </section>

      {/* =================================================
          ABOUT
      ================================================= */}

      <section className="intro-section" id="about">
        <div className="landing-container intro-grid">
          <Reveal className="section-heading" as="div">
            <span className="section-tag">ABOUT THE NETWORK</span>

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

            <div className="heading-line"></div>
          </Reveal>

          <Reveal className="intro-content" delay={150}>
            <p className="intro-large">
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
              className="text-button"
              type="button"
              onClick={() => navigate("/register")}
            >
              BECOME A MEMBER
              <span className="btn-arrow">
                <ArrowRight size={18} />
              </span>
            </button>
          </Reveal>
        </div>
      </section>
      {/* =================================================
          AWARDS / NOMINATIONS
      ================================================= */}

      <section className="awards-section" id="awards">
        <div className="landing-container">
          <Reveal className="center-heading">
            <span className="section-tag">NOMINATIONS OPEN — 2025</span>

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

          <div className="awards-grid">
            <Reveal as={TiltCard} className="award-card">
              <div className="award-icon">
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

            <Reveal as={TiltCard} className="award-card" delay={80}>
              <div className="award-icon">
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

            <Reveal as={TiltCard} className="award-card" delay={160}>
              <div className="award-icon">
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

            <Reveal as={TiltCard} className="award-card" delay={240}>
              <div className="award-icon">
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

            <Reveal as={TiltCard} className="award-card" delay={320}>
              <div className="award-icon">
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

      <section className="overview-section" id="overview">
        <div className="landing-container overview-grid">
          <Reveal className="overview-block">
            <span className="section-tag">ALUMNI CELL OVERVIEW</span>

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

            <div className="heading-line"></div>

            <p>
              The VEC Alumni Cell fosters relationships between alumni, students
              and the institution, nurturing lifelong connections and mutual
              growth. It plays a crucial role in engaging alumni, leveraging
              their expertise and strengthening institutional ties for the
              benefit of current students and the alma mater.
            </p>
          </Reveal>

          <Reveal className="vision-card" delay={150}>
            <span className="vision-card-tag">OUR VISION</span>
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

      <section className="mission-section">
        <div className="landing-container">
          <Reveal className="center-heading">
            <span className="section-tag">WHAT DRIVES US</span>

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

          <div className="mission-grid">
            <Reveal className="mission-panel">
              <h3>Mission</h3>
              <ul className="mission-list">
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

            <Reveal className="mission-panel" delay={150}>
              <h3>Objectives of the Alumni Cell</h3>
              <ul className="mission-list">
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

      <section className="stats-section">
        <div className="stats-glow" aria-hidden="true" />

        <div className="landing-container stats-grid">
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

      <section className="features-section">
        <div className="landing-container">
          <Reveal className="center-heading">
            <span className="section-tag">ALUMNI SERVICES</span>
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

          <div className="features-grid">
            <Reveal as={TiltCard} className="feature-card">
              <div className="feature-number">01</div>
              <div className="feature-icon-box">
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
              <div className="feature-card-bar" />
            </Reveal>

            <Reveal as={TiltCard} className="feature-card" delay={100}>
              <div className="feature-number">02</div>
              <div className="feature-icon-box">
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
              <div className="feature-card-bar" />
            </Reveal>

            <Reveal as={TiltCard} className="feature-card" delay={200}>
              <div className="feature-number">03</div>
              <div className="feature-icon-box">
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
              <div className="feature-card-bar" />
            </Reveal>

            <Reveal as={TiltCard} className="feature-card" delay={300}>
              <div className="feature-number">04</div>
              <div className="feature-icon-box">
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
              <div className="feature-card-bar" />
            </Reveal>
          </div>
        </div>
      </section>

      {/* =================================================
          ALUMNI ROLLING SHOWCASE
      ================================================= */}

      <section className="directory-section alumni-showcase" id="directory">
        <div className="landing-container">
          <Reveal className="alumni-showcase-heading">
            <span className="section-tag">OUR ALUMNI</span>

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

          <div className="alumni-rolling-wrapper">
            {/* ROW 1 */}
            <div className="alumni-marquee">
              <div className="alumni-marquee-track">
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
            <div className="alumni-marquee alumni-marquee-reverse">
              <div className="alumni-marquee-track">
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
            <div className="alumni-marquee">
              <div className="alumni-marquee-track alumni-marquee-slow">
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

          <div className="alumni-showcase-footer">
            <span></span>

            <button type="button" onClick={() => navigate("/register")}>
              EXPLORE ALUMNI NETWORK
              <span className="btn-arrow">
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

      <section className="events-section" id="events">
        <div className="landing-container">
          <Reveal className="events-header">
            <div>
              <span className="section-tag">WHAT'S HAPPENING</span>
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
              className="text-button"
              onClick={() => navigate("/register")}
            >
              VIEW ALL EVENTS
              <span className="btn-arrow">
                <ArrowRight size={18} />
              </span>
            </button>
          </Reveal>
        </div>

        {/* Full-width scrolling track */}
        <div className="events-marquee-outer">
          <div className="events-marquee-track">
            {displayEvents.map((ev, i) => (
              <article className="event-card" key={`ev-${i}-${ev.id || i}`}>
                <div className="event-date">
                  <strong>{ev.day}</strong>
                  <span>{ev.month}</span>
                </div>
                <div className="event-info">
                  <span className="event-type">{ev.category || "EVENT"}</span>
                  <h3>{ev.title}</h3>
                  <p>{ev.description}</p>
                  <span className="event-location">
                    <MapPin size={11} /> {ev.venue}
                  </span>
                </div>
              </article>
            ))}

            {/* ── duplicates for seamless infinite loop ── */}
            {displayEvents.map((ev, i) => (
              <article className="event-card" key={`ev-dup-${i}-${ev.id || i}`}>
                <div className="event-date">
                  <strong>{ev.day}</strong>
                  <span>{ev.month}</span>
                </div>
                <div className="event-info">
                  <span className="event-type">{ev.category || "EVENT"}</span>
                  <h3>{ev.title}</h3>
                  <p>{ev.description}</p>
                  <span className="event-location">
                    <MapPin size={11} /> {ev.venue}
                  </span>
                </div>
              </article>
            ))}
          </div>

          {/* Right fade shadow */}
          <div className="events-marquee-shadow" />
        </div>
      </section>

      {/* =================================================
          ACHIEVEMENTS
      ================================================= */}

      <section className="achievement-section">
        <div className="landing-container">
          <Reveal className="center-heading">
            <span className="section-tag">ALUMNI ACHIEVEMENTS</span>

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

          <div className="achievement-grid">
            <Reveal className="achievement-card">
              <span>
                <Trophy size={30} />
              </span>
              <strong>Entrepreneurs</strong>
              <small>Building businesses</small>
            </Reveal>

            <Reveal className="achievement-card" delay={80}>
              <span>
                <Rocket size={30} />
              </span>
              <strong>Startup Founders</strong>
              <small>Creating new ideas</small>
            </Reveal>

            <Reveal className="achievement-card" delay={160}>
              <span>
                <Laptop size={30} />
              </span>
              <strong>Technology Leaders</strong>
              <small>Driving innovation</small>
            </Reveal>

            <Reveal className="achievement-card" delay={240}>
              <span>
                <Microscope size={30} />
              </span>
              <strong>Researchers</strong>
              <small>Expanding knowledge</small>
            </Reveal>

            <Reveal className="achievement-card" delay={320}>
              <span>
                <GraduationCap size={28} />
              </span>
              <strong>Higher Studies</strong>
              <small>Learning globally</small>
            </Reveal>

            <Reveal className="achievement-card" delay={400}>
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

      <section className="app-section">
        <div className="landing-container app-grid">
          <Reveal className="app-content">
            <span className="section-tag">ALUMNI ON MOBILE</span>

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

            <div className="app-buttons">
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

          <Reveal className="phone-mockup" delay={150}>
            <div className="phone-frame">
              <div className="phone-notch"></div>

              <div className="phone-screen">
                <div className="phone-header">
                  VEC
                  <span>●</span>
                </div>

                <div className="phone-welcome">
                  <small>WELCOME BACK</small>

                  <strong>Alumni Network</strong>
                </div>

                <div className="phone-stat-row">
                  <div>
                    <strong>10K+</strong>
                    <small>Alumni</small>
                  </div>

                  <div>
                    <strong>50+</strong>
                    <small>Events</small>
                  </div>
                </div>

                <div className="phone-card">
                  <Users size={16} />
                  <span>Find Alumni</span>→
                </div>

                <div className="phone-card">
                  <Briefcase size={16} />
                  <span>Career Opportunities</span>→
                </div>

                <div className="phone-card">
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

      <footer id="footer" className="lp-footer">
        {/* ---------- CONTACT DETAILS ---------- */}
        <div className="lp-footer-contact">
          <div className="lp-footer-contact-inner">
            <div className="lp-footer-address-block">
              <h3>Contact Address</h3>
              <p className="lp-footer-address">
                Velammal Engineering College (Autonomous)
                <br />
                (Unit of Velammal Educational Trust),
                <br />
                Ambattur Red-hills Road, Surapet,
                <br />
                Chennai – 600 066. Tamil Nadu, India.
              </p>
            </div>

            <div className="lp-footer-contact-info">
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
                  className="lp-footer-privacy"
                >
                  Privacy, Terms and Conditions
                </a>
              </div>

              <div className="lp-footer-socials">
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

        {/* ---------- MAP ---------- */}
        <div className="lp-footer-map">
          <iframe
            title="Google Maps"
            src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1757.9530530830932!2d80.19081618175407!3d13.149609328912868!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3a5264a10c856599%3A0xac3348f41097ba7f!2sVelammal%20Engineering%20College!5e1!3m2!1sen!2sin!4v1723700873764!5m2!1sen!2sin"
            width="400"
            height="260"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
          />
        </div>

        {/* ---------- QUICK LINKS ---------- */}
        <div className="lp-footer-quick">
          <h3>Quick Links</h3>

          <div className="lp-footer-quick-grid">
            {/* Profile */}
            <div>
              <h4 className="lp-quick-head">Profile</h4>
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
              <h4 className="lp-quick-head">Academics</h4>
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
              <h4 className="lp-quick-head">Important</h4>
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

        {/* ---------- COPYRIGHT ---------- */}
        <div className="lp-footer-bottom">
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