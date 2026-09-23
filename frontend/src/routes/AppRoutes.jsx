import { Routes, Route } from "react-router-dom";
import Login from "../pages/auth/Login";
import AlumniJobFeed from "../pages/posts/PostDetails";
import AdminLayout from "../layouts/adminLayout";
import AlumniApproval from "../pages/admin/AlumniApproval";

function AppRoute() {
    return (
        <Routes>
            <Route path="/login" element={<Login />} />

            <Route path="/jobs" element={<AlumniJobFeed />} />

            <Route path="/admin" element={<AdminLayout />}>
                <Route path="alumni-approval" element={<AlumniApproval />} />
            </Route>
        </Routes>
    );
}

export default AppRoute;