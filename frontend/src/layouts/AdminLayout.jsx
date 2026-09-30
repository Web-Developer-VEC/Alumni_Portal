import React from "react";
import { Outlet } from "react-router-dom";
import Navbar from "../components/common/DashboardNavbar";
import BottomNav from "../components/common/Footer1";
const AdminLayout = () => {
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

export default AdminLayout;