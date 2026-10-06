import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

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
import Profile from "../../assets/profile.jpg";
import styles from "./DashboardNavbar.module.css";

const Navbar = () => {
 

  const [profileOpen, setProfileOpen] = useState(false);
  const [searchFocused, setSearchFocused] = useState(false);
  const [uploadOpen, setUploadOpen] = useState(false);

  const profileRef = useRef(null);
  const uploadRef = useRef(null);

  const navigate = useNavigate();

  const getUser = () => {
    try {
      // 1. SESSION STORAGE
      const sessionUser = sessionStorage.getItem("user");

      if (sessionUser) {
        return JSON.parse(sessionUser);
      }

      // 2. LOCAL STORAGE
      const localUser = localStorage.getItem("user");

      if (localUser) {
        return JSON.parse(localUser);
      }

      return null;
    } catch (error) {
      console.error("Unable to read logged-in user:", error);
      return null;
    }
  };

  const user = getUser();

  const role = String(
    user?.role ||
      user?.userRole ||
      user?.user_role ||
      ""
  )
    .trim()
    .toUpperCase();


  const userName =
    user?.name ||
    user?.fullName ||
    user?.full_name ||
    user?.username ||
    user?.userName ||
    "User";

  const userEmail =
    user?.email ||
    user?.emailAddress ||
    user?.email_address ||
    "No email";

  const userDepartment =
    user?.department ||
    user?.departmentName ||
    user?.department_name ||
    user?.dept ||
    "Department";

  const userTeam =
    user?.team ||
    user?.teamName ||
    user?.team_name ||
    user?.batch ||
    user?.batchName ||
    "No team";

  const roleLabelMap = {
    ADMIN: "Admin",
    ALUMNI: "Alumni",
    STUDENT: "Student",
  };

  const roleLabel =
    roleLabelMap[role] || "User";


  const getBasePath = () => {
    switch (role) {
      case "ADMIN":
        return "/admin";

      case "ALUMNI":
        return "/alumni";

      case "STUDENT":
        return "/student";

      default:
        return "/";
    }
  };

  const basePath = getBasePath();


  const roleNavigation = {

    STUDENT: [
      {
        id: "home",
        label: "Home",
        icon: Home,
        path: "/student",
        type: "route",
      },

      {
        id: "alumni",
        label: "Alumni",
        icon: Users,
        path: "/student/members",
        type: "route",
      },

      {
        id: "events",
        label: "Events",
        icon: Calendar,
        path: "/student/events",
        type: "route",
      },

      {
        id: "gallery",
        label: "Gallery",
        icon: Images,
        path: "/student/gallery",
        type: "route",
      },

      {
        id: "messages",
        label: "Message",
        icon: MessageCircle,
        path: "/student/messages",
        type: "route",
      },

      {
        id: "notifications",
        label: "Notification",
        icon: Bell,
        path: "/student/notifications",
        type: "route",
      },
    ],

    ADMIN: [
      {
        id: "home",
        label: "Home",
        icon: Home,
        path: "/admin",
        type: "route",
      },

      {
        id: "alumni-approval",
        label: "Alumni Approval",
        icon: Users,
        path: "/admin/alumni-approval",
        type: "route",
      },

      {
        id: "members",
        label: "Members",
        icon: Users,
        path: "/admin/members",
        type: "route",
      },

      {
        id: "events",
        label: "Events",
        icon: Calendar,
        path: "/admin/events",
        type: "route",
      },

      {
        id: "gallery",
        label: "Gallery",
        icon: Images,
        path: "/admin/gallery",
        type: "route",
      },

      {
        id: "messages",
        label: "Message",
        icon: MessageCircle,
        path: "/admin/messages",
        type: "route",
      },

      {
        id: "notifications",
        label: "Notification",
        icon: Bell,
        path: "/admin/notifications",
        type: "route",
      },
    ],


    ALUMNI: [
      {
        id: "home",
        label: "Home",
        icon: Home,
        path: "/alumni",
        type: "route",
      },

      {
        id: "members",
        label: "Members",
        icon: Users,
        path: "/alumni/members",
        type: "route",
      },

      {
        id: "events",
        label: "Events",
        icon: Calendar,
        path: "/alumni/events",
        type: "route",
      },

      {
        id: "add-post",
        label: "Add Post",
        icon: Plus,
        path: "/alumni/createpost",
        type: "addPost",
      },

      {
        id: "gallery",
        label: "Gallery",
        icon: Images,
        path: "/alumni/gallery",
        type: "route",
      },

      {
        id: "messages",
        label: "Message",
        icon: MessageCircle,
        path: "/alumni/messages",
        type: "route",
      },

      {
        id: "notifications",
        label: "Notification",
        icon: Bell,
        path: "/alumni/notifications",
        type: "route",
      },
    ],
  };

  const visibleNavigationItems =
    roleNavigation[role] || [];


  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        profileRef.current &&
        !profileRef.current.contains(event.target)
      ) {
        setProfileOpen(false);
      }

      if (
        uploadRef.current &&
        !uploadRef.current.contains(event.target)
      ) {
        setUploadOpen(false);
      }
    };

    document.addEventListener(
      "mousedown",
      handleClickOutside
    );

    return () => {
      document.removeEventListener(
        "mousedown",
        handleClickOutside
      );
    };
  }, []);

  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleNavigation = (item) => {
    if (!item?.path) {
      return;
    }

    setProfileOpen(false);

    navigate(item.path);
  };

  const handleProfile = () => {
    setProfileOpen(false);

    if (basePath !== "/") {
      navigate(`${basePath}/profile`);
    }
  };


  const handleSettings = () => {
    setProfileOpen(false);

    if (basePath !== "/") {
      navigate(`${basePath}/settings`);
    }
  };

  const handleLogout = () => {
    try {
      // Session
      sessionStorage.removeItem("user");
      sessionStorage.removeItem("token");
      sessionStorage.removeItem("accessToken");

      // Local storage fallback
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("accessToken");

      setProfileOpen(false);

      navigate("/login", {
        replace: true,
      });
    } catch (error) {
      console.error("Logout error:", error);

      navigate("/login", {
        replace: true,
      });
    }
  };


  return (
    <>

      <header className={styles.navbar}>

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

            <span>
              Campus Community
            </span>
          </div>

        </div>

        <div
          className={`${styles.searchWrapper} ${
            searchFocused
              ? styles.searchFocused
              : ""
          }`}
        >

          <Search
            size={19}
            strokeWidth={2}
            className={styles.searchIcon}
          />

          <input
            type="text"
            placeholder="Search people, teams, posts..."
            onFocus={() =>
              setSearchFocused(true)
            }
            onBlur={() =>
              setSearchFocused(false)
            }
          />

        </div>

        <nav className={styles.desktopNavigation}>


          {visibleNavigationItems.map(
            (item) => {

              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`${styles.navItem} ${
                    item.id === "add-post"
                      ? styles.addPostItem
                      : ""
                  }`}
                  onClick={() =>
                    handleNavigation(item)
                  }
                >

                  {item.id === "add-post" ? (

                    <div
                      className={styles.addIcon}
                    >
                      <Plus
                        size={21}
                        strokeWidth={2.3}
                      />
                    </div>

                  ) : (

                    <Icon
                      size={20}
                      strokeWidth={1.9}
                    />

                  )}

                  <span>
                    {item.label}
                  </span>

                </button>
              );
            }
          )}

        </nav>

        <div
          className={styles.profileWrapper}
          ref={profileRef}
        >

          <button
            type="button"
            className={`${styles.profileButton} ${
              profileOpen
                ? styles.profileActive
                : ""
            }`}
            onClick={() => {
              setProfileOpen(
                !profileOpen
              );

              setUploadOpen(false);
            }}
          >

            <div className={styles.avatar}>

              <img
                src={Profile}
                alt="Profile"
              />

              <span
                className={
                  styles.onlineDot
                }
              />

            </div>

            <div
              className={
                styles.profileMiniInfo
              }
            >

              <strong>
                {userName}
              </strong>

              <span>
                {roleLabel}
              </span>

            </div>

            <ChevronDown
              size={16}
              className={`${styles.chevron} ${
                profileOpen
                  ? styles.chevronRotate
                  : ""
              }`}
            />

          </button>

          
          {profileOpen && (

            <div
              className={
                styles.profileDropdown
              }
            >

              {/* HEADER */}

              <div
                className={
                  styles.dropdownHeader
                }
              >

                <div
                  className={
                    styles.largeAvatar
                  }
                >

                  <img
                    src={Profile}
                    alt="Profile"
                  />

                  <span
                    className={
                      styles.largeOnlineDot
                    }
                  />

                </div>

                <div
                  className={
                    styles.dropdownUserInfo
                  }
                >

                  <h3>
                    {userName}
                  </h3>

                  <p>
                    {roleLabel} •{" "}
                    {userDepartment}
                  </p>

                </div>

                <button
                  type="button"
                  className={
                    styles.closeButton
                  }
                  onClick={() =>
                    setProfileOpen(false)
                  }
                >
                  <X size={17} />
                </button>

              </div>

              {/* PROFILE DETAILS */}

              <div
                className={
                  styles.profileDetails
                }
              >

                {/* EMAIL */}

                <div
                  className={
                    styles.detailItem
                  }
                >

                  <div
                    className={
                      styles.detailIcon
                    }
                  >
                    <Mail size={16} />
                  </div>

                  <div>

                    <span>
                      Email
                    </span>

                    <strong>
                      {userEmail}
                    </strong>

                  </div>

                </div>

                {/* TEAM */}

                <div
                  className={
                    styles.detailItem
                  }
                >

                  <div
                    className={
                      styles.detailIcon
                    }
                  >
                    <Users size={16} />
                  </div>

                  <div>

                    <span>
                      Team
                    </span>

                    <strong>
                      {userTeam}
                    </strong>

                  </div>

                </div>

                {/* ROLE */}

                <div
                  className={
                    styles.detailItem
                  }
                >

                  <div
                    className={
                      styles.detailIcon
                    }
                  >
                    <ShieldCheck
                      size={16}
                    />
                  </div>

                  <div>

                    <span>
                      Role
                    </span>

                    <strong>
                      {roleLabel} Member
                    </strong>

                  </div>

                </div>

              </div>

              {/* TEAM CARD */}

              <div
                className={
                  styles.teamCard
                }
              >

                <div
                  className={
                    styles.teamIcon
                  }
                >
                  <Users size={18} />
                </div>

                <div>

                  <strong>
                    {userTeam}
                  </strong>

                  <span>
                    12 team members
                  </span>

                </div>

                <span
                  className={
                    styles.teamArrow
                  }
                >
                  →
                </span>

              </div>

              {/* ACTIONS */}

              <div
                className={
                  styles.dropdownActions
                }
              >

                {/* VIEW PROFILE */}

                <button
                  type="button"
                  onClick={
                    handleProfile
                  }
                >

                  <User size={17} />

                  <span>
                    View Profile
                  </span>

                </button>

                {/* SETTINGS */}

                <button
                  type="button"
                  onClick={
                    handleSettings
                  }
                >

                  <Settings
                    size={17}
                  />

                  <span>
                    Settings
                  </span>

                </button>

                {/* LOGOUT */}

                <button
                  type="button"
                  className={
                    styles.logout
                  }
                  onClick={
                    handleLogout
                  }
                >

                  <LogOut size={17} />

                  <span>
                    Logout
                  </span>

                </button>

              </div>

              {/* FOOTER */}

              <div
                className={
                  styles.dropdownFooter
                }
              >

                <span>
                  VEC CONNECT
                </span>

                <span>
                  v1.0
                </span>

              </div>

            </div>
          )}

        </div>

      </header>

      {uploadOpen && (

        <div
          className={
            styles.uploadOverlay
          }
        >

          <div
            className={
              styles.uploadCard
            }
            ref={uploadRef}
          >

            {/* HEADER */}

            <div
              className={
                styles.uploadHeader
              }
            >

              <div>

                <span
                  className={
                    styles.uploadSmallTitle
                  }
                >
                  VEC CONNECT
                </span>

                <h2>
                  Create New Post
                </h2>

                <p>
                  Share an image or document
                  with your campus community.
                </p>

              </div>

              <button
                type="button"
                className={
                  styles.uploadClose
                }
                onClick={() =>
                  setUploadOpen(false)
                }
              >
                <X size={19} />
              </button>

            </div>

            {/* UPLOAD OPTIONS */}

            <div
              className={
                styles.uploadOptions
              }
            >

              {/* IMAGE */}

              <label
                className={
                  styles.uploadOption
                }
              >

                <input
                  type="file"
                  accept="image/*"
                  hidden
                />

                <div
                  className={
                    styles.uploadOptionIcon
                  }
                >
                  <ImageIcon
                    size={25}
                  />
                </div>

                <div>

                  <strong>
                    Upload Image
                  </strong>

                  <span>
                    JPG, PNG, WEBP
                  </span>

                </div>

                <UploadCloud
                  size={18}
                  className={
                    styles.uploadArrow
                  }
                />

              </label>

              {/* PDF */}

              <label
                className={
                  styles.uploadOption
                }
              >

                <input
                  type="file"
                  accept=".pdf,application/pdf"
                  hidden
                />

                <div
                  className={
                    styles.uploadOptionIcon
                  }
                >
                  <FileText
                    size={25}
                  />
                </div>

                <div>

                  <strong>
                    Upload PDF
                  </strong>

                  <span>
                    PDF documents
                  </span>

                </div>

                <UploadCloud
                  size={18}
                  className={
                    styles.uploadArrow
                  }
                />

              </label>

            </div>

            {/* FOOTER */}

            <div
              className={
                styles.uploadFooter
              }
            >

              <span>
                Maximum file size: 10 MB
              </span>

              <button
                type="button"
                className={
                  styles.cancelButton
                }
                onClick={() =>
                  setUploadOpen(false)
                }
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