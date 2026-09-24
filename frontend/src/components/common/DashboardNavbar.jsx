import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  Sparkles,
  ChevronDown,
  User,
  Users,
  Mail,
  ShieldCheck,
  Settings,
  LogOut,
  X,
} from "lucide-react";
import VECLOGO from "../../assets/VEC_Logo.png";
import Profile from "../../assets/profile.jpg"
import styles from "./DashboardNavbar.module.css";

const Navbar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);

  const profileRef = useRef(null);

  // Close profile when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className={styles.navbar}>
      {/* ================= LEFT ================= */}
      <div className={styles.leftSection}>
        <div className={styles.logoContainer}>
          <img
            src={VECLOGO}
            alt="Velammal Engineering College"
            className={styles.logo}
          />
        </div>

        <div className={styles.collegeInfo}>
          <h2>VEC CONNECT</h2>
        </div>

        <div className={styles.divider}></div>


      </div>

      {/* ================= CENTER ================= */}
      <div
        className={`${styles.searchWrapper} ${
          searchFocused ? styles.searchFocused : ""
        }`}
      >
        <Search size={20} className={styles.searchIcon} />

        <input
          type="text"
          placeholder="Search people, teams, posts..."
          onFocus={() => setSearchFocused(true)}
          onBlur={() => setSearchFocused(false)}
        />
      </div>

      {/* ================= RIGHT ================= */}
      <div className={styles.rightSection}>

        {/* Profile */}
        <div className={styles.profileWrapper} ref={profileRef}>
          <button
            className={`${styles.profileButton} ${
              profileOpen ? styles.profileActive : ""
            }`}
            onClick={() => setProfileOpen(!profileOpen)}
          >
            <div className={styles.avatar}>
              <img
                src={Profile}
                alt="Profile"
              />

              <span className={styles.onlineDot}></span>
            </div>

            <div className={styles.profileMiniInfo}>
              <strong>Barathram</strong>
              <span>Student</span>
            </div>

            <ChevronDown
              size={17}
              className={`${styles.chevron} ${
                profileOpen ? styles.chevronRotate : ""
              }`}
            />
          </button>

          {/* ================= PROFILE DROPDOWN ================= */}
          {profileOpen && (
            <div className={styles.profileDropdown}>

              {/* Dropdown Header */}
              <div className={styles.dropdownHeader}>
                <div className={styles.largeAvatar}>
                  <img
                    src={Profile}
                    alt="Profile"
                  />

                  <span className={styles.largeOnlineDot}></span>
                </div>

                <div>
                  <h3>Barathram</h3>
                  <p>Student • AI & Data Science</p>
                </div>

                <button
                  className={styles.closeButton}
                  onClick={() => setProfileOpen(false)}
                >
                  <X size={17} />
                </button>
              </div>

              {/* Profile Details */}
              <div className={styles.profileDetails}>

                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <Mail size={16} />
                  </div>

                  <div>
                    <span>Email</span>
                    <strong>barath@example.com</strong>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <Users size={16} />
                  </div>

                  <div>
                    <span>Team</span>
                    <strong>VEC Developers</strong>
                  </div>
                </div>

                <div className={styles.detailItem}>
                  <div className={styles.detailIcon}>
                    <ShieldCheck size={16} />
                  </div>

                  <div>
                    <span>Role</span>
                    <strong>Student Member</strong>
                  </div>
                </div>
              </div>

              {/* Team Badge */}
              <div className={styles.teamCard}>
                <div className={styles.teamIcon}>
                  <Users size={18} />
                </div>

                <div>
                  <strong>VEC Developers</strong>
                  <span>12 team members</span>
                </div>

                <div className={styles.teamArrow}>→</div>
              </div>

              {/* Actions */}
              <div className={styles.dropdownActions}>

                <button>
                  <User size={17} />
                  <span>View Profile</span>
                </button>

                <button>
                  <Settings size={17} />
                  <span>Settings</span>
                </button>

                <button className={styles.logout}>
                  <LogOut size={17} />
                  <span>Logout</span>
                </button>

              </div>

              <div className={styles.dropdownFooter}>
                <span>VEC CONNECT</span>
                <span>v1.0</span>
              </div>

            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;