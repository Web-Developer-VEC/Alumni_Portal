import React, { useEffect, useState, useMemo } from "react";
import { useParams, useNavigate, useLocation, Link } from "react-router-dom";
import {
  Calendar,
  Clock,
  MapPin,
  Building2,
  Globe2,
  Radio,
  Users,
  Mic2,
  ArrowLeft,
  ArrowRight,
  ArrowUpRight,
  Share2,
  Check,
  Copy,
  Sparkles,
  CheckCircle2,
  Images,
  X,
  ChevronLeft,
  ChevronRight,
  RefreshCw,
  ExternalLink,
  Play,
  Film,
} from "lucide-react";

import { getAllEvents } from "../../api/event";
import "./eventdetails.css";

/* =========================================================
   CONSTANTS & HELPERS
========================================================= */

const CATEGORY_LABELS = {
  all: "All Events",
  past: "Past Events",
  upcoming: "Upcoming",
  "alumni-meet": "Alumni Meet",
  reunion: "Reunion",
  workshop: "Workshop",
  seminar: "Seminar",
  webinar: "Webinar",
  networking: "Networking",
  career: "Career",
  other: "Other",
};

const LOCATION_META = {
  physical: { label: "On Campus", icon: Building2 },
  online: { label: "Online", icon: Globe2 },
  hybrid: { label: "Hybrid", icon: Radio },
};

function formatDateParts(dateValue) {
  const d = new Date(dateValue);

  if (Number.isNaN(d.getTime())) {
    return { day: "--", month: "---", weekday: "", full: "Date TBA", year: "" };
  }

  const day = d.toLocaleDateString("en-IN", { day: "2-digit" });
  const month = d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
  const weekday = d.toLocaleDateString("en-IN", { weekday: "long" });
  const year = d.getFullYear();
  const full = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return { day, month, weekday, full, year };
}

function formatTimeRange(startTime, endTime) {
  if (!startTime && !endTime) return "Time TBA";
  if (startTime && endTime) return `${startTime} – ${endTime}`;
  return startTime || endTime;
}

function isUpcoming(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return true;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  return d.getTime() >= today.getTime();
}

function isVideoUrl(url) {
  if (typeof url !== "string") return false;
  return (
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url) ||
    url.startsWith("data:video/")
  );
}

function getEventMedia(event) {
  const media = [];
  const seen = new Set();

  const addMedia = (item) => {
    if (!item) return;
    if (typeof item === "string") {
      if (!seen.has(item)) {
        seen.add(item);
        media.push({ url: item, type: isVideoUrl(item) ? "video" : "image" });
      }
    } else if (item.url && !seen.has(item.url)) {
      seen.add(item.url);
      media.push({
        url: item.url,
        type: item.type || (isVideoUrl(item.url) ? "video" : "image"),
      });
    }
  };

  if (event?.imageUrl) addMedia(event.imageUrl);
  if (Array.isArray(event?.media)) event.media.forEach(addMedia);
  if (Array.isArray(event?.gallery)) event.gallery.forEach(addMedia);
  if (Array.isArray(event?.videos)) event.videos.forEach(addMedia);

  // Check localStorage for any cached media uploaded by admin
  const keyId = event?._id || event?.id;
  if (keyId) {
    try {
      const cached = localStorage.getItem(`event_media_${keyId}`);
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed)) parsed.forEach(addMedia);
      }
    } catch (e) {}
  }

  if (event?.title) {
    try {
      const cachedTitle = localStorage.getItem(
        `event_media_title_${event.title.trim().toLowerCase()}`,
      );
      if (cachedTitle) {
        const parsed = JSON.parse(cachedTitle);
        if (Array.isArray(parsed)) parsed.forEach(addMedia);
      }
    } catch (e) {}
  }

  return media;
}

function getGallery(event) {
  return Array.isArray(event?.gallery) ? event.gallery.filter(Boolean) : [];
}

function getDaysRemaining(dateValue) {
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return null;

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(d);
  target.setHours(0, 0, 0, 0);

  const diffMs = target.getTime() - today.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return null;
  if (diffDays === 0) return "Happening Today!";
  if (diffDays === 1) return "Happening Tomorrow!";
  return `${diffDays} days remaining`;
}

/* =========================================================
   SHARE MODAL (POPUP WITH APPS & COPY LINK)
========================================================= */

