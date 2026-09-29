import api from "./api";

/**
 * Fetch all pending alumni registrations for HOD approval
 * @param {string} status - Optional status filter: 'PENDING' | 'APPROVED' | 'REJECTED' | 'ALL'
 */
export const getPendingAlumni = async (status = "PENDING") => {
    const response = await api.get(`/hod/alumni/pending?status=${status}`);
    return response.data;
};

/**
 * Fetch a single alumni details by ID
 * @param {string} id - User ID or Profile ID
 */
export const getPendingAlumniById = async (id) => {
    const response = await api.get(`/hod/alumni/pending/${id}`);
    return response.data;
};

/**
 * Approve an alumni registration
 * @param {string} id - User ID or Profile ID
 */
export const approveAlumni = async (id) => {
    const response = await api.patch(`/hod/approve/${id}`);
    return response.data;
};

/**
 * Reject an alumni registration with reason
 * @param {string} id - User ID or Profile ID
 * @param {string} reason - Rejection explanation
 */
export const rejectAlumni = async (id, reason) => {
    const response = await api.patch(`/hod/reject/${id}`, { reason });
    return response.data;
};

export default {
    getPendingAlumni,
    getPendingAlumniById,
    approveAlumni,
    rejectAlumni,
};
