import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/DashboardNavbar";
import Alumni from "../pages/common/Members"
import BottomNav from "../components/common/Footer1"
const AlumniLayout = () => {
  return (
    <>
      <Navbar />
      <main>
        <Outlet />
      </main>
      <BottomNav/>
    </>
  );
};

export default AlumniLayout;