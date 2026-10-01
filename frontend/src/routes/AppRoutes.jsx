import { Routes, Route } from "react-router-dom";

import LandingPage from "../pages/Landing/LandingPage";
import Login from "../pages/auth/Login";
import Register from "../pages/auth/Register"
import AlumniJobFeed from "../pages/posts/PostDetails";
import UploadPost from "../pages/posts/uploadpost";
import FeedbackForm from "../pages/feedback/FeedbackForm";


import AlumniApproval from "../pages/admin/AlumniApproval";
import PostApproval from "../pages/admin/PostApproval";

import AdminLayout from "../Layouts/AdminLayout";
import AlumniLayout from "../Layouts/AlumniLayout";
import StudentLayout from "../Layouts/StudentLayout";

import Members from "../pages/common/Members"
import Gallery from "../pages/common/Gallery"
import Events from "../components/common/events";

import NotFound from "../components/common/NotFound";
import Mentorship from "../pages/alumni/Mentorship";

// import FeedbackForm from "../pages/feedback/FeedbackForm"; 
function AppRoute() {
    return (
        <Routes>
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/feedback" element={<FeedbackForm />} /> 
      
      

            <Route path="/student" element={<StudentLayout />}>
                <Route index element={<AlumniJobFeed />} />
                <Route path="members" element={<Members />} />
                <Route path="gallery" element={<Gallery />}/>
                <Route path="events" element={<Events />} />
            </Route >

            <Route path="/admin" element={<AdminLayout />}>
                <Route index element={<AlumniJobFeed />} />
                <Route path="gallery" element={<Gallery />}/>
                <Route path="members" element={<Members />} />
                <Route path="alumni-approval" element={<AlumniApproval />} />
                <Route path="post-approval" element={<PostApproval />} />
                 <Route path="events" element={<Events />} />
            </Route>

            <Route path="/alumni" element={<AlumniLayout/>}>
                <Route index element={<AlumniJobFeed />} />
                <Route path="createpost" element={<UploadPost />} />
                <Route path="gallery" element={<Gallery />}/>
                <Route path="members" element={<Members />} />
                <Route path="events" element={<Events />} />
                <Route path="mentor" element={<Mentorship />} />
                
            </Route>
            
            <Route path="*" element={<NotFound />} />
        </Routes>
    );
}

export default AppRoute;