function ShareModal({ event, url, onClose }) {
  const [copied, setCopied] = useState(false);
  const shareText = `Check out this event: ${event.title}\nVenue: ${event.venue || "Velammal Engineering College"}\n`;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(shareText);

  const handleCopy = () => {
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2200);
    });
  };

  const shareApps = [
    {
      name: "WhatsApp",
      icon: "💬",
      bg: "#25D366",
      href: `https://api.whatsapp.com/send?text=${encodedText}%20${encodedUrl}`,
    },
    {
      name: "LinkedIn",
      icon: "💼",
      bg: "#0A66C2",
      href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    },
    {
      name: "Telegram",
      icon: "✈️",
      bg: "#229ED9",
      href: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    },
    {
      name: "X (Twitter)",
      icon: "🐦",
      bg: "#1DA1F2",
      href: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    },
    {
      name: "Email",
      icon: "✉️",
      bg: "#EA4335",
      href: `mailto:?subject=${encodeURIComponent(event.title)}&body=${encodedText}%20${encodedUrl}`,
    },
  ];

  return (
    <div className="ev-share-modal-overlay" onClick={onClose}>
      <div
        className="ev-share-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Share event"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ev-share-modal-header">
          <h3>Share Event</h3>
          <button
            type="button"
            className="ev-share-modal-close"
            onClick={onClose}
            aria-label="Close"
          >
            <X size={18} />
          </button>
        </div>

        <p className="ev-share-modal-title-preview">{event.title}</p>

        <div className="ev-share-apps-grid">
          {shareApps.map((app) => (
            <a
              key={app.name}
              href={app.href}
              target="_blank"
              rel="noopener noreferrer"
              className="ev-share-app-btn"
              onClick={onClose}
            >
              <span
                className="ev-share-app-icon"
                style={{ background: `${app.bg}18`, color: app.bg }}
              >
                {app.icon}
              </span>
              <span className="ev-share-app-label">{app.name}</span>
            </a>
          ))}
        </div>

        <div className="ev-share-copy-box">
          <input type="text" readOnly value={url} />
          <button type="button" onClick={handleCopy}>
            {copied ? (
              <>
                <Check size={14} /> Copied!
              </>
            ) : (
              <>
                <Copy size={14} /> Copy
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   LIGHTBOX COMPONENT
========================================================= */

function Lightbox({ media, index, title, onClose, onPrev, onNext }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") onNext();
      if (e.key === "ArrowLeft") onPrev();
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose, onPrev, onNext]);

  const current = media[index];
  const isVideo =
    current?.type === "video" ||
    isVideoUrl(typeof current === "string" ? current : current?.url);
  const src = typeof current === "string" ? current : current?.url;

  return (
    <div
      className="ev-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} media`}
      onClick={onClose}
    >
      <button
        type="button"
        className="ev-lightbox-close"
        onClick={onClose}
        aria-label="Close viewer"
      >
        <X size={20} />
      </button>

      {media.length > 1 && (
        <button
          type="button"
          className="ev-lightbox-nav ev-lightbox-nav--prev"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Previous item"
        >
          <ChevronLeft size={28} />
        </button>
      )}

      {isVideo ? (
        <video
          className="ev-lightbox-video"
          src={src}
          controls
          autoPlay
          playsInline
          onClick={(e) => e.stopPropagation()}
        />
      ) : (
        <img
          className="ev-lightbox-img"
          src={src}
          alt={`${title} item ${index + 1}`}
          onClick={(e) => e.stopPropagation()}
        />
      )}

      {media.length > 1 && (
        <button
          type="button"
          className="ev-lightbox-nav ev-lightbox-nav--next"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next item"
        >
          <ChevronRight size={28} />
        </button>
      )}

      <span className="ev-lightbox-count">
        {index + 1} / {media.length}
      </span>
    </div>
  );
}

/* =========================================================
   MAIN COMPONENT: EventDetailsPage
========================================================= */

export default function EventDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();

  // If navigated from list via state, load immediately
  const initialEvent = location.state?.event || null;

  const [event, setEvent] = useState(initialEvent);
  const [loading, setLoading] = useState(!initialEvent);
  const [error, setError] = useState(null);
  const [relatedEvents, setRelatedEvents] = useState([]);
  const [lightboxIndex, setLightboxIndex] = useState(null);
  const [showShareModal, setShowShareModal] = useState(false);

  // Hero carousel state
  const [heroIndex, setHeroIndex] = useState(0);
  const [heroHover, setHeroHover] = useState(false);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);

  // Fetch event and related events using getAllEvents
  useEffect(() => {
    let cancelled = false;
    setEvent(initialEvent);

    async function loadEventData() {
      if (!id) return;
      if (!initialEvent) setLoading(true);
      setError(null);

      try {
        const data = await getAllEvents();
        const list = Array.isArray(data)
          ? data
          : Array.isArray(data?.events)
            ? data.events
            : [];

        if (!cancelled) {
          const found = list.find((e) => String(e._id || e.id) === String(id));
          if (found) {
            setEvent(found);
          } else if (!initialEvent) {
            setError("Could not find this event.");
          }

          const cat = (found || initialEvent)?.category;
          const others = list
            .filter((e) => String(e._id || e.id) !== String(id))
            .sort(
              (a, b) =>
                Number(b.category === cat) - Number(a.category === cat) ||
                new Date(a.date) - new Date(b.date),
            )
            .slice(0, 3);
          setRelatedEvents(others);
        }
      } catch (err) {
        console.error("Failed to fetch event details:", err);
        if (!cancelled && !initialEvent) {
          setError(
            err.response?.data?.message ||
              err.message ||
              "Could not find this event.",
          );
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    loadEventData();

    return () => {
      cancelled = true;
    };
  }, [id, initialEvent]);

  // Scroll to top on page load or ID change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [id]);

  // Update document title for SEO
  useEffect(() => {
    if (event?.title) {
      document.title = `${event.title} | VEC Alumni Portal`;
    }
  }, [event?.title]);

  const mediaList = useMemo(() => getEventMedia(event), [event]);

  // Reset hero index when event changes
  useEffect(() => {
    setHeroIndex(0);
  }, [event?._id, event?.id]);

  // Auto-scroll images & videos continuously always (pauses only while video is playing)
  useEffect(() => {
    if (mediaList.length < 2 || isVideoPlaying) return;
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % mediaList.length);
    }, 3500);
    return () => clearInterval(timer);
  }, [mediaList.length, isVideoPlaying]);

  const handlePrevHero = () => {
    setHeroIndex((prev) => (prev - 1 + mediaList.length) % mediaList.length);
  };

  const handleNextHero = () => {
    setHeroIndex((prev) => (prev + 1) % mediaList.length);
  };

  // Keyboard navigation for hero carousel (ArrowLeft / ArrowRight)
  useEffect(() => {
    if (mediaList.length < 2) return;
    const handleKeyNav = (e) => {
      if (lightboxIndex !== null || showShareModal) return;
      if (e.key === "ArrowLeft") {
        setHeroIndex(
          (prev) => (prev - 1 + mediaList.length) % mediaList.length,
        );
      } else if (e.key === "ArrowRight") {
        setHeroIndex((prev) => (prev + 1) % mediaList.length);
      }
    };
    window.addEventListener("keydown", handleKeyNav);
    return () => window.removeEventListener("keydown", handleKeyNav);
  }, [mediaList.length, lightboxIndex, showShareModal]);

  const handleShare = async () => {
    const url = window.location.href;
    const shareData = {
      title: event?.title || "VEC Alumni Event",
      text: `Check out this event: ${event?.title || "Event"}${
        event?.venue ? ` • ${event.venue}` : ""
      }`,
      url: url,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
        return;
      } catch (err) {
        if (err.name === "AbortError") {
          return;
        }
      }
    }
    setShowShareModal(true);
  };

  const handleBack = () => {
    // Navigate back to the parent events list
    const currentPath = location.pathname;
    if (currentPath.startsWith("/student")) {
      navigate("/student/events");
    } else if (currentPath.startsWith("/admin")) {
      navigate("/admin/events");
    } else if (currentPath.startsWith("/hod")) {
      navigate("/hod/events");
    } else if (currentPath.startsWith("/alumni")) {
      navigate("/alumni/events");
    } else {
      navigate(-1);
    }
  };

  const handleNavigateRelated = (targetEvent) => {
    const targetId = targetEvent._id || targetEvent.id;
    if (!targetId) return;

    const currentPath = location.pathname;
    let basePath = "/events";
    if (currentPath.startsWith("/student")) basePath = "/student/events";
    else if (currentPath.startsWith("/admin")) basePath = "/admin/events";
    else if (currentPath.startsWith("/hod")) basePath = "/hod/events";
    else if (currentPath.startsWith("/alumni")) basePath = "/alumni/events";

    navigate(`${basePath}/${targetId}`, { state: { event: targetEvent } });
  };

  // ---------------------------------------------------------
  // Render States: Loading & Error
  // ---------------------------------------------------------
  if (loading && !event) {
    return (
      <main className="ev-detail-page">
        <div className="ev-detail-container ev-detail-loading">
          <div className="ev-detail-spinner" />
          <p>Loading event information...</p>
        </div>
      </main>
    );
  }

  if (error && !event) {
    return (
      <main className="ev-detail-page">
        <div className="ev-detail-container ev-detail-error">
          <Calendar size={48} color="var(--maroon)" />
          <h2>Event Not Found</h2>
          <p>{error}</p>
          <button type="button" className="ev-back-btn" onClick={handleBack}>
            <ArrowLeft size={16} /> Return to Events
          </button>
        </div>
      </main>
    );
  }

  if (!event) return null;

  // ---------------------------------------------------------
  // Computed values
  // ---------------------------------------------------------
  const upcoming = isUpcoming(event.date);
  const { day, month, weekday, full, year } = formatDateParts(event.date);
  const timeRange = formatTimeRange(event.startTime, event.endTime);
  const categoryLabel = CATEGORY_LABELS[event.category] || "College Event";
  const locationMeta =
    LOCATION_META[event.locationType] || LOCATION_META.physical;
  const LocationIcon = locationMeta.icon;
  const locationLabel = locationMeta.label;
  const daysRemaining = upcoming ? getDaysRemaining(event.date) : null;
  const gallery = getGallery(event);
  const speakers = Array.isArray(event.guestSpeakers)
    ? event.guestSpeakers
    : [];
  const highlights = Array.isArray(event.highlights) ? event.highlights : [];

  return (
    <main className="ev-detail-page">
      {/* =====================================================
          TOP NAVIGATION BAR (Sticky)
      ===================================================== */}
      <nav className="ev-detail-topbar" aria-label="Event navigation">
        <div className="ev-detail-container ev-detail-topbar-inner">
          <button
            type="button"
            className="ev-back-btn"
            onClick={handleBack}
            aria-label="Back to all events"
          >
            <ArrowLeft size={16} />
            <span>Back to Events</span>
          </button>

          <div className="ev-detail-top-actions">
            <button
              type="button"
              className="ev-action-btn"
              onClick={handleShare}
              title="Share event"
            >
              <Share2 size={14} /> Share
            </button>
          </div>
        </div>
      </nav>

      <div className="ev-detail-container">
        {/* =====================================================
            EVENT DETAILS HEADER CARD (Matching Reference UI)
            Top Badges -> Image Banner -> Date Chip -> Title -> 4 Stats
        ===================================================== */}
        <section className="ev-detail-hero">
          {/* Top Badges Row (Above Image) */}
          <div className="ev-hero-top-row">
            <span className="ev-hero-category-pill">{categoryLabel}</span>

            {upcoming ? (
              <span className="ev-hero-status-pill ev-hero-status-pill--upcoming">
                <span className="ev-status-beacon-green" /> Upcoming Event
              </span>
            ) : (
              <span className="ev-hero-status-pill ev-hero-status-pill--past">
                <CheckCircle2 size={14} /> Completed Event
              </span>
            )}
          </div>

          {/* Media Showcase: Image / Video carousel with auto-scroll and arrow controls */}
          <div
            className="ev-hero-media-container"
            onMouseEnter={() => setHeroHover(true)}
            onMouseLeave={() => setHeroHover(false)}
          >
            {mediaList.length > 0 ? (
              <div className="ev-hero-carousel-viewport">
                <div
                  className="ev-hero-carousel-track"
                  style={{ transform: `translateX(-${heroIndex * 100}%)` }}
                >
                  {mediaList.map((item, i) => (
                    <div className="ev-hero-slide" key={`${item.url}-${i}`}>
                      {item.type === "video" ? (
                        <video
                          src={item.url}
                          className="ev-hero-slide-video"
                          controls
                          playsInline
                          onPlay={() => setIsVideoPlaying(true)}
                          onPause={() => setIsVideoPlaying(false)}
                          onEnded={() => setIsVideoPlaying(false)}
                        />
                      ) : (
                        <img
                          src={item.url}
                          alt={`${event.title} - Slide ${i + 1}`}
                          className="ev-hero-slide-img"
                        />
                      )}
                    </div>
                  ))}
                </div>

                {/* Manual Navigation Arrows (Scroll with arrows) */}
                {mediaList.length > 1 && (
                  <>
                    <button
                      type="button"
                      className="ev-hero-nav-arrow ev-hero-nav-arrow--prev"
                      onClick={(e) => {
                        e.stopPropagation();
                        handlePrevHero();
                      }}
                      aria-label="Previous slide"
                      title="Previous slide"
                    >
                      <ChevronLeft size={24} />
                    </button>
                    <button
                      type="button"
                      className="ev-hero-nav-arrow ev-hero-nav-arrow--next"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleNextHero();
                      }}
                      aria-label="Next slide"
                      title="Next slide"
                    >
                      <ChevronRight size={24} />
                    </button>

                    {/* Dot indicators */}
                    <div className="ev-hero-dots">
                      {mediaList.map((_, i) => (
                        <button
                          key={i}
                          type="button"
                          className={`ev-hero-dot ${
                            i === heroIndex ? "is-active" : ""
                          }`}
                          onClick={() => setHeroIndex(i)}
                          aria-label={`Go to slide ${i + 1}`}
                        />
                      ))}
                    </div>

                    {/* Media counter & auto-scroll indicator pills */}
                    <div className="ev-hero-controls-bar">
                      <div
                        className="ev-hero-autoscroll-pill"
                        title="Media continuously auto-scrolls; click arrows or swipe to browse"
                      >
                        <span className="ev-autoscroll-live-dot" />
                        <span>Auto-scrolling</span>
                      </div>
                      <div className="ev-hero-counter">
                        {mediaList[heroIndex]?.type === "video" ? (
                          <Play size={11} />
                        ) : (
                          <Images size={11} />
                        )}
                        <span>
                          {heroIndex + 1} / {mediaList.length}
                        </span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            ) : (
              <div className="ev-detail-hero-fallback">
                <Calendar size={54} strokeWidth={1.5} />
                <span>Velammal Engineering College Event</span>
              </div>
            )}
          </div>

          {/* Date Chip below image */}
          <div className="ev-hero-date-badge-wrap">
            <span className="ev-hero-date-badge">
              <Calendar size={14} />
              {weekday ? `${weekday}, ` : ""}
              {day} {month} {year}
            </span>
          </div>

          {/* Event Title */}
          <h1 className="ev-hero-title">{event.title}</h1>

          {/* Integrated 4-Column Key Stats Row */}
          <div
            className="ev-hero-stats-row"
            aria-label="Event overview details"
          >
            {/* Date */}
            <div className="ev-hero-stat-card">
              <div className="ev-hero-stat-icon">
                <Calendar size={18} />
              </div>
              <div className="ev-hero-stat-body">
                <span className="ev-hero-stat-label">DATE</span>
                <strong className="ev-hero-stat-val">{full}</strong>
              </div>
            </div>

            {/* Time */}
            <div className="ev-hero-stat-card">
              <div className="ev-hero-stat-icon">
                <Clock size={18} />
              </div>
              <div className="ev-hero-stat-body">
                <span className="ev-hero-stat-label">TIME</span>
                <strong className="ev-hero-stat-val">{timeRange}</strong>
              </div>
            </div>

            {/* Venue & Mode */}
            <div className="ev-hero-stat-card">
              <div className="ev-hero-stat-icon">
                <MapPin size={18} />
              </div>
              <div className="ev-hero-stat-body">
                <span className="ev-hero-stat-label">
                  {locationLabel.toUpperCase()}
                </span>
                <strong className="ev-hero-stat-val" title={event.venue}>
                  {event.venue || "Campus Venue"}
                </strong>
              </div>
            </div>

            {/* Organizer / Capacity */}
            <div className="ev-hero-stat-card">
              <div className="ev-hero-stat-icon">
                <Users size={18} />
              </div>
              <div className="ev-hero-stat-body">
                <span className="ev-hero-stat-label">
                  {event.organizer
                    ? "ORGANIZER"
                    : upcoming && typeof event.capacity === "number"
                      ? "CAPACITY"
                      : "ORGANIZER"}
                </span>
                <strong className="ev-hero-stat-val">
                  {event.organizer ||
                    (upcoming && typeof event.capacity === "number"
                      ? `${event.capacity} seats`
                      : "VEC Alumni Cell")}
                </strong>
              </div>
            </div>
          </div>
        </section>

        {/* =====================================================
            TWO-COLUMN LAYOUT: Content + Sticky Sidebar
        ===================================================== */}
        <div className="ev-detail-layout">
          {/* Main Column */}
          <div className="ev-detail-main-column">
            {/* About the Event */}
            <article className="ev-content-card">
              <div className="ev-content-card-head">
                <Sparkles size={20} className="ev-head-icon" />
                <h2>About the Event</h2>
              </div>
              <div className="ev-desc-body">
                {event.description ||
                  "Detailed description for this event will be updated shortly."}
              </div>
            </article>

            {/* Guest Speakers */}
            {speakers.length > 0 && (
              <section className="ev-content-card">
                <div className="ev-content-card-head">
                  <Mic2 size={20} className="ev-head-icon" />
                  <h2>
                    {upcoming
                      ? "Guest Speakers & Guests"
                      : "Distinguished Speakers"}
                  </h2>
                </div>
                <div className="ev-speakers-grid">
                  {speakers.map((speaker, idx) => (
                    <div className="ev-speaker-card" key={`${speaker}-${idx}`}>
                      <div className="ev-speaker-avatar">
                        {speaker.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="ev-speaker-info">
                        <span className="ev-speaker-name">{speaker}</span>
                        <span className="ev-speaker-role">
                          Featured Speaker
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Highlights (if any) */}
            {highlights.length > 0 && (
              <section className="ev-content-card">
                <div className="ev-content-card-head">
                  <CheckCircle2 size={20} className="ev-head-icon" />
                  <h2>Event Highlights</h2>
                </div>
                <ul className="ev-highlights-list">
                  {highlights.map((item, idx) => (
                    <li className="ev-highlight-item" key={`${item}-${idx}`}>
                      <span className="ev-highlight-bullet">
                        <Check size={12} />
                      </span>
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </section>
            )}

            {/* Past Event Recap & Summary */}
            {!upcoming && event.summary && (
              <section className="ev-content-card">
                <div className="ev-content-card-head">
                  <CheckCircle2 size={20} className="ev-head-icon" />
                  <h2>Event Recap & Takeaways</h2>
                </div>
                <div className="ev-recap-box">{event.summary}</div>
              </section>
            )}

            {/* Past Event Photo Gallery */}
            {!upcoming && (
              <section className="ev-content-card" id="gallery-section">
                <div className="ev-content-card-head">
                  <Images size={20} className="ev-head-icon" />
                  <h2>Event Photo Gallery</h2>
                </div>

                {mediaList.length > 0 ? (
                  <div className="ev-gallery-preview-grid">
                    {mediaList.map((item, i) => (
                      <button
                        type="button"
                        key={`${item.url}-${i}`}
                        className="ev-gallery-thumb-btn"
                        onClick={() => setLightboxIndex(i)}
                        aria-label={`Open ${item.type} ${i + 1}`}
                      >
                        {item.type === "video" ? (
                          <video src={item.url} muted preload="metadata" />
                        ) : (
                          <img
                            src={item.url}
                            alt={`${event.title} ${i + 1}`}
                            loading="lazy"
                          />
                        )}
                        <div className="ev-gallery-thumb-overlay">
                          {item.type === "video" ? (
                            <Play size={20} />
                          ) : (
                            <Images size={20} />
                          )}
                        </div>
                      </button>
                    ))}
                  </div>
                ) : (
                  <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>
                    Official event photos and moments will be uploaded soon.
                  </p>
                )}
              </section>
            )}

            {/* Venue & Location Details */}
            <section className="ev-content-card">
              <div className="ev-content-card-head">
                <MapPin size={20} className="ev-head-icon" />
                <h2>Venue & Location Details</h2>
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                <p style={{ margin: 0, fontWeight: 700, fontSize: "15px" }}>
                  {event.venue || "Velammal Engineering College"}
                </p>
                <p
                  style={{
                    margin: 0,
                    color: "var(--text-muted)",
                    fontSize: "13.5px",
                  }}
                >
                  Mode: <strong>{locationLabel}</strong> • Organized by{" "}
                  <strong>{event.organizer || "Alumni Cell"}</strong>
                </p>
              </div>
            </section>
          </div>

          {/* Sticky Sidebar */}
          <aside className="ev-detail-sidebar">
            <div className="ev-sidebar-card ev-sidebar-card--primary">
              <span
                className={`ev-sidebar-badge ${
                  upcoming
                    ? "ev-sidebar-badge--open"
                    : "ev-sidebar-badge--closed"
                }`}
              >
                {upcoming ? "Registration Open" : "Event Concluded"}
              </span>

              {upcoming && daysRemaining && (
                <div className="ev-sidebar-countdown">
                  <Clock size={16} />
                  <span>{daysRemaining}</span>
                </div>
              )}

              {/* Registration CTA */}
              {upcoming ? (
                event.registrationLink ? (
                  <a
                    href={event.registrationLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ev-sidebar-reg-btn"
                  >
                    REGISTER NOW
                    <ArrowUpRight size={17} />
                  </a>
                ) : (
                  <span className="ev-sidebar-reg-btn ev-sidebar-reg-btn--disabled">
                    REGISTRATIONS OPENING SOON
                  </span>
                )
              ) : (
                <span className="ev-sidebar-reg-btn ev-sidebar-reg-btn--disabled">
                  EVENT COMPLETED
                </span>
              )}

              {/* Single Share Button */}
              <button
                type="button"
                className="ev-sidebar-share-btn"
                onClick={handleShare}
                title="Share this event"
              >
                <Share2 size={15} />
                <span>Share Event</span>
              </button>
            </div>
          </aside>
        </div>

        {/* =====================================================
            RELATED / OTHER EVENTS
        ===================================================== */}
        {relatedEvents.length > 0 && (
          <section className="ev-related-section">
            <div className="ev-related-head">
              <h2>More Events You Might Like</h2>
              <button
                type="button"
                className="ev-view-all-link"
                onClick={handleBack}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                View All Events <ArrowRight size={15} />
              </button>
            </div>

            <div className="ev-related-grid">
              {relatedEvents.map((item) => {
                const parts = formatDateParts(item.date);
                const itemUpcoming = isUpcoming(item.date);
                return (
                  <article
                    key={item._id || item.title}
                    className="ev-card ev-card--dark"
                    style={{ cursor: "pointer", aspectRatio: "4 / 5" }}
                    onClick={() => handleNavigateRelated(item)}
                  >
                    <div className="ev-card-inner">
                      <div className="ev-card-media">
                        {item.imageUrl && (
                          <img
                            src={item.imageUrl}
                            alt={item.title}
                            loading="lazy"
                          />
                        )}
                      </div>

                      <span className="ev-card-category">
                        {CATEGORY_LABELS[item.category] || "Event"}
                      </span>

                      {!itemUpcoming && (
                        <span className="ev-card-past-flag">PAST EVENT</span>
                      )}

                      <div className="ev-card-body">
                        <span className="ev-card-date-chip">
                          {parts.weekday
                            ? `${parts.weekday.slice(0, 3)}, `
                            : ""}
                          {parts.day} {parts.month}
                        </span>

                        <h3>{item.title}</h3>

                        <p className="ev-card-desc">{item.description}</p>

                        <div className="ev-card-footer">
                          <button
                            type="button"
                            className="ev-arrow-btn"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNavigateRelated(item);
                            }}
                            aria-label="View event details"
                            title="View event details"
                          >
                            <ArrowRight size={18} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        )}
      </div>

      {/* Lightbox for gallery photos and videos */}
      {lightboxIndex !== null && mediaList.length > 0 && (
        <Lightbox
          media={mediaList}
          index={lightboxIndex}
          title={event.title}
          onClose={() => setLightboxIndex(null)}
          onPrev={() =>
            setLightboxIndex(
              (i) => (i - 1 + mediaList.length) % mediaList.length,
            )
          }
          onNext={() => setLightboxIndex((i) => (i + 1) % mediaList.length)}
        />
      )}

      {/* Share Modal Popup */}
      {showShareModal && (
        <ShareModal
          event={event}
          url={window.location.href}
          onClose={() => setShowShareModal(false)}
        />
      )}
    </main>
  );
}
