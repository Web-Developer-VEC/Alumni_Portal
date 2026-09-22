import React, { useEffect, useState } from "react";
import {
    User,
    Lock,
    Eye,
    EyeOff,
    LogIn,
    ChevronLeft,
    ChevronRight,
    Globe2,
    BriefcaseBusiness,
    BarChart3,
    Users,
} from "lucide-react";

import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";

import "./Login.css";


const alumni = [
    {
        id: 1,
        name: "Sanjay P.",
        role: "Product Designer",
        company: "Adobe",
        batch: "2019",
        image:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=700&q=85",
    },
    {
        id: 2,
        name: "Arjun K.",
        role: "Software Engineer",
        company: "Google",
        batch: "2020",
        image:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=85",
    },
    {
        id: 3,
        name: "Priya S.",
        role: "Data Scientist",
        company: "Microsoft",
        batch: "2018",
        image:
            "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=700&q=85",
    },
    {
        id: 4,
        name: "Karthik R.",
        role: "Product Manager",
        company: "Amazon",
        batch: "2017",
        image:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=700&q=85",
    },
    {
        id: 5,
        name: "Meera V.",
        role: "UX Researcher",
        company: "Deloitte",
        batch: "2021",
        image:
            "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?auto=format&fit=crop&w=700&q=85",
    },
    {
        id: 6,
        name: "Rahul M.",
        role: "Cloud Engineer",
        company: "AWS",
        batch: "2018",
        image:
            "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?auto=format&fit=crop&w=700&q=85",
    },
    {
        id: 7,
        name: "Divya R.",
        role: "Software Developer",
        company: "Infosys",
        batch: "2020",
        image:
            "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?auto=format&fit=crop&w=700&q=85",
    },
    {
        id: 8,
        name: "Vishal S.",
        role: "Tech Lead",
        company: "Zoho",
        batch: "2016",
        image:
            "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=700&q=85",
    },
    {
        id: 9,
        name: "Ananya K.",
        role: "AI Engineer",
        company: "NVIDIA",
        batch: "2022",
        image:
            "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=700&q=85",
    },
    {
        id: 10,
        name: "Aditya N.",
        role: "Backend Engineer",
        company: "Flipkart",
        batch: "2019",
        image:
            "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?auto=format&fit=crop&w=700&q=85",
    },
];


