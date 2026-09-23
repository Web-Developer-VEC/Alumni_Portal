import {
  useState,
  useEffect,
  Children,
  isValidElement,
} from "react";

import LandingPage from "./pages/Landing/LandingPage";
// Import these later when you create them:
// import LoginPage from "./pages/Login/LoginPage";
// import SignupPage from "./pages/Signup/SignupPage";
// import DashboardPage from "./pages/Dashboard/DashboardPage";


/* =========================================================
   SIMPLE CLIENT-SIDE ROUTER
   ========================================================= */

export function BrowserRouter({ children }) {
  const [currentPath, setCurrentPath] = useState(() => {
    if (typeof window !== "undefined") {
      return window.location.pathname || "/";
    }

    return "/";
  });

  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname || "/");
    };

    window.addEventListener("popstate", handlePopState);

    return () => {
      window.removeEventListener("popstate", handlePopState);
    };
  }, []);

  return typeof children === "function"
    ? children(currentPath)
    : children;
}


/* =========================================================
   ROUTES
   ========================================================= */

export function Routes({ children }) {
  const [currentPath, setCurrentPath] = useState(
    typeof window !== "undefined"
      ? window.location.pathname || "/"
      : "/"
  );

  useEffect(() => {
    const handleRouteChange = () => {
      setCurrentPath(window.location.pathname || "/");
    };

    window.addEventListener("popstate", handleRouteChange);

    return () => {
      window.removeEventListener("popstate", handleRouteChange);
    };
  }, []);

  const childrenArray = Children.toArray(children);

  const matchedRoute = childrenArray.find(
    (child) =>
      isValidElement(child) &&
      child.props.path === currentPath
  );

  if (matchedRoute) {
    return matchedRoute.props.element;
  }

  /* =======================================================
     DEFAULT FALLBACK
     If an unknown URL is entered, show Landing Page.
     ======================================================= */

  const rootRoute = childrenArray.find(
    (child) =>
      isValidElement(child) &&
      child.props.path === "/"
  );

  return rootRoute
    ? rootRoute.props.element
    : <LandingPage />;
}


/* =========================================================
   ROUTE
   ========================================================= */

export function Route({ element }) {
  return element;
}


/* =========================================================
   NAVIGATION HELPER
   ========================================================= */

export function navigate(path) {
  window.history.pushState({}, "", path);

  window.dispatchEvent(
    new PopStateEvent("popstate")
  );

  window.scrollTo({
    top: 0,
    behavior: "smooth",
  });
}


/* =========================================================
   APP
   ========================================================= */

export default function App() {
  return (
    <BrowserRouter>

      <Routes>

        {/* =================================================
            LANDING PAGE
            First page shown when opening the application.
            URL: /
        ================================================= */}

        <Route
          path="/"
          element={<LandingPage />}
        />


        {/* =================================================
            AUTHENTICATION
            Currently using LandingPage temporarily.

            Replace these with LoginPage and SignupPage
            when those pages are created.
        ================================================= */}

        <Route
          path="/login"
          element={<LandingPage />}
        />

        <Route
          path="/signup"
          element={<LandingPage />}
        />


        {/* =================================================
            DASHBOARD
            Replace with DashboardPage later.
        ================================================= */}

        <Route
          path="/dashboard"
          element={<LandingPage />}
        />

      </Routes>

    </BrowserRouter>
  );
}