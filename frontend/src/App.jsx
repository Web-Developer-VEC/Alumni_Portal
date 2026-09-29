import AppRoute from "./routes/AppRoutes";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

function App() {
    return (
        <>
            <AppRoute />
            <ToastContainer position="top-right" autoClose={3000} hideProgressBar={false} />
        </>
    );
}

export default App;