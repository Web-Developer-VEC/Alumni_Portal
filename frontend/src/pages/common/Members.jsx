import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import ThemeDropDown from "../../components/common/ThemeDropDown";
import { getAlumniMembers } from "../../api/alumni";
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

const fallbackAlumniData = [
    {
        id: "1",
        name: "Arun Kumar",
        email: "arun.zoho@alumni.vec.ac.in",
        registerNumber: "2015IT101",
        programme: "B.Tech",
        department: "Information Technology",
        batch: "2015-2019",
        location: "Chennai",
        company: "Zoho",
        designation: "Software Engineer",
        industry: "Information Technology",
        workExperience: "5-10 Years",
        profilePhoto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80",
        phone: "+91 9876543210",
        linkedIn: "https://linkedin.com",
        skills: ["React", "Node.js", "AWS", "Python"],
        verified: true,
    },
    {
        id: "2",
        name: "Priya S",
        email: "priya.tcs@alumni.vec.ac.in",
        registerNumber: "2016CS202",
        programme: "B.E",
        department: "Computer Science and Engineering",
        batch: "2016-2020",
        location: "Chennai",
        company: "TCS",
        designation: "Data Analyst",
        industry: "Information Technology",
        workExperience: "5-10 Years",
        profilePhoto: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=400&q=80",
        phone: "+91 9123456789",
        linkedIn: "https://linkedin.com",
        skills: ["Full Stack", "Data Structures", "Cloud Architecture"],
        verified: true,
    },
    {
        id: "3",
        name: "Rahul V",
        email: "rahul.presidio@alumni.vec.ac.in",
        registerNumber: "2014AD303",
        programme: "B.Tech",
        department: "AI & Data Science",
        batch: "2014-2018",
        location: "Bengaluru",
        company: "Presidio",
        designation: "AI Engineer",
        industry: "Technology",
        workExperience: "5-10 Years",
        profilePhoto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80",
        phone: "+91 9000000000",
        linkedIn: "https://linkedin.com",
        skills: ["Machine Learning", "Python", "Deep Learning", "SQL"],
        verified: true,
    },
    {
        id: "4",
        name: "Keerthana R",
        email: "keerthana.freshworks@alumni.vec.ac.in",
        registerNumber: "2017EC404",
        programme: "B.E",
        department: "Electronics and Communication",
        batch: "2017-2021",
        location: "Chennai",
        company: "Freshworks",
        designation: "Product Designer",
        industry: "Software",
        workExperience: "3-5 Years",
        profilePhoto: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80",
        phone: "+91 9555555555",
        linkedIn: "https://linkedin.com",
        skills: ["VLSI", "Embedded Systems", "IoT", "MATLAB"],
        verified: true,
    },
    {
        id: "5",
        name: "Vignesh M",
        email: "vignesh.infosys@alumni.vec.ac.in",
        registerNumber: "2013ME505",
        programme: "B.E",
        department: "Mechanical Engineering",
        batch: "2013-2017",
        location: "Hyderabad",
        company: "Infosys",
        designation: "Cloud Engineer",
        industry: "Technology",
        workExperience: "5-10 Years",
        profilePhoto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?auto=format&fit=crop&w=400&q=80",
        phone: "+91 9444444444",
        linkedIn: "https://linkedin.com",
        skills: ["AutoCAD", "SolidWorks", "ANSYS", "Product Design"],
        verified: true,
    },
    {
        id: "6",
        name: "Harish Kumar",
        email: "harish.amazon@alumni.vec.ac.in",
        registerNumber: "2015IT606",
        programme: "B.Tech",
        department: "Information Technology",
        batch: "2015-2019",
        location: "Chennai",
        company: "Amazon",
        designation: "Full Stack Developer",
        industry: "Information Technology",
        workExperience: "5-10 Years",
        profilePhoto: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=400&q=80",
        phone: "+91 9333333333",
        linkedIn: "https://linkedin.com",
        skills: ["React", "Node.js", "AWS", "Python"],
        verified: true,
    },
];

