import { Routes, Route } from "react-router-dom";

import LandingPage from "../pages/Landing/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register"
import AlumniJobFeed from "../pages/posts/PostDetails";
import CreatePost from "../pages/posts/uploadpost";


import AlumniApproval from "../pages/admin/AlumniApproval";
import PostApproval from "../pages/admin/PostApproval";


import AdminLayout from "../layouts/adminLayout";
import AlumniLayout from "../layouts/AlumniLayout";
import StudentLayout from "../layouts/StudentLayout";

import Members from "../pages/common/Members"
import Gallery from "../pages/common/Gallery"

import NotFound from "../components/common/NotFound";

// import FeedbackForm from "../pages/feedback/FeedbackForm"; 
function AppRoute() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/jobs" element={<AlumniJobFeed />} />
            <Route path="/createpost" element={<CreatePost />} />


            <Route path="/members" element={<Members />} />
            <Route path="/student" element={<StudentLayout />} >
                <Route path="gallery" element={<Gallery />}/>
            </Route>

            <Route path="/admin" element={<AdminLayout />}>
                <Route path="gallery" element={<Gallery />}/>
                <Route path="alumni-approval" element={<AlumniApproval />} />
                <Route path="post-approval" element={<PostApproval />} />
            </Route>
            <Route path="/alumni" element={<AlumniLayout/>}>
                <Route path="gallery" element={<Gallery />}/>
            </Route>
            {/* <Route path="/feedback" element={<FeedbackForm />} /> */}
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default AppRoute;