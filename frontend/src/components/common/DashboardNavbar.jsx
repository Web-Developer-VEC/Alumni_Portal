import React, { useState, useRef, useEffect } from "react";
import {
  Search,
  ChevronDown,
  User,
  Users,
  Mail,
  Images,
  Bell,
  Calendar,
  ShieldCheck,
  Settings,
  LogOut,
  X,
  Home,
  MessageCircle,
  Plus,
  Image as ImageIcon,
  FileText,
  UploadCloud,
} from "lucide-react";

import VECLOGO from "../../assets/VEC_Logo.png";
import Profile from "../../assets/VEC_Logo.png";
import styles from "./DashboardNavbar.module.css";

const Navbar = () => {
  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const profileRef = useRef(null);
  const uploadRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setProfileOpen(false);
      }

      if (uploadRef.current && !uploadRef.current.contains(event.target)) {
        setUploadOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleAddPost = () => {
    setProfileOpen(false);
    setUploadOpen(true);
  };

  return (
    <>
      <header className={styles.navbar}>
        {/* ================= BRAND ================= */}
        <div className={styles.brandSection}>
          <div className={styles.logoBox}>
            <img
              src={VECLOGO}
              alt="Velammal Engineering College"
              className={styles.logo}
            />
          </div>

          <div className={styles.brandText}>
            <h2>VEC CONNECT</h2>
            <span>Campus Community</span>
          </div>
        </div>

        {/* ================= SEARCH ================= */}
        <div
          className={`${styles.searchWrapper} ${
            searchFocused ? styles.searchFocused : ""
          }`}
        >
          <Search size={19} strokeWidth={2} className={styles.searchIcon} />

          <input
            type="text"
            placeholder="Search people, teams, posts..."
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
          />
        </div>

        {/* ================= DESKTOP NAV ================= */}
        <nav className={styles.desktopNavigation}>
          <button className={styles.navItem}>
            <Home size={20} strokeWidth={1.9} />
            <span>Home</span>
          </button>
          <button className={styles.navItem}>
            <Users size={20} strokeWidth={1.9} />
            <span>Alumni</span>
          </button>
          <button className={styles.navItem}>
            <Calendar size={20} strokeWidth={1.9} />
            <span>Events</span>
          </button>
          <button
            className={`${styles.navItem} ${styles.addPostItem}`}
            onClick={handleAddPost}
          >
            <div className={styles.addIcon}>
              <Plus size={21} strokeWidth={2.3} />
            </div>

            <span>Add Post</span>
          </button>
            <button className={styles.navItem}>
            <Images size={20} strokeWidth={1.9} />
            <span>Gallery</span>
          </button>
          <button className={styles.navItem}>
            <MessageCircle size={20} strokeWidth={1.9} />
            <span>Message</span>
          </button>{" "}
          <button className={styles.navItem}>
            <Bell size={20} strokeWidth={1.9} />
            <span>Notification</span>
          </button>{" "}
        
        </nav>

        {/* ================= PROFILE ================= */}
        <div className={styles.profileWrapper} ref={profileRef}>
          <button
            className={`${styles.profileButton} ${
              profileOpen ? styles.profileActive : ""
            }`}
            onClick={() => {
              setProfileOpen(!profileOpen);
              setUploadOpen(false);
            }}
          >
            <div className={styles.avatar}>
              <img src={Profile} alt="Profile" />
              <span className={styles.onlineDot}></span>
            </div>

            <div className={styles.profileMiniInfo}>
              <strong>Barathram</strong>
              <span>Student</span>
            </div>

            <ChevronDown
              size={16}
              className={`${styles.chevron} ${
                profileOpen ? styles.chevronRotate : ""
              }`}
            />
          </button>

          {/* ================= PROFILE DROPDOWN ================= */}
          {profileOpen && (
            <div className={styles.profileDropdown}>
              <div className={styles.dropdownHeader}>
                <div className={styles.largeAvatar}>
                  <img src={Profile} alt="Profile" />
                  <span className={styles.largeOnlineDot}></span>
                </div>

                <div className={styles.dropdownUserInfo}>
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

              <div className={styles.teamCard}>
                <div className={styles.teamIcon}>
                  <Users size={18} />
                </div>

                <div>
                  <strong>VEC Developers</strong>
                  <span>12 team members</span>
                </div>

                <span className={styles.teamArrow}>→</span>
              </div>

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
      </header>

      {/* ================= UPLOAD MODAL ================= */}
      {uploadOpen && (
        <div className={styles.uploadOverlay}>
          <div className={styles.uploadCard} ref={uploadRef}>
            <div className={styles.uploadHeader}>
              <div>
                <span className={styles.uploadSmallTitle}>VEC CONNECT</span>

                <h2>Create New Post</h2>

                <p>Share an image or document with your campus community.</p>
              </div>

              <button
                className={styles.uploadClose}
                onClick={() => setUploadOpen(false)}
              >
                <X size={19} />
              </button>
            </div>

            <div className={styles.uploadOptions}>
              <label className={styles.uploadOption}>
                <input type="file" accept="image/*" hidden />

                <div className={styles.uploadOptionIcon}>
                  <ImageIcon size={25} />
                </div>

                <div>
                  <strong>Upload Image</strong>
                  <span>JPG, PNG, WEBP</span>
                </div>

                <UploadCloud size={18} className={styles.uploadArrow} />
              </label>

              <label className={styles.uploadOption}>
                <input type="file" accept=".pdf,application/pdf" hidden />

                <div className={styles.uploadOptionIcon}>
                  <FileText size={25} />
                </div>

                <div>
                  <strong>Upload PDF</strong>
                  <span>PDF documents</span>
                </div>

                <UploadCloud size={18} className={styles.uploadArrow} />
              </label>
            </div>

            <div className={styles.uploadFooter}>
              <span>Maximum file size: 10 MB</span>

              <button
                className={styles.cancelButton}
                onClick={() => setUploadOpen(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Navbar;
