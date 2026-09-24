import React, { useMemo, useState } from "react";
import {
    Search,
    MapPin,
    Building2,
    BriefcaseBusiness,
    GraduationCap,
    SlidersHorizontal,
    CheckCircle2,
    ChevronDown,
    X,
    Mail,
    Phone,
    CalendarDays,
} from "lucide-react";

import styles from "./Members.module.css";

const alumniData = [
    {
        id: 1,
        name: "Priyadharsan T",
        email: "priyadharsan@gmail.com",
        registerNumber: "22AD123",
        programme: "B.Tech",
        department: "AI & Data Science",
        batch: "2022-2026",
        location: "Chennai",
        company: "ABC Technologies",
        designation: "Software Engineer",
        industry: "Information Technology",
        workExperience: "1-3 Years",
        profilePhoto: "/images/alumni/priyadharsan.jpg",
        phone: "+91 9876543210",
        linkedIn: "https://linkedin.com",
        skills: ["React", "Node.js", "Python"],
        verified: true,
    },

    {
        id: 2,
        name: "Kadhirvelavan M",
        email: "kadhirvelavan@gmail.com",
        registerNumber: "21EE045",
        programme: "B.E",
        department: "Electrical and Electronics Engineering",
        batch: "2021-2025",
        location: "Chennai",
        company: "Infinium Developer",
        designation: "GET",
        industry: "Technology",
        workExperience: "0-1 Years",
        profilePhoto: "/images/alumni/kadhirvelavan.jpg",
        phone: "+91 9123456789",
        linkedIn: "https://linkedin.com",
        skills: ["Java", "Embedded Systems"],
        verified: true,
    },

    {
        id: 3,
        name: "Manoj Kumar",
        email: "manoj@gmail.com",
        registerNumber: "05AE012",
        programme: "M.E",
        department: "Automobile Engineering",
        batch: "2005-2007",
        location: "Chennai",
        company: "VIT Chennai",
        designation: "Professor",
        industry: "Education",
        workExperience: "10+ Years",
        profilePhoto: "/images/alumni/manoj.jpg",
        phone: "+91 9000000000",
        linkedIn: "https://linkedin.com",
        skills: ["Teaching", "Research"],
        verified: true,
    },

    {
        id: 4,
        name: "Ananya Krishnan",
        email: "ananya@gmail.com",
        registerNumber: "21CS056",
        programme: "B.E",
        department: "Computer Science and Engineering",
        batch: "2021-2025",
        location: "Coimbatore",
        company: "Zoho",
        designation: "Product Engineer",
        industry: "Software",
        workExperience: "0-1 Years",
        profilePhoto: "",
        phone: "+91 9555555555",
        linkedIn: "https://linkedin.com",
        skills: ["Java", "React", "SQL"],
        verified: true,
    },

    {
        id: 5,
        name: "Rahul Raj",
        email: "rahul@gmail.com",
        registerNumber: "20ME031",
        programme: "B.E",
        department: "Mechanical Engineering",
        batch: "2020-2024",
        location: "Bangalore",
        company: "Tata Motors",
        designation: "Design Engineer",
        industry: "Automobile",
        workExperience: "1-3 Years",
        profilePhoto: "",
        phone: "+91 9444444444",
        linkedIn: "https://linkedin.com",
        skills: ["CAD", "Design"],
        verified: true,
    },

    {
        id: 6,
        name: "Sneha Nair",
        email: "sneha@gmail.com",
        registerNumber: "19EC021",
        programme: "B.E",
        department: "Electronics and Communication Engineering",
        batch: "2019-2023",
        location: "Kochi",
        company: "TCS",
        designation: "System Engineer",
        industry: "Information Technology",
        workExperience: "1-3 Years",
        profilePhoto: "",
        phone: "+91 9333333333",
        linkedIn: "https://linkedin.com",
        skills: ["Python", "Networking"],
        verified: true,
    },
];

