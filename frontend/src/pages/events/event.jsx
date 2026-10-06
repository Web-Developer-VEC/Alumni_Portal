import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
  useRef,
} from "react";
import { useNavigate, useLocation } from "react-router-dom";
import "./event.css";
import {
  getAllEvents,
  createEvent,
  updateEvent,
  deleteEvent,
} from "../../api/event";
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
  ChevronLeft,
  ChevronRight,
  Images,
  Pencil,
  Trash2,
  Plus,
  UploadCloud,
  CheckCircle2,
  AlertCircle,
  Camera,
  Play,
  Film,
  Star,
  PlusCircle,
} from "lucide-react";

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

const CATEGORY_ORDER = [
  "all",
  "past",
  "upcoming",
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

function isVideoUrl(url) {
  if (typeof url !== "string") return false;
  return (
    /\.(mp4|webm|ogg|mov|m4v)(\?.*)?$/i.test(url) ||
    url.startsWith("data:video/") ||
    url.includes("youtube.com") ||
    url.includes("youtu.be") ||
    url.includes("vimeo.com")
  );
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

function EventCard({ event, onViewMore, isAdmin, onEdit, onDelete }) {
  const { day, month, weekday } = formatDateParts(event.date);
  const categoryLabel = CATEGORY_LABELS[event.category] || "Event";
  const upcoming = isUpcoming(event.date);
  const hasGallery = getGallery(event).length > 0;

  const autoTone = useImageTone(event.imageUrl);
  const tone = event.textTone || autoTone;

  return (
    <article
      className={`ev-card ev-card--${tone} ${upcoming ? "" : "ev-card--past"}`}
      onClick={() => onViewMore(event)}
      tabIndex={0}
      role="button"
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onViewMore(event);
        }
      }}
    >
      <div className="ev-card-inner">
        <div className="ev-card-media">
          {event.imageUrl && (
            <img src={event.imageUrl} alt={event.title} loading="lazy" />
          )}
        </div>

        <span className="ev-card-category">{categoryLabel}</span>

        {/* Admin Action Icons at Top Right Corner */}
        {isAdmin && (
          <div
            className="ev-card-admin-actions"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="ev-card-admin-btn ev-card-admin-btn--edit"
              onClick={(e) => {
                e.stopPropagation();
                onEdit(event);
              }}
              title="Edit Event"
              aria-label="Edit Event"
            >
              <Pencil size={13} />
            </button>
            <button
              type="button"
              className="ev-card-admin-btn ev-card-admin-btn--delete"
              onClick={(e) => {
                e.stopPropagation();
                onDelete(event);
              }}
              title="Delete Event"
              aria-label="Delete Event"
            >
              <Trash2 size={13} />
            </button>
          </div>
        )}

        {!upcoming && <span className="ev-card-past-flag">PAST EVENT</span>}

        <div className="ev-card-body">
          <span className="ev-card-date-chip">
            {weekday ? `${weekday.slice(0, 3)}, ` : ""}
            {day} {month}
          </span>

          <h3>{event.title}</h3>

          <p className="ev-card-desc">{event.description}</p>

          <div className="ev-card-footer">
            <button
              type="button"
              className="ev-arrow-btn"
              onClick={(e) => {
                e.stopPropagation();
                onViewMore(event);
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

  /* auto-scroll every 3.5s (continuous auto-scroll, paused when modal viewer is open) */
  useEffect(() => {
    if (count < 2 || paused) return undefined;
    const timer = setInterval(next, 3500);
    return () => clearInterval(timer);
  }, [count, paused, next]);

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
   HOOK: useIsAdmin
========================================================= */

function useIsAdmin() {
  const location = useLocation();
  return useMemo(() => {
    try {
      const sessionUser = sessionStorage.getItem("user");
      const localUser = localStorage.getItem("user");
      const user = sessionUser
        ? JSON.parse(sessionUser)
        : localUser
          ? JSON.parse(localUser)
          : null;
      const role = String(user?.role || user?.userRole || user?.user_role || "")
        .trim()
        .toUpperCase();
      return (
        role === "ADMIN" ||
        role === "HOD" ||
        location.pathname.startsWith("/admin") ||
        location.pathname.startsWith("/hod")
      );
    } catch {
      return (
        location.pathname.startsWith("/admin") ||
        location.pathname.startsWith("/hod")
      );
    }
  }, [location.pathname]);
}

/* =========================================================
   COMPONENT: EventFormModal (Upload images & details popup)
========================================================= */

function EventFormModal({ isOpen, eventToEdit, onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "workshop",
    date: "",
    startTime: "",
    endTime: "",
    venue: "",
    locationType: "physical",
    organizer: "",
    registrationLink: "",
    capacity: "",
    guestSpeakers: "",
  });

  const [mediaList, setMediaList] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

  useEffect(() => {
    if (eventToEdit) {
      let dateStr = "";
      if (eventToEdit.date) {
        const d = new Date(eventToEdit.date);
        if (!isNaN(d.getTime())) {
          dateStr = d.toISOString().split("T")[0];
        }
      }

      setFormData({
        title: eventToEdit.title || "",
        description: eventToEdit.description || "",
        category: eventToEdit.category || "workshop",
        date: dateStr,
        startTime: eventToEdit.startTime || "",
        endTime: eventToEdit.endTime || "",
        venue: eventToEdit.venue || "",
        locationType: eventToEdit.locationType || "physical",
        organizer: eventToEdit.organizer || "",
        registrationLink: eventToEdit.registrationLink || "",
        capacity:
          eventToEdit.capacity != null ? String(eventToEdit.capacity) : "",
        guestSpeakers: Array.isArray(eventToEdit.guestSpeakers)
          ? eventToEdit.guestSpeakers.join(", ")
          : "",
      });

      // Extract all media items from event
      const initialMedia = [];
      const seen = new Set();
      const addMediaItem = (item, isCover = false, name = "") => {
        if (!item) return;
        const url = typeof item === "string" ? item : item.url;
        if (!url || seen.has(url)) return;
        seen.add(url);
        const type = item.type || (isVideoUrl(url) ? "video" : "image");
        initialMedia.push({
          id: `media-${Date.now()}-${Math.random()}`,
          type,
          url,
          name: name || (type === "video" ? "Video Clip" : "Event Photo"),
          isCover: isCover || initialMedia.length === 0,
        });
      };

      if (eventToEdit.imageUrl) {
        addMediaItem(eventToEdit.imageUrl, true, "Cover Poster");
      }
      if (Array.isArray(eventToEdit.media)) {
        eventToEdit.media.forEach((m) => addMediaItem(m));
      }
      if (Array.isArray(eventToEdit.gallery)) {
        eventToEdit.gallery.forEach((m) => addMediaItem(m));
      }
      if (Array.isArray(eventToEdit.videos)) {
        eventToEdit.videos.forEach((m) => addMediaItem(m));
      }

      // Check localStorage for any cached media
      const keyId = eventToEdit._id || eventToEdit.id;
      if (keyId) {
        try {
          const cached = localStorage.getItem(`event_media_${keyId}`);
          if (cached) {
            const parsed = JSON.parse(cached);
            if (Array.isArray(parsed)) parsed.forEach((m) => addMediaItem(m));
          }
        } catch (e) {}
      }

      setMediaList(initialMedia);
    } else {
      setFormData({
        title: "",
        description: "",
        category: "workshop",
        date: "",
        startTime: "",
        endTime: "",
        venue: "",
        locationType: "physical",
        organizer: "",
        registrationLink: "",
        capacity: "",
        guestSpeakers: "",
      });
      setMediaList([]);
    }
    setError("");
  }, [eventToEdit, isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFilesChange = (e) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const newItems = [];
    for (const file of files) {
      const isVid =
        file.type.startsWith("video/") ||
        /\.(mp4|webm|ogg|mov)$/i.test(file.name);
      const maxSize = isVid ? 100 * 1024 * 1024 : 25 * 1024 * 1024;
      if (file.size > maxSize) {
        setError(`"${file.name}" exceeds ${isVid ? "100MB" : "25MB"} limit.`);
        continue;
      }

      const objUrl = URL.createObjectURL(file);
      const item = {
        id: `upload-${Date.now()}-${Math.random()}`,
        type: isVid ? "video" : "image",
        url: objUrl,
        file,
        name: file.name,
        isCover: false,
        dataUrl: null,
      };

      // Read as Data URL for persistent storage in localStorage
      if (file.size <= 15 * 1024 * 1024) {
        const reader = new FileReader();
        reader.onload = (re) => {
          item.dataUrl = re.target.result;
        };
        reader.readAsDataURL(file);
      }

      newItems.push(item);
    }

    setMediaList((prev) => {
      const combined = [...prev, ...newItems];
      if (combined.length && !combined.some((m) => m.isCover)) {
        const idx = Math.max(
          combined.findIndex((m) => m.type === "image"),
          0,
        );
        return combined.map((m, i) => ({ ...m, isCover: i === idx }));
      }
      return combined;
    });

    setError("");
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSetCover = (index, e) => {
    if (e) e.stopPropagation();
    setMediaList((prev) => {
      const selected = prev[index];
      if (!selected) return prev;
      const remaining = prev.filter((_, i) => i !== index);
      return [
        { ...selected, isCover: true },
        ...remaining.map((m) => ({ ...m, isCover: false })),
      ];
    });
  };

  const handleRemoveMedia = (index, e) => {
    if (e) e.stopPropagation();
    setMediaList((prev) => {
      const filtered = prev.filter((_, i) => i !== index);
      if (filtered.length && !filtered.some((m) => m.isCover)) {
        const idx = Math.max(
          filtered.findIndex((m) => m.type === "image"),
          0,
        );
        return filtered.map((m, i) => ({ ...m, isCover: i === idx }));
      }
      return filtered;
    });
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (
      !formData.title.trim() ||
      !formData.description.trim() ||
      !formData.date ||
      !formData.startTime.trim() ||
      !formData.endTime.trim() ||
      !formData.venue.trim() ||
      !formData.organizer.trim()
    ) {
      setError(
        "Please fill all required fields: Title, Description, Date, Start Time, End Time, Venue, and Organizer.",
      );
      return;
    }

    setSubmitting(true);
    const coverItem = mediaList.find((m) => m.isCover) || mediaList[0];
    if (coverItem?.type === "video") {
      setError("The cover poster must be an image. Set an image as the cover.");
      return;
    }

    try {
      const fd = new FormData();
      fd.append("title", formData.title.trim());
      fd.append("description", formData.description.trim());
      fd.append("date", formData.date);
      fd.append("startTime", formData.startTime.trim());
      fd.append("endTime", formData.endTime.trim());
      fd.append("venue", formData.venue.trim());
      fd.append("organizer", formData.organizer.trim());
      fd.append("category", formData.category);
      fd.append("locationType", formData.locationType);

      if (formData.registrationLink) {
        fd.append("registrationLink", formData.registrationLink.trim());
      }
      if (formData.capacity) {
        fd.append("capacity", formData.capacity);
      }
      if (formData.guestSpeakers) {
        const speakers = formData.guestSpeakers
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean);
        speakers.forEach((s) => fd.append("guestSpeakers[]", s));
      }

      // Find cover media file or image file for backend S3 single upload
      // only the chosen cover is uploaded; if it's an existing image, send nothing
      if (coverItem?.file) {
        fd.append("image", coverItem.file);
      }

      // Collect all media items
      const mediaPayload = mediaList.map((m) => ({
        url: m.dataUrl || m.url,
        type: m.type,
        name: m.name,
        isCover: !!m.isCover,
      }));
      const mediaUrls = mediaPayload.map((m) => m.url);
      const videoUrls = mediaPayload
        .filter((m) => m.type === "video")
        .map((m) => m.url);

      let savedEvent = null;

      if (eventToEdit) {
        const editId = eventToEdit._id || eventToEdit.id;
        await updateEvent(editId, fd);

        savedEvent = {
          ...eventToEdit,
          title: formData.title.trim(),
          description: formData.description.trim(),
          date: new Date(formData.date),
          startTime: formData.startTime.trim(),
          endTime: formData.endTime.trim(),
          venue: formData.venue.trim(),
          organizer: formData.organizer.trim(),
          category: formData.category,
          locationType: formData.locationType,
          registrationLink: formData.registrationLink.trim(),
          capacity: formData.capacity ? Number(formData.capacity) : null,
          imageUrl: coverItem?.url || eventToEdit.imageUrl,
          media: mediaUrls,
          gallery: mediaUrls,
          videos: videoUrls,
          guestSpeakers: formData.guestSpeakers
            ? formData.guestSpeakers
                .split(",")
                .map((s) => s.trim())
                .filter(Boolean)
            : [],
        };

        // Cache in localStorage for persistence
        if (editId) {
          try {
            localStorage.setItem(
              `event_media_${editId}`,
              JSON.stringify(mediaPayload),
            );
            localStorage.setItem(
              `event_media_title_${savedEvent.title.trim().toLowerCase()}`,
              JSON.stringify(mediaPayload),
            );
          } catch (e) {}
        }

        onSuccess(savedEvent, "Event updated successfully with all media!");
      } else {
        const res = await createEvent(fd);
        const created = res?.event || res;
        const createdId = created?._id || created?.id;

        savedEvent = {
          ...created,
          media: mediaUrls,
          gallery: mediaUrls,
          videos: videoUrls,
          imageUrl: created.imageUrl || coverItem?.url || "",
        };

        // Cache in localStorage for persistence
        try {
          if (createdId) {
            localStorage.setItem(
              `event_media_${createdId}`,
              JSON.stringify(mediaPayload),
            );
          }
          localStorage.setItem(
            `event_media_title_${formData.title.trim().toLowerCase()}`,
            JSON.stringify(mediaPayload),
          );
        } catch (e) {}

        onSuccess(savedEvent, "Event created and published with all media!");
      }
      onClose();
    } catch (err) {
      console.error("Save event error:", err.response || err);
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to save event. Please check the details and try again.";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  };

  const imageCount = mediaList.filter((m) => m.type === "image").length;
  const videoCount = mediaList.filter((m) => m.type === "video").length;

  return (
    <div className="ev-admin-modal-overlay" onClick={onClose}>
      <div
        className="ev-admin-modal"
        role="dialog"
        aria-modal="true"
        aria-label={eventToEdit ? "Edit Event" : "Create New Event"}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ev-admin-modal-header">
          <div>
            <h3>{eventToEdit ? "Edit Event Details" : "Create New Event"}</h3>
            <p>
              {eventToEdit
                ? "Add or manage multiple photos and videos, and update details for this event."
                : "Upload multiple event photos & videos, and fill in details for alumni and students."}
            </p>
          </div>
          <button
            type="button"
            className="ev-admin-modal-close"
            onClick={onClose}
            aria-label="Close modal"
          >
            <X size={18} />
          </button>
        </div>

        {error && (
          <div className="ev-form-error-banner">
            <AlertCircle size={16} />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="ev-admin-form">
          {/* =========================================================
              MULTI-MEDIA UPLOAD (IMAGES & VIDEOS)
          ========================================================= */}
          <div className="ev-form-group">
            <div className="ev-media-header-row">
              <label className="ev-form-label">
                <Camera size={14} /> Event Media (Images & Videos)
              </label>

              {mediaList.length > 0 && (
                <div className="ev-media-summary-badge">
                  <span>
                    {mediaList.length} total ({imageCount} photo
                    {imageCount !== 1 ? "s" : ""}, {videoCount} video
                    {videoCount !== 1 ? "s" : ""})
                  </span>
                </div>
              )}
            </div>

            <input
              ref={fileInputRef}
              type="file"
              multiple
              accept="image/*,video/*"
              onChange={handleFilesChange}
              style={{ display: "none" }}
            />

            {/* Media Grid or Empty Dropzone */}
            {mediaList.length === 0 ? (
              <div
                className="ev-image-dropzone"
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="ev-image-dropzone-prompt">
                  <UploadCloud size={38} className="ev-upload-icon" />
                  <p className="ev-upload-primary">
                    Click to browse & upload multiple images and videos
                  </p>
                  <span className="ev-upload-hint">
                    Supports JPG, PNG, WEBP, MP4, WEBM (Select multiple files at
                    once)
                  </span>
                  <button
                    type="button"
                    className="ev-upload-cta-btn"
                    onClick={(e) => {
                      e.stopPropagation();
                      fileInputRef.current?.click();
                    }}
                  >
                    <Plus size={14} /> Select Photos & Videos
                  </button>
                </div>
              </div>
            ) : (
              <div className="ev-media-grid-wrapper">
                <div className="ev-media-grid">
                  {mediaList.map((item, idx) => (
                    <div
                      key={item.id}
                      className={`ev-media-card ${
                        item.isCover ? "ev-media-card--cover" : ""
                      }`}
                      onClick={() => handleSetCover(idx)}
                      title={
                        item.isCover
                          ? "Current Cover Poster (Shown first in slider)"
                          : "Click to set as primary cover poster"
                      }
                    >
                      {/* Thumbnail View */}
                      <div className="ev-media-card-thumb">
                        {item.type === "video" ? (
                          <div className="ev-media-video-container">
                            <video
                              src={item.url}
                              className="ev-media-thumb-video"
                              muted
                              playsInline
                            />
                            <div className="ev-media-video-overlay-icon">
                              <Play size={18} fill="#ffffff" />
                            </div>
                          </div>
                        ) : (
                          <img
                            src={item.url}
                            alt={item.name || `Media ${idx + 1}`}
                            className="ev-media-thumb-img"
                          />
                        )}

                        {/* Badges */}
                        <div className="ev-media-badges-group">
                          {item.isCover && (
                            <span className="ev-media-badge-cover">
                              <Star size={10} fill="currentColor" /> Cover
                              Poster
                            </span>
                          )}
                          {item.type === "video" && (
                            <span className="ev-media-badge-type ev-media-badge-type--video">
                              <Film size={10} /> Video
                            </span>
                          )}
                        </div>

                        {/* Action buttons on card hover */}
                        <div
                          className="ev-media-card-hover-actions"
                          onClick={(e) => e.stopPropagation()}
                        >
                          {!item.isCover && (
                            <button
                              type="button"
                              className="ev-media-action-pill ev-media-action-pill--star"
                              onClick={(e) => handleSetCover(idx, e)}
                              title="Set as Primary Cover Poster"
                            >
                              <Star size={11} /> Make Cover
                            </button>
                          )}
                          <button
                            type="button"
                            className="ev-media-action-pill ev-media-action-pill--remove"
                            onClick={(e) => handleRemoveMedia(idx, e)}
                            title="Remove this media item"
                            aria-label="Remove item"
                          >
                            <Trash2 size={12} />
                          </button>
                        </div>
                      </div>

                      <span className="ev-media-item-name" title={item.name}>
                        {idx + 1}.{" "}
                        {item.name ||
                          (item.type === "video" ? "Video" : "Photo")}
                      </span>
                    </div>
                  ))}

                  {/* Add More Media Button Card */}
                  <button
                    type="button"
                    className="ev-media-add-card"
                    onClick={() => fileInputRef.current?.click()}
                    title="Upload more photos or videos"
                  >
                    <PlusCircle size={28} />
                    <span>+ Add More</span>
                    <small>Images or Videos</small>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* TITLE */}
          <div className="ev-form-group">
            <label className="ev-form-label">
              Event Title <span className="req">*</span>
            </label>
            <input
              type="text"
              name="title"
              className="ev-form-input"
              placeholder="e.g. Annual Alumni Meet 2026 / GenAI Bootcamp"
              value={formData.title}
              onChange={handleChange}
              required
            />
          </div>

          {/* CATEGORY & FORMAT ROW */}
          <div className="ev-form-row">
            <div className="ev-form-group">
              <label className="ev-form-label">Category</label>
              <select
                name="category"
                className="ev-form-select"
                value={formData.category}
                onChange={handleChange}
              >
                <option value="alumni-meet">Alumni Meet</option>
                <option value="reunion">Reunion</option>
                <option value="workshop">Workshop</option>
                <option value="seminar">Seminar</option>
                <option value="webinar">Webinar</option>
                <option value="networking">Networking</option>
                <option value="career">Career</option>
                <option value="other">Other</option>
              </select>
            </div>

            <div className="ev-form-group">
              <label className="ev-form-label">Format / Mode</label>
              <select
                name="locationType"
                className="ev-form-select"
                value={formData.locationType}
                onChange={handleChange}
              >
                <option value="physical">On Campus (Physical)</option>
                <option value="online">Online (Virtual)</option>
                <option value="hybrid">Hybrid</option>
              </select>
            </div>
          </div>

          {/* DATE & TIME ROW */}
          <div className="ev-form-row ev-form-row--3">
            <div className="ev-form-group">
              <label className="ev-form-label">
                Date <span className="req">*</span>
              </label>
              <input
                type="date"
                name="date"
                className="ev-form-input"
                value={formData.date}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ev-form-group">
              <label className="ev-form-label">
                Start Time <span className="req">*</span>
              </label>
              <input
                type="text"
                name="startTime"
                className="ev-form-input"
                placeholder="09:30 AM"
                value={formData.startTime}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ev-form-group">
              <label className="ev-form-label">
                End Time <span className="req">*</span>
              </label>
              <input
                type="text"
                name="endTime"
                className="ev-form-input"
                placeholder="04:30 PM"
                value={formData.endTime}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* VENUE & ORGANIZER */}
          <div className="ev-form-row">
            <div className="ev-form-group">
              <label className="ev-form-label">
                Venue / Hall <span className="req">*</span>
              </label>
              <input
                type="text"
                name="venue"
                className="ev-form-input"
                placeholder="e.g. Main Auditorium / Velammal Hall"
                value={formData.venue}
                onChange={handleChange}
                required
              />
            </div>

            <div className="ev-form-group">
              <label className="ev-form-label">
                Organizer <span className="req">*</span>
              </label>
              <input
                type="text"
                name="organizer"
                className="ev-form-input"
                placeholder="e.g. Department of AI & DS / Alumni Cell"
                value={formData.organizer}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* CAPACITY & REGISTRATION URL */}
          <div className="ev-form-row">
            <div className="ev-form-group">
              <label className="ev-form-label">Available Capacity</label>
              <input
                type="number"
                name="capacity"
                className="ev-form-input"
                placeholder="e.g. 100 seats (leave blank if open)"
                value={formData.capacity}
                onChange={handleChange}
                min="1"
              />
            </div>

            <div className="ev-form-group">
              <label className="ev-form-label">Registration Link</label>
              <input
                type="url"
                name="registrationLink"
                className="ev-form-input"
                placeholder="https://forms.gle/... or portal registration URL"
                value={formData.registrationLink}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* GUEST SPEAKERS */}
          <div className="ev-form-group">
            <label className="ev-form-label">Guest Speakers (Optional)</label>
            <input
              type="text"
              name="guestSpeakers"
              className="ev-form-input"
              placeholder="e.g. Dr. K. Ramesh (Director), Ms. S. Priya (VP Tech)"
              value={formData.guestSpeakers}
              onChange={handleChange}
            />
            <span className="ev-form-hint">
              Separate multiple speaker names with commas.
            </span>
          </div>

          {/* DESCRIPTION */}
          <div className="ev-form-group">
            <label className="ev-form-label">
              Description & Highlights <span className="req">*</span>
            </label>
            <textarea
              name="description"
              className="ev-form-textarea"
              rows={4}
              placeholder="Enter comprehensive overview, target participants, takeaways, and agenda..."
              value={formData.description}
              onChange={handleChange}
              required
            />
          </div>

          {/* ACTIONS FOOTER */}
          <div className="ev-admin-modal-footer">
            <button
              type="button"
              className="ev-admin-modal-cancel"
              onClick={onClose}
              disabled={submitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="ev-admin-modal-submit"
              disabled={submitting}
            >
              {submitting ? (
                <>
                  <RefreshCw size={15} className="ev-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <span>
                  {eventToEdit ? "Save Changes" : "Create & Publish Event"}
                </span>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* =========================================================
   COMPONENT: DeleteConfirmModal
========================================================= */

function DeleteConfirmModal({ event, isOpen, onClose, onConfirm, deleting }) {
  if (!isOpen || !event) return null;

  return (
    <div className="ev-admin-modal-overlay" onClick={onClose}>
      <div
        className="ev-delete-modal"
        role="dialog"
        aria-modal="true"
        aria-label="Confirm Delete Event"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="ev-delete-modal-icon">
          <Trash2 size={26} />
        </div>
        <h3>Delete Event?</h3>
        <p>
          Are you sure you want to permanently delete{" "}
          <strong>"{event.title}"</strong>? This will remove it from the
          calendar for all users.
        </p>
        <div className="ev-delete-modal-actions">
          <button
            type="button"
            className="ev-delete-cancel-btn"
            onClick={onClose}
            disabled={deleting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="ev-delete-confirm-btn"
            onClick={onConfirm}
            disabled={deleting}
          >
            {deleting ? (
              <>
                <RefreshCw size={14} className="ev-spin" /> Deleting...
              </>
            ) : (
              "Yes, Delete Event"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}

/* =========================================================
   MAIN PAGE: Events
========================================================= */

function Events() {
  const navigate = useNavigate();
  const location = useLocation();
  const isAdmin = useIsAdmin();

  const [events, setEvents] = useState([]);
  const [status, setStatus] = useState("loading"); // loading | ready | error
  const [errorMessage, setErrorMessage] = useState("");

  const [activeCategory, setActiveCategory] = useState("all");
  const [query, setQuery] = useState("");
  const [selectedEvent, setSelectedEvent] = useState(null);

  // Admin Modal States
  const [formOpen, setFormOpen] = useState(false);
  const [eventToEdit, setEventToEdit] = useState(null);
  const [eventToDelete, setEventToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = "success") => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3500);
  };

  const handleViewMore = (event) => {
    const id = event._id || event.id;
    if (id) {
      const basePath = location.pathname.replace(/\/+$/, "");
      navigate(`${basePath}/${id}`, { state: { event } });
    } else {
      setSelectedEvent(event);
    }
  };

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

      // Enhance with any multi-media saved in localStorage by admin
      const enhancedList = list.map((ev) => {
        const id = ev._id || ev.id;
        let localMedia = [];
        try {
          const cached =
            localStorage.getItem(`event_media_${id}`) ||
            (ev.title &&
              localStorage.getItem(
                `event_media_title_${ev.title.trim().toLowerCase()}`,
              ));
          if (cached) {
            localMedia = JSON.parse(cached);
          }
        } catch (e) {}

        if (Array.isArray(localMedia) && localMedia.length > 0) {
          const urls = localMedia.map((m) =>
            typeof m === "string" ? m : m.url,
          );
          const vids = localMedia
            .filter((m) =>
              typeof m === "object" ? m.type === "video" : isVideoUrl(m),
            )
            .map((m) => (typeof m === "string" ? m : m.url));

          return {
            ...ev,
            media: Array.from(new Set([...(ev.media || []), ...urls])),
            gallery: Array.from(new Set([...(ev.gallery || []), ...urls])),
            videos: Array.from(new Set([...(ev.videos || []), ...vids])),
          };
        }
        return ev;
      });

      setEvents(enhancedList);
      setStatus("ready");
    } catch (err) {
      console.error("Error loading events:", err);
      setErrorMessage(
        err.response?.data?.message ||
          err.message ||
          "Failed to load events from the server.",
      );
      setStatus("error");
    }
  };

  useEffect(() => {
    loadEvents();
  }, []);

  // Listen for ?create=true in URL (e.g. from navbar '+ Events' click)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("create") === "true" || params.get("action") === "create") {
      setEventToEdit(null);
      setFormOpen(true);
      navigate(location.pathname, { replace: true });
    }
  }, [location.search, location.pathname, navigate]);

  const handleOpenCreate = () => {
    setEventToEdit(null);
    setFormOpen(true);
  };

  const handleOpenEdit = (event) => {
    setEventToEdit(event);
    setFormOpen(true);
  };

  const handleOpenDelete = (event) => {
    setEventToDelete(event);
  };

  const handleDeleteConfirm = async () => {
    if (!eventToDelete) return;
    const id = eventToDelete._id || eventToDelete.id;
    setDeleting(true);

    try {
      await deleteEvent(id);

      // clear this browser's cached extra media for the event
      try {
        localStorage.removeItem(`event_media_${id}`);
        localStorage.removeItem(
          `event_media_title_${(eventToDelete.title || "").trim().toLowerCase()}`,
        );
      } catch {}

      setEvents((prev) => prev.filter((ev) => (ev._id || ev.id) !== id));
      showToast(`"${eventToDelete.title}" has been deleted.`, "success");
      setEventToDelete(null);
    } catch (err) {
      console.error("Delete event error:", err);
      showToast(
        err?.response?.data?.message || "Could not delete the event.",
        "error",
      );
    } finally {
      setDeleting(false);
    }
  };

  const handleFormSuccess = (_savedEvent, message) => {
    showToast(message, "success");
    loadEvents();
  };

  const filteredEvents = useMemo(() => {
    const q = query.trim().toLowerCase();

    return events
      .filter((ev) => {
        const up = isUpcoming(ev.date);

        // "past" option shows ONLY past events
        if (activeCategory === "past") {
          return !up;
        }

        // "upcoming" option shows ONLY upcoming events
        if (activeCategory === "upcoming") {
          return up;
        }

        // "all" option shows ALL present and past events
        if (activeCategory === "all") {
          return true;
        }

        // Specific category
        return ev.category === activeCategory;
      })
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

        // When viewing past events only, sort most recent first
        if (!aUp && !bUp) return new Date(b.date) - new Date(a.date);
        // When viewing upcoming events only, sort soonest first
        if (aUp && bUp) return new Date(a.date) - new Date(b.date);
        // Mixed: upcoming first (soonest first), then past (most recent first)
        return aUp ? -1 : 1;
      });
  }, [events, activeCategory, query]);

  const categoryCounts = useMemo(() => {
    let pastCount = 0;
    let upcomingCount = 0;
    const base = { all: events.length, past: 0, upcoming: 0 };

    events.forEach((ev) => {
      const up = isUpcoming(ev.date);
      if (up) {
        upcomingCount += 1;
      } else {
        pastCount += 1;
      }
      base[ev.category] = (base[ev.category] || 0) + 1;
    });

    base.past = pastCount;
    base.upcoming = upcomingCount;
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
              {CATEGORY_LABELS[key]}
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
          {/* Admin action bar placed below event types at top-right corner */}
          {isAdmin && (
            <div className="ev-section-admin-bar">
              <button
                type="button"
                className="ev-add-event-btn"
                onClick={handleOpenCreate}
                title="Create a new event"
              >
                <Plus size={16} strokeWidth={2.4} />
                <span>Events</span>
              </button>
            </div>
          )}
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
                  <p>
                    Check back later for upcoming alumni meets and college
                    events.
                  </p>
                  {isAdmin && (
                    <button
                      type="button"
                      className="ev-add-event-btn"
                      onClick={handleOpenCreate}
                      style={{ marginTop: "16px" }}
                    >
                      <Plus size={16} strokeWidth={2.4} />
                      <span>+ Create First Event</span>
                    </button>
                  )}
                </>
              ) : activeCategory === "past" ? (
                <>
                  <h3>No past events found</h3>
                  <p>There are currently no concluded events in the archive.</p>
                </>
              ) : activeCategory === "upcoming" ? (
                <>
                  <h3>No upcoming events scheduled</h3>
                  <p>Check back later for newly announced events.</p>
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
                  onViewMore={handleViewMore}
                  isAdmin={isAdmin}
                  onEdit={handleOpenEdit}
                  onDelete={handleOpenDelete}
                />
              ))}
            </div>
          )}

          {/* Generous blank space for mobile view so all events are fully visible above bottom navbars and browser chrome */}
          <div className="ev-mobile-bottom-space" aria-hidden="true" />
        </div>
      </section>

      {/* ---------- DETAILS MODAL (Fallback) ---------- */}
      {selectedEvent && (
        <EventDetailsModal
          event={selectedEvent}
          onClose={() => setSelectedEvent(null)}
        />
      )}

      {/* ---------- ADMIN EVENT FORM MODAL (Create & Edit) ---------- */}
      <EventFormModal
        isOpen={formOpen}
        eventToEdit={eventToEdit}
        onClose={() => {
          setFormOpen(false);
          setEventToEdit(null);
        }}
        onSuccess={handleFormSuccess}
      />

      {/* ---------- ADMIN DELETE CONFIRM MODAL ---------- */}
      <DeleteConfirmModal
        event={eventToDelete}
        isOpen={!!eventToDelete}
        onClose={() => setEventToDelete(null)}
        onConfirm={handleDeleteConfirm}
        deleting={deleting}
      />

      {/* ---------- TOAST FEEDBACK ---------- */}
      {toast && (
        <div className={`ev-toast ev-toast--${toast.type}`} role="status">
          {toast.type === "success" ? (
            <CheckCircle2 size={16} />
          ) : (
            <AlertCircle size={16} />
          )}
          <span>{toast.message}</span>
        </div>
      )}
    </main>
  );
}

export default Events;
