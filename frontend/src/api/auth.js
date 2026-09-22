import api from "./api";


// ===============================
// LOGIN
// ===============================

export const loginUser = async ({ username, password }) => {
    const response = await api.post("/auth/login", {
        username,
        password,
    });

    return response.data;
};


// ===============================
// GOOGLE LOGIN
// ===============================

export const googleSignup = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
};