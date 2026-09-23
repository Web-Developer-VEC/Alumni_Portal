import { Outlet } from "react-router-dom";
import styles from "./AdminLayout.module.css";

const AdminLayout = () => {
    return (
        <div className={styles["admin-layout"]}>
            <main className={styles["admin-content"]}>
                <Outlet />
            </main>
        </div>
    );
};

export default AdminLayout;