import { Routes, Route } from "react-router-dom";

import LandingPage from "../pages/Landing/LandingPage";
import Login from "../pages/auth/Login";
import AlumniJobFeed from "../pages/posts/PostDetails";

<<<<<<< Updated upstream
import AlumniApproval from "../pages/admin/AlumniApproval";

import AdminLayout from "../layouts/adminLayout";
import AlumniLayout from "../layouts/AlumniLayout";

import Members from "../pages/alumni/Members"

// import FeedbackForm from "../pages/feedback/FeedbackForm"; 
function AppRoute() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />
            <Route path="/" element={<LandingPage />} />
            <Route path="/jobs" element={<AlumniJobFeed />} />

            <Route path="/admin" element={<AdminLayout />}>
                <Route path="alumni-approval" element={<AlumniApproval />} />
            </Route>
            <Route path="/alumni" element={<AlumniLayout/>}>
                <Route path="members" element={<Members />} />
            </Route>
            {/* <Route path="/feedback" element={<FeedbackForm />} /> */}
        </Routes>
    );
=======
function AppRoute() {
  return (
    <Routes>
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/jobs" element={<AlumniJobFeed />} />
    </Routes>
  );
>>>>>>> Stashed changes
}

export default AppRoute;