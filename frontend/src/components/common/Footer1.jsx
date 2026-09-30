import React, { useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import {
  Home,
  UsersRound,
  MessageCircle,
  UserRound,
  Plus,
  ImagePlus,
  BriefcaseBusiness,
  FileText,
  X,
  Calendar,
  Images,
  Bell,
  ShieldCheck,
} from "lucide-react";

import styles from "./Footer1.module.css";

const BottomNav = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [uploadOpen, setUploadOpen] = React.useState(false);

  /* =========================================================
     GET CURRENT USER
  ========================================================= */

  const getUser = () => {
    try {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        return null;
      }

      return JSON.parse(storedUser);
    } catch (error) {
      console.error("Unable to read user:", error);
      return null;
    }
  };

  const user = getUser();

  const role = String(user?.role || "STUDENT").toUpperCase();

  /* =========================================================
     ROLE BASE PATH
  ========================================================= */

  const basePath = useMemo(() => {
    switch (role) {
      case "ADMIN":
        return "/admin";

      case "ALUMNI":
        return "/alumni";

      case "STUDENT":
      default:
        return "/student";
    }
  }, [role]);

  /* =========================================================
     ROLE BASED MOBILE NAVIGATION
  ========================================================= */

  const navigation = useMemo(() => {
    switch (role) {

      /* ================= STUDENT ================= */

      case "STUDENT":
        return {
          left: [
            {
              id: "home",
              label: "Home",
              icon: Home,
              path: "/student",
            },
            {
              id: "members",
              label: "Members",
              icon: UsersRound,
              path: "/student/members",
            },
          ],

          right: [
            {
              id: "messages",
              label: "Message",
              icon: MessageCircle,
              path: "/student/messages",
            },
            {
              id: "profile",
              label: "Profile",
              icon: UserRound,
              path: "/student/profile",
            },
          ],

          showCreate: false,
        };


      /* ================= ADMIN ================= */

      case "ADMIN":
        return {
          left: [
            {
              id: "home",
              label: "Home",
              icon: Home,
              path: "/admin",
            },
            {
              id: "approval",
              label: "Approval",
              icon: ShieldCheck,
              path: "/admin/alumni-approval",
            },
          ],

          right: [
            {
              id: "messages",
              label: "Message",
              icon: MessageCircle,
              path: "/admin/messages",
            },
            {
              id: "profile",
              label: "Profile",
              icon: UserRound,
              path: "/admin/profile",
            },
          ],

          showCreate: false,
        };


      /* ================= ALUMNI ================= */

      case "ALUMNI":
      default:
        return {
          left: [
            {
              id: "home",
              label: "Home",
              icon: Home,
              path: "/alumni",
            },
            {
              id: "members",
              label: "Members",
              icon: UsersRound,
              path: "/alumni/members",
            },
          ],

          right: [
            {
              id: "messages",
              label: "Message",
              icon: MessageCircle,
              path: "/alumni/messages",
            },
            {
              id: "profile",
              label: "Profile",
              icon: UserRound,
              path: "/alumni/profile",
            },
          ],

          showCreate: true,
        };
    }
  }, [role]);


  /* =========================================================
     CHECK ACTIVE ROUTE
  ========================================================= */

  const isActive = (path) => {
    if (path === basePath) {
      return location.pathname === basePath;
    }

    return location.pathname.startsWith(path);
  };


  /* =========================================================
     NAVIGATION
  ========================================================= */

  const handleNavigation = (path) => {
    setUploadOpen(false);
    navigate(path);
  };


  /* =========================================================
     CREATE POST
  ========================================================= */

  const handleCreatePost = () => {
    setUploadOpen(false);

    if (role === "ALUMNI") {
      navigate("/alumni/createpost");
    }
  };


  /* =========================================================
     UPLOAD OPTIONS
  ========================================================= */

  const handleUploadImage = () => {
    setUploadOpen(false);

    // If you have a separate gallery/upload route:
    navigate(`${basePath}/gallery`);
  };


  const handleShareJob = () => {
    setUploadOpen(false);

    // Example job route
    navigate(`${basePath}/jobs`);
  };


  return (
    <footer className={styles.footer}>

      {/* =================================================
          UPLOAD OPTIONS
      ================================================= */}

      {navigation.showCreate && (
        <div
          className={`${styles.uploadMenu} ${
            uploadOpen ? styles.uploadMenuOpen : ""
          }`}
        >

          {/* CREATE POST */}

          <button
            className={styles.uploadItem}
            onClick={handleCreatePost}
          >
            <span className={styles.uploadIcon}>
              <FileText size={17} />
            </span>

            <span>Create Post</span>
          </button>


          {/* UPLOAD IMAGE */}

          <button
            className={styles.uploadItem}
            onClick={handleUploadImage}
          >
            <span className={styles.uploadIcon}>
              <ImagePlus size={17} />
            </span>

            <span>Upload Image</span>
          </button>


          {/* SHARE OPPORTUNITY */}

          <button
            className={styles.uploadItem}
            onClick={handleShareJob}
          >
            <span className={styles.uploadIcon}>
              <BriefcaseBusiness size={17} />
            </span>

            <span>Share Opportunity</span>
          </button>

        </div>
      )}


      {/* =================================================
          MAIN NAVIGATION
      ================================================= */}

      <div className={styles.navigation}>

        {/* =================================================
            LEFT
        ================================================= */}

        <div className={styles.navGroup}>

          {navigation.left.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${
                  active ? styles.active : ""
                }`}
                onClick={() => handleNavigation(item.path)}
              >

                <span className={styles.iconWrapper}>

                  <Icon
                    size={21}
                    strokeWidth={active ? 2.3 : 1.8}
                  />

                  {active && (
                    <span className={styles.activeDot}></span>
                  )}

                </span>

                <span className={styles.label}>
                  {item.label}
                </span>

              </button>
            );
          })}

        </div>


        {/* =================================================
            CENTER PLUS
        ================================================= */}

        <div className={styles.centerAction}>

          {navigation.showCreate ? (
            <>
              <button
                className={`${styles.plusButton} ${
                  uploadOpen ? styles.plusOpen : ""
                }`}
                onClick={() => setUploadOpen((prev) => !prev)}
                aria-label="Create"
              >

                <span className={styles.plusInner}>

                  {uploadOpen ? (
                    <X
                      size={26}
                      strokeWidth={2}
                    />
                  ) : (
                    <Plus
                      size={27}
                      strokeWidth={2.3}
                    />
                  )}

                </span>

              </button>

              <span className={styles.plusLabel}>
                {uploadOpen ? "Close" : "Create"}
              </span>
            </>
          ) : (
            <div className={styles.emptyCenter}></div>
          )}

        </div>


        {/* =================================================
            RIGHT
        ================================================= */}

        <div className={styles.navGroup}>

          {navigation.right.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <button
                key={item.id}
                className={`${styles.navItem} ${
                  active ? styles.active : ""
                }`}
                onClick={() => handleNavigation(item.path)}
              >

                <span className={styles.iconWrapper}>

                  <Icon
                    size={21}
                    strokeWidth={active ? 2.3 : 1.8}
                  />

                  {active && (
                    <span className={styles.activeDot}></span>
                  )}

                </span>

                <span className={styles.label}>
                  {item.label}
                </span>

              </button>
            );
          })}

        </div>

      </div>

    </footer>
  );
};

export default BottomNav;