function Members() {
    const navigate = useNavigate();
    const [alumniList, setAlumniList] = useState([]);
    const [loading, setLoading] = useState(true);
    const [imageErrors, setImageErrors] = useState({});
    const [search, setSearch] = useState("");
    const [activeFilter, setActiveFilter] = useState("All");

    const [selectedAlumni, setSelectedAlumni] = useState(null);
    const [showMoreFilters, setShowMoreFilters] = useState(false);

    const [selectedLocation, setSelectedLocation] = useState("All");
    const [selectedCompany, setSelectedCompany] = useState("All");
    const [selectedDepartment, setSelectedDepartment] = useState("All");
    const [selectedProgramme, setSelectedProgramme] = useState("All");
    const [selectedBatch, setSelectedBatch] = useState("All");
    const [selectedWorkExperience, setSelectedWorkExperience] = useState("All");
    const [selectedIndustry, setSelectedIndustry] = useState("All");
    const [selectedRole, setSelectedRole] = useState("All");
    const [selectedSkill, setSelectedSkill] = useState("All");

    useEffect(() => {
        let isMounted = true;
        const fetchMembers = async () => {
            try {
                setLoading(true);
                const res = await getAlumniMembers();
                if (isMounted) {
                    const list = Array.isArray(res?.data)
                        ? res.data
                        : Array.isArray(res)
                        ? res
                        : fallbackAlumniData;
                    setAlumniList(list && list.length > 0 ? list : fallbackAlumniData);
                }
            } catch (err) {
                console.error("Failed to fetch alumni members:", err);
                if (isMounted) {
                    setAlumniList(fallbackAlumniData);
                }
            } finally {
                if (isMounted) {
                    setLoading(false);
                }
            }
        };

        fetchMembers();
        return () => {
            isMounted = false;
        };
    }, []);

    const locationOptions = useMemo(() => {
        const locations = new Set();
        alumniList.forEach((alumni) => {
            const loc = alumni.location || alumni.workLocation || alumni.city;
            if (loc && typeof loc === "string" && loc.trim()) {
                locations.add(loc.trim());
            }
        });
        return ["All", ...Array.from(locations).sort()];
    }, [alumniList]);

    const departmentOptions = useMemo(() => {
        const departments = new Set();
        alumniList.forEach((alumni) => {
            if (alumni.department && typeof alumni.department === "string" && alumni.department.trim()) {
                departments.add(alumni.department.trim());
            }
        });
        return ["All", ...Array.from(departments).sort()];
    }, [alumniList]);

    const companyOptions = useMemo(() => {
        const companies = new Set();
        alumniList.forEach((alumni) => {
            if (alumni.company && typeof alumni.company === "string" && alumni.company.trim()) {
                companies.add(alumni.company.trim());
            }
        });
        return ["All", ...Array.from(companies).sort()];
    }, [alumniList]);

    const BatchOptions = useMemo(() => {
        const batches = new Set();
        alumniList.forEach((alumni) => {
            if (alumni.batch && typeof alumni.batch === "string" && alumni.batch.trim()) {
                batches.add(alumni.batch.trim());
            }
        });
        return ["All", ...Array.from(batches).sort()];
    }, [alumniList]);

    const roleOptions = useMemo(() => {
        const roles = new Set();
        alumniList.forEach((alumni) => {
            const role = alumni.designation || alumni.role;
            if (role && typeof role === "string" && role.trim()) {
                roles.add(role.trim());
            }
        });
        return ["All", ...Array.from(roles).sort()];
    }, [alumniList]);

    const filteredAlumni = useMemo(() => {
        return alumniList.filter((alumni) => {
            const searchValue = search.toLowerCase().trim();

            const name = (alumni.name || alumni.fullName || "").toLowerCase();
            const email = (alumni.email || "").toLowerCase();
            const regNo = (alumni.registerNumber || "").toLowerCase();
            const company = (alumni.company || "").toLowerCase();
            const designation = (alumni.designation || "").toLowerCase();
            const dept = (alumni.department || "").toLowerCase();

            const matchesSearch =
                !searchValue ||
                name.includes(searchValue) ||
                email.includes(searchValue) ||
                regNo.includes(searchValue) ||
                company.includes(searchValue) ||
                designation.includes(searchValue) ||
                dept.includes(searchValue);

            const alumLoc = alumni.location || alumni.workLocation || alumni.city;
            const matchesLocation =
                selectedLocation === "All" ||
                alumLoc === selectedLocation;

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
                alumni.workExperience === selectedWorkExperience;

            const matchesIndustry =
                selectedIndustry === "All" ||
                alumni.industry === selectedIndustry;

            const matchesRole =
                selectedRole === "All" ||
                alumni.designation === selectedRole;

            const matchesSkill =
                selectedSkill === "All" ||
                (Array.isArray(alumni.skills) && alumni.skills.includes(selectedSkill));

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
        alumniList,
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
    };

    const handleProfileRedirect = (event, alumni) => {
        event.stopPropagation();
        setSelectedAlumni(alumni);
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
                    <strong>{filteredAlumni.length}</strong>
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
                            className={styles["text-input-field"]}
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
                {loading ? (
                    <div className={styles["loading-state"]}>
                        <div className={styles["loading-spinner"]} />
                        <p style={{ color: "#777", fontSize: "15px", margin: 0 }}>
                            Loading alumni directory...
                        </p>
                    </div>
                ) : filteredAlumni.length === 0 ? (
                    <div className={styles["empty-members"]}>
                        <Search size={40} />
                        <h2>No alumni found</h2>
                        <p>
                            Try changing your search keywords or filter criteria.
                        </p>
                        <button type="button" onClick={clearFilters}>
                            Clear Filters
                        </button>
                    </div>
                ) : (
                    filteredAlumni.map((alumni) => {
                        const alumId = alumni.id || alumni._id || alumni.registerNumber;
                        const hasPhoto = alumni.profilePhoto && !imageErrors[alumId];

                        return (
                            <article
                                key={alumId}
                                className={styles["member-card"]}
                                onClick={() => setSelectedAlumni(alumni)}
                            >
                                <div className={styles["member-top"]}>
                                    {/* PROFILE PHOTO */}
                                    <div className={styles["member-image-wrapper"]}>
                                        {hasPhoto ? (
                                            <img
                                                src={alumni.profilePhoto}
                                                alt={alumni.name}
                                                className={styles["member-image"]}
                                                onError={() =>
                                                    setImageErrors((prev) => ({
                                                        ...prev,
                                                        [alumId]: true,
                                                    }))
                                                }
                                            />
                                        ) : (
                                            <div className={styles["member-placeholder"]}>
                                                <span>
                                                    {(alumni.name || "A")
                                                        .charAt(0)
                                                        .toUpperCase()}
                                                </span>
                                            </div>
                                        )}

                                        {alumni.verified && (
                                            <div
                                                className={styles["verified-badge"]}
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
                                            {alumni.programme || "B.E"} • {alumni.batch || "Alumni"}
                                        </p>
                                        <p className={styles["member-department"]}>
                                            {alumni.department || "Engineering"}
                                        </p>
                                        <div className={styles["member-location"]}>
                                            <MapPin size={13} />
                                            <span>{alumni.location || "Chennai"}</span>
                                        </div>
                                    </div>

                                    {/* MESSAGE / PROFILE BUTTON */}
                                    <button
                                        type="button"
                                        className={styles["profile-plus-button"]}
                                        onClick={(event) =>
                                            handleProfileRedirect(event, alumni)
                                        }
                                        aria-label={`View ${alumni.name}'s profile`}
                                        title="View Profile Details"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="22"
                                            height="22"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M2.992 16.342a2 2 0 0 1 .094 1.167l-1.065 3.29a1 1 0 0 0 1.236 1.168l3.413-.998a2 2 0 0 1 1.099.092 10 10 0 1 0-4.777-4.719" />
                                            <path d="M8 12h.01" />
                                            <path d="M12 12h.01" />
                                            <path d="M16 12h.01" />
                                        </svg>
                                    </button>
                                </div>

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
                                            {alumni.designation || "Professional"}
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
                        );
                    })
                )}
            </div>

            {/* =========================
                MEMBER DETAILS MODAL
            ========================= */}

            {selectedAlumni && (
                <div
                    className={styles["modal-overlay"]}
                    onClick={() => setSelectedAlumni(null)}
                >
                    <div
                        className={styles["profile-modal"]}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <button
                            type="button"
                            className={styles["modal-close"]}
                            onClick={() => setSelectedAlumni(null)}
                        >
                            <X size={20} />
                        </button>

                        <div className={styles["modal-profile-header"]}>
                            {selectedAlumni.profilePhoto &&
                            !imageErrors[`modal-${selectedAlumni.id || selectedAlumni._id}`] ? (
                                <img
                                    src={selectedAlumni.profilePhoto}
                                    alt={selectedAlumni.name}
                                    className={styles["modal-profile-image"]}
                                    onError={() =>
                                        setImageErrors((prev) => ({
                                            ...prev,
                                            [`modal-${selectedAlumni.id || selectedAlumni._id}`]: true,
                                        }))
                                    }
                                />
                            ) : (
                                <div className={styles["modal-placeholder"]}>
                                    {(selectedAlumni.name || "A")
                                        .charAt(0)
                                        .toUpperCase()}
                                </div>
                            )}

                            <div>
                                <div className={styles["modal-name-row"]}>
                                    <h2>{selectedAlumni.name}</h2>
                                    {selectedAlumni.verified && (
                                        <CheckCircle2
                                            size={19}
                                            className={styles["modal-verified"]}
                                        />
                                    )}
                                </div>

                                <p>
                                    {selectedAlumni.programme || "B.E"} •{" "}
                                    {selectedAlumni.department}
                                </p>

                                <span>
                                    Batch {selectedAlumni.batch || "Alumni"}
                                </span>
                            </div>
                        </div>

                        <div className={styles["modal-details"]}>
                            <div className={styles["modal-detail"]}>
                                <BriefcaseBusiness size={18} />
                                <div>
                                    <span>Current Role</span>
                                    <strong>
                                        {selectedAlumni.designation || "Not Specified"}
                                    </strong>
                                </div>
                            </div>

                            <div className={styles["modal-detail"]}>
                                <Building2 size={18} />
                                <div>
                                    <span>Company</span>
                                    <strong>
                                        {selectedAlumni.company || "Not Specified"}
                                    </strong>
                                </div>
                            </div>

                            <div className={styles["modal-detail"]}>
                                <MapPin size={18} />
                                <div>
                                    <span>Location</span>
                                    <strong>
                                        {selectedAlumni.location || "Chennai"}
                                    </strong>
                                </div>
                            </div>

                            <div className={styles["modal-detail"]}>
                                <CalendarDays size={18} />
                                <div>
                                    <span>Work Experience</span>
                                    <strong>
                                        {selectedAlumni.workExperience || "Not Specified"}
                                    </strong>
                                </div>
                            </div>

                            {selectedAlumni.email && (
                                <div className={styles["modal-detail"]}>
                                    <Mail size={18} />
                                    <div>
                                        <span>Email</span>
                                        <a
                                            href={`mailto:${selectedAlumni.email}`}
                                            style={{
                                                color: "#7a1f2b",
                                                textDecoration: "none",
                                                fontWeight: 600,
                                                fontSize: "14px",
                                            }}
                                        >
                                            {selectedAlumni.email}
                                        </a>
                                    </div>
                                </div>
                            )}

                            {selectedAlumni.phone && (
                                <div className={styles["modal-detail"]}>
                                    <Phone size={18} />
                                    <div>
                                        <span>Phone</span>
                                        <strong>{selectedAlumni.phone}</strong>
                                    </div>
                                </div>
                            )}
                        </div>

                        {selectedAlumni.skills?.length > 0 && (
                            <div className={styles["skills-section"]}>
                                <h3>Professional Skills</h3>
                                <div className={styles["skill-list"]}>
                                    {selectedAlumni.skills.map((skill) => (
                                        <span key={skill}>{skill}</span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {selectedAlumni.linkedIn && (
                            <a
                                href={selectedAlumni.linkedIn}
                                target="_blank"
                                rel="noreferrer"
                                className={styles["linkedin-button"]}
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
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default Members;
