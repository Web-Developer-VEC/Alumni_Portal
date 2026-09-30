import React, { useEffect, useMemo, useState } from "react";
import "./Events.css";
import Navbar from "./DashboardNavbar";
import { getAllEvents } from "../../api/event";
import {
  Calendar,
  Clock,
  Users,
  Radio,
  Building2,
  Globe2,
  Mic2,
  ArrowRight,
  ArrowUpRight,
  Search,
  Filter,
  X,
  RefreshCw,
} from "lucide-react";

const CATEGORY_LABELS = {
  "alumni-meet": "Alumni Meet",
  reunion: "Reunion",
  workshop: "Workshop",
  seminar: "Seminar",
  webinar: "Webinar",
  networking: "Networking",
  career: "Career",
  other: "Other",
};

const CATEGORY_ORDER = [
  "all",
  "alumni-meet",
  "reunion",
  "workshop",
  "seminar",
  "webinar",
  "networking",
  "career",
  "other",
];

const LOCATION_META = {
  physical: { label: "On Campus", icon: Building2 },
  online: { label: "Online", icon: Globe2 },
  hybrid: { label: "Hybrid", icon: Radio },
};

/* =========================================================
   HELPERS
========================================================= */

function formatDateParts(dateValue) {
  const d = new Date(dateValue);

  if (Number.isNaN(d.getTime())) {
    return { day: "--", month: "---", weekday: "", full: "Date TBA" };
  }

  const day = d.toLocaleDateString("en-IN", { day: "2-digit" });
  const month = d.toLocaleDateString("en-IN", { month: "short" }).toUpperCase();
  const weekday = d.toLocaleDateString("en-IN", { weekday: "long" });
  const full = d.toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  return { day, month, weekday, full };
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

/* ---------------------------------------------------------
   useImageTone
   Looks at the lower half of the image (where the text sits)
   and returns "light" (bright image -> black text) or
   "dark" (dark image -> white text).
   Falls back to "dark" if there is no image or the image
   host blocks canvas access (CORS).
--------------------------------------------------------- */

function useImageTone(url) {
  const [tone, setTone] = useState("dark");

  useEffect(() => {
    if (!url) {
      setTone("dark");
      return undefined;
    }

    let cancelled = false;
    const img = new Image();
    img.crossOrigin = "anonymous";

    img.onload = () => {
      try {
        const w = 48;
        const h = 60;
        const canvas = document.createElement("canvas");
        canvas.width = w;
        canvas.height = h;

        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, w, h);

        const startY = Math.floor(h * 0.45);
        const { data } = ctx.getImageData(0, startY, w, h - startY);

        let sum = 0;
        for (let i = 0; i < data.length; i += 4) {
          sum += 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        }

        const avg = sum / (data.length / 4);
        if (!cancelled) setTone(avg > 150 ? "light" : "dark");
      } catch (e) {
        if (!cancelled) setTone("dark");
      }
    };

    img.onerror = () => {
      if (!cancelled) setTone("dark");
    };

    img.src = url;

    return () => {
      cancelled = true;
    };
  }, [url]);

  return tone;
}

/* =========================================================
   COMPONENT: EventCard
   Maroon frame -> image inside -> text colour follows image.
   Optional: set event.textTone = "light" | "dark" from the
   backend to override the automatic detection.
========================================================= */

function EventCard({ event, onViewMore }) {
  const { day, month, weekday } = formatDateParts(event.date);
  const categoryLabel = CATEGORY_LABELS[event.category] || "Event";
  const upcoming = isUpcoming(event.date);

  const autoTone = useImageTone(event.imageUrl);
  const tone = event.textTone || autoTone;

  return (
    <article
      className={`ev-card ev-card--${tone} ${upcoming ? "" : "ev-card--past"}`}
    >
      <div className="ev-card-inner">
        <div className="ev-card-media">
          {event.imageUrl && (
            <img src={event.imageUrl} alt={event.title} loading="lazy" />
          )}
        </div>

        <span className="ev-card-category">{categoryLabel}</span>

        {!upcoming && <span className="ev-card-past-flag">PAST EVENT</span>}

        <div className="ev-card-body">
          <span className="ev-card-date-chip">
            {weekday ? `${weekday.slice(0, 3)}, ` : ""}
            {day} {month}
          </span>

          <h3>{event.title}</h3>

          <p className="ev-card-desc">{event.description}</p>

          <button
            type="button"
            className="ev-view-more-btn"
            onClick={() => onViewMore(event)}
          >
            VIEW MORE
            <span className="btn-arrow">
              <ArrowRight size={16} />
            </span>
          </button>
        </div>
      </div>
    </article>
  );
}

