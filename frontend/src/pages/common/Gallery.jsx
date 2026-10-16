import React, { useEffect, useState } from "react";
import {
    X,
    ChevronLeft,
    ChevronRight,
    Images,
    Pencil,
    Trash2,
    Plus,
    Check,
} from "lucide-react";
import { useLocation } from "react-router-dom";
import styles from "./Gallery.module.css";

// =========================================================
// DUMMY GALLERY DATA
// ---------------------------------------------------------
// This page is completely frontend-only for now.
// No create/delete/insert API is used.
// =========================================================

const DUMMY_ALBUMS = [
    {
        id: "dummy-riddhi-25",
        title: "Riddhi 25",
        photos: [
            {
                id: "riddhi-1",
                url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=85",
            },
            {
                id: "riddhi-2",
                url: "https://images.unsplash.com/photo-1507504031003-b417219a0fde?auto=format&fit=crop&w=1200&q=85",
            },
            {
                id: "riddhi-3",
                url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=85",
            },
            {
                id: "riddhi-4",
                url: "https://images.unsplash.com/photo-1505236858219-8359eb29e329?auto=format&fit=crop&w=1200&q=85",
            },
        ],
    },
    {
        id: "dummy-college-day-25",
        title: "Namma VEC College Day 25",
        photos: [
            {
                id: "college-day-1",
                url: "https://images.unsplash.com/photo-1506157786151-b8491531f063?auto=format&fit=crop&w=1200&q=85",
            },
            {
                id: "college-day-2",
                url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85",
            },
            {
                id: "college-day-3",
                url: "https://images.unsplash.com/photo-1524368535928-5b5e00ddc76b?auto=format&fit=crop&w=1200&q=85",
            },
            {
                id: "college-day-4",
                url: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?auto=format&fit=crop&w=1200&q=85",
            },
        ],
    },
    {
        id: "dummy-hira-2025",
        title: "Hira 2025",
        photos: [
            {
                id: "hira-1",
                url: "https://images.unsplash.com/photo-1519167758481-83f550bb49b3?auto=format&fit=crop&w=1200&q=85",
            },
            {
                id: "hira-2",
                url: "https://images.unsplash.com/photo-1511795409834-ef04bbd61622?auto=format&fit=crop&w=1200&q=85",
            },
            {
                id: "hira-3",
                url: "https://images.unsplash.com/photo-1464366400600-7168b8af9bc3?auto=format&fit=crop&w=1200&q=85",
            },
            {
                id: "hira-4",
                url: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?auto=format&fit=crop&w=1200&q=85",
            },
        ],
    },
    {
        id: "dummy-grad-2023",
        title: "Grad 2023",
        photos: [
            {
                id: "grad-1",
                url: "https://images.unsplash.com/photo-1523050854058-8df90110c9f1?auto=format&fit=crop&w=1200&q=85",
            },
            {
                id: "grad-2",
                url: "https://images.unsplash.com/photo-1523580846011-d3a5bc25702b?auto=format&fit=crop&w=1200&q=85",
            },
            {
                id: "grad-3",
                url: "https://images.unsplash.com/photo-1627556704302-624286467c65?auto=format&fit=crop&w=1200&q=85",
            },
            {
                id: "grad-4",
                url: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?auto=format&fit=crop&w=1200&q=85",
            },
        ],
    },
    {
        id: "dummy-destiny-28",
        title: "Destiny 28",
        photos: [
            {
                id: "destiny-1",
                url: "https://images.unsplash.com/photo-1511578314322-379afb476865?auto=format&fit=crop&w=1200&q=85",
            },
            {
                id: "destiny-2",
                url: "https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?auto=format&fit=crop&w=1200&q=85",
            },
            {
                id: "destiny-3",
                url: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?auto=format&fit=crop&w=1200&q=85",
            },
            {
                id: "destiny-4",
                url: "https://images.unsplash.com/photo-1527529482837-4698179dc6ce?auto=format&fit=crop&w=1200&q=85",
            },
        ],
    },
];

const addCover = (album) => ({
    ...album,
    cover: album.photos[0]?.url || "",
});