function Login() {
    const navigate = useNavigate();

    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    // This represents the ACTIVE / CENTER card.
    const [activeIndex, setActiveIndex] = useState(2);

    const [isHovered, setIsHovered] = useState(false);


    /*
     * Move carousel forward.
     */
    const nextSlide = () => {
        setActiveIndex((current) => (current + 1) % alumni.length);
    };


    /*
     * Move carousel backward.
     */
    const previousSlide = () => {
        setActiveIndex(
            (current) => (current - 1 + alumni.length) % alumni.length
        );
    };


    /*
     * Automatically move every 5.5 seconds.
     */
    useEffect(() => {
        if (isHovered) return;

        const timer = setInterval(() => {
            nextSlide();
        }, 3000);

        return () => clearInterval(timer);
    }, [isHovered]);


    /*
     * Keyboard navigation.
     */
    useEffect(() => {
        const handleKeyDown = (event) => {
            if (event.key === "ArrowRight") {
                nextSlide();
            }

            if (event.key === "ArrowLeft") {
                previousSlide();
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);


    /*
     * Get circular distance from active card.
     *
     * Example:
     *
     *              -2   -1   0   +1   +2
     *              far  left C  right far
     */
    const getRelativePosition = (index) => {
        let difference = index - activeIndex;

        if (difference > alumni.length / 2) {
            difference -= alumni.length;
        }

        if (difference < -alumni.length / 2) {
            difference += alumni.length;
        }

        return difference;
    };


    /*
     * Only render the cards that should actually be visible.
     */
    const visibleCards = alumni.filter((_, index) => {
        const position = getRelativePosition(index);

        return position >= -2 && position <= 2;
    });


    /*
     * Login handler.
     */
    const handleLogin = (event) => {
        event.preventDefault();

        if (!username.trim()) {
            toast.error("Please enter your username");
            return;
        }

        if (!password.trim()) {
            toast.error("Please enter your password");
            return;
        }

        /*
         * Replace this with your actual backend API call.
         */
        console.log({
            username,
            password,
        });

        toast.success("Login successful");

        // navigate("/dashboard");
    };


    return (
        <div className="login-page">

            {/* =========================================
                BACKGROUND DECORATION
            ========================================== */}

            <div className="background-circle circle-one"></div>
            <div className="background-circle circle-two"></div>


            <div className="login-container">

                {/* =========================================
                    LEFT SIDE
                ========================================== */}

                <section className="alumni-section">

                    {/* BRAND */}
                    <div className="college-brand">

                        <div className="brand-symbol">
                            <span>✦</span>
                        </div>

                        <div className="brand-text">
                            <h2>VELAMMAL</h2>
                            <p>ENGINEERING COLLEGE</p>
                        </div>

                    </div>


                    {/* HEADING */}
                    <div className="alumni-heading">

                        <h1>
                            Our <span>Alumni</span>
                        </h1>

                        <p className="heading-subtitle">
                            Different Paths. A Stronger Tomorrow.
                        </p>

                        <div className="heading-line">
                            <span></span>
                            <span></span>
                        </div>

                        <p className="heading-description">
                            From classrooms to global opportunities, our alumni
                            continue to make a difference.
                            <br />
                            You are a part of a legacy that inspires many.
                        </p>

                    </div>


                    {/* =========================================
                        ALUMNI CAROUSEL
                    ========================================== */}

                    <div
                        className="alumni-carousel-wrapper"
                        onMouseEnter={() => setIsHovered(true)}
                        onMouseLeave={() => setIsHovered(false)}
                    >

                        <button
                            type="button"
                            className="carousel-arrow carousel-arrow-left"
                            onClick={previousSlide}
                            aria-label="Previous alumni"
                        >
                            <ChevronLeft size={25} strokeWidth={2.2} />
                        </button>


                        <div className="alumni-carousel">

                            {visibleCards.map((person) => {
                                const position = getRelativePosition(person.id - 1);
                                let cardClass = "alumni-card";

                                if (position === -2) {
                                    cardClass += " card-left-far";
                                } else if (position === -1) {
                                    cardClass += " card-left";
                                } else if (position === 0) {
                                    cardClass += " card-active";
                                } else if (position === 1) {
                                    cardClass += " card-right";
                                } else if (position === 2) {
                                    cardClass += " card-right-far";
                                }


                                return (

                                    <article
                                        key={person.id}
                                        className={cardClass}
                                        onClick={() => {
                                            setActiveIndex(person.id - 1);
                                        }}
                                    >

                                        {/* IMAGE */}
                                        <div className="alumni-card-image">

                                            <img
                                                src={person.image}
                                                alt={person.name}
                                            />

                                            <div className="image-overlay"></div>

                                            <div className="batch-badge">
                                                '{person.batch.slice(-2)}
                                            </div>

                                        </div>


                                        {/* INFORMATION */}
                                        <div className="alumni-card-content">

                                            <h3>{person.name}</h3>

                                            <p className="alumni-role">
                                                {person.role}
                                            </p>

                                            <p className="alumni-company">
                                                {person.company}
                                            </p>

                                            <div className="card-accent"></div>

                                        </div>

                                    </article>
                                );
                            })}

                        </div>


                        <button
                            type="button"
                            className="carousel-arrow carousel-arrow-right"
                            onClick={nextSlide}
                            aria-label="Next alumni"
                        >
                            <ChevronRight size={25} strokeWidth={2.2} />
                        </button>

                    </div>


                    {/* CAROUSEL INDICATORS */}

                    <div className="carousel-indicators">

                        {alumni.map((person, index) => (
                            <button
                                type="button"
                                key={person.id}
                                className={
                                    index === activeIndex
                                        ? "indicator active"
                                        : "indicator"
                                }
                                onClick={() => setActiveIndex(index)}
                                aria-label={`Show ${person.name}`}
                            />
                        ))}

                    </div>


                    {/* =========================================
                        STATS
                    ========================================== */}

                    <div className="alumni-stats">

                        <div className="stat-item">

                            <Users size={25} />

                            <div>
                                <strong>25,000+</strong>
                                <span>Alumni Network</span>
                            </div>

                        </div>


                        <div className="stat-divider"></div>


                        <div className="stat-item">

                            <Globe2 size={25} />

                            <div>
                                <strong>30+</strong>
                                <span>Countries</span>
                            </div>

                        </div>


                        <div className="stat-divider"></div>


                        <div className="stat-item">

                            <BriefcaseBusiness size={25} />

                            <div>
                                <strong>500+</strong>
                                <span>Leading Companies</span>
                            </div>

                        </div>


                        <div className="stat-divider"></div>


                        <div className="stat-item">

                            <BarChart3 size={25} />

                            <div>
                                <strong>∞</strong>
                                <span>Success Stories</span>
                            </div>

                        </div>

                    </div>

                </section>


                {/* =========================================
                    LOGIN SIDE
                ========================================== */}

                <section className="login-section">

                    <div className="login-card">

                        {/* LOGIN ICON */}

                        <div className="login-icon">
                            <User size={27} strokeWidth={1.8} />
                        </div>


                        <h2>ALUMNI PORTAL</h2>

                        <p className="login-college">
                            Velammal Engineering College
                        </p>


                        <div className="login-divider">
                            <span></span>
                            <b>◆</b>
                            <span></span>
                        </div>


                        {/* FORM */}

                        <form onSubmit={handleLogin}>

                            {/* USERNAME */}

                            <div className="input-group">

                                <label htmlFor="username">
                                    USERNAME
                                </label>

                                <div className="input-wrapper">

                                    <User
                                        className="input-icon"
                                        size={19}
                                    />

                                    <input
                                        id="username"
                                        type="text"
                                        placeholder="Enter your username"
                                        value={username}
                                        onChange={(event) =>
                                            setUsername(event.target.value)
                                        }
                                    />

                                </div>

                            </div>


                            {/* PASSWORD */}

                            <div className="input-group">

                                <label htmlFor="password">
                                    PASSWORD
                                </label>

                                <div className="input-wrapper">

                                    <Lock
                                        className="input-icon"
                                        size={19}
                                    />

                                    <input
                                        id="password"
                                        type={
                                            showPassword
                                                ? "text"
                                                : "password"
                                        }
                                        placeholder="Enter your password"
                                        value={password}
                                        onChange={(event) =>
                                            setPassword(event.target.value)
                                        }
                                    />

                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() =>
                                            setShowPassword(!showPassword)
                                        }
                                    >
                                        {showPassword ? (
                                            <EyeOff size={19} />
                                        ) : (
                                            <Eye size={19} />
                                        )}
                                    </button>

                                </div>

                            </div>


                            {/* LOGIN BUTTON */}

                            <button
                                type="submit"
                                className="login-button"
                            >
                                <LogIn size={19} />
                                <span>LOGIN</span>
                            </button>

                        </form>


                        {/* FOOTER */}

                        <div className="login-footer">

                            <span></span>

                            <p>Alumni Portal</p>

                            <span></span>

                        </div>

                    </div>

                </section>

            </div>

        </div>
    );
}

export default Login;