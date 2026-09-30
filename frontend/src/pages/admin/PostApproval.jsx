
import React, { useEffect, useState } from "react";
import {
    ArrowRight,
    CalendarCheck,
    Check,
    ChevronRight,
    Code2,
    Eye,
    Flag,
    Heart,
    MapPin,
    MessageCircle,
    School,
    UserRoundCheck,
    WalletCards,
    X,
} from "lucide-react";
import styles from "./PostApproval.module.css";
import api from "../../api/api";

const initials = (name = "") =>
    name
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();

const formatCount = (count = 0) => {
    if (count >= 1000) {
        return `${(count / 1000).toFixed(count >= 10000 ? 0 : 1).replace(".0", "")}k`;
    }

    return String(count);
};

const PostApproval = () => {
    const [posts, setPosts] = useState([]);
    const [popup, setPopup] = useState({
        type: null,
        post: null,
    });
    const [rejectionReason, setRejectionReason] = useState("");

    // ============================================================
    // FETCH PENDING POSTS
    // ============================================================

    const fetchPendingPosts = async () => {
        try {
            const response = await api.get("/hod/posts/pending");

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                        "Failed to fetch pending posts"
                );
            }

            /*
             * Backend returns:
             *
             * {
             *   _id,
             *   author: {
             *      name,
             *      email,
             *      photo,
             *      displayName
             *   },
             *   ...
             * }
             *
             * The existing UI expects:
             *
             * alumni: {
             *    name,
             *    avatar,
             *    ...
             * }
             *
             * So we only transform the API data here.
             * UI is untouched.
             */

            const formattedPosts = (response.data.posts || []).map(
                (post) => ({
                    ...post,

                    // Keep MongoDB ID separately for API operations
                    id: post._id,

                    // Adapt backend author to existing UI structure
                    alumni: {
                        ...(post.alumni || {}),
                        ...(post.author || {}),

                        name:
                            post.author?.name ||
                            post.author?.displayName ||
                            post.alumni?.name ||
                            "Unknown Alumni",

                        avatar:
                            post.author?.photo ||
                            post.alumni?.avatar ||
                            null,

                        batch:
                            post.author?.batch ||
                            post.alumni?.batch ||
                            post.batch ||
                            "",

                        designation:
                            post.author?.designation ||
                            post.alumni?.designation ||
                            post.designation ||
                            "",

                        verified:
                            post.author?.verified ??
                            post.alumni?.verified ??
                            post.verified ??
                            false,
                    },
                })
            );

            setPosts(formattedPosts);
        } catch (error) {
            console.error(
                "Failed to fetch pending posts:",
                error
            );

            console.error(
                "Backend response:",
                error.response?.data
            );
        }
    };

    useEffect(() => {
        fetchPendingPosts();
    }, []);

    // ============================================================
    // OPEN APPROVE POPUP
    // ============================================================

    const openApprove = (post) => {
        setPopup({
            type: "approve",
            post,
        });
    };

    // ============================================================
    // OPEN REJECT POPUP
    // ============================================================

    const openReject = (post) => {
        setRejectionReason("");
        setPopup({
            type: "reject",
            post,
        });
    };

    // ============================================================
    // CLOSE POPUP
    // ============================================================

    const closePopup = () => {
        setPopup({
            type: null,
            post: null,
        });

        setRejectionReason("");
    };

    // ============================================================
    // APPROVE POST
    // ============================================================

    const approvePost = async () => {
        if (!popup.post) return;

        try {
            const postId = popup.post._id || popup.post.id;

            const response = await api.patch(
                `/hod/posts/approve/${postId}`
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                        "Failed to approve post"
                );
            }

            // Remove from existing UI after successful backend action
            setPosts((current) =>
                current.filter(
                    (post) =>
                        (post._id || post.id) !== postId
                )
            );

            closePopup();
        } catch (error) {
            console.error("Approve post error:", error);

            console.error(
                "Backend response:",
                error.response?.data
            );
        }
    };

    // ============================================================
    // REJECT POST
    // ============================================================

    const rejectPost = async () => {
        if (!popup.post || !rejectionReason.trim()) return;

        try {
            const postId = popup.post._id || popup.post.id;

            const response = await api.patch(
                `/hod/posts/reject/${postId}`,
                {
                    reason: rejectionReason.trim(),
                }
            );

            if (!response.data?.success) {
                throw new Error(
                    response.data?.message ||
                        "Failed to reject post"
                );
            }

            // Remove from existing UI after successful backend action
            setPosts((current) =>
                current.filter(
                    (post) =>
                        (post._id || post.id) !== postId
                )
            );

            closePopup();
        } catch (error) {
            console.error("Reject post error:", error);

            console.error(
                "Backend response:",
                error.response?.data
            );
        }
    };

    return (
        <div className={styles["post-approval-page"]}>
            <div className={styles["approval-header"]}>
                <div>
                    <div className={styles["header-kicker"]}>
                        <Flag size={15} />
                        Admin Moderation
                    </div>

                    <h1>Post Approval</h1>

                    <p>
                        Review the original alumni post before it is published
                        to the portal.
                    </p>
                </div>

                <div className={styles["pending-count"]}>
                    <span>{posts.length}</span>
                    <small>Pending Posts</small>
                </div>
            </div>

            {posts.length === 0 ? (
                <div className={styles["empty-state"]}>
                    <div className={styles["empty-icon"]}>
                        <Check size={30} />
                    </div>
                    <h2>No pending posts</h2>
                    <p>All submitted posts have been reviewed.</p>
                </div>
            ) : (
                <div className={styles["approval-list"]}>
                    {posts.map((post) => (
                        <section
                            key={post.id}
                            className={styles["approval-item"]}
                        >
                            <AdminPostCard
                                post={post}
                                onApprove={openApprove}
                                onReject={openReject}
                            />
                        </section>
                    ))}
                </div>
            )}

            {popup.type && popup.post && (
                <div
                    className={styles["popup-overlay"]}
                    onMouseDown={closePopup}
                >
                    <div
                        className={styles["popup"]}
                        onMouseDown={(event) => event.stopPropagation()}
                    >
                        <div
                            className={`${styles["popup-icon"]} ${
                                popup.type === "approve"
                                    ? styles["popup-icon-success"]
                                    : styles["popup-icon-danger"]
                            }`}
                        >
                            {popup.type === "approve" ? (
                                <Check size={27} />
                            ) : (
                                <X size={27} />
                            )}
                        </div>

                        <h2>
                            {popup.type === "approve"
                                ? "Approve this post?"
                                : "Reject this post?"}
                        </h2>

                        <p>
                            {popup.type === "approve"
                                ? "The post will be published and become visible on the alumni portal."
                                : "The post will not be published. Please provide a reason for rejecting it."}
                        </p>

                        <strong className={styles["popup-title"]}>
                            {popup.post.role}
                        </strong>

                        {popup.type === "reject" && (
                            <textarea
                                value={rejectionReason}
                                onChange={(event) =>
                                    setRejectionReason(event.target.value)
                                }
                                placeholder="Enter rejection reason..."
                                rows={4}
                                className={styles["rejection-textarea"]}
                            />
                        )}

                        <div className={styles["popup-actions"]}>
                            <button
                                type="button"
                                className={styles["popup-cancel"]}
                                onClick={closePopup}
                            >
                                Cancel
                            </button>

                            {popup.type === "approve" ? (
                                <button
                                    type="button"
                                    className={styles["popup-approve"]}
                                    onClick={approvePost}
                                >
                                    <Check size={16} />
                                    Approve &amp; Publish
                                </button>
                            ) : (
                                <button
                                    type="button"
                                    className={styles["popup-reject"]}
                                    disabled={!rejectionReason.trim()}
                                    onClick={rejectPost}
                                >
                                    <X size={16} />
                                    Reject Post
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

const AdminPostCard = ({ post, onApprove, onReject }) => {
    return (
        <article className={styles["job-card"]}>
            <div className={styles["card-header"]}>
                <div className={styles["card-header-left"]}>
                    <div className={styles["avatar-wrap"]}>
                        {post.alumni.avatar ? (
                            <img
                                src={post.alumni.avatar}
                                alt={post.alumni.name}
                                className={styles["avatar-img"]}
                            />
                        ) : (
                            <div className={styles["avatar-fallback"]}>
                                {initials(post.alumni.name)}
                            </div>
                        )}

                        {post.alumni.verified && (
                            <span className={styles["verified-badge"]}>
                                <UserRoundCheck size={12} />
                            </span>
                        )}
                    </div>

                    <div className={styles["alumni-info"]}>
                        <div className={styles["alumni-name-row"]}>
                            <span className={styles["alumni-name"]}>
                                {post.alumni.name}
                            </span>

                            <span className={styles["batch-tag"]}>
                                {post.alumni.batch}
                            </span>

                            <span className={styles["posted-ago"]}>
                                · {post.postedAgo}
                            </span>
                        </div>

                        <span className={styles["designation-text"]}>
                            {post.alumni.designation} at {post.company}
                        </span>
                    </div>
                </div>

                <div className={styles["review-badge"]}>
                    <span />
                    Pending Review
                </div>
            </div>

            <div className={styles["hero-banner"]}>
                {post.image ? (
                    <img
                        src={post.image}
                        alt={`${post.company} workplace`}
                        className={styles["hero-img"]}
                    />
                ) : (
                    <div className={styles["hero-gradient"]}>
                        <div>
                            <span>
                                {post.type
                                    ? `${post.type} Program`
                                    : "Opportunity"}
                            </span>
                            <h2>{post.role}</h2>
                        </div>

                        <div className={styles["hero-monogram"]}>
                            {initials(post.company)}
                        </div>
                    </div>
                )}

                <div className={styles["hero-overlay"]} />

                <div className={styles["hero-badges"]}>
                    {post.type && (
                        <span className={styles["badge"]}>
                            {post.type}
                        </span>
                    )}

                    {post.freshers && (
                        <span
                            className={`${styles["badge"]} ${styles["badge-freshers"]}`}
                        >
                            Freshers Welcome
                        </span>
                    )}

                    {post.referralAvailable && (
                        <span
                            className={`${styles["badge"]} ${styles["badge-referral"]}`}
                        >
                            Referral Available
                        </span>
                    )}
                </div>

                <div className={styles["hero-bottom-bar"]}>
                    <div>
                        <div className={styles["hero-company-label"]}>
                            {post.company}
                        </div>
                        <h2>{post.role}</h2>
                    </div>

                    {post.directReferral && (
                        <div className={styles["referral-pill"]}>
                            <UserRoundCheck size={14} />
                            {post.directReferral}
                        </div>
                    )}
                </div>
            </div>

            <div className={styles["card-body"]}>
                {post.description && (
                    <p className={styles["description-text"]}>
                        {post.description}
                    </p>
                )}

                {post.tags?.length > 0 && (
                    <div className={styles["tags-row"]}>
                        {post.tags.map((tag) => (
                            <span key={tag}>#{tag}</span>
                        ))}
                    </div>
                )}

                <div className={styles["meta-grid"]}>
                    <MetaPill
                        icon={<WalletCards />}
                        label={
                            post.type === "Internship"
                                ? "Stipend"
                                : "Package"
                        }
                        value={post.package}
                    />

                    <MetaPill
                        icon={<MapPin />}
                        label="Location"
                        value={post.location}
                    />

                    <MetaPill
                        icon={<CalendarCheck />}
                        label="Deadline"
                        value={post.deadline}
                    />

                    <MetaPill
                        icon={<School />}
                        label="Eligibility"
                        value={post.eligibility}
                    />
                </div>

                {post.skills?.length > 0 && (
                    <div className={styles["skills-row"]}>
                        <span className={styles["skills-label"]}>
                            Skills:
                        </span>

                        {post.skills.map((skill) => (
                            <span
                                key={skill}
                                className={styles["skill-chip"]}
                            >
                                {skill}
                            </span>
                        ))}
                    </div>
                )}

                {post.applyLink && (
                    <div className={styles["cta-wrap"]}>
                        <a
                            href={post.applyLink}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={styles["cta-btn"]}
                        >
                            <span>View Original Application Link</span>
                            <ArrowRight className={styles["cta-icon"]} />
                        </a>
                    </div>
                )}
            </div>

            {/* ---------- Admin moderation controls ---------- */}
            <div className={styles["moderation-bar"]}>
                <div className={styles["moderation-info"]}>
                    <span className={styles["moderation-dot"]} />
                    <div>
                        <strong>Waiting for approval</strong>
                        <span>
                            Review this post before publishing it to the portal.
                        </span>
                    </div>
                </div>

                <div className={styles["moderation-actions"]}>
                    <button
                        type="button"
                        className={styles["reject-button"]}
                        onClick={() => onReject(post)}
                    >
                        <X size={17} />
                        Reject Post
                    </button>

                    <button
                        type="button"
                        className={styles["approve-button"]}
                        onClick={() => onApprove(post)}
                    >
                        <Check size={17} />
                        Approve &amp; Publish
                    </button>
                </div>
            </div>
        </article>
    );
};

const MetaPill = ({ icon, label, value }) => {
    if (!value) return null;

    return (
        <div className={styles["meta-pill"]}>
            <span className={styles["meta-pill-icon"]}>{icon}</span>

            <div className={styles["meta-pill-text"]}>
                <span>{label}</span>
                <strong>{value}</strong>
            </div>
        </div>
    );
};

export default PostApproval;
