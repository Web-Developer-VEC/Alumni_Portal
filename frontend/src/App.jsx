import { Routes, Route } from "react-router-dom";
import AlumniJobFeed from "./pages/posts/PostDetails";

function App() {
    return (
        <Routes>
            <Route path="/" element={<h1>Alumni Portal</h1>} />
            <Route path="/jobs" element={<AlumniJobFeed />} />
        </Routes>
    );
}

export default App;