const Gallery = () => {
    const location = useLocation();

    const isAdmin = location.pathname.startsWith("/admin");

    const [albums, setAlbums] = useState(() =>
        DUMMY_ALBUMS.map(addCover)
    );

    const [selectedAlbumId, setSelectedAlbumId] = useState(null);
    const [photoIndex, setPhotoIndex] = useState(null);

    const [isEditMode, setIsEditMode] = useState(false);
    const [selectedPhotos, setSelectedPhotos] = useState({});

    const [showAddGallery, setShowAddGallery] = useState(false);
    const [newGalleryTitle, setNewGalleryTitle] = useState("");
    const [newGalleryImages, setNewGalleryImages] = useState([]);


    const selectedAlbum = albums.find(
        (album) => album.id === selectedAlbumId
    );

    // If the user leaves /admin, editing is automatically disabled.
    useEffect(() => {
        if (!isAdmin) {
            setIsEditMode(false);
            setSelectedPhotos({});
        }
    }, [isAdmin]);

    // =========================================================
    // ALBUM / PHOTO VIEWER
    // =========================================================

    const openAlbum = (albumId) => {
        setSelectedAlbumId(albumId);
        setPhotoIndex(null);
    };

    const closeAlbum = () => {
        setSelectedAlbumId(null);
        setPhotoIndex(null);
    };

    const closePhoto = () => {
        setPhotoIndex(null);
    };

    const showPrev = (event) => {
        event.stopPropagation();

        if (!selectedAlbum) return;

        const total = selectedAlbum.photos.length;

        if (total === 0) return;

        setPhotoIndex((index) => (index - 1 + total) % total);
    };

    const showNext = (event) => {
        event.stopPropagation();

        if (!selectedAlbum) return;

        const total = selectedAlbum.photos.length;

        if (total === 0) return;

        setPhotoIndex((index) => (index + 1) % total);
    };

    // =========================================================
    // EDIT MODE
    // =========================================================

    const toggleEditMode = () => {
        if (!isAdmin) return;

        setIsEditMode((current) => !current);
        setSelectedPhotos({});
    };

    // =========================================================
    // IMAGE SELECTION
    // =========================================================

    const togglePhotoSelection = (albumId, photoId) => {
        if (!isAdmin || !isEditMode) return;

        setSelectedPhotos((current) => {
            const currentSelection = current[albumId] || [];
            const exists = currentSelection.includes(photoId);

            return {
                ...current,
                [albumId]: exists
                    ? currentSelection.filter((id) => id !== photoId)
                    : [...currentSelection, photoId],
            };
        });
    };

    // =========================================================
    // DUMMY DELETE GALLERY
    // =========================================================

    const deleteGallery = (album) => {
        if (!isAdmin || !isEditMode) return;

        const confirmed = window.confirm(
            `Delete "${album.title}" from this dummy gallery?`
        );

        if (!confirmed) return;

        setAlbums((current) =>
            current.filter((item) => item.id !== album.id)
        );

        setSelectedPhotos((current) => {
            const next = { ...current };
            delete next[album.id];
            return next;
        });

        if (selectedAlbumId === album.id) {
            closeAlbum();
        }
    };

    // =========================================================
    // DUMMY DELETE SELECTED PHOTOS
    // =========================================================

    const deleteSelectedPhotos = (album) => {
        if (!isAdmin || !isEditMode) return;

        const selected = selectedPhotos[album.id] || [];

        if (selected.length === 0) return;

        const confirmed = window.confirm(
            `Delete ${selected.length} selected image${
                selected.length > 1 ? "s" : ""
            } from this dummy gallery?`
        );

        if (!confirmed) return;

        const remainingPhotos = album.photos.filter(
            (photo) => !selected.includes(photo.id)
        );

        // If every image is deleted, remove the gallery card too.
        if (remainingPhotos.length === 0) {
            setAlbums((current) =>
                current.filter((item) => item.id !== album.id)
            );

            if (selectedAlbumId === album.id) {
                closeAlbum();
            }
        } else {
            setAlbums((current) =>
                current.map((item) =>
                    item.id === album.id
                        ? {
                              ...item,
                              photos: remainingPhotos,
                              cover: remainingPhotos[0].url,
                          }
                        : item
                )
            );
        }

        setSelectedPhotos((current) => ({
            ...current,
            [album.id]: [],
        }));

        setPhotoIndex(null);
    };

    // =========================================================
    // DUMMY INSERT IMAGES
    // =========================================================

    const handleInsertImages = (albumId, fileList) => {
        if (!isAdmin || !isEditMode || !fileList?.length) return;

        const files = Array.from(fileList).filter((file) =>
            file.type.startsWith("image/")
        );

        if (!files.length) return;

        const newPhotos = files.map((file, index) => ({
            id: `local-photo-${Date.now()}-${index}`,
            url: URL.createObjectURL(file),
            local: true,
        }));

        setAlbums((current) =>
            current.map((album) => {
                if (album.id !== albumId) return album;

                return {
                    ...album,
                    photos: [...album.photos, ...newPhotos],
                    cover: album.cover || newPhotos[0].url,
                };
            })
        );

    };

    // =========================================================
    // DUMMY NEW GALLERY
    // =========================================================

    const openAddGallery = () => {
        if (!isAdmin || !isEditMode) return;

        setNewGalleryTitle("");
        setNewGalleryImages([]);
        setShowAddGallery(true);
    };

    const closeAddGallery = () => {
        setShowAddGallery(false);
        setNewGalleryTitle("");
        setNewGalleryImages([]);
    };

    const handleNewGalleryImage = (event) => {
        const files = Array.from(event.target.files || []).filter((file) =>
            file.type.startsWith("image/")
        );

        if (!files.length) return;

        setNewGalleryImages((current) => [...current, ...files]);

        // Allow selecting the same file again later.
        event.target.value = "";
    };

    const removeNewGalleryImage = (index) => {
        setNewGalleryImages((current) =>
            current.filter((_, imageIndex) => imageIndex !== index)
        );
    };

    const createGallery = () => {
        if (!isAdmin || !isEditMode) return;

        if (!newGalleryImages.length) {
            alert("Please select at least one image.");
            return;
        }

        const timestamp = Date.now();

        const photos = newGalleryImages.map((file, index) => ({
            id: `local-photo-${timestamp}-${index}`,
            url: URL.createObjectURL(file),
            local: true,
        }));

        const newAlbum = {
            id: `local-gallery-${timestamp}`,
            title: newGalleryTitle.trim() || "New Gallery",
            cover: photos[0].url,
            photos,
            local: true,
        };

        setAlbums((current) => [...current, newAlbum]);
        closeAddGallery();
    };

    // =========================================================
    // RENDER
    // =========================================================

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

                {/* Visible only on /admin/... */}
                {isAdmin && (
                    <button
                        type="button"
                        className={
                            isEditMode
                                ? styles["edit-done-button"]
                                : styles["edit-button"]
                        }
                        onClick={toggleEditMode}
                    >
                        {isEditMode ? (
                            <>
                                <Check size={16} />
                                Save
                            </>
                        ) : (
                            <>
                                <Pencil size={16} />
                                Edit
                            </>
                        )}
                    </button>
                )}
            </div>

            {/* ALBUM GRID */}
            {albums.length === 0 ? (
                <p className={styles["gallery-status"]}>
                    No photos have been added yet.
                </p>
            ) : (
                <div className={styles["gallery-grid"]}>
                    {albums.map((album) => {
                        const selected = selectedPhotos[album.id] || [];

                        return (
                            <React.Fragment key={album.id}>
                                <article
                                    className={styles["gallery-card"]}
                                >
                                    <div
                                        className={
                                            styles["gallery-image-wrapper"]
                                        }
                                    >
                                        {album.cover ? (
                                            <img
                                                src={album.cover}
                                                alt={album.title}
                                                className={
                                                    styles["gallery-cover"]
                                                }
                                            />
                                        ) : (
                                            <div
                                                className={
                                                    styles[
                                                        "gallery-empty-cover"
                                                    ]
                                                }
                                            >
                                                No Image
                                            </div>
                                        )}

                                        <div
                                            className={styles["photo-count"]}
                                        >
                                            <Images size={14} />
                                            {album.photos.length}
                                        </div>

                                        {/* DELETE ENTIRE GALLERY */}
                                        {isAdmin && isEditMode && (
                                            <button
                                                type="button"
                                                className={
                                                    styles[
                                                        "gallery-delete-button"
                                                    ]
                                                }
                                                onClick={() =>
                                                    deleteGallery(album)
                                                }
                                                title="Delete gallery"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        )}
                                    </div>

                                    <div
                                        className={
                                            styles[
                                                "gallery-card-content"
                                            ]
                                        }
                                    >
                                        <h2>{album.title}</h2>

                                        <div
                                            className={
                                                styles[
                                                    "gallery-card-actions"
                                                ]
                                            }
                                        >
                                            <button
                                                type="button"
                                                onClick={() =>
                                                    openAlbum(album.id)
                                                }
                                            >
                                                View More
                                            </button>

                                        </div>
                                    </div>
                                </article>

                                {/* DELETE BUTTON BELOW THIS CARD */}
                                {isAdmin &&
                                    isEditMode &&
                                    selected.length > 0 && (
                                        <div
                                            className={
                                                styles[
                                                    "selected-delete-bar"
                                                ]
                                            }
                                        >
                                            <span>
                                                {selected.length} image
                                                {selected.length > 1
                                                    ? "s"
                                                    : ""} selected
                                            </span>

                                            <button
                                                type="button"
                                                onClick={() =>
                                                    deleteSelectedPhotos(
                                                        album
                                                    )
                                                }
                                            >
                                                <Trash2 size={15} />
                                                Delete Selected
                                            </button>
                                        </div>
                                    )}
                            </React.Fragment>
                        );
                    })}

                    {/* + BLANK GALLERY CARD */}
                    {isAdmin && isEditMode && (
                        <button
                            type="button"
                            className={styles["blank-gallery-card"]}
                            onClick={openAddGallery}
                        >
                            <div
                                className={styles["blank-gallery-icon"]}
                            >
                                <Plus size={28} />
                            </div>

                            <strong>Add New event</strong>

                            <span>
                                Select an image to create a gallery
                            </span>
                        </button>
                    )}
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
                            {selectedAlbum.photos.map((photo, index) => {
                                const isSelected = (
                                    selectedPhotos[selectedAlbum.id] || []
                                ).includes(photo.id);

                                return (
                                    <div
                                        key={photo.id}
                                        className={`${styles["album-photo-wrapper"]} ${
                                            isSelected
                                                ? styles[
                                                      "album-photo-selected"
                                                  ]
                                                : ""
                                        }`}
                                    >
                                        {/* CHECKBOX IN ADMIN EDIT MODE */}
                                        {isAdmin && isEditMode && (
                                            <label
                                                className={
                                                    styles["photo-checkbox"]
                                                }
                                                onClick={(event) =>
                                                    event.stopPropagation()
                                                }
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={isSelected}
                                                    onChange={() =>
                                                        togglePhotoSelection(
                                                            selectedAlbum.id,
                                                            photo.id
                                                        )
                                                    }
                                                />
                                                <span>
                                                    <Check size={13} />
                                                </span>
                                            </label>
                                        )}

                                        <button
                                            type="button"
                                            className={
                                                styles["album-photo"]
                                            }
                                            onClick={() => {
                                                if (isAdmin && isEditMode) {
                                                    togglePhotoSelection(
                                                        selectedAlbum.id,
                                                        photo.id
                                                    );
                                                } else {
                                                    setPhotoIndex(index);
                                                }
                                            }}
                                        >
                                            <img
                                                src={photo.url}
                                                alt={`${selectedAlbum.title} ${
                                                    index + 1
                                                }`}
                                                loading="lazy"
                                            />
                                        </button>
                                    </div>
                                );
                            })}

                            {/* INSERT PHOTOS - ADMIN ONLY */}
                            {isAdmin && isEditMode && (
                                <label
                                    className={styles["album-insert-card"]}
                                    title="Insert multiple images"
                                >
                                    <input
                                        type="file"
                                        accept="image/*"
                                        multiple
                                        onChange={(event) => {
                                            handleInsertImages(
                                                selectedAlbum.id,
                                                event.target.files
                                            );
                                            event.target.value = "";
                                        }}
                                    />

                                    <span className={styles["album-insert-icon"]}>
                                        <Plus size={26} />
                                    </span>

                                    <strong>Insert Photos</strong>
                                    <span>Choose multiple images</span>
                                </label>
                            )}
                        </div>

                        {isAdmin &&
                            isEditMode &&
                            (selectedPhotos[selectedAlbum.id] || [])
                                .length > 0 && (
                                <div
                                    className={
                                        styles["modal-delete-bar"]
                                    }
                                >
                                    <span>
                                        {
                                            selectedPhotos[
                                                selectedAlbum.id
                                            ].length
                                        } selected
                                    </span>

                                    <button
                                        type="button"
                                        onClick={() =>
                                            deleteSelectedPhotos(
                                                selectedAlbum
                                            )
                                        }
                                    >
                                        <Trash2 size={15} />
                                        Delete Selected
                                    </button>
                                </div>
                            )}
                    </div>
                </div>
            )}

            {/* FULL PHOTO VIEWER */}
            {selectedAlbum &&
                photoIndex !== null &&
                selectedAlbum.photos[photoIndex] && (
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
                            src={selectedAlbum.photos[photoIndex].url}
                            alt={selectedAlbum.title}
                            onClick={(event) =>
                                event.stopPropagation()
                            }
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

            {/* NEW GALLERY MODAL */}
            {showAddGallery && (
                <div
                    className={styles["add-gallery-overlay"]}
                    onClick={closeAddGallery}
                >
                    <div
                        className={styles["add-gallery-modal"]}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className={styles["add-gallery-close"]}
                            onClick={closeAddGallery}
                        >
                            <X size={20} />
                        </button>

                        <div
                            className={styles["add-gallery-header"]}
                        >
                            <span>NEW GALLERY</span>
                            <h2>Create Gallery</h2>
                            <p>
                                Select an image to create a new dummy
                                gallery.
                            </p>
                        </div>

                        <div
                            className={styles["add-gallery-field"]}
                        >
                            <label>Gallery Name</label>
                            <input
                                type="text"
                                value={newGalleryTitle}
                                onChange={(event) =>
                                    setNewGalleryTitle(
                                        event.target.value
                                    )
                                }
                                placeholder="Enter gallery name"
                            />
                        </div>

                        <div className={styles["new-gallery-upload-area"]}>
                            <label className={styles["image-upload-box"]}>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    onChange={handleNewGalleryImage}
                                />

                                <Plus size={28} />
                                <strong>Insert Images</strong>
                                <span>Choose multiple JPG, PNG or WEBP files</span>
                            </label>

                            {newGalleryImages.length > 0 && (
                                <div className={styles["new-gallery-preview-grid"]}>
                                    {newGalleryImages.map((file, index) => (
                                        <div
                                            key={`${file.name}-${index}`}
                                            className={styles["new-gallery-preview"]}
                                        >
                                            <img
                                                src={URL.createObjectURL(file)}
                                                alt={file.name}
                                            />

                                            <button
                                                type="button"
                                                onClick={() => removeNewGalleryImage(index)}
                                                title="Remove image"
                                            >
                                                <X size={13} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            )}

                            {newGalleryImages.length > 0 && (
                                <p className={styles["new-gallery-image-count"]}>
                                    {newGalleryImages.length} image
                                    {newGalleryImages.length > 1 ? "s" : ""} selected
                                </p>
                            )}
                        </div>

                        <div
                            className={styles["add-gallery-actions"]}
                        >
                            <button
                                type="button"
                                className={styles["cancel-button"]}
                                onClick={closeAddGallery}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className={
                                    styles["create-gallery-button"]
                                }
                                onClick={createGallery}
                            >
                                Create Gallery
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Gallery;
