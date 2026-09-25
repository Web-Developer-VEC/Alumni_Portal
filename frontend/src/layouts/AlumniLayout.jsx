import { Outlet } from "react-router-dom";

const AlumniLayout = () => {
    return (
        <div>
            <main>
                <Outlet />
            </main>
        </div>
    );
};

export default AlumniLayout;
