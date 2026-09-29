import React, { useState, useEffect } from "react";
import {
    ChevronDown,
    ChevronUp,
    User,
    Phone,
    Mail,
    CalendarDays,
    GraduationCap,
    BriefcaseBusiness,
    Building2,
    MapPin,
    Check,
    X,
    HeartHandshake,
    Users,
    BookOpen,
    BadgeDollarSign,
    Loader2,
    RotateCw,
    AlertCircle,
} from "lucide-react";
import { toast } from "react-toastify";
import {
    getPendingAlumni,
    approveAlumni,
    rejectAlumni,
} from "../../api/hod";

import styles from "./AlumniApproval.module.css";

function AlumniApproval() {
    const [expandedId, setExpandedId] = useState(null);
    const [popup, setPopup] = useState({
        type: null,
        alumni: null,
    });

    const [rejectionReason, setRejectionReason] = useState("");
    const [alumniList, setAlumniList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    // Fetch pending alumni from backend on mount
    useEffect(() => {
        loadPendingAlumni();
    }, []);

    const loadPendingAlumni = async () => {
        try {
            setLoading(true);
            setError(null);
            const res = await getPendingAlumni("PENDING");
            if (res.success && Array.isArray(res.data)) {
                setAlumniList(res.data);
            } else {
                setAlumniList([]);
            }
        } catch (err) {
            console.error("Failed to fetch pending alumni:", err);
            const msg =
                err.response?.data?.message ||
                "Failed to fetch pending registrations. Please check backend connection.";
            setError(msg);
        } finally {
            setLoading(false);
        }
    };

    const toggleAlumni = (id) => {
        setExpandedId((currentId) => (currentId === id ? null : id));
    };

    const handleApprove = (alumni) => {
        setPopup({
            type: "approve",
            alumni: alumni,
        });
    };

    const handleReject = (alumni) => {
        setRejectionReason("");
        setPopup({
            type: "reject",
            alumni: alumni,
        });
    };

    const confirmApprove = async () => {
        const alumni = popup.alumni;
        if (!alumni) return;

        const targetId = alumni.id || alumni._id || alumni.userId;
        try {
            setActionLoading(true);
            const res = await approveAlumni(targetId);

            if (res.success) {
                toast.success(
                    res.message ||
                        `${alumni.fullName || "Alumni"} approved successfully!`
                );

                setAlumniList((currentList) =>
                    currentList.filter(
                        (item) => (item.id || item._id) !== (alumni.id || alumni._id)
                    )
                );
                setExpandedId(null);
                setPopup({ type: null, alumni: null });
            } else {
                toast.error(res.message || "Failed to approve alumni registration.");
            }
        } catch (err) {
            console.error("Approve alumni error:", err);
            const errMsg =
                err.response?.data?.message ||
                "Error approving alumni. Please try again.";
            toast.error(errMsg);
        } finally {
            setActionLoading(false);
        }
    };

    const confirmReject = async () => {
        const alumni = popup.alumni;
        if (!alumni) return;

        if (!rejectionReason.trim()) {
            toast.warn("Please enter a reason for rejection.");
            return;
        }

        const targetId = alumni.id || alumni._id || alumni.userId;
        try {
            setActionLoading(true);
            const res = await rejectAlumni(targetId, rejectionReason.trim());

            if (res.success) {
                toast.success(
                    res.message ||
                        `${alumni.fullName || "Alumni"} registration rejected.`
                );

                setAlumniList((currentList) =>
                    currentList.filter(
                        (item) => (item.id || item._id) !== (alumni.id || alumni._id)
                    )
                );
                setExpandedId(null);
                setPopup({ type: null, alumni: null });
                setRejectionReason("");
            } else {
                toast.error(res.message || "Failed to reject alumni registration.");
            }
        } catch (err) {
            console.error("Reject alumni error:", err);
            const errMsg =
                err.response?.data?.message ||
                "Error rejecting alumni. Please try again.";
            toast.error(errMsg);
        } finally {
            setActionLoading(false);
        }
    };

    return (
        <div className={styles["approval-page"]}>
            {/* =========================
                PAGE HEADER
            ========================= */}
            <div className={styles["page-header"]}>
                <div>
                    <h1>Alumni Approval</h1>
                    <p>Review alumni registrations before approving them.</p>
                </div>

                <div className={styles["header-right"]}>
                    <button
                        type="button"
                        className={styles["refresh-button"]}
                        onClick={loadPendingAlumni}
                        title="Refresh List"
                        disabled={loading}
                    >
                        <RotateCw
                            size={18}
                            className={loading ? styles["spinner"] : ""}
                        />
                    </button>

                    <div className={styles["pending-count"]}>
                        <span>{loading ? "..." : alumniList.length}</span>
                        <p>Pending</p>
                    </div>
                </div>
            </div>

            {/* =========================
                LOADING STATE
            ========================= */}
            {loading && (
                <div className={styles["loading-state"]}>
                    <Loader2 size={36} className={styles["spinner"]} />
                    <p>Loading pending alumni registrations...</p>
                </div>
            )}

            {/* =========================
                ERROR STATE
            ========================= */}
            {!loading && error && (
                <div className={styles["error-state"]}>
                    <AlertCircle size={40} className={styles["error-icon"]} />
                    <h2>Unable to Load Registrations</h2>
                    <p>{error}</p>
                    <button
                        type="button"
                        className={styles["retry-button"]}
                        onClick={loadPendingAlumni}
                    >
                        <RotateCw size={16} />
                        Retry
                    </button>
                </div>
            )}

            {/* =========================
                ALUMNI LIST
            ========================= */}
            {!loading && !error && (
                <div className={styles["approval-list"]}>
                    {alumniList.length === 0 ? (
                        <div className={styles["empty-state"]}>
                            <Check size={42} />
                            <h2>No Pending Registrations</h2>
                            <p>All alumni registrations have been reviewed.</p>
                        </div>
                    ) : (
                        alumniList.map((alumni) => {
                            const isExpanded =
                                expandedId === (alumni.id || alumni._id);

                            return (
                                <div
                                    key={alumni.id || alumni._id}
                                    className={`${styles["alumni-card"]} ${
                                        isExpanded ? styles["expanded"] : ""
                                    }`}
                                >
                                    {/* =========================
                                        COLLAPSED HEADER
                                    ========================= */}
                                    <button
                                        type="button"
                                        className={styles["alumni-header"]}
                                        onClick={() =>
                                            toggleAlumni(alumni.id || alumni._id)
                                        }
                                    >
                                        <div className={styles["header-profile"]}>
                                            {alumni.profilePhoto ? (
                                                <img
                                                    src={alumni.profilePhoto}
                                                    alt={alumni.fullName}
                                                    className={
                                                        styles["header-image"]
                                                    }
                                                />
                                            ) : (
                                                <div
                                                    className={
                                                        styles[
                                                            "header-placeholder"
                                                        ]
                                                    }
                                                >
                                                    <User size={22} />
                                                </div>
                                            )}

                                            <div>
                                                <h2>
                                                    {alumni.fullName ||
                                                        "Unnamed Alumni"}
                                                </h2>

                                                <p>
                                                    {alumni.programme || "Degree"}
                                                    {" • "}
                                                    {alumni.department ||
                                                        "Department"}
                                                    {" • "}
                                                    {alumni.batch || "Batch"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className={styles["expand-icon"]}>
                                            {isExpanded ? (
                                                <ChevronUp size={22} />
                                            ) : (
                                                <ChevronDown size={22} />
                                            )}
                                        </div>
                                    </button>

                                    {/* =========================
                                        EXPANDED DETAILS
                                    ========================= */}
                                    {isExpanded && (
                                        <div className={styles["alumni-details"]}>
                                            {/* Profile Summary */}
                                            <div
                                                className={
                                                    styles["profile-section"]
                                                }
                                            >
                                                {alumni.profilePhoto ? (
                                                    <img
                                                        src={
                                                            alumni.profilePhoto
                                                        }
                                                        alt={alumni.fullName}
                                                        className={
                                                            styles[
                                                                "profile-image"
                                                            ]
                                                        }
                                                    />
                                                ) : (
                                                    <div
                                                        className={
                                                            styles[
                                                                "profile-placeholder"
                                                            ]
                                                        }
                                                    >
                                                        <User size={42} />
                                                    </div>
                                                )}

                                                <div
                                                    className={
                                                        styles["profile-summary"]
                                                    }
                                                >
                                                    <h2>{alumni.fullName}</h2>
                                                    <p>
                                                        {alumni.programme ||
                                                            "N/A"}
                                                        {" • "}
                                                        {alumni.department ||
                                                            "N/A"}
                                                    </p>
                                                    <span>
                                                        Batch:{" "}
                                                        {alumni.batch ||
                                                            "Not specified"}
                                                    </span>
                                                </div>
                                            </div>

                                            {/* =========================
                                                PERSONAL DETAILS
                                            ========================= */}
                                            <section
                                                className={
                                                    styles["details-section"]
                                                }
                                            >
                                                <h3>Personal Details</h3>

                                                <div
                                                    className={
                                                        styles["details-grid"]
                                                    }
                                                >
                                                    <Detail
                                                        icon={<User size={18} />}
                                                        label="Full Name"
                                                        value={alumni.fullName}
                                                    />

                                                    <Detail
                                                        icon={<Mail size={18} />}
                                                        label="Email"
                                                        value={alumni.email}
                                                    />

                                                    <Detail
                                                        icon={
                                                            <CalendarDays
                                                                size={18}
                                                            />
                                                        }
                                                        label="Date of Birth"
                                                        value={
                                                            alumni.dateOfBirth
                                                        }
                                                    />

                                                    <Detail
                                                        icon={<User size={18} />}
                                                        label="Gender"
                                                        value={alumni.gender}
                                                    />

                                                    <Detail
                                                        icon={<Phone size={18} />}
                                                        label="Mobile Number"
                                                        value={
                                                            alumni.mobileNumber
                                                        }
                                                    />
                                                </div>
                                            </section>

                                            {/* =========================
                                                ACADEMIC DETAILS
                                            ========================= */}
                                            <section
                                                className={
                                                    styles["details-section"]
                                                }
                                            >
                                                <h3>Academic Details</h3>

                                                <div
                                                    className={
                                                        styles["details-grid"]
                                                    }
                                                >
                                                    <Detail
                                                        icon={
                                                            <GraduationCap
                                                                size={18}
                                                            />
                                                        }
                                                        label="Register Number"
                                                        value={
                                                            alumni.registerNumber
                                                        }
                                                    />

                                                    <Detail
                                                        icon={
                                                            <GraduationCap
                                                                size={18}
                                                            />
                                                        }
                                                        label="Programme"
                                                        value={alumni.programme}
                                                    />

                                                    <Detail
                                                        icon={
                                                            <BookOpen
                                                                size={18}
                                                            />
                                                        }
                                                        label="Department"
                                                        value={
                                                            alumni.department
                                                        }
                                                    />

                                                    <Detail
                                                        icon={
                                                            <GraduationCap
                                                                size={18}
                                                            />
                                                        }
                                                        label="Batch"
                                                        value={alumni.batch}
                                                    />
                                                </div>
                                            </section>

                                            {/* =========================
                                                PROFESSIONAL DETAILS
                                            ========================= */}
                                            <section
                                                className={
                                                    styles["details-section"]
                                                }
                                            >
                                                <h3>Professional Details</h3>

                                                <div
                                                    className={
                                                        styles["details-grid"]
                                                    }
                                                >
                                                    <Detail
                                                        icon={
                                                            <BriefcaseBusiness
                                                                size={18}
                                                            />
                                                        }
                                                        label="Current Status"
                                                        value={
                                                            alumni.currentStatus
                                                        }
                                                    />

                                                    {alumni.company && (
                                                        <Detail
                                                            icon={
                                                                <Building2
                                                                    size={18}
                                                                />
                                                            }
                                                            label="Company / Organization"
                                                            value={alumni.company}
                                                        />
                                                    )}

                                                    {alumni.jobTitle && (
                                                        <Detail
                                                            icon={
                                                                <BriefcaseBusiness
                                                                    size={18}
                                                                />
                                                            }
                                                            label="Job Title / Designation"
                                                            value={alumni.jobTitle}
                                                        />
                                                    )}

                                                    {alumni.industry && (
                                                        <Detail
                                                            icon={
                                                                <Building2
                                                                    size={18}
                                                                />
                                                            }
                                                            label="Industry"
                                                            value={alumni.industry}
                                                        />
                                                    )}

                                                    {alumni.workLocation && (
                                                        <Detail
                                                            icon={
                                                                <MapPin
                                                                    size={18}
                                                                />
                                                            }
                                                            label="Work Location"
                                                            value={
                                                                alumni.workLocation
                                                            }
                                                        />
                                                    )}

                                                    {alumni.officialEmail && (
                                                        <Detail
                                                            icon={
                                                                <Mail size={18} />
                                                            }
                                                            label="Official Email"
                                                            value={
                                                                alumni.officialEmail
                                                            }
                                                        />
                                                    )}

                                                    {alumni.linkedInUrl && (
                                                        <div
                                                            className={
                                                                styles[
                                                                    "detail-item"
                                                                ]
                                                            }
                                                        >
                                                            <span
                                                                className={
                                                                    styles[
                                                                        "linkedin-icon"
                                                                    ]
                                                                }
                                                            >
                                                                <svg
                                                                    width="18"
                                                                    height="18"
                                                                    viewBox="0 0 24 24"
                                                                    aria-hidden="true"
                                                                >
                                                                    <path
                                                                        fill="#0A66C2"
                                                                        d="M20.45 20.45h-3.56v-5.58c0-1.33-.03-3.04-1.85-3.04-1.85 0-2.13 1.45-2.13 2.94v5.68H9.35V8.99h3.41v1.56h.05c.47-.9 1.63-1.85 3.36-1.85 3.6 0 4.27 2.37 4.27 5.46v6.29zM5.34 7.43a2.07 2.07 0 1 1 0-4.14 2.07 2.07 0 0 1 0 4.14zM7.12 20.45H3.56V8.99h3.56v11.46zM22.22 0H1.78C.8 0 0 .77 0 1.72v20.56C0 23.23.8 24 1.78 24h20.44C23.2 24 24 .77 24 1.72v20.56C24 23.23 23.2 24 22.22 24z"
                                                                    />
                                                                </svg>
                                                            </span>

                                                            <div>
                                                                <span>
                                                                    LinkedIn
                                                                </span>
                                                                <a
                                                                    href={
                                                                        alumni.linkedInUrl
                                                                    }
                                                                    target="_blank"
                                                                    rel="noreferrer"
                                                                >
                                                                    View
                                                                    LinkedIn
                                                                    Profile
                                                                </a>
                                                            </div>
                                                        </div>
                                                    )}
                                                </div>
                                            </section>

                                            {/* =========================
                                                ALUMNI CONTRIBUTIONS
                                            ========================= */}
                                            {alumni.contributions && (
                                                <section
                                                    className={
                                                        styles["details-section"]
                                                    }
                                                >
                                                    <h3>Alumni Contribution</h3>

                                                    <div
                                                        className={
                                                            styles[
                                                                "contribution-grid"
                                                            ]
                                                        }
                                                    >
                                                        <Contribution
                                                            active={
                                                                alumni
                                                                    .contributions
                                                                    ?.attendAlumniEvents
                                                            }
                                                            label="Attend Alumni Events"
                                                            icon={
                                                                <Users
                                                                    size={17}
                                                                />
                                                            }
                                                        />

                                                        <Contribution
                                                            active={
                                                                alumni
                                                                    .contributions
                                                                    ?.mentorStudents
                                                            }
                                                            label="Mentor Current Students"
                                                            icon={
                                                                <HeartHandshake
                                                                    size={17}
                                                                />
                                                            }
                                                        />

                                                        <Contribution
                                                            active={
                                                                alumni
                                                                    .contributions
                                                                    ?.internshipOpportunities
                                                            }
                                                            label="Provide Internship Opportunities"
                                                            icon={
                                                                <BriefcaseBusiness
                                                                    size={17}
                                                                />
                                                            }
                                                        />

                                                        <Contribution
                                                            active={
                                                                alumni
                                                                    .contributions
                                                                    ?.jobOpportunities
                                                            }
                                                            label="Provide Job Opportunities"
                                                            icon={
                                                                <Building2
                                                                    size={17}
                                                                />
                                                            }
                                                        />

                                                        <Contribution
                                                            active={
                                                                alumni
                                                                    .contributions
                                                                    ?.guestLectures
                                                            }
                                                            label="Give Guest Lectures"
                                                            icon={
                                                                <BookOpen
                                                                    size={17}
                                                                />
                                                            }
                                                        />

                                                        <Contribution
                                                            active={
                                                                alumni
                                                                    .contributions
                                                                    ?.supportCollegeActivities
                                                            }
                                                            label="Support College Activities"
                                                            icon={
                                                                <HeartHandshake
                                                                    size={17}
                                                                />
                                                            }
                                                        />

                                                        <Contribution
                                                            active={
                                                                alumni
                                                                    .contributions
                                                                    ?.donations
                                                            }
                                                            label="Make Donations"
                                                            icon={
                                                                <BadgeDollarSign
                                                                    size={17}
                                                                />
                                                            }
                                                        />
                                                    </div>
                                                </section>
                                            )}

                                            {/* =========================
                                                ADDRESS
                                            ========================= */}
                                            {(alumni.address ||
                                                alumni.city ||
                                                alumni.state ||
                                                alumni.country ||
                                                alumni.pincode) && (
                                                <section
                                                    className={
                                                        styles["details-section"]
                                                    }
                                                >
                                                    <h3>Address</h3>

                                                    <div
                                                        className={
                                                            styles["details-grid"]
                                                        }
                                                    >
                                                        {alumni.address && (
                                                            <Detail
                                                                icon={
                                                                    <MapPin
                                                                        size={18}
                                                                    />
                                                                }
                                                                label="Address"
                                                                value={
                                                                    alumni.address
                                                                }
                                                            />
                                                        )}

                                                        {alumni.city && (
                                                            <Detail
                                                                icon={
                                                                    <MapPin
                                                                        size={18}
                                                                    />
                                                                }
                                                                label="City"
                                                                value={alumni.city}
                                                            />
                                                        )}

                                                        {alumni.state && (
                                                            <Detail
                                                                icon={
                                                                    <MapPin
                                                                        size={18}
                                                                    />
                                                                }
                                                                label="State"
                                                                value={alumni.state}
                                                            />
                                                        )}

                                                        {alumni.country && (
                                                            <Detail
                                                                icon={
                                                                    <MapPin
                                                                        size={18}
                                                                    />
                                                                }
                                                                label="Country"
                                                                value={
                                                                    alumni.country
                                                                }
                                                            />
                                                        )}

                                                        {alumni.pincode && (
                                                            <Detail
                                                                icon={
                                                                    <MapPin
                                                                        size={18}
                                                                    />
                                                                }
                                                                label="Pincode"
                                                                value={
                                                                    alumni.pincode
                                                                }
                                                            />
                                                        )}
                                                    </div>
                                                </section>
                                            )}

                                            {/* =========================
                                                ACTIONS
                                            ========================= */}
                                            <div
                                                className={
                                                    styles["approval-actions"]
                                                }
                                            >
                                                <button
                                                    type="button"
                                                    className={
                                                        styles["reject-button"]
                                                    }
                                                    onClick={() =>
                                                        handleReject(alumni)
                                                    }
                                                >
                                                    <X size={18} />
                                                    Reject
                                                </button>

                                                <button
                                                    type="button"
                                                    className={
                                                        styles["approve-button"]
                                                    }
                                                    onClick={() =>
                                                        handleApprove(alumni)
                                                    }
                                                >
                                                    <Check size={18} />
                                                    Accept Alumni
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            );
                        })
                    )}
                </div>
            )}

            {/* =========================
                APPROVE POPUP
            ========================= */}
            {popup.type === "approve" && popup.alumni && (
                <div
                    className={styles["popup-overlay"]}
                    onClick={() =>
                        !actionLoading &&
                        setPopup({
                            type: null,
                            alumni: null,
                        })
                    }
                >
                    <div
                        className={styles["popup-card"]}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div
                            className={`${styles["popup-icon"]} ${styles["approve-icon"]}`}
                        >
                            <Check size={24} />
                        </div>

                        <h2>Approve Alumni?</h2>

                        <p>
                            Are you sure you want to approve{" "}
                            <strong>
                                {popup.alumni.fullName || "this alumni"}
                            </strong>
                            's registration?
                        </p>

                        <div className={styles["popup-actions"]}>
                            <button
                                type="button"
                                className={styles["popup-cancel"]}
                                onClick={() =>
                                    setPopup({
                                        type: null,
                                        alumni: null,
                                    })
                                }
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className={styles["popup-approve"]}
                                onClick={confirmApprove}
                                disabled={actionLoading}
                            >
                                {actionLoading ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className={styles["spinner"]}
                                        />
                                        Approving...
                                    </>
                                ) : (
                                    <>
                                        <Check size={17} />
                                        Accept Alumni
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* =========================
                REJECT POPUP
            ========================= */}
            {popup.type === "reject" && popup.alumni && (
                <div
                    className={styles["popup-overlay"]}
                    onClick={() =>
                        !actionLoading &&
                        setPopup({
                            type: null,
                            alumni: null,
                        })
                    }
                >
                    <div
                        className={styles["popup-card"]}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div
                            className={`${styles["popup-icon"]} ${styles["reject-icon"]}`}
                        >
                            <X size={24} />
                        </div>

                        <h2>Reject Registration?</h2>

                        <p>
                            Are you sure you want to reject{" "}
                            <strong>
                                {popup.alumni.fullName || "this alumni"}
                            </strong>
                            's registration?
                        </p>

                        <div className={styles["reason-container"]}>
                            <label htmlFor="rejectionReason">
                                Reason for rejection
                            </label>

                            <textarea
                                id="rejectionReason"
                                value={rejectionReason}
                                onChange={(event) =>
                                    setRejectionReason(event.target.value)
                                }
                                placeholder="Enter the reason for rejecting this registration..."
                                rows={4}
                                disabled={actionLoading}
                            />
                        </div>

                        <div className={styles["popup-actions"]}>
                            <button
                                type="button"
                                className={styles["popup-cancel"]}
                                onClick={() =>
                                    setPopup({
                                        type: null,
                                        alumni: null,
                                    })
                                }
                                disabled={actionLoading}
                            >
                                Cancel
                            </button>

                            <button
                                type="button"
                                className={styles["popup-reject"]}
                                onClick={confirmReject}
                                disabled={
                                    !rejectionReason.trim() || actionLoading
                                }
                            >
                                {actionLoading ? (
                                    <>
                                        <Loader2
                                            size={17}
                                            className={styles["spinner"]}
                                        />
                                        Rejecting...
                                    </>
                                ) : (
                                    <>
                                        <X size={17} />
                                        Reject Registration
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

/* =========================
   DETAIL COMPONENT
========================= */
function Detail({ icon, label, value }) {
    if (!value) return null;

    return (
        <div className={styles["detail-item"]}>
            {icon}

            <div>
                <span>{label}</span>
                <strong>{value}</strong>
            </div>
        </div>
    );
}

/* =========================
   CONTRIBUTION COMPONENT
========================= */
function Contribution({ active, label, icon }) {
    return (
        <div
            className={`${styles["contribution-item"]} ${
                active
                    ? styles["contribution-active"]
                    : styles["contribution-inactive"]
            }`}
        >
            <div className={styles["contribution-icon"]}>
                {active ? <Check size={15} /> : <X size={15} />}
            </div>

            {icon}

            <span>{label}</span>
        </div>
    );
}

export default AlumniApproval;