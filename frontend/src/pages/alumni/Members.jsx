import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeDropDown from "../../components/common/ThemeDropDown";
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
        profilePhoto: "https://images.unsplash.com/photo-1557862921-37829c790f19?q=80&w=2071&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3Dhttps://unsplash.com/photos/man-crossing-both-arms-KIPqvvTOC1s",
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
const locationOptions = [
    "All",
    "Chennai",
    "Bangalore",
    "Coimbatore",
    "Hyderabad",
];
const BatchOptions = [
    "All",
    "2000 - 2004",
    "2001 - 2005",
    "2002 - 2006",
    "2003 - 2007",
    "2004 - 2008",
    "2005 - 2009",
    "2006 - 2010",
    "2007 - 2011",
    "2008 - 2012",
    "2009 - 2013",
    "2010 - 2014",
    "2011 - 2015",
    "2012 - 2016",
    "2013 - 2017",
    "2014 - 2018",
    "2015 - 2019",
    "2016 - 2020",
    "2017 - 2021",
    "2018 - 2022",
    "2019 - 2023",
    "2020 - 2024",
    "2021 - 2025",
    "2022 - 2026",
    "2023 - 2027",
    "2024 - 2028",
];
const departmentOptions = [
    "All",
    "Computer Science and Engineering",
    "AI & Data Science",
    "Electrical and Electronics Engineering",
    "Mechanical Engineering",
];

const companyOptions = [
    "All",
    "ABC Technologies",
    "Zoho",
    "TCS",
    "Tata Motors",
    "Infinium Developer",
    "VIT Chennai",
];

const roleOptions = [
    "All",
    "Software Engineer",
    "Product Engineer",
    "System Engineer",
    "Design Engineer",
    "Professor",
    "GET",
    "Manager",
    "Senior Engineer",
    "Junior Engineer",
    "Developer",
    "Analyst",
    "Consultant",
    "Architect",
    "Team Lead",
    "Project Manager",
];

function Members() {
    const navigate = useNavigate();
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
    const handleProfileRedirect = (event, alumni) => {
        event.stopPropagation();

        navigate("/");
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
                            placeholder="Search by name"
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
                    <div className={styles["advanced-filters"]}>

                        <div className={styles["select-group"]}>
                            <label>Location</label>

                            <ThemeDropDown
                                icon={MapPin}
                                value={selectedLocation}
                                options={locationOptions}
                                onChange={setSelectedLocation}
                                placeholder="Select Location"
                            />
                        </div>

                        <div className={styles["select-group"]}>
                            <label>Department</label>

                            <ThemeDropDown
                                icon={GraduationCap}
                                value={selectedDepartment}
                                options={departmentOptions}
                                onChange={setSelectedDepartment}
                                placeholder="Select Department"
                            />
                        </div>

                        <div className={styles["select-group"]}>
                            <label>Company</label>

                            <ThemeDropDown
                                icon={Building2}
                                value={selectedCompany}
                                options={companyOptions}
                                onChange={setSelectedCompany}
                                placeholder="Select Company"
                            />
                        </div>

                        <div className={styles["select-group"]}>
                            <label>Batch</label>

                            <ThemeDropDown
                                icon={CalendarDays}
                                value={selectedBatch}
                                options={BatchOptions}
                                onChange={setSelectedBatch}
                                placeholder="Select Batch"
                            />
                        </div>

                        <div className={styles["select-group"]}>
                            <label>Role</label>

                            <ThemeDropDown
                                icon={BriefcaseBusiness}
                                value={selectedRole}
                                options={roleOptions}
                                onChange={setSelectedRole}
                                placeholder="Select Role"
                            />
                        </div>

                        <button
                            type="button"
                            className={styles["clear-button"]}
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
                            onClick={() => setSelectedAlumni(alumni)}
                        >
                            {/* =========================
            TOP SECTION
        ========================= */}

                            <div className={styles["member-top"]}>

                                {/* PROFILE PHOTO */}

                                <div className={styles["member-image-wrapper"]}>
                                    {alumni.profilePhoto ? (
                                        <img
                                            src={alumni.profilePhoto}
                                            alt={alumni.name}
                                            className={styles["member-image"]}
                                        />
                                    ) : (
                                        <div
                                            className={
                                                styles["member-placeholder"]
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
                                                styles["verified-badge"]
                                            }
                                            title="Verified Alumni"
                                        >
                                            <CheckCircle2 size={17} />
                                        </div>
                                    )}
                                </div>

                                {/* PERSONAL DETAILS */}

                                <div className={styles["member-personal"]}>

                                    <h2>{alumni.name}</h2>

                                    <p className={styles["member-academic"]}>
                                        {alumni.programme} • {alumni.batch}
                                    </p>

                                    <p className={styles["member-department"]}>
                                        {alumni.department}
                                    </p>

                                    <div className={styles["member-location"]}>
                                        <MapPin size={13} />
                                        <span>{alumni.location}</span>
                                    </div>

                                </div>

                                {/* PLUS BUTTON */}

                                <button
                                    type="button"
                                    className={styles["profile-plus-button"]}
                                    onClick={(event) =>
                                        handleProfileRedirect(event, alumni)
                                    }
                                    aria-label={`View ${alumni.name}'s profile`}
                                    title="View Profile"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-message-circle-more preview-icon"><path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719"/><path d="M8 12h.01"/><path d="M12 12h.01"/><path d="M16 12h.01"/></svg>
                                </button>

                            </div>

                            {/* =========================
            PROFESSIONAL DETAILS
        ========================= */}

                            <div className={styles["member-profession"]}>

                                <div className={styles["profession-icon"]}>
                                    <BriefcaseBusiness
                                        size={17}
                                        strokeWidth={2}
                                    />
                                </div>

                                <div className={styles["profession-content"]}>
                                    <span>Currently working as</span>

                                    <strong>
                                        {alumni.designation}
                                        {alumni.company
                                            ? ` at ${alumni.company}`
                                            : ""}
                                    </strong>
                                </div>

                                <ChevronDown
                                    size={17}
                                    className={styles["profession-arrow"]}
                                />

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
