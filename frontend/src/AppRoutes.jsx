import { BrowserRouter, Routes, Route } from "react-router-dom";
import Login from "../src/pages/auth/Login"
function AppRoute() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoute;