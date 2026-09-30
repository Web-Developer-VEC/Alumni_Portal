import React, { useEffect, useState } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import styles from "./Gallery.module.css";
import api from "../../api/api";

// Convert a backend gallery document into the shape the UI uses
const toAlbum = (gallery) => ({
    id: gallery._id,
    title: gallery.caption || "Untitled",
    cover: gallery.images[0]?.imageUrl,
    photos: gallery.images.map((img) => img.imageUrl),
});

const Gallery = () => {
    const [albums, setAlbums] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [photoIndex, setPhotoIndex] = useState(null);

    useEffect(() => {
        let cancelled = false;

        const load = async () => {
            try {
                const { data } = await api.get("/gallery");

                if (!cancelled) {
                    setAlbums(
                        data.galleries
                            .filter((g) => g.images.length > 0)
                            .map(toAlbum)
                    );
                }
            } catch (err) {
                console.error("Failed to load gallery:", err);
                if (!cancelled) {
                    setError("Could not load the gallery. Please try again.");
                }
            } finally {
                if (!cancelled) setLoading(false);
            }
        };

        load();
        return () => {
            cancelled = true;
        };
    }, []);

    const closeAlbum = () => {
        setSelectedAlbum(null);
        setPhotoIndex(null);
    };

    const closePhoto = () => setPhotoIndex(null);

    const showPrev = (event) => {
        event.stopPropagation();
        const total = selectedAlbum.photos.length;
        setPhotoIndex((i) => (i - 1 + total) % total);
    };

    const showNext = (event) => {
        event.stopPropagation();
        const total = selectedAlbum.photos.length;
        setPhotoIndex((i) => (i + 1) % total);
    };

    return (
        <div className={styles["gallery-page"]}>
            {/* HEADER */}
            <div className={styles["gallery-header"]}>
                <div>
                    <span className={styles["gallery-eyebrow"]}>
                        VEC Alumni
                    </span>
                    <h1>Gallery</h1>
                    <p>
                        Memories, celebrations and moments from our alumni
                        community.
                    </p>
                </div>
            </div>

            {/* STATES */}
            {loading && (
                <p className={styles["gallery-status"]}>Loading gallery...</p>
            )}

            {!loading && error && (
                <p className={styles["gallery-status"]}>{error}</p>
            )}

            {!loading && !error && albums.length === 0 && (
                <p className={styles["gallery-status"]}>
                    No photos have been added yet.
                </p>
            )}

            {/* ALBUM GRID */}
            {!loading && !error && albums.length > 0 && (
                <div className={styles["gallery-grid"]}>
                    {albums.map((album) => (
                        <article
                            key={album.id}
                            className={styles["gallery-card"]}
                        >
                            <div className={styles["gallery-image-wrapper"]}>
                                <img
                                    src={album.cover}
                                    alt={album.title}
                                    className={styles["gallery-cover"]}
                                    loading="lazy"
                                />

                                <div className={styles["photo-count"]}>
                                    <Images size={14} />
                                    {album.photos.length}
                                </div>
                            </div>

                            <div className={styles["gallery-card-content"]}>
                                <h2>{album.title}</h2>

                                <button
                                    type="button"
                                    onClick={() => setSelectedAlbum(album)}
                                >
                                    View More
                                </button>
                            </div>
                        </article>
                    ))}
                </div>
            )}

            {/* ALBUM MODAL */}
            {selectedAlbum && (
                <div
                    className={styles["album-overlay"]}
                    onClick={closeAlbum}
                >
                    <div
                        className={styles["album-modal"]}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className={styles["album-close"]}
                            onClick={closeAlbum}
                        >
                            <X size={20} />
                        </button>

                        <div className={styles["album-header"]}>
                            <div>
                                <span>PHOTO ALBUM</span>
                                <h2>{selectedAlbum.title}</h2>
                            </div>

                            <div className={styles["album-count"]}>
                                {selectedAlbum.photos.length} Photos
                            </div>
                        </div>

                        <div className={styles["album-grid"]}>
                            {selectedAlbum.photos.map((photo, index) => (
                                <button
                                    key={photo}
                                    type="button"
                                    className={styles["album-photo"]}
                                    onClick={() => setPhotoIndex(index)}
                                >
                                    <img
                                        src={photo}
                                        alt={`${selectedAlbum.title} ${index + 1}`}
                                        loading="lazy"
                                    />
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* FULL PHOTO VIEW */}
            {selectedAlbum && photoIndex !== null && (
                <div
                    className={styles["photo-viewer"]}
                    onClick={closePhoto}
                >
                    <button
                        type="button"
                        className={styles["photo-viewer-close"]}
                        onClick={closePhoto}
                    >
                        <X size={24} />
                    </button>

                    {selectedAlbum.photos.length > 1 && (
                        <button
                            type="button"
                            className={`${styles["photo-nav"]} ${styles["photo-nav-prev"]}`}
                            onClick={showPrev}
                        >
                            <ChevronLeft size={28} />
                        </button>
                    )}

                    <img
                        src={selectedAlbum.photos[photoIndex]}
                        alt={selectedAlbum.title}
                        onClick={(event) => event.stopPropagation()}
                    />

                    {selectedAlbum.photos.length > 1 && (
                        <button
                            type="button"
                            className={`${styles["photo-nav"]} ${styles["photo-nav-next"]}`}
                            onClick={showNext}
                        >
                            <ChevronRight size={28} />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

export default Gallery;