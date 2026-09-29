import api from "./api";

/**
 * Fetch all alumni members with optional filters (search, department, batch, company, location, role)
 */
export const getAlumniMembers = async (params = {}) => {
    const response = await api.get("/alumni/details", { params });
    return response.data;
};

/**
 * Fetch single alumni by ID
 */
export const getAlumniMemberById = async (id) => {
    const response = await api.get("/alumni/id", { params: { id } });
    return response.data;
};

export default {
    getAlumniMembers,
    getAlumniMemberById,
};
