import React, { useState } from "react";
import { X, ChevronLeft, ChevronRight, Images } from "lucide-react";
import styles from "./Gallery.module.css";

const galleryData = [
    {
        id: 1,
        title: "Destiny 28",
        cover:
            "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1000&q=80",
        photos: [
            "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1501386761578-eac5c94b800a?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
        ],
    },

    {
        id: 2,
        title: "Grad 2023",
        cover:
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1000&q=80",
        photos: [
            "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1627556704302-624286467c65?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?auto=format&fit=crop&w=1200&q=80",
        ],
    },

    {
        id: 3,
        title: "Hira 2025",
        cover:
            "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80",
        photos: [
            "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1505373877841-8d25f7d46678?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1200&q=80",
        ],
    },

    {
        id: 4,
        title: "Namma VEC College Day 25",
        cover:
            "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1000&q=80",
        photos: [
            "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1503095396549-807759245b35?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=80",
        ],
    },

    {
        id: 5,
        title: "Riddhi 25",
        cover:
            "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1000&q=80",
        photos: [
            "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=80",
            "https://images.unsplash.com/photo-1521337581100-8ca9a73a5f79?auto=format&fit=crop&w=1200&q=80",
        ],
    },
];

const Gallery = () => {
    const [selectedAlbum, setSelectedAlbum] = useState(null);
    const [selectedPhoto, setSelectedPhoto] = useState(null);

    const openAlbum = (album) => {
        setSelectedAlbum(album);
    };

    const closeAlbum = () => {
        setSelectedAlbum(null);
        setSelectedPhoto(null);
    };

    const openPhoto = (photo) => {
        setSelectedPhoto(photo);
    };

    const closePhoto = () => {
        setSelectedPhoto(null);
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
                        Memories, celebrations and moments from
                        our alumni community.
                    </p>
                </div>
            </div>

            {/* ALBUM GRID */}
            <div className={styles["gallery-grid"]}>
                {galleryData.map((album) => (
                    <article
                        key={album.id}
                        className={styles["gallery-card"]}
                    >
                        <div className={styles["gallery-image-wrapper"]}>
                            <img
                                src={album.cover}
                                alt={album.title}
                                className={styles["gallery-cover"]}
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
                                onClick={() => openAlbum(album)}
                            >
                                View More
                            </button>
                        </div>
                    </article>
                ))}
            </div>

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
                            {selectedAlbum.photos.map(
                                (photo, index) => (
                                    <button
                                        key={index}
                                        type="button"
                                        className={
                                            styles["album-photo"]
                                        }
                                        onClick={() =>
                                            openPhoto(photo)
                                        }
                                    >
                                        <img
                                            src={photo}
                                            alt={`${selectedAlbum.title} ${index + 1}`}
                                        />
                                    </button>
                                )
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* FULL PHOTO VIEW */}
            {selectedPhoto && (
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

                    <img
                        src={selectedPhoto}
                        alt="Gallery"
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    />
                </div>
            )}
        </div>
    );
};

export default Gallery;