function Members() {
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");
    const [selectedBrowse, setSelectedBrowse] =
        useState("Location");

    const [selectedAlumni, setSelectedAlumni] =
        useState(null);

    const [showMoreFilters, setShowMoreFilters] =
        useState(false);

    const [selectedLocation, setSelectedLocation] =
        useState("All");

    const [selectedCompany, setSelectedCompany] =
        useState("All");

    const [selectedDepartment, setSelectedDepartment] =
        useState("All");

    const [selectedProgramme, setSelectedProgramme] =
        useState("All");

    const [selectedBatch, setSelectedBatch] =
        useState("All");

    const [selectedWorkExperience, setSelectedWorkExperience] =
        useState("All");

    const [selectedIndustry, setSelectedIndustry] =
        useState("All");

    const [selectedRole, setSelectedRole] =
        useState("All");

    const [selectedSkill, setSelectedSkill] =
        useState("All");

    const filteredAlumni = useMemo(() => {
        return alumniData.filter((alumni) => {
            const searchValue = search
                .toLowerCase()
                .trim();

            const matchesSearch =
                !searchValue ||
                alumni.name
                    .toLowerCase()
                    .includes(searchValue) ||
                alumni.email
                    .toLowerCase()
                    .includes(searchValue) ||
                alumni.registerNumber
                    .toLowerCase()
                    .includes(searchValue);

            const matchesLocation =
                selectedLocation === "All" ||
                alumni.location === selectedLocation;

            const matchesCompany =
                selectedCompany === "All" ||
                alumni.company === selectedCompany;

            const matchesDepartment =
                selectedDepartment === "All" ||
                alumni.department === selectedDepartment;

            const matchesProgramme =
                selectedProgramme === "All" ||
                alumni.programme === selectedProgramme;

            const matchesBatch =
                selectedBatch === "All" ||
                alumni.batch === selectedBatch;

            const matchesWorkExperience =
                selectedWorkExperience === "All" ||
                alumni.workExperience ===
                selectedWorkExperience;

            const matchesIndustry =
                selectedIndustry === "All" ||
                alumni.industry === selectedIndustry;

            const matchesRole =
                selectedRole === "All" ||
                alumni.designation === selectedRole;

            const matchesSkill =
                selectedSkill === "All" ||
                alumni.skills?.includes(selectedSkill);

            return (
                matchesSearch &&
                matchesLocation &&
                matchesCompany &&
                matchesDepartment &&
                matchesProgramme &&
                matchesBatch &&
                matchesWorkExperience &&
                matchesIndustry &&
                matchesRole &&
                matchesSkill
            );
        });
    }, [
        search,
        selectedLocation,
        selectedCompany,
        selectedDepartment,
        selectedProgramme,
        selectedBatch,
        selectedWorkExperience,
        selectedIndustry,
        selectedRole,
        selectedSkill,
    ]);

    const clearFilters = () => {
        setSearch("");

        setSelectedLocation("All");
        setSelectedCompany("All");
        setSelectedDepartment("All");

        setSelectedProgramme("All");
        setSelectedBatch("All");
        setSelectedWorkExperience("All");
        setSelectedIndustry("All");
        setSelectedRole("All");
        setSelectedSkill("All");

        setActiveFilter("All");
        setSelectedBrowse("Location");
    };

    const handleBrowseFilter = (filter) => {
        setSelectedBrowse(filter);
        setShowMoreFilters(true);
    };

    return (
        <div className={styles["members-page"]}>
            {/* =========================
                PAGE HEADER
            ========================= */}

            <div className={styles["page-header"]}>
                <div>
                    <h1>Alumni Members</h1>

                    <p>
                        Search and connect with fellow
                        alumni, batchmates and friends.
                    </p>
                </div>

                <div className={styles["member-count"]}>
                    <strong>
                        {filteredAlumni.length}
                    </strong>

                    <span>Members Found</span>
                </div>
            </div>

            

            {/* =========================
                SEARCH / FILTER CARD
            ========================= */}

            <div className={styles["search-card"]}>

                <div className={styles["search-row"]}>
                    <div
                        className={
                            styles["search-input-wrapper"]
                        }
                    >
                        <Search size={19} />

                        <input
                            type="text"
                            placeholder="Search by name, email or register number"
                            value={search}
                            onChange={(event) =>
                                setSearch(
                                    event.target.value
                                )
                            }
                        />
                    </div>

                    <button
                        type="button"
                        className={styles["search-button"]}
                    >
                        <Search size={18} />
                        Search
                    </button>
                </div>

                {/* =========================
                    EXTRA FILTERS
                ========================= */}

                <div className={styles["filter-bottom"]}>
                    <div className={styles["show-filters"]}>
                        <span>Show</span>
                    </div>

                    <button
                        type="button"
                        className={
                            styles["more-filter-button"]
                        }
                        onClick={() =>
                            setShowMoreFilters(
                                !showMoreFilters
                            )
                        }
                    >
                        <SlidersHorizontal size={16} />
                        Filters
                    </button>
                </div>

                {showMoreFilters && (
                    <div
                        className={
                            styles["advanced-filters"]
                        }
                    >
                        <div
                            className={
                                styles["select-group"]
                            }
                        >
                            <label>Location</label>

                            <select
                                value={selectedLocation}
                                onChange={(event) =>
                                    setSelectedLocation(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="All">
                                    All Locations
                                </option>

                                <option value="Chennai">
                                    Chennai
                                </option>

                                <option value="Bangalore">
                                    Bangalore
                                </option>

                                <option value="Coimbatore">
                                    Coimbatore
                                </option>

                                <option value="Kochi">
                                    Kochi
                                </option>
                            </select>
                        </div>

                        <div
                            className={
                                styles["select-group"]
                            }
                        >
                            <label>Department</label>

                            <select
                                value={selectedDepartment}
                                onChange={(event) =>
                                    setSelectedDepartment(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="All">
                                    All Departments
                                </option>

                                <option value="Computer Science and Engineering">
                                    Computer Science and
                                    Engineering
                                </option>

                                <option value="AI & Data Science">
                                    AI & Data Science
                                </option>

                                <option value="Electrical and Electronics Engineering">
                                    EEE
                                </option>

                                <option value="Mechanical Engineering">
                                    Mechanical
                                </option>
                            </select>
                        </div>

                        <div
                            className={
                                styles["select-group"]
                            }
                        >
                            <label>Company</label>

                            <select
                                value={selectedCompany}
                                onChange={(event) =>
                                    setSelectedCompany(
                                        event.target.value
                                    )
                                }
                            >
                                <option value="All">
                                    All Companies
                                </option>

                                <option value="ABC Technologies">
                                    ABC Technologies
                                </option>

                                <option value="Zoho">
                                    Zoho
                                </option>

                                <option value="TCS">
                                    TCS
                                </option>

                                <option value="Tata Motors">
                                    Tata Motors
                                </option>
                            </select>
                        </div>

                        <button
                            type="button"
                            className={
                                styles["clear-button"]
                            }
                            onClick={clearFilters}
                        >
                            <X size={16} />
                            Clear Filters
                        </button>
                    </div>
                )}
            </div>

            {/* =========================
                MEMBER GRID
            ========================= */}

            <div className={styles["members-grid"]}>
                {filteredAlumni.length === 0 ? (
                    <div
                        className={
                            styles["empty-members"]
                        }
                    >
                        <Search size={40} />

                        <h2>No alumni found</h2>

                        <p>
                            Try changing your search or
                            filters.
                        </p>

                        <button
                            type="button"
                            onClick={clearFilters}
                        >
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    filteredAlumni.map((alumni) => (
                        <article
                            key={alumni.id}
                            className={styles["member-card"]}
                            onClick={() =>
                                setSelectedAlumni(alumni)
                            }
                        >
                            <div
                                className={
                                    styles["member-image-wrapper"]
                                }
                            >
                                {alumni.profilePhoto ? (
                                    <img
                                        src={
                                            alumni.profilePhoto
                                        }
                                        alt={alumni.name}
                                        className={
                                            styles[
                                            "member-image"
                                            ]
                                        }
                                    />
                                ) : (
                                    <div
                                        className={
                                            styles[
                                            "member-placeholder"
                                            ]
                                        }
                                    >
                                        <span>
                                            {alumni.name
                                                .charAt(0)
                                                .toUpperCase()}
                                        </span>
                                    </div>
                                )}

                                {alumni.verified && (
                                    <div
                                        className={
                                            styles[
                                            "verified-badge"
                                            ]
                                        }
                                        title="Verified Alumni"
                                    >
                                        <CheckCircle2
                                            size={19}
                                        />
                                    </div>
                                )}
                            </div>

                            <div
                                className={
                                    styles["member-content"]
                                }
                            >
                                <h2>{alumni.name}</h2>

                                <p
                                    className={
                                        styles[
                                        "member-academic"
                                        ]
                                    }
                                >
                                    {alumni.programme},{" "}
                                    {alumni.batch}
                                    <br />
                                    {alumni.department}
                                </p>

                                <p
                                    className={
                                        styles[
                                        "member-profession"
                                        ]
                                    }
                                >
                                    {alumni.designation}{" "}
                                    {alumni.company
                                        ? `at ${alumni.company}`
                                        : ""}
                                </p>
                            </div>
                        </article>
                    ))
                )}
            </div>

            {/* =========================
                MEMBER DETAILS MODAL
            ========================= */}

            {selectedAlumni && (
                <div
                    className={styles["modal-overlay"]}
                    onClick={() =>
                        setSelectedAlumni(null)
                    }
                >
                    <div
                        className={styles["profile-modal"]}
                        onClick={(event) =>
                            event.stopPropagation()
                        }
                    >
                        <button
                            type="button"
                            className={
                                styles["modal-close"]
                            }
                            onClick={() =>
                                setSelectedAlumni(null)
                            }
                        >
                            <X size={20} />
                        </button>

                        <div
                            className={
                                styles[
                                "modal-profile-header"
                                ]
                            }
                        >
                            {selectedAlumni.profilePhoto ? (
                                <img
                                    src={
                                        selectedAlumni.profilePhoto
                                    }
                                    alt={
                                        selectedAlumni.name
                                    }
                                />
                            ) : (
                                <div
                                    className={
                                        styles[
                                        "modal-placeholder"
                                        ]
                                    }
                                >
                                    {selectedAlumni.name
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                            )}

                            <div>
                                <div
                                    className={
                                        styles[
                                        "modal-name-row"
                                        ]
                                    }
                                >
                                    <h2>
                                        {
                                            selectedAlumni.name
                                        }
                                    </h2>

                                    {selectedAlumni.verified && (
                                        <CheckCircle2
                                            size={19}
                                            className={
                                                styles[
                                                "modal-verified"
                                                ]
                                            }
                                        />
                                    )}
                                </div>

                                <p>
                                    {
                                        selectedAlumni.programme
                                    }{" "}
                                    •{" "}
                                    {
                                        selectedAlumni.department
                                    }
                                </p>

                                <span>
                                    Batch{" "}
                                    {
                                        selectedAlumni.batch
                                    }
                                </span>
                            </div>
                        </div>

                        <div
                            className={
                                styles["modal-details"]
                            }
                        >
                            <div
                                className={
                                    styles[
                                    "modal-detail"
                                    ]
                                }
                            >
                                <BriefcaseBusiness
                                    size={18}
                                />

                                <div>
                                    <span>
                                        Current Role
                                    </span>

                                    <strong>
                                        {
                                            selectedAlumni.designation
                                        }
                                    </strong>
                                </div>
                            </div>

                            <div
                                className={
                                    styles[
                                    "modal-detail"
                                    ]
                                }
                            >
                                <Building2 size={18} />

                                <div>
                                    <span>Company</span>

                                    <strong>
                                        {
                                            selectedAlumni.company
                                        }
                                    </strong>
                                </div>
                            </div>

                            <div
                                className={
                                    styles[
                                    "modal-detail"
                                    ]
                                }
                            >
                                <MapPin size={18} />

                                <div>
                                    <span>Location</span>

                                    <strong>
                                        {
                                            selectedAlumni.location
                                        }
                                    </strong>
                                </div>
                            </div>

                            <div
                                className={
                                    styles[
                                    "modal-detail"
                                    ]
                                }
                            >
                                <Mail size={18} />

                                <div>
                                    <span>Email</span>

                                    <strong>
                                        {
                                            selectedAlumni.email
                                        }
                                    </strong>
                                </div>
                            </div>

                            <div
                                className={
                                    styles[
                                    "modal-detail"
                                    ]
                                }
                            >
                                <Phone size={18} />

                                <div>
                                    <span>Phone</span>

                                    <strong>
                                        {
                                            selectedAlumni.phone
                                        }
                                    </strong>
                                </div>
                            </div>

                            <div
                                className={
                                    styles[
                                    "modal-detail"
                                    ]
                                }
                            >
                                <CalendarDays size={18} />

                                <div>
                                    <span>
                                        Work Experience
                                    </span>

                                    <strong>
                                        {
                                            selectedAlumni.workExperience
                                        }
                                    </strong>
                                </div>
                            </div>
                        </div>

                        {selectedAlumni.skills?.length >
                            0 && (
                                <div
                                    className={
                                        styles[
                                        "skills-section"
                                        ]
                                    }
                                >
                                    <h3>
                                        Professional Skills
                                    </h3>

                                    <div
                                        className={
                                            styles[
                                            "skill-list"
                                            ]
                                        }
                                    >
                                        {selectedAlumni.skills.map(
                                            (skill) => (
                                                <span key={skill}>
                                                    {skill}
                                                </span>
                                            )
                                        )}
                                    </div>
                                </div>
                            )}

                        <a
                            href={
                                selectedAlumni.linkedIn
                            }
                            target="_blank"
                            rel="noreferrer"
                            className={
                                styles["linkedin-button"]
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
                            View LinkedIn Profile
                        </a>
                    </div>
                </div>
            )}
        </div>
    );
}

export default Members;
