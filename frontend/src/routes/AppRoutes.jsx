import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";

import AlumniJobFeed from "../pages/posts/PostDetails";

import AlumniApproval from "../pages/admin/AlumniApproval";

import AdminLayout from "../layouts/adminLayout";
import AlumniLayout from "../layouts/AlumniLayout";

import Members from "../pages/alumni/Members"

function AppRoute() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/jobs" element={<AlumniJobFeed />} />

            <Route path="/admin" element={<AdminLayout />}>
                <Route path="alumni-approval" element={<AlumniApproval />} />
            </Route>
            <Route path="/alumni" element={<AlumniLayout/>}>
                <Route path="members" element={<Members />} />
            </Route>
        </Routes>
    );
}

export default AppRoute;