/* =========================================================
   COMPONENT: EventCardSkeleton
========================================================= */

function EventCardSkeleton() {
  return (
    <div className="ev-card ev-skeleton" aria-hidden="true">
      <div className="ev-card-inner ev-skeleton-inner">
        <div className="ev-card-body">
          <div className="ev-skeleton-line ev-skeleton-line--sm" />
          <div className="ev-skeleton-line ev-skeleton-line--lg" />
          <div className="ev-skeleton-line" />
          <div className="ev-skeleton-line ev-skeleton-line--sm" />
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENT: EventDetailsModal
========================================================= */

function EventDetailsModal({ event, onClose }) {
  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (!event) return null;

  const { day, month, weekday, full } = formatDateParts(event.date);
  const timeRange = formatTimeRange(event.startTime, event.endTime);
  const categoryLabel = CATEGORY_LABELS[event.category] || "Event";
  const LocationIcon =
    (LOCATION_META[event.locationType] || LOCATION_META.physical).icon;
  const locationLabel =
    (LOCATION_META[event.locationType] || LOCATION_META.physical).label;

  return (
    <div className="ev-modal-overlay" onClick={onClose}>
      <div
        className="ev-modal"
        role="dialog"
        aria-modal="true"
        aria-label={event.title}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          className="ev-modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          <X size={18} />
        </button>

        <div className="ev-modal-media">
          {event.imageUrl ? (
            <img src={event.imageUrl} alt={event.title} />
          ) : (
            <div className="ev-modal-fallback" aria-hidden="true">
              <Calendar size={38} />
            </div>
          )}

          <div className="ev-modal-date-badge">
            <strong>{day}</strong>
            <span>{month}</span>
          </div>

          <span className="ev-card-category ev-modal-category">
            {categoryLabel}
          </span>
        </div>

        <div className="ev-modal-body">
          <span className="ev-card-weekday">{weekday}</span>

          <h2>{event.title}</h2>

          <p className="ev-modal-desc">{event.description}</p>

          <div className="ev-modal-meta-grid">
            <div className="ev-modal-meta-item">
              <Calendar size={16} />
              <div>
                <span>Date</span>
                <strong>{full}</strong>
              </div>
            </div>

            <div className="ev-modal-meta-item">
              <Clock size={16} />
              <div>
                <span>Time</span>
                <strong>{timeRange}</strong>
              </div>
            </div>

            <div className="ev-modal-meta-item">
              <LocationIcon size={16} />
              <div>
                <span>{locationLabel}</span>
                <strong>{event.venue}</strong>
              </div>
            </div>

            {event.organizer && (
              <div className="ev-modal-meta-item">
                <Mic2 size={16} />
                <div>
                  <span>Organizer</span>
                  <strong>{event.organizer}</strong>
                </div>
              </div>
            )}

            {typeof event.capacity === "number" && (
              <div className="ev-modal-meta-item">
                <Users size={16} />
                <div>
                  <span>Capacity</span>
                  <strong>{event.capacity} seats</strong>
                </div>
              </div>
            )}
          </div>

          {Array.isArray(event.guestSpeakers) &&
            event.guestSpeakers.length > 0 && (
              <div className="ev-modal-speakers">
                <span className="ev-modal-speakers-label">Guest speakers</span>
                <div className="ev-card-speakers">
                  {event.guestSpeakers.map((speaker, i) => (
                    <span className="ev-speaker-chip" key={`${speaker}-${i}`}>
                      {speaker}
                    </span>
                  ))}
                </div>
              </div>
            )}

          {event.registrationLink ? (
            <a
              href={event.registrationLink}
              target="_blank"
              rel="noopener noreferrer"
              className="ev-register-btn ev-modal-register"
            >
              REGISTER NOW
              <span className="btn-arrow">
                <ArrowUpRight size={16} />
              </span>
            </a>
          ) : (
            <span className="ev-register-btn ev-register-btn--disabled ev-modal-register">
              REGISTRATIONS CLOSED
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE: Events
========================================================= */

function Events() {
  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");

  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [showPast, setShowPast] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState(null);

  const loadEvents = async () => {
    setStatus("loading");
    setErrorMessage("");

    try {
      const data = await getAllEvents();
      const list = Array.isArray(data)
        ? data
        : Array.isArray(data?.events)
        ? data.events
        : [];

      setEvents(list);
      setStatus("ready");
    } catch (err) {
      console.error("Error loading events:", err);
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          "Failed to load events from the server."
      );
      setStatus("error");
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();

    return events
      .filter((ev) => (showPast ? true : isUpcoming(ev.date)))
      .filter((ev) =>
        activeCategory === "all" ? true : ev.category === activeCategory,
      )
      .filter((ev) => {
        if (!q) return true;
        const haystack = `${ev.title} ${ev.description} ${ev.venue} ${
          ev.organizer || ""
        }`.toLowerCase();
        return haystack.includes(q);
      })
      .sort((a, b) => new Date(a.date) - new Date(b.date));
  }, [events, activeCategory, query, showPast]);

  const categoryCounts = useMemo(() => {
    const list = events.filter((ev) => (showPast ? true : isUpcoming(ev.date)));
    const base = { all: list.length };
    list.forEach((ev) => {
      base[ev.category] = (base[ev.category] || 0) + 1;
    });
    return base;
  }, [events, showPast]);

  return (
    <main className="ev-page">
      <Navbar />

      {/* ---------- FILTER BAR (top of page, scrolls with page) ---------- */}
      <section className="ev-filter-bar">
        <div className="ev-container ev-filter-inner">
          <div className="ev-search">
            <Search size={16} />
            <input
              type="text"
              placeholder="Search events, venues, organizers..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            {query && (
              <button
                type="button"
                className="ev-search-clear"
                onClick={() => setQuery("")}
                aria-label="Clear search"
              >
                <X size={14} />
              </button>
            )}
          </div>

          <label className="ev-toggle-past">
            <input
              type="checkbox"
              checked={showPast}
              onChange={(e) => setShowPast(e.target.checked)}
            />
            <span>Show past events</span>
          </label>
        </div>

        <div className="ev-container ev-category-row">
          <Filter size={14} className="ev-category-icon" />

          {CATEGORY_ORDER.map((key) => (
            <button
              key={key}
              type="button"
              className={`ev-chip ${activeCategory === key ? "is-active" : ""}`}
              onClick={() => setActiveCategory(key)}
            >
              {key === "all" ? "All Events" : CATEGORY_LABELS[key]}
              {typeof categoryCounts[key] === "number" && (
                <em>{categoryCounts[key]}</em>
              )}
            </button>
          ))}
        </div>
      </section>

      {/* ---------- GRID ---------- */}
      <section className="ev-grid-section">
        <div className="ev-container">
          {status === "loading" && (
            <div className="ev-grid">
              {Array.from({ length: 6 }).map((_, i) => (
                <EventCardSkeleton key={i} />
              ))}
            </div>
          )}

          {status === "error" && (
            <div className="ev-state ev-state--error">
              <Calendar size={36} />
              <h3>Couldn't load events</h3>
              <p>{errorMessage}</p>
              <button
                type="button"
                className="ev-retry-btn"
                onClick={loadEvents}
                style={{
                  marginTop: "12px",
                  display: "inline-flex",
                  alignItems: "center",
                  gap: "8px",
                  padding: "9px 22px",
                  borderRadius: "20px",
                  border: "none",
                  background: "var(--maroon)",
                  color: "#ffffff",
                  fontSize: "14px",
                  fontWeight: 600,
                  cursor: "pointer",
                }}
              >
                <RefreshCw size={15} />
                Try Again
              </button>
            </div>
          )}

          {status === "ready" && filteredEvents.length === 0 && (
            <div className="ev-state">
              <Calendar size={34} />
              {events.length === 0 ? (
                <>
                  <h3>No events scheduled yet</h3>
                  <p>Check back later for upcoming alumni meets and college events.</p>
                </>
              ) : (
                <>
                  <h3>No events match your filters</h3>
                  <p>Try a different category or clear your search.</p>
                </>
              )}
            </div>
          )}

          {status === "ready" && filteredEvents.length > 0 && (
            <div className="ev-grid">
              {filteredEvents.map((event) => (
                <EventCard
                  key={event._id || event.title}
                  event={event}
                  onViewMore={setSelectedEvent}
                />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ---------- DETAILS MODAL ---------- */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}
    </main>
  );
}

export default Events;