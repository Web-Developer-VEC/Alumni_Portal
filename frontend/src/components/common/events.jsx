import React, { useEffect, useMemo, useState } from "react";
import "./Events.css";
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
} from "lucide-react";

/* =========================================================
   CONFIG
========================================================= */

const EVENTS_API_URL = "/api/events";
const USE_DUMMY_DATA = true;

const DUMMY_EVENTS = [
  {
    _id: "evt-001",
    title: "VEC Alumni Meet 2026",
    description:
      "An evening of reconnecting with classmates, revisiting old memories and celebrating the VEC spirit together on campus.",
    date: "2026-11-15",
    startTime: "10:00 AM",
    endTime: "2:00 PM",
    venue: "Main Auditorium, Velammal Engineering College",
    locationType: "physical",
    imageUrl:
      "https://images.unsplash.com/photo-1511578314322-379afb476865?w=900&q=80",
    registrationLink: "https://forms.gle/example-alumni-meet",
    organizer: "Alumni Cell",
    category: "alumni-meet",
    capacity: 300,
    guestSpeakers: ["Arun Kumar", "Priya S", "Rahul V"],
  },
  {
    _id: "evt-002",
    title: "Alumni Industry Connect",
    description:
      "Meet professionals across product, engineering and design, and build meaningful connections for your next career move.",
    date: "2026-12-05",
    startTime: "5:00 PM",
    endTime: "8:00 PM",
    venue: "ITC Grand Chola, Chennai",
    locationType: "physical",
    imageUrl:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=900&q=80",
    registrationLink: "https://forms.gle/example-industry-connect",
    organizer: "Career & Mentorship Committee",
    category: "networking",
    capacity: 150,
    guestSpeakers: ["Keerthana R", "Vignesh M"],
  },
  {
    _id: "evt-003",
    title: "Alumni Mentorship Session",
    description:
      "Experienced alumni share career insights, interview tips and guidance for students entering the tech industry.",
    date: "2026-10-20",
    startTime: "6:30 PM",
    endTime: "8:00 PM",
    venue: "Online via Google Meet",
    locationType: "online",
    imageUrl: "",
    registrationLink: "https://forms.gle/example-mentorship",
    organizer: "Alumni Cell",
    category: "career",
    capacity: 100,
    guestSpeakers: ["Harish Kumar"],
  },
  {
    _id: "evt-004",
    title: "Tech Skills Bootcamp",
    description:
      "A hands-on workshop covering the latest in AI, cloud computing and full-stack development, led by alumni engineers.",
    date: "2026-11-28",
    startTime: "9:00 AM",
    endTime: "4:00 PM",
    venue: "CSE Block, Velammal Engineering College",
    locationType: "hybrid",
    imageUrl:
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?w=900&q=80",
    registrationLink: "",
    organizer: "Department of AI & DS",
    category: "workshop",
    capacity: 80,
    guestSpeakers: ["Divya S", "Sanjay Kumar", "Nithya R", "Karthik S"],
  },
  {
    _id: "evt-005",
    title: "Department Batch Meetup",
    description:
      "Celebrate your department's legacy and reconnect with batchmates over dinner and nostalgia.",
    date: "2026-09-12",
    startTime: "7:00 PM",
    endTime: "10:00 PM",
    venue: "Velammal Engineering College Grounds",
    locationType: "physical",
    imageUrl:
      "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=900&q=80",
    registrationLink: "https://forms.gle/example-batch-meetup",
    organizer: "Department Alumni Committee",
    category: "reunion",
    capacity: null,
    guestSpeakers: [],
  },
  {
    _id: "evt-006",
    title: "Startup & Innovation Summit",
    description:
      "Alumni entrepreneurs pitch their ideas and connect with investors and mentors from across the industry.",
    date: "2027-01-18",
    startTime: "11:00 AM",
    endTime: "3:00 PM",
    venue: "WeWork Prestige Central, Bengaluru",
    locationType: "physical",
    imageUrl:
      "https://images.unsplash.com/photo-1556761175-5973dc0f32e7?w=900&q=80",
    registrationLink: "https://forms.gle/example-startup-summit",
    organizer: "Entrepreneurship Cell",
    category: "networking",
    capacity: 200,
    guestSpeakers: ["Swetha P", "Adithya R"],
  },
  {
    _id: "evt-007",
    title: "AI in Industry Webinar",
    description:
      "A webinar exploring how alumni are applying AI and machine learning to solve real business problems.",
    date: "2026-10-02",
    startTime: "4:00 PM",
    endTime: "5:30 PM",
    venue: "Online via Zoom",
    locationType: "online",
    imageUrl:
      "https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=900&q=80",
    registrationLink: "https://forms.gle/example-ai-webinar",
    organizer: "Department of AI & DS",
    category: "webinar",
    capacity: 500,
    guestSpeakers: ["Rohit K", "Ananya M"],
  },
  {
    _id: "evt-008",
    title: "Research & Innovation Seminar",
    description:
      "A look back at last year's seminar on emerging research areas, industry-academic collaboration and publishing.",
    date: "2025-08-14",
    startTime: "10:00 AM",
    endTime: "1:00 PM",
    venue: "Seminar Hall, Velammal Engineering College",
    locationType: "physical",
    imageUrl:
      "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=900&q=80",
    registrationLink: "",
    organizer: "Research Cell",
    category: "seminar",
    capacity: 120,
    guestSpeakers: ["Gokul R"],
  },
];

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

  useEffect(() => {
    let cancelled = false;
    let timer;

    async function loadEvents() {
      setStatus("loading");

      if (USE_DUMMY_DATA) {
        timer = setTimeout(() => {
          if (!cancelled) {
            setEvents(DUMMY_EVENTS);
            setStatus("ready");
          }
        }, 500);

        return;
      }

      try {
        const res = await fetch(EVENTS_API_URL, {
          headers: { Accept: "application/json" },
        });

        if (!res.ok) {
          throw new Error(`Request failed with status ${res.status}`);
        }

        const data = await res.json();
        const list = Array.isArray(data) ? data : data.events || [];

        if (!cancelled) {
          setEvents(list);
          setStatus("ready");
        }
      } catch (err) {
        if (!cancelled) {
          setErrorMessage(err.message || "Something went wrong.");
          setStatus("error");
        }
      }
    }

    loadEvents();

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
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
    const base = { all: events.length };
    events.forEach((ev) => {
      base[ev.category] = (base[ev.category] || 0) + 1;
    });
    return base;
  }, [events]);

  return (
    <main className="ev-page">
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
              <h3>Couldn't load events</h3>
              <p>{errorMessage}</p>
            </div>
          )}

          {status === "ready" && filteredEvents.length === 0 && (
            <div className="ev-state">
              <Calendar size={34} />
              <h3>No events match your filters</h3>
              <p>Try a different category or clear your search.</p>
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