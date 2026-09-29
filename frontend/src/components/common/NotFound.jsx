import React from "react";
import { ArrowLeft, Home, SearchX } from "lucide-react";
import { useNavigate } from "react-router-dom";
import styles from "./NotFound.module.css";

const NotFound = () => {
    const navigate = useNavigate();

    const handleGoBack = () => {
        navigate(-1);
    };

    const handleGoHome = () => {
        navigate("/");
    };

    return (
        <div className={styles["not-found-page"]}>
            <main className={styles["not-found-content"]}>
                <div className={styles["icon-wrapper"]}>
                    <SearchX size={34} strokeWidth={1.8} />
                </div>

                <div className={styles["error-code"]}>
                    404
                </div>

                <h1>Page Not Found</h1>

                <p>
                    Sorry, the page you are looking for doesn't exist,
                    has been moved, or may no longer be available.
                </p>

                <div className={styles["action-buttons"]}>
                    <button
                        type="button"
                        className={styles["home-button"]}
                        onClick={handleGoHome}
                    >
                        <Home size={18} />
                        Go to Home
                    </button>

                    <button
                        type="button"
                        className={styles["back-button"]}
                        onClick={handleGoBack}
                    >
                        <ArrowLeft size={18} />
                        Go Back
                    </button>
                </div>

                <div className={styles["footer-text"]}>
                    <span>Alumni Portal</span>
                    <span className={styles["separator"]}>•</span>
                    <span>Connecting generations</span>
                </div>
            </main>
        </div>
    );
};

export default NotFound;