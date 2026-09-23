import React, { useEffect, useRef, useState, useCallback } from "react";

import "./LandingPage.css";
import { navigate } from "../../App";

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
   CAPTCHA
========================================================= */

function generateQuickCaptcha() {
  return Math.floor(1000 + Math.random() * 9000);
}

/* =========================================================
   COMMUNITY FORM
========================================================= */

function CommunityQuickForm() {
  const [name, setName] = useState("");

  const [contactNumber, setContactNumber] = useState("");

  const [email, setEmail] = useState("");

  const [queryAbout, setQueryAbout] = useState("");

  const [category, setCategory] = useState("");

  const [content, setContent] = useState("");

  const [captcha, setCaptcha] = useState(generateQuickCaptcha());

  const [userCaptcha, setUserCaptcha] = useState("");

  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (userCaptcha !== captcha.toString()) {
      alert("Incorrect CAPTCHA, please try again.");

      setCaptcha(generateQuickCaptcha());

      setUserCaptcha("");

      return;
    }

    try {
      setLoading(true);

      const response = await fetch("/api/main-backend/get_grievance", {
        method: "POST",

        headers: {
          "Content-Type": "application/json",
        },

        credentials: "include",

        body: JSON.stringify({
          name,
          email,
          contact_number: contactNumber,
          query_about: queryAbout,
          category,
          content,
          original_captcha: captcha.toString(),
          entered_captcha: userCaptcha.toString(),
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("Message sent successfully. Our team will get back to you.");

        setName("");
        setContactNumber("");
        setEmail("");
        setQueryAbout("");
        setCategory("");
        setContent("");
        setUserCaptcha("");

        setCaptcha(generateQuickCaptcha());
      } else {
        alert(data.message || "Something went wrong. Please try again.");
      }
    } catch (err) {
      console.error("Community form submission error:", err);

      alert("Error connecting to the server. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="community-form" onSubmit={handleSubmit}>
      <div className="community-form-header">
        <div className="community-form-badge">
          <span className="form-badge-dot"></span>
          ALUMNI SUPPORT
        </div>

        <h3>
          Let's stay
          <span> connected.</span>
        </h3>

        <p>Have a question or need assistance? Send us a message.</p>
      </div>

      <div className="community-form-field">
        <label>Full Name</label>

        <div className="form-input-wrapper">
          <input
            type="text"
            placeholder="Your full name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="community-form-field">
        <label>Contact Number</label>

        <div className="form-input-wrapper">
          <input
            type="tel"
            placeholder="Your contact number"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="community-form-field">
        <label>Email Address</label>

        <div className="form-input-wrapper">
          <input
            type="email"
            placeholder="Your email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="community-form-row">
        <div className="community-form-field">
          <label>Query About</label>

          <div className="form-input-wrapper">
            <select
              value={queryAbout}
              onChange={(e) => setQueryAbout(e.target.value)}
              required
            >
              <option value="">Select Query About</option>

              <option value="Alumni Registration">Alumni Registration</option>

              <option value="Profile">Profile</option>

              <option value="Events">Events</option>

              <option value="Mentorship">Mentorship</option>

              <option value="Jobs">Jobs</option>

              <option value="Other">Other</option>
            </select>
          </div>
        </div>

        <div className="community-form-field">
          <label>Category</label>

          <div className="form-input-wrapper">
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              required
            >
              <option value="">Select category</option>

              <option value="General">General</option>

              <option value="Technical">Technical</option>

              <option value="Career">Career</option>

              <option value="Event">Event</option>

              <option value="Feedback">Feedback</option>
            </select>
          </div>
        </div>
      </div>

      <div className="community-form-field">
        <label>Your Message</label>

        <div className="form-input-wrapper textarea-wrapper">
          <textarea
            placeholder="Tell us how we can help..."
            rows="3"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
          />
        </div>
      </div>

      <div className="captcha-section">
        <div className="captcha-header">
          <span>SECURITY CHECK</span>

          <button
            type="button"
            className="captcha-refresh"
            onClick={() => {
              setCaptcha(generateQuickCaptcha());

              setUserCaptcha("");
            }}
          >
            ↻
          </button>
        </div>

        <div className="community-form-captcha-row">
          <div className="community-form-captcha">{captcha}</div>

          <div className="captcha-input-wrapper">
            <input
              type="text"
              placeholder="Enter Captcha"
              inputMode="numeric"
              value={userCaptcha}
              onChange={(e) => setUserCaptcha(e.target.value)}
              required
            />
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="community-form-submit"
        disabled={loading}
      >
        {loading ? "Sending..." : "Send Message"}
      </button>

      <div className="form-footer-note">
        🔒 Your information is securely submitted.
      </div>
    </form>
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
          💬 {replies} Replies · ❤ {likes} Likes
          <span>View Thread →</span>
        </div>
      </div>
    </Reveal>
  );
}

/* =========================================================
   MAIN LANDING PAGE
========================================================= */

function LandingPage() {
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
              onClick={() => navigate("/signup")}
            >
              JOIN THE ALUMNI NETWORK
              <span>→</span>
            </button>

            <button
              className="hero-secondary"
              type="button"
              onClick={() => scrollToSection("about")}
            >
              EXPLORE NETWORK
            </button>
          </div>
        </div>

        <div className="hero-scroll">
          <span></span>
          SCROLL TO EXPLORE
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
              onClick={() => navigate("/signup")}
            >
              BECOME A MEMBER
              <span>→</span>
            </button>
          </Reveal>
        </div>
      </section>

      {/* =================================================
          STATISTICS
      ================================================= */}

      <section className="stats-section">
        <div className="stats-glow" aria-hidden="true" />

        <div className="landing-container stats-grid">
          <Stat target={25} suffix="+" label="YEARS OF EXCELLENCE" />

          <Stat target={10} suffix="K+" label="ALUMNI COMMUNITY" />

          <Stat target={20} suffix="+" label="DEPARTMENTS & PROGRAMMES" />

          <Stat target={50} suffix="+" label="ALUMNI EVENTS" />
        </div>
      </section>

      {/* =================================================
          ALUMNI SERVICES
      ================================================= */}

      <section className="features-section">
        <div className="corner-br" />
        <div className="corner-gold-tl" />
        <div className="corner-gold-br" />

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
                <span>👥</span>
              </div>
              <h3>Alumni Directory</h3>
              <p>
                Discover and connect with alumni across different batches,
                departments and industries.
              </p>
              <button
                type="button"
                onClick={() => scrollToSection("directory")}
              >
                EXPLORE DIRECTORY →
              </button>
              <div className="feature-card-bar" />
            </Reveal>

            <Reveal as={TiltCard} className="feature-card" delay={100}>
              <div className="feature-number">02</div>
              <div className="feature-icon-box">
                <span>🎓</span>
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
                FIND OPPORTUNITIES →
              </button>
              <div className="feature-card-bar" />
            </Reveal>

            <Reveal as={TiltCard} className="feature-card" delay={200}>
              <div className="feature-number">03</div>
              <div className="feature-icon-box">
                <span>📅</span>
              </div>
              <h3>Alumni Events</h3>
              <p>
                Participate in reunions, networking events, workshops and
                institutional activities.
              </p>
              <button type="button" onClick={() => scrollToSection("events")}>
                VIEW EVENTS →
              </button>
              <div className="feature-card-bar" />
            </Reveal>

            <Reveal as={TiltCard} className="feature-card" delay={300}>
              <div className="feature-number">04</div>
              <div className="feature-icon-box">
                <span>🏛️</span>
              </div>
              <h3>Give Back to VEC</h3>
              <p>
                Support students and contribute to the continued growth of the
                institution.
              </p>
              <button type="button" onClick={() => navigate("/signup")}>
                GET INVOLVED →
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
                <>
                  <Words text="From VEC to" visible={visible} startIndex={0} />
                  <span>
                    {" "}
                    <Words
                      text=" the world."
                      visible={visible}
                      startIndex={3}
                    />
                  </span>
                </>
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
                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=12"
                  name="Arun Kumar"
                  role="Software Engineer"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=32"
                  name="Priya S"
                  role="Data Analyst"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=11"
                  name="Rahul V"
                  role="AI Engineer"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=47"
                  name="Keerthana R"
                  role="Product Designer"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=53"
                  name="Vignesh M"
                  role="Cloud Engineer"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=68"
                  name="Harish Kumar"
                  role="Full Stack Developer"
                />

                {/* DUPLICATE FOR INFINITE LOOP */}

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=12"
                  name="Arun Kumar"
                  role="Software Engineer"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=32"
                  name="Priya S"
                  role="Data Analyst"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=11"
                  name="Rahul V"
                  role="AI Engineer"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=47"
                  name="Keerthana R"
                  role="Product Designer"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=53"
                  name="Vignesh M"
                  role="Cloud Engineer"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=68"
                  name="Harish Kumar"
                  role="Full Stack Developer"
                />
              </div>
            </div>

            {/* ROW 2 */}
            <div className="alumni-marquee alumni-marquee-reverse">
              <div className="alumni-marquee-track">
                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=44"
                  name="Divya S"
                  role="Business Analyst"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=15"
                  name="Sanjay Kumar"
                  role="DevOps Engineer"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=25"
                  name="Nithya R"
                  role="HR Manager"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=60"
                  name="Karthik S"
                  role="Software Architect"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=35"
                  name="Swetha P"
                  role="UX Designer"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=51"
                  name="Adithya R"
                  role="Machine Learning Engineer"
                />

                {/* DUPLICATE */}

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=44"
                  name="Divya S"
                  role="Business Analyst"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=15"
                  name="Sanjay Kumar"
                  role="DevOps Engineer"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=25"
                  name="Nithya R"
                  role="HR Manager"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=60"
                  name="Karthik S"
                  role="Software Architect"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=35"
                  name="Swetha P"
                  role="UX Designer"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=51"
                  name="Adithya R"
                  role="Machine Learning Engineer"
                />
              </div>
            </div>

            {/* ROW 3 */}
            <div className="alumni-marquee">
              <div className="alumni-marquee-track alumni-marquee-slow">
                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=5"
                  name="Rohit K"
                  role="Product Manager"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=21"
                  name="Ananya M"
                  role="AI Researcher"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=58"
                  name="Gokul R"
                  role="Backend Engineer"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=31"
                  name="Meena S"
                  role="Marketing Lead"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=64"
                  name="Suresh V"
                  role="Cyber Security Engineer"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=9"
                  name="Aishwarya K"
                  role="Software Developer"
                />

                {/* DUPLICATE */}

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=5"
                  name="Rohit K"
                  role="Product Manager"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=21"
                  name="Ananya M"
                  role="AI Researcher"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=58"
                  name="Gokul R"
                  role="Backend Engineer"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=31"
                  name="Meena S"
                  role="Marketing Lead"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=64"
                  name="Suresh V"
                  role="Cyber Security Engineer"
                />

                <AlumniRollingCard
                  image="https://i.pravatar.cc/400?img=9"
                  name="Aishwarya K"
                  role="Software Developer"
                />
              </div>
            </div>
          </div>

          <div className="alumni-showcase-footer">
            <span></span>

            <button type="button" onClick={() => navigate("/signup")}>
              EXPLORE ALUMNI NETWORK
              <span>→</span>
            </button>

            <span></span>
          </div>
        </div>
      </section>

      {/* =================================================
          CAREER OPPORTUNITIES
      ================================================= */}

      <section className="career-section">
        <div className="landing-container">
          <Reveal className="center-heading">
            <span className="section-tag">CAREER OPPORTUNITIES</span>

            <RevealHeading as="h2" direction="up">
              {(visible) => (
                <>
                  <Words
                    text="Opportunities from"
                    visible={visible}
                    startIndex={0}
                  />
                  <span>
                    {" "}
                    <Words
                      text="your network."
                      visible={visible}
                      startIndex={2}
                    />
                  </span>
                </>
              )}
            </RevealHeading>

            <p>
              Discover jobs, internships and career opportunities shared by the
              alumni community.
            </p>
          </Reveal>

          <div className="career-grid">
            <Reveal as={TiltCard} className="career-card">
              <div className="career-top">
                <span className="career-type">FULL TIME</span>

                <span>2 DAYS AGO</span>
              </div>

              <h3>Software Engineer</h3>

              <p>
                Build scalable applications and work with modern technologies.
              </p>

              <div className="career-company">
                <strong>ZOHO</strong>

                <span>Chennai • Hybrid</span>
              </div>

              <button type="button" onClick={() => navigate("/signup")}>
                VIEW OPPORTUNITY →
              </button>
            </Reveal>

            <Reveal as={TiltCard} className="career-card" delay={100}>
              <div className="career-top">
                <span className="career-type">INTERNSHIP</span>

                <span>5 DAYS AGO</span>
              </div>

              <h3>Data Science Intern</h3>

              <p>Work on real-world analytics and machine learning projects.</p>

              <div className="career-company">
                <strong>TCS</strong>

                <span>Bengaluru • On-site</span>
              </div>

              <button type="button" onClick={() => navigate("/signup")}>
                VIEW OPPORTUNITY →
              </button>
            </Reveal>

            <Reveal as={TiltCard} className="career-card" delay={200}>
              <div className="career-top">
                <span className="career-type">FULL TIME</span>

                <span>1 WEEK AGO</span>
              </div>

              <h3>AI Engineer</h3>

              <p>Develop intelligent systems using machine learning and AI.</p>

              <div className="career-company">
                <strong>PRESIDIO</strong>

                <span>Chennai • Hybrid</span>
              </div>

              <button type="button" onClick={() => navigate("/signup")}>
                VIEW OPPORTUNITY →
              </button>
            </Reveal>
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
              onClick={() => navigate("/signup")}
            >
              VIEW ALL EVENTS
              <span>→</span>
            </button>
          </Reveal>
        </div>

        {/* Full-width scrolling track */}
        <div className="events-marquee-outer">
          <div className="events-marquee-track">
            {/* ── your real cards ── */}
            <article className="event-card">
              <div className="event-date">
                <strong>15</strong>
                <span>MAR</span>
              </div>
              <div className="event-info">
                <span className="event-type">REUNION</span>
                <h3>VEC Alumni Meet</h3>
                <p>
                  Reconnect with classmates and revisit your college memories.
                </p>
                <span className="event-location">
                  📍 Velammal Engineering College
                </span>
              </div>
            </article>

            <article className="event-card">
              <div className="event-date">
                <strong>22</strong>
                <span>APR</span>
              </div>
              <div className="event-info">
                <span className="event-type">NETWORKING</span>
                <h3>Alumni Industry Connect</h3>
                <p>
                  Meet professionals from different industries and build
                  meaningful connections.
                </p>
                <span className="event-location">📍 Chennai</span>
              </div>
            </article>

            <article className="event-card">
              <div className="event-date">
                <strong>10</strong>
                <span>MAY</span>
              </div>
              <div className="event-info">
                <span className="event-type">MENTORSHIP</span>
                <h3>Alumni Mentorship Session</h3>
                <p>
                  Experienced alumni share career insights with the next
                  generation.
                </p>
                <span className="event-location">📍 Online</span>
              </div>
            </article>

            <article className="event-card">
              <div className="event-date">
                <strong>18</strong>
                <span>JUN</span>
              </div>
              <div className="event-info">
                <span className="event-type">WORKSHOP</span>
                <h3>Tech Skills Bootcamp</h3>
                <p>
                  Hands-on workshop covering the latest in AI, cloud and
                  full-stack development.
                </p>
                <span className="event-location">📍 Chennai</span>
              </div>
            </article>

            <article className="event-card">
              <div className="event-date">
                <strong>05</strong>
                <span>JUL</span>
              </div>
              <div className="event-info">
                <span className="event-type">REUNION</span>
                <h3>Department Batch Meetup</h3>
                <p>
                  Celebrate your department's legacy and reconnect with batch
                  mates.
                </p>
                <span className="event-location">
                  📍 Velammal Engineering College
                </span>
              </div>
            </article>

            <article className="event-card">
              <div className="event-date">
                <strong>20</strong>
                <span>AUG</span>
              </div>
              <div className="event-info">
                <span className="event-type">NETWORKING</span>
                <h3>Startup & Innovation Summit</h3>
                <p>
                  Alumni entrepreneurs pitch ideas and connect with investors
                  and mentors.
                </p>
                <span className="event-location">📍 Bengaluru</span>
              </div>
            </article>

            {/* ── duplicates for seamless infinite loop ── */}
            <article className="event-card">
              <div className="event-date">
                <strong>15</strong>
                <span>MAR</span>
              </div>
              <div className="event-info">
                <span className="event-type">REUNION</span>
                <h3>VEC Alumni Meet</h3>
                <p>
                  Reconnect with classmates and revisit your college memories.
                </p>
                <span className="event-location">
                  📍 Velammal Engineering College
                </span>
              </div>
            </article>

            <article className="event-card">
              <div className="event-date">
                <strong>22</strong>
                <span>APR</span>
              </div>
              <div className="event-info">
                <span className="event-type">NETWORKING</span>
                <h3>Alumni Industry Connect</h3>
                <p>
                  Meet professionals from different industries and build
                  meaningful connections.
                </p>
                <span className="event-location">📍 Chennai</span>
              </div>
            </article>

            <article className="event-card">
              <div className="event-date">
                <strong>10</strong>
                <span>MAY</span>
              </div>
              <div className="event-info">
                <span className="event-type">MENTORSHIP</span>
                <h3>Alumni Mentorship Session</h3>
                <p>
                  Experienced alumni share career insights with the next
                  generation.
                </p>
                <span className="event-location">📍 Online</span>
              </div>
            </article>

            <article className="event-card">
              <div className="event-date">
                <strong>18</strong>
                <span>JUN</span>
              </div>
              <div className="event-info">
                <span className="event-type">WORKSHOP</span>
                <h3>Tech Skills Bootcamp</h3>
                <p>
                  Hands-on workshop covering the latest in AI, cloud and
                  full-stack development.
                </p>
                <span className="event-location">📍 Chennai</span>
              </div>
            </article>

            <article className="event-card">
              <div className="event-date">
                <strong>05</strong>
                <span>JUL</span>
              </div>
              <div className="event-info">
                <span className="event-type">REUNION</span>
                <h3>Department Batch Meetup</h3>
                <p>
                  Celebrate your department's legacy and reconnect with batch
                  mates.
                </p>
                <span className="event-location">
                  📍 Velammal Engineering College
                </span>
              </div>
            </article>

            <article className="event-card">
              <div className="event-date">
                <strong>20</strong>
                <span>AUG</span>
              </div>
              <div className="event-info">
                <span className="event-type">NETWORKING</span>
                <h3>Startup & Innovation Summit</h3>
                <p>
                  Alumni entrepreneurs pitch ideas and connect with investors
                  and mentors.
                </p>
                <span className="event-location">📍 Bengaluru</span>
              </div>
            </article>
          </div>

          {/* Right fade shadow */}
          <div className="events-marquee-shadow" />
        </div>
      </section>
      {/* =========================
    MENTORSHIP NETWORK
========================= */}
      <section className="mentorship-section" id="mentorship">
        <div className="landing-container">
          <div className="mentorship-grid">
            {/* LEFT CONTENT */}
            <div className="mentorship-content">
              <div className="section-tag light">ALUMNI CONNECT</div>

              <h2>
                One campus.
                <span>Countless connections.</span>
              </h2>

              <p>
                Stay connected with the Velammal alumni community, discover
                professionals across industries, reconnect with your batchmates,
                and explore opportunities beyond the campus.
              </p>

              <button
                className="maroon-button"
                onClick={() => scrollToSection("directory")}
              >
                EXPLORE ALUMNI
                <span>→</span>
              </button>
            </div>

            {/* RIGHT VISUAL */}
            <div className="mentor-visual">
              <div className="mentor-orbit">
                {/* CENTER */}
                <div className="mentor-center">VEC</div>

                {/* ORBIT NODES */}
                <div className="mentor-node node-one">🎓</div>

                <div className="mentor-node node-two">💼</div>

                <div className="mentor-node node-three">🚀</div>

                <div className="mentor-node node-four">🤝</div>
              </div>
            </div>
          </div>
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
              <span>🏆</span>
              <strong>Entrepreneurs</strong>
              <small>Building businesses</small>
            </Reveal>

            <Reveal className="achievement-card" delay={80}>
              <span>🚀</span>
              <strong>Startup Founders</strong>
              <small>Creating new ideas</small>
            </Reveal>

            <Reveal className="achievement-card" delay={160}>
              <span>💻</span>
              <strong>Technology Leaders</strong>
              <small>Driving innovation</small>
            </Reveal>

            <Reveal className="achievement-card" delay={240}>
              <span>🔬</span>
              <strong>Researchers</strong>
              <small>Expanding knowledge</small>
            </Reveal>

            <Reveal className="achievement-card" delay={320}>
              <span>🎓</span>
              <strong>Higher Studies</strong>
              <small>Learning globally</small>
            </Reveal>

            <Reveal className="achievement-card" delay={400}>
              <span>🏅</span>
              <strong>Public Service</strong>
              <small>Serving society</small>
            </Reveal>
          </div>
        </div>
      </section>

      {/* =================================================
          COMMUNITY / CONTACT
      ================================================= */}

      <section className="community-section" id="community">
        <div className="landing-container community-grid">
          <Reveal className="community-content">
            <span className="section-tag light">THE VEC COMMUNITY</span>

            <RevealHeading as="h2" direction="right">
              {(visible) => (
                <>
                  <Words
                    text="Your college journey"
                    visible={visible}
                    startIndex={0}
                  />
                  <br />
                  <span>
                    <Words
                      text="doesn't end at graduation."
                      visible={visible}
                      startIndex={3}
                    />
                  </span>
                </>
              )}
            </RevealHeading>

            <p>
              Whether you graduated recently or decades ago, the VEC community
              remains a place to reconnect, contribute and grow.
            </p>

            <div className="community-contact-list">
              <div>
                <span>✉</span>
                <p>alumni@vec.ac.in</p>
              </div>

              <div>
                <span>☎</span>
                <p>Alumni Support Desk</p>
              </div>

              <div>
                <span>📍</span>
                <p>Velammal Engineering College</p>
              </div>
            </div>

            <button
              className="community-button"
              type="button"
              onClick={() => navigate("/signup")}
            >
              JOIN THE COMMUNITY
              <span>→</span>
            </button>
          </Reveal>

          <Reveal className="community-form-card" delay={200}>
            <CommunityQuickForm />
          </Reveal>
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
                <span>▶</span>
                <div>
                  <small>COMING SOON ON</small>
                  <strong>Google Play</strong>
                </div>
              </button>

              <button type="button">
                <span></span>
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
                  👥
                  <span>Find Alumni</span>→
                </div>

                <div className="phone-card">
                  💼
                  <span>Career Opportunities</span>→
                </div>

                <div className="phone-card">
                  🎓
                  <span>Find a Mentor</span>→
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </main>
  );
}

export default LandingPage;
