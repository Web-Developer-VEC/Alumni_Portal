import api from "./api";


// ===============================
// LOGIN
// ===============================

export const loginUser = async ({ username, password }) => {
    const response = await api.post("/auth/login", {
        usernameOrEmail: username,
        password: password,
    });

    return response.data;
};


// ===============================
// GOOGLE LOGIN
// ===============================

export const googleSignup = () => {
    window.location.href = "http://localhost:5000/api/auth/google";
};