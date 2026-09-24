import React, { useState } from "react";
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
} from "lucide-react";

import styles from "./AlumniApproval.module.css";

const pendingAlumni = [
    {
        id: 1,

        // Personal Details
        fullName: "Priyadharsan T",
        dateOfBirth: "12/05/2004",
        gender: "Male",
        profilePhoto: "/images/alumni/priyadharsan.jpg",
        mobileNumber: "+91 9876543210",

        // Academic Details
        registerNumber: "22AD123",
        programme: "B.Tech",
        department: "AI & Data Science",
        batch: "2022-2026",

        // Professional Details
        currentStatus: "Employed",
        company: "ABC Technologies",
        jobTitle: "Software Engineer",
        industry: "Information Technology",
        workLocation: "Chennai",
        officialEmail: "priyadharsan@company.com",
        linkedInUrl: "https://linkedin.com/in/priyadharsan",

        // Alumni Contributions
        contributions: {
            attendAlumniEvents: true,
            mentorStudents: true,
            internshipOpportunities: true,
            jobOpportunities: false,
            guestLectures: true,
            supportCollegeActivities: false,
            donations: true,
        },

        // Address
        address: "12, Example Street",
        city: "Chennai",
        state: "Tamil Nadu",
        country: "India",
        pincode: "600001",
    },

    {
        id: 2,

        // Personal Details
        fullName: "Ananya Krishnan",
        dateOfBirth: "",
        gender: "Female",
        profilePhoto: "",
        mobileNumber: "+91 9123456789",

        // Academic Details
        registerNumber: "21CS045",
        programme: "B.E",
        department: "Computer Science and Engineering",
        batch: "2021-2025",

        // Professional Details
        currentStatus: "Business Owner",
        company: "Ananya Digital Solutions",
        jobTitle: "",
        industry: "Information Technology",
        workLocation: "Coimbatore",
        officialEmail: "",
        linkedInUrl: "",

        // Alumni Contributions
        contributions: {
            attendAlumniEvents: true,
            mentorStudents: false,
            internshipOpportunities: true,
            jobOpportunities: true,
            guestLectures: false,
            supportCollegeActivities: true,
            donations: false,
        },

        // Address
        address: "",
        city: "Coimbatore",
        state: "Tamil Nadu",
        country: "India",
        pincode: "",
    },
];

function AlumniApproval() {
    const [expandedId, setExpandedId] = useState(null);
    const [popup, setPopup] = useState({
        type: null,
        alumni: null,
    });

    const [rejectionReason, setRejectionReason] = useState("");
    const [alumniList, setAlumniList] =
        useState(pendingAlumni);

    const toggleAlumni = (id) => {
        setExpandedId((currentId) =>
            currentId === id ? null : id
        );
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
    const confirmApprove = () => {
        const alumni = popup.alumni;

        if (!alumni) return;

        setAlumniList((currentList) =>
            currentList.filter(
                (item) => item.id !== alumni.id
            )
        );

        setExpandedId(null);

        setPopup({
            type: null,
            alumni: null,
        });

        // Later:
        // await approveAlumni(alumni.id);
    };

    const confirmReject = () => {
        const alumni = popup.alumni;

        if (!alumni) return;

        if (!rejectionReason.trim()) {
            return;
        }

        setAlumniList((currentList) =>
            currentList.filter(
                (item) => item.id !== alumni.id
            )
        );

        setExpandedId(null);

        console.log("Rejected:", alumni.id);
        console.log("Reason:", rejectionReason);

        setPopup({
            type: null,
            alumni: null,
        });

        setRejectionReason("");

        // Later:
        // await rejectAlumni(
        //     alumni.id,
        //     rejectionReason
        // );
    };

    return (
        <div className={styles["approval-page"]}>
            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className={styles["page-header"]}>
                <div>
                    <h1>Alumni Approval</h1>

                    <p>
                        Review alumni registrations before
                        approving them.
                    </p>
                </div>

                <div className={styles["pending-count"]}>
                    <span>{alumniList.length}</span>
                    <p>Pending</p>
                </div>
            </div>

            {/* =========================
                ALUMNI LIST
            ========================= */}

            <div className={styles["approval-list"]}>
                {alumniList.length === 0 ? (
                    <div className={styles["empty-state"]}>
                        <Check size={42} />

                        <h2>
                            No Pending Registrations
                        </h2>

                        <p>
                            All alumni registrations have
                            been reviewed.
                        </p>
                    </div>
                ) : (
                    alumniList.map((alumni) => {
                        const isExpanded =
                            expandedId === alumni.id;

                        return (
                            <div
                                key={alumni.id}
                                className={`${styles["alumni-card"]} ${isExpanded
                                    ? styles["expanded"]
                                    : ""
                                    }`}
                            >
                                {/* =========================
                                    COLLAPSED HEADER
                                ========================= */}

                                <button
                                    type="button"
                                    className={
                                        styles[
                                        "alumni-header"
                                        ]
                                    }
                                    onClick={() =>
                                        toggleAlumni(
                                            alumni.id
                                        )
                                    }
                                >
                                    <div
                                        className={
                                            styles[
                                            "header-profile"
                                            ]
                                        }
                                    >
                                        {alumni.profilePhoto ? (
                                            <img
                                                src={
                                                    alumni.profilePhoto
                                                }
                                                alt={
                                                    alumni.fullName
                                                }
                                                className={
                                                    styles[
                                                    "header-image"
                                                    ]
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
                                                <User
                                                    size={22}
                                                />
                                            </div>
                                        )}

                                        <div>
                                            <h2>
                                                {
                                                    alumni.fullName
                                                }
                                            </h2>

                                            <p>
                                                {
                                                    alumni.programme
                                                }
                                                {" • "}
                                                {
                                                    alumni.department
                                                }
                                                {" • "}
                                                {
                                                    alumni.batch
                                                }
                                            </p>
                                        </div>
                                    </div>

                                    <div
                                        className={
                                            styles[
                                            "expand-icon"
                                            ]
                                        }
                                    >
                                        {isExpanded ? (
                                            <ChevronUp
                                                size={22}
                                            />
                                        ) : (
                                            <ChevronDown
                                                size={22}
                                            />
                                        )}
                                    </div>
                                </button>

                                {/* =========================
                                    EXPANDED DETAILS
                                ========================= */}

                                {isExpanded && (
                                    <div
                                        className={
                                            styles[
                                            "alumni-details"
                                            ]
                                        }
                                    >
                                        {/* Profile */}
                                        <div
                                            className={
                                                styles[
                                                "profile-section"
                                                ]
                                            }
                                        >
                                            {alumni.profilePhoto ? (
                                                <img
                                                    src={
                                                        alumni.profilePhoto
                                                    }
                                                    alt={
                                                        alumni.fullName
                                                    }
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
                                                    <User
                                                        size={
                                                            42
                                                        }
                                                    />
                                                </div>
                                            )}

                                            <div
                                                className={
                                                    styles[
                                                    "profile-summary"
                                                    ]
                                                }
                                            >
                                                <h2>
                                                    {
                                                        alumni.fullName
                                                    }
                                                </h2>

                                                <p>
                                                    {
                                                        alumni.programme
                                                    }
                                                    {" • "}
                                                    {
                                                        alumni.department
                                                    }
                                                </p>

                                                <span>
                                                    Batch{" "}
                                                    {
                                                        alumni.batch
                                                    }
                                                </span>
                                            </div>
                                        </div>

                                        {/* =========================
                                            PERSONAL DETAILS
                                        ========================= */}

                                        <section
                                            className={
                                                styles[
                                                "details-section"
                                                ]
                                            }
                                        >
                                            <h3>
                                                Personal
                                                Details
                                            </h3>

                                            <div
                                                className={
                                                    styles[
                                                    "details-grid"
                                                    ]
                                                }
                                            >
                                                <Detail
                                                    icon={
                                                        <User
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    }
                                                    label="Full Name"
                                                    value={
                                                        alumni.fullName
                                                    }
                                                />

                                                <Detail
                                                    icon={
                                                        <CalendarDays
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    }
                                                    label="Date of Birth"
                                                    value={
                                                        alumni.dateOfBirth
                                                    }
                                                />

                                                <Detail
                                                    icon={
                                                        <User
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    }
                                                    label="Gender"
                                                    value={
                                                        alumni.gender
                                                    }
                                                />

                                                <Detail
                                                    icon={
                                                        <Phone
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    }
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
                                                styles[
                                                "details-section"
                                                ]
                                            }
                                        >
                                            <h3>
                                                Academic
                                                Details
                                            </h3>

                                            <div
                                                className={
                                                    styles[
                                                    "details-grid"
                                                    ]
                                                }
                                            >
                                                <Detail
                                                    icon={
                                                        <GraduationCap
                                                            size={
                                                                18
                                                            }
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
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    }
                                                    label="Programme"
                                                    value={
                                                        alumni.programme
                                                    }
                                                />

                                                <Detail
                                                    icon={
                                                        <BookOpen
                                                            size={
                                                                18
                                                            }
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
                                                            size={
                                                                18
                                                            }
                                                        />
                                                    }
                                                    label="Batch"
                                                    value={
                                                        alumni.batch
                                                    }
                                                />
                                            </div>
                                        </section>

                                        {/* =========================
                                            PROFESSIONAL DETAILS
                                        ========================= */}

                                        <section
                                            className={
                                                styles[
                                                "details-section"
                                                ]
                                            }
                                        >
                                            <h3>
                                                Professional
                                                Details
                                            </h3>

                                            <div
                                                className={
                                                    styles[
                                                    "details-grid"
                                                    ]
                                                }
                                            >
                                                <Detail
                                                    icon={
                                                        <BriefcaseBusiness
                                                            size={
                                                                18
                                                            }
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
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        }
                                                        label="Company / Organization"
                                                        value={
                                                            alumni.company
                                                        }
                                                    />
                                                )}

                                                {alumni.jobTitle && (
                                                    <Detail
                                                        icon={
                                                            <BriefcaseBusiness
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        }
                                                        label="Job Title / Designation"
                                                        value={
                                                            alumni.jobTitle
                                                        }
                                                    />
                                                )}

                                                {alumni.industry && (
                                                    <Detail
                                                        icon={
                                                            <Building2
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        }
                                                        label="Industry"
                                                        value={
                                                            alumni.industry
                                                        }
                                                    />
                                                )}

                                                {alumni.workLocation && (
                                                    <Detail
                                                        icon={
                                                            <MapPin
                                                                size={
                                                                    18
                                                                }
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
                                                            <Mail
                                                                size={
                                                                    18
                                                                }
                                                            />
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
                                                        <span className={styles["linkedin-icon"]}>
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

                                        <section
                                            className={
                                                styles[
                                                "details-section"
                                                ]
                                            }
                                        >
                                            <h3>
                                                Alumni
                                                Contribution
                                            </h3>

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
                                                            .attendAlumniEvents
                                                    }
                                                    label="Attend Alumni Events"
                                                    icon={
                                                        <Users
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    }
                                                />

                                                <Contribution
                                                    active={
                                                        alumni
                                                            .contributions
                                                            .mentorStudents
                                                    }
                                                    label="Mentor Current Students"
                                                    icon={
                                                        <HeartHandshake
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    }
                                                />

                                                <Contribution
                                                    active={
                                                        alumni
                                                            .contributions
                                                            .internshipOpportunities
                                                    }
                                                    label="Provide Internship Opportunities"
                                                    icon={
                                                        <BriefcaseBusiness
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    }
                                                />

                                                <Contribution
                                                    active={
                                                        alumni
                                                            .contributions
                                                            .jobOpportunities
                                                    }
                                                    label="Provide Job Opportunities"
                                                    icon={
                                                        <Building2
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    }
                                                />

                                                <Contribution
                                                    active={
                                                        alumni
                                                            .contributions
                                                            .guestLectures
                                                    }
                                                    label="Give Guest Lectures"
                                                    icon={
                                                        <BookOpen
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    }
                                                />

                                                <Contribution
                                                    active={
                                                        alumni
                                                            .contributions
                                                            .supportCollegeActivities
                                                    }
                                                    label="Support College Activities"
                                                    icon={
                                                        <HeartHandshake
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    }
                                                />

                                                <Contribution
                                                    active={
                                                        alumni
                                                            .contributions
                                                            .donations
                                                    }
                                                    label="Make Donations"
                                                    icon={
                                                        <BadgeDollarSign
                                                            size={
                                                                17
                                                            }
                                                        />
                                                    }
                                                />
                                            </div>
                                        </section>

                                        {/* =========================
                                            ADDRESS
                                        ========================= */}

                                        <section
                                            className={
                                                styles[
                                                "details-section"
                                                ]
                                            }
                                        >
                                            <h3>Address</h3>

                                            <div
                                                className={
                                                    styles[
                                                    "details-grid"
                                                    ]
                                                }
                                            >
                                                {alumni.address && (
                                                    <Detail
                                                        icon={
                                                            <MapPin
                                                                size={
                                                                    18
                                                                }
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
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        }
                                                        label="City"
                                                        value={
                                                            alumni.city
                                                        }
                                                    />
                                                )}

                                                {alumni.state && (
                                                    <Detail
                                                        icon={
                                                            <MapPin
                                                                size={
                                                                    18
                                                                }
                                                            />
                                                        }
                                                        label="State"
                                                        value={
                                                            alumni.state
                                                        }
                                                    />
                                                )}

                                                {alumni.country && (
                                                    <Detail
                                                        icon={
                                                            <MapPin
                                                                size={
                                                                    18
                                                                }
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
                                                                size={
                                                                    18
                                                                }
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

                                        {/* =========================
                                            ACTIONS
                                        ========================= */}

                                        <div
                                            className={
                                                styles[
                                                "approval-actions"
                                                ]
                                            }
                                        >
                                            <button
                                                type="button"
                                                className={
                                                    styles[
                                                    "reject-button"
                                                    ]
                                                }
                                                onClick={() =>
                                                    handleReject(
                                                        alumni
                                                    )
                                                }
                                            >
                                                <X size={18} />
                                                Reject
                                            </button>

                                            <button
                                                type="button"
                                                className={
                                                    styles[
                                                    "approve-button"
                                                    ]
                                                }
                                                onClick={() =>
                                                    handleApprove(
                                                        alumni
                                                    )
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
            {/* =========================
    APPROVE POPUP
========================= */}

            {popup.type === "approve" &&
                popup.alumni && (
                    <div
                        className={styles["popup-overlay"]}
                        onClick={() =>
                            setPopup({
                                type: null,
                                alumni: null,
                            })
                        }
                    >
                        <div
                            className={styles["popup-card"]}
                            onClick={(event) =>
                                event.stopPropagation()
                            }
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
                                    {popup.alumni.fullName}
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
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className={
                                        styles["popup-approve"]
                                    }
                                    onClick={confirmApprove}
                                >
                                    <Check size={17} />
                                    Accept Alumni
                                </button>
                            </div>
                        </div>
                    </div>
                )}

            {/* =========================
    REJECT POPUP
========================= */}

            {popup.type === "reject" &&
                popup.alumni && (
                    <div
                        className={styles["popup-overlay"]}
                        onClick={() =>
                            setPopup({
                                type: null,
                                alumni: null,
                            })
                        }
                    >
                        <div
                            className={styles["popup-card"]}
                            onClick={(event) =>
                                event.stopPropagation()
                            }
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
                                    {popup.alumni.fullName}
                                </strong>
                                's registration?
                            </p>

                            <div
                                className={
                                    styles["reason-container"]
                                }
                            >
                                <label htmlFor="rejectionReason">
                                    Reason for rejection
                                </label>

                                <textarea
                                    id="rejectionReason"
                                    value={rejectionReason}
                                    onChange={(event) =>
                                        setRejectionReason(
                                            event.target.value
                                        )
                                    }
                                    placeholder="Enter the reason for rejecting this registration..."
                                    rows={4}
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
                                >
                                    Cancel
                                </button>

                                <button
                                    type="button"
                                    className={
                                        styles["popup-reject"]
                                    }
                                    onClick={confirmReject}
                                    disabled={
                                        !rejectionReason.trim()
                                    }
                                >
                                    <X size={17} />
                                    Reject Registration
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
            className={`${styles["contribution-item"]} ${active
                ? styles["contribution-active"]
                : styles["contribution-inactive"]
                }`}
        >
            <div className={styles["contribution-icon"]}>
                {active ? (
                    <Check size={15} />
                ) : (
                    <X size={15} />
                )}
            </div>

            {icon}

            <span>{label}</span>
        </div>
    );
}

export default AlumniApproval;