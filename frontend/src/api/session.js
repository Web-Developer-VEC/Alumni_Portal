const SESSION_KEYS = {
    token: "token",
    role: "role",
    user: "user",
};

export const setSession = ({ token, role, user }) => {
    if (token) {
        sessionStorage.setItem(SESSION_KEYS.token, token);
    }

    if (role) {
        sessionStorage.setItem(SESSION_KEYS.role, role);
    }

    if (user) {
        sessionStorage.setItem(
            SESSION_KEYS.user,
            JSON.stringify(user)
        );
    }
};

export const getToken = () => {
    return sessionStorage.getItem(SESSION_KEYS.token);
};

export const getRole = () => {
    return sessionStorage.getItem(SESSION_KEYS.role);
};

export const getUser = () => {
    const user = sessionStorage.getItem(SESSION_KEYS.user);

    if (!user) {
        return null;
    }

    try {
        return JSON.parse(user);
    } catch {
        return null;
    }
};

export const clearSession = () => {
    sessionStorage.removeItem(SESSION_KEYS.token);
    sessionStorage.removeItem(SESSION_KEYS.role);
    sessionStorage.removeItem(SESSION_KEYS.user);
};