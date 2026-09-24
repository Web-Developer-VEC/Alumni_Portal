import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login"
import AlumniJobFeed from "../pages/posts/PostDetails";
function AppRoute() {
  return (
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/jobs" element={<AlumniJobFeed />} />
      </Routes>
  );
}

export default AppRoute;