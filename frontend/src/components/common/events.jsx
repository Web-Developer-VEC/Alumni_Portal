import React, { useCallback, useEffect, useMemo, useState } from "react";
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

function getGallery(event) {
  return Array.isArray(event?.gallery) ? event.gallery.filter(Boolean) : [];
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
   Text colour follows the image brightness.
   Optional: set event.textTone = "light" | "dark" from the
   backend to override the automatic detection.
========================================================= */

function EventCard({ event, onViewMore }) {
  const { day, month, weekday } = formatDateParts(event.date);
  const categoryLabel = CATEGORY_LABELS[event.category] || "Event";
  const upcoming = isUpcoming(event.date);
  const hasGallery = getGallery(event).length > 0;

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
            {!upcoming && hasGallery ? "VIEW GALLERY" : "VIEW MORE"}
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
   COMPONENT: Lightbox (full-screen photo viewer)
========================================================= */

function Lightbox({ images, index, title, onClose, onPrev, onNext }) {
  return (
    <div
      className="ev-lightbox"
      role="dialog"
      aria-modal="true"
      aria-label={`${title} photos`}
      onClick={onClose}
    >
      <button
        type="button"
        className="ev-lightbox-close"
        onClick={onClose}
        aria-label="Close photo viewer"
      >
        <X size={20} />
      </button>

      {images.length > 1 && (
        <button
          type="button"
          className="ev-lightbox-nav ev-lightbox-nav--prev"
          onClick={(e) => {
            e.stopPropagation();
            onPrev();
          }}
          aria-label="Previous photo"
        >
          <ChevronLeft size={26} />
        </button>
      )}

      <img
        className="ev-lightbox-img"
        src={images[index]}
        alt={`${title} photo ${index + 1}`}
        onClick={(e) => e.stopPropagation()}
      />

      {images.length > 1 && (
        <button
          type="button"
          className="ev-lightbox-nav ev-lightbox-nav--next"
          onClick={(e) => {
            e.stopPropagation();
            onNext();
          }}
          aria-label="Next photo"
        >
          <ChevronRight size={26} />
        </button>
      )}

      <span className="ev-lightbox-count">
        {index + 1} / {images.length}
      </span>
    </div>
  );
}
function ImageCarousel({ images, title, paused, onOpen }) {
  const [index, setIndex] = useState(0);
  const [hover, setHover] = useState(false);
  const count = images.length;

  const next = useCallback(() => setIndex((i) => (i + 1) % count), [count]);
  const prev = useCallback(
    () => setIndex((i) => (i - 1 + count) % count),
    [count],
  );

  /* auto-scroll every 3.5s (stops on hover or when the viewer is open) */
  useEffect(() => {
    if (count < 2 || hover || paused) return undefined;
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [count, hover, paused, next]);

  return (
    <div
      className="ev-carousel"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      <div
        className="ev-carousel-track"
        style={{ transform: `translateX(-${index * 100}%)` }}
      >
        {images.map((src, i) => (
          <button
            type="button"
            key={`${src}-${i}`}
            className="ev-carousel-slide"
            onClick={() => onOpen(i)}
            aria-label={`Open photo ${i + 1}`}
          >
            <img
              src={src}
              alt={`${title} photo ${i + 1}`}
              loading={i === 0 ? "eager" : "lazy"}
            />
          </button>
        ))}
      </div>

      {count > 1 && (
        <>
          <button
            type="button"
            className="ev-carousel-arrow ev-carousel-arrow--prev"
            onClick={prev}
            aria-label="Previous photo"
          >
            <ChevronLeft size={22} />
          </button>
          <button
            type="button"
            className="ev-carousel-arrow ev-carousel-arrow--next"
            onClick={next}
            aria-label="Next photo"
          >
            <ChevronRight size={22} />
          </button>

          <div className="ev-carousel-dots">
            {images.map((_, i) => (
              <button
                type="button"
                key={i}
                className={`ev-carousel-dot ${i === index ? "is-active" : ""}`}
                onClick={() => setIndex(i)}
                aria-label={`Go to photo ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}

      <span className="ev-carousel-count">
        <Images size={11} style={{ marginRight: 5, verticalAlign: -1 }} />
        {index + 1} / {count}
      </span>
    </div>
  );
}

/* =========================================================
   COMPONENT: EventDetailsModal
   - Upcoming event  -> details + REGISTER NOW
   - Finished event  -> full details + recap + photo gallery
========================================================= */

function EventDetailsModal({ event, onClose }) {
  const [lightboxIndex, setLightboxIndex] = useState(null);

  const gallery = getGallery(event);
  const galleryLength = gallery.length;

  /* keyboard: Esc closes; when the viewer is open, arrows navigate */
  useEffect(() => {
    const onKeyDown = (e) => {
      if (lightboxIndex !== null) {
        if (e.key === "Escape") {
          setLightboxIndex(null);
        } else if (e.key === "ArrowRight") {
          setLightboxIndex((i) => (i + 1) % galleryLength);
        } else if (e.key === "ArrowLeft") {
          setLightboxIndex((i) => (i - 1 + galleryLength) % galleryLength);
        }
        return;
      }

      if (e.key === "Escape") onClose();
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [onClose, lightboxIndex, galleryLength]);

  /* lock page scroll while the modal is open */
  useEffect(() => {
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  if (!event) return null;

  const upcoming = isUpcoming(event.date);
  const { day, month, weekday, full } = formatDateParts(event.date);
  const timeRange = formatTimeRange(event.startTime, event.endTime);
  const categoryLabel = CATEGORY_LABELS[event.category] || "Event";
  const locationMeta =
    LOCATION_META[event.locationType] || LOCATION_META.physical;
  const LocationIcon = locationMeta.icon;
  const locationLabel = locationMeta.label;

  const highlights = Array.isArray(event.highlights) ? event.highlights : [];
  const speakers = Array.isArray(event.guestSpeakers)
    ? event.guestSpeakers
    : [];

  return (
    <>
      <div className="ev-modal-overlay" onClick={onClose}>
        <div
          className={`ev-modal ${upcoming ? "" : "ev-modal--past"}`}
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

          {/* ---------- cover: slider for finished events, image for upcoming ---------- */}
          <div className="ev-modal-media">
            {!upcoming && galleryLength > 0 ? (
              <ImageCarousel
                images={gallery}
                title={event.title}
                paused={lightboxIndex !== null}
                onOpen={setLightboxIndex}
              />
            ) : event.imageUrl ? (
              <img src={event.imageUrl} alt={event.title} />
            ) : (
              <div className="ev-modal-fallback" aria-hidden="true">
                <Calendar size={38} />
              </div>
            )}

            {!upcoming && (
              <span className="ev-modal-completed">
                <CheckCircle2 size={13} /> EVENT COMPLETED
              </span>
            )}

            <div className="ev-modal-date-badge">
              <strong>{day}</strong>
              <span>{month}</span>
            </div>

            <span className="ev-card-category ev-modal-category">
              {categoryLabel}
            </span>
          </div>

          {/* ---------- body ---------- */}
          <div className="ev-modal-body">
            <div className="ev-modal-head">
              <span className="ev-card-weekday">{weekday}</span>
              <h2>{event.title}</h2>
            </div>

            <p className="ev-modal-desc">{event.description}</p>

            {/* meta */}
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

              {upcoming && typeof event.capacity === "number" && (
                <div className="ev-modal-meta-item">
                  <Users size={16} />
                  <div>
                    <span>Capacity</span>
                    <strong>{event.capacity} seats</strong>
                  </div>
                </div>
              )}

              {!upcoming && typeof event.attendees === "number" && (
                <div className="ev-modal-meta-item">
                  <Users size={16} />
                  <div>
                    <span>Attended</span>
                    <strong>{event.attendees} people</strong>
                  </div>
                </div>
              )}
            </div>

            {/* speakers */}
            {speakers.length > 0 && (
              <div className="ev-modal-speakers">
                <span className="ev-modal-speakers-label">
                  {upcoming ? "Guest speakers" : "Speakers & guests"}
                </span>
                <div className="ev-card-speakers">
                  {speakers.map((speaker, i) => (
                    <span className="ev-speaker-chip" key={`${speaker}-${i}`}>
                      {speaker}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* =====================================================
                UPCOMING -> register only
            ===================================================== */}
            {upcoming &&
              (event.registrationLink ? (
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
                  REGISTRATIONS OPENING SOON
                </span>
              ))}

            {/* =====================================================
                FINISHED -> recap, highlights, gallery
            ===================================================== */}
            {!upcoming && (
              <>
                {event.summary && (
                  <div className="ev-modal-section">
                    <span className="ev-modal-section-label">Event recap</span>
                    <p className="ev-modal-summary">{event.summary}</p>
                  </div>
                )}

                {highlights.length > 0 && (
                  <div className="ev-modal-section">
                    <span className="ev-modal-section-label">Highlights</span>
                    <ul className="ev-modal-highlights">
                      {highlights.map((item, i) => (
                        <li key={`${item}-${i}`}>{item}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="ev-modal-section">
                  <span className="ev-modal-section-label">
                    <Images size={14} /> Event gallery
                    {galleryLength > 0 && <em>{galleryLength} photos</em>}
                  </span>

                  {galleryLength > 0 ? (
                    <div className="ev-gallery">
                      {gallery.map((src, i) => (
                        <button
                          type="button"
                          key={`${src}-${i}`}
                          className="ev-gallery-item"
                          onClick={() => setLightboxIndex(i)}
                          aria-label={`Open photo ${i + 1}`}
                        >
                          <img
                            src={src}
                            alt={`${event.title} photo ${i + 1}`}
                            loading="lazy"
                          />
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="ev-gallery-empty">
                      Photos from this event will be added soon.
                    </p>
                  )}
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* full-screen photo viewer */}
      {lightboxIndex !== null && galleryLength > 0 && (
        <Lightbox
          images={gallery}
          index={lightboxIndex}
          title={event.title}
          onClose={() => setLightboxIndex(null)}
          onPrev={() =>
            setLightboxIndex((i) => (i - 1 + galleryLength) % galleryLength)
          }
          onNext={() => setLightboxIndex((i) => (i + 1) % galleryLength)}
        />
      )}
    </>
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
      .sort((a, b) => {
        const aUp = isUpcoming(a.date);
        const bUp = isUpcoming(b.date);

        // upcoming first (soonest first), then past (most recent first)
        if (aUp && bUp) return new Date(a.date) - new Date(b.date);
        if (!aUp && !bUp) return new Date(b.date) - new Date(a.date);
        return aUp ? -1 : 1;
      });
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
