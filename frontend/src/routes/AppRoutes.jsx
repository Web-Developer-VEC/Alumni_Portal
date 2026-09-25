import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";

import AlumniJobFeed from "../pages/posts/PostDetails";

import AlumniApproval from "../pages/admin/AlumniApproval";
import PostApproval from "../pages/admin/PostApproval";

import AdminLayout from "../layouts/adminLayout";
import AlumniLayout from "../layouts/AlumniLayout";
import StudentLayout from "../layouts/StudentLayout";

import Members from "../pages/alumni/Members"

// import FeedbackForm from "../pages/feedback/FeedbackForm"; 
function AppRoute() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/jobs" element={<AlumniJobFeed />} />

            <Route path="members" element={<Members />} />
            <Route path="/student" element={<StudentLayout />} />
            <Route />

            <Route path="/admin" element={<AdminLayout />}>
                <Route path="alumni-approval" element={<AlumniApproval />} />
                <Route path="post-approval" element={<PostApproval />} />
            </Route>
            <Route path="/alumni" element={<AlumniLayout/>}>
            </Route>
            {/* <Route path="/feedback" element={<FeedbackForm />} /> */}
        </Routes>
    );
}

export default AppRoute;