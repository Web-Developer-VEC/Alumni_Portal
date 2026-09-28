import { Routes, Route } from "react-router-dom";

import LandingPage from "../pages/Landing/LandingPage";
import Login from "../pages/auth/Login";
import AlumniJobFeed from "../pages/posts/PostDetails";

function AppRoute() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/jobs" element={<AlumniJobFeed />} />
    </Routes>
  );
}

export default AppRoute;