import { Outlet } from "react-router-dom";

const StudentLayout = () => {
    return (
        <div>
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default StudentLayout;
