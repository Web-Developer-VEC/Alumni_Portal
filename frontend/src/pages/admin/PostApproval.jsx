import React, { useState } from "react";
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

const INITIAL_POSTS = [
    {
        id: 1,
        alumni: {
            name: "Priyadharsan T",
            batch: "AI & DS '26",
            designation: "Software Engineer",
            avatar: null,
            verified: true,
        },
        postedAgo: "3m ago",
        company: "ABC Technologies",
        role: "Software Engineer Intern",
        eligibility:
            "B.E / B.Tech (CSE, IT, AI&DS) · 2026 batch · CGPA 7.0+",
        location: "Chennai, Tamil Nadu",
        type: "Internship",
        freshers: true,
        referralAvailable: true,
        package: "₹25,000 / month",
        deadline: "30 Sep 2026",
        skills: ["Python", "React", "Node.js", "Machine Learning"],
        description:
            "ABC Technologies is looking for enthusiastic students and recent graduates to join their engineering team as Software Engineer Interns. Candidates will get an opportunity to work on real-world applications and collaborate with experienced developers.",
        tags: ["Hiring", "Internship", "Freshers"],
        directReferral: "Direct Team Referral",
        image:
            "https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1200&q=70",
        applyLink: "https://example.com/careers",
        views: 0,
        likes: 0,
        comments: 0,
    },
    {
        id: 2,
        alumni: {
            name: "Rahul Raj",
            batch: "AI & DS '23",
            designation: "Data Scientist",
            avatar: null,
            verified: true,
        },
        postedAgo: "2h ago",
        company: "Freshworks",
        role: "Introduction to Generative AI",
        eligibility: "Students from all departments · Open to all batches",
        location: "College Auditorium",
        type: "Full-time",
        package: null,
        deadline: null,
        skills: ["Generative AI", "LLMs", "Prompt Engineering"],
        description:
            "An interactive guest lecture covering the fundamentals, applications and future of Generative AI.",
        tags: ["Guest Lecture", "AI"],
        image:
            "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=1200&q=70",
        applyLink: "",
        views: 0,
        likes: 0,
        comments: 0,
    },
    {
        id: 3,
        alumni: {
            name: "Kadhirvelavan M",
            batch: "EEE '25",
            designation: "Frontend Developer",
            avatar: null,
            verified: true,
        },
        postedAgo: "1d ago",
        company: "Tech Studio",
        role: "Frontend Developer - Part Time",
        eligibility: "Students with React and JavaScript experience",
        location: "Bangalore, Karnataka",
        type: "Part-time",
        freshers: true,
        package: "₹18,000 / month",
        deadline: "15 Oct 2026",
        skills: ["React", "JavaScript", "CSS"],
        description:
            "Looking for a part-time frontend developer to help build and maintain responsive web applications.",
        tags: ["Hiring", "Frontend"],
        image:
            "https://images.unsplash.com/photo-1497366754035-f200968a6e72?auto=format&fit=crop&w=1200&q=70",
        applyLink: "",
        views: 0,
        likes: 0,
        comments: 0,
    },
];

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
    const [posts, setPosts] = useState(INITIAL_POSTS);
    const [popup, setPopup] = useState({
        type: null,
        post: null,
    });
    const [rejectionReason, setRejectionReason] = useState("");

    const openApprove = (post) => {
        setPopup({
            type: "approve",
            post,
        });
    };

    const openReject = (post) => {
        setRejectionReason("");
        setPopup({
            type: "reject",
            post,
        });
    };

    const closePopup = () => {
        setPopup({
            type: null,
            post: null,
        });
        setRejectionReason("");
    };

    const approvePost = () => {
        if (!popup.post) return;

        console.log("Approved post:", popup.post);

        setPosts((current) =>
            current.filter((post) => post.id !== popup.post.id)
        );

        closePopup();
    };

    const rejectPost = () => {
        if (!popup.post || !rejectionReason.trim()) return;

        console.log("Rejected post:", {
            post: popup.post,
            reason: rejectionReason.trim(),
        });

        setPosts((current) =>
            current.filter((post) => post.id !== popup.post.id)
        );

        closePopup();
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
                        <span className={styles["badge"]}>{post.type}</span>
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
                        label={post.type === "Internship" ? "Stipend" : "Package